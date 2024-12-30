import { Connection, Commitment } from '@solana/web3.js';
import { RPC_CONFIG } from './config';

export class SolanaConnection {
  private static instance: SolanaConnection;
  private connection: Connection;
  private wsConnection: Connection;

  private constructor() {
    const endpoint = RPC_CONFIG.ENDPOINTS[0];
    const wsEndpoint = RPC_CONFIG.WS_ENDPOINTS[0];
    
    console.log('🔌 Initializing Solana connections...');
    console.log('📡 HTTP Endpoint:', endpoint);
    console.log('🔄 WebSocket Endpoint:', wsEndpoint);
    
    // Connection principale pour les requêtes HTTP
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed' as Commitment,
      disableRetryOnRateLimit: false,
    });

    // Connection WebSocket dédiée
    this.wsConnection = new Connection(wsEndpoint, {
      commitment: 'confirmed' as Commitment,
      wsEndpoint: wsEndpoint,
      disableRetryOnRateLimit: false,
    });

    console.log('✅ Solana connections initialized successfully');
  }

  public static getInstance(): SolanaConnection {
    if (!SolanaConnection.instance) {
      SolanaConnection.instance = new SolanaConnection();
    }
    return SolanaConnection.instance;
  }

  public getConnection(): Connection {
    return this.connection;
  }

  public getWSConnection(): Connection {
    return this.wsConnection;
  }
}