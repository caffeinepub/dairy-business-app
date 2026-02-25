import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Droplets, Plus, Loader2, TrendingUp } from 'lucide-react';
import {
    useGetAllCattle,
    useGetAllMilkRecords,
    useAddMilkRecord,
    formatDate,
    timeToDate,
} from '../hooks/useQueries';
import MilkProductionChart from '../components/MilkProductionChart';

export default function MilkProduction() {
    const { data: cattle = [], isLoading: cattleLoading } = useGetAllCattle();
    const { data: milkRecords = [], isLoading: milkLoading } = useGetAllMilkRecords();
    const addMilkRecord = useAddMilkRecord();

    // Form state
    const [cattleId, setCattleId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');

    // Filter state
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');

    const cattleMap = useMemo(() => {
        const map = new Map<string, string>();
        cattle.forEach((c) => map.set(String(c.id), c.name));
        return map;
    }, [cattle]);

    const filteredRecords = useMemo(() => {
        let records = [...milkRecords].sort((a, b) => Number(b.date - a.date));
        if (filterFrom) {
            const from = new Date(filterFrom).getTime();
            records = records.filter((r) => timeToDate(r.date).getTime() >= from);
        }
        if (filterTo) {
            const to = new Date(filterTo).getTime() + 86400000;
            records = records.filter((r) => timeToDate(r.date).getTime() <= to);
        }
        return records;
    }, [milkRecords, filterFrom, filterTo]);

    const totalFiltered = useMemo(() => filteredRecords.reduce((s, r) => s + r.quantity, 0), [filteredRecords]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cattleId || !date || !quantity) return;
        addMilkRecord.mutate(
            {
                cattleId: BigInt(cattleId),
                date: new Date(date),
                quantity: parseFloat(quantity),
                notes,
            },
            {
                onSuccess: () => {
                    setCattleId('');
                    setDate(new Date().toISOString().split('T')[0]);
                    setQuantity('');
                    setNotes('');
                },
            }
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Droplets className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Milk Production</h1>
                    <p className="text-sm text-muted-foreground">Log and track daily milk yield</p>
                </div>
            </div>

            {/* Log Form */}
            <Card className="shadow-card">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <Plus className="w-4 h-4 text-primary" />
                        Log Milk Record
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="milk-cattle">Cattle</Label>
                            <Select value={cattleId} onValueChange={setCattleId}>
                                <SelectTrigger id="milk-cattle">
                                    <SelectValue placeholder={cattleLoading ? 'Loading...' : 'Select cattle'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {cattle.map((c) => (
                                        <SelectItem key={String(c.id)} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                    {cattle.length === 0 && !cattleLoading && (
                                        <SelectItem value="__none__" disabled>No cattle available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="milk-date">Date</Label>
                            <Input
                                id="milk-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="milk-qty">Quantity (L)</Label>
                            <Input
                                id="milk-qty"
                                type="number"
                                min="0"
                                step="0.1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g. 12.5"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="milk-notes">Notes</Label>
                            <Input
                                id="milk-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes"
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                            <Button
                                type="submit"
                                disabled={addMilkRecord.isPending || !cattleId || !quantity}
                                className="gap-2 min-w-[140px]"
                            >
                                {addMilkRecord.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Droplets className="w-4 h-4" />
                                )}
                                {addMilkRecord.isPending ? 'Saving...' : 'Log Record'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Chart */}
            <Card className="shadow-card">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        7-Day Production Trend
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

            {/* Records Table */}
            <Card className="shadow-card">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <CardTitle className="text-base font-semibold">
                            Milk Records
                            {!milkLoading && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                    ({filteredRecords.length} records · {totalFiltered.toFixed(1)} L total)
                                </span>
                            )}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm">
                            <Label className="text-muted-foreground shrink-0">From</Label>
                            <Input
                                type="date"
                                value={filterFrom}
                                onChange={(e) => setFilterFrom(e.target.value)}
                                className="w-auto h-8 text-sm"
                            />
                            <Label className="text-muted-foreground shrink-0">To</Label>
                            <Input
                                type="date"
                                value={filterTo}
                                onChange={(e) => setFilterTo(e.target.value)}
                                className="w-auto h-8 text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {milkLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Droplets className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No milk records found</p>
                            <p className="text-sm mt-1">Log a record using the form above</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cattle</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRecords.map((r) => (
                                        <TableRow key={String(r.id)}>
                                            <TableCell className="font-semibold">
                                                {cattleMap.get(String(r.cattleId)) ?? `Cattle #${r.cattleId}`}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(r.date)}</TableCell>
                                            <TableCell className="text-right font-bold">{r.quantity.toFixed(1)} L</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{r.notes || '—'}</TableCell>
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
