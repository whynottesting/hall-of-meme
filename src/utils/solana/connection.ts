import { Connection, ConnectionConfig } from '@solana/web3.js';
import { RPC_CONFIG } from './config';

export class SolanaConnection {
  private static instance: SolanaConnection;
  private currentEndpointIndex: number = 0;
  private connection: Connection;

  private constructor() {
    const config: ConnectionConfig = {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: RPC_CONFIG.DEFAULT_TIMEOUT,
      disableRetryOnRateLimit: false,
    };
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

  public async switchToNextEndpoint(): Promise<Connection> {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % RPC_CONFIG.ENDPOINTS.length;
    const newEndpoint = RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex];
    console.log(`🔄 Switching to RPC endpoint: ${newEndpoint}`);
    
    const config: ConnectionConfig = {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: RPC_CONFIG.DEFAULT_TIMEOUT,
      disableRetryOnRateLimit: false,
    };
    
    this.connection = new Connection(newEndpoint, config);
    return this.connection;
  }

  public getCurrentEndpoint(): string {
    return RPC_CONFIG.ENDPOINTS[this.currentEndpointIndex];
  }
}