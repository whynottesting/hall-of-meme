import { Connection, Commitment, PublicKey } from '@solana/web3.js';
import { RPC_CONFIG } from './config';

export class SolanaConnection {
  private static instance: SolanaConnection;
  private connection: Connection;
  private currentEndpointIndex: number = 0;
  private wsRetryCount: number = 0;
  private readonly MAX_WS_RETRIES = 3;
  private wsSubscription: number | null = null;
  private wsReconnectTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    const endpoint = RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex];
    console.log('📡 Initialisation de la connexion Solana avec:', endpoint);
    
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed' as Commitment,
      disableRetryOnRateLimit: false,
      confirmTransactionInitialTimeout: 60000,
    });

    // Setup WebSocket monitoring with delay
    setTimeout(() => {
      this.setupWebSocketMonitoring();
    }, 1000);
    
    console.log('✅ Connexion Solana initialisée');
  }

  private async setupWebSocketMonitoring() {
    try {
      // Cleanup previous subscription and timeout
      this.cleanupWebSocket();

      // Create new subscription with error handling
      // Utilisation d'un token SPL connu pour le monitoring
      const tokenProgramId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
      
      // On s'abonne aux changements du programme token
      this.wsSubscription = this.connection.onProgramAccountChange(
        tokenProgramId,
        () => {
          // On peut laisser le callback vide car on utilise juste
          // cette souscription pour maintenir la connexion active
        },
        'confirmed'
      );

      console.log('✅ WebSocket monitoring setup complete');
    } catch (error) {
      console.error('❌ Error setting up WebSocket monitoring:', error);
      this.handleWebSocketError();
    }
  }

  private cleanupWebSocket() {
    if (this.wsSubscription !== null) {
      try {
        this.connection.removeProgramAccountChangeListener(this.wsSubscription);
      } catch (error) {
        console.warn('Warning: Error cleaning up WebSocket:', error);
      }
      this.wsSubscription = null;
    }

    if (this.wsReconnectTimeout) {
      clearTimeout(this.wsReconnectTimeout);
      this.wsReconnectTimeout = null;
    }
  }

  private async handleWebSocketError() {
    if (this.wsRetryCount < this.MAX_WS_RETRIES) {
      this.wsRetryCount++;
      console.log(`🔄 Tentative de reconnexion WebSocket ${this.wsRetryCount}/${this.MAX_WS_RETRIES}`);
      
      // Exponential backoff for retries
      const delay = Math.min(1000 * Math.pow(2, this.wsRetryCount - 1), 10000);
      
      this.wsReconnectTimeout = setTimeout(() => {
        this.switchToNextEndpoint();
      }, delay);
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
    this.cleanupWebSocket();
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % RPC_CONFIG.ENDPOINTS.length;
    console.log('🔄 Changement vers le nouvel endpoint:', RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex]);
    this.initializeConnection();
  }
}