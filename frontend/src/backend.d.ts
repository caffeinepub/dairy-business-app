import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface Customer {
    id: bigint;
    name: string;
    activeStatus: boolean;
    address: string;
    phone: string;
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
    addCustomer(name: string, address: string, phone: string, activeStatus: boolean): Promise<bigint>;
    addDeliveryRecord(customerId: bigint, deliveryBoyName: string, date: Time, quantityLiters: number, status: Variant_missed_delivered, notes: string): Promise<bigint>;
    addMilkProductionRecord(date: Time, quantityLiters: number, notes: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomers(): Promise<Array<Customer>>;
    getDeliveryRecordsByCustomer(customerId: bigint): Promise<Array<DeliveryRecord>>;
    getDeliveryRecordsByDate(date: Time): Promise<Array<DeliveryRecord>>;
    getDeliveryRecordsByMonth(month: bigint, year: bigint): Promise<Array<DeliveryRecord>>;
    getMilkProductionRecords(): Promise<Array<MilkProductionRecord>>;
    getMilkRecordsByMonth(month: bigint, year: bigint): Promise<Array<MilkProductionRecord>>;
    isCallerAdmin(): Promise<boolean>;
    updateCustomer(id: bigint, name: string, address: string, phone: string, activeStatus: boolean): Promise<void>;
}
