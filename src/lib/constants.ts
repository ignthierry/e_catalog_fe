export const APP_CONFIG = {
  name: "OMEGA TOYS",
  description: "Katalog Mainan Edukasi & Koleksi Terbaik",
  currency: "Rp",
  // Default WhatsApp number for development/fallback
  defaultWhatsApp: "6281234567890",
  contactEmail: "hello@omegatoys.com",
  // Store bank accounts for Transfer method
  bankAccounts: [
    { bank: 'BCA', number: '8735-0928-11', holder: 'PT OMEGA TOYS INDONESIA' },
    { bank: 'Mandiri', number: '137-00-1982736-4', holder: 'PT OMEGA TOYS INDONESIA' },
    { bank: 'BRI', number: '0341-01-002938-50-3', holder: 'PT OMEGA TOYS INDONESIA' },
  ],
  // QRIS Image default (will fallback or load from store)
  qrisImage: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&q=80',
};

export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  CART: "/cart",
  CHECKOUT: "/checkout",
  MY_ORDERS: "/my-orders",
  ORDERS: "/orders",
  ADMIN: {
    LOGIN: "/admin/login",
    DASHBOARD: "/admin",
    PRODUCTS: "/admin/products",
    ORDERS: "/admin/orders",
    CATEGORIES: "/admin/categories",
    BANNERS: "/admin/banners",
    SETTINGS: "/admin/settings",
    ACTIVITY_LOGS: "/admin/activity-logs",
  },
};
