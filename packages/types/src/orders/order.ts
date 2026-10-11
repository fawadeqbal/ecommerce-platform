import type { OrderStatus, PaymentMethod, PaymentStatus } from '../enums';
import type { CartItemDto } from '../cart/cart';
import type { ShippingAddress } from '../users/address';
import type { PaymentAttemptDto, PaymentOptionDto, PaymentSessionDto } from '../payments/payment';

export type BadgeTone = 'gray' | 'green' | 'yellow' | 'red' | 'blue';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Awaiting payment',
  PAID: 'Paid',
  COD_CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return requested',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
};

export const ORDER_STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  PENDING_PAYMENT: 'yellow',
  PAID: 'blue',
  COD_CONFIRMED: 'blue',
  PROCESSING: 'blue',
  PACKED: 'blue',
  SHIPPED: 'yellow',
  OUT_FOR_DELIVERY: 'yellow',
  DELIVERED: 'green',
  CANCELLED: 'gray',
  RETURN_REQUESTED: 'red',
  RETURNED: 'gray',
  REFUNDED: 'gray',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: 'Card',
  WALLET: 'Wallet',
  BANK_TRANSFER: 'Bank transfer',
  COD: 'Cash on delivery',
  GIFT_CARD: 'Gift card',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  AUTHORIZED: 'Authorized',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially refunded',
  CANCELLED: 'Cancelled',
};

/** What a vendor can move its sub-order to from each status. */
export const VENDOR_ORDER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PAID: ['PROCESSING', 'CANCELLED'],
  COD_CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['OUT_FOR_DELIVERY', 'DELIVERED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
};

/** Sub-order statuses from which the customer / admin may still cancel (nothing has shipped). */
export const CANCELLABLE_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'COD_CONFIRMED',
  'PROCESSING',
  'PACKED',
];

/** Customer-facing progress steps. */
export const ORDER_PROGRESS: OrderStatus[] = [
  'COD_CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
];

export const ORDER_REASON_MIN = 5;

// ---------------------------------------------------------------- checkout

export interface CheckoutGroup {
  vendor: { id: string; name: string; slug: string };
  items: CartItemDto[];
  subtotal: number;
  shipping: number;
}

export interface CheckoutQuoteDto {
  currency: string;
  groups: CheckoutGroup[];
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  taxTotal: number;
  /** COD fee applied to this quote (0 unless the selected method is COD). */
  codFee: number;
  grandTotal: number;
  /** Methods the customer can choose right now. */
  paymentMethods: PaymentMethod[];
  /** Every method with availability + reason, for the payment picker. */
  paymentOptions: PaymentOptionDto[];
  /** The method these totals were calculated for. */
  selectedPaymentMethod: PaymentMethod | null;
  canPlace: boolean;
  problems: string[];
  /** Spend this much more per vendor for free shipping (0 = disabled). */
  freeShippingAbove: number;
}

export interface PlaceOrderInput {
  /** Required for guests. */
  email?: string;
  /** A saved address (signed-in) … */
  addressId?: string;
  /** … or a new one. */
  address?: ShippingAddress;
  saveAddress?: boolean;
  paymentMethod: PaymentMethod;
  customerNote?: string | null;
  /** Random id per checkout attempt — a double click never creates two orders. */
  idempotencyKey: string;
}

/** Result of placing an order. Online methods also return the gateway page to send the customer to. */
export interface PlaceOrderResultDto {
  order: OrderDto;
  payment: PaymentSessionDto | null;
}

// ---------------------------------------------------------------- orders

export interface OrderItemDto {
  id: string;
  productName: string;
  productSlug: string;
  variantName: string | null;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ShipmentDto {
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface OrderHistoryEntry {
  status: OrderStatus;
  note: string | null;
  vendorName: string | null;
  createdAt: string;
}

export interface VendorOrderDto {
  id: string;
  vendor: { id: string; name: string; slug: string };
  status: OrderStatus;
  subtotal: number;
  shippingTotal: number;
  items: OrderItemDto[];
  shipment: ShipmentDto | null;
}

/** Full order (customer, guest tracking, admin). */
export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  email: string;
  currency: string;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  shippingAddress: ShippingAddress;
  customerNote: string | null;
  placedAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  canCancel: boolean;
  /** Online order still waiting for payment (and not expired): show "Pay now". */
  canPay: boolean;
  /** Unpaid online orders are cancelled after this moment. */
  paymentExpiresAt: string | null;
  payments: PaymentAttemptDto[];
  vendorOrders: VendorOrderDto[];
  history: OrderHistoryEntry[];
}

export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  grandTotal: number;
  currency: string;
  itemCount: number;
  imageUrl: string | null;
  vendorCount: number;
  placedAt: string;
}

export interface AdminOrderListItem extends OrderSummaryDto {
  email: string;
  customerName: string;
  city: string;
}

/** Vendor sub-order list row. */
export interface VendorOrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  itemCount: number;
  subtotal: number;
  netAmount: number;
  currency: string;
  customerName: string;
  city: string;
  paymentMethod: PaymentMethod;
  placedAt: string;
}

/** Vendor sub-order detail. */
export interface VendorOrderDetailDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  items: OrderItemDto[];
  subtotal: number;
  shippingTotal: number;
  commissionAmount: number;
  netAmount: number;
  customer: { name: string; email: string; phone: string };
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerNote: string | null;
  placedAt: string;
  shipment: ShipmentDto | null;
  history: OrderHistoryEntry[];
  nextStatuses: OrderStatus[];
}

export interface OrderListQuery {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface VendorOrderStatusInput {
  status: OrderStatus;
  /** Required when marking SHIPPED. */
  trackingNumber?: string;
  /** Required when cancelling. */
  note?: string;
}

export interface CancelOrderInput {
  reason: string;
}

export interface TrackOrderInput {
  orderNumber: string;
  email: string;
}
