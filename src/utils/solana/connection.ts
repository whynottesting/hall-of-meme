import { Connection, Commitment } from '@solana/web3.js';
import { RPC_CONFIG } from './config';

export class SolanaConnection {
  private static instance: SolanaConnection;
  private connection: Connection;
  private wsConnection: Connection;
  private currentEndpointIndex: number = 0;

  private constructor() {
    const endpoint = RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex];
    
    console.log('🔌 Initializing Solana connections...');
    console.log('📡 HTTP Endpoint:', endpoint);
    
    // Connection principale pour les requêtes HTTP
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed' as Commitment,
      disableRetryOnRateLimit: false,
    });

    // Pour WebSocket, on utilise la même connexion
    this.wsConnection = this.connection;

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

  public getCurrentEndpoint(): string {
    return RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex];
  }

  public async switchToNextEndpoint(): Promise<void> {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % RPC_CONFIG.ENDPOINTS.length;
    const newEndpoint = RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex];

    console.log('🔄 Switching to new endpoint:', newEndpoint);
    
    this.connection = new Connection(newEndpoint, {
      commitment: 'confirmed' as Commitment,
      disableRetryOnRateLimit: false,
    });

    // Utiliser la même connexion pour WebSocket
    this.wsConnection = this.connection;

    console.log('✅ Successfully switched to new endpoint');
  }
}