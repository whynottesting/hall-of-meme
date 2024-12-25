import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Insérer le nouvel espace
    const { error: insertError } = await supabase
      .from('spaces')
      .insert({
        wallet_address: walletAddress,
        x,
        y,
        width,
        height,
        url: link,
        image_url: imageUrl,
        price
      })

    if (insertError) throw insertError;

    // Enregistrer la transaction
    const { error: transactionError } = await supabase
      .from('transaction_history')
      .insert({
        wallet_address: walletAddress,
        status: 'completed'
      })

    if (transactionError) throw transactionError;

    return new Response(
      JSON.stringify({ success: true }),
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