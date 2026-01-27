import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { orderId, packetaApiPassword, packetaApiId, senderName, senderPhone } = await req.json();

    if (!orderId || !packetaApiPassword || !packetaApiId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Hiányzó paraméterek' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const { data: order, error: orderError } = await fetch(
      `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    ).then(res => res.json());

    if (orderError || !order || order.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rendelés nem található' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const orderData = order[0];

    if (!orderData.packeta_point_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nincs Packeta csomagpont kiválasztva' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const packetData = {
      number: `ORDER-${orderData.id}`,
      name: orderData.shipping_name,
      surname: '',
      company: '',
      email: orderData.customer_email,
      phone: orderData.customer_phone,
      addressId: parseInt(orderData.packeta_point_id),
      cod: orderData.payment_method === 'cash_on_delivery' ? orderData.total : 0,
      value: orderData.total,
      currency: 'HUF',
      weight: 1,
      eshop: packetaApiId,
    };

    const packetaResponse = await fetch('https://www.zasilkovna.cz/api/rest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiPassword: packetaApiPassword,
        packetAttributesFault: 'ignore',
        packets: [packetData],
      }),
    });

    const packetaResult = await packetaResponse.json();

    if (packetaResult.status === 'ok' && packetaResult.detail && packetaResult.detail.length > 0) {
      const packetInfo = packetaResult.detail[0];
      const barcode = packetInfo.barcode || '';
      const packetId = packetInfo.id || '';

      const updateData = {
        packeta_packet_id: packetId,
        packeta_barcode: barcode,
        packeta_tracking_url: `https://tracking.packeta.com/hu/?id=${barcode}`,
        packeta_label_url: `https://www.zasilkovna.cz/api/rest?apiPassword=${packetaApiPassword}&packetId=${packetId}&format=A6onA4&offset=0`,
      };

      await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updateData),
        }
      );

      return new Response(
        JSON.stringify({
          success: true,
          packetId,
          barcode,
          trackingUrl: updateData.packeta_tracking_url,
          labelUrl: updateData.packeta_label_url,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: packetaResult.fault?.[0]?.message || 'Hiba a csomag létrehozásakor',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error creating Packeta shipment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Ismeretlen hiba',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
