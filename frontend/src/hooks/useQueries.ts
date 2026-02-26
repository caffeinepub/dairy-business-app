import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// Re-export admin and customer queries for convenience
export * from './useAdminQueries';
export * from './useCustomerQueries';

// Keep a minimal useQueries for any shared/legacy usage
export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
