import { useState } from 'react';
import { useGetAllOrders, useGetAllCustomers, useUpdateOrderStatus } from '../hooks/useAdminQueries';
import { CattleOrder, OrderStatus, CustomerAccount } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Truck, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

function getStatusBadge(status: OrderStatus) {
  const classes: Record<string, string> = {
    [OrderStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.Confirmed]: 'bg-blue-100 text-blue-800',
    [OrderStatus.OutForDelivery]: 'bg-purple-100 text-purple-800',
    [OrderStatus.Delivered]: 'bg-green-100 text-green-800',
    [OrderStatus.Cancelled]: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${classes[status] ?? 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

export default function AdminOrdersDeliveries() {
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const { data: customers = [] } = useGetAllCustomers();
  const updateMutation = useUpdateOrderStatus();

  const [editingOrder, setEditingOrder] = useState<CattleOrder | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.Pending);
  const [notes, setNotes] = useState('');

  const customerMap = new Map<string, CustomerAccount>(
    customers.map((c) => [c.id.toString(), c]),
  );

  const handleEdit = (order: CattleOrder) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setNotes(order.deliveryNotes);
  };

  const handleUpdate = async () => {
    if (!editingOrder) return;
    try {
      await updateMutation.mutateAsync({
        orderId: editingOrder.orderId,
        status: newStatus,
        deliveryNotes: notes,
      });
      toast.success('Order status updated');
      setEditingOrder(null);
    } catch {
      toast.error('Failed to update order');
    }
  };

  const sortedOrders = [...orders].sort(
    (a, b) => Number(b.orderDate) - Number(a.orderDate),
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            All Orders & Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cattle Tag</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => {
                    const customer = customerMap.get(order.customerId.toString());
                    return (
                      <TableRow key={order.orderId.toString()}>
                        <TableCell className="font-mono text-xs">
                          #{order.orderId.toString()}
                        </TableCell>
                        <TableCell>
                          {customer ? customer.name : `#${order.customerId.toString()}`}
                        </TableCell>
                        <TableCell className="font-mono">{order.cattleTagNumber}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(Number(order.orderDate) / 1_000_000), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                          {order.deliveryNotes || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(order)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order #{editingOrder?.orderId.toString()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(OrderStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Delivery Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add delivery notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
