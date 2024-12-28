import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Connection, PublicKey, SystemProgram, Transaction } from 'https://esm.sh/@solana/web3.js@1.87.6'

const RECIPIENT_WALLET = 'DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { x, y, width, height, walletAddress, imageUrl, link, price } = await req.json()

    // Créer le client Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Vérifier si l'espace est déjà occupé
    const { data: existingSpaces, error: checkError } = await supabase
      .from('spaces')
      .select('*')
      .or(`and(x.gte.${x},x.lt.${x + width}),and(y.gte.${y},y.lt.${y + height})`)

    if (checkError) throw checkError;
    if (existingSpaces && existingSpaces.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Cet espace est déjà occupé' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Créer la transaction Solana
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const fromPubkey = new PublicKey(walletAddress);
    const toPubkey = new PublicKey(RECIPIENT_WALLET);
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: Math.floor(price * 1000000000), // Convert SOL to lamports
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Sérialiser la transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });

    const transactionBase64 = serializedTransaction.toString('base64');

    return new Response(
      JSON.stringify({ 
        transaction: transactionBase64,
        message: 'Transaction created successfully'
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