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
    akinToken: '0xcF82b73bc29cB293406a6c39Ef3a2f918b7C43a4',
    wethToken: '0xf8fe3C42D2d84D7880e32A2d11D807d75EA29BF4',
    ammExchange: '0x4d8Df014DfBDae8C2e0aB95529C68225E1E11aa3'
  },
  56: { // BSC
    akinToken: '0x739c7C73Be569fEd06621BF007bd4505Fd1F3fD8',
    wethToken: '0xaf361eaB30244D6b6eD7321dc8Bce41576C34263',
    ammExchange: '0x2DD22eDEF6a386026D9242155023376810796108'
  },
  10: { // Optimism
    akinToken: '0xaf361eaB30244D6b6eD7321dc8Bce41576C34263',
    wethToken: '0x2DD22eDEF6a386026D9242155023376810796108',
    ammExchange: '0x352fbd1f40D4F1DeF95ECb0070c5ECbBCA08C265'
  },
  42220: { // Celo
    akinToken: '0x70f4Ea0cc5D0a8f153B5808B23c712FC3C60dF99',
    wethToken: '0x544b4d800EA1A57571C69305368f15F4140A582c',
    ammExchange: '0x2DD22eDEF6a386026D9242155023376810796108'
  },
  42161: { // Arbitrum
    akinToken: '0x70f4Ea0cc5D0a8f153B5808B23c712FC3C60dF99',
    wethToken: '0x544b4d800EA1A57571C69305368f15F4140A582c',
    ammExchange: '0xf7c74A86A5328D13856DD69248576F53a7e2488A'
  },
7777777: { // zora
    akinToken: '0x696629321C9Aa6A9a446B3447E4887169EB3e0d3',
    wethToken: '0x739c7C73Be569fEd06621BF007bd4505Fd1F3fD8',
    ammExchange: '0x70f4Ea0cc5D0a8f153B5808B23c712FC3C60dF99'
  },

};
