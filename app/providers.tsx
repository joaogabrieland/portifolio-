'use client';

/**
 * Root client-side providers wrapper.
 * Server components (layout.tsx) can't hold React context directly,
 * so we isolate all client providers here.
 */

import { AgencyProvider } from '@/components/AgencyContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AgencyProvider>
      {children}
    </AgencyProvider>
  );
}
