import type { CustomerAccount, CattleOrder, Cattle } from '../backend';

export function exportCustomersToCSV(customers: CustomerAccount[]): void {
  const headers = ['ID', 'Name', 'Username', 'Phone', 'Address', 'Status'];
  const rows = customers.map(c => [
    c.id.toString(),
    c.name,
    c.username,
    c.phone,
    c.address,
    c.isActive ? 'Active' : 'Inactive',
  ]);
  downloadCSV('customers.csv', headers, rows);
}

export function exportCattleToCSV(cattle: Cattle[]): void {
  const headers = ['ID', 'Tag Number', 'Breed', 'Date of Purchase', 'Milking Capacity (L/day)', 'Purchase Price', 'Availability', 'Health Status'];
  const rows = cattle.map(c => [
    c.id.toString(),
    c.tagNumber,
    c.breed,
    new Date(Number(c.dateOfPurchase) / 1_000_000).toLocaleDateString(),
    c.milkingCapacity.toFixed(1),
    c.purchasePrice.toFixed(2),
    String(c.availability),
    String(c.healthStatus),
  ]);
  downloadCSV('cattle.csv', headers, rows);
}

export function exportOrdersToCSV(orders: CattleOrder[], customerNames: Map<string, string>): void {
  const headers = ['Order ID', 'Customer', 'Cattle Tag', 'Order Date', 'Status', 'Delivery Notes'];
  const rows = orders.map(o => [
    o.orderId.toString(),
    customerNames.get(o.customerId.toString()) || `Customer #${o.customerId}`,
    o.cattleTagNumber,
    new Date(Number(o.orderDate) / 1_000_000).toLocaleDateString(),
    String(o.status),
    o.deliveryNotes,
  ]);
  downloadCSV('orders.csv', headers, rows);
}

function downloadCSV(filename: string, headers: string[], rows: string[][]): void {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Legacy stubs to avoid import errors in old files that may still reference these
export function exportDeliveryRecordsToCSV(_records: unknown[]): void {
  console.warn('exportDeliveryRecordsToCSV: delivery records no longer supported');
}

export function exportMilkProductionRecordsToCSV(_records: unknown[]): void {
  console.warn('exportMilkProductionRecordsToCSV: milk production records no longer supported');
}

export function exportPerCustomerMonthlyReportToCSV(_data: unknown[]): void {
  console.warn('exportPerCustomerMonthlyReportToCSV: monthly reports no longer supported');
}
