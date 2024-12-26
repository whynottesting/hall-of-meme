export type PhantomWallet = {
  isPhantom?: boolean;
  publicKey: { toString: () => string } | null;
  connect: (params?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: any, options?: any) => Promise<{ signature: string }>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  signMessage: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array }>;
  request: (params: { method: string; params?: any }) => Promise<any>;
  on: (event: string, callback: any) => void;
  off: (event: string, callback: any) => void;
};

export const PHANTOM_CONSTANTS = {
  MOBILE_LINK: "https://phantom.app/ul/browse/",
  DOWNLOAD_LINK: "https://phantom.app/",
  CHECK_INTERVAL: 1000,
} as const;

export type PhantomEvent = 'connect' | 'disconnect' | 'accountChanged';

export type PhantomRequestMethod = 
  | 'connect'
  | 'disconnect'
  | 'signTransaction'
  | 'signAllTransactions'
  | 'signMessage'
  | 'signAndSendTransaction';

export const PHANTOM_ERROR_CODES = {
  DISCONNECTED: 4900,
  UNAUTHORIZED: 4100,
  USER_REJECTED: 4001,
  INVALID_INPUT: -32000,
  RESOURCE_NOT_AVAILABLE: -32002,
  TRANSACTION_REJECTED: -32003,
  METHOD_NOT_FOUND: -32601,
  INTERNAL_ERROR: -32603,
} as const;