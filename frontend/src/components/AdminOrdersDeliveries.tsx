import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { useGetAllOrders, useUpdateOrderStatus, useGetAllCustomers } from '../hooks/useAdminQueries';
import { OrderStatus, type CattleOrder } from '../backend';

function statusBadge(s: OrderStatus) {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    [OrderStatus.Pending]: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    [OrderStatus.Confirmed]: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    [OrderStatus.OutForDelivery]: { label: 'Out for Delivery', className: 'bg-purple-100 text-purple-800 border-purple-200' },
    [OrderStatus.Delivered]: { label: 'Delivered', className: 'bg-green-100 text-green-800 border-green-200' },
    [OrderStatus.Cancelled]: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
  };
  const { label, className } = map[s] || { label: String(s), className: '' };
  return <Badge className={className}>{label}</Badge>;
}

export default function AdminOrdersDeliveries() {
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: customers = [] } = useGetAllCustomers();
  const updateStatus = useUpdateOrderStatus();

  const [updateDialog, setUpdateDialog] = useState<CattleOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.Pending);
  const [notes, setNotes] = useState('');

  const customerMap = new Map(customers.map(c => [c.id.toString(), c.name]));

  const openUpdate = (order: CattleOrder) => {
    setUpdateDialog(order);
    setNewStatus(order.status);
    setNotes(order.deliveryNotes);
  };

  const handleUpdate = async () => {
    if (!updateDialog) return;
    await updateStatus.mutateAsync({ orderId: updateDialog.orderId, status: newStatus, deliveryNotes: notes });
    setUpdateDialog(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-admin-dark">Orders & Deliveries</h2>
          <p className="text-sm text-muted-foreground">{orders.length} orders total</p>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Cattle Tag</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivery Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No orders found yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.orderId.toString()} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm">#{o.orderId.toString()}</TableCell>
                  <TableCell className="font-medium">{customerMap.get(o.customerId.toString()) || `Customer #${o.customerId}`}</TableCell>
                  <TableCell className="font-mono">{o.cattleTagNumber}</TableCell>
                  <TableCell>{new Date(Number(o.orderDate) / 1_000_000).toLocaleDateString()}</TableCell>
                  <TableCell>{statusBadge(o.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{o.deliveryNotes || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openUpdate(o)} className="gap-1 h-8">
                      <RefreshCw className="h-3 w-3" /> Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={!!updateDialog} onOpenChange={() => setUpdateDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Order</Label>
              <p className="text-sm text-muted-foreground">
                #{updateDialog?.orderId.toString()} — {updateDialog?.cattleTagNumber}
              </p>
            </div>
            <div className="space-y-1">
              <Label>New Status *</Label>
              <Select value={newStatus} onValueChange={v => setNewStatus(v as OrderStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={OrderStatus.Pending}>Pending</SelectItem>
                  <SelectItem value={OrderStatus.Confirmed}>Confirmed</SelectItem>
                  <SelectItem value={OrderStatus.OutForDelivery}>Out for Delivery</SelectItem>
                  <SelectItem value={OrderStatus.Delivered}>Delivered</SelectItem>
                  <SelectItem value={OrderStatus.Cancelled}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Delivery Notes</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add delivery notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialog(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateStatus.isPending} className="bg-primary hover:bg-primary/90">
              {updateStatus.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
