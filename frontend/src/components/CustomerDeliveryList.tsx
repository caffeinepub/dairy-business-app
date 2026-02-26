import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrderStatus, type CattleOrder } from '../backend';
import { PackageSearch } from 'lucide-react';

interface Props {
  orders: CattleOrder[];
  isLoading?: boolean;
}

function statusBadge(s: OrderStatus) {
  const map: Record<string, { label: string; className: string }> = {
    [OrderStatus.Pending]: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    [OrderStatus.Confirmed]: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
    [OrderStatus.OutForDelivery]: { label: 'Out for Delivery', className: 'bg-purple-100 text-purple-800' },
    [OrderStatus.Delivered]: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
    [OrderStatus.Cancelled]: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  };
  const { label, className } = map[String(s)] ?? { label: String(s), className: '' };
  return <Badge className={className}>{label}</Badge>;
}

export default function CustomerDeliveryList({ orders, isLoading }: Props) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <PackageSearch className="h-10 w-10 opacity-40" />
        <p className="font-medium">No orders yet</p>
        <p className="text-sm">Place your first order from the Place Order tab.</p>
      </div>
    );
  }

  return (
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
        {orders.map(o => (
          <TableRow key={o.orderId.toString()}>
            <TableCell className="font-mono">#{o.orderId.toString()}</TableCell>
            <TableCell className="font-mono">{o.cattleTagNumber}</TableCell>
            <TableCell>{new Date(Number(o.orderDate) / 1_000_000).toLocaleDateString()}</TableCell>
            <TableCell>{statusBadge(o.status)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{o.deliveryNotes || '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
