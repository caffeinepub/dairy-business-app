import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Beef, Users, Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useGetAllCattle, useGetAllCustomers, useGetAllOrders } from '../hooks/useAdminQueries';
import { CattleAvailability, HealthStatus, OrderStatus } from '../backend';
import CattleHealthChart from '../components/CattleHealthChart';

export default function Dashboard() {
  const { data: cattle = [], isLoading: cattleLoading } = useGetAllCattle();
  const { data: customers = [], isLoading: customersLoading } = useGetAllCustomers();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();

  const availableCattle = cattle.filter(c => c.availability === CattleAvailability.Available).length;
  const sickCattle = cattle.filter(c => c.healthStatus === HealthStatus.Sick).length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const pendingOrders = orders.filter(o => o.status === OrderStatus.Pending).length;
  const deliveredOrders = orders.filter(o => o.status === OrderStatus.Delivered).length;

  const recentOrders = [...orders]
    .sort((a, b) => Number(b.orderDate) - Number(a.orderDate))
    .slice(0, 5);

  const customerMap = new Map(customers.map(c => [c.id.toString(), c.name]));

  const statusColors: Record<string, string> = {
    [OrderStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.Confirmed]: 'bg-blue-100 text-blue-800',
    [OrderStatus.OutForDelivery]: 'bg-purple-100 text-purple-800',
    [OrderStatus.Delivered]: 'bg-green-100 text-green-800',
    [OrderStatus.Cancelled]: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-admin-dark">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your farm operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cattle</p>
                <p className="text-3xl font-bold text-admin-dark">{cattleLoading ? '—' : cattle.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{availableCattle} available</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Beef className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-3xl font-bold text-admin-dark">{customersLoading ? '—' : customers.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{activeCustomers} active</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold text-admin-dark">{ordersLoading ? '—' : orders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingOrders} pending</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-3xl font-bold text-admin-dark">{ordersLoading ? '—' : deliveredOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">completed orders</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {sickCattle > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">
            <strong>{sickCattle} cattle</strong> currently marked as sick. Please check their health status.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cattle Health Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Cattle Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <CattleHealthChart cattle={cattle} />
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(o => (
                  <div key={o.orderId.toString()} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{customerMap.get(o.customerId.toString()) || `Customer #${o.customerId}`}</p>
                      <p className="text-xs text-muted-foreground font-mono">{o.cattleTagNumber} · {new Date(Number(o.orderDate) / 1_000_000).toLocaleDateString()}</p>
                    </div>
                    <Badge className={statusColors[String(o.status)] ?? ''}>{String(o.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
