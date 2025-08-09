'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useBalance, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// Import our constants
import { DEX_ADDRESSES } from '../constants/addresses';
import { AKIN_TOKEN_ABI, WETH_TOKEN_ABI, AMM_EXCHANGE_ABI } from '../constants/abis';

export function LiquidityInterface() {
    const { address, chain } = useAccount();
    const { writeContractAsync } = useWriteContract();

    // --- STATE MANAGEMENT ---
    // State for the "Add Liquidity" section
    const [addAktAmount, setAddAktAmount] = useState('');
    const [addWethAmount, setAddWethAmount] = useState('');

    // State for the "Remove Liquidity" section
    const [removeLpAmount, setRemoveLpAmount] = useState('');
    
    // Unified loading state for buttons
    const [isLoading, setIsLoading] = useState<{ action: string, status: boolean }>({ action: '', status: false });

    // --- DYNAMIC ADDRESSES ---
    const currentAddresses = chain ? DEX_ADDRESSES[chain.id] : undefined;

    // --- WAGMI HOOKS FOR ON-CHAIN DATA ---

    // Balances for all three relevant tokens
    const { data: aktBalance, refetch: refetchAktBalance } = useBalance({ address, token: currentAddresses?.akinToken, query: { enabled: !!currentAddresses } });
    const { data: wethBalance, refetch: refetchWethBalance } = useBalance({ address, token: currentAddresses?.wethToken, query: { enabled: !!currentAddresses } });
    const { data: lpBalance, refetch: refetchLpBalance } = useBalance({ address, token: currentAddresses?.ammExchange, query: { enabled: !!currentAddresses } });

    // Allowances for the two tokens we will add
    const { data: aktAllowance, refetch: refetchAktAllowance } = useReadContract({ address: currentAddresses?.akinToken, abi: AKIN_TOKEN_ABI, functionName: 'allowance', args: [address!, currentAddresses?.ammExchange!], query: { enabled: !!address && !!currentAddresses }});
    const { data: wethAllowance, refetch: refetchWethAllowance } = useReadContract({ address: currentAddresses?.wethToken, abi: WETH_TOKEN_ABI, functionName: 'allowance', args: [address!, currentAddresses?.ammExchange!], query: { enabled: !!address && !!currentAddresses }});

    // Pool reserves to calculate the correct deposit ratio
    const { data: reserves } = useReadContract({ address: currentAddresses?.ammExchange, abi: AMM_EXCHANGE_ABI, functionName: 'getReserves', query: { enabled: !!currentAddresses }});
    const reserveA = reserves?.[0];
    const reserveB = reserves?.[1];

    // --- DERIVED STATE ---
    // Check if approvals are needed for the entered amounts
    const needsAktApproval = aktAllowance !== undefined && addAktAmount && aktAllowance < parseEther(addAktAmount);
    const needsWethApproval = wethAllowance !== undefined && addWethAmount && wethAllowance < parseEther(addWethAmount);

    // --- EVENT HANDLERS & LOGIC ---

    // This effect helps users by calculating the required amount for the second token
    useEffect(() => {
        if (addAktAmount && reserveA && reserveB && reserveA > 0) {
            const wethRequired = (BigInt(parseEther(addAktAmount).toString()) * reserveB) / reserveA;
            setAddWethAmount(formatEther(wethRequired));
        }
    }, [addAktAmount, reserveA, reserveB]);

    // Generic approval function for either token
    const handleApprove = async (tokenAddress: `0x${string}`, amount: string, abi: any) => {
        if (!currentAddresses) return alert("Please connect to a supported chain.");
        const symbol = tokenAddress === currentAddresses.akinToken ? "AKT" : "WETH";
        setIsLoading({ action: `approve_${symbol}`, status: true });
        try {
            const tx = await writeContractAsync({ address: tokenAddress, abi: abi, functionName: 'approve', args: [currentAddresses.ammExchange, parseEther(amount)] });
            alert(`Approval for ${symbol} successful!`);
            await refetchAktAllowance();
            await refetchWethAllowance();
        } catch (e) {
            console.error(e); alert(`Approval for ${symbol} failed.`);
        } finally {
            setIsLoading({ action: '', status: false });
        }
    };

    const handleAddLiquidity = async () => {
        if (!addAktAmount || !addWethAmount || !currentAddresses) return alert("Please enter amounts for both tokens.");
        setIsLoading({ action: 'add', status: true });
        try {
            const tx = await writeContractAsync({ address: currentAddresses.ammExchange, abi: AMM_EXCHANGE_ABI, functionName: 'addLiquidity', args: [parseEther(addAktAmount), parseEther(addWethAmount)] });
            alert("Liquidity added successfully!");
            // Refetch all balances to update UI
            refetchAktBalance();
            refetchWethBalance();
            refetchLpBalance();
            setAddAktAmount('');
            setAddWethAmount('');
        } catch (e) {
            console.error(e); alert("Failed to add liquidity.");
        } finally {
            setIsLoading({ action: '', status: false });
        }
    };

    const handleRemoveLiquidity = async () => {
        if (!removeLpAmount || !currentAddresses) return alert("Please enter the amount of LP tokens to remove.");
        setIsLoading({ action: 'remove', status: true });
        try {
            const tx = await writeContractAsync({ address: currentAddresses.ammExchange, abi: AMM_EXCHANGE_ABI, functionName: 'removeLiquidity', args: [parseEther(removeLpAmount)] });
            alert("Liquidity removed successfully!");
            // Refetch all balances
            refetchAktBalance();
            refetchWethBalance();
            refetchLpBalance();
            setRemoveLpAmount('');
        } catch (e) {
            console.error(e); alert("Failed to remove liquidity.");
        } finally {
            setIsLoading({ action: '', status: false });
        }
    };

    // --- RENDER LOGIC ---

    if (!currentAddresses) {
        return <div className="text-center p-4 bg-yellow-900/50 rounded-lg">Please connect to a supported network.</div>
    }

    return (
        <div>
            {/* ADD LIQUIDITY SECTION */}
            <div className="p-4 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Add Liquidity</h3>
                <div className="space-y-4">
                    {/* AKT INPUT */}
                    <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-sm font-medium text-gray-300">AKT Amount</label><p className="text-xs text-gray-400">Balance: {aktBalance ? parseFloat(formatEther(aktBalance.value)).toFixed(4) : '0'}</p></div>
                        <input type="number" value={addAktAmount} onChange={e => setAddAktAmount(e.target.value)} className="w-full p-2 bg-gray-800 rounded-md text-white" placeholder="0.0" />
                        {needsAktApproval && <button onClick={() => handleApprove(currentAddresses.akinToken, addAktAmount, AKIN_TOKEN_ABI)} disabled={isLoading.status} className="w-full mt-2 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-bold">{isLoading.action === 'approve_AKT' ? 'Approving...' : 'Approve AKT'}</button>}
                    </div>
                    {/* WETH INPUT */}
                    <div>
                        <div className="flex justify-between items-center mb-1"><label className="text-sm font-medium text-gray-300">WETH Amount</label><p className="text-xs text-gray-400">Balance: {wethBalance ? parseFloat(formatEther(wethBalance.value)).toFixed(4) : '0'}</p></div>
                        <input type="number" value={addWethAmount} onChange={e => setAddWethAmount(e.target.value)} className="w-full p-2 bg-gray-800 rounded-md text-white" placeholder="0.0" />
                        {needsWethApproval && <button onClick={() => handleApprove(currentAddresses.wethToken, addWethAmount, WETH_TOKEN_ABI)} disabled={isLoading.status} className="w-full mt-2 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-bold">{isLoading.action === 'approve_WETH' ? 'Approving...' : 'Approve WETH'}</button>}
                    </div>
                </div>
                <div className="mt-4">
                    <button onClick={handleAddLiquidity} disabled={isLoading.status || needsAktApproval || needsWethApproval || !addAktAmount} className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:bg-gray-500 disabled:cursor-not-allowed">{isLoading.action === 'add' ? 'Supplying...' : 'Supply Liquidity'}</button>
                </div>
            </div>

            {/* REMOVE LIQUIDITY SECTION */}
            <div className="p-4 mt-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Remove Liquidity</h3>
                <div className="flex justify-between items-center mb-1"><label className="text-sm font-medium text-gray-300">Your LP Tokens</label><p className="text-xs text-gray-400">Balance: {lpBalance ? parseFloat(formatEther(lpBalance.value)).toFixed(4) : '0'}</p></div>
                <input type="number" value={removeLpAmount} onChange={e => setRemoveLpAmount(e.target.value)} className="w-full p-2 bg-gray-800 rounded-md text-white" placeholder="0.0" />
                <div className="mt-4">
                    <button onClick={handleRemoveLiquidity} disabled={isLoading.status || !removeLpAmount} className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold disabled:bg-gray-500 disabled:cursor-not-allowed">{isLoading.action === 'remove' ? 'Removing...' : 'Remove Liquidity'}</button>
                </div>
            </div>
        </div>
    );
}