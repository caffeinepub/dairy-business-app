import { useEffect, useState } from 'react';
import { MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Customer, DeliveryRecord } from '../backend';
import { formatWhatsAppMessage, generateWhatsAppUrl } from '../utils/whatsappMessageFormatter';
import { nanosecondsToDate } from '../hooks/useQueries';

interface WhatsAppMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  delivery: DeliveryRecord | null;
}

export default function WhatsAppMessageModal({
  open,
  onOpenChange,
  customer,
  delivery,
}: WhatsAppMessageModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!customer || !delivery) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>WhatsApp Message</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">No delivery data available.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const deliveryDate = nanosecondsToDate(delivery.date);
  const isValidDate = !isNaN(deliveryDate.getTime());
  const message = formatWhatsAppMessage({
    customerName: customer.name,
    date: isValidDate ? deliveryDate : new Date(),
    quantityLiters: delivery.quantityLiters,
    deliveryBoyName: delivery.deliveryBoyName,
  });

  const whatsAppUrl = generateWhatsAppUrl(customer.phone, message);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-farm-green" />
            WhatsApp Delivery Confirmation
          </DialogTitle>
          <DialogDescription>
            Send a delivery confirmation to {customer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{customer.name}</Badge>
            {customer.phone && (
              <Badge variant="outline" className="font-mono">
                {customer.phone}
              </Badge>
            )}
            <Badge variant="outline">{delivery.quantityLiters.toFixed(1)}L</Badge>
          </div>

          {/* Message Preview */}
          <div className="bg-farm-green/5 border border-farm-green/20 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Message Preview</p>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {whatsAppUrl && (
              <Button
                className="flex-1 gap-2 bg-farm-green hover:bg-farm-green/90 text-white"
                onClick={() => window.open(whatsAppUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Send via WhatsApp
              </Button>
            )}
            <Button variant="outline" className="gap-2" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-farm-green" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
