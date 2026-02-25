import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MilkRecord {
    id: bigint;
    date: Time;
    cattleId: bigint;
    quantityLiters: number;
    notes: string;
}
export interface DeliveryRecord {
    id: bigint;
    status: Variant_missed_delivered;
    date: Time;
    quantityLiters: number;
    deliveryBoyName: string;
    notes: string;
    customerId: bigint;
}
export type Time = bigint;
export interface Cattle {
    id: bigint;
    purchaseCost: number;
    purchaseDate: Time;
    ageMonths: bigint;
    activeStatus: boolean;
    healthStatus: HealthStatus;
    dailyMilkProductionLiters: number;
    notes: string;
    breed: string;
}
export type HealthStatus = {
    __kind__: "recovered";
    recovered: null;
} | {
    __kind__: "sick";
    sick: {
        treatment: string;
        medications: Array<string>;
        condition: string;
    };
} | {
    __kind__: "healthy";
    healthy: null;
};
export interface Customer {
    id: bigint;
    name: string;
    activeStatus: boolean;
    address: string;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export interface MilkProductionRecord {
    id: bigint;
    date: Time;
    quantityLiters: number;
    notes: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_missed_delivered {
    missed = "missed",
    delivered = "delivered"
}
export interface backendInterface {
    addCattle(breed: string, ageMonths: bigint, dailyMilkProductionLiters: number, healthStatus: HealthStatus, purchaseDate: Time, purchaseCost: number, notes: string): Promise<bigint>;
    addCustomer(name: string, address: string, phone: string): Promise<bigint>;
    addDeliveryRecord(customerId: bigint, deliveryBoyName: string, date: Time, quantityLiters: number, status: Variant_missed_delivered, notes: string): Promise<bigint>;
    addMilkProductionRecord(date: Time, quantityLiters: number, notes: string): Promise<bigint>;
    addMilkRecord(cattleId: bigint, date: Time, quantityLiters: number, notes: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllCattle(): Promise<Array<Cattle>>;
    getAllHealthyCattle(): Promise<Array<Cattle>>;
    getAllMilkRecords(): Promise<Array<MilkRecord>>;
    getAllRecoveredCattle(): Promise<Array<Cattle>>;
    getAllSickCattle(): Promise<Array<Cattle>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCattleByAgeRange(minAge: bigint, maxAge: bigint): Promise<Array<Cattle>>;
    getCattleByBreed(breed: string): Promise<Array<Cattle>>;
    getCattleByHealthStatus(healthStatus: HealthStatus): Promise<Array<Cattle>>;
    getCattleByMilkProductionRange(minLiters: number, maxLiters: number): Promise<Array<Cattle>>;
    getCattleByPurchaseDateRange(startDate: Time, endDate: Time): Promise<Array<Cattle>>;
    getCustomers(): Promise<Array<Customer>>;
    getDeliveryRecordsByCustomer(customerId: bigint): Promise<Array<DeliveryRecord>>;
    getDeliveryRecordsByDate(date: Time): Promise<Array<DeliveryRecord>>;
    getDeliveryRecordsByMonth(month: bigint, year: bigint): Promise<Array<DeliveryRecord>>;
    getMilkProductionRecords(): Promise<Array<MilkProductionRecord>>;
    getMilkRecordsByCattle(cattleId: bigint): Promise<Array<MilkRecord>>;
    getMilkRecordsByDateRange(startDate: Time, endDate: Time): Promise<Array<MilkRecord>>;
    getMilkRecordsByMonth(month: bigint, year: bigint): Promise<Array<MilkProductionRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCattle(cattleId: bigint, breed: string, ageMonths: bigint, dailyMilkProductionLiters: number, healthStatus: HealthStatus, purchaseDate: Time, purchaseCost: number, notes: string): Promise<void>;
    updateCustomer(customerId: bigint, name: string, address: string, phone: string): Promise<void>;
}
