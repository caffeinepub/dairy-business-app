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
import { Loader2 } from 'lucide-react';

const CATEGORIES = ['Feed', 'Medicine', 'Equipment', 'Supplies', 'Other'];
const UNITS = ['kg', 'liters', 'units', 'bags', 'bottles', 'boxes', 'packs'];

interface AddInventoryFormProps {
    mode: 'add';
    onSubmit: (data: { name: string; category: string; quantity: number; unit: string }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

interface UpdateInventoryFormProps {
    mode: 'update';
    itemName: string;
    currentQuantity: number;
    onSubmit: (data: { quantity: number }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

type InventoryFormProps = AddInventoryFormProps | UpdateInventoryFormProps;

export default function InventoryForm(props: InventoryFormProps) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Feed');
    const [quantity, setQuantity] = useState(
        props.mode === 'update' ? String(props.currentQuantity) : ''
    );
    const [unit, setUnit] = useState('kg');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty < 0) return;

        if (props.mode === 'add') {
            if (!name.trim()) return;
            props.onSubmit({ name: name.trim(), category, quantity: qty, unit });
        } else {
            props.onSubmit({ quantity: qty });
        }
    };

    if (props.mode === 'update') {
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Updating quantity for: <span className="font-semibold text-foreground">{props.itemName}</span>
                </p>
                <div className="space-y-1.5">
                    <Label htmlFor="inv-quantity">New Quantity</Label>
                    <Input
                        id="inv-quantity"
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>
                <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={props.isLoading} className="flex-1">
                        {props.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Update Quantity
                    </Button>
                    <Button type="button" variant="outline" onClick={props.onCancel} disabled={props.isLoading}>
                        Cancel
                    </Button>
                </div>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="inv-name">Item Name</Label>
                <Input
                    id="inv-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hay Bales"
                    required
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="inv-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="inv-category">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="inv-quantity">Quantity</Label>
                    <Input
                        id="inv-quantity"
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="0"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="inv-unit">Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger id="inv-unit">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {UNITS.map((u) => (
                                <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={props.isLoading} className="flex-1">
                    {props.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Item
                </Button>
                <Button type="button" variant="outline" onClick={props.onCancel} disabled={props.isLoading}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
