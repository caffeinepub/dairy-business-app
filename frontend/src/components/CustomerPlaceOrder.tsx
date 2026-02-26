import { useState } from 'react';
import { useGetAvailableCattle, usePlaceOrder } from '../hooks/useCustomerQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShoppingBag, Beef } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerPlaceOrderProps {
  customerId: bigint;
}

export default function CustomerPlaceOrder({ customerId }: CustomerPlaceOrderProps) {
  const { data: availableCattle = [], isLoading: cattleLoading } = useGetAvailableCattle();
  const placeOrderMutation = usePlaceOrder();

  const [selectedTag, setSelectedTag] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTag) {
      toast.error('Please select a cattle');
      return;
    }

    try {
      await placeOrderMutation.mutateAsync({
        customerId,
        cattleTagNumber: selectedTag,
        deliveryNotes,
      });
      // placeOrder returns void — show a generic success message
      setSuccessMsg('Your order has been placed successfully!');
      setSelectedTag('');
      setDeliveryNotes('');
      toast.success('Order placed successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      toast.error(msg);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-display flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Place New Order
        </CardTitle>
      </CardHeader>
      <CardContent>
        {successMsg && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Select Cattle *</Label>
            {cattleLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading available cattle...
              </div>
            ) : availableCattle.length === 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                <Beef className="h-4 w-4" />
                No cattle available for order at this time
              </div>
            ) : (
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Select available cattle..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCattle.map((c) => (
                    <SelectItem key={c.id.toString()} value={c.tagNumber}>
                      {c.tagNumber} — {c.breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Delivery Notes (optional)</Label>
            <Textarea
              id="notes"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Any special delivery instructions..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={placeOrderMutation.isPending || !selectedTag}
          >
            {placeOrderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Place Order
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
