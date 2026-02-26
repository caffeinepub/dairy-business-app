import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { Cattle, CustomerAccount, CattleOrder, CattleAvailability, HealthStatus, OrderStatus } from '../backend';

export function useGetAllCattle() {
  const { actor, isFetching } = useActor();
  return useQuery<Cattle[]>({
    queryKey: ['admin', 'cattle'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCattle();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCattle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      tagNumber: string;
      breed: string;
      dateOfPurchase: bigint;
      milkingCapacity: number;
      purchasePrice: number;
      availability: CattleAvailability;
      healthStatus: HealthStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCattle(
        data.tagNumber, data.breed, data.dateOfPurchase,
        data.milkingCapacity, data.purchasePrice, data.availability, data.healthStatus
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cattle'] });
      toast.success('Cattle record added successfully');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to add cattle'),
  });
}

export function useUpdateCattle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      cattleId: bigint;
      tagNumber: string;
      breed: string;
      dateOfPurchase: bigint;
      milkingCapacity: number;
      purchasePrice: number;
      availability: CattleAvailability;
      healthStatus: HealthStatus;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCattle(
        data.cattleId, data.tagNumber, data.breed, data.dateOfPurchase,
        data.milkingCapacity, data.purchasePrice, data.availability, data.healthStatus
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cattle'] });
      toast.success('Cattle record updated successfully');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update cattle'),
  });
}

export function useDeleteCattle() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cattleId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCattle(cattleId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cattle'] });
      toast.success('Cattle record deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete cattle'),
  });
}

export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<CustomerAccount[]>({
    queryKey: ['admin', 'customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCustomer() {
  const { actor } = useActor();
  const qc = useQueryClient();
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
      return actor.addCustomer(data.name, data.phone, data.address, data.username, data.passwordHash, data.isActive);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      toast.success('Customer added successfully');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to add customer'),
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      customerId: bigint;
      name: string;
      phone: string;
      address: string;
      username: string;
      passwordHash: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCustomer(
        data.customerId, data.name, data.phone, data.address,
        data.username, data.passwordHash, data.isActive
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      toast.success('Customer updated successfully');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update customer'),
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customerId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCustomer(customerId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      toast.success('Customer deleted');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete customer'),
  });
}

export function useSetCustomerActive() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, isActive }: { customerId: bigint; isActive: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setCustomerActive(customerId, isActive);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      toast.success('Customer status updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update status'),
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<CattleOrder[]>({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { orderId: bigint; status: OrderStatus; deliveryNotes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(data.orderId, data.status, data.deliveryNotes);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order status updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update order status'),
  });
}
