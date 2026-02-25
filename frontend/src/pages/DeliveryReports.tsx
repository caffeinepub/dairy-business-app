import { useState, useMemo } from 'react';
import { Truck, Plus, Filter, MessageCircle, Download, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetCustomers,
  useGetDeliveryRecordsByDate,
  useGetDeliveryRecordsByMonth,
  useAddDeliveryRecord,
  nanosecondsToDate,
  dateToNanoseconds,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import WhatsAppMessageModal from '../components/WhatsAppMessageModal';
import DeliveryQuantityChart from '../components/DeliveryQuantityChart';
import { exportDeliveryRecordsToCSV } from '../utils/csvExport';
import type { DeliveryRecord, Customer } from '../backend';
import { Variant_missed_delivered } from '../backend';

export default function DeliveryReports() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: customers = [] } = useGetCustomers();
  const addDeliveryRecord = useAddDeliveryRecord();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  const { data: deliveries = [], isLoading } = useGetDeliveryRecordsByDate(
    new Date(filterDate || new Date().toISOString().split('T')[0]),
  );

  // Fetch current month's deliveries for the chart
  const { data: monthDeliveries = [] } = useGetDeliveryRecordsByMonth(currentMonth, currentYear);

  // Form state
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formDeliveryBoy, setFormDeliveryBoy] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formQty, setFormQty] = useState('');
  const [formStatus, setFormStatus] = useState<'delivered' | 'missed'>('delivered');
  const [formNotes, setFormNotes] = useState('');

  // WhatsApp modal state
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    customer: Customer;
    delivery: DeliveryRecord;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId || !formDeliveryBoy || !formDate || !formQty) return;

    await addDeliveryRecord.mutateAsync({
      customerId: BigInt(formCustomerId),
      deliveryBoyName: formDeliveryBoy,
      date: dateToNanoseconds(new Date(formDate)),
      quantityLiters: parseFloat(formQty),
      status:
        formStatus === 'delivered'
          ? Variant_missed_delivered.delivered
          : Variant_missed_delivered.missed,
      notes: formNotes,
    });

    setFormCustomerId('');
    setFormDeliveryBoy('');
    setFormQty('');
    setFormNotes('');
  };

  const getCustomerName = (customerId: bigint) => {
    const c = customers.find((c) => c.id === customerId);
    return c ? c.name : `Customer #${customerId.toString()}`;
  };

  const getCustomer = (customerId: bigint): Customer | undefined => {
    return customers.find((c) => c.id === customerId);
  };

  // Apply optional date range filter on top of the date-filtered deliveries
  const filteredDeliveries = useMemo(() => {
    if (!filterStart && !filterEnd) return deliveries;
    return deliveries.filter((d) => {
      const date = nanosecondsToDate(d.date);
      const dateStr = date.toISOString().split('T')[0];
      if (filterStart && dateStr < filterStart) return false;
      if (filterEnd && dateStr > filterEnd) return false;
      return true;
    });
  }, [deliveries, filterStart, filterEnd]);

  const totalDelivered = filteredDeliveries.filter(
    (d) => d.status === Variant_missed_delivered.delivered,
  ).length;
  const totalMissed = filteredDeliveries.filter(
    (d) => d.status === Variant_missed_delivered.missed,
  ).length;
  const totalLiters = filteredDeliveries
    .filter((d) => d.status === Variant_missed_delivered.delivered)
    .reduce((sum, d) => sum + d.quantityLiters, 0);

  const handleClearFilters = () => {
    setFilterStart('');
    setFilterEnd('');
    setFilterDate(new Date().toISOString().split('T')[0]);
  };

  const handleDownloadCSV = () => {
    exportDeliveryRecordsToCSV(filteredDeliveries, customers);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Delivery Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Log and track daily milk deliveries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Form */}
        {isAuthenticated && (
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Log Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Customer</Label>
                  <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id.toString()} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Delivery Boy</Label>
                  <Input
                    placeholder="Name"
                    value={formDeliveryBoy}
                    onChange={(e) => setFormDeliveryBoy(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Quantity (Liters)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 5.0"
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={formStatus}
                    onValueChange={(v) => setFormStatus(v as 'delivered' | 'missed')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Optional notes…"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    addDeliveryRecord.isPending ||
                    !formCustomerId ||
                    !formDeliveryBoy ||
                    !formQty
                  }
                >
                  {addDeliveryRecord.isPending ? 'Saving…' : 'Log Delivery'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className={`${isAuthenticated ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Delivered', value: totalDelivered, color: 'text-farm-green' },
              { label: 'Missed', value: totalMissed, color: 'text-destructive' },
              { label: 'Total Liters', value: `${totalLiters.toFixed(1)}L`, color: 'text-primary' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly Chart */}
          <DeliveryQuantityChart deliveryRecords={monthDeliveries} />
        </div>
      </div>

      {/* Filter + Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Delivery Records
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-36 h-8 text-sm"
              />
              <span className="text-muted-foreground text-sm">range:</span>
              <Input
                type="date"
                value={filterStart}
                onChange={(e) => setFilterStart(e.target.value)}
                className="w-36 h-8 text-sm"
                placeholder="From"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <Input
                type="date"
                value={filterEnd}
                onChange={(e) => setFilterEnd(e.target.value)}
                className="w-36 h-8 text-sm"
                placeholder="To"
              />
              {(filterStart || filterEnd) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 text-muted-foreground hover:text-foreground gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                disabled={filteredDeliveries.length === 0}
                className="flex items-center gap-1.5 h-8"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading records…</div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No delivery records found for the selected date.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Delivery Boy</TableHead>
                    <TableHead>Qty (L)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>WhatsApp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((d) => (
                    <TableRow key={d.id.toString()}>
                      <TableCell className="text-sm">
                        {nanosecondsToDate(d.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{getCustomerName(d.customerId)}</TableCell>
                      <TableCell className="text-sm">{d.deliveryBoyName}</TableCell>
                      <TableCell className="text-sm">{d.quantityLiters.toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            d.status === Variant_missed_delivered.delivered
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {d.status === Variant_missed_delivered.delivered ? 'Delivered' : 'Missed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {d.notes || '—'}
                      </TableCell>
                      <TableCell>
                        {d.status === Variant_missed_delivered.delivered && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-farm-green hover:text-farm-green hover:bg-farm-green/10"
                            onClick={() => {
                              const customer = getCustomer(d.customerId);
                              if (customer) {
                                setWhatsAppModalData({ customer, delivery: d });
                                setWhatsAppModalOpen(true);
                              }
                            }}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <WhatsAppMessageModal
        open={whatsAppModalOpen}
        onOpenChange={setWhatsAppModalOpen}
        customer={whatsAppModalData?.customer ?? null}
        delivery={whatsAppModalData?.delivery ?? null}
      />
    </div>
  );
}
