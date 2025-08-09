// src/app/page.tsx
'use client';
import { useState } from 'react';
import { ConnectButton, SwapInterface, LiquidityInterface } from '@/components'; // Auto-import from components/index.ts if setup

export default function Home() {
    const [view, setView] = useState<'swap' | 'liquidity'>('swap');

    return (
        <main className="flex min-h-screen flex-col items-center p-6 md:p-12 bg-gray-900 text-white">
            <div className="z-10 w-full max-w-lg items-center justify-between font-mono text-sm lg:flex">
                <h1 className="text-2xl md:text-4xl font-bold">Tiny Uniswap</h1>
                <ConnectButton />
            </div>

            <div className="mt-8 w-full max-w-lg">
                <div className="flex border-b border-gray-700">
                    <button onClick={() => setView('swap')} className={`flex-1 p-3 font-bold transition-colors ${view === 'swap' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}>Swap</button>
                    <button onClick={() => setView('liquidity')} className={`flex-1 p-3 font-bold transition-colors ${view === 'liquidity' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}>Liquidity</button>
                </div>
            </div>

            <div className="mt-4 w-full max-w-lg bg-gray-800 p-6 rounded-lg shadow-xl">
                {view === 'swap' ? <SwapInterface /> : <LiquidityInterface />}
            </div>
        </main>
    );
}