import { useState } from 'react';
import { Package, Plus, Edit2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import InventoryForm from '../components/InventoryForm';
import type { InventoryItem } from '../lib/localTypes';

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Cattle Feed (Premium)', category: 'Feed', quantity: 500, unit: 'kg', lowStockThreshold: 100 },
  { id: 2, name: 'Hay Bales', category: 'Feed', quantity: 80, unit: 'bales', lowStockThreshold: 20 },
  { id: 3, name: 'Antibiotics (Penicillin)', category: 'Medicine', quantity: 15, unit: 'vials', lowStockThreshold: 5 },
  { id: 4, name: 'Vitamins & Supplements', category: 'Medicine', quantity: 30, unit: 'bottles', lowStockThreshold: 10 },
  { id: 5, name: 'Milk Cans (10L)', category: 'Supplies', quantity: 25, unit: 'units', lowStockThreshold: 8 },
  { id: 6, name: 'Cleaning Disinfectant', category: 'Supplies', quantity: 12, unit: 'liters', lowStockThreshold: 5 },
];

export default function InventoryManagement() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const lowStockItems = inventory.filter((i) => i.quantity <= i.lowStockThreshold);

  const handleAddItem = (data: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...data,
      id: Math.max(0, ...inventory.map((i) => i.id)) + 1,
    };
    setInventory((prev) => [...prev, newItem]);
    setAddDialogOpen(false);
  };

  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)),
    );
    setUpdateDialogOpen(false);
    setEditingItem(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Feed': return 'bg-farm-green/20 text-farm-green border-farm-green/30';
      case 'Medicine': return 'bg-farm-sky/20 text-farm-sky border-farm-sky/30';
      case 'Supplies': return 'bg-farm-brown/20 text-farm-brown border-farm-brown/30';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Inventory Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track feed, medicine, and supplies
          </p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Low Stock Alert — {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              {lowStockItems.map((i) => i.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: inventory.length },
          { label: 'Low Stock', value: lowStockItems.length },
          { label: 'Feed Items', value: inventory.filter((i) => i.category === 'Feed').length },
          { label: 'Medicine', value: inventory.filter((i) => i.category === 'Medicine').length },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  {isAuthenticated && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => {
                  const isLow = item.quantity <= item.lowStockThreshold;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(item.category)} variant="outline">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={isLow ? 'text-destructive font-bold' : ''}>
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                      <TableCell>
                        {isLow ? (
                          <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">OK</Badge>
                        )}
                      </TableCell>
                      {isAuthenticated && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingItem(item);
                              setUpdateDialogOpen(true);
                            }}
                            title="Update quantity"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <InventoryForm mode="add" onSubmit={handleAddItem} />
        </DialogContent>
      </Dialog>

      {/* Update Quantity Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Quantity</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <InventoryForm
              mode="update"
              item={editingItem}
              onSubmit={(data) => handleUpdateQuantity(editingItem.id, data.quantity)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
