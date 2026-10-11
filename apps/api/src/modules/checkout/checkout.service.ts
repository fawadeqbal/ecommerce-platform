import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@ecommerce/database';
import {
  EmailTemplateKey,
  PAYMENT_METHOD_LABELS,
  fromCents,
  toCents,
  type CheckoutGroup,
  type CheckoutQuoteDto,
  type OrderDto,
  type PaymentMethod,
  type ShippingAddress,
} from '@ecommerce/types';
import { formatMoney } from '../../common/utils/money';
import { readSetting } from '../../common/utils/settings';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CartService, type CartContext } from '../cart/cart.service';
import { NotificationsService } from '../notifications/notifications.service';
import { orderInclude, toOrderDto, type OrderFull } from '../orders/order.mapper';
import { commissionFor, generateOrderNumber, shippingFor } from '../orders/order-rules';
import { reserveStock } from '../orders/order-stock';
import type { PlaceOrderDto } from './dto/checkout.dto';

/**
 * Checkout: quote (totals) and place order.
 * One Order → one VendorOrder per vendor → OrderItems (price snapshots). Stock is reserved in the same
 * transaction; the cart is emptied; confirmation emails go to the customer and each vendor.
 * TODO: coupons/gift cards/loyalty (Promotions step), tax rates (Settings), online payments (Payments step).
 */
@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  async quote(ctx: CartContext): Promise<CheckoutQuoteDto> {
    const cart = await this.cart.getCart(ctx);
    const [flatRate, freeAbove, codFee, codMax] = await Promise.all([
      readSetting(this.prisma, 'shipping.flatRatePerVendor', 5),
      readSetting(this.prisma, 'shipping.freeShippingAbove', 50),
      readSetting(this.prisma, 'checkout.codFee', 0),
      readSetting(this.prisma, 'checkout.codMaxOrderTotal', 5000),
    ]);

    const groups: CheckoutGroup[] = cart.groups.map((g) => ({
      vendor: g.vendor,
      items: g.items,
      subtotal: g.subtotal,
      shipping: shippingFor(g.subtotal, flatRate, freeAbove),
    }));
    const subtotal = cart.subtotal;
    const shippingTotal = fromCents(groups.reduce((sum, g) => sum + toCents(g.shipping), 0));
    const beforeFees = fromCents(toCents(subtotal) + toCents(shippingTotal));
    const grandTotal = fromCents(toCents(beforeFees) + toCents(codFee));

    const problems: string[] = [];
    if (cart.itemCount === 0) problems.push('Your cart is empty');
    if (!cart.canCheckout && cart.itemCount > 0)
      problems.push('Some items are unavailable or low on stock. Update your cart.');
    const codAllowed = codMax <= 0 || grandTotal <= codMax;
    if (!codAllowed)
      problems.push(
        `Cash on delivery is available for orders up to ${formatMoney(codMax, cart.currency)}`,
      );
    const paymentMethods: PaymentMethod[] = codAllowed ? ['COD'] : [];

    return {
      currency: cart.currency,
      groups,
      subtotal,
      shippingTotal,
      discountTotal: 0,
      taxTotal: 0,
      codFee,
      grandTotal,
      paymentMethods,
      canPlace: problems.length === 0,
      problems,
      freeShippingAbove: freeAbove,
    };
  }

  async place(ctx: CartContext, dto: PlaceOrderDto): Promise<OrderDto> {
    // Same idempotency key = same order (double click / retry after a network error).
    const existing = await this.prisma.order.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
      include: orderInclude,
    });
    if (existing && (existing.userId === (ctx.userId ?? null) || existing.email === dto.email))
      return toOrderDto(existing);

    const user = ctx.userId
      ? await this.prisma.user.findUnique({
          where: { id: ctx.userId },
          select: { id: true, email: true, firstName: true },
        })
      : null;
    if (!user) {
      const guestAllowed = await readSetting(this.prisma, 'checkout.guestCheckout', true);
      if (!guestAllowed) throw new BadRequestException('Please sign in to check out');
      if (!dto.email) throw new BadRequestException('Email is required for guest checkout');
    }
    const email = user?.email ?? dto.email!;
    const address = await this.resolveAddress(user?.id, dto);

    const quote = await this.quote(ctx);
    if (!quote.canPlace) throw new BadRequestException(quote.problems.join(' '));
    if (!quote.paymentMethods.includes(dto.paymentMethod))
      throw new BadRequestException('This payment method is not available');

    const cartRow = await this.prisma.cart.findFirst({
      where: ctx.userId ? { userId: ctx.userId } : { sessionId: ctx.sessionId ?? '__none__' },
      include: {
        items: { include: { variant: { include: { product: { include: { vendor: true } } } } } },
      },
    });
    if (!cartRow || cartRow.items.length === 0) throw new BadRequestException('Your cart is empty');

    const defaultRate = await readSetting(this.prisma, 'marketplace.defaultCommissionRate', 10);
    const order = await this.createOrder({
      cartRow,
      quote,
      dto,
      email,
      userId: user?.id ?? null,
      address,
      defaultRate,
    });

    await this.audit.log({
      actorId: user?.id,
      action: 'order.place',
      entityType: 'Order',
      entityId: order.id,
      after: { orderNumber: order.orderNumber, grandTotal: quote.grandTotal },
    });
    await this.sendEmails(order, user?.firstName ?? address.fullName.split(' ')[0]);
    return toOrderDto(order);
  }

  // ---------------------------------------------------------------- internals

  private async resolveAddress(
    userId: string | undefined,
    dto: PlaceOrderDto,
  ): Promise<ShippingAddress> {
    if (dto.addressId) {
      if (!userId) throw new BadRequestException('Sign in to use a saved address');
      const saved = await this.prisma.address.findFirst({ where: { id: dto.addressId, userId } });
      if (!saved) throw new NotFoundException('Address not found');
      return {
        fullName: saved.fullName,
        phone: saved.phone,
        line1: saved.line1,
        line2: saved.line2,
        city: saved.city,
        state: saved.state,
        postalCode: saved.postalCode,
        countryCode: saved.countryCode,
      };
    }
    if (!dto.address) throw new BadRequestException('A shipping address is required');
    if (userId && dto.saveAddress) {
      const count = await this.prisma.address.count({ where: { userId } });
      await this.prisma.address.create({
        data: { ...dto.address, userId, isDefault: count === 0 },
      });
    }
    return { ...dto.address };
  }

  private async createOrder(args: {
    cartRow: Prisma.CartGetPayload<{
      include: {
        items: { include: { variant: { include: { product: { include: { vendor: true } } } } } };
      };
    }>;
    quote: CheckoutQuoteDto;
    dto: PlaceOrderDto;
    email: string;
    userId: string | null;
    address: ShippingAddress;
    defaultRate: number;
  }): Promise<OrderFull> {
    const { cartRow, quote, dto, email, userId, address, defaultRate } = args;
    const initialStatus = 'COD_CONFIRMED' as const;

    for (let attempt = 0; attempt < 3; attempt++) {
      const orderNumber = generateOrderNumber();
      try {
        const orderId = await this.prisma.$transaction(
          async (tx) => {
            const order = await tx.order.create({
              data: {
                orderNumber,
                userId,
                email,
                status: initialStatus,
                currency: quote.currency,
                subtotal: quote.subtotal,
                shippingTotal: quote.shippingTotal,
                discountTotal: 0,
                taxTotal: 0,
                grandTotal: quote.grandTotal,
                shippingAddress: address as unknown as Prisma.InputJsonValue,
                paymentMethod: dto.paymentMethod,
                paymentStatus: 'PENDING',
                customerNote: dto.customerNote ?? null,
                idempotencyKey: dto.idempotencyKey,
              },
            });

            await reserveStock(
              tx,
              order.id,
              cartRow.items.map((i) => ({
                variantId: i.variantId,
                quantity: i.quantity,
                label: `${i.variant.product.name}${i.variant.name ? ` (${i.variant.name})` : ''}`,
              })),
            );

            for (const group of quote.groups) {
              const vendor = cartRow.items.find(
                (i) => i.variant.product.vendorId === group.vendor.id,
              )!.variant.product.vendor;
              const rate =
                vendor.commissionRate === null ? defaultRate : Number(vendor.commissionRate);
              const commission = commissionFor(group.subtotal, rate);
              const vendorOrder = await tx.vendorOrder.create({
                data: {
                  orderId: order.id,
                  vendorId: group.vendor.id,
                  status: initialStatus,
                  subtotal: group.subtotal,
                  shippingTotal: group.shipping,
                  commissionAmount: commission,
                  netAmount: fromCents(
                    toCents(group.subtotal) + toCents(group.shipping) - toCents(commission),
                  ),
                },
              });
              await tx.orderItem.createMany({
                data: cartRow.items
                  .filter((i) => i.variant.product.vendorId === group.vendor.id)
                  .map((i) => ({
                    orderId: order.id,
                    vendorOrderId: vendorOrder.id,
                    variantId: i.variantId,
                    productName: i.variant.product.name,
                    variantName: i.variant.name,
                    sku: i.variant.sku,
                    quantity: i.quantity,
                    unitPrice: i.variant.price,
                    total: fromCents(toCents(Number(i.variant.price)) * i.quantity),
                  })),
              });
              await tx.orderStatusHistory.create({
                data: {
                  orderId: order.id,
                  vendorOrderId: vendorOrder.id,
                  toStatus: initialStatus,
                  note: 'Order placed',
                },
              });
            }

            await tx.orderStatusHistory.create({
              data: { orderId: order.id, toStatus: initialStatus, note: 'Order placed' },
            });
            await tx.payment.create({
              data: {
                orderId: order.id,
                method: dto.paymentMethod,
                provider: 'cod',
                status: 'PENDING',
                amount: quote.grandTotal,
                currency: quote.currency,
              },
            });
            await tx.cartItem.deleteMany({ where: { cartId: cartRow.id } });
            return order.id;
          },
          { timeout: 20_000 },
        );
        return this.prisma.order.findUniqueOrThrow({
          where: { id: orderId },
          include: orderInclude,
        });
      } catch (error) {
        const code = (error as { code?: string }).code;
        const target = String((error as { meta?: { target?: unknown } }).meta?.target ?? '');
        if (code === 'P2002' && target.includes('orderNumber')) continue; // rare collision → new number
        throw error;
      }
    }
    throw new BadRequestException('Could not create the order, please try again');
  }

  private async sendEmails(order: OrderFull, firstName: string) {
    const site = this.config.get<string>('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    const vendorApp = this.config.get<string>('NEXT_PUBLIC_VENDOR_URL', 'http://localhost:3002');
    const money = (v: Prisma.Decimal | number) => formatMoney(Number(v), order.currency);
    try {
      await this.notifications.sendEmail({
        template: EmailTemplateKey.ORDER_CONFIRMATION,
        to: order.email,
        userId: order.userId ?? undefined,
        data: {
          firstName,
          orderNumber: order.orderNumber,
          items: order.vendorOrders.flatMap((v) =>
            v.items.map((i) => ({
              name: `${i.productName}${i.variantName ? ` (${i.variantName})` : ''}`,
              quantity: i.quantity,
              total: money(i.total),
            })),
          ),
          subtotal: money(order.subtotal),
          shipping: money(order.shippingTotal),
          tax: money(order.taxTotal),
          grandTotal: money(order.grandTotal),
          paymentMethod: PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod],
          orderUrl: order.userId
            ? `${site}/account/orders/${order.orderNumber}`
            : `${site}/track-order`,
        },
      });
      for (const vo of order.vendorOrders) {
        const vendor = await this.prisma.vendor.findUnique({
          where: { id: vo.vendor.id },
          select: { email: true, ownerId: true },
        });
        if (!vendor) continue;
        await this.notifications.sendEmail({
          template: EmailTemplateKey.VENDOR_NEW_ORDER,
          to: vendor.email,
          userId: vendor.ownerId,
          data: {
            orderNumber: order.orderNumber,
            heading: `New order ${order.orderNumber}`,
            body: `${vo.items.reduce((n, i) => n + i.quantity, 0)} item(s) worth ${money(vo.subtotal)} to prepare. Payment: ${PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod]}.`,
            ctaLabel: 'Open order',
            ctaUrl: `${vendorApp}/orders/${vo.id}`,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Order emails failed for ${order.orderNumber}: ${String(error)}`);
    }
  }
}
