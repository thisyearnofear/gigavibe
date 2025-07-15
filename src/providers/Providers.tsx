'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MiniKitContextProvider } from './MiniKitProvider';
import { FilCDNProvider } from './FilCDNProvider';
import { FarcasterAuthProvider } from '@/contexts/FarcasterAuthContext';
import { UnifiedAuthProvider } from '@/contexts/UnifiedAuthContext';
import { CrossTabProvider } from '@/contexts/CrossTabContext';

export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient in component to avoid SSR issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <MiniKitContextProvider>
        <FilCDNProvider>
          <FarcasterAuthProvider>
            <UnifiedAuthProvider>
              <CrossTabProvider>
                {children}
              </CrossTabProvider>
            </UnifiedAuthProvider>
          </FarcasterAuthProvider>
        </FilCDNProvider>
      </MiniKitContextProvider>
    </QueryClientProvider>
  );
}
