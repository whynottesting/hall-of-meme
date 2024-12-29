export interface Space {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image_url?: string;
  url?: string;
  price?: number;
  wallet_address?: string;
  created_at?: string;
}

export interface PhantomWindow extends Window {
  phantom?: {
    solana?: any;
  };
}