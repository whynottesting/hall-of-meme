export type PhantomWallet = {
  isPhantom?: boolean;
  publicKey?: { toString: () => string };
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  request: (params: { method: string; params?: any }) => Promise<any>;
  on: (event: string, callback: () => void) => void;
  disconnect: () => Promise<void>;
};

export const PHANTOM_CONSTANTS = {
  MOBILE_LINK: "https://phantom.app/ul/browse/",
  DOWNLOAD_LINK: "https://phantom.app/",
  CHECK_INTERVAL: 1000, // 1 seconde
} as const;