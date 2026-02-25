import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    BarChart3,
    Printer,
    Truck,
    Droplets,
    CheckCircle2,
    XCircle,
    Users,
    UserCheck,
    TrendingUp,
} from 'lucide-react';
import {
    useGetDeliveryRecordsByMonth,
    useGetMilkRecordsByMonth,
    useGetCustomers,
    timeToDate,
} from '../hooks/useQueries';
import { Variant_missed_delivered } from '../backend';

const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

function generateYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
        years.push(y);
    }
    return years;
}

function StatCard({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
}) {
    return (
        <Card className="border-border shadow-card">
            <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                        <p className="text-2xl font-bold text-foreground">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TableSkeleton({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRow key={i}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

export default function MonthlyReports() {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    const years = useMemo(() => generateYears(), []);

    const { data: deliveryRecords = [], isLoading: deliveryLoading } = useGetDeliveryRecordsByMonth(
        selectedMonth,
        selectedYear,
    );
    const { data: milkRecords = [], isLoading: milkLoading } = useGetMilkRecordsByMonth(
        selectedMonth,
        selectedYear,
    );
    const { data: customers = [], isLoading: customersLoading } = useGetCustomers();

    // ── Delivery summary ──────────────────────────────────────────────────────
    const totalDeliveries = deliveryRecords.length;
    const totalMissed = deliveryRecords.filter(
        (r) => r.status === Variant_missed_delivered.missed,
    ).length;
    const totalDelivered = totalDeliveries - totalMissed;
    const totalLitersDelivered = deliveryRecords
        .filter((r) => r.status === Variant_missed_delivered.delivered)
        .reduce((sum, r) => sum + r.quantityLiters, 0);

    // ── Per-customer breakdown ────────────────────────────────────────────────
    const customerMap = useMemo(() => {
        const map = new Map<string, string>();
        customers.forEach((c) => map.set(String(c.id), c.name));
        return map;
    }, [customers]);

    const perCustomer = useMemo(() => {
        const map = new Map<
            string,
            { name: string; total: number; missed: number; liters: number }
        >();
        deliveryRecords.forEach((r) => {
            const key = String(r.customerId);
            const existing = map.get(key) ?? {
                name: customerMap.get(key) ?? `Customer #${key}`,
                total: 0,
                missed: 0,
                liters: 0,
            };
            existing.total += 1;
            if (r.status === Variant_missed_delivered.missed) {
                existing.missed += 1;
            } else {
                existing.liters += r.quantityLiters;
            }
            map.set(key, existing);
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [deliveryRecords, customerMap]);

    // ── Per-delivery-boy breakdown ────────────────────────────────────────────
    const perDeliveryBoy = useMemo(() => {
        const map = new Map<
            string,
            { name: string; total: number; missed: number; liters: number }
        >();
        deliveryRecords.forEach((r) => {
            const key = r.deliveryBoyName.trim() || 'Unknown';
            const existing = map.get(key) ?? { name: key, total: 0, missed: 0, liters: 0 };
            existing.total += 1;
            if (r.status === Variant_missed_delivered.missed) {
                existing.missed += 1;
            } else {
                existing.liters += r.quantityLiters;
            }
            map.set(key, existing);
        });
        return Array.from(map.values()).sort((a, b) => b.total - a.total);
    }, [deliveryRecords]);

    // ── Milk summary ──────────────────────────────────────────────────────────
    const totalMilkLiters = milkRecords.reduce((sum, r) => sum + r.quantityLiters, 0);
    const milkRecordsSorted = useMemo(
        () => [...milkRecords].sort((a, b) => Number(a.date - b.date)),
        [milkRecords],
    );

    const selectedMonthLabel =
        MONTHS.find((m) => m.value === selectedMonth)?.label ?? '';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground font-display">
                            Monthly Reports
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Delivery &amp; milk production summary
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground print:hidden"
                >
                    <Printer className="w-4 h-4" />
                    Print Report
                </Button>
            </div>

            {/* Print-only header */}
            <div className="hidden print:block mb-4">
                <h1 className="text-2xl font-bold">AO Farms — Monthly Report</h1>
                <p className="text-base text-gray-600">
                    {selectedMonthLabel} {selectedYear}
                </p>
            </div>

            {/* Month / Year Selector */}
            <Card className="border-border shadow-card print:hidden">
                <CardContent className="pt-5 pb-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Month
                            </label>
                            <Select
                                value={String(selectedMonth)}
                                onValueChange={(v) => setSelectedMonth(Number(v))}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m) => (
                                        <SelectItem key={m.value} value={String(m.value)}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Year
                            </label>
                            <Select
                                value={String(selectedYear)}
                                onValueChange={(v) => setSelectedYear(Number(v))}
                            >
                                <SelectTrigger className="w-28">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={String(y)}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end pb-0.5">
                            <span className="text-sm font-semibold text-foreground">
                                Showing:{' '}
                                <span className="text-primary">
                                    {selectedMonthLabel} {selectedYear}
                                </span>
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── DELIVERY REPORT SECTION ─────────────────────────────────── */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground font-display">
                        Monthly Delivery Report
                    </h2>
                </div>

                {/* Delivery Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {deliveryLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="border-border shadow-card">
                                <CardContent className="pt-5 pb-4">
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <>
                            <StatCard
                                icon={Truck}
                                label="Total Deliveries"
                                value={totalDeliveries}
                                color="bg-primary/10 text-primary"
                            />
                            <StatCard
                                icon={CheckCircle2}
                                label="Delivered"
                                value={totalDelivered}
                                color="bg-success/10 text-success"
                            />
                            <StatCard
                                icon={XCircle}
                                label="Missed"
                                value={totalMissed}
                                color="bg-destructive/10 text-destructive"
                            />
                            <StatCard
                                icon={Droplets}
                                label="Total Liters"
                                value={`${totalLitersDelivered.toFixed(1)} L`}
                                color="bg-accent/20 text-accent-foreground"
                            />
                        </>
                    )}
                </div>

                {/* Per-Customer Breakdown */}
                <Card className="border-border shadow-card mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Users className="w-4 h-4 text-primary" />
                            Per-Customer Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary/40">
                                        <TableHead className="font-semibold">Customer</TableHead>
                                        <TableHead className="text-center font-semibold">
                                            Total Deliveries
                                        </TableHead>
                                        <TableHead className="text-center font-semibold">
                                            Delivered
                                        </TableHead>
                                        <TableHead className="text-center font-semibold">
                                            Missed
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Total Liters
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deliveryLoading || customersLoading ? (
                                        <TableSkeleton rows={4} cols={5} />
                                    ) : perCustomer.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                No delivery records for {selectedMonthLabel}{' '}
                                                {selectedYear}.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        perCustomer.map((row) => (
                                            <TableRow
                                                key={row.name}
                                                className="hover:bg-secondary/20 transition-colors"
                                            >
                                                <TableCell className="font-medium">
                                                    {row.name}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {row.total}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-success text-success"
                                                    >
                                                        {row.total - row.missed}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {row.missed > 0 ? (
                                                        <Badge variant="destructive">
                                                            {row.missed}
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-muted text-muted-foreground"
                                                        >
                                                            0
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {row.liters.toFixed(1)} L
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Per-Delivery-Boy Performance */}
                <Card className="border-border shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <UserCheck className="w-4 h-4 text-primary" />
                            Delivery Boy Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary/40">
                                        <TableHead className="font-semibold">
                                            Delivery Boy
                                        </TableHead>
                                        <TableHead className="text-center font-semibold">
                                            Total Assigned
                                        </TableHead>
                                        <TableHead className="text-center font-semibold">
                                            Delivered
                                        </TableHead>
                                        <TableHead className="text-center font-semibold">
                                            Missed
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Total Liters
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Success Rate
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deliveryLoading ? (
                                        <TableSkeleton rows={3} cols={6} />
                                    ) : perDeliveryBoy.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                No delivery records for {selectedMonthLabel}{' '}
                                                {selectedYear}.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        perDeliveryBoy.map((row) => {
                                            const successRate =
                                                row.total > 0
                                                    ? (
                                                          ((row.total - row.missed) / row.total) *
                                                          100
                                                      ).toFixed(0)
                                                    : '0';
                                            const rateNum = Number(successRate);
                                            return (
                                                <TableRow
                                                    key={row.name}
                                                    className="hover:bg-secondary/20 transition-colors"
                                                >
                                                    <TableCell className="font-medium">
                                                        {row.name}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {row.total}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant="outline"
                                                            className="border-success text-success"
                                                        >
                                                            {row.total - row.missed}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {row.missed > 0 ? (
                                                            <Badge variant="destructive">
                                                                {row.missed}
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="border-muted text-muted-foreground"
                                                            >
                                                                0
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {row.liters.toFixed(1)} L
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span
                                                            className={
                                                                rateNum >= 90
                                                                    ? 'text-success font-semibold'
                                                                    : rateNum >= 70
                                                                    ? 'text-warning font-semibold'
                                                                    : 'text-destructive font-semibold'
                                                            }
                                                        >
                                                            {successRate}%
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* ── MILK PRODUCTION SECTION ─────────────────────────────────── */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Droplets className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground font-display">
                        Monthly Milk Production Report
                    </h2>
                </div>

                {/* Milk Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {milkLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="border-border shadow-card">
                                <CardContent className="pt-5 pb-4">
                                    <Skeleton className="h-16 w-full" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <>
                            <StatCard
                                icon={Droplets}
                                label="Total Milk Produced"
                                value={`${totalMilkLiters.toFixed(1)} L`}
                                color="bg-primary/10 text-primary"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Total Records"
                                value={milkRecords.length}
                                color="bg-accent/20 text-accent-foreground"
                            />
                            <StatCard
                                icon={BarChart3}
                                label="Daily Average"
                                value={
                                    milkRecords.length > 0
                                        ? `${(totalMilkLiters / milkRecords.length).toFixed(1)} L`
                                        : '0 L'
                                }
                                color="bg-success/10 text-success"
                            />
                        </>
                    )}
                </div>

                {/* Milk Records Table */}
                <Card className="border-border shadow-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Droplets className="w-4 h-4 text-primary" />
                            Milk Production Records — {selectedMonthLabel} {selectedYear}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary/40">
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Quantity (Liters)
                                        </TableHead>
                                        <TableHead className="font-semibold">Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {milkLoading ? (
                                        <TableSkeleton rows={4} cols={3} />
                                    ) : milkRecordsSorted.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                No milk production records for{' '}
                                                {selectedMonthLabel} {selectedYear}.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        milkRecordsSorted.map((record) => (
                                            <TableRow
                                                key={String(record.id)}
                                                className="hover:bg-secondary/20 transition-colors"
                                            >
                                                <TableCell className="font-medium">
                                                    {timeToDate(record.date).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-primary">
                                                    {record.quantityLiters.toFixed(1)} L
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {record.notes || '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                                {milkRecordsSorted.length > 0 && !milkLoading && (
                                    <tfoot>
                                        <TableRow className="bg-secondary/30 font-semibold">
                                            <TableCell className="font-bold">Total</TableCell>
                                            <TableCell className="text-right font-bold text-primary">
                                                {totalMilkLiters.toFixed(1)} L
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </tfoot>
                                )}
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
