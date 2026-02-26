import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { CustomerAccount } from '../backend';

interface CustomerFormProps {
  initialData?: CustomerAccount;
  onSubmit: (data: {
    name: string;
    phone: string;
    address: string;
    username: string;
    passwordHash: string;
    isActive: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CustomerForm({ initialData, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const submitting = useRef(false);
  const [name, setName] = useState(initialData?.name ?? '');
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [address, setAddress] = useState(initialData?.address ?? '');
  const [username, setUsername] = useState(initialData?.username ?? '');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    try {
      await onSubmit({
        name,
        phone,
        address,
        username,
        passwordHash: password || (initialData?.passwordHash ?? ''),
        isActive,
      });
    } finally {
      submitting.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Full Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Customer name" />
        </div>
        <div className="space-y-1">
          <Label>Phone *</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+91 XXXXX XXXXX" />
        </div>
        <div className="space-y-1 col-span-2">
          <Label>Address *</Label>
          <Input value={address} onChange={e => setAddress(e.target.value)} required placeholder="Full address" />
        </div>
        <div className="space-y-1">
          <Label>Username *</Label>
          <Input value={username} onChange={e => setUsername(e.target.value)} required placeholder="Login username" />
        </div>
        <div className="space-y-1">
          <Label>{initialData ? 'New Password (leave blank to keep)' : 'Password *'}</Label>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={!initialData}
            placeholder={initialData ? 'Leave blank to keep current' : 'Set password'}
          />
        </div>
        <div className="col-span-2 flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label>Account Active</Label>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? 'Saving...' : initialData ? 'Update Customer' : 'Add Customer'}
        </Button>
      </div>
    </form>
  );
}
