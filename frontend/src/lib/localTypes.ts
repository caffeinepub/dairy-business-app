// Local type definitions for data that is no longer in the backend interface.
// These types mirror the old backend shapes so existing pages continue to compile.

export interface Cattle {
    id: bigint;
    name: string;
    breed: string;
    birthDate: bigint;
    status: string;
}

export interface MilkRecord {
    id: bigint;
    cattleId: bigint;
    date: bigint;
    quantity: number;
    notes: string;
}

export interface InventoryItem {
    id: bigint;
    name: string;
    category: string;
    quantity: bigint;
    unit: string;
    lastUpdated: bigint;
}
