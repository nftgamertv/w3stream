'use client';

import { ReactNode } from 'react';
import { createSolanaDevnet, createSolanaLocalnet, createWalletUiConfig, WalletUi } from '@wallet-ui/react';

const config = createWalletUiConfig({
    clusters: [
        // You can add mainnet when you're ready
        // createSolanaMainnet('https://mainnet.your-rpc.com?api-key=secret'),
        createSolanaDevnet(),
        createSolanaLocalnet(),
    ],
});

export function SolanaProvider({ children }: { children: ReactNode }) {
    return <WalletUi config={config}>{children}</WalletUi>;
}