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
    const { spaceId, imageUrl } = await req.json()
    console.log("📝 Mise à jour de l'espace:", { spaceId, imageUrl })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('spaces')
      .update({ image_url: imageUrl })
      .eq('id', spaceId)
      .select()

    if (error) {
      console.error("❌ Erreur lors de la mise à jour:", error)
      throw error
    }

    console.log("✅ Espace mis à jour avec succès:", data)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Image mise à jour avec succès",
        data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("❌ Erreur:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})