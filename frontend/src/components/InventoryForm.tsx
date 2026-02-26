import { useState } from 'react';
import { useAddInventoryItem, useUpdateInventoryItem } from '../hooks/useAdminQueries';
import { InventoryItem } from '../backend';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryFormProps {
  item: InventoryItem | null;
  onClose: () => void;
}

const CATEGORIES = ['Feed', 'Medicine', 'Supplies', 'Equipment', 'Dairy', 'Other'];
const UNITS = ['kg', 'liters', 'bales', 'vials', 'bottles', 'units', 'bags', 'boxes', 'pieces'];

export default function InventoryForm({ item, onClose }: InventoryFormProps) {
  const addMutation = useAddInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const isEditing = !!item;

  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState(item?.category ?? 'Feed');
  const [quantity, setQuantity] = useState(item?.quantity.toString() ?? '');
  const [unit, setUnit] = useState(item?.unit ?? 'kg');
  const [lowStockThreshold, setLowStockThreshold] = useState(
    item?.lowStockThreshold.toString() ?? '10',
  );
  const [notes, setNotes] = useState(item?.notes ?? '');

  const isPending = addMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      category,
      quantity: parseFloat(quantity),
      unit,
      lowStockThreshold: parseFloat(lowStockThreshold) || 10,
      notes,
    };

    try {
      if (isEditing && item) {
        await updateMutation.mutateAsync({ id: item.id, ...data });
        toast.success('Item updated successfully');
      } else {
        await addMutation.mutateAsync(data);
        toast.success('Item added successfully');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save item');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inv-name">Item Name *</Label>
            <Input
              id="inv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cattle Feed"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Unit *</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="inv-qty">Quantity *</Label>
              <Input
                id="inv-qty"
                type="number"
                step="0.1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-threshold">Low Stock Threshold</Label>
              <Input
                id="inv-threshold"
                type="number"
                step="0.1"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-notes">Notes (optional)</Label>
            <Textarea
              id="inv-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Item'
              ) : (
                'Add Item'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
