export type PhantomWallet = {
  isPhantom?: boolean;
  connect: (params?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: string }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: any, options?: any) => Promise<{ signature: string }>;
  signTransaction: (transaction: any) => Promise<any>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array; publicKey: string }>;
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
  publicKey: { toString: () => string } | null;
};

export const PHANTOM_CONSTANTS = {
  MOBILE_LINK: "https://phantom.app/ul/browse/",
  DOWNLOAD_LINK: "https://phantom.app/download",
} as const;