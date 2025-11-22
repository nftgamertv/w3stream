import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { W3SWAP_PROGRAM_ID, SOLANA_RPC_URL } from './constants';

// Types for our program
// UI-facing types used throughout the app
export interface Project {
  id: PublicKey; // use project PDA for unique id
  projectId?: number;
  projectAdmin?: string;
  oldTokenMint: PublicKey;
  newTokenMint: PublicKey;
  exchangeRateOld: number;
  exchangeRateNew: number;
  startTime?: number;
  endTime?: number;
  status: string;
  totalMigrated: number;
  totalUsers: number;
  createdAt: number;
  activatedAt?: number;
}

export enum ProjectStatus { 
  Created = 'Created', 
  Active = 'Active', 
  Completed = 'Completed', 
  Cancelled = 'Cancelled' 
}

export type UserMigration = unknown;

// Initialize connection
export const getConnection = () => {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
};

// Get program instance - needs to be called with a provider
// Note: This requires the IDL to be available. If IDL is not set up, this will throw.
// To set up: Copy w3swap.json IDL to src/app/lib/w3swap/idl/w3swap.json
export const getProgram = (provider: AnchorProvider): Program<any> => {
  try {
    // Try to import IDL if available
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const idl = require('./idl/w3swap.json');
    return new Program(idl, provider);
  } catch (error) {
    // If IDL is not available, throw a helpful error
    throw new Error('Program initialization requires IDL. Please copy w3swap.json to src/app/lib/w3swap/idl/w3swap.json. Error: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Get project PDA
const u64LeBytes = (n: number) => {
  const buf = Buffer.alloc(8);
  const bn = BigInt(n);
  buf.writeBigUInt64LE(bn);
  return buf;
};

export const getProjectPDA = (projectAdmin: PublicKey, projectId: number) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('project'), projectAdmin.toBuffer(), u64LeBytes(projectId)],
    W3SWAP_PROGRAM_ID,
  );
};

// Get user migration PDA
export const getUserMigrationPDA = (user: PublicKey, project: PublicKey) => {
  return PublicKey.findProgramAddressSync([
    Buffer.from('user_migration'),
    project.toBuffer(),
    user.toBuffer(),
  ], W3SWAP_PROGRAM_ID);
};

// Get liquidity vault PDA
export const getLiquidityVaultPDA = (project: PublicKey) => {
  return PublicKey.findProgramAddressSync([
    Buffer.from('liquidity_vault'), project.toBuffer()
  ], W3SWAP_PROGRAM_ID);
};

export const getOldTokenVaultPDA = (project: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from('old_token_vault'), project.toBuffer()], W3SWAP_PROGRAM_ID);

export const getNewTokenVaultPDA = (project: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from('new_token_vault'), project.toBuffer()], W3SWAP_PROGRAM_ID);

export const getLpEscrowVaultPDA = (project: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from('lp_escrow_vault'), project.toBuffer()], W3SWAP_PROGRAM_ID);

