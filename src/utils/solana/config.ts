export const RPC_CONFIG = {
  ENDPOINTS: [
    "https://api.mainnet-beta.solana.com",
    "https://solana-mainnet.g.alchemy.com/v2/demo",
    "https://solana-api.projectserum.com",
    "https://rpc.ankr.com/solana",
    "https://api.metaplex.solana.com"
  ],
  MAX_RETRIES: 3,
  INITIAL_BACKOFF: 1000,
  DEFAULT_TIMEOUT: 120000,
} as const;

export const SOLANA_RPC_ENDPOINT = RPC_CONFIG.ENDPOINTS[0];

export const TRANSACTION_CONFIG = {
  MAX_RETRIES: 3,
  CONFIRMATION_TIMEOUT: 120000,
  PREFLIGHT_COMMITMENT: 'confirmed',
} as const;