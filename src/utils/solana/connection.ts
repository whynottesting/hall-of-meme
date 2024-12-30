import { Connection, Commitment } from '@solana/web3.js';
import { RPC_CONFIG } from './config';

export class SolanaConnection {
  private static instance: SolanaConnection;
  private connection: Connection;
  private currentEndpointIndex: number = 0;
  private wsRetryCount: number = 0;
  private readonly MAX_WS_RETRIES = 3;
  private wsSubscription: number | null = null;

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

    // Setup WebSocket monitoring
    this.setupWebSocketMonitoring();
    
    console.log('✅ Connexion Solana initialisée');
  }

  private setupWebSocketMonitoring() {
    try {
      // Unsubscribe from previous subscription if it exists
      if (this.wsSubscription !== null) {
        this.connection.removeOnLogsListener(this.wsSubscription);
        this.wsSubscription = null;
      }

      // Create new subscription
      this.wsSubscription = this.connection.onLogs(
        'all',
        (logs) => {
          console.log('📡 WebSocket logs received:', logs);
        },
        'confirmed'
      );

      console.log('✅ WebSocket monitoring setup complete');
    } catch (error) {
      console.error('❌ Error setting up WebSocket monitoring:', error);
      this.handleWebSocketError();
    }
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
    // Clean up existing WebSocket subscription
    if (this.wsSubscription !== null) {
      this.connection.removeOnLogsListener(this.wsSubscription);
      this.wsSubscription = null;
    }

    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % RPC_CONFIG.ENDPOINTS.length;
    console.log('🔄 Changement vers le nouvel endpoint:', RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex]);
    this.initializeConnection();
  }
}