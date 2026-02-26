import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Customer,
  Cattle,
  DeliveryRecord,
  MilkProductionRecord,
  MilkRecord,
  HealthStatus,
  UserProfile,
  CustomerFeedback,
} from '../backend';
import { CattleStatus, Variant_missed_delivered } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

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

// ─── Customers ───────────────────────────────────────────────────────────────

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
      active: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCustomer(data.name, data.address, data.phone, data.active);
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
      active: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCustomer(data.id, data.name, data.address, data.phone, data.active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// ─── Cattle ──────────────────────────────────────────────────────────────────

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
    mutationFn: async (data: {
      breed: string;
      ageMonths: bigint;
      dailyMilkProductionLiters: number;
      healthStatus: HealthStatus;
      purchaseDate: bigint;
      purchaseCost: number;
      notes: string;
      status: CattleStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCattle(
        data.breed,
        data.ageMonths,
        data.dailyMilkProductionLiters,
        data.healthStatus,
        data.purchaseDate,
        data.purchaseCost,
        data.notes,
        data.status,
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
    mutationFn: async (data: {
      id: bigint;
      breed: string;
      ageMonths: bigint;
      dailyMilkProductionLiters: number;
      healthStatus: HealthStatus;
      purchaseDate: bigint;
      purchaseCost: number;
      notes: string;
      status: CattleStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCattle(
        data.id,
        data.breed,
        data.ageMonths,
        data.dailyMilkProductionLiters,
        data.healthStatus,
        data.purchaseDate,
        data.purchaseCost,
        data.notes,
        data.status,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
    },
  });
}

// ─── Delivery Records ─────────────────────────────────────────────────────────

export function useGetDeliveryRecordsByDate(date: Date | null) {
  const { actor, isFetching } = useActor();

  return useQuery<DeliveryRecord[]>({
    queryKey: ['deliveryRecords', 'byDate', date?.toISOString()],
    queryFn: async () => {
      if (!actor || !date) return [];
      return actor.getDeliveryRecordsByDate(dateToNanoseconds(date));
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useGetDeliveryRecordsByCustomer(customerPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<DeliveryRecord[]>({
    queryKey: ['deliveryRecords', 'byCustomer', customerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || customerPrincipal === null) return [];
      return actor.getDeliveryRecordsByCustomer(customerPrincipal);
    },
    enabled: !!actor && !isFetching && customerPrincipal !== null,
  });
}

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

export function useAddDeliveryRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerPrincipal: Principal;
      deliveryBoyName: string;
      date: bigint;
      quantityLiters: number;
      status: Variant_missed_delivered;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDeliveryRecord(
        data.customerPrincipal,
        data.deliveryBoyName,
        data.date,
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

// ─── Milk Production Records ──────────────────────────────────────────────────

export function useGetMilkProductionRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<MilkProductionRecord[]>({
    queryKey: ['milkProduction'],
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
    queryKey: ['milkProduction', 'byMonth', month, year],
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
    mutationFn: async (data: {
      date: bigint;
      quantityLiters: number;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMilkProductionRecord(data.date, data.quantityLiters, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milkProduction'] });
    },
  });
}

// ─── Milk Records (per cattle) ────────────────────────────────────────────────

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

export function useGetMilkRecordsByCattle(cattleId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<MilkRecord[]>({
    queryKey: ['milkRecords', 'byCattle', cattleId?.toString()],
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
    queryKey: ['milkRecords', 'byDateRange', startDate?.toISOString(), endDate?.toISOString()],
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

export function useAddMilkRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      cattleId: bigint;
      date: bigint;
      quantityLiters: number;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMilkRecord(data.cattleId, data.date, data.quantityLiters, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milkRecords'] });
    },
  });
}

// ─── Customer Portal: My Deliveries ──────────────────────────────────────────

export function useGetMyDeliveries() {
  const { actor, isFetching } = useActor();

  return useQuery<DeliveryRecord[]>({
    queryKey: ['myDeliveries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDeliveries();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Customer Portal: Submit Feedback ────────────────────────────────────────

export function useSubmitFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { deliveryId: bigint; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitFeedback(data.deliveryId, data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myDeliveries'] });
    },
  });
}

// ─── Admin: Flagged Feedback ──────────────────────────────────────────────────

export function useGetFlaggedFeedback() {
  const { actor, isFetching } = useActor();

  return useQuery<CustomerFeedback[]>({
    queryKey: ['flaggedFeedback'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFlaggedFeedback();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin: Resolve Feedback ──────────────────────────────────────────────────

export function useResolveFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedbackId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.resolveFeedback(feedbackId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flaggedFeedback'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryRecords'] });
    },
  });
}
