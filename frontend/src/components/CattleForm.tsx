import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Cattle, HealthStatus } from '../backend';
import { CattleStatus } from '../backend';

interface CattleFormProps {
  initialData?: Cattle;
  onSubmit: (data: {
    breed: string;
    ageMonths: bigint;
    dailyMilkProductionLiters: number;
    healthStatus: HealthStatus;
    purchaseDate: bigint;
    purchaseCost: number;
    notes: string;
    status: CattleStatus;
  }) => void;
  isLoading?: boolean;
}

export default function CattleForm({ initialData, onSubmit, isLoading }: CattleFormProps) {
  const submittingRef = useRef(false);

  const [breed, setBreed] = useState(initialData?.breed ?? '');
  const [ageMonths, setAgeMonths] = useState(
    initialData ? Number(initialData.ageMonths) : 0,
  );
  const [dailyMilk, setDailyMilk] = useState(
    initialData?.dailyMilkProductionLiters ?? 0,
  );
  const [healthStatusKind, setHealthStatusKind] = useState<'healthy' | 'sick' | 'recovered'>(
    initialData
      ? initialData.healthStatus.__kind__ === 'sick'
        ? 'sick'
        : initialData.healthStatus.__kind__ === 'recovered'
        ? 'recovered'
        : 'healthy'
      : 'healthy',
  );
  const [condition, setCondition] = useState(
    initialData?.healthStatus.__kind__ === 'sick'
      ? initialData.healthStatus.sick.condition
      : '',
  );
  const [treatment, setTreatment] = useState(
    initialData?.healthStatus.__kind__ === 'sick'
      ? initialData.healthStatus.sick.treatment
      : '',
  );
  const [medications, setMedications] = useState(
    initialData?.healthStatus.__kind__ === 'sick'
      ? initialData.healthStatus.sick.medications.join(', ')
      : '',
  );
  const [purchaseDate, setPurchaseDate] = useState(() => {
    if (initialData) {
      return new Date(Number(initialData.purchaseDate) / 1_000_000)
        .toISOString()
        .split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [purchaseCost, setPurchaseCost] = useState(initialData?.purchaseCost ?? 0);
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [status, setStatus] = useState<CattleStatus>(
    initialData?.status ?? CattleStatus.active,
  );

  const buildHealthStatus = (): HealthStatus => {
    if (healthStatusKind === 'sick') {
      return {
        __kind__: 'sick',
        sick: {
          condition,
          treatment,
          medications: medications
            .split(',')
            .map((m) => m.trim())
            .filter(Boolean),
        },
      };
    }
    if (healthStatusKind === 'recovered') {
      return { __kind__: 'recovered', recovered: null };
    }
    return { __kind__: 'healthy', healthy: null };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    const dateMs = new Date(purchaseDate).getTime();
    const dateNs = BigInt(dateMs) * 1_000_000n;

    onSubmit({
      breed,
      ageMonths: BigInt(ageMonths),
      dailyMilkProductionLiters: dailyMilk,
      healthStatus: buildHealthStatus(),
      purchaseDate: dateNs,
      purchaseCost,
      notes,
      status,
    });

    setTimeout(() => {
      submittingRef.current = false;
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Breed */}
      <div className="space-y-1">
        <Label htmlFor="breed">Breed</Label>
        <Input
          id="breed"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="e.g. Holstein"
          required
        />
      </div>

      {/* Age */}
      <div className="space-y-1">
        <Label htmlFor="ageMonths">Age (months)</Label>
        <Input
          id="ageMonths"
          type="number"
          min={0}
          value={ageMonths}
          onChange={(e) => setAgeMonths(Number(e.target.value))}
          required
        />
      </div>

      {/* Daily milk */}
      <div className="space-y-1">
        <Label htmlFor="dailyMilk">Daily Milk Production (L)</Label>
        <Input
          id="dailyMilk"
          type="number"
          min={0}
          step="0.1"
          value={dailyMilk}
          onChange={(e) => setDailyMilk(parseFloat(e.target.value))}
          required
        />
      </div>

      {/* Health status */}
      <div className="space-y-1">
        <Label>Health Status</Label>
        <Select
          value={healthStatusKind}
          onValueChange={(v) => setHealthStatusKind(v as 'healthy' | 'sick' | 'recovered')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="sick">Sick</SelectItem>
            <SelectItem value="recovered">Recovered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {healthStatusKind === 'sick' && (
        <>
          <div className="space-y-1">
            <Label htmlFor="condition">Condition</Label>
            <Input
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Describe the condition"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="treatment">Treatment</Label>
            <Input
              id="treatment"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Treatment plan"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="medications">Medications (comma-separated)</Label>
            <Input
              id="medications"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="e.g. Antibiotic A, Vitamin B"
            />
          </div>
        </>
      )}

      {/* Purchase date */}
      <div className="space-y-1">
        <Label htmlFor="purchaseDate">Purchase Date</Label>
        <Input
          id="purchaseDate"
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          required
        />
      </div>

      {/* Purchase cost */}
      <div className="space-y-1">
        <Label htmlFor="purchaseCost">Purchase Cost (₹)</Label>
        <Input
          id="purchaseCost"
          type="number"
          min={0}
          step="0.01"
          value={purchaseCost}
          onChange={(e) => setPurchaseCost(parseFloat(e.target.value))}
          required
        />
      </div>

      {/* Status */}
      <div className="space-y-1">
        <Label>Status</Label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as CattleStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CattleStatus.active}>Active</SelectItem>
            <SelectItem value={CattleStatus.inactive}>Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : initialData ? 'Update Cattle' : 'Add Cattle'}
      </Button>
    </form>
  );
}
