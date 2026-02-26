import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useResolveFeedback } from '../hooks/useQueries';
import { nanosecondsToDate } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { CustomerFeedback } from '../backend';
import { CheckCircle2, Calendar, MessageSquare, User } from 'lucide-react';

interface ResolveFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  feedback: CustomerFeedback | null;
}

export default function ResolveFeedbackDialog({
  open,
  onClose,
  feedback,
}: ResolveFeedbackDialogProps) {
  const resolveFeedback = useResolveFeedback();

  const handleResolve = async () => {
    if (!feedback) return;

    try {
      await resolveFeedback.mutateAsync(feedback.feedbackId);
      toast.success('Feedback resolved successfully. Delivery notes have been updated.');
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      if (errorMsg.includes('Unauthorized')) {
        toast.error('Only admins can resolve feedback.');
      } else {
        toast.error('Failed to resolve feedback. Please try again.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-farm-green" />
            <DialogTitle>Resolve Customer Feedback</DialogTitle>
          </div>
          <DialogDescription>
            Review the customer's feedback below. Resolving will mark this issue as investigated and
            update the delivery notes.
          </DialogDescription>
        </DialogHeader>

        {feedback && (
          <div className="space-y-3 bg-muted/50 rounded-lg p-4 text-sm">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Customer Message</p>
                <p className="text-foreground leading-relaxed">{feedback.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Submitted:{' '}
                <span className="text-foreground">
                  {nanosecondsToDate(feedback.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>
                Delivery ID:{' '}
                <span className="text-foreground font-medium">
                  #{feedback.deliveryId.toString()}
                </span>
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={resolveFeedback.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleResolve}
            disabled={resolveFeedback.isPending}
            className="bg-farm-green hover:bg-farm-green/90 text-white"
          >
            {resolveFeedback.isPending ? 'Resolving...' : 'Mark as Resolved'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
