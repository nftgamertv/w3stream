'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  Info, 
  Upload, 
  Loader2,
  Settings,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ScrollText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWalletUi } from '@wallet-ui/react';
import { getConnection } from '@/lib/w3swap/anchor';
import { PublicKey, Keypair, SystemProgram, Transaction, VersionedTransaction } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@/lib/w3swap/constants';
import {
  MINT_SIZE,
  TYPE_SIZE,
  LENGTH_SIZE,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeTransferFeeConfigInstruction,
  createInitializeMintCloseAuthorityInstruction,
  createInitializeNonTransferableMintInstruction,
  createInitializePermanentDelegateInstruction,
} from '@solana/spl-token';
import { createInitializeInstruction as createTokenMetadataInitializeInstruction, pack as packTokenMetadata } from '@solana/spl-token-metadata';
import { toast } from 'sonner';

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  externalUrl: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface TokenExtensions {
  transferFee: boolean;
  transferFeeConfig?: {
    feeBasisPoints?: number;
    maxFee?: number;
    withdrawAuthority?: string;
    transferFeeAuthority?: string;
  };
  mintCloseAuthority: boolean;
  interestBearing: boolean;
  interestBearingConfig?: {
    rate?: number;
    rateAuthority?: string;
  };
  nonTransferable: boolean;
  permanentDelegate: boolean;
  permanentDelegateAddress?: string;
}

export default function CreateToken2022Page() {
  const { account, wallet, connected } = useWalletUi();
  const [activeTab, setActiveTab] = useState('basic');
  const [isCreating, setIsCreating] = useState(false);
  const [tokenConfig, setTokenConfig] = useState({
    decimals: 9,
    initialSupply: '1000000000',
    mintAuthority: '',
    freezeAuthority: '',
    metadataAuthority: '',
  });
  const [enableMintAuthority, setEnableMintAuthority] = useState(false);
  const [enableFreezeAuthority, setEnableFreezeAuthority] = useState(false);

  const [metadata, setMetadata] = useState<TokenMetadata>({
    name: '',
    symbol: '',
    description: '',
    image: '',
    externalUrl: '',
    attributes: [],
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [extensions, setExtensions] = useState<TokenExtensions>({
    transferFee: false,
    mintCloseAuthority: false,
    interestBearing: false,
    nonTransferable: false,
    permanentDelegate: false,
  });

  const [newAttribute, setNewAttribute] = useState({ trait_type: '', value: '' });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const infoBoxRef = useRef<HTMLDivElement | null>(null);
  const logsRef = useRef<HTMLDivElement | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoBoxRef.current && !infoBoxRef.current.contains(event.target as Node)) {
        setShowInfoBox(false);
      }
    };

    if (showInfoBox) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfoBox]);

  const validateBasicTab = (): boolean => {
    return true;
  };

  const validateMetadataTab = (): boolean => {
    return !!metadata.name.trim() && !!metadata.symbol.trim();
  };

  const validateExtensionsTab = (): boolean => {
    if (extensions.transferFee) {
      const bps = extensions.transferFeeConfig?.feeBasisPoints;
      const maxFee = extensions.transferFeeConfig?.maxFee;
      if (bps === undefined || bps < 0 || maxFee === undefined || maxFee < 0) return false;
    }
    if (extensions.permanentDelegate) {
      if (!extensions.permanentDelegateAddress?.trim()) return false;
      try {
        new PublicKey(extensions.permanentDelegateAddress);
      } catch {
        return false;
      }
    }
    return true;
  };

  const isTabValid = (tab: string): boolean => {
    switch (tab) {
      case 'basic':
        return validateBasicTab();
      case 'metadata':
        return validateMetadataTab();
      case 'extensions':
        return validateExtensionsTab();
      case 'logs':
        return logs.length > 0;
      default:
        return false;
    }
  };

  const canAccessTab = (tab: string | undefined): boolean => {
    if (!tab) return false;
    
    if (tab === 'logs') {
      return logs.length > 0;
    }
    
    const tabs = ['basic', 'metadata', 'extensions'];
    const targetIndex = tabs.indexOf(tab);
    if (targetIndex === -1) return false;
    
    const currentIndex = tabs.indexOf(activeTab);
    if (targetIndex <= currentIndex) return true;
    
    for (let i = 0; i < targetIndex; i++) {
      const tab = tabs[i];
      if (tab && !isTabValid(tab)) {
        return false;
      }
    }
    return true;
  };

  const handleTabChange = (newTab: string | undefined) => {
    if (newTab && canAccessTab(newTab)) {
      setActiveTab(newTab);
    } else if (newTab) {
      toast.error('Please complete all required fields in previous tabs before proceeding');
    }
  };

  const handleNext = () => {
    if (!isTabValid(activeTab)) {
      toast.error('Please complete all required fields before proceeding');
      return;
    }
    
    const tabs = ['basic', 'metadata', 'extensions', ...(logs.length > 0 ? ['logs'] : [])];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      if (nextTab && canAccessTab(nextTab)) {
        setActiveTab(nextTab);
      } else {
        toast.error('Please complete all required fields before proceeding');
      }
    }
  };

  const handlePrevious = () => {
    const tabs = ['basic', 'metadata', 'extensions', ...(logs.length > 0 ? ['logs'] : [])];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      const prevTab = tabs[currentIndex - 1];
      if (prevTab) {
        setActiveTab(prevTab);
      }
    }
  };

  const pushLog = (msg: string) => {
    const ts = new Date().toISOString().replace('T', ' ').replace('Z', '');
    setLogs((l) => [...l, `[${ts}] ${msg}`]);
    console.log(msg);
  };

  useEffect(() => {
    if (logsRef.current && logs.length > 0 && activeTab === 'logs') {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs, activeTab]);

  useEffect(() => {
    const pk = account?.address;
    if (!pk) return;
    if (enableMintAuthority && !tokenConfig.mintAuthority) {
      setTokenConfig((prev) => ({ ...prev, mintAuthority: pk }));
    }
    if (enableFreezeAuthority && !tokenConfig.freezeAuthority) {
      setTokenConfig((prev) => ({ ...prev, freezeAuthority: pk }));
    }
  }, [account?.address, enableMintAuthority, enableFreezeAuthority]);

  const metadataAuthorityOrDefault = (pk: PublicKey) => {
    try { return tokenConfig.metadataAuthority ? new PublicKey(tokenConfig.metadataAuthority) : pk; } catch { return pk; }
  };

  useEffect(() => {
    const url = (metadata.externalUrl || '').trim();
    if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
      setPreviewImage(metadata.image || null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url, { method: 'GET' });
        const ct = res.headers.get('content-type') || '';
        if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
        if (ct.includes('application/json') || url.toLowerCase().endsWith('.json')) {
          const j = await res.json();
          const hasShape = j && typeof j === 'object' && j.name && j.symbol && j.description && j.image && Array.isArray(j.attributes);
          if (hasShape && typeof j.image === 'string') {
            if (!cancelled) setPreviewImage(j.image as string);
            return;
          }
        }
        if (!cancelled) setPreviewImage(metadata.image || null);
      } catch {
        if (!cancelled) setPreviewImage(metadata.image || null);
      }
    })();
    return () => { cancelled = true; };
  }, [metadata.externalUrl, metadata.image]);

  const handleAddAttribute = () => {
    if (newAttribute.trait_type && newAttribute.value) {
      setMetadata({
        ...metadata,
        attributes: [...metadata.attributes, newAttribute],
      });
      setNewAttribute({ trait_type: '', value: '' });
    }
  };

  const handleRemoveAttribute = (index: number) => {
    setMetadata({
      ...metadata,
      attributes: metadata.attributes.filter((_, i) => i !== index),
    });
  };

  const handlePickImage = () => fileInputRef.current?.click();
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setMetadata((prev) => ({ ...prev, image: url }));
  };

  const pow10 = (d: number) => BigInt(10) ** BigInt(Math.max(0, Math.min(18, d)));

  const handleCreateToken = async () => {
    if (!connected || !account || !wallet) {
      toast.error('Connect your wallet to create a token');
      return;
    }
    try {
      setIsCreating(true);
      setActiveTab('logs');
      const connection = getConnection();
      pushLog('Starting token creation...');

      const decimals = Number(tokenConfig.decimals) || 0;
      const mintAuthority = tokenConfig.mintAuthority ? new PublicKey(tokenConfig.mintAuthority) : new PublicKey(account.address);
      const freezeAuthority = tokenConfig.freezeAuthority ? new PublicKey(tokenConfig.freezeAuthority) : new PublicKey(account.address);

      const name = metadata.name || '';
      const symbol = metadata.symbol || '';
      const uri = metadata.externalUrl || '';

      const mintKeypair = Keypair.generate();

      const extList: ExtensionType[] = [ExtensionType.MetadataPointer as any];
      if (extensions.transferFee) extList.push(ExtensionType.TransferFeeConfig as any);
      if (extensions.mintCloseAuthority) extList.push(ExtensionType.MintCloseAuthority as any);
      if (extensions.interestBearing) extList.push(ExtensionType.InterestBearingConfig as any);
      if (extensions.nonTransferable) extList.push(ExtensionType.NonTransferable as any);
      if (extensions.permanentDelegate) extList.push(ExtensionType.PermanentDelegate as any);

      const tokenMetadataLen = packTokenMetadata({
        mint: mintKeypair.publicKey,
        name,
        symbol,
        uri,
        additionalMetadata: [],
      } as any).length;
      const mintSpace = getMintLen(extList as any, { [ExtensionType.TokenMetadata]: tokenMetadataLen } as any);
      try { pushLog(`Extensions: ${extList.map((e) => ExtensionType[e as any]).join(', ') || 'None'}`); } catch {}
      pushLog(`TokenMetadata length: ${tokenMetadataLen} bytes`);
      pushLog(`Computed mint space: ${mintSpace} bytes`);

      const spaceWithout = getMintLen([ExtensionType.MetadataPointer as any] as any);
      const lamports = await connection.getMinimumBalanceForRentExemption(
        spaceWithout + tokenMetadataLen + TYPE_SIZE + LENGTH_SIZE,
      );
      pushLog(`Creating mint account; rent=${lamports} lamports`);

      const fullTx = new Transaction();
      fullTx.add(SystemProgram.createAccount({
        fromPubkey: new PublicKey(account.address),
        newAccountPubkey: mintKeypair.publicKey,
        space: spaceWithout,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }));

      const mdUpdateAuth = metadataAuthorityOrDefault(new PublicKey(account.address));
      pushLog(`Metadata update authority: ${mdUpdateAuth.toBase58()}`);
      fullTx.add(createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey,
        mdUpdateAuth,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID,
      ));
      fullTx.add(createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        mintAuthority,
        freezeAuthority,
        TOKEN_2022_PROGRAM_ID,
      ));

      if (extensions.transferFee) {
        const feeBps = Number(extensions.transferFeeConfig?.feeBasisPoints || 0);
        const maxFee = Number(extensions.transferFeeConfig?.maxFee || 0);
        const maxFeeBig = BigInt(maxFee);
        const tfa = new PublicKey(extensions.transferFeeConfig?.transferFeeAuthority || account.address);
        const wwa = new PublicKey(extensions.transferFeeConfig?.withdrawAuthority || account.address);
        fullTx.add(createInitializeTransferFeeConfigInstruction(
          mintKeypair.publicKey,
          tfa,
          wwa,
          feeBps,
          maxFeeBig,
          TOKEN_2022_PROGRAM_ID,
        ));
        pushLog(`TransferFeeConfig set: bps=${feeBps}, maxFee=${maxFee}`);
      }

      if (extensions.mintCloseAuthority) {
        const closeAuth = freezeAuthority;
        fullTx.add(createInitializeMintCloseAuthorityInstruction(
          mintKeypair.publicKey,
          closeAuth,
          TOKEN_2022_PROGRAM_ID,
        ));
        pushLog(`MintCloseAuthority set: ${closeAuth.toBase58()}`);
      }

      if (extensions.interestBearing) {
        console.warn('InterestBearingConfig extension not supported in current @solana/spl-token. Skipping.');
        pushLog('InterestBearingConfig not supported by SDK — skipped.');
      }

      if (extensions.nonTransferable) {
        fullTx.add(createInitializeNonTransferableMintInstruction(
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID,
        ));
        pushLog('NonTransferable enabled');
      }

      if (extensions.permanentDelegate) {
        const delegate = new PublicKey(extensions.permanentDelegateAddress || account.address);
        fullTx.add(createInitializePermanentDelegateInstruction(
          mintKeypair.publicKey,
          delegate,
          TOKEN_2022_PROGRAM_ID,
        ));
        pushLog(`PermanentDelegate set: ${delegate.toBase58()}`);
      }

      fullTx.add(
        createTokenMetadataInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mintKeypair.publicKey,
          updateAuthority: mdUpdateAuth,
          mint: mintKeypair.publicKey,
          mintAuthority,
          name,
          symbol,
          uri,
        })
      );
      pushLog(`Metadata init: name='${name}', symbol='${symbol}', uri='${uri}'`);

      const initialUi = tokenConfig.initialSupply ? Number(tokenConfig.initialSupply) : 0;
      const initialRaw = initialUi > 0 ? BigInt(Math.trunc(initialUi)) * pow10(decimals) : BigInt(0);
      if (initialRaw > BigInt(0)) {
        const ata = await getAssociatedTokenAddress(
          mintKeypair.publicKey,
          mintAuthority,
          false,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        );
        fullTx.add(createAssociatedTokenAccountInstruction(
          new PublicKey(account.address),
          ata,
          mintAuthority,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        ));
        fullTx.add(createMintToInstruction(
          mintKeypair.publicKey,
          ata,
          mintAuthority,
          initialRaw,
          [],
          TOKEN_2022_PROGRAM_ID,
        ));
        pushLog(`Initial supply: ${initialUi} tokens (raw=${initialRaw.toString()}) to ATA ${ata.toBase58()}`);
      }

      fullTx.feePayer = new PublicKey(account.address);
      const { blockhash } = await connection.getLatestBlockhash();
      fullTx.recentBlockhash = blockhash;
      fullTx.partialSign(mintKeypair);
      pushLog('Submitting single transaction for mint + metadata...');
      
      // Sign transaction with wallet
      const signedTx = await (wallet as any).signTransaction(fullTx);
      const txSig = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txSig, 'confirmed');
      
      pushLog(`Submitted signature: ${txSig}`);
      toast.success(`Token created: ${mintKeypair.publicKey.toBase58()}`);
    } catch (e: any) {
      console.error('Token creation error', e);
      try { pushLog(`Error message: ${e?.message || e}`); } catch {}
      try { if (e?.code) pushLog(`Error code: ${e.code}`); } catch {}
      try { if (e?.logs) (e.logs as string[]).forEach((l: string) => pushLog(`[wallet] ${l}`)); } catch {}
      try { if (e?.stack) pushLog(e.stack); } catch {}
      toast.error(e?.message || 'Failed to create token');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
          Create Token-2022
        </h1>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <p className="text-slate-400">
            Deploy a new SPL Token-2022 with metadata and optional extensions
          </p>
          <div className="relative" ref={infoBoxRef}>
            <button
              onClick={() => setShowInfoBox(!showInfoBox)}
              className="inline-flex items-center justify-center rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-900/50 transition-colors"
              aria-label="Learn more about Token-2022"
            >
              <Info className="h-4 w-4" />
            </button>
            {showInfoBox && (
              <div className="absolute top-full left-0 mt-2 w-80 p-3 rounded-lg glass-card border border-slate-800 shadow-lg z-50">
                <p className="text-sm text-white">
                  Token-2022 (Token Extensions) allows for advanced features like transfer fees, 
                  interest bearing tokens, and more. Metadata is stored on-chain for better discoverability.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex gap-6 w-full max-w-full">
        {/* Left Column - Sidebar Navigation */}
        <div className="w-64 shrink-0">
          <div className="sticky top-0 rounded-lg glass-card border border-slate-800 p-2 backdrop-blur-sm shadow-lg flex flex-col">
                <div className="space-y-1">
                  {[
                    { id: 'basic', label: 'Basic Config', icon: Settings },
                    { id: 'metadata', label: 'Metadata', icon: FileText },
                    { id: 'extensions', label: 'Extensions', icon: Sparkles },
                    ...(logs.length > 0 ? [{ id: 'logs', label: 'Logs', icon: ScrollText }] : []),
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const canAccess = canAccessTab(tab.id);
                    const isValid = isTabValid(tab.id);
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        disabled={!canAccess && activeTab !== tab.id}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                            : 'text-slate-400 hover:bg-slate-900/50 hover:text-white',
                          !isValid && isActive && 'ring-2 ring-yellow-500/50',
                          !canAccess && activeTab !== tab.id && 'opacity-40'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{tab.label}</span>
                        {!isValid && activeTab !== tab.id && (
                          <span className="text-yellow-400 text-xs">*</span>
                        )}
                        {isActive && (
                          <div className="h-2 w-2 rounded-full bg-cyan-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={activeTab === 'basic'}
                      size="sm"
                      className="flex-1 border-slate-700 hover:border-cyan-500"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    
                    {activeTab !== 'extensions' && (
                      <Button onClick={handleNext} size="sm" className="flex-1 btn-brand">
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <Button
                    onClick={handleCreateToken}
                    disabled={!metadata.name || !metadata.symbol || isCreating || !canAccessTab('extensions') || !connected}
                    size="sm"
                    className="w-full btn-brand"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Create Token
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-slate-400 text-center">
                    ~0.02 SOL for rent and fees
                  </p>
                </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 ml-0 space-y-6 max-w-full overflow-x-hidden">
          {/* Live Preview */}
          <div className="sticky top-0 z-10 -mb-4">
            <div className="rounded-lg glass-card border border-slate-800 px-3 py-2 text-xs mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-900/50 overflow-hidden flex items-center justify-center shrink-0">
                  {previewImage ? (
                    <img src={previewImage} alt="Token" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] text-slate-400">—</span>
                  )}
                </div>
                <div className="flex-1 flex items-center gap-3 flex-wrap">
                  <span className="text-slate-400">Preview:</span>
                  <span className="font-medium text-white">{metadata.name || '(unset)'}</span>
                  <span className="text-slate-400">({metadata.symbol || '—'}{tokenConfig.decimals !== undefined ? ` · ${tokenConfig.decimals}dp` : ''})</span>
                  {tokenConfig.initialSupply && tokenConfig.initialSupply !== '' ? (
                    <>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-400 text-[10px]">
                        {Number(tokenConfig.initialSupply).toLocaleString()} supply
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Creation Logs */}
          {activeTab === 'logs' && logs.length > 0 ? (
            <Card className="glass-card">
              <CardHeader className="pb-2 pt-2 px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white">Creation Logs</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setLogs([]);
                      if (canAccessTab('extensions')) {
                        setActiveTab('extensions');
                      } else if (canAccessTab('metadata')) {
                        setActiveTab('metadata');
                      } else {
                        setActiveTab('basic');
                      }
                    }} 
                    disabled={isCreating} 
                    className="h-7 text-xs px-3 border-slate-700 hover:border-cyan-500"
                  >
                    Clear Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-2">
                <div ref={logsRef} className="h-24 overflow-y-auto overflow-x-hidden rounded bg-slate-900/50 p-1.5 text-[10px] whitespace-pre-wrap break-words font-mono leading-relaxed text-slate-300">
                  <div className="space-y-0">
                    {logs.map((l, i) => (
                      <div key={i} className="text-slate-400 leading-tight break-words break-all">{l}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Tab Content */}
          {activeTab !== 'logs' && (
            <>
              {/* Basic Configuration */}
              {activeTab === 'basic' && (
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white">Token Configuration</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Set up the basic parameters for your token
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="decimals" className="text-sm text-white">Decimals</Label>
                        <Input
                          id="decimals"
                          type="number"
                          min="0"
                          max="9"
                          value={tokenConfig.decimals}
                          onChange={(e) => setTokenConfig({ ...tokenConfig, decimals: parseInt(e.target.value) || 0 })}
                          className="h-9 text-sm bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="supply" className="text-sm text-white">Initial Supply</Label>
                        <Input
                          id="supply"
                          type="text"
                          placeholder="1,000,000,000"
                          value={tokenConfig.initialSupply && tokenConfig.initialSupply !== '' ? Number(tokenConfig.initialSupply).toLocaleString() : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setTokenConfig({ ...tokenConfig, initialSupply: value });
                          }}
                          className="h-9 text-sm bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="enableMintAuth"
                            checked={enableMintAuthority}
                            onChange={(e) => {
                              setEnableMintAuthority(e.target.checked);
                              if (!e.target.checked) {
                                setTokenConfig({ ...tokenConfig, mintAuthority: '' });
                              } else if (!tokenConfig.mintAuthority && account?.address) {
                                setTokenConfig({ ...tokenConfig, mintAuthority: account.address });
                              }
                            }}
                            className="h-4 w-4 rounded border-2 border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                          />
                          <Label htmlFor="enableMintAuth" className="text-sm font-medium cursor-pointer text-white">
                            Mint Authority
                          </Label>
                        </div>
                        {enableMintAuthority && (
                          <Input
                            id="mintAuth"
                            type="text"
                            placeholder={account?.address || "Wallet address"}
                            value={tokenConfig.mintAuthority}
                            onChange={(e) => setTokenConfig({ ...tokenConfig, mintAuthority: e.target.value })}
                            className="h-9 text-sm font-mono text-xs ml-6 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                          />
                        )}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="enableFreezeAuth"
                            checked={enableFreezeAuthority}
                            onChange={(e) => {
                              setEnableFreezeAuthority(e.target.checked);
                              if (!e.target.checked) {
                                setTokenConfig({ ...tokenConfig, freezeAuthority: '' });
                              } else if (!tokenConfig.freezeAuthority && account?.address) {
                                setTokenConfig({ ...tokenConfig, freezeAuthority: account.address });
                              }
                            }}
                            className="h-4 w-4 rounded border-2 border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                          />
                          <Label htmlFor="enableFreezeAuth" className="text-sm font-medium cursor-pointer text-white">
                            Freeze Authority
                          </Label>
                        </div>
                        {enableFreezeAuthority && (
                          <Input
                            id="freezeAuth"
                            type="text"
                            placeholder={account?.address || "Wallet address"}
                            value={tokenConfig.freezeAuthority}
                            onChange={(e) => setTokenConfig({ ...tokenConfig, freezeAuthority: e.target.value })}
                            className="h-9 text-sm font-mono text-xs ml-6 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {activeTab === 'metadata' && (
                <Card className="glass-card">
                  <CardHeader className="pb-2 pt-2 px-3">
                    <CardTitle className="text-base text-white">Token Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm text-white">Token Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="My Token"
                          value={metadata.name}
                          onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                          className="h-9 text-sm bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="symbol" className="text-sm text-white">Symbol</Label>
                        <Input
                          id="symbol"
                          type="text"
                          placeholder="MTK"
                          value={metadata.symbol}
                          onChange={(e) => setMetadata({ ...metadata, symbol: e.target.value.toUpperCase() })}
                          className="h-9 text-sm bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-sm text-white">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your token..."
                        value={metadata.description}
                        onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                        className="h-20 text-sm resize-none bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="image" className="text-sm text-white">Image URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="image"
                            type="text"
                            placeholder="https://example.com/token-logo.png"
                            value={metadata.image}
                            onChange={(e) => setMetadata({ ...metadata, image: e.target.value })}
                            className="h-9 text-sm bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                          />
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          <Button type="button" onClick={handlePickImage} variant="outline" size="sm" className="h-9 px-3 border-slate-700 hover:border-cyan-500" title="Upload image">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="external" className="text-sm text-white">External URL (Optional)</Label>
                        <Input
                          id="external"
                          type="text"
                          placeholder="https://yourproject.com"
                          value={metadata.externalUrl}
                          onChange={(e) => setMetadata({ ...metadata, externalUrl: e.target.value })}
                          className="h-9 text-sm bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-white">Attributes (Optional)</Label>
                      
                      {metadata.attributes.length > 0 && (
                        <div className="space-y-1.5">
                          {metadata.attributes.map((attr, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <span className="flex-1 bg-slate-900/50 rounded px-2 py-1.5 text-xs text-slate-300">
                                {attr.trait_type}: {attr.value}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAttribute(index)}
                                className="text-red-400 hover:text-red-300 h-7 px-2 text-xs"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label htmlFor="attrTrait" className="text-xs text-white">Trait Type</Label>
                          <Input
                            id="attrTrait"
                            type="text"
                            placeholder="Category"
                            value={newAttribute.trait_type}
                            onChange={(e) => setNewAttribute({ ...newAttribute, trait_type: e.target.value })}
                            className="h-8 text-xs bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="attrValue" className="text-xs text-white">Value</Label>
                          <div className="flex gap-2">
                            <Input
                              id="attrValue"
                              type="text"
                              placeholder="Value"
                              value={newAttribute.value}
                              onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                              className="h-8 text-xs bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                            />
                            <Button
                              type="button"
                              onClick={handleAddAttribute}
                              disabled={!newAttribute.trait_type || !newAttribute.value}
                              size="sm"
                              className="h-8 px-3 text-xs btn-brand"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Extensions */}
              {activeTab === 'extensions' && (
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white">Token Extensions</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Enable advanced features for your token
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="transferFee"
                            checked={extensions.transferFee}
                            onChange={(e) => setExtensions({ ...extensions, transferFee: e.target.checked })}
                            className="h-4 w-4 rounded border-2 border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                          />
                          <Label htmlFor="transferFee" className="text-sm font-medium cursor-pointer text-white">
                            Transfer Fee
                          </Label>
                        </div>
                        
                        {extensions.transferFee && (
                          <div className="ml-6 space-y-2 border-l-2 border-slate-800 pl-4 pt-1">
                            <div className="grid gap-2 sm:grid-cols-1">
                              <div>
                                <Label htmlFor="feeBps" className="text-xs text-white">Fee (basis points)</Label>
                                <Input
                                  id="feeBps"
                                  type="number"
                                  placeholder="100"
                                  className="mt-0.5 h-8 text-sm bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                                  value={extensions.transferFeeConfig?.feeBasisPoints ?? ''}
                                  onChange={(e) => setExtensions({
                                    ...extensions,
                                    transferFeeConfig: { ...(extensions.transferFeeConfig || {}), feeBasisPoints: Number(e.target.value || 0) },
                                  })}
                                />
                                <p className="text-[10px] text-slate-400 mt-0.5">100 = 1%</p>
                              </div>
                              <div>
                                <Label htmlFor="maxFee" className="text-xs text-white">Max Fee</Label>
                                <Input
                                  id="maxFee"
                                  type="text"
                                  placeholder="1000000"
                                  className="mt-0.5 h-8 text-sm bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                                  value={extensions.transferFeeConfig?.maxFee ?? ''}
                                  onChange={(e) => setExtensions({
                                    ...extensions,
                                    transferFeeConfig: { ...(extensions.transferFeeConfig || {}), maxFee: Number(e.target.value || 0) },
                                  })}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="mintClose"
                            checked={extensions.mintCloseAuthority}
                            onChange={(e) => setExtensions({ ...extensions, mintCloseAuthority: e.target.checked })}
                            className="h-4 w-4 rounded border-2 border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                          />
                          <Label htmlFor="mintClose" className="text-sm font-medium cursor-pointer text-white">
                            Mint Close Authority
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="interest"
                            checked={extensions.interestBearing}
                            onChange={(e) => setExtensions({ ...extensions, interestBearing: e.target.checked })}
                            className="h-4 w-4 rounded border-2 border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                          />
                          <Label htmlFor="interest" className="text-sm font-medium cursor-pointer text-white">
                            Interest Bearing
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="nonTransferable"
                            checked={extensions.nonTransferable}
                            onChange={(e) => setExtensions({ ...extensions, nonTransferable: e.target.checked })}
                            className="h-4 w-4 rounded border-2 border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                          />
                          <Label htmlFor="nonTransferable" className="text-sm font-medium cursor-pointer text-white">
                            Non-Transferable
                          </Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="permanentDelegate"
                            checked={extensions.permanentDelegate}
                            onChange={(e) => setExtensions({ ...extensions, permanentDelegate: e.target.checked })}
                            className="h-4 w-4 rounded border-2 border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                          />
                          <Label htmlFor="permanentDelegate" className="text-sm font-medium cursor-pointer text-white">
                            Permanent Delegate
                          </Label>
                        </div>
                        
                        {extensions.permanentDelegate && (
                          <div className="ml-6 border-l-2 border-slate-800 pl-4 pt-1">
                            <Label htmlFor="delegateAddr" className="text-xs text-white">Delegate Address</Label>
                            <Input
                              id="delegateAddr"
                              type="text"
                              placeholder="Wallet address"
                              className="mt-0.5 h-8 text-sm bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500"
                              value={extensions.permanentDelegateAddress ?? ''}
                              onChange={(e) => setExtensions({ ...extensions, permanentDelegateAddress: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

