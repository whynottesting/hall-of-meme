import { Connection, ConnectionConfig } from '@solana/web3.js';

export const RPC_ENDPOINTS = [
  "https://api.devnet.solana.com",
  "https://devnet.helius-rpc.com/?api-key=1d24dc75-e291-4d08-a152-24548e66cc0e",
  "https://mango.devnet.rpcpool.com"
];

const DEFAULT_CONFIG: ConnectionConfig = {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 120000,
  disableRetryOnRateLimit: false,
  httpHeaders: {
    'Content-Type': 'application/json',
  }
};

export class SolanaRPCConnection {
  private static instance: SolanaRPCConnection;
  private currentEndpointIndex: number = 0;
  private connection: Connection;

  private constructor() {
    this.connection = new Connection(RPC_ENDPOINTS[0], DEFAULT_CONFIG);
  }

  public static getInstance(): SolanaRPCConnection {
    if (!SolanaRPCConnection.instance) {
      SolanaRPCConnection.instance = new SolanaRPCConnection();
    }
    return SolanaRPCConnection.instance;
  }

  public getConnection(): Connection {
    return this.connection;
  }

  public async switchToNextEndpoint(): Promise<Connection> {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % RPC_ENDPOINTS.length;
    const newEndpoint = RPC_ENDPOINTS[this.currentEndpointIndex];
    console.log(`🔄 Basculement vers le RPC endpoint devnet: ${newEndpoint}`);
    this.connection = new Connection(newEndpoint, DEFAULT_CONFIG);
    return this.connection;
  }

  public getCurrentEndpoint(): string {
    return RPC_ENDPOINTS[this.currentEndpointIndex];
  }
}