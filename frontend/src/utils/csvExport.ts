import { DeliveryRecord, Variant_missed_delivered } from '../backend';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function nanosecondsToDateStr(ns: bigint): string {
  const date = new Date(Number(ns / 1_000_000n));
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCustomerMonthlyCSV(
  customerName: string,
  month: number,
  year: number,
  records: DeliveryRecord[],
): void {
  const monthName = MONTHS[month - 1];
  const safeCustomerName = customerName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_');
  const filename = `${safeCustomerName}_${monthName}_${year}.csv`;

  const headers = ['Date', 'Quantity (L)', 'Status', 'Delivery Boy', 'Notes'];

  const rows = records.map((r) => [
    escapeCsvField(nanosecondsToDateStr(r.date)),
    escapeCsvField(r.quantityLiters.toFixed(2)),
    escapeCsvField(r.status === Variant_missed_delivered.delivered ? 'Delivered' : 'Missed'),
    escapeCsvField(r.deliveryBoyName),
    escapeCsvField(r.notes || ''),
  ]);

  // Summary rows
  const deliveredRecords = records.filter((r) => r.status === Variant_missed_delivered.delivered);
  const totalLiters = deliveredRecords.reduce((sum, r) => sum + r.quantityLiters, 0);
  const deliveredCount = deliveredRecords.length;
  const missedCount = records.length - deliveredCount;

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
    '',
    `Summary for ${customerName} - ${monthName} ${year}`,
    `Total Deliveries,${records.length}`,
    `Delivered,${deliveredCount}`,
    `Missed,${missedCount}`,
    `Total Liters Delivered,${totalLiters.toFixed(2)}`,
  ];

  const csvContent = csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
