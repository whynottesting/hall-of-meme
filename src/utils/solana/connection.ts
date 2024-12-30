import { Connection, ConnectionConfig } from '@solana/web3.js';
import { RPC_CONFIG } from './config';

export class SolanaConnection {
  private static instance: SolanaConnection;
  private connection: Connection;
  private currentEndpointIndex: number = 0;

  private constructor() {
    const config: ConnectionConfig = {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: RPC_CONFIG.DEFAULT_TIMEOUT,
      disableRetryOnRateLimit: false,
      wsEndpoint: RPC_CONFIG.WS_ENDPOINTS[0],
    };
    
    console.log("🔗 Initialisation de la connexion HTTP avec:", RPC_CONFIG.ENDPOINTS[0]);
    console.log("🔌 Initialisation de la connexion WebSocket avec:", RPC_CONFIG.WS_ENDPOINTS[0]);
    
    this.connection = new Connection(RPC_CONFIG.ENDPOINTS[0], config);
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

  public switchToNextEndpoint(): void {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % RPC_CONFIG.ENDPOINTS.length;
    const config: ConnectionConfig = {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: RPC_CONFIG.DEFAULT_TIMEOUT,
      disableRetryOnRateLimit: false,
      wsEndpoint: RPC_CONFIG.WS_ENDPOINTS[this.currentEndpointIndex],
    };
    
    console.log("🔄 Changement d'endpoint vers:", RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex]);
    console.log("🔌 Nouvelle connexion WebSocket:", RPC_CONFIG.WS_ENDPOINTS[this.currentEndpointIndex]);
    
    this.connection = new Connection(RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex], config);
  }
}