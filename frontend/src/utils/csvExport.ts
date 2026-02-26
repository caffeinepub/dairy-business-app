import type { Customer, DeliveryRecord, MilkProductionRecord } from '../backend';
import { Variant_missed_delivered } from '../backend';

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string | number | boolean): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function nanosecondsToDateStr(ns: bigint): string {
  const date = new Date(Number(ns / 1_000_000n));
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Customer Monthly CSV (per-customer delivery records) ─────────────────────

export function downloadCustomerMonthlyCSV(
  deliveries: DeliveryRecord[],
  customerName: string,
  month: number,
  year: number,
) {
  const monthName = months[month - 1];
  const filename = `${customerName.replace(/[^a-z0-9]/gi, '_')}_${monthName}_${year}.csv`;

  const headers = ['Date', 'Quantity (L)', 'Delivery Person', 'Status', 'Notes'];
  const rows = deliveries.map((d) => [
    escapeCsvField(nanosecondsToDateStr(d.date)),
    escapeCsvField(d.quantityLiters.toFixed(2)),
    escapeCsvField(d.deliveryBoyName),
    escapeCsvField(d.status === Variant_missed_delivered.delivered ? 'Delivered' : 'Missed'),
    escapeCsvField(d.notes),
  ]);

  const totalDelivered = deliveries
    .filter((d) => d.status === Variant_missed_delivered.delivered)
    .reduce((s, d) => s + d.quantityLiters, 0);

  const summaryRow = [
    escapeCsvField('TOTAL'),
    escapeCsvField(totalDelivered.toFixed(2)),
    '',
    '',
    '',
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    summaryRow.join(','),
  ].join('\n');

  triggerDownload(csvContent, filename);
}

// ─── Milk Production Records CSV ──────────────────────────────────────────────

export function exportMilkProductionRecordsToCSV(records: MilkProductionRecord[]) {
  const filename = `milk_production_${new Date().toISOString().split('T')[0]}.csv`;

  const headers = ['ID', 'Date', 'Quantity (L)', 'Notes'];
  const rows = records.map((r) => [
    escapeCsvField(r.id.toString()),
    escapeCsvField(nanosecondsToDateStr(r.date)),
    escapeCsvField(r.quantityLiters.toFixed(2)),
    escapeCsvField(r.notes),
  ]);

  const total = records.reduce((s, r) => s + r.quantityLiters, 0);
  const summaryRow = ['TOTAL', '', escapeCsvField(total.toFixed(2)), ''];

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    summaryRow.join(','),
  ].join('\n');

  triggerDownload(csvContent, filename);
}

// ─── Customer Records CSV ─────────────────────────────────────────────────────

export function exportCustomerRecordsToCSV(customers: Customer[]) {
  const filename = `customers_${new Date().toISOString().split('T')[0]}.csv`;

  const headers = ['ID', 'Name', 'Address', 'Phone', 'Status'];
  const rows = customers.map((c) => [
    escapeCsvField(c.id.toString()),
    escapeCsvField(c.name),
    escapeCsvField(c.address),
    escapeCsvField(c.phone),
    escapeCsvField(c.active ? 'Active' : 'Inactive'),
  ]);

  const summaryRow = [
    escapeCsvField(`Total: ${customers.length}`),
    escapeCsvField(`Active: ${customers.filter((c) => c.active).length}`),
    '',
    '',
    '',
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    summaryRow.join(','),
  ].join('\n');

  triggerDownload(csvContent, filename);
}

// ─── Delivery Records CSV ─────────────────────────────────────────────────────

export function exportDeliveryRecordsToCSV(
  records: DeliveryRecord[],
  customers: Customer[],
  month: number,
  year: number,
) {
  const monthName = months[month - 1];
  const filename = `deliveries_${monthName}_${year}.csv`;

  const headers = ['ID', 'Date', 'Customer Principal', 'Delivery Person', 'Quantity (L)', 'Status', 'Notes'];
  const rows = records.map((r) => {
    const principalStr = r.customerPrincipal ? r.customerPrincipal.toString() : 'Unknown';
    return [
      escapeCsvField(r.id.toString()),
      escapeCsvField(nanosecondsToDateStr(r.date)),
      escapeCsvField(principalStr),
      escapeCsvField(r.deliveryBoyName),
      escapeCsvField(r.quantityLiters.toFixed(2)),
      escapeCsvField(r.status === Variant_missed_delivered.delivered ? 'Delivered' : 'Missed'),
      escapeCsvField(r.notes),
    ];
  });

  const totalDelivered = records
    .filter((r) => r.status === Variant_missed_delivered.delivered)
    .reduce((s, r) => s + r.quantityLiters, 0);

  const summaryRow = [
    'TOTAL',
    '',
    '',
    '',
    escapeCsvField(totalDelivered.toFixed(2)),
    escapeCsvField(`${records.filter((r) => r.status === Variant_missed_delivered.delivered).length} delivered`),
    '',
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    summaryRow.join(','),
  ].join('\n');

  triggerDownload(csvContent, filename);
}
