import React from 'react';
import { useQuery } from '@tanstack/react-query';

const fetchSolPrice = async () => {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
  const data = await response.json();
  return data.solana.usd;
};

const SolPrice: React.FC = () => {
  const { data: solPrice } = useQuery({
    queryKey: ['solPrice'],
    queryFn: fetchSolPrice,
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="text-center font-retro text-xs md:text-lg mb-4 flex flex-nowrap justify-center items-center gap-2 md:gap-4 whitespace-nowrap">
      <span>1 SOL = ${solPrice?.toFixed(2) || '...'}</span>
      <span>1 pixel = 0.01 SOL</span>
      <span>1 square = 100 pixels</span>
    </div>
  );
};

export default SolPrice;