import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { Customer } from '../backend';

interface CustomerFormProps {
    mode: 'add' | 'edit';
    initialValues?: Customer;
    onSubmit: (data: { name: string; address: string; phone: string; activeStatus: boolean }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function CustomerForm({ mode, initialValues, onSubmit, onCancel, isLoading }: CustomerFormProps) {
    const [name, setName] = useState(initialValues?.name ?? '');
    const [address, setAddress] = useState(initialValues?.address ?? '');
    const [phone, setPhone] = useState(initialValues?.phone ?? '');
    const [activeStatus, setActiveStatus] = useState(initialValues?.activeStatus ?? true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({
            name: name.trim(),
            address: address.trim(),
            phone: phone.trim(),
            activeStatus,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="customer-name">Customer Name *</Label>
                <Input
                    id="customer-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    required
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="customer-address">Address</Label>
                <Input
                    id="customer-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 12 Main Street, Village"
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="customer-phone">Phone</Label>
                <Input
                    id="customer-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                    <p className="text-sm font-medium text-foreground">Active Customer</p>
                    <p className="text-xs text-muted-foreground">Receives daily milk delivery</p>
                </div>
                <Switch
                    id="customer-active"
                    checked={activeStatus}
                    onCheckedChange={setActiveStatus}
                />
            </div>
            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {mode === 'add' ? 'Add Customer' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
