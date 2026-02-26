import { OrderStatus, CattleOrder } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  orders: CattleOrder[];
  isLoading: boolean;
}

function getStatusClass(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-800';
    case OrderStatus.Confirmed: return 'bg-blue-100 text-blue-800';
    case OrderStatus.OutForDelivery: return 'bg-purple-100 text-purple-800';
    case OrderStatus.Delivered: return 'bg-green-100 text-green-800';
    case OrderStatus.Cancelled: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function CustomerMyDeliveries({ orders, isLoading }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          My Orders & Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No orders yet</p>
            <p className="text-sm mt-1">Place your first order from the Place Order tab.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Cattle Tag</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...orders]
                  .sort((a, b) => Number(b.orderDate) - Number(a.orderDate))
                  .map((order) => (
                    <TableRow key={order.orderId.toString()}>
                      <TableCell className="font-mono text-xs">
                        #{order.orderId.toString()}
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {order.cattleTagNumber}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(Number(order.orderDate) / 1_000_000), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                        {order.deliveryNotes || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
