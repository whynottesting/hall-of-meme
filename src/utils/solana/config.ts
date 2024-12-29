export const RPC_CONFIG = {
  ENDPOINTS: [
    "https://solana-mainnet.g.alchemy.com/v2/demo",
    "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com",
    "https://rpc.ankr.com/solana",
    "https://api.metaplex.solana.com"
  ],
  MAX_RETRIES: 3,
  INITIAL_BACKOFF: 1000,
  DEFAULT_TIMEOUT: 120000
};