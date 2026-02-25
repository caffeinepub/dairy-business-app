import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Truck, Plus, CalendarDays, CheckCircle2, XCircle, Loader2, ClipboardList } from 'lucide-react';
import {
    useGetCustomers,
    useGetDeliveryRecordsByDate,
    useAddDeliveryRecord,
} from '../hooks/useQueries';
import { Variant_missed_delivered } from '../backend';

function todayString() {
    return new Date().toISOString().split('T')[0];
}

export default function DeliveryReports() {
    const { data: customers = [], isLoading: customersLoading } = useGetCustomers();
    const addDelivery = useAddDeliveryRecord();

    // Form state
    const [customerId, setCustomerId] = useState('');
    const [deliveryBoyName, setDeliveryBoyName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [status, setStatus] = useState<Variant_missed_delivered>(Variant_missed_delivered.delivered);
    const [notes, setNotes] = useState('');
    const [formDate, setFormDate] = useState(todayString());

    // Filter date for report table
    const [filterDate, setFilterDate] = useState(todayString());

    const filterDateObj = useMemo(() => new Date(filterDate + 'T00:00:00'), [filterDate]);
    const { data: deliveryRecords = [], isLoading: recordsLoading } = useGetDeliveryRecordsByDate(filterDateObj);

    // Build customer map for quick lookup
    const customerMap = useMemo(() => {
        const map = new Map<string, string>();
        customers.forEach((c) => map.set(String(c.id), c.name));
        return map;
    }, [customers]);

    const activeCustomers = useMemo(() => customers.filter((c) => c.activeStatus), [customers]);

    const deliveredCount = deliveryRecords.filter((r) => r.status === Variant_missed_delivered.delivered).length;
    const missedCount = deliveryRecords.filter((r) => r.status === Variant_missed_delivered.missed).length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId || !deliveryBoyName.trim() || !quantity) return;

        addDelivery.mutate(
            {
                customerId: BigInt(customerId),
                deliveryBoyName: deliveryBoyName.trim(),
                date: new Date(formDate + 'T00:00:00'),
                quantityLiters: parseFloat(quantity),
                status,
                notes: notes.trim(),
            },
            {
                onSuccess: () => {
                    setCustomerId('');
                    setDeliveryBoyName('');
                    setQuantity('');
                    setStatus(Variant_missed_delivered.delivered);
                    setNotes('');
                    setFormDate(todayString());
                },
            },
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Daily Delivery Reports</h1>
                    <p className="text-sm text-muted-foreground">Log and track milk deliveries to customers</p>
                </div>
            </div>

            {/* Log Delivery Form */}
            <Card className="shadow-card">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <Plus className="w-4 h-4 text-primary" />
                        Log a Delivery
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Customer */}
                        <div className="space-y-1.5">
                            <Label htmlFor="delivery-customer">Customer *</Label>
                            <Select value={customerId} onValueChange={setCustomerId} required>
                                <SelectTrigger id="delivery-customer">
                                    <SelectValue placeholder={customersLoading ? 'Loading...' : 'Select customer'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeCustomers.map((c) => (
                                        <SelectItem key={String(c.id)} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                    {activeCustomers.length === 0 && !customersLoading && (
                                        <SelectItem value="__none__" disabled>
                                            No active customers
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Delivery Boy */}
                        <div className="space-y-1.5">
                            <Label htmlFor="delivery-boy">Delivery Boy Name *</Label>
                            <Input
                                id="delivery-boy"
                                value={deliveryBoyName}
                                onChange={(e) => setDeliveryBoyName(e.target.value)}
                                placeholder="e.g. Raju"
                                required
                            />
                        </div>

                        {/* Quantity */}
                        <div className="space-y-1.5">
                            <Label htmlFor="delivery-qty">Quantity (Liters) *</Label>
                            <Input
                                id="delivery-qty"
                                type="number"
                                min="0"
                                step="0.1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g. 2.5"
                                required
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <Label htmlFor="delivery-status">Status *</Label>
                            <Select
                                value={status}
                                onValueChange={(v) => setStatus(v as Variant_missed_delivered)}
                            >
                                <SelectTrigger id="delivery-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={Variant_missed_delivered.delivered}>✅ Delivered</SelectItem>
                                    <SelectItem value={Variant_missed_delivered.missed}>❌ Missed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date */}
                        <div className="space-y-1.5">
                            <Label htmlFor="delivery-date">Date *</Label>
                            <Input
                                id="delivery-date"
                                type="date"
                                value={formDate}
                                onChange={(e) => setFormDate(e.target.value)}
                                required
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                            <Label htmlFor="delivery-notes">Notes</Label>
                            <Input
                                id="delivery-notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes..."
                            />
                        </div>

                        {/* Submit */}
                        <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-1">
                            <Button
                                type="submit"
                                disabled={addDelivery.isPending || !customerId || !deliveryBoyName.trim() || !quantity}
                                className="gap-2 min-w-[160px]"
                            >
                                {addDelivery.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Truck className="w-4 h-4" />
                                )}
                                {addDelivery.isPending ? 'Saving...' : 'Log Delivery'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Report Section */}
            <div className="space-y-4">
                {/* Date filter + summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <h2 className="text-base font-semibold text-foreground">Delivery Report</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="filter-date" className="text-sm text-muted-foreground shrink-0">
                            Filter by date:
                        </Label>
                        <Input
                            id="filter-date"
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-auto"
                        />
                    </div>
                </div>

                {/* Summary badges */}
                {!recordsLoading && deliveryRecords.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            {deliveredCount} Delivered
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                            <XCircle className="w-4 h-4" />
                            {missedCount} Missed
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                            <ClipboardList className="w-4 h-4" />
                            {deliveryRecords.length} Total
                        </div>
                    </div>
                )}

                {/* Table */}
                <Card className="shadow-card">
                    <CardContent className="p-0">
                        {recordsLoading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        ) : deliveryRecords.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No deliveries recorded</p>
                                <p className="text-sm mt-1">
                                    {filterDate === todayString()
                                        ? 'Log today\'s deliveries using the form above'
                                        : `No records found for ${new Date(filterDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Delivery Boy</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deliveryRecords.map((r) => (
                                            <TableRow key={String(r.id)}>
                                                <TableCell className="font-semibold">
                                                    {customerMap.get(String(r.customerId)) ?? `Customer #${r.customerId}`}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{r.deliveryBoyName}</TableCell>
                                                <TableCell className="text-muted-foreground">{r.quantityLiters.toFixed(1)} L</TableCell>
                                                <TableCell>
                                                    {r.status === Variant_missed_delivered.delivered ? (
                                                        <Badge className="bg-success text-success-foreground border-0 gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Delivered
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="gap-1">
                                                            <XCircle className="w-3 h-3" />
                                                            Missed
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {r.notes || '—'}
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
        </div>
    );
}
