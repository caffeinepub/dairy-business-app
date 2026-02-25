import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Customer, DeliveryRecord, MilkProductionRecord } from '../backend';
import { Variant_missed_delivered } from '../backend';
import type { Cattle, MilkRecord, InventoryItem } from '../lib/localTypes';

// ─── Time helpers ────────────────────────────────────────────────────────────
export function dateToTime(date: Date): bigint {
    return BigInt(date.getTime()) * BigInt(1_000_000);
}

export function timeToDate(time: bigint): Date {
    return new Date(Number(time / BigInt(1_000_000)));
}

export function formatDate(time: bigint): string {
    return timeToDate(time).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function isToday(time: bigint): boolean {
    const d = timeToDate(time);
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}

export function startOfDayTime(date: Date): bigint {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return dateToTime(d);
}

// ─── Cattle (stubbed — backend no longer supports these) ─────────────────────
export function useGetAllCattle() {
    return useQuery<Cattle[]>({
        queryKey: ['cattle'],
        queryFn: async () => [],
        enabled: false,
    });
}

export function useAddCattle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (_data: { name: string; breed: string; birthDate: Date }) => {
            throw new Error('Cattle management is not available in this version.');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cattle'] });
        },
    });
}

export function useUpdateCattle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (_data: {
            id: bigint;
            name: string;
            breed: string;
            birthDate: Date;
            status: string;
        }) => {
            throw new Error('Cattle management is not available in this version.');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cattle'] });
        },
    });
}

// ─── Milk Records (stubbed — backend no longer supports these) ────────────────
export function useGetAllMilkRecords() {
    return useQuery<MilkRecord[]>({
        queryKey: ['milkRecords'],
        queryFn: async () => [],
        enabled: false,
    });
}

export function useAddMilkRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (_data: {
            cattleId: bigint;
            date: Date;
            quantity: number;
            notes: string;
        }) => {
            throw new Error('Milk record management is not available in this version.');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['milkRecords'] });
        },
    });
}

// ─── Inventory (stubbed — backend no longer supports these) ───────────────────
export function useGetAllInventoryItems() {
    return useQuery<InventoryItem[]>({
        queryKey: ['inventory'],
        queryFn: async () => [],
        enabled: false,
    });
}

export function useAddInventoryItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (_data: {
            name: string;
            category: string;
            quantity: number;
            unit: string;
        }) => {
            throw new Error('Inventory management is not available in this version.');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });
}

export function useUpdateInventoryItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (_data: { id: bigint; quantity: number }) => {
            throw new Error('Inventory management is not available in this version.');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });
}

// ─── Customers ────────────────────────────────────────────────────────────────
export function useGetCustomers() {
    const { actor, isFetching } = useActor();
    return useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getCustomers();
        },
        enabled: !!actor && !isFetching,
    });
}

export function useAddCustomer() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            name: string;
            address: string;
            phone: string;
            activeStatus: boolean;
        }) => {
            if (!actor) throw new Error('Actor not ready');
            return actor.addCustomer(data.name, data.address, data.phone, data.activeStatus);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}

export function useUpdateCustomer() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            id: bigint;
            name: string;
            address: string;
            phone: string;
            activeStatus: boolean;
        }) => {
            if (!actor) throw new Error('Actor not ready');
            return actor.updateCustomer(data.id, data.name, data.address, data.phone, data.activeStatus);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}

// ─── Delivery Records ─────────────────────────────────────────────────────────
export function useGetDeliveryRecordsByDate(date: Date) {
    const { actor, isFetching } = useActor();
    const dateKey = date.toISOString().split('T')[0];
    return useQuery<DeliveryRecord[]>({
        queryKey: ['deliveryRecords', 'byDate', dateKey],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getDeliveryRecordsByDate(startOfDayTime(date));
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGetDeliveryRecordsByCustomer(customerId: bigint | null) {
    const { actor, isFetching } = useActor();
    return useQuery<DeliveryRecord[]>({
        queryKey: ['deliveryRecords', 'byCustomer', String(customerId)],
        queryFn: async () => {
            if (!actor || customerId === null) return [];
            return actor.getDeliveryRecordsByCustomer(customerId);
        },
        enabled: !!actor && !isFetching && customerId !== null,
    });
}

export function useAddDeliveryRecord() {
    const { actor } = useActor();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            customerId: bigint;
            deliveryBoyName: string;
            date: Date;
            quantityLiters: number;
            status: Variant_missed_delivered;
            notes: string;
        }) => {
            if (!actor) throw new Error('Actor not ready');
            return actor.addDeliveryRecord(
                data.customerId,
                data.deliveryBoyName,
                startOfDayTime(data.date),
                data.quantityLiters,
                data.status,
                data.notes,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deliveryRecords'] });
        },
    });
}

// ─── Monthly Reports ──────────────────────────────────────────────────────────
export function useGetDeliveryRecordsByMonth(month: number, year: number) {
    const { actor, isFetching } = useActor();
    return useQuery<DeliveryRecord[]>({
        queryKey: ['deliveryRecords', 'byMonth', month, year],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getDeliveryRecordsByMonth(BigInt(month), BigInt(year));
        },
        enabled: !!actor && !isFetching,
    });
}

export function useGetMilkRecordsByMonth(month: number, year: number) {
    const { actor, isFetching } = useActor();
    return useQuery<MilkProductionRecord[]>({
        queryKey: ['milkProductionRecords', 'byMonth', month, year],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getMilkRecordsByMonth(BigInt(month), BigInt(year));
        },
        enabled: !!actor && !isFetching,
    });
}
