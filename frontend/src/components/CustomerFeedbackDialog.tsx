import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSubmitFeedback } from '../hooks/useQueries';
import { nanosecondsToDate } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { DeliveryRecord } from '../backend';
import { AlertTriangle, Calendar, Droplets } from 'lucide-react';

interface CustomerFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  delivery: DeliveryRecord | null;
}

export default function CustomerFeedbackDialog({
  open,
  onClose,
  delivery,
}: CustomerFeedbackDialogProps) {
  const [message, setMessage] = useState('');
  const submitFeedback = useSubmitFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery || !message.trim()) return;

    try {
      await submitFeedback.mutateAsync({
        deliveryId: delivery.id,
        message: message.trim(),
      });
      toast.success('Feedback submitted! Our team will investigate and follow up.');
      setMessage('');
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      if (errorMsg.includes('Unauthorized')) {
        toast.error('You are not authorized to submit feedback for this delivery.');
      } else if (errorMsg.includes('Can only submit feedback for delivered status')) {
        toast.error('Feedback can only be submitted for deliveries marked as Delivered.');
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <DialogTitle>Report Delivery Issue</DialogTitle>
          </div>
          <DialogDescription>
            If this delivery was marked as "Delivered" but you did not receive it, please describe
            the issue below. Our admin team will investigate.
          </DialogDescription>
        </DialogHeader>

        {delivery && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Delivery Date:{' '}
                <span className="text-foreground font-medium">
                  {nanosecondsToDate(delivery.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Droplets className="w-4 h-4" />
              <span>
                Quantity:{' '}
                <span className="text-foreground font-medium">
                  {delivery.quantityLiters.toFixed(1)} L
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge className="bg-farm-green/20 text-farm-green border-farm-green/30 text-xs">
                Delivered
              </Badge>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Describe the Issue</Label>
            <Textarea
              id="feedback-message"
              placeholder="e.g., I was home all day but no delivery arrived. The delivery was not received at my address."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              disabled={submitFeedback.isPending}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitFeedback.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!message.trim() || submitFeedback.isPending}
              className="bg-warning hover:bg-warning/90 text-warning-foreground"
            >
              {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
