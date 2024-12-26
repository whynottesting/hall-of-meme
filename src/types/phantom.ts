export type PhantomWallet = {
  isPhantom?: boolean;
  isConnected?: boolean;
  publicKey?: { toString: () => string };
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  request: (params: { method: string; params?: any }) => Promise<any>;
  on: (event: string, callback: () => void) => void;
};

export const PHANTOM_CONSTANTS = {
  MOBILE_LINK: "https://phantom.app/ul/browse/",
  DOWNLOAD_LINK: "https://phantom.app/",
  CHECK_INTERVAL: 1000, // 1 seconde
} as const;