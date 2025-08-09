'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useBalance, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// Import our constants
import { DEX_ADDRESSES } from '../constants/addresses';
import { AKIN_TOKEN_ABI, WETH_TOKEN_ABI, AMM_EXCHANGE_ABI } from '../constants/abis';

export function SwapInterface() {
    // Get connected account and chain info
    const { address, chain } = useAccount();
    const { writeContractAsync } = useWriteContract();

    // Component state
    const [amountIn, setAmountIn] = useState('');
    const [isApproving, setIsApproving] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);

    // Dynamically get the right addresses for the connected chain
    const currentAddresses = chain ? DEX_ADDRESSES[chain.id] : undefined;

    // --- HOOKS for on-chain data ---
    
    // 1. Get user's balance of the token they are paying with (AKT)
    const { data: aktBalance, refetch: refetchAktBalance } = useBalance({
        address,
        token: currentAddresses?.akinToken,
        query: { enabled: !!currentAddresses } // Only run query if addresses are valid for the chain
    });

    // 2. Get user's balance of the token they will receive (WETH)
    const { data: wethBalance, refetch: refetchWethBalance } = useBalance({
        address,
        token: currentAddresses?.wethToken,
        query: { enabled: !!currentAddresses }
    });

    // 3. Check how much AKT the AMM is already approved to spend
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: currentAddresses?.akinToken,
        abi: AKIN_TOKEN_ABI,
        functionName: 'allowance',
        args: [address!, currentAddresses?.ammExchange!], // User's address and the spender (exchange)
        query: { enabled: !!address && !!currentAddresses }
    });

    // --- DERIVED STATE ---

    // Check if the user needs to approve the amount they've entered
    const needsApproval = allowance !== undefined && amountIn && allowance < parseEther(amountIn);

    // --- ASYNC FUNCTIONS for contract interactions ---

    const handleApprove = async () => {
        if (!amountIn || !currentAddresses) return alert("Please enter an amount and connect to a supported chain.");
        
        setIsApproving(true);
        try {
            const tx = await writeContractAsync({
                address: currentAddresses.akinToken,
                abi: AKIN_TOKEN_ABI,
                functionName: 'approve',
                args: [currentAddresses.ammExchange, parseEther(amountIn)]
            });
            alert(`Approval successful!\nTransaction Hash: ${tx}`);
            // Refetch allowance after approval to update the UI
            await refetchAllowance();
        } catch (e) {
            console.error("Approval Error:", e);
            alert("Approval failed. See console for details.");
        } finally {
            setIsApproving(false);
        }
    };

    const handleSwap = async () => {
        if (!amountIn || !currentAddresses) return alert("Please enter an amount and connect to a supported chain.");
        if (needsApproval) return alert("You must approve the token spend before swapping.");
        
        setIsSwapping(true);
        try {
            const tx = await writeContractAsync({
                address: currentAddresses.ammExchange,
                abi: AMM_EXCHANGE_ABI,
                functionName: 'swap',
                args: [currentAddresses.akinToken, parseEther(amountIn)]
            });
            alert(`Swap successful!\nTransaction Hash: ${tx}`);
            // Refetch balances after a successful swap
            refetchAktBalance();
            refetchWethBalance();
            setAmountIn(''); // Clear input
        } catch (e) {
            console.error("Swap Error:", e);
            alert("Swap failed. See console for details.");
        } finally {
            setIsSwapping(false);
        }
    };

    // --- RENDER LOGIC ---

    // If the user is on an unsupported chain, show a message.
    if (!currentAddresses) {
        return <div className="text-center p-4 bg-yellow-900/50 rounded-lg">Please connect to a supported network.</div>
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">Swap</h2>
            
            {/* INPUT TOKEN UI */}
            <div className="p-4 rounded-lg bg-gray-900/70">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">You Pay</label>
                    <p className="text-xs text-gray-400">Balance: {aktBalance ? parseFloat(formatEther(aktBalance.value)).toFixed(4) : '0'}</p>
                </div>
                <div className="flex items-center">
                    <input 
                        type="number" 
                        value={amountIn} 
                        onChange={e => setAmountIn(e.target.value)} 
                        className="w-full p-2 bg-gray-800 rounded-l-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="0.0" 
                    />
                    <span className="p-2 bg-gray-700 rounded-r-md font-bold">AKT</span>
                </div>
            </div>
            
            <div className="text-center text-2xl my-4 text-gray-400">↓</div>

            {/* OUTPUT TOKEN UI */}
            <div className="p-4 rounded-lg bg-gray-900/70">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">You Receive</label>
                     <p className="text-xs text-gray-400">Balance: {wethBalance ? parseFloat(formatEther(wethBalance.value)).toFixed(4) : '0'}</p>
                </div>
                <div className="flex items-center">
                    <input type="number" className="w-full p-2 bg-gray-800 rounded-l-md text-white placeholder-gray-500" placeholder="0.0" disabled />
                    <span className="p-2 bg-gray-700 rounded-r-md font-bold">WETH</span>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6">
                {needsApproval ? (
                    <button 
                        onClick={handleApprove} 
                        disabled={isApproving}
                        className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition-colors disabled:bg-gray-500 disabled:cursor-wait"
                    >
                        {isApproving ? 'Approving...' : 'Approve AKT'}
                    </button>
                ) : (
                    <button 
                        onClick={handleSwap} 
                        disabled={!amountIn || isSwapping}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isSwapping ? 'Swapping...' : 'Swap'}
                    </button>
                )}
            </div>
        </div>
    );
}