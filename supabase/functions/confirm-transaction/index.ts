import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Connection, Transaction } from 'https://esm.sh/@solana/web3.js@1.87.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { signedTransaction } = await req.json()
    
    // Décoder la transaction signée
    const transaction = Transaction.from(Buffer.from(signedTransaction, 'base64'));
    
    // Envoyer la transaction
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const signature = await connection.sendRawTransaction(transaction.serialize());
    
    // Attendre la confirmation
    const confirmation = await connection.confirmTransaction(signature);
    
    if (confirmation.value.err) {
      throw new Error('La transaction a échoué lors de la confirmation');
    }

    return new Response(
      JSON.stringify({ 
        signature,
        message: 'Transaction confirmed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})