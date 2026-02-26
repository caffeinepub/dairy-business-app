import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { OrderStatus, type CattleOrder } from '../backend';
import { PackageSearch } from 'lucide-react';

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

interface Props {
  orders: CattleOrder[];
  isLoading: boolean;
}

export default function CustomerMyDeliveries({ orders, isLoading }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">My Orders & Deliveries</h2>
        <p className="text-sm text-muted-foreground">{orders.length} order(s) placed</p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Order ID</TableHead>
              <TableHead>Cattle Tag</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivery Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <PackageSearch className="h-10 w-10 opacity-40" />
                    <p className="font-medium">No orders yet</p>
                    <p className="text-sm">Place your first order from the Place Order tab.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.orderId.toString()} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-sm">#{o.orderId.toString()}</TableCell>
                  <TableCell className="font-mono font-medium">{o.cattleTagNumber}</TableCell>
                  <TableCell>{new Date(Number(o.orderDate) / 1_000_000).toLocaleDateString()}</TableCell>
                  <TableCell>{statusBadge(o.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.deliveryNotes || '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
