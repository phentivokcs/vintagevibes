import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InvoiceRequest {
  orderId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { orderId }: InvoiceRequest = await req.json();

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select("billingo_api_key, billingo_block_id, billingo_enabled")
      .single();

    if (settingsError || !settings) {
      throw new Error("Failed to fetch site settings");
    }

    if (!settings.billingo_enabled) {
      return new Response(
        JSON.stringify({ success: false, message: "Billingo integration is disabled" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!settings.billingo_api_key || !settings.billingo_block_id) {
      throw new Error("Billingo API key or block ID is not configured");
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price_at_purchase,
          products (
            title,
            category
          )
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    const billingoApiKey = settings.billingo_api_key;
    const billingoBlockId = settings.billingo_block_id;

    const partnerData = {
      name: order.shipping_name || order.full_name,
      address: {
        country_code: "HU",
        post_code: order.zip_code,
        city: order.city,
        address: order.address,
      },
      emails: [order.email],
      phone: order.phone,
    };

    const invoiceItems = order.order_items.map((item: any) => ({
      name: item.products.title,
      unit_price: item.price_at_purchase,
      unit_price_type: "gross",
      quantity: item.quantity,
      unit: "db",
      vat: "27%",
      comment: item.products.category,
    }));

    const shippingCost = order.shipping_cost || 0;
    if (shippingCost > 0) {
      invoiceItems.push({
        name: "Szállítási költség",
        unit_price: shippingCost,
        unit_price_type: "gross",
        quantity: 1,
        unit: "db",
        vat: "27%",
        comment: "Packeta szállítás",
      });
    }

    const invoicePayload = {
      partner: partnerData,
      block_id: parseInt(billingoBlockId),
      type: "invoice",
      fulfillment_date: new Date().toISOString().split("T")[0],
      due_date: new Date().toISOString().split("T")[0],
      payment_method: "bankcard",
      language: "hu",
      currency: "HUF",
      conversion_rate: 1,
      electronic: true,
      paid: true,
      items: invoiceItems,
      comment: `Webshop rendelés: ${order.id}`,
    };

    const billingoResponse = await fetch("https://api.billingo.hu/v3/documents", {
      method: "POST",
      headers: {
        "X-API-KEY": billingoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoicePayload),
    });

    if (!billingoResponse.ok) {
      const errorText = await billingoResponse.text();
      console.error("Billingo API error:", errorText);
      throw new Error(`Billingo API error: ${billingoResponse.status} - ${errorText}`);
    }

    const billingoData = await billingoResponse.json();

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        invoice_number: billingoData.invoice_number,
        invoice_id: billingoData.id,
        invoice_url: billingoData.public_url,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Failed to update order with invoice data:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        invoice: billingoData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating Billingo invoice:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
