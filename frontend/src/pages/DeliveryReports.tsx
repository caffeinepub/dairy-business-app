import { useState, useMemo } from 'react';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';
import { Plus, Download, Truck, CheckCircle2, XCircle, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  useGetDeliveryRecordsByDate,
  useGetDeliveryRecordsByMonth,
  useAddDeliveryRecord,
  useGetCustomers,
  dateToNanoseconds,
  nanosecondsToDate,
  getTodayNanoseconds,
} from '../hooks/useQueries';
import { Variant_missed_delivered } from '../backend';
import type { Customer, DeliveryRecord } from '../backend';
import { exportDeliveryRecordsToCSV } from '../utils/csvExport';
import DeliveryQuantityChart from '../components/DeliveryQuantityChart';
import WhatsAppMessageModal from '../components/WhatsAppMessageModal';

export default function DeliveryReports() {
  const today = useMemo(() => new Date(), []);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  // Form state
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formCustomerPrincipal, setFormCustomerPrincipal] = useState('');
  const [formDeliveryBoy, setFormDeliveryBoy] = useState('');
  const [formDate, setFormDate] = useState(today.toISOString().split('T')[0]);
  const [formQuantity, setFormQuantity] = useState('');
  const [formStatus, setFormStatus] = useState<Variant_missed_delivered>(
    Variant_missed_delivered.delivered,
  );
  const [formNotes, setFormNotes] = useState('');

  // WhatsApp modal state
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsappCustomer, setWhatsappCustomer] = useState<Customer | null>(null);
  const [whatsappDelivery, setWhatsappDelivery] = useState<DeliveryRecord | null>(null);

  const { data: deliveriesByDate = [] } = useGetDeliveryRecordsByDate(today);
  const { data: monthDeliveries = [] } = useGetDeliveryRecordsByMonth(filterMonth, filterYear);
  const { data: customers = [] } = useGetCustomers();
  const addDelivery = useAddDeliveryRecord();

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCustomerPrincipal.trim()) {
      toast.error('Please enter the customer principal ID.');
      return;
    }

    let principal: Principal;
    try {
      principal = Principal.fromText(formCustomerPrincipal.trim());
    } catch {
      toast.error('Invalid principal ID format. Please check and try again.');
      return;
    }

    try {
      await addDelivery.mutateAsync({
        customerPrincipal: principal,
        deliveryBoyName: formDeliveryBoy,
        date: dateToNanoseconds(new Date(formDate)),
        quantityLiters: parseFloat(formQuantity),
        status: formStatus,
        notes: formNotes,
      });

      toast.success('Delivery record added successfully!');

      // Reset form
      setFormCustomerId('');
      setFormCustomerPrincipal('');
      setFormDeliveryBoy('');
      setFormDate(today.toISOString().split('T')[0]);
      setFormQuantity('');
      setFormStatus(Variant_missed_delivered.delivered);
      setFormNotes('');
      setAddOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to add delivery: ${msg}`);
    }
  };

  const filteredMonthDeliveries = useMemo(() => {
    if (!searchQuery.trim()) return monthDeliveries;
    const q = searchQuery.toLowerCase();
    return monthDeliveries.filter(
      (d) =>
        d.deliveryBoyName.toLowerCase().includes(q) ||
        d.notes.toLowerCase().includes(q) ||
        (d.customerPrincipal?.toString() ?? '').toLowerCase().includes(q),
    );
  }, [monthDeliveries, searchQuery]);

  const totalDelivered = monthDeliveries.filter(
    (d) => d.status === Variant_missed_delivered.delivered,
  ).length;
  const totalMissed = monthDeliveries.filter(
    (d) => d.status === Variant_missed_delivered.missed,
  ).length;
  const totalQuantity = monthDeliveries
    .filter((d) => d.status === Variant_missed_delivered.delivered)
    .reduce((sum, d) => sum + d.quantityLiters, 0);

  const todayNs = getTodayNanoseconds();
  const tomorrowNs = todayNs + 86_400_000_000_000n;
  const _todayDeliveries = deliveriesByDate.filter(
    (d) => d.date >= todayNs && d.date < tomorrowNs,
  );

  const handleExportCSV = () => {
    exportDeliveryRecordsToCSV(monthDeliveries, customers, filterMonth, filterYear);
    toast.success('CSV exported successfully!');
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Delivery Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage milk delivery records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log Delivery
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total This Month</p>
                <p className="text-xl font-bold">{monthDeliveries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-farm-green/10">
                <CheckCircle2 className="w-5 h-5 text-farm-green" />
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
                <XCircle className="w-5 h-5 text-destructive" />
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
                <Calendar className="w-5 h-5 text-farm-sky" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Quantity</p>
                <p className="text-xl font-bold">{totalQuantity.toFixed(1)}L</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <DeliveryQuantityChart deliveryRecords={monthDeliveries} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={filterMonth.toString()}
          onValueChange={(v) => setFilterMonth(parseInt(v))}
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
          value={filterYear.toString()}
          onValueChange={(v) => setFilterYear(parseInt(v))}
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

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search deliveries…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Delivery Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            Delivery Records — {months[filterMonth - 1]} {filterYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMonthDeliveries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No delivery records found for this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Delivery By</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMonthDeliveries.map((d: DeliveryRecord) => (
                    <TableRow key={d.id.toString()}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {nanosecondsToDate(d.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="font-medium text-sm font-mono">
                        {d.customerPrincipal
                          ? d.customerPrincipal.toString().slice(0, 12) + '…'
                          : 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm">{d.deliveryBoyName}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {d.quantityLiters.toFixed(1)}L
                      </TableCell>
                      <TableCell>
                        {d.status === Variant_missed_delivered.delivered ? (
                          <Badge className="bg-farm-green/20 text-farm-green border-farm-green/30 text-xs">
                            Delivered
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Missed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                        {d.notes || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Delivery Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Delivery Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDelivery} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Customer (for reference)</Label>
                <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c: Customer) => (
                      <SelectItem key={c.id.toString()} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="customer-principal">
                  Customer Principal ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customer-principal"
                  placeholder="e.g. aaaaa-aa or xxxxx-xxxxx-xxxxx-xxxxx-cai"
                  value={formCustomerPrincipal}
                  onChange={(e) => setFormCustomerPrincipal(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The Internet Identity principal of the customer. Customers can find this in their
                  portal profile.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-boy">Delivery Person</Label>
                <Input
                  id="delivery-boy"
                  placeholder="Name"
                  value={formDeliveryBoy}
                  onChange={(e) => setFormDeliveryBoy(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-date">Date</Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (Litres)</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(v) => setFormStatus(v as Variant_missed_delivered)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Variant_missed_delivered.delivered}>Delivered</SelectItem>
                    <SelectItem value={Variant_missed_delivered.missed}>Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                disabled={addDelivery.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addDelivery.isPending}>
                {addDelivery.isPending ? 'Saving…' : 'Save Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Modal — uses existing Customer + DeliveryRecord props */}
      <WhatsAppMessageModal
        open={whatsappOpen}
        onOpenChange={setWhatsappOpen}
        customer={whatsappCustomer}
        delivery={whatsappDelivery}
      />
    </div>
  );
}
