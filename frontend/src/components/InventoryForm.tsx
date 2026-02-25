import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InventoryItem } from '../lib/localTypes';

interface InventoryFormAddProps {
  mode: 'add';
  onSubmit: (data: Omit<InventoryItem, 'id'>) => void;
  item?: never;
}

interface InventoryFormUpdateProps {
  mode: 'update';
  item: InventoryItem;
  onSubmit: (data: { quantity: number }) => void;
}

type InventoryFormProps = InventoryFormAddProps | InventoryFormUpdateProps;

const CATEGORIES = ['Feed', 'Medicine', 'Supplies'];
const UNITS = ['kg', 'liters', 'bales', 'vials', 'bottles', 'units', 'bags', 'boxes'];

export default function InventoryForm(props: InventoryFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Feed');
  const [quantity, setQuantity] = useState(
    props.mode === 'update' ? props.item.quantity.toString() : '',
  );
  const [unit, setUnit] = useState('kg');
  const [lowStockThreshold, setLowStockThreshold] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (props.mode === 'add') {
      props.onSubmit({
        name,
        category,
        quantity: parseFloat(quantity),
        unit,
        lowStockThreshold: parseFloat(lowStockThreshold) || 10,
      });
    } else {
      props.onSubmit({ quantity: parseFloat(quantity) });
    }
  };

  if (props.mode === 'update') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Item</Label>
          <p className="text-sm font-medium text-foreground">{props.item.name}</p>
          <p className="text-xs text-muted-foreground">
            Current: {props.item.quantity} {props.item.unit}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-qty">New Quantity ({props.item.unit})</Label>
          <Input
            id="new-qty"
            type="number"
            step="0.1"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Update Quantity
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="item-name">Item Name</Label>
        <Input
          id="item-name"
          placeholder="e.g. Cattle Feed"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="item-qty">Quantity</Label>
          <Input
            id="item-qty"
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Unit</Label>
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

      <div className="space-y-1.5">
        <Label htmlFor="low-stock">Low Stock Threshold</Label>
        <Input
          id="low-stock"
          type="number"
          step="0.1"
          min="0"
          placeholder="e.g. 10"
          value={lowStockThreshold}
          onChange={(e) => setLowStockThreshold(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full">
        Add Item
      </Button>
    </form>
  );
}
