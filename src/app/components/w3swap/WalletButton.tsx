"use client"

import { useWalletUi, useWalletUiWallet } from "@wallet-ui/react"
import { useBaseModal } from "@wallet-ui/react"
import { Wallet, LogOut, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import type { UiWallet, UiWalletAccount } from "@wallet-standard/react"
// BaseModalControl type from useBaseModal return type
type BaseModalControl = ReturnType<typeof useBaseModal>

export default function WalletButton() {
  const { connected, account, wallet, wallets, connect, disconnect } = useWalletUi()
  const modal = useBaseModal()
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)

  const handleDisconnect = () => {
    disconnect()
    modal.close()
  }

  const handleSwitchWallet = () => {
    modal.open()
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <>
      <div className="relative">
        {/* Glassomorphic glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-xl opacity-50" />
        
        {connected && account ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "relative flex items-center gap-2 rounded-full",
                  "border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10",
                  "px-4 py-2 text-sm font-medium text-white",
                  "transition-all duration-300",
                  "hover:from-cyan-500/20 hover:to-purple-500/20",
                  "backdrop-blur-md",
                  "shadow-lg shadow-cyan-500/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="hidden sm:inline">
                    {formatAddress(account.address)}
                  </span>
                  <span className="sm:hidden">
                    {formatAddress(account.address)}
                  </span>
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              side="bottom"
              className={cn(
                "w-56 border-slate-800/50 bg-black/80",
                "backdrop-blur-md",
                "shadow-lg shadow-cyan-500/10",
                "animate-in fade-in-0",
                "data-[side=bottom]:slide-in-from-top-1",
                "data-[side=left]:!slide-in-from-right-0",
                "data-[side=right]:!slide-in-from-left-0",
                "data-[side=top]:!slide-in-from-bottom-0",
                "!zoom-in-0"
              )}
            >
              <DropdownMenuItem
                onClick={handleSwitchWallet}
                className="cursor-pointer text-slate-300 focus:bg-slate-800/50 focus:text-slate-100"
              >
                <Wallet className="mr-2 h-4 w-4" />
                <span>Switch Wallet</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800/50" />
              <DropdownMenuItem
                onClick={handleDisconnect}
                className="cursor-pointer text-red-400 focus:bg-slate-800/50 focus:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Disconnect</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={modal.open}
            className={cn(
              "relative flex items-center gap-2 rounded-full",
              "border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10",
              "px-5 py-2.5 text-sm font-medium text-white",
              "transition-all duration-300",
              "hover:from-cyan-500/20 hover:to-purple-500/20",
              "backdrop-blur-md",
              "shadow-lg shadow-cyan-500/10"
            )}
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>

      {/* Wallet selection modal - custom implementation to handle wallets without accounts */}
      <WalletListModal 
        modal={modal}
        wallets={wallets}
        connect={connect}
        connectingWallet={connectingWallet}
        setConnectingWallet={setConnectingWallet}
      />
    </>
  )
}

// Separate component to handle wallet list with proper hook usage
function WalletListModal({
  modal,
  wallets,
  connect,
  connectingWallet,
  setConnectingWallet
}: {
  modal: BaseModalControl
  wallets: UiWallet[]
  connect: (account: UiWalletAccount) => void
  connectingWallet: string | null
  setConnectingWallet: (name: string | null) => void
}) {
  if (!modal.api.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={() => modal.close()}
      />
      <div className={cn(
        "relative z-50 w-full max-w-md rounded-lg border border-slate-800/50 bg-black/98",
        "backdrop-blur-md shadow-lg shadow-cyan-500/10 p-6",
        "animate-in fade-in-0 zoom-in-95"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Connect a wallet on Solana to continue</h2>
          <button
            onClick={() => modal.close()}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {wallets.map((w) => (
            <WalletButtonItem
              key={w.name}
              wallet={w}
              connect={connect}
              connectingWallet={connectingWallet}
              setConnectingWallet={setConnectingWallet}
              onConnect={() => modal.close()}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function WalletButtonItem({
  wallet,
  connect,
  connectingWallet,
  setConnectingWallet,
  onConnect
}: {
  wallet: UiWallet
  connect: (account: UiWalletAccount) => void
  connectingWallet: string | null
  setConnectingWallet: (name: string | null) => void
  onConnect: () => void
}) {
  const walletHook = useWalletUiWallet({ wallet })
  const hasAccounts = wallet.accounts.length > 0
  const isConnecting = connectingWallet === wallet.name

  const handleClick = async () => {
    try {
      setConnectingWallet(wallet.name)
      if (!hasAccounts) {
        // Connect wallet first to get accounts
        const accounts = await walletHook.connect()
        if (accounts && accounts.length > 0) {
          connect(accounts[0])
          onConnect()
        }
      } else {
        // Wallet already has accounts, just connect
        connect(wallet.accounts[0])
        onConnect()
      }
    } catch (error) {
      console.error(`Error connecting ${wallet.name}:`, error)
    } finally {
      setConnectingWallet(null)
    }
  }

  return (
    <button
      disabled={isConnecting}
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
        "border border-slate-800/50 bg-slate-900/50",
        "hover:bg-slate-800/50 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isConnecting && "animate-pulse"
      )}
    >
      {wallet.icon && (
        <img 
          src={wallet.icon} 
          alt={wallet.name} 
          className="w-6 h-6"
          onError={(e) => {
            // Fallback if icon fails to load
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <span className="text-white font-medium">{wallet.name}</span>
      {isConnecting && (
        <span className="ml-auto text-slate-400 text-sm">Connecting...</span>
      )}
    </button>
  )
}

