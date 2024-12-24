import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const OWNER_WALLET = "DEjdjPNQ62HvEbjeKqwesoueaAMY8MP1veofwRoNnfQs";
const LAMPORTS_PER_SOL = 1000000000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { x, y, width, height, walletAddress } = await req.json()

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Vérifier si l'espace est déjà occupé
    const { data: existingSpaces } = await supabase
      .from('spaces')
      .select('*')
      .or(`and(x.gte.${x},x.lt.${x + width}),and(y.gte.${y},y.lt.${y + height})`)

    if (existingSpaces && existingSpaces.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Space already occupied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    return new Response(
      JSON.stringify({ 
        status: 'available',
        ownerWallet: OWNER_WALLET,
        lamportsPerSol: LAMPORTS_PER_SOL
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})