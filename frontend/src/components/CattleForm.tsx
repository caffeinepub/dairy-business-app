import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import type { Cattle, HealthStatus } from '../backend';
import { dateToNanoseconds, nanosecondsToDate } from '../hooks/useQueries';

interface CattleFormProps {
  initialValues?: Cattle;
  onSubmit: (data: {
    breed: string;
    ageMonths: bigint;
    dailyMilkProductionLiters: number;
    healthStatus: HealthStatus;
    purchaseDate: bigint;
    purchaseCost: number;
    notes: string;
    activeStatus: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function CattleForm({ initialValues, onSubmit, isLoading }: CattleFormProps) {
  const [breed, setBreed] = useState(initialValues?.breed ?? '');
  const [ageMonths, setAgeMonths] = useState(
    initialValues ? initialValues.ageMonths.toString() : '',
  );
  const [dailyMilk, setDailyMilk] = useState(
    initialValues ? initialValues.dailyMilkProductionLiters.toString() : '',
  );
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'sick' | 'recovered'>(
    initialValues
      ? (initialValues.healthStatus.__kind__ as 'healthy' | 'sick' | 'recovered')
      : 'healthy',
  );
  const [sickCondition, setSickCondition] = useState(
    initialValues?.healthStatus.__kind__ === 'sick'
      ? initialValues.healthStatus.sick.condition
      : '',
  );
  const [sickTreatment, setSickTreatment] = useState(
    initialValues?.healthStatus.__kind__ === 'sick'
      ? initialValues.healthStatus.sick.treatment
      : '',
  );
  const [purchaseDate, setPurchaseDate] = useState(() => {
    if (initialValues) {
      return nanosecondsToDate(initialValues.purchaseDate).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [purchaseCost, setPurchaseCost] = useState(
    initialValues ? initialValues.purchaseCost.toString() : '',
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [activeStatus, setActiveStatus] = useState(initialValues?.activeStatus ?? true);

  const buildHealthStatus = (): HealthStatus => {
    if (healthStatus === 'sick') {
      return {
        __kind__: 'sick',
        sick: {
          condition: sickCondition,
          medications: [],
          treatment: sickTreatment,
        },
      };
    }
    if (healthStatus === 'recovered') {
      return { __kind__: 'recovered', recovered: null };
    }
    return { __kind__: 'healthy', healthy: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      breed,
      ageMonths: BigInt(ageMonths),
      dailyMilkProductionLiters: parseFloat(dailyMilk),
      healthStatus: buildHealthStatus(),
      purchaseDate: dateToNanoseconds(new Date(purchaseDate)),
      purchaseCost: parseFloat(purchaseCost),
      notes,
      activeStatus,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="breed">Breed</Label>
        <Input
          id="breed"
          placeholder="e.g. Holstein, Jersey"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="age">Age (months)</Label>
          <Input
            id="age"
            type="number"
            min="0"
            placeholder="e.g. 24"
            value={ageMonths}
            onChange={(e) => setAgeMonths(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="daily-milk">Daily Milk (L)</Label>
          <Input
            id="daily-milk"
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 15.0"
            value={dailyMilk}
            onChange={(e) => setDailyMilk(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Health Status</Label>
        <Select
          value={healthStatus}
          onValueChange={(v) => setHealthStatus(v as 'healthy' | 'sick' | 'recovered')}
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

      {healthStatus === 'sick' && (
        <div className="space-y-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Input
              placeholder="e.g. Mastitis"
              value={sickCondition}
              onChange={(e) => setSickCondition(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Treatment</Label>
            <Input
              placeholder="e.g. Antibiotics"
              value={sickTreatment}
              onChange={(e) => setSickTreatment(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="purchase-date">Purchase Date</Label>
          <Input
            id="purchase-date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="purchase-cost">Purchase Cost (₹)</Label>
          <Input
            id="purchase-cost"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 50000"
            value={purchaseCost}
            onChange={(e) => setPurchaseCost(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Optional notes…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      {initialValues && (
        <div className="flex items-center gap-3">
          <Switch
            id="active-status"
            checked={activeStatus}
            onCheckedChange={setActiveStatus}
          />
          <Label htmlFor="active-status">Active</Label>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving…' : initialValues ? 'Update Cattle' : 'Add Cattle'}
      </Button>
    </form>
  );
}
