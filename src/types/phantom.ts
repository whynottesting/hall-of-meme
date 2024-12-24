export type PhantomWallet = {
  isPhantom?: boolean;
  publicKey?: { toString: () => string };
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  on: (event: string, callback: () => void) => void;
  disconnect: () => Promise<void>;
};

export const PHANTOM_CONSTANTS = {
  MOBILE_LINK: "https://phantom.app/ul/browse/",
  DOWNLOAD_LINK: "https://phantom.app/",
  CHECK_INTERVAL: 1000, // 1 seconde
} as const;