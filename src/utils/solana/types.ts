import { Transaction, PublicKey } from '@solana/web3.js';

export interface Space {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image_url?: string;
  url?: string;
  price?: number;
  wallet_address?: string;
  created_at?: string;
}

export type PhantomProvider = {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (args: any) => void) => void;
  isPhantom: boolean;
  publicKey: PublicKey;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
};

export interface PhantomWindow extends Window {
  phantom?: {
    solana?: PhantomProvider;
  };
}