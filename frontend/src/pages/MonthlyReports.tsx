import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { useGetAllOrders, useGetAllCustomers } from '../hooks/useAdminQueries';
import { OrderStatus } from '../backend';
import { Badge } from '@/components/ui/badge';

export default function MonthlyReports() {
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: customers = [] } = useGetAllCustomers();

  const customerMap = new Map(customers.map(c => [c.id.toString(), c.name]));

  // Group orders by month
  const byMonth = new Map<string, typeof orders>();
  for (const o of orders) {
    const d = new Date(Number(o.orderDate) / 1_000_000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(o);
  }

  const months = Array.from(byMonth.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  const statusColors: Record<string, string> = {
    [OrderStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.Confirmed]: 'bg-blue-100 text-blue-800',
    [OrderStatus.OutForDelivery]: 'bg-purple-100 text-purple-800',
    [OrderStatus.Delivered]: 'bg-green-100 text-green-800',
    [OrderStatus.Cancelled]: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-dark flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Monthly Reports
        </h1>
        <p className="text-muted-foreground">Order summary grouped by month</p>
      </div>

      {ordersLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : months.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No orders to report yet.</CardContent>
        </Card>
      ) : (
        months.map(([month, monthOrders]) => {
          const delivered = monthOrders.filter(o => o.status === OrderStatus.Delivered).length;
          const pending = monthOrders.filter(o => o.status === OrderStatus.Pending).length;
          const cancelled = monthOrders.filter(o => o.status === OrderStatus.Cancelled).length;
          const [year, m] = month.split('-');
          const label = new Date(parseInt(year), parseInt(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

          return (
            <Card key={month} className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{label}</span>
                  <span className="text-sm font-normal text-muted-foreground">{monthOrders.length} orders</span>
                </CardTitle>
                <div className="flex gap-3 text-sm">
                  <span className="text-green-700">✓ {delivered} delivered</span>
                  <span className="text-yellow-700">⏳ {pending} pending</span>
                  <span className="text-red-700">✗ {cancelled} cancelled</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {monthOrders.map(o => (
                    <div key={o.orderId.toString()} className="flex items-center justify-between py-1.5 border-b border-border last:border-0 text-sm">
                      <div>
                        <span className="font-medium">{customerMap.get(o.customerId.toString()) || `Customer #${o.customerId}`}</span>
                        <span className="text-muted-foreground ml-2 font-mono">{o.cattleTagNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{new Date(Number(o.orderDate) / 1_000_000).toLocaleDateString()}</span>
                        <Badge className={statusColors[String(o.status)] ?? ''}>{String(o.status)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
