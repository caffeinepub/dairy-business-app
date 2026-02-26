import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin, useGetAllOrders } from '../hooks/useAdminQueries';
import { OrderStatus, CattleOrder } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, ChevronDown, ChevronRight, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

interface MonthGroup {
  monthKey: string;
  label: string;
  orders: CattleOrder[];
  delivered: number;
  pending: number;
  cancelled: number;
  confirmed: number;
  outForDelivery: number;
}

function groupOrdersByMonth(orders: CattleOrder[]): MonthGroup[] {
  const map = new Map<string, CattleOrder[]>();

  for (const order of orders) {
    const date = new Date(Number(order.orderDate) / 1_000_000);
    const key = format(date, 'yyyy-MM');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(order);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, orders]) => ({
      monthKey: key,
      label: format(new Date(key + '-01'), 'MMMM yyyy'),
      orders,
      delivered: orders.filter((o) => o.status === OrderStatus.Delivered).length,
      pending: orders.filter((o) => o.status === OrderStatus.Pending).length,
      cancelled: orders.filter((o) => o.status === OrderStatus.Cancelled).length,
      confirmed: orders.filter((o) => o.status === OrderStatus.Confirmed).length,
      outForDelivery: orders.filter((o) => o.status === OrderStatus.OutForDelivery).length,
    }));
}

function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-800';
    case OrderStatus.Confirmed: return 'bg-blue-100 text-blue-800';
    case OrderStatus.OutForDelivery: return 'bg-purple-100 text-purple-800';
    case OrderStatus.Delivered: return 'bg-green-100 text-green-800';
    case OrderStatus.Cancelled: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function MonthlyReports() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!adminCheckLoading && isAdmin === false) {
      navigate({ to: '/admin-login' });
    }
  }, [isAdmin, adminCheckLoading, navigate]);

  if (adminCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const monthGroups = groupOrdersByMonth(orders);

  const toggleMonth = (key: string) => {
    setOpenMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-foreground">Monthly Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Order summaries grouped by month</p>
      </div>

      {ordersLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : monthGroups.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {monthGroups.map((group) => (
            <Collapsible
              key={group.monthKey}
              open={openMonths.has(group.monthKey)}
              onOpenChange={() => toggleMonth(group.monthKey)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {openMonths.has(group.monthKey) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <CardTitle className="text-base font-display">{group.label}</CardTitle>
                        <Badge variant="secondary">{group.orders.length} orders</Badge>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {group.delivered > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium">
                            {group.delivered} delivered
                          </span>
                        )}
                        {group.pending > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                            {group.pending} pending
                          </span>
                        )}
                        {group.cancelled > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">
                            {group.cancelled} cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t border-border pt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground border-b border-border">
                              <th className="pb-2 pr-4">Order ID</th>
                              <th className="pb-2 pr-4">Customer</th>
                              <th className="pb-2 pr-4">Cattle Tag</th>
                              <th className="pb-2 pr-4">Date</th>
                              <th className="pb-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.orders
                              .sort((a, b) => Number(b.orderDate) - Number(a.orderDate))
                              .map((order) => (
                                <tr key={order.orderId.toString()} className="border-b border-border/50 last:border-0">
                                  <td className="py-2 pr-4 font-mono text-xs">#{order.orderId.toString()}</td>
                                  <td className="py-2 pr-4">#{order.customerId.toString()}</td>
                                  <td className="py-2 pr-4">{order.cattleTagNumber}</td>
                                  <td className="py-2 pr-4 text-muted-foreground">
                                    {format(new Date(Number(order.orderDate) / 1_000_000), 'MMM d, yyyy')}
                                  </td>
                                  <td className="py-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(order.status)}`}>
                                      {order.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
