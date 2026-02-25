export interface WhatsAppMessageParams {
  customerName: string;
  date: Date;
  quantityLiters: number;
  deliveryBoyName: string;
}

export function formatWhatsAppMessage(params: WhatsAppMessageParams): string {
  const { customerName, date, quantityLiters, deliveryBoyName } = params;
  const dateStr = date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `🥛 *AO Farms — Delivery Confirmation*

Dear ${customerName},

Your milk delivery for *${dateStr}* has been completed successfully.

📦 *Quantity:* ${quantityLiters.toFixed(1)} Liters
🚴 *Delivered by:* ${deliveryBoyName}

Thank you for choosing AO Farms! 🌿

_For any queries, please contact us._`;
}

export function generateWhatsAppUrl(phone: string | undefined, message: string): string | null {
  if (!phone) return null;
  const sanitized = phone.replace(/\D/g, '');
  if (!sanitized) return null;
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}
