import { useState } from 'react';

interface UseClipboardOptions {
  resetDelay?: number;
}

export function useClipboard({ resetDelay = 2000 }: UseClipboardOptions = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setError(null);
      setTimeout(() => setIsCopied(false), resetDelay);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to copy'));
      setIsCopied(false);
    }
  };

  return { copy, isCopied, error };
}
