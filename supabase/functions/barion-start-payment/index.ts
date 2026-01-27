import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

interface PacketaPoint {
  id: string;
  name: string;
  place?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  address?: string;
}

interface PaymentRequest {
  cartItems: CartItem[];
  shippingInfo: ShippingInfo;
  billingInfo?: ShippingInfo;
  totalAmount: number;
  packetaPoint?: PacketaPoint | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { cartItems, shippingInfo, billingInfo, totalAmount, packetaPoint }: PaymentRequest = await req.json();

    const { data: settings } = await supabase
      .from("site_settings")
      .select("barion_pos_key, barion_environment, barion_payee_email")
      .maybeSingle();

    if (!settings || !settings.barion_pos_key || !settings.barion_payee_email) {
      throw new Error("Barion is not configured. Please add your POSKey and Payee Email in admin settings.");
    }

    // Trim whitespace from credentials to avoid authentication errors
    const posKey = settings.barion_pos_key.trim();
    const payeeEmail = settings.barion_payee_email.trim();
    const environment = settings.barion_environment || "test";

    // Validate POSKey format (should be a UUID-like string)
    if (posKey.length < 30) {
      throw new Error("Barion POSKey formátuma helytelen. Ellenőrizd, hogy a teljes kulcsot másoltad-e be.");
    }

    const barionBaseUrl = environment === "production"
      ? "https://api.barion.com"
      : "https://api.test.barion.com";

    // Debug info (without exposing full credentials)
    console.log('=== BARION DEBUG INFO ===');
    console.log(`Environment: ${environment}`);
    console.log(`API URL: ${barionBaseUrl}`);
    console.log(`POSKey length: ${posKey.length}`);
    console.log(`POSKey start: ${posKey.substring(0, 8)}...`);
    console.log(`POSKey end: ...${posKey.substring(posKey.length - 4)}`);
    console.log(`Payee email domain: @${payeeEmail.split('@')[1]}`);
    console.log('========================');

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .upsert(
        {
          email: shippingInfo.email,
          name: shippingInfo.name,
          phone: shippingInfo.phone,
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (customerError) throw customerError;

    const orderId = crypto.randomUUID();

    const orderInsert: any = {
      id: orderId,
      customer_id: customer.id,
      status: "processing",
      payment_status: "pending",
      payment_method: "barion",
      total_amount: totalAmount,
      shipping_address: shippingInfo,
      billing_address: billingInfo || shippingInfo,
      customer_email: shippingInfo.email,
      customer_phone: shippingInfo.phone,
      shipping_name: shippingInfo.name,
    };

    if (packetaPoint) {
      orderInsert.packeta_point_id = packetaPoint.id;
      orderInsert.packeta_point_name = packetaPoint.name;
      orderInsert.packeta_point_address = `${packetaPoint.city || ''}, ${packetaPoint.street || packetaPoint.address || ''}`.trim();
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderInsert)
      .select()
      .single();

    if (orderError) throw orderError;

    for (const item of cartItems) {
      await supabase.from("order_items").insert({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      });

      await supabase
        .from("products")
        .update({
          inventory_status: "reserved",
          reserved_by: customer.email,
          reserved_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        })
        .eq("id", item.id);
    }

    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/barion-callback`;
    const redirectUrl = `${req.headers.get("origin") || "http://localhost:5173"}/payment-result`;

    const barionPaymentRequest = {
      POSKey: posKey,
      PaymentType: "Immediate",
      GuestCheckOut: true,
      FundingSources: ["All"],
      PaymentRequestId: orderId,
      Locale: "hu-HU",
      Currency: "HUF",
      CallbackUrl: callbackUrl,
      RedirectUrl: redirectUrl,
      Transactions: [
        {
          POSTransactionId: `${orderId}-1`,
          Payee: payeeEmail,
          Total: totalAmount,
          Items: cartItems.map((item) => ({
            Name: item.name,
            Description: item.size ? `Size: ${item.size}` : "Vintage item",
            Quantity: item.quantity,
            Unit: "piece",
            UnitPrice: item.price,
            ItemTotal: item.price * item.quantity,
            SKU: item.id,
          })),
        },
      ],
    };

    const barionResponse = await fetch(`${barionBaseUrl}/v2/Payment/Start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(barionPaymentRequest),
    });

    const barionData = await barionResponse.json();

    if (!barionResponse.ok || barionData.Errors?.length > 0) {
      console.error("Barion error:", barionData);
      const errorDetails = barionData.Errors?.map((e: any) =>
        `${e.ErrorCode}: ${e.Title} - ${e.Description}`
      ).join('; ') || JSON.stringify(barionData);
      throw new Error(`Barion hiba: ${errorDetails}`);
    }

    await supabase
      .from("orders")
      .update({
        payment_id: barionData.PaymentId,
        payment_status: "prepared",
        payment_redirect_url: barionData.GatewayUrl,
      })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        paymentId: barionData.PaymentId,
        gatewayUrl: barionData.GatewayUrl,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
