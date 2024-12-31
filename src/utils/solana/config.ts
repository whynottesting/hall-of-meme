export const RPC_CONFIG = {
  ENDPOINTS: [
    "https://solana-mainnet.g.alchemy.com/v2/qD078w2WZzwQeJaAENhphOrXYXCi9afo", // RPC Alchemy principal
    "https://api.mainnet-beta.solana.com",  // Fallback sur le RPC public
    "https://solana-api.projectserum.com"   // Autre fallback
  ],
  MAX_RETRIES: 3,
  INITIAL_BACKOFF: 1000,
  DEFAULT_TIMEOUT: 120000
};