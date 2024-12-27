export const RPC_CONFIG = {
  ENDPOINTS: [
    "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com",
    "https://rpc.ankr.com/solana",
    "https://solana-mainnet.g.alchemy.com/v2/demo"
  ],
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  INITIAL_BACKOFF: 1000,
};

export const TRANSACTION_CONFIG = {
  MAX_RETRIES: 3,
  CONFIRMATION_TIMEOUT: 60000,
  PREFLIGHT_COMMITMENT: 'confirmed' as const,
};