"""
Read-only lookups in the store database (the NestJS API's Postgres, tables from Prisma).
Every connection is opened read-only with a statement timeout; queries are fixed and
always scoped to the customer, so the model can never read other customers' data.
"""
import re

import psycopg
from psycopg.rows import dict_row

from app.core import config


def _connect():
    url = re.sub(r"([?&])schema=[^&]*&?", r"\1", config.STORE_DATABASE_URL).rstrip("?&")   # Prisma-only param
    return psycopg.connect(url, autocommit=True, row_factory=dict_row, connect_timeout=5,
                           options="-c default_transaction_read_only=on -c statement_timeout=5000")


def _order_details(conn, order):
    order["items"] = conn.execute(
        'SELECT "productName" AS product, "variantName" AS variant, quantity, total '
        'FROM "OrderItem" WHERE "orderId" = %s ORDER BY id', (order["id"],)).fetchall()
    order["shipments"] = conn.execute(
        'SELECT vo.status AS seller_status, vo."shippingMethod" AS shipping_method, s.status AS shipment_status, '
        's."trackingNumber" AS tracking_number, c.name AS courier, s."shippedAt" AS shipped_at, '
        's."deliveredAt" AS delivered_at '
        'FROM "VendorOrder" vo LEFT JOIN "Shipment" s ON s."vendorOrderId" = vo.id '
        'LEFT JOIN "Courier" c ON c.id = s."courierId" WHERE vo."orderId" = %s', (order["id"],)).fetchall()
    order["url"] = f"{config.STORE_URL}/account/orders/{order['order_number']}"
    del order["id"]
    return order


_ORDER = ('SELECT o.id, o."orderNumber" AS order_number, o.status, o."paymentStatus" AS payment_status, '
          'o."paymentMethod" AS payment_method, o."grandTotal" AS total, o.currency, o."placedAt" AS placed_at, '
          'o."shippingAddress"->>\'city\' AS city, o."cancelReason" AS cancel_reason FROM "Order" o ')


class StoreRepository:
    def order(self, order_number, customer_id=None, email=None):
        """One order of this customer (by account), or of this guest (order number + checkout email)."""
        with _connect() as conn:
            if customer_id:
                row = conn.execute(_ORDER + 'WHERE o."orderNumber" = %s AND o."userId" = %s',
                                   (order_number, customer_id)).fetchone()
            else:
                row = conn.execute(_ORDER + 'WHERE o."orderNumber" = %s AND lower(o.email) = lower(%s)',
                                   (order_number, email)).fetchone()
            return _order_details(conn, row) if row else None

    def recent_orders(self, customer_id, limit=5):
        with _connect() as conn:
            return conn.execute(
                'SELECT "orderNumber" AS order_number, status, "grandTotal" AS total, currency, "placedAt" AS placed_at '
                'FROM "Order" WHERE "userId" = %s ORDER BY "placedAt" DESC LIMIT %s', (customer_id, limit)).fetchall()

    def search_products(self, query, limit=5):
        words = [w for w in re.findall(r"\w+", query)[:4] if len(w) > 1]
        if not words:
            return []
        where = " AND ".join(['(p.name ILIKE %s OR p."shortDescription" ILIKE %s)'] * len(words))
        params = [v for w in words for v in (f"%{w}%", f"%{w}%")]
        with _connect() as conn:
            rows = conn.execute(
                'SELECT p.name, p.slug, p.currency, p."ratingAverage" AS rating, '
                'COALESCE((SELECT MIN(v.price) FROM "ProductVariant" v WHERE v."productId" = p.id AND v."isActive"), '
                'p."basePrice") AS price, '
                'COALESCE((SELECT SUM(sl.quantity - sl.reserved) FROM "ProductVariant" v '
                'JOIN "StockLevel" sl ON sl."variantId" = v.id JOIN "Warehouse" wh ON wh.id = sl."warehouseId" '
                'WHERE v."productId" = p.id AND v."isActive" AND wh."isActive"), 0) AS available '
                f'FROM "Product" p WHERE p.status = \'PUBLISHED\' AND p."deletedAt" IS NULL AND {where} '
                'ORDER BY p."soldCount" DESC LIMIT %s', (*params, limit)).fetchall()
        for r in rows:
            r["in_stock"] = (r.pop("available") or 0) > 0
            r["url"] = f"{config.STORE_URL}/products/{r.pop('slug')}"
        return rows
