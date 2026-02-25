import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Beef, Droplets, Package, Truck, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useGetDeliveryRecordsByDate } from '../hooks/useQueries';
import { nanosecondsToDate, getTodayNanoseconds } from '../hooks/useQueries';
import MilkProductionChart from '../components/MilkProductionChart';
import type { MilkRecord } from '../backend';
import { Variant_missed_delivered } from '../backend';

export default function Dashboard() {
  const today = useMemo(() => new Date(), []);
  const { data: cattle = [] } = useGetAllCattle();
  const { data: milkRecords = [] } = useGetAllMilkRecords();
  const { data: todayDeliveries = [] } = useGetDeliveryRecordsByDate(today);

  const activeCattle = cattle.filter((c) => c.activeStatus).length;

  const todayNs = getTodayNanoseconds();
  const tomorrowNs = todayNs + 86_400_000_000_000n;

  const todayMilkTotal = useMemo(() => {
    return milkRecords
      .filter((r) => r.date >= todayNs && r.date < tomorrowNs)
      .reduce((sum, r) => sum + r.quantityLiters, 0);
  }, [milkRecords, todayNs, tomorrowNs]);

  const missedDeliveries = todayDeliveries.filter(
    (d) => d.status === Variant_missed_delivered.missed,
  ).length;

  const recentMilkRecords = useMemo(() => {
    return [...milkRecords]
      .sort((a, b) => Number(b.date - a.date))
      .slice(0, 10);
  }, [milkRecords]);

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
  );
}
