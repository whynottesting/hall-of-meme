import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Connection, PublicKey, Transaction, SystemProgram } from 'https://esm.sh/@solana/web3.js@1.73.0'

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
    console.log('Processing space purchase request:', { x, y, width, height, walletAddress, price })

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if space is already occupied
    const { data: existingSpaces, error: checkError } = await supabase
      .from('spaces')
      .select('*')
      .or(`and(x.gte.${x},x.lt.${x + width}),and(y.gte.${y},y.lt.${y + height})`)

    if (checkError) {
      console.error('Error checking space availability:', checkError)
      throw checkError
    }

    if (existingSpaces && existingSpaces.length > 0) {
      console.log('Space already occupied:', existingSpaces)
      return new Response(
        JSON.stringify({ error: 'This space is already occupied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Solana transaction
    const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/VOTRE_CLE_ALCHEMY')
    const buyerPubkey = new PublicKey(walletAddress)
    // Mettez à jour cette adresse avec votre adresse de réception mainnet
    const receiverPubkey = new PublicKey('VOTRE_ADRESSE_MAINNET_ICI')
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: buyerPubkey,
        toPubkey: receiverPubkey,
        lamports: price * 1000000000, // Convert SOL to lamports
      })
    )

    // Get latest blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = buyerPubkey

    // Serialize transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    }).toString('base64')

    return new Response(
      JSON.stringify({ 
        transaction: serializedTransaction,
        message: 'Transaction created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing space purchase:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})