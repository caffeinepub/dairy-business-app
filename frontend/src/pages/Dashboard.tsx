import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Beef, Droplets, Package, AlertTriangle, TrendingUp, Truck, XCircle } from 'lucide-react';
import {
    useGetAllCattle,
    useGetAllMilkRecords,
    useGetAllInventoryItems,
    useGetDeliveryRecordsByDate,
    formatDate,
    isToday,
} from '../hooks/useQueries';
import MilkProductionChart from '../components/MilkProductionChart';
import { Variant_missed_delivered } from '../backend';

const LOW_STOCK_THRESHOLD = 10;

export default function Dashboard() {
    const { data: cattle = [], isLoading: cattleLoading } = useGetAllCattle();
    const { data: milkRecords = [], isLoading: milkLoading } = useGetAllMilkRecords();
    const { data: inventory = [], isLoading: inventoryLoading } = useGetAllInventoryItems();

    const today = useMemo(() => new Date(), []);
    const { data: todayDeliveries = [], isLoading: deliveriesLoading } = useGetDeliveryRecordsByDate(today);

    const todayMilk = useMemo(() => {
        return milkRecords
            .filter((r) => isToday(r.date))
            .reduce((sum, r) => sum + r.quantity, 0);
    }, [milkRecords]);

    const lowStockCount = useMemo(() => {
        return inventory.filter((i) => Number(i.quantity) < LOW_STOCK_THRESHOLD).length;
    }, [inventory]);

    const recentMilkRecords = useMemo(() => {
        return [...milkRecords]
            .sort((a, b) => Number(b.date - a.date))
            .slice(0, 10);
    }, [milkRecords]);

    const cattleMap = useMemo(() => {
        const map = new Map<string, string>();
        cattle.forEach((c) => map.set(String(c.id), c.name));
        return map;
    }, [cattle]);

    const activeCattle = cattle.filter((c) => c.status === 'active').length;

    const missedDeliveries = todayDeliveries.filter(
        (r) => r.status === Variant_missed_delivered.missed,
    ).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Hero Banner */}
            <div className="relative rounded-xl overflow-hidden shadow-card">
                <img
                    src="/assets/generated/farm-hero.dim_1200x300.png"
                    alt="Farm landscape"
                    className="w-full h-40 sm:h-52 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center px-6 sm:px-10">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                            Welcome to AO Farms 🐄
                        </h1>
                        <p className="text-white/80 text-sm sm:text-base mt-1">
                            Here's your dairy farm overview for today
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="xl:col-span-1 sm:col-span-1">
                    <SummaryCard
                        title="Total Cattle"
                        value={cattleLoading ? null : String(cattle.length)}
                        sub={`${activeCattle} active`}
                        icon={<Beef className="w-5 h-5" />}
                        color="green"
                        linkTo="/cattle"
                    />
                </div>
                <div className="xl:col-span-1 sm:col-span-1">
                    <SummaryCard
                        title="Today's Milk Yield"
                        value={milkLoading ? null : `${todayMilk.toFixed(1)} L`}
                        sub="Total production today"
                        icon={<Droplets className="w-5 h-5" />}
                        color="blue"
                        linkTo="/milk"
                    />
                </div>
                <div className="xl:col-span-1 sm:col-span-1">
                    <SummaryCard
                        title="Inventory Items"
                        value={inventoryLoading ? null : String(inventory.length)}
                        sub="Total tracked items"
                        icon={<Package className="w-5 h-5" />}
                        color="amber"
                        linkTo="/inventory"
                    />
                </div>
                <div className="xl:col-span-1 sm:col-span-1">
                    <SummaryCard
                        title="Low Stock Alerts"
                        value={inventoryLoading ? null : String(lowStockCount)}
                        sub={`Items below ${LOW_STOCK_THRESHOLD} units`}
                        icon={<AlertTriangle className="w-5 h-5" />}
                        color={lowStockCount > 0 ? 'red' : 'green'}
                        linkTo="/inventory"
                    />
                </div>
                <div className="xl:col-span-1 sm:col-span-1">
                    <SummaryCard
                        title="Today's Deliveries"
                        value={deliveriesLoading ? null : String(todayDeliveries.length)}
                        sub="Total logged today"
                        icon={<Truck className="w-5 h-5" />}
                        color="blue"
                        linkTo="/deliveries"
                    />
                </div>
                <div className="xl:col-span-1 sm:col-span-1">
                    <SummaryCard
                        title="Missed Deliveries"
                        value={deliveriesLoading ? null : String(missedDeliveries)}
                        sub="Not delivered today"
                        icon={<XCircle className="w-5 h-5" />}
                        color={missedDeliveries > 0 ? 'red' : 'green'}
                        linkTo="/deliveries"
                    />
                </div>
            </div>

            {/* Chart + Recent Records */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* 7-day chart */}
                <Card className="lg:col-span-3 shadow-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            7-Day Milk Production
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {milkLoading ? (
                            <Skeleton className="h-[220px] w-full" />
                        ) : (
                            <MilkProductionChart records={milkRecords} />
                        )}
                    </CardContent>
                </Card>

                {/* Recent milk entries */}
                <Card className="lg:col-span-2 shadow-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Droplets className="w-4 h-4 text-primary" />
                            Recent Milk Entries
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {milkLoading || cattleLoading ? (
                            <div className="p-4 space-y-2">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                            </div>
                        ) : recentMilkRecords.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <Droplets className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No milk records yet</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cattle</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentMilkRecords.map((r) => (
                                        <TableRow key={String(r.id)}>
                                            <TableCell className="font-medium text-sm">
                                                {cattleMap.get(String(r.cattleId)) ?? `#${r.cattleId}`}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDate(r.date)}
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-semibold">
                                                {r.quantity.toFixed(1)} L
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Today's Delivery Summary */}
            {(todayDeliveries.length > 0 || deliveriesLoading) && (
                <Card className="shadow-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Truck className="w-4 h-4 text-primary" />
                            Today's Delivery Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {deliveriesLoading ? (
                            <div className="p-4 space-y-2">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Delivery Boy</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {todayDeliveries.slice(0, 5).map((r) => (
                                        <TableRow key={String(r.id)}>
                                            <TableCell className="font-medium text-sm">{r.deliveryBoyName}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {r.quantityLiters.toFixed(1)} L
                                            </TableCell>
                                            <TableCell>
                                                {r.status === Variant_missed_delivered.delivered ? (
                                                    <Badge className="bg-success text-success-foreground border-0 text-xs">Delivered</Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="text-xs">Missed</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {todayDeliveries.length > 5 && (
                            <div className="px-4 py-2 text-center">
                                <Link to="/deliveries" className="text-sm text-primary hover:underline font-medium">
                                    View all {todayDeliveries.length} deliveries →
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
interface SummaryCardProps {
    title: string;
    value: string | null;
    sub: string;
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'amber' | 'red';
    linkTo: string;
}

const colorMap = {
    green: 'text-success bg-success/10',
    blue: 'text-primary bg-primary/10',
    amber: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
    red: 'text-destructive bg-destructive/10',
};

function SummaryCard({ title, value, sub, icon, color, linkTo }: SummaryCardProps) {
    return (
        <Link to={linkTo} className="block group">
            <Card className="shadow-card hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                                {title}
                            </p>
                            {value === null ? (
                                <Skeleton className="h-7 w-16 mt-1" />
                            ) : (
                                <p className="text-2xl font-bold text-foreground mt-0.5 leading-tight">{value}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>
                        </div>
                        <div className={`p-2 rounded-lg shrink-0 ${colorMap[color]}`}>
                            {icon}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
