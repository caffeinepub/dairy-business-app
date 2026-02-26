import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InventoryStat {
    uniqueCattleCount: bigint;
    avgDailyProduction: number;
    totalRecords: bigint;
    totalQuantity: number;
}
export interface InventoryItem {
    id: bigint;
    lowStockThreshold: number;
    name: string;
    unit: string;
    addedBy: Principal;
    notes: string;
    quantity: number;
    category: string;
}
export interface CattleOrder {
    status: OrderStatus;
    deliveryNotes: string;
    orderDate: bigint;
    orderId: bigint;
    cattleTagNumber: string;
    customerId: bigint;
}
export interface Cattle {
    id: bigint;
    purchasePrice: number;
    dateOfPurchase: bigint;
    healthStatus: HealthStatus;
    availability: CattleAvailability;
    breed: string;
    tagNumber: string;
}
export interface CustomerAccount {
    id: bigint;
    username: string;
    name: string;
    isActive: boolean;
    address: string;
    passwordHash: string;
    phone: string;
}
export interface InventoryStats {
    categoryCount: bigint;
    lowStockItems: bigint;
    totalItems: bigint;
}
export interface UserProfile {
    name: string;
}
export interface MilkProductionRecord {
    id: bigint;
    date: bigint;
    quantityLiters: number;
    addedBy: Principal;
    notes: string;
    cattleTag: string;
}
export enum CattleAvailability {
    Available = "Available",
    Reserved = "Reserved",
    Sold = "Sold"
}
export enum HealthStatus {
    Healthy = "Healthy",
    Sick = "Sick",
    Recovered = "Recovered"
}
export enum OrderStatus {
    Delivered = "Delivered",
    Confirmed = "Confirmed",
    Cancelled = "Cancelled",
    OutForDelivery = "OutForDelivery",
    Pending = "Pending"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCattle(tagNumber: string, breed: string, dateOfPurchase: bigint, purchasePrice: number, availability: CattleAvailability, healthStatus: HealthStatus): Promise<void>;
    addCustomer(name: string, phone: string, address: string, username: string, passwordHash: string, isActive: boolean): Promise<void>;
    addInventoryItem(name: string, category: string, quantity: number, unit: string, lowStockThreshold: number, notes: string): Promise<void>;
    addMilkProductionRecord(cattleTag: string, quantityLiters: number, date: bigint, notes: string): Promise<void>;
    adminLogin(adminToken: string, userProvidedToken: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCattle(cattleId: bigint): Promise<void>;
    deleteCustomer(customerId: bigint): Promise<void>;
    deleteInventoryItem(itemId: bigint): Promise<void>;
    deleteMilkProductionRecord(recordId: bigint): Promise<void>;
    getAllCattle(): Promise<Array<Cattle>>;
    getAllCustomers(): Promise<Array<CustomerAccount>>;
    getAllInventoryItems(): Promise<Array<InventoryItem>>;
    getAllMilkProductionRecords(): Promise<Array<MilkProductionRecord>>;
    getAllOrders(): Promise<Array<CattleOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInventoryStats(): Promise<InventoryStats>;
    getLowStockItems(): Promise<Array<InventoryItem>>;
    getMilkProductionStats(): Promise<InventoryStat>;
    getMyOrders(): Promise<Array<CattleOrder>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    linkCustomerPrincipal(customerId: bigint, customerPrincipal: Principal): Promise<void>;
    placeOrder(customerId: bigint, cattleTagNumber: string, deliveryNotes: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCustomerActive(customerId: bigint, isActive: boolean): Promise<void>;
    updateCattle(cattleId: bigint, tagNumber: string, breed: string, dateOfPurchase: bigint, purchasePrice: number, availability: CattleAvailability, healthStatus: HealthStatus): Promise<void>;
    updateCustomer(customerId: bigint, name: string, phone: string, address: string, username: string, passwordHash: string, isActive: boolean): Promise<void>;
    updateInventoryItem(itemId: bigint, name: string, category: string, quantity: number, unit: string, lowStockThreshold: number, notes: string): Promise<void>;
    updateMilkProductionRecord(recordId: bigint, cattleTag: string, quantityLiters: number, date: bigint, notes: string): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus, deliveryNotes: string): Promise<void>;
}
