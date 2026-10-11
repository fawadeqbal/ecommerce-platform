/** Central TanStack Query keys so every app invalidates the same caches. */
export const queryKeys = {
  me: ['me'] as const,
  cart: ['cart'] as const,
  savedItems: ['cart', 'saved'] as const,
  addresses: ['addresses'] as const,
  checkoutQuote: (cartSignature: string) => ['checkout', 'quote', cartSignature] as const,
  payments: {
    all: ['payments'] as const,
    status: (paymentId: string) => ['payments', 'status', paymentId] as const,
    mock: (paymentId: string) => ['payments', 'mock', paymentId] as const,
  },
  orders: {
    all: ['orders'] as const,
    mine: (params: object) => ['orders', 'mine', params] as const,
    detail: (orderNumber: string) => ['orders', 'detail', orderNumber] as const,
    vendorList: (params: object) => ['orders', 'vendor-list', params] as const,
    vendorDetail: (id: string) => ['orders', 'vendor-detail', id] as const,
    adminList: (params: object) => ['orders', 'admin-list', params] as const,
    adminDetail: (id: string) => ['orders', 'admin-detail', id] as const,
  },
  storefront: {
    products: (params: object) => ['storefront', 'products', params] as const,
    product: (slug: string) => ['storefront', 'product', slug] as const,
  },
  categories: {
    all: ['categories'] as const,
    adminList: ['categories', 'admin-list'] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
    tree: ['categories', 'tree'] as const,
  },
  brands: {
    all: ['brands'] as const,
    adminList: ['brands', 'admin-list'] as const,
    detail: (id: string) => ['brands', 'detail', id] as const,
    list: ['brands', 'public'] as const,
  },
  products: {
    all: ['products'] as const,
    vendorList: (params: object) => ['products', 'vendor-list', params] as const,
    vendorDetail: (id: string) => ['products', 'vendor-detail', id] as const,
    adminList: (params: object) => ['products', 'admin-list', params] as const,
    adminDetail: (id: string) => ['products', 'admin-detail', id] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    warehouses: ['inventory', 'warehouses'] as const,
    stock: (params: object) => ['inventory', 'stock', params] as const,
    movements: (params: object) => ['inventory', 'movements', params] as const,
    lowStock: (params: object) => ['inventory', 'low-stock', params] as const,
  },
  vendors: {
    all: ['vendors'] as const,
    me: ['vendors', 'me'] as const,
    adminList: (params: { status?: string; search?: string; page?: number }) =>
      [
        'vendors',
        'admin-list',
        params.status ?? 'all',
        params.search ?? '',
        params.page ?? 1,
      ] as const,
    detail: (id: string) => ['vendors', 'detail', id] as const,
  },
  media: {
    all: ['media'] as const,
    list: (folder?: string, page = 1) => ['media', 'list', folder ?? 'all', page] as const,
  },
  attributes: {
    all: ['attributes'] as const,
    adminList: ['attributes', 'admin-list'] as const,
    detail: (id: string) => ['attributes', 'detail', id] as const,
    filters: ['attributes', 'filters'] as const,
    allPublic: ['attributes', 'all-public'] as const,
  },
};
