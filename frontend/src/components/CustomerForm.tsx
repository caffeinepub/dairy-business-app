import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { Customer } from '../backend';

export interface CustomerFormProps {
  initialValues?: Customer;
  onSubmit: (data: {
    name: string;
    address: string;
    phone: string;
    active: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function CustomerForm({ initialValues, onSubmit, isLoading }: CustomerFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [phone, setPhone] = useState(initialValues?.phone ?? '');
  const [active, setActive] = useState<boolean>(initialValues?.active ?? true);

  // Guard against double-submission
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent concurrent submissions
    if (isSubmittingRef.current || isLoading) return;
    isSubmittingRef.current = true;

    try {
      await onSubmit({ name, address, phone, active });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const disabled = isLoading || false;

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
          disabled={disabled}
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
          disabled={disabled}
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
          disabled={disabled}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="customer-active"
          checked={active}
          onCheckedChange={setActive}
          disabled={disabled}
        />
        <Label htmlFor="customer-active">Active</Label>
      </div>

      <Button type="submit" className="w-full" disabled={disabled}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving…
          </>
        ) : initialValues ? (
          'Update Customer'
        ) : (
          'Add Customer'
        )}
      </Button>
    </form>
  );
}
