import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import { OrderAdminRow } from '@/components/admin/order-admin-row';
import { Card } from '@/components/ui/card';
import type { OrderWithDetails } from '@/lib/services/orders';

export const metadata: Metadata = {
  title: 'Order Operations & Payments | Admin Console',
};

export default async function AdminOrdersPage() {
  const adminClient = await createAdminClient();

  const { data: orders } = await adminClient
    .from('orders')
    .select(
      `
      *,
      books (id, title, original_price, selling_price),
      buyer:profiles!buyer_id (id, full_name, student_id, phone),
      seller:profiles!seller_id (id, full_name, student_id, phone),
      pickup_points (id, name)
    `
    )
    .order('created_at', { ascending: false });

  const list = (orders || []) as unknown as OrderWithDetails[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders & Campus Handoff</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Verify buyer payments, mark campus drop-offs, and conduct PIN handovers.
        </p>
      </div>

      <Card className="overflow-hidden border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="p-3">Order</th>
                <th className="p-3">Book</th>
                <th className="p-3">Buyer</th>
                <th className="p-3">Seller</th>
                <th className="p-3">Order Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((order) => (
                  <OrderAdminRow key={order.id} order={order} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground">
                    No orders placed yet.
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
