import { useState } from 'react';
import { Truck, Plus, Filter, MessageCircle } from 'lucide-react';
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
  useAddDeliveryRecord,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import WhatsAppMessageModal from '../components/WhatsAppMessageModal';
import type { DeliveryRecord, Customer } from '../backend';
import { Variant_missed_delivered } from '../backend';

export default function DeliveryReports() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: customers = [] } = useGetCustomers();
  const addDeliveryRecord = useAddDeliveryRecord();

  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const { data: deliveries = [], isLoading } = useGetDeliveryRecordsByDate(
    new Date(filterDate || new Date().toISOString().split('T')[0]),
  );

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
      date: new Date(formDate),
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

  const totalDelivered = deliveries.filter(
    (d) => d.status === Variant_missed_delivered.delivered,
  ).length;
  const totalMissed = deliveries.filter(
    (d) => d.status === Variant_missed_delivered.missed,
  ).length;
  const totalLiters = deliveries
    .filter((d) => d.status === Variant_missed_delivered.delivered)
    .reduce((sum, d) => sum + d.quantityLiters, 0);

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

        {/* Summary Cards */}
        <div className={`${isAuthenticated ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Delivered', value: totalDelivered, color: 'text-farm-green' },
              { label: 'Missed', value: totalMissed, color: 'text-destructive' },
              { label: 'Total Liters', value: `${totalLiters.toFixed(1)}L`, color: 'text-farm-sky' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Label>Filter by Date</Label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-40 h-8 text-sm ml-auto"
                />
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            Delivery Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading deliveries…</div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No deliveries found for the selected date.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Delivery Boy</TableHead>
                    <TableHead>Quantity (L)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((d) => (
                    <TableRow key={d.id.toString()}>
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
                            title="Send WhatsApp"
                            onClick={() => {
                              const customer = getCustomer(d.customerId);
                              if (customer) {
                                setWhatsAppModalData({ customer, delivery: d });
                                setWhatsAppModalOpen(true);
                              }
                            }}
                          >
                            <MessageCircle className="w-4 h-4 text-farm-green" />
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

      {/* WhatsApp Modal - always mounted */}
      <WhatsAppMessageModal
        open={whatsAppModalOpen}
        onOpenChange={setWhatsAppModalOpen}
        customer={whatsAppModalData?.customer ?? null}
        delivery={whatsAppModalData?.delivery ?? null}
      />
    </div>
  );
}
