// src/app/providers.tsx
'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
// IMPORT ALL THE CHAINS
import { base, bsc, optimism, celo, arbitrum } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  // ADD ALL CHAINS TO THE ARRAY
  chains: [base, bsc, optimism, celo, arbitrum],
  transports: {
    // ADD A TRANSPORT FOR EACH CHAIN
    [base.id]: http(),
    [bsc.id]: http(),
    [optimism.id]: http(),
    [celo.id]: http(),
    [arbitrum.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}