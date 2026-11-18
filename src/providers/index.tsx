import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { BrowserRouter } from 'react-router';

import { AppRoutes } from '@/routes';
import { ErrorBoundary } from '@/errorBoundary';
import { createQueryClient } from '@/query/queryClient';
import { ToastProvider } from '@/components';

export function App() {
  // Created once per app instance rather than at module scope, so separate
  // app instances never share a cache.
  const [queryClient] = useState(createQueryClient);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
