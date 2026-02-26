// Re-export all admin and customer query hooks for convenience
export * from './useAdminQueries';
export * from './useCustomerQueries';

import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useIsAdmin() {
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
