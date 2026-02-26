import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  Cattle,
  CattleAvailability,
  HealthStatus,
  CustomerAccount,
  CattleOrder,
  OrderStatus,
  UserRole,
  MilkProductionRecord,
  InventoryItem,
  InventoryStats,
  InventoryStat,
} from '../backend';
import { Principal } from '@dfinity/principal';

// ─── Admin Login Mutation ─────────────────────────────────────────────────────

export function useAdminLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // adminLogin() returns void on success, traps (throws) on unauthorized
      await actor.adminLogin('', '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['callerRole'] });
    },
  });
}

// ─── Admin Role Check ─────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10000,
  });
}

export function useGetCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Cattle Queries ───────────────────────────────────────────────────────────

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
      tagNumber: string;
      breed: string;
      dateOfPurchase: bigint;
      purchasePrice: number;
      availability: CattleAvailability;
      healthStatus: HealthStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCattle(
        data.tagNumber,
        data.breed,
        data.dateOfPurchase,
        data.purchasePrice,
        data.availability,
        data.healthStatus,
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
      tagNumber: string;
      breed: string;
      dateOfPurchase: bigint;
      purchasePrice: number;
      availability: CattleAvailability;
      healthStatus: HealthStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCattle(
        data.id,
        data.tagNumber,
        data.breed,
        data.dateOfPurchase,
        data.purchasePrice,
        data.availability,
        data.healthStatus,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
    },
  });
}

export function useDeleteCattle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cattleId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCattle(cattleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
    },
  });
}

// ─── Customer Queries ─────────────────────────────────────────────────────────

export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<CustomerAccount[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
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
      phone: string;
      address: string;
      username: string;
      passwordHash: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCustomer(
        data.name,
        data.phone,
        data.address,
        data.username,
        data.passwordHash,
        data.isActive,
      );
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
      phone: string;
      address: string;
      username: string;
      passwordHash: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCustomer(
        data.id,
        data.name,
        data.phone,
        data.address,
        data.username,
        data.passwordHash,
        data.isActive,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCustomer(customerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useSetCustomerActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, isActive }: { customerId: bigint; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setCustomerActive(customerId, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// ─── Order Queries ────────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<CattleOrder[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      orderId: bigint;
      status: OrderStatus;
      deliveryNotes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(data.orderId, data.status, data.deliveryNotes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useLinkCustomerPrincipal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, principal }: { customerId: bigint; principal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkCustomerPrincipal(customerId, principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
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

// ─── Milk Production Queries ──────────────────────────────────────────────────

export function useGetAllMilkProductionRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<MilkProductionRecord[]>({
    queryKey: ['milkProductionRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMilkProductionRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMilkProductionStats() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryStat>({
    queryKey: ['milkProductionStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMilkProductionStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMilkProductionRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      cattleTag: string;
      quantityLiters: number;
      date: bigint;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMilkProductionRecord(
        data.cattleTag,
        data.quantityLiters,
        data.date,
        data.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milkProductionRecords'] });
      queryClient.invalidateQueries({ queryKey: ['milkProductionStats'] });
    },
  });
}

export function useUpdateMilkProductionRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      cattleTag: string;
      quantityLiters: number;
      date: bigint;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMilkProductionRecord(
        data.id,
        data.cattleTag,
        data.quantityLiters,
        data.date,
        data.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milkProductionRecords'] });
      queryClient.invalidateQueries({ queryKey: ['milkProductionStats'] });
    },
  });
}

export function useDeleteMilkProductionRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMilkProductionRecord(recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milkProductionRecords'] });
      queryClient.invalidateQueries({ queryKey: ['milkProductionStats'] });
    },
  });
}

// ─── Inventory Queries ────────────────────────────────────────────────────────

export function useGetAllInventoryItems() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ['inventoryItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInventoryItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInventoryStats() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryStats>({
    queryKey: ['inventoryStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getInventoryStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLowStockItems() {
  const { actor, isFetching } = useActor();
  return useQuery<InventoryItem[]>({
    queryKey: ['lowStockItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLowStockItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      quantity: number;
      unit: string;
      lowStockThreshold: number;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addInventoryItem(
        data.name,
        data.category,
        data.quantity,
        data.unit,
        data.lowStockThreshold,
        data.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockItems'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      category: string;
      quantity: number;
      unit: string;
      lowStockThreshold: number;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInventoryItem(
        data.id,
        data.name,
        data.category,
        data.quantity,
        data.unit,
        data.lowStockThreshold,
        data.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockItems'] });
    },
  });
}

export function useDeleteInventoryItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteInventoryItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryItems'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockItems'] });
    },
  });
}
