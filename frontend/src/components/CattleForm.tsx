import { useState } from 'react';
import { useAddCattle, useUpdateCattle } from '../hooks/useAdminQueries';
import { Cattle, CattleAvailability, HealthStatus } from '../backend';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CattleFormProps {
  cattle: Cattle | null;
  onClose: () => void;
}

export default function CattleForm({ cattle, onClose }: CattleFormProps) {
  const addMutation = useAddCattle();
  const updateMutation = useUpdateCattle();
  const isEditing = !!cattle;

  const [tagNumber, setTagNumber] = useState(cattle?.tagNumber ?? '');
  const [breed, setBreed] = useState(cattle?.breed ?? '');
  const [dateOfPurchase, setDateOfPurchase] = useState(
    cattle
      ? new Date(Number(cattle.dateOfPurchase) / 1_000_000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  );
  const [purchasePrice, setPurchasePrice] = useState(
    cattle?.purchasePrice.toString() ?? '',
  );
  const [availability, setAvailability] = useState<CattleAvailability>(
    cattle?.availability ?? CattleAvailability.Available,
  );
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(
    cattle?.healthStatus ?? HealthStatus.Healthy,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPending = addMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!tagNumber.trim()) newErrors.tagNumber = 'Tag number is required';
    if (!breed.trim()) newErrors.breed = 'Breed is required';
    if (!dateOfPurchase) newErrors.dateOfPurchase = 'Date of purchase is required';
    if (!purchasePrice || isNaN(parseFloat(purchasePrice)) || parseFloat(purchasePrice) < 0) {
      newErrors.purchasePrice = 'Valid purchase price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dateMs = new Date(dateOfPurchase).getTime();
    const dateNs = BigInt(dateMs) * BigInt(1_000_000);

    try {
      if (isEditing && cattle) {
        await updateMutation.mutateAsync({
          id: cattle.id,
          tagNumber: tagNumber.trim(),
          breed: breed.trim(),
          dateOfPurchase: dateNs,
          purchasePrice: parseFloat(purchasePrice),
          availability,
          healthStatus,
        });
        toast.success(`Cattle record "${tagNumber}" updated successfully`);
      } else {
        await addMutation.mutateAsync({
          tagNumber: tagNumber.trim(),
          breed: breed.trim(),
          dateOfPurchase: dateNs,
          purchasePrice: parseFloat(purchasePrice),
          availability,
          healthStatus,
        });
        toast.success(`Cattle record "${tagNumber}" added successfully`);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save cattle record';
      toast.error(msg);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Cattle Record' : 'Add Cattle Record'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tagNumber">Tag Number *</Label>
              <Input
                id="tagNumber"
                value={tagNumber}
                onChange={(e) => { setTagNumber(e.target.value); setErrors((p) => ({ ...p, tagNumber: '' })); }}
                placeholder="e.g. TAG-001"
              />
              {errors.tagNumber && <p className="text-xs text-destructive">{errors.tagNumber}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="breed">Breed *</Label>
              <Input
                id="breed"
                value={breed}
                onChange={(e) => { setBreed(e.target.value); setErrors((p) => ({ ...p, breed: '' })); }}
                placeholder="e.g. Holstein"
              />
              {errors.breed && <p className="text-xs text-destructive">{errors.breed}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dateOfPurchase">Date of Purchase *</Label>
              <Input
                id="dateOfPurchase"
                type="date"
                value={dateOfPurchase}
                onChange={(e) => { setDateOfPurchase(e.target.value); setErrors((p) => ({ ...p, dateOfPurchase: '' })); }}
              />
              {errors.dateOfPurchase && <p className="text-xs text-destructive">{errors.dateOfPurchase}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="purchasePrice">Purchase Price (₹) *</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                value={purchasePrice}
                onChange={(e) => { setPurchasePrice(e.target.value); setErrors((p) => ({ ...p, purchasePrice: '' })); }}
                placeholder="e.g. 50000"
              />
              {errors.purchasePrice && <p className="text-xs text-destructive">{errors.purchasePrice}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Availability *</Label>
              <Select
                value={availability}
                onValueChange={(v) => setAvailability(v as CattleAvailability)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CattleAvailability.Available}>Available</SelectItem>
                  <SelectItem value={CattleAvailability.Reserved}>Reserved</SelectItem>
                  <SelectItem value={CattleAvailability.Sold}>Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Health Status *</Label>
              <Select
                value={healthStatus}
                onValueChange={(v) => setHealthStatus(v as HealthStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HealthStatus.Healthy}>Healthy</SelectItem>
                  <SelectItem value={HealthStatus.Sick}>Sick</SelectItem>
                  <SelectItem value={HealthStatus.Recovered}>Recovered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update'
              ) : (
                'Add Cattle'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
