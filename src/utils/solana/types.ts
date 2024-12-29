import { Transaction } from '@solana/web3.js';

export type PhantomProvider = {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (args: any) => void) => void;
  isPhantom: boolean;
  publicKey: { toString: () => string };
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
};

export type PhantomWindow = Window & {
  phantom?: {
    solana?: PhantomProvider;
  };
};