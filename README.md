# Tiny Uniswap DEX - A Multi-Chain DeFi Application

This project is a simplified, multi-chain Decentralized Exchange (DEX) modeled after Uniswap v1. It demonstrates the core principles of Automated Market Makers (AMMs), liquidity provision, and token swaps in a full-stack Web3 environment.

The application is deployed across five major EVM-compatible blockchains: **Base, BNB Smart Chain, Optimism, Celo, and Arbitrum**.

## Live Demo & Features

-   **Multi-Chain Swapping:** Seamlessly connect and trade custom ERC20 tokens on any of the five supported networks.
-   **Liquidity Provision:** Users can deposit pairs of tokens into a liquidity pool to become Liquidity Providers (LPs) and earn passive fees from trades.
-   **Constant Product Formula:** The exchange uses the foundational `x * y = k` formula to determine token prices algorithmically.
-   **Real-Time Analytics API:** A high-performance FastAPI backend provides aggregated, live data from all deployed exchanges.

![Swap Interface Screenshot](https://i.imgur.com/your-screenshot-url.png) <!-- TODO: Add a screenshot of your app! -->

## Tech Stack

-   **Smart Contracts:** Solidity, OpenZeppelin, Remix IDE for deployment.
-   **Frontend:** Next.js, React, TypeScript, Tailwind CSS, `wagmi` for wallet interaction, `viem` for blockchain operations.
-   **Backend:** Python, FastAPI for the API server, `web3.py` for on-chain data fetching, `asyncio` for concurrent operations.
-   **Infrastructure:** Deployed on Base, BSC, Optimism, Celo, and Arbitrum mainnets.

## Project Structure

The project is organized into three distinct parts for clarity and scalability: