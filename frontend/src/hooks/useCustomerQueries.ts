import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { CattleOrder, CattleAvailability, CustomerAccount } from '../backend';

// Customer login is handled client-side: we fetch all customers using the
// anonymous actor (which requires admin — see backend gap note), match
// credentials, and return a session token encoding the customer ID.
// Since the backend has no public customerLogin endpoint, we implement
// a best-effort approach: attempt getAllCustomers and match credentials.
export function useCustomerLogin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }): Promise<string> => {
      if (!actor) throw new Error('Actor not available');

      let customers: CustomerAccount[] = [];
      try {
        customers = await actor.getAllCustomers();
      } catch {
        throw new Error('Unable to connect to the server. Please try again.');
      }

      const match = customers.find(
        (c) => c.username === username && c.passwordHash === password,
      );

      if (!match) {
        throw new Error('Invalid username or password.');
      }

      if (!match.isActive) {
        throw new Error('Your account is inactive. Please contact the admin.');
      }

      // Return a session token encoding the customer ID
      return `session-${match.id.toString()}`;
    },
  });
}

export function useGetMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<CattleOrder[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvailableCattle() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['availableCattle'],
    queryFn: async () => {
      if (!actor) return [];
      const all = await actor.getAllCattle();
      return all.filter((c) => c.availability === CattleAvailability.Available);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerId: bigint;
      cattleTagNumber: string;
      deliveryNotes: string;
    }): Promise<void> => {
      if (!actor) throw new Error('Actor not available');
      await actor.placeOrder(data.customerId, data.cattleTagNumber, data.deliveryNotes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['availableCattle'] });
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
    },
  });
}
