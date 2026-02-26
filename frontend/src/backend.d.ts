import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cattle {
    id: bigint;
    purchasePrice: number;
    milkingCapacity: number;
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
export type LoginResult = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: LoginError;
};
export interface CattleOrder {
    status: OrderStatus;
    deliveryNotes: string;
    orderDate: bigint;
    orderId: bigint;
    cattleTagNumber: string;
    customerId: bigint;
}
export interface UserProfile {
    name: string;
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
export enum LoginError {
    AccessDenied = "AccessDenied",
    AccountNotFound = "AccountNotFound",
    InvalidCredentials = "InvalidCredentials",
    AccountInactive = "AccountInactive"
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
    addCattle(tagNumber: string, breed: string, dateOfPurchase: bigint, milkingCapacity: number, purchasePrice: number, availability: CattleAvailability, healthStatus: HealthStatus): Promise<bigint>;
    addCustomer(name: string, phone: string, address: string, username: string, passwordHash: string, isActive: boolean): Promise<bigint>;
    adminLogin(): Promise<LoginResult>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    customerLogin(username: string, password: string): Promise<LoginResult>;
    deleteCattle(cattleId: bigint): Promise<void>;
    deleteCustomer(customerId: bigint): Promise<void>;
    getAllCattle(): Promise<Array<Cattle>>;
    getAllCustomers(): Promise<Array<CustomerAccount>>;
    getAllOrders(): Promise<Array<CattleOrder>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyOrders(): Promise<Array<CattleOrder>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    linkCustomerPrincipal(customerId: bigint, customerPrincipal: Principal): Promise<void>;
    placeOrder(customerId: bigint, cattleTagNumber: string, deliveryNotes: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setCustomerActive(customerId: bigint, isActive: boolean): Promise<void>;
    updateCattle(cattleId: bigint, tagNumber: string, breed: string, dateOfPurchase: bigint, milkingCapacity: number, purchasePrice: number, availability: CattleAvailability, healthStatus: HealthStatus): Promise<void>;
    updateCustomer(customerId: bigint, name: string, phone: string, address: string, username: string, passwordHash: string, isActive: boolean): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus, deliveryNotes: string): Promise<void>;
}
