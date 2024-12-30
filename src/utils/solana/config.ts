export const RPC_CONFIG = {
  ENDPOINTS: [
    "https://solana-mainnet.g.alchemy.com/v2/qD078w2WZzwQeJaAENhphOrXYXCi9afo",
    // Gardons un fallback avec un endpoint public en cas de problème avec Alchemy
    "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com"
  ],
  MAX_RETRIES: 3,
  INITIAL_BACKOFF: 1000,
  DEFAULT_TIMEOUT: 120000
};