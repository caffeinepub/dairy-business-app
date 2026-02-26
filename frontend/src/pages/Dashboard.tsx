import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Beef, Droplets, Package, Truck, TrendingUp, AlertTriangle, Bell, X, CheckCircle2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAllCattle } from '../hooks/useQueries';
import { useGetAllMilkRecords } from '../hooks/useQueries';
import { useGetDeliveryRecordsByDate, useGetDeliveryRecordsByMonth, useGetCustomers } from '../hooks/useQueries';
import { nanosecondsToDate, getTodayNanoseconds } from '../hooks/useQueries';
import MilkProductionChart from '../components/MilkProductionChart';
import CattleHealthChart from '../components/CattleHealthChart';
import FlaggedFeedbackSection from '../components/FlaggedFeedbackSection';
import type { MilkRecord } from '../backend';
import { CattleStatus, Variant_missed_delivered } from '../backend';

export default function Dashboard() {
  const today = useMemo(() => new Date(), []);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: cattle = [] } = useGetAllCattle();
  const { data: milkRecords = [] } = useGetAllMilkRecords();
  const { data: todayDeliveries = [] } = useGetDeliveryRecordsByDate(today);
  const { data: monthDeliveries = [] } = useGetDeliveryRecordsByMonth(currentMonth, currentYear);
  const { data: customers = [] } = useGetCustomers();

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const activeCattle = cattle.filter((c) => c.status === CattleStatus.active).length;
  const activeCustomers = customers.filter((c) => c.active).length;

  const todayNs = getTodayNanoseconds();
  const tomorrowNs = todayNs + 86_400_000_000_000n;

  const todayMilkTotal = useMemo(() => {
    return milkRecords
      .filter((r) => r.date >= todayNs && r.date < tomorrowNs)
      .reduce((sum, r) => sum + r.quantityLiters, 0);
  }, [milkRecords, todayNs, tomorrowNs]);

  // All-time milk total
  const allTimeMilkTotal = useMemo(() => {
    return milkRecords.reduce((sum, r) => sum + r.quantityLiters, 0);
  }, [milkRecords]);

  // This month's milk total
  const thisMonthMilkTotal = useMemo(() => {
    return milkRecords
      .filter((r) => {
        const d = nanosecondsToDate(r.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + r.quantityLiters, 0);
  }, [milkRecords, currentMonth, currentYear]);

  const missedDeliveries = todayDeliveries.filter(
    (d) => d.status === Variant_missed_delivered.missed,
  ).length;

  const totalDeliveriesThisMonth = monthDeliveries.length;

  const recentMilkRecords = useMemo(() => {
    return [...milkRecords]
      .sort((a, b) => Number(b.date - a.date))
      .slice(0, 10);
  }, [milkRecords]);

  // ─── Alerts ───────────────────────────────────────────────────────────────

  const alerts = useMemo(() => {
    const result: { id: string; type: 'warning' | 'info'; message: string }[] = [];

    // Low production alert: cattle with today's production below their average
    const cattleAvgMap = new Map<string, number>();
    const cattleTodayMap = new Map<string, number>();

    for (const r of milkRecords) {
      const key = r.cattleId.toString();
      cattleAvgMap.set(key, (cattleAvgMap.get(key) ?? 0) + r.quantityLiters);
    }

    // Count records per cattle for average
    const cattleCountMap = new Map<string, number>();
    for (const r of milkRecords) {
      const key = r.cattleId.toString();
      cattleCountMap.set(key, (cattleCountMap.get(key) ?? 0) + 1);
    }

    // Today's production per cattle
    for (const r of milkRecords) {
      const ms = Number(r.date / 1_000_000n);
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const dayEnd = dayStart + 86_400_000;
      if (ms >= dayStart && ms < dayEnd) {
        const key = r.cattleId.toString();
        cattleTodayMap.set(key, (cattleTodayMap.get(key) ?? 0) + r.quantityLiters);
      }
    }

    for (const [cattleId, totalLiters] of cattleAvgMap.entries()) {
      const count = cattleCountMap.get(cattleId) ?? 1;
      const avg = totalLiters / count;
      const todayProd = cattleTodayMap.get(cattleId);
      if (todayProd !== undefined && todayProd < avg * 0.8) {
        const cattleInfo = cattle.find((c) => c.id.toString() === cattleId);
        const label = cattleInfo ? `${cattleInfo.breed} #${cattleId}` : `Cattle #${cattleId}`;
        result.push({
          id: `low-prod-${cattleId}`,
          type: 'warning',
          message: `Low production: ${label} produced ${todayProd.toFixed(1)}L today (avg: ${avg.toFixed(1)}L)`,
        });
      }
    }

    // Overdue delivery alert: active customers with no delivery today
    const deliveredCustomerPrincipals = new Set(
      todayDeliveries
        .filter((d) => d.status === Variant_missed_delivered.delivered)
        .map((d) => d.customerPrincipal?.toString() ?? ''),
    );

    const activeCustomerList = customers.filter((c) => c.active);
    for (const customer of activeCustomerList) {
      if (!deliveredCustomerPrincipals.has(customer.id.toString())) {
        result.push({
          id: `no-delivery-${customer.id.toString()}`,
          type: 'warning',
          message: `No delivery recorded today for active customer: ${customer.name}`,
        });
      }
    }

    return result;
  }, [milkRecords, cattle, todayDeliveries, customers]);

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));

  const dismissAlert = (id: string) => {
    setDismissedAlerts((prev) => new Set([...prev, id]));
  };

  const statCards = [
    {
      title: 'Active Cattle',
      value: activeCattle,
      icon: Beef,
      color: 'text-farm-brown',
      bg: 'bg-farm-brown/10',
      link: '/cattle',
    },
    {
      title: "Today's Milk",
      value: `${todayMilkTotal.toFixed(1)}L`,
      icon: Droplets,
      color: 'text-farm-sky',
      bg: 'bg-farm-sky/10',
      link: '/milk',
    },
    {
      title: 'Total Cattle',
      value: cattle.length,
      icon: TrendingUp,
      color: 'text-farm-green',
      bg: 'bg-farm-green/10',
      link: '/cattle',
    },
    {
      title: 'Missed Deliveries',
      value: missedDeliveries,
      icon: Truck,
      color: missedDeliveries > 0 ? 'text-destructive' : 'text-farm-green',
      bg: missedDeliveries > 0 ? 'bg-destructive/10' : 'bg-farm-green/10',
      link: '/deliveries',
    },
    {
      title: 'Active Customers',
      value: activeCustomers,
      icon: Users,
      color: 'text-farm-brown',
      bg: 'bg-farm-brown/10',
      link: '/customers',
    },
    {
      title: 'Milk This Month',
      value: `${thisMonthMilkTotal.toFixed(0)}L`,
      icon: Droplets,
      color: 'text-primary',
      bg: 'bg-primary/10',
      link: '/milk',
    },
    {
      title: 'All-Time Milk',
      value: `${allTimeMilkTotal.toFixed(0)}L`,
      icon: Package,
      color: 'text-farm-green',
      bg: 'bg-farm-green/10',
      link: '/milk',
    },
    {
      title: 'Deliveries (Month)',
      value: totalDeliveriesThisMonth,
      icon: Truck,
      color: 'text-farm-sky',
      bg: 'bg-farm-sky/10',
      link: '/deliveries',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden h-40 sm:h-52">
        <img
          src="/assets/generated/farm-hero.dim_1200x300.png"
          alt="AO Farms"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-6 sm:px-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
              Welcome to AO Farms
            </h2>
            <p className="text-white/80 text-sm sm:text-base mt-1">
              Your complete dairy management solution
            </p>
          </div>
        </div>
      </div>

      {/* Alerts / Notifications */}
      {visibleAlerts.length > 0 ? (
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-warning-foreground">
              <Bell className="w-4 h-4 text-warning" />
              Alerts & Notifications
              <Badge variant="outline" className="ml-auto text-warning border-warning/50">
                {visibleAlerts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20"
              >
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground flex-1">{alert.message}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0 hover:bg-warning/20"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-farm-green/30 bg-farm-green/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-farm-green flex-shrink-0" />
            <p className="text-sm text-muted-foreground">No alerts — everything looks good today!</p>
          </CardContent>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, icon: Icon, color, bg, link }) => (
          <Link key={title} to={link}>
            <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{title}</p>
                    <p className="text-xl font-bold text-foreground">{value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Chart + Today's Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MilkProductionChart milkRecords={milkRecords} />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Today's Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No deliveries logged today
              </p>
            ) : (
              <div className="space-y-2">
                {todayDeliveries.map((d) => (
                  <div
                    key={d.id.toString()}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground truncate max-w-[120px]">
                      {d.deliveryBoyName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{d.quantityLiters}L</span>
                      <Badge
                        variant={
                          d.status === Variant_missed_delivered.delivered
                            ? 'default'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {d.status === Variant_missed_delivered.delivered ? 'Delivered' : 'Missed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cattle Health Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CattleHealthChart cattle={cattle} />

        {/* Recent Milk Records */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary" />
              Recent Milk Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentMilkRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No milk records yet.{' '}
                <Link to="/milk" className="text-primary hover:underline">
                  Log your first record
                </Link>
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Cattle ID</TableHead>
                      <TableHead>Quantity (L)</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMilkRecords.map((record: MilkRecord) => (
                      <TableRow key={record.id.toString()}>
                        <TableCell className="text-sm">
                          {nanosecondsToDate(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">#{record.cattleId.toString()}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {record.quantityLiters.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.notes || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Feedback Section (Admin) */}
      <section>
        <h2 className="text-lg font-semibold font-display mb-3 flex items-center gap-2">
          <Bell className="w-5 h-5 text-destructive" />
          Customer Feedback
        </h2>
        <FlaggedFeedbackSection />
      </section>
    </div>
  );
}
