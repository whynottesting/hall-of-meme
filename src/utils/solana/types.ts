export type PhantomWindow = Window & {
  phantom?: {
    solana?: any;
  };
};