import { DeliveryRecord, MilkRecord, Cattle, Customer, Variant_missed_delivered } from '../backend';

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

function triggerDownload(csvContent: string, filename: string): void {
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

  triggerDownload(csvLines.join('\n'), filename);
}

export function exportMilkProductionRecordsToCSV(
  records: MilkRecord[],
  cattleList: Cattle[],
): void {
  const today = new Date().toISOString().split('T')[0];
  const filename = `milk-production-${today}.csv`;

  const cattleMap = new Map<string, Cattle>();
  for (const c of cattleList) {
    cattleMap.set(c.id.toString(), c);
  }

  const headers = ['Date', 'Cattle ID', 'Breed', 'Quantity (L)', 'Notes'];

  const rows = records.map((r) => {
    const cattleInfo = cattleMap.get(r.cattleId.toString());
    return [
      escapeCsvField(nanosecondsToDateStr(r.date)),
      escapeCsvField(`#${r.cattleId.toString()}`),
      escapeCsvField(cattleInfo ? cattleInfo.breed : 'Unknown'),
      escapeCsvField(r.quantityLiters.toFixed(2)),
      escapeCsvField(r.notes || ''),
    ];
  });

  const totalLiters = records.reduce((sum, r) => sum + r.quantityLiters, 0);

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
    '',
    `Total Records,${records.length}`,
    `Total Quantity (L),${totalLiters.toFixed(2)}`,
  ];

  triggerDownload(csvLines.join('\n'), filename);
}

export function exportCustomerRecordsToCSV(customers: Customer[]): void {
  const today = new Date().toISOString().split('T')[0];
  const filename = `customers-${today}.csv`;

  const headers = ['ID', 'Name', 'Address', 'Phone', 'Status'];

  const rows = customers.map((c) => [
    escapeCsvField(c.id.toString()),
    escapeCsvField(c.name),
    escapeCsvField(c.address),
    escapeCsvField(c.phone),
    escapeCsvField(c.active ? 'Active' : 'Inactive'),
  ]);

  const activeCount = customers.filter((c) => c.active).length;
  const inactiveCount = customers.length - activeCount;

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
    '',
    `Total Customers,${customers.length}`,
    `Active,${activeCount}`,
    `Inactive,${inactiveCount}`,
  ];

  triggerDownload(csvLines.join('\n'), filename);
}

export function exportDeliveryRecordsToCSV(
  records: DeliveryRecord[],
  customers: Customer[],
): void {
  const today = new Date().toISOString().split('T')[0];
  const filename = `delivery-records-${today}.csv`;

  const customerMap = new Map<string, Customer>();
  for (const c of customers) {
    customerMap.set(c.id.toString(), c);
  }

  const headers = ['Date', 'Customer', 'Delivery Boy', 'Quantity (L)', 'Status', 'Notes'];

  const rows = records.map((r) => {
    const customer = customerMap.get(r.customerId.toString());
    return [
      escapeCsvField(nanosecondsToDateStr(r.date)),
      escapeCsvField(customer ? customer.name : `Customer #${r.customerId.toString()}`),
      escapeCsvField(r.deliveryBoyName),
      escapeCsvField(r.quantityLiters.toFixed(2)),
      escapeCsvField(r.status === Variant_missed_delivered.delivered ? 'Delivered' : 'Missed'),
      escapeCsvField(r.notes || ''),
    ];
  });

  const deliveredRecords = records.filter((r) => r.status === Variant_missed_delivered.delivered);
  const totalLiters = deliveredRecords.reduce((sum, r) => sum + r.quantityLiters, 0);

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
    '',
    `Total Deliveries,${records.length}`,
    `Delivered,${deliveredRecords.length}`,
    `Missed,${records.length - deliveredRecords.length}`,
    `Total Liters Delivered,${totalLiters.toFixed(2)}`,
  ];

  triggerDownload(csvLines.join('\n'), filename);
}
