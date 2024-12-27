import { PublicKey } from '@solana/web3.js';

export type PhantomWallet = {
  isPhantom?: boolean;
  connect: (params?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: any, options?: any) => Promise<{ signature: string }>;
  signTransaction: (transaction: any) => Promise<any>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array; publicKey: PublicKey }>;
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
  publicKey: PublicKey | null;
};

export const PHANTOM_CONSTANTS = {
  MOBILE_LINK: "https://phantom.app/ul/browse/",
  DOWNLOAD_LINK: "https://phantom.app/download",
} as const;