export type PhantomWallet = {
  isPhantom?: boolean;
  publicKey: { toString: () => string } | null;
  connect: (params?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: any, options?: any) => Promise<{ signature: string }>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  request: (params: { method: string; params?: any }) => Promise<any>;
  on: (event: string, callback: any) => void;
  off: (event: string, callback: any) => void;
};

export const PHANTOM_CONSTANTS = {
  MOBILE_LINK: "https://phantom.app/ul/browse/",
  DOWNLOAD_LINK: "https://phantom.app/",
  CHECK_INTERVAL: 1000,
} as const;