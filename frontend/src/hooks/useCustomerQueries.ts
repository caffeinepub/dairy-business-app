import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import { LoginError } from '../backend';

export function useCustomerLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.customerLogin(username, password);
      if (result.__kind__ === 'err') {
        const err = result.err;
        if (err === LoginError.AccountNotFound) throw new Error('Account not found. Please contact admin.');
        if (err === LoginError.AccountInactive) throw new Error('Access denied — your account is inactive. Please contact admin.');
        if (err === LoginError.InvalidCredentials) throw new Error('Invalid username or password.');
        throw new Error('Login failed. Please try again.');
      }
      return result.ok;
    },
  });
}
