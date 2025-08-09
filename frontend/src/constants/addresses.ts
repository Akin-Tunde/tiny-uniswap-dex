// src/constants/addresses.ts

// A type definition for clarity
interface DexAddresses {
  akinToken: `0x${string}`;
  wethToken: `0x${string}`;
  ammExchange: `0x${string}`;
}

// TODO: Fill this out with the 15 addresses you just deployed and saved!
export const DEX_ADDRESSES: { [chainId: number]: DexAddresses } = {
  8453: { // Base
    akinToken: '0xYourBaseAkinTokenAddress',
    wethToken: '0xYourBaseWethTokenAddress',
    ammExchange: '0xYourBaseAmmExchangeAddress'
  },
  56: { // BSC
    akinToken: '0xYourBscAkinTokenAddress',
    wethToken: '0xYourBscWethTokenAddress',
    ammExchange: '0xYourBscAmmExchangeAddress'
  },
  10: { // Optimism
    akinToken: '0xYourOptimismAkinTokenAddress',
    wethToken: '0xYourOptimismWethTokenAddress',
    ammExchange: '0xYourOptimismAmmExchangeAddress'
  },
  42220: { // Celo
    akinToken: '0xYourCeloAkinTokenAddress',
    wethToken: '0xYourCeloWethTokenAddress',
    ammExchange: '0xYourCeloAmmExchangeAddress'
  },
  42161: { // Arbitrum
    akinToken: '0xYourArbitrumAkinTokenAddress',
    wethToken: '0xYourArbitrumWethTokenAddress',
    ammExchange: '0xYourArbitrumAmmExchangeAddress'
  },
};