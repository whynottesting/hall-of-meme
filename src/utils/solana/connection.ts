import { Connection, Commitment } from '@solana/web3.js';
import { RPC_CONFIG } from './config';

export class SolanaConnection {
  private static instance: SolanaConnection;
  private connection: Connection;
  private currentEndpointIndex: number = 0;

  private constructor() {
    const endpoint = RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex];
    
    console.log('🔌 Initialisation de la connexion Solana...');
    console.log('📡 Endpoint HTTP:', endpoint);
    
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed' as Commitment,
      confirmTransactionInitialTimeout: 60000, // 60 secondes
      wsEndpoint: endpoint.replace('https', 'wss'),
      disableRetryOnRateLimit: false,
    });

    console.log('✅ Connexion Solana initialisée avec succès');
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

  public getCurrentEndpoint(): string {
    return RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex];
  }

  public async switchToNextEndpoint(): Promise<void> {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % RPC_CONFIG.ENDPOINTS.length;
    const newEndpoint = RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex];

    console.log('🔄 Changement vers le nouvel endpoint:', newEndpoint);
    
    this.connection = new Connection(newEndpoint, {
      commitment: 'confirmed' as Commitment,
      confirmTransactionInitialTimeout: 60000,
      wsEndpoint: newEndpoint.replace('https', 'wss'),
      disableRetryOnRateLimit: false,
    });

    console.log('✅ Changement d\'endpoint réussi');
  }
}