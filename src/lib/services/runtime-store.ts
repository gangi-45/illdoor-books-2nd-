import type { BookWithDetails } from '@/lib/services/books';
import type { OrderWithDetails } from '@/lib/services/orders';
import { FALLBACK_BOOKS } from '@/lib/services/books';
import { FALLBACK_PICKUP_POINT } from '@/lib/services/pickup';

// Global shared memory cache for live runtime sessions (works across server actions and pages)
declare global {
  // eslint-disable-next-line no-var
  var __MARKETPLACE_BOOKS__: BookWithDetails[] | undefined;
  // eslint-disable-next-line no-var
  var __MARKETPLACE_ORDERS__: OrderWithDetails[] | undefined;
}

export function getRuntimeBooks(): BookWithDetails[] {
  if (!globalThis.__MARKETPLACE_BOOKS__) {
    globalThis.__MARKETPLACE_BOOKS__ = [...FALLBACK_BOOKS];
  }
  return globalThis.__MARKETPLACE_BOOKS__;
}

export function addRuntimeBook(book: BookWithDetails): void {
  const books = getRuntimeBooks();
  // Prepend to top of listings
  globalThis.__MARKETPLACE_BOOKS__ = [book, ...books];
}

export function updateRuntimeBookStatus(bookId: string, status: 'available' | 'reserved' | 'sold'): void {
  const books = getRuntimeBooks();
  const book = books.find((b) => b.id === bookId);
  if (book) {
    book.listing_status = status;
    book.updated_at = new Date().toISOString();
  }
}

export function getRuntimeOrders(): OrderWithDetails[] {
  if (!globalThis.__MARKETPLACE_ORDERS__) {
    globalThis.__MARKETPLACE_ORDERS__ = [];
  }
  return globalThis.__MARKETPLACE_ORDERS__;
}

export function addRuntimeOrder(order: OrderWithDetails): void {
  const orders = getRuntimeOrders();
  globalThis.__MARKETPLACE_ORDERS__ = [order, ...orders];
}

export function updateRuntimeOrderStatus(
  orderId: string,
  updates: Partial<OrderWithDetails>
): OrderWithDetails | null {
  const orders = getRuntimeOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    Object.assign(order, updates, { updated_at: new Date().toISOString() });
    return order;
  }
  return null;
}
