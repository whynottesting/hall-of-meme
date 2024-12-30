export const RPC_CONFIG = {
  ENDPOINTS: [
    'https://solana-mainnet.g.alchemy.com/v2/qD078w2WZzwQeJaAENhphOrXYXCi9afo',
    'https://api.mainnet-beta.solana.com',
  ],
  WS_ENDPOINTS: [
    'wss://solana-mainnet.g.alchemy.com/v2/qD078w2WZzwQeJaAENhphOrXYXCi9afo',
    'wss://api.mainnet-beta.solana.com',
  ],
  MAX_RETRIES: 3,
  DEFAULT_TIMEOUT: 90000,
  INITIAL_BACKOFF: 1000, // Délai initial de 1 seconde entre les tentatives
};

export const RECIPIENT_ADDRESS = 'DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs';