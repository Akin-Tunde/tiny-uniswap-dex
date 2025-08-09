'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <p className="text-sm font-medium text-white">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
        <button onClick={() => disconnect()} className="text-xs text-red-400 hover:text-red-300">
          Disconnect
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => connect({ connector: injected() })} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
      Connect Wallet
    </button>
  );
}