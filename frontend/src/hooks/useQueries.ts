import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Cattle, Customer, DeliveryRecord, MilkRecord, MilkProductionRecord, HealthStatus, UserProfile } from '../backend';
import { Variant_missed_delivered } from '../backend';

// ─── Time Utilities ───────────────────────────────────────────────────────────

export function dateToNanoseconds(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

export function nanosecondsToDate(ns: bigint): Date {
  return new Date(Number(ns / 1_000_000n));
}

export function getTodayNanoseconds(): bigint {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return dateToNanoseconds(startOfDay);
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Cattle ───────────────────────────────────────────────────────────────────

export function useGetAllCattle() {
  const { actor, isFetching } = useActor();

  return useQuery<Cattle[]>({
    queryKey: ['cattle'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCattle();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCattle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      breed: string;
      ageMonths: bigint;
      dailyMilkProductionLiters: number;
      healthStatus: HealthStatus;
      purchaseDate: bigint;
      purchaseCost: number;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCattle(
        params.breed,
        params.ageMonths,
        params.dailyMilkProductionLiters,
        params.healthStatus,
        params.purchaseDate,
        params.purchaseCost,
        params.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
    },
  });
}

export function useUpdateCattle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      cattleId: bigint;
      breed: string;
      ageMonths: bigint;
      dailyMilkProductionLiters: number;
      healthStatus: HealthStatus;
      purchaseDate: bigint;
      purchaseCost: number;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCattle(
        params.cattleId,
        params.breed,
        params.ageMonths,
        params.dailyMilkProductionLiters,
        params.healthStatus,
        params.purchaseDate,
        params.purchaseCost,
        params.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
    },
  });
}

// ─── Milk Records (per-cattle) ────────────────────────────────────────────────

export function useGetAllMilkRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<MilkRecord[]>({
    queryKey: ['milkRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMilkRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMilkRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      cattleId: bigint;
      date: bigint;
      quantityLiters: number;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMilkRecord(
        params.cattleId,
        params.date,
        params.quantityLiters,
        params.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milkRecords'] });
    },
  });
}

export function useGetMilkRecordsByCattle(cattleId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<MilkRecord[]>({
    queryKey: ['milkRecords', 'cattle', cattleId?.toString()],
    queryFn: async () => {
      if (!actor || cattleId === null) return [];
      return actor.getMilkRecordsByCattle(cattleId);
    },
    enabled: !!actor && !isFetching && cattleId !== null,
  });
}

export function useGetMilkRecordsByDateRange(startDate: Date | null, endDate: Date | null) {
  const { actor, isFetching } = useActor();

  return useQuery<MilkRecord[]>({
    queryKey: ['milkRecords', 'dateRange', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!actor || !startDate || !endDate) return [];
      return actor.getMilkRecordsByDateRange(
        dateToNanoseconds(startDate),
        dateToNanoseconds(endDate),
      );
    },
    enabled: !!actor && !isFetching && !!startDate && !!endDate,
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
    mutationFn: async (params: {
      name: string;
      address: string;
      phone: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCustomer(params.name, params.address, params.phone);
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
    mutationFn: async (params: {
      customerId: bigint;
      name: string;
      address: string;
      phone: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCustomer(params.customerId, params.name, params.address, params.phone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// ─── Delivery Records ─────────────────────────────────────────────────────────

export function useGetDeliveryRecordsByDate(date: Date | null) {
  const { actor, isFetching } = useActor();

  return useQuery<DeliveryRecord[]>({
    queryKey: ['deliveries', 'date', date?.toISOString()],
    queryFn: async () => {
      if (!actor || !date) return [];
      return actor.getDeliveryRecordsByDate(dateToNanoseconds(date));
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useGetDeliveryRecordsByMonth(month: number, year: number) {
  const { actor, isFetching } = useActor();

  return useQuery<DeliveryRecord[]>({
    queryKey: ['deliveries', 'month', month, year],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDeliveryRecordsByMonth(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDeliveryRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      customerId: bigint;
      deliveryBoyName: string;
      date: bigint;
      quantityLiters: number;
      status: Variant_missed_delivered;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDeliveryRecord(
        params.customerId,
        params.deliveryBoyName,
        params.date,
        params.quantityLiters,
        params.status,
        params.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
}

// ─── Milk Production Records (farm-level) ─────────────────────────────────────

export function useGetMilkProductionRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<MilkProductionRecord[]>({
    queryKey: ['milkProductionRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMilkProductionRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMilkRecordsByMonth(month: number, year: number) {
  const { actor, isFetching } = useActor();

  return useQuery<MilkProductionRecord[]>({
    queryKey: ['milkProductionRecords', 'month', month, year],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMilkRecordsByMonth(BigInt(month), BigInt(year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMilkProductionRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      date: bigint;
      quantityLiters: number;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMilkProductionRecord(params.date, params.quantityLiters, params.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milkProductionRecords'] });
    },
  });
}
