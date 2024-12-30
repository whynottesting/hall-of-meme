import { Connection, Commitment } from '@solana/web3.js';
import { RPC_CONFIG } from './config';

export class SolanaConnection {
  private static instance: SolanaConnection;
  private connection: Connection;
  private currentEndpointIndex: number = 0;
  private wsRetryCount: number = 0;
  private readonly MAX_WS_RETRIES = 3;

  private constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    const endpoint = RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex];
    console.log('📡 Initialisation de la connexion Solana avec:', endpoint);
    
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed' as Commitment,
      wsEndpoint: endpoint.replace('https', 'wss'),
      confirmTransactionInitialTimeout: 60000,
      disableRetryOnRateLimit: false,
    });

    // Gestion des erreurs WebSocket
    this.connection.onLogs('all', () => {}, 'confirmed').subscribe({
      error: (error) => {
        console.error('❌ Erreur WebSocket:', error);
        this.handleWebSocketError();
      }
    });

    console.log('✅ Connexion Solana initialisée');
  }

  private async handleWebSocketError() {
    if (this.wsRetryCount < this.MAX_WS_RETRIES) {
      this.wsRetryCount++;
      console.log(`🔄 Tentative de reconnexion WebSocket ${this.wsRetryCount}/${this.MAX_WS_RETRIES}`);
      await this.switchToNextEndpoint();
    } else {
      console.error('❌ Nombre maximum de tentatives de reconnexion WebSocket atteint');
      this.wsRetryCount = 0;
    }
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
    console.log('🔄 Changement vers le nouvel endpoint:', RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex]);
    this.initializeConnection();
  }
}