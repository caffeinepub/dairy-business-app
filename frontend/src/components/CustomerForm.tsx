import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Customer } from '../backend';

export interface CustomerFormProps {
  initialValues?: Customer;
  onSubmit: (data: {
    name: string;
    address: string;
    phone: string;
    activeStatus: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function CustomerForm({ initialValues, onSubmit, isLoading }: CustomerFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [phone, setPhone] = useState(initialValues?.phone ?? '');
  const [activeStatus, setActiveStatus] = useState(initialValues?.activeStatus ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, address, phone, activeStatus });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="customer-name">Name</Label>
        <Input
          id="customer-name"
          placeholder="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customer-address">Address</Label>
        <Input
          id="customer-address"
          placeholder="Delivery address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customer-phone">Phone</Label>
        <Input
          id="customer-phone"
          type="tel"
          placeholder="+91 XXXXX XXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {initialValues && (
        <div className="flex items-center gap-3">
          <Switch
            id="customer-active"
            checked={activeStatus}
            onCheckedChange={setActiveStatus}
          />
          <Label htmlFor="customer-active">Active</Label>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving…' : initialValues ? 'Update Customer' : 'Add Customer'}
      </Button>
    </form>
  );
}
