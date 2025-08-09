
import React from 'react';
import { ThirdwebProvider as Provider } from '@thirdweb-dev/react';

const clientId = 'fab3e4c365806de8cb6e0fa7e26a6869'; // Real Thirdweb Client ID

// Polygon chain configuration
const polygonChain = {
  chainId: 137,
  rpc: ['https://polygon-rpc.com/'],
  nativeCurrency: {
    decimals: 18,
    name: 'Polygon',
    symbol: 'MATIC',
  },
  shortName: 'matic',
  slug: 'polygon',
  testnet: false,
  chain: 'Polygon',
  name: 'Polygon Mainnet',
};

interface ThirdwebProviderProps {
  children: React.ReactNode;
}

export function ThirdwebProvider({ children }: ThirdwebProviderProps) {
  return (
    <Provider
      clientId={clientId}
      activeChain={polygonChain}
      supportedChains={[polygonChain]}
      dAppMeta={{
        name: "Million Dollar eBooks",
        description: "Crypto payments for digital books",
        logoUrl: "https://milliondollarebooks.com/logo.png",
        url: "https://milliondollarebooks.com",
        isDarkMode: false,
      }}
    >
      {children}
    </Provider>
  );
}
