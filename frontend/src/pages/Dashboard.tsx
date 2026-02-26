import { useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useIsCallerAdmin,
  useGetAllCattle,
  useGetAllOrders,
  useGetAllMilkProductionRecords,
  useGetAllInventoryItems,
  useGetLowStockItems,
} from '../hooks/useAdminQueries';
import { OrderStatus } from '../backend';
import { Loader2, Beef, Droplets, Package, AlertTriangle, Truck, XCircle } from 'lucide-react';
import MilkProductionTrendChart from '../components/MilkProductionTrendChart';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: cattle = [], isLoading: cattleLoading } = useGetAllCattle();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: milkRecords = [], isLoading: milkLoading } = useGetAllMilkProductionRecords();
  const { data: inventoryItems = [], isLoading: inventoryLoading } = useGetAllInventoryItems();
  const { data: lowStockItems = [], isLoading: lowStockLoading } = useGetLowStockItems();

  useEffect(() => {
    if (!adminCheckLoading && isAdmin === false) {
      navigate({ to: '/admin-login' });
    }
  }, [isAdmin, adminCheckLoading, navigate]);

  // Today's milk production
  const todayMilk = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime() * 1_000_000;
    const todayEnd = endOfDay(new Date()).getTime() * 1_000_000;
    return milkRecords
      .filter((r) => Number(r.date) >= todayStart && Number(r.date) <= todayEnd)
      .reduce((sum, r) => sum + r.quantityLiters, 0);
  }, [milkRecords]);

  // Today's deliveries (Delivered status, today)
  const todayDeliveries = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime() * 1_000_000;
    const todayEnd = endOfDay(new Date()).getTime() * 1_000_000;
    return orders.filter(
      (o) =>
        o.status === OrderStatus.Delivered &&
        Number(o.orderDate) >= todayStart &&
        Number(o.orderDate) <= todayEnd,
    ).length;
  }, [orders]);

  // Missed deliveries (Pending/Confirmed/OutForDelivery from previous days)
  const missedDeliveries = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime() * 1_000_000;
    return orders.filter(
      (o) =>
        (o.status === OrderStatus.Pending ||
          o.status === OrderStatus.Confirmed ||
          o.status === OrderStatus.OutForDelivery) &&
        Number(o.orderDate) < todayStart,
    ).length;
  }, [orders]);

  // Last 7 days milk records for chart
  const last7DaysRecords = useMemo(() => {
    const cutoff = subDays(new Date(), 7).getTime() * 1_000_000;
    return milkRecords.filter((r) => Number(r.date) >= cutoff);
  }, [milkRecords]);

  // Recent milk entries (latest 6)
  const recentMilkEntries = useMemo(() => {
    return [...milkRecords]
      .sort((a, b) => Number(b.date) - Number(a.date))
      .slice(0, 6);
  }, [milkRecords]);

  const activeCattle = cattle.filter((c) => c.availability === 'Available').length;

  if (adminCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-farm-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const statCards = [
    {
      label: 'TOTAL CATTLE',
      value: cattleLoading ? null : cattle.length,
      subtext: cattleLoading ? '...' : `${activeCattle} active`,
      icon: Beef,
      iconBg: 'bg-farm-primary/10',
      iconColor: 'text-farm-primary',
    },
    {
      label: "TODAY'S MILK...",
      value: milkLoading ? null : `${todayMilk.toFixed(1)} L`,
      subtext: 'Total production today',
      icon: Droplets,
      iconBg: 'bg-farm-primary/10',
      iconColor: 'text-farm-primary',
    },
    {
      label: 'INVENTORY IT...',
      value: inventoryLoading ? null : inventoryItems.length,
      subtext: 'Total tracked items',
      icon: Package,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
    },
    {
      label: 'LOW STOCK ...',
      value: lowStockLoading ? null : lowStockItems.length,
      subtext: 'Items below threshold',
      icon: AlertTriangle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      label: "TODAY'S DELI...",
      value: ordersLoading ? null : todayDeliveries,
      subtext: 'Total logged today',
      icon: Truck,
      iconBg: 'bg-farm-primary/10',
      iconColor: 'text-farm-primary',
    },
    {
      label: 'MISSED DELI...',
      value: ordersLoading ? null : missedDeliveries,
      subtext: 'Not delivered today',
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
    },
  ];

  return (
    <div className="bg-farm-bg min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ height: '260px' }}>
        <img
          src="/assets/generated/farm-hero-banner.dim_1400x300.png"
          alt="AO Farms"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md flex items-center gap-3">
            Welcome to AO Farms <span className="text-3xl">🐄</span>
          </h1>
          <p className="text-white/90 text-base md:text-lg mt-2 drop-shadow">
            Here's your dairy farm overview for today
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-xl border border-farm-border p-4 shadow-sm flex flex-col gap-2"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-bold tracking-widest text-farm-text/50 uppercase leading-tight truncate pr-1">
                    {card.label}
                  </p>
                  <div className={`flex-shrink-0 p-1.5 rounded-lg ${card.iconBg}`}>
                    <Icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-farm-text">
                  {card.value === null ? (
                    <Loader2 className="h-5 w-5 animate-spin text-farm-primary" />
                  ) : (
                    card.value
                  )}
                </div>
                <p className="text-[11px] text-farm-text/50 truncate">{card.subtext}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 7-Day Milk Production Chart */}
          <div className="bg-white rounded-xl border border-farm-border p-5 shadow-sm">
            <h2 className="text-base font-bold text-farm-text flex items-center gap-2 mb-4">
              <Droplets className="h-4 w-4 text-farm-primary" />
              7-Day Milk Production
            </h2>
            {milkLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-farm-primary" />
              </div>
            ) : (
              <MilkProductionTrendChart records={last7DaysRecords} />
            )}
          </div>

          {/* Recent Milk Entries */}
          <div className="bg-white rounded-xl border border-farm-border p-5 shadow-sm">
            <h2 className="text-base font-bold text-farm-text flex items-center gap-2 mb-4">
              <Droplets className="h-4 w-4 text-farm-primary" />
              Recent Milk Entries
            </h2>
            {milkLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-farm-primary" />
              </div>
            ) : recentMilkEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-farm-text/40">
                <Droplets className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No milk production records yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentMilkEntries.map((entry) => (
                  <div
                    key={entry.id.toString()}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-farm-bg border border-farm-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-farm-primary/10 flex items-center justify-center flex-shrink-0">
                        <Beef className="h-4 w-4 text-farm-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-farm-text">
                          {entry.cattleTag}
                        </p>
                        <p className="text-xs text-farm-text/50">
                          {format(new Date(Number(entry.date) / 1_000_000), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-farm-primary">
                      {entry.quantityLiters.toFixed(1)} L
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
