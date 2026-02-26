import { useState, useMemo } from 'react';
import { Download, BarChart3, Users, Truck, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetDeliveryRecordsByMonth,
  useGetMilkRecordsByMonth,
  useGetCustomers,
  nanosecondsToDate,
} from '../hooks/useQueries';
import { Variant_missed_delivered } from '../backend';
import { downloadCustomerMonthlyCSV } from '../utils/csvExport';

export default function MonthlyReports() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: deliveries = [] } = useGetDeliveryRecordsByMonth(selectedMonth, selectedYear);
  const { data: milkRecords = [] } = useGetMilkRecordsByMonth(selectedMonth, selectedYear);
  const { data: customers = [] } = useGetCustomers();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  // Group deliveries by customerPrincipal string
  const customerDeliveryMap = useMemo(() => {
    const map = new Map<string, typeof deliveries>();
    for (const d of deliveries) {
      const key = d.customerPrincipal?.toString() ?? 'unknown';
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, d]);
    }
    return map;
  }, [deliveries]);

  // Per-customer breakdown
  const customerBreakdown = useMemo(() => {
    return Array.from(customerDeliveryMap.entries()).map(([principalStr, recs]) => {
      const delivered = recs.filter((r) => r.status === Variant_missed_delivered.delivered);
      const missed = recs.filter((r) => r.status === Variant_missed_delivered.missed);
      const totalQty = delivered.reduce((s, r) => s + r.quantityLiters, 0);
      return {
        principalStr,
        total: recs.length,
        delivered: delivered.length,
        missed: missed.length,
        totalQty,
        records: recs,
      };
    });
  }, [customerDeliveryMap]);

  // Delivery boy performance
  const deliveryBoyMap = useMemo(() => {
    const map = new Map<string, { delivered: number; missed: number; totalQty: number }>();
    for (const d of deliveries) {
      const name = d.deliveryBoyName || 'Unknown';
      const existing = map.get(name) ?? { delivered: 0, missed: 0, totalQty: 0 };
      if (d.status === Variant_missed_delivered.delivered) {
        map.set(name, {
          ...existing,
          delivered: existing.delivered + 1,
          totalQty: existing.totalQty + d.quantityLiters,
        });
      } else {
        map.set(name, { ...existing, missed: existing.missed + 1 });
      }
    }
    return map;
  }, [deliveries]);

  // Summary stats
  const totalDelivered = deliveries.filter(
    (d) => d.status === Variant_missed_delivered.delivered,
  ).length;
  const totalMissed = deliveries.filter(
    (d) => d.status === Variant_missed_delivered.missed,
  ).length;
  const totalQty = deliveries
    .filter((d) => d.status === Variant_missed_delivered.delivered)
    .reduce((s, d) => s + d.quantityLiters, 0);
  const totalMilkProduced = milkRecords.reduce((s, r) => s + r.quantityLiters, 0);

  const handleDownloadCustomerCSV = (principalStr: string) => {
    const recs = customerDeliveryMap.get(principalStr) ?? [];
    // Use principal string as customer name since we don't have a direct mapping
    const displayName = principalStr === 'unknown' ? 'Unknown' : principalStr.slice(0, 12) + '…';
    downloadCustomerMonthlyCSV(recs, displayName, selectedMonth, selectedYear);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Monthly Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Comprehensive monthly delivery and production summary
          </p>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="flex gap-3 flex-wrap">
        <Select
          value={selectedMonth.toString()}
          onValueChange={(v) => setSelectedMonth(parseInt(v))}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedYear.toString()}
          onValueChange={(v) => setSelectedYear(parseInt(v))}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Deliveries</p>
                <p className="text-xl font-bold">{deliveries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-farm-green/10">
                <BarChart3 className="w-5 h-5 text-farm-green" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-xl font-bold text-farm-green">{totalDelivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-destructive/10">
                <Users className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Missed</p>
                <p className="text-xl font-bold text-destructive">{totalMissed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-farm-sky/10">
                <Droplets className="w-5 h-5 text-farm-sky" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Milk Produced</p>
                <p className="text-xl font-bold">{totalMilkProduced.toFixed(1)}L</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Customer Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Per-Customer Delivery Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customerBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No delivery data for this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Missed</TableHead>
                    <TableHead>Quantity (L)</TableHead>
                    <TableHead className="text-right">Export</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerBreakdown.map(({ principalStr, total, delivered, missed, totalQty }) => (
                    <TableRow key={principalStr}>
                      <TableCell className="font-medium text-sm font-mono">
                        {principalStr === 'unknown'
                          ? 'Unknown'
                          : principalStr.slice(0, 16) + '…'}
                      </TableCell>
                      <TableCell className="text-sm">{total}</TableCell>
                      <TableCell>
                        <Badge className="bg-farm-green/20 text-farm-green border-farm-green/30 text-xs">
                          {delivered}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {missed > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {missed}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{totalQty.toFixed(1)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleDownloadCustomerCSV(principalStr)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          CSV
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Boy Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            Delivery Person Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {deliveryBoyMap.size === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No delivery data for this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Missed</TableHead>
                    <TableHead>Total Qty (L)</TableHead>
                    <TableHead>Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(deliveryBoyMap.entries()).map(([name, stats]) => {
                    const total = stats.delivered + stats.missed;
                    const rate = total > 0 ? Math.round((stats.delivered / total) * 100) : 0;
                    return (
                      <TableRow key={name}>
                        <TableCell className="font-medium text-sm">{name}</TableCell>
                        <TableCell>
                          <Badge className="bg-farm-green/20 text-farm-green border-farm-green/30 text-xs">
                            {stats.delivered}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {stats.missed > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              {stats.missed}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {stats.totalQty.toFixed(1)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-farm-green rounded-full"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{rate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milk Production Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" />
            Milk Production — {months[selectedMonth - 1]} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {milkRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No milk production records for this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity (L)</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {milkRecords.map((r) => (
                    <TableRow key={r.id.toString()}>
                      <TableCell className="text-sm">
                        {nanosecondsToDate(r.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {r.quantityLiters.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.notes || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold bg-muted/30">
                    <TableCell>Total</TableCell>
                    <TableCell>{totalMilkProduced.toFixed(1)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
