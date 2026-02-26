import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CattleAvailability, HealthStatus, type Cattle } from '../backend';

interface CattleFormProps {
  initialData?: Cattle;
  onSubmit: (data: {
    tagNumber: string;
    breed: string;
    dateOfPurchase: bigint;
    milkingCapacity: number;
    purchasePrice: number;
    availability: CattleAvailability;
    healthStatus: HealthStatus;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CattleForm({ initialData, onSubmit, onCancel, isLoading }: CattleFormProps) {
  const submitting = useRef(false);

  const [tagNumber, setTagNumber] = useState(initialData?.tagNumber ?? '');
  const [breed, setBreed] = useState(initialData?.breed ?? '');
  const [dateOfPurchase, setDateOfPurchase] = useState(() => {
    if (initialData) {
      return new Date(Number(initialData.dateOfPurchase) / 1_000_000).toISOString().split('T')[0];
    }
    return '';
  });
  const [milkingCapacity, setMilkingCapacity] = useState(initialData?.milkingCapacity ?? 0);
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice ?? 0);
  const [availability, setAvailability] = useState<CattleAvailability>(
    initialData?.availability ?? CattleAvailability.Available
  );
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(
    initialData?.healthStatus ?? HealthStatus.Healthy
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    try {
      const dateMs = new Date(dateOfPurchase).getTime();
      const dateNs = BigInt(dateMs) * BigInt(1_000_000);
      await onSubmit({
        tagNumber,
        breed,
        dateOfPurchase: dateNs,
        milkingCapacity,
        purchasePrice,
        availability,
        healthStatus,
      });
    } finally {
      submitting.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Tag Number *</Label>
          <Input value={tagNumber} onChange={e => setTagNumber(e.target.value)} required placeholder="e.g. TAG-001" />
        </div>
        <div className="space-y-1">
          <Label>Breed *</Label>
          <Input value={breed} onChange={e => setBreed(e.target.value)} required placeholder="e.g. Holstein" />
        </div>
        <div className="space-y-1">
          <Label>Date of Purchase *</Label>
          <Input type="date" value={dateOfPurchase} onChange={e => setDateOfPurchase(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>Milking Capacity (L/day) *</Label>
          <Input
            type="number" step="0.1" min="0"
            value={milkingCapacity}
            onChange={e => setMilkingCapacity(parseFloat(e.target.value))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Purchase Price (₹) *</Label>
          <Input
            type="number" min="0"
            value={purchasePrice}
            onChange={e => setPurchasePrice(parseFloat(e.target.value))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Availability *</Label>
          <Select value={availability} onValueChange={v => setAvailability(v as CattleAvailability)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={CattleAvailability.Available}>Available</SelectItem>
              <SelectItem value={CattleAvailability.Reserved}>Reserved</SelectItem>
              <SelectItem value={CattleAvailability.Sold}>Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 col-span-2">
          <Label>Health Status *</Label>
          <Select value={healthStatus} onValueChange={v => setHealthStatus(v as HealthStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={HealthStatus.Healthy}>Healthy</SelectItem>
              <SelectItem value={HealthStatus.Sick}>Sick</SelectItem>
              <SelectItem value={HealthStatus.Recovered}>Recovered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? 'Saving...' : initialData ? 'Update Cattle' : 'Add Cattle'}
        </Button>
      </div>
    </form>
  );
}
