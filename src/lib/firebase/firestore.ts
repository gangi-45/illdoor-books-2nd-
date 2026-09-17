import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './client';
import type { Book, Profile, Order, Notification } from '@/types/database';

export interface FirestoreBook extends Omit<Book, 'created_at' | 'updated_at'> {
  created_at: string;
  updated_at: string;
  image_urls?: string[];
  seller?: {
    id: string;
    full_name: string;
    student_id: string;
    verification_status: string;
  };
}

/**
 * Save or update student profile in Firestore
 */
export async function saveProfileToFirestore(profile: Profile): Promise<void> {
  try {
    const profileRef = doc(db, 'profiles', profile.id);
    await setDoc(profileRef, {
      ...profile,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Firestore saveProfile error:', err);
  }
}

/**
 * Fetch profile by email or user ID from Firestore
 */
export async function getProfileFromFirestore(idOrEmail: string): Promise<Profile | null> {
  try {
    // 1. Direct doc lookup
    const docRef = doc(db, 'profiles', idOrEmail);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Profile;
    }

    // 2. Query by email
    const q = query(collection(db, 'profiles'), where('email', '==', idOrEmail), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as Profile;
    }

    return null;
  } catch (err) {
    console.error('Firestore getProfile error:', err);
    return null;
  }
}

/**
 * Add a book listing to Firestore
 */
export async function addBookToFirestore(book: FirestoreBook): Promise<void> {
  try {
    const bookRef = doc(db, 'books', book.id);
    await setDoc(bookRef, {
      ...book,
      created_at: book.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Firestore addBook error:', err);
  }
}

/**
 * Get all available books from Firestore
 */
export async function getBooksFromFirestore(): Promise<FirestoreBook[]> {
  try {
    const q = query(
      collection(db, 'books'),
      where('listing_status', 'in', ['available', 'reserved', 'sold'])
    );
    const snap = await getDocs(q);
    const results: FirestoreBook[] = [];
    snap.forEach((d) => {
      results.push(d.data() as FirestoreBook);
    });
    return results;
  } catch (err) {
    console.error('Firestore getBooks error:', err);
    return [];
  }
}

/**
 * Get a single book from Firestore by ID
 */
export async function getBookFromFirestore(bookId: string): Promise<FirestoreBook | null> {
  try {
    const bookRef = doc(db, 'books', bookId);
    const snap = await getDoc(bookRef);
    if (snap.exists()) {
      return snap.data() as FirestoreBook;
    }
    return null;
  } catch (err) {
    console.error('Firestore getBook error:', err);
    return null;
  }
}

/**
 * Update book status (e.g. reserved, available, sold)
 */
export async function updateBookStatusInFirestore(
  bookId: string,
  status: 'available' | 'reserved' | 'sold'
): Promise<void> {
  try {
    const bookRef = doc(db, 'books', bookId);
    await updateDoc(bookRef, {
      listing_status: status,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Firestore updateBookStatus error:', err);
  }
}

/**
 * Save order to Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      created_at: order.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Firestore saveOrder error:', err);
  }
}

/**
 * Fetch an order from Firestore by ID
 */
export async function getOrderFromFirestore(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (snap.exists()) {
      return snap.data() as Order;
    }
    return null;
  } catch (err) {
    console.error('Firestore getOrder error:', err);
    return null;
  }
}

/**
 * Fetch orders for a user (as buyer or seller)
 */
export async function getUserOrdersFromFirestore(userId: string): Promise<{
  purchases: Order[];
  sales: Order[];
}> {
  try {
    const buyerQ = query(collection(db, 'orders'), where('buyer_id', '==', userId));
    const sellerQ = query(collection(db, 'orders'), where('seller_id', '==', userId));

    const [buyerSnap, sellerSnap] = await Promise.all([
      getDocs(buyerQ),
      getDocs(sellerQ),
    ]);

    const purchases: Order[] = [];
    buyerSnap.forEach((d) => purchases.push(d.data() as Order));

    const sales: Order[] = [];
    sellerSnap.forEach((d) => sales.push(d.data() as Order));

    return { purchases, sales };
  } catch (err) {
    console.error('Firestore getUserOrders error:', err);
    return { purchases: [], sales: [] };
  }
}
