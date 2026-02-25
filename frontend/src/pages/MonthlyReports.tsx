import { useState, useMemo } from 'react';
import { BarChart3, Printer, Truck, Droplets, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  useGetDeliveryRecordsByMonth,
  useGetMilkRecordsByMonth,
  useGetCustomers,
  nanosecondsToDate,
} from '../hooks/useQueries';
import { Variant_missed_delivered } from '../backend';
import { downloadCustomerMonthlyCSV } from '../utils/csvExport';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthlyReports() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { data: deliveries = [], isLoading: deliveriesLoading } = useGetDeliveryRecordsByMonth(
    selectedMonth,
    selectedYear,
  );
  const { data: milkRecords = [], isLoading: milkLoading } = useGetMilkRecordsByMonth(
    selectedMonth,
    selectedYear,
  );
  const { data: customers = [], isLoading: customersLoading } = useGetCustomers();

  const years = useMemo((): number[] => {
    const y: number[] = [];
    for (let i = now.getFullYear() - 2; i <= now.getFullYear() + 1; i++) y.push(i);
    return y;
  }, []);

  // Build a customer id → name map
  const customerNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of customers) {
      map.set(c.id.toString(), c.name);
    }
    return map;
  }, [customers]);

  // Delivery stats
  const deliveredCount = deliveries.filter(
    (d) => d.status === Variant_missed_delivered.delivered,
  ).length;
  const missedCount = deliveries.filter(
    (d) => d.status === Variant_missed_delivered.missed,
  ).length;
  const totalLitersDelivered = deliveries
    .filter((d) => d.status === Variant_missed_delivered.delivered)
    .reduce((sum, d) => sum + d.quantityLiters, 0);

  // Per-customer breakdown
  const customerBreakdown = useMemo(() => {
    const map = new Map<
      string,
      { customerId: string; name: string; delivered: number; missed: number; liters: number }
    >();
    for (const d of deliveries) {
      const key = d.customerId.toString();
      if (!map.has(key)) {
        const resolvedName = customerNameMap.get(key) || `Customer #${key}`;
        map.set(key, { customerId: key, name: resolvedName, delivered: 0, missed: 0, liters: 0 });
      }
      const entry = map.get(key)!;
      if (d.status === Variant_missed_delivered.delivered) {
        entry.delivered++;
        entry.liters += d.quantityLiters;
      } else {
        entry.missed++;
      }
    }
    return Array.from(map.values());
  }, [deliveries, customerNameMap]);

  // Delivery boy performance
  const deliveryBoyStats = useMemo(() => {
    const map = new Map<string, { delivered: number; missed: number }>();
    for (const d of deliveries) {
      if (!map.has(d.deliveryBoyName)) {
        map.set(d.deliveryBoyName, { delivered: 0, missed: 0 });
      }
      const entry = map.get(d.deliveryBoyName)!;
      if (d.status === Variant_missed_delivered.delivered) {
        entry.delivered++;
      } else {
        entry.missed++;
      }
    }
    return Array.from(map.entries()).map(([name, stats]) => ({
      name,
      ...stats,
      successRate:
        stats.delivered + stats.missed > 0
          ? Math.round((stats.delivered / (stats.delivered + stats.missed)) * 100)
          : 0,
    }));
  }, [deliveries]);

  // Milk stats
  const totalMilkLiters = milkRecords.reduce((sum, r) => sum + r.quantityLiters, 0);
  const avgDailyMilk = milkRecords.length > 0 ? totalMilkLiters / milkRecords.length : 0;

  const isLoading = deliveriesLoading || milkLoading || customersLoading;

  const handleDownloadCustomer = (customerId: string, customerName: string) => {
    const customerDeliveries = deliveries.filter(
      (d) => d.customerId.toString() === customerId,
    );
    downloadCustomerMonthlyCSV(customerName, selectedMonth, selectedYear, customerDeliveries);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">Monthly Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {MONTHS[selectedMonth - 1]} {selectedYear} summary
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={(i + 1).toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y: number) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => window.print()} className="gap-2 print:hidden">
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading report data…</div>
        ) : (
          <>
            {/* Delivery Summary */}
            <section>
              <h2 className="text-lg font-semibold text-foreground font-display mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Delivery Summary
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Deliveries', value: deliveries.length },
                  { label: 'Delivered', value: deliveredCount },
                  { label: 'Missed', value: missedCount },
                  { label: 'Liters Delivered', value: `${totalLitersDelivered.toFixed(1)}L` },
                ].map(({ label, value }) => (
                  <Card key={label}>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Per-Customer Breakdown */}
            {customerBreakdown.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Customer Breakdown</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Click <Download className="w-3 h-3 inline mx-0.5" /> to download individual report
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Delivered</TableHead>
                          <TableHead>Missed</TableHead>
                          <TableHead>Total Liters</TableHead>
                          <TableHead className="text-right print:hidden">Download</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerBreakdown.map((row) => (
                          <TableRow key={row.customerId}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {row.delivered}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {row.missed > 0 ? (
                                <Badge variant="destructive">{row.missed}</Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">0</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{row.liters.toFixed(1)}L</TableCell>
                            <TableCell className="text-right print:hidden">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() =>
                                      handleDownloadCustomer(row.customerId, row.name)
                                    }
                                  >
                                    <Download className="w-4 h-4" />
                                    <span className="sr-only">Download {row.name} report</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Download {row.name}'s report as CSV
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Boy Performance */}
            {deliveryBoyStats.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Delivery Boy Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Delivered</TableHead>
                          <TableHead>Missed</TableHead>
                          <TableHead>Success Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliveryBoyStats.map((row) => (
                          <TableRow key={row.name}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell>{row.delivered}</TableCell>
                            <TableCell>{row.missed}</TableCell>
                            <TableCell>
                              <Badge
                                variant={row.successRate >= 80 ? 'default' : 'destructive'}
                              >
                                {row.successRate}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Milk Production Summary */}
            <section>
              <h2 className="text-lg font-semibold text-foreground font-display mb-3 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary" />
                Milk Production
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Total Records', value: milkRecords.length },
                  { label: 'Total Liters', value: `${totalMilkLiters.toFixed(1)}L` },
                  { label: 'Avg per Record', value: `${avgDailyMilk.toFixed(1)}L` },
                ].map(({ label, value }) => (
                  <Card key={label}>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {milkRecords.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Milk Records</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
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
                                {nanosecondsToDate(r.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="font-medium">
                                {r.quantityLiters.toFixed(1)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {r.notes || '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
