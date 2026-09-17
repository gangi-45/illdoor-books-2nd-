import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { BookAdminRow } from '@/components/admin/book-admin-row';
import { Card } from '@/components/ui/card';
import type { BookWithDetails } from '@/lib/services/books';

export const metadata: Metadata = {
  title: 'Book Listings | Admin Console',
};

export default async function AdminBooksPage() {
  const adminClient = await createAdminClient();

  const { data: books } = await adminClient
    .from('books')
    .select(
      `
      *,
      seller:profiles!seller_id (id, full_name, student_id)
    `
    )
    .order('created_at', { ascending: false });

  const list = (books || []) as unknown as BookWithDetails[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace Book Listings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review uploaded textbooks, inspect condition details, or hide inappropriate listings.
        </p>
      </div>

      <Card className="overflow-hidden border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="p-3">Title</th>
                <th className="p-3">Code</th>
                <th className="p-3">Seller</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((book) => <BookAdminRow key={book.id} book={book} />)
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    No book listings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
