import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { CattleAvailability, type Cattle } from '../backend';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

interface Props {
  customerId: bigint;
}

export default function CustomerPlaceOrder({ customerId }: Props) {
  const { actor, isFetching } = useActor();
  const qc = useQueryClient();
  const [selectedTag, setSelectedTag] = useState('');
  const [notes, setNotes] = useState('');

  const { data: allCattle = [], isLoading } = useQuery<Cattle[]>({
    queryKey: ['customer', 'available-cattle'],
    queryFn: async () => {
      if (!actor) return [];
      const all = await actor.getAllCattle();
      return all.filter(c => c.availability === CattleAvailability.Available);
    },
    enabled: !!actor && !isFetching,
  });

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!selectedTag) throw new Error('Please select a cattle');
      return actor.placeOrder(customerId, selectedTag, notes);
    },
    onSuccess: () => {
      toast.success('Order placed successfully!');
      setSelectedTag('');
      setNotes('');
      qc.invalidateQueries({ queryKey: ['customer', 'my-orders'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to place order'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    placeOrder.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Place an Order</h2>
        <p className="text-sm text-muted-foreground">Select available cattle and place your order.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      ) : allCattle.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <CardTitle className="text-base mb-1">No Cattle Available</CardTitle>
            <CardDescription>There are no cattle available for order at this time. Please check back later.</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Order</CardTitle>
            <CardDescription>{allCattle.length} cattle available</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Select Cattle *</Label>
                <Select value={selectedTag} onValueChange={setSelectedTag} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose available cattle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allCattle.map(c => (
                      <SelectItem key={c.id.toString()} value={c.tagNumber}>
                        {c.tagNumber} — {c.breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Delivery Notes</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special delivery instructions..."
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                disabled={placeOrder.isPending || !selectedTag}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
