export interface PhantomWindow extends Window {
  solana?: {
    connect(): Promise<{ publicKey: { toString(): string } }>;
    disconnect(): Promise<void>;
    on(event: string, callback: () => void): void;
    publicKey?: { toString(): string };
    isPhantom?: boolean;
    signTransaction(transaction: any): Promise<any>;
  };
}