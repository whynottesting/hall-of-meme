import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Connection, PublicKey } from 'https://esm.sh/@solana/web3.js@1.73.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { signature, spaceData } = await req.json()
    console.log('Confirming transaction:', { signature, spaceData })

    const connection = new Connection('https://api.devnet.solana.com')
    
    // Wait for transaction confirmation
    const confirmation = await connection.confirmTransaction(signature)
    
    if (confirmation.value.err) {
      throw new Error('Transaction failed')
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Save space in database
    const { error: spaceError } = await supabase
      .from('spaces')
      .insert({
        wallet_address: spaceData.walletAddress,
        x: spaceData.x,
        y: spaceData.y,
        width: spaceData.width,
        height: spaceData.height,
        url: spaceData.link,
        image_url: spaceData.imageUrl,
        price: spaceData.price
      })

    if (spaceError) {
      console.error('Error saving space:', spaceError)
      throw spaceError
    }

    // Save transaction
    const { error: transactionError } = await supabase
      .from('transaction_history')
      .insert({
        wallet_address: spaceData.walletAddress,
        status: 'completed'
      })

    if (transactionError) {
      console.error('Error saving transaction:', transactionError)
      throw transactionError
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Transaction confirmed and space registered'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error confirming transaction:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
