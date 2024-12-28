import React from 'react';
import { useQuery } from '@tanstack/react-query';

const fetchSolPrice = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.solana.usd;
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    return null;
  }
};

const SolPrice: React.FC = () => {
  const { data: solPrice } = useQuery({
    queryKey: ['solPrice'],
    queryFn: fetchSolPrice,
    refetchInterval: 60000,
    retry: 3,
    staleTime: 30000,
  });

  return (
    <div className="text-center font-retro text-xs md:text-lg mb-4 flex flex-nowrap justify-center items-center gap-2 md:gap-4 whitespace-nowrap">
      {solPrice !== null && <span>1 SOL = ${solPrice?.toFixed(2)}</span>}
      <span>1 pixel = 0.01 SOL</span>
      <span>1 square = 100 pixels (10×10)</span>
    </div>
  );
};

export default SolPrice;