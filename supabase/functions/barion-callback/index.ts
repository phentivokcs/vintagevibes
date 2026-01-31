import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const paymentId = url.searchParams.get("paymentId");

    if (!paymentId) {
      throw new Error("Missing paymentId parameter");
    }

    const { data: settings } = await supabase
      .from("site_settings")
      .select("barion_pos_key, barion_environment")
      .maybeSingle();

    if (!settings || !settings.barion_pos_key) {
      throw new Error("Barion is not configured");
    }

    const barionBaseUrl = settings.barion_environment === "production"
      ? "https://api.barion.com"
      : "https://api.test.barion.com";

    const getPaymentStateResponse = await fetch(
      `${barionBaseUrl}/v2/Payment/GetPaymentState`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          POSKey: settings.barion_pos_key,
          PaymentId: paymentId,
        }),
      }
    );

    const paymentState = await getPaymentStateResponse.json();

    if (!getPaymentStateResponse.ok || paymentState.Errors?.length > 0) {
      console.error("Barion GetPaymentState error:", paymentState);
      throw new Error("Failed to get payment state from Barion");
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id, customer_id")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (!order) {
      throw new Error("Order not found");
    }

    const barionStatus = paymentState.Status;
    let newOrderStatus = "processing";
    let newPaymentStatus = "pending";

    switch (barionStatus) {
      case "Prepared":
        newPaymentStatus = "prepared";
        break;
      case "Started":
        newPaymentStatus = "started";
        break;
      case "Succeeded":
        newOrderStatus = "processing";
        newPaymentStatus = "succeeded";
        break;
      case "Failed":
        newOrderStatus = "cancelled";
        newPaymentStatus = "failed";
        break;
      case "Canceled":
        newOrderStatus = "cancelled";
        newPaymentStatus = "cancelled";
        break;
      case "Expired":
        newOrderStatus = "cancelled";
        newPaymentStatus = "expired";
        break;
    }

    await supabase
      .from("orders")
      .update({
        status: newOrderStatus,
        payment_status: newPaymentStatus,
        barion_transaction_id: paymentState.Transactions?.[0]?.TransactionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (newPaymentStatus === "succeeded") {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id, quantity, price, products(name)")
        .eq("order_id", order.id);

      if (orderItems) {
        for (const item of orderItems) {
          await supabase
            .from("products")
            .update({
              inventory_status: "sold",
              sold: true,
              stock: 0,
              reserved_by: null,
              reserved_until: null,
            })
            .eq("id", item.product_id);
        }
      }

      const { data: fullOrder } = await supabase
        .from("orders")
        .select("customer_email, total_amount, shipping_address")
        .eq("id", order.id)
        .maybeSingle();

      if (fullOrder && orderItems) {
        try {
          const items = orderItems.map(item => ({
            name: item.products?.name || "Unknown Product",
            quantity: item.quantity,
            price: item.price,
          }));

          await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-confirmation`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: order.id,
                customerEmail: fullOrder.customer_email,
                orderTotal: fullOrder.total_amount,
                items: items,
                shippingAddress: fullOrder.shipping_address,
              }),
            }
          );
        } catch (emailError) {
          console.error("Failed to send order confirmation email:", emailError);
        }

        try {
          await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/billingo-create-invoice`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: order.id,
              }),
            }
          );
        } catch (invoiceError) {
          console.error("Failed to create Billingo invoice:", invoiceError);
        }
      }
    } else if (["failed", "cancelled", "expired"].includes(newPaymentStatus)) {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_id")
        .eq("order_id", order.id);

      if (orderItems) {
        for (const item of orderItems) {
          await supabase
            .from("products")
            .update({
              inventory_status: "available",
              reserved_by: null,
              reserved_until: null,
            })
            .eq("id", item.product_id);
        }
      }
    }

    // Redirect user to payment result page
    const frontendUrl = req.headers.get("referer") || req.headers.get("origin") || "https://www.vintagevibes.hu";
    const frontendOrigin = frontendUrl.startsWith("http") ? new URL(frontendUrl).origin : frontendUrl;
    const redirectUrl = `${frontendOrigin}/payment-result?orderId=${order.id}&status=${newPaymentStatus}`;

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <title>Átirányítás...</title>
        </head>
        <body>
          <p>Átirányítás...</p>
          <script>window.location.href = "${redirectUrl}";</script>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  } catch (error) {
    console.error("Callback error:", error);

    // Redirect to error page even on errors
    const url = new URL(req.url);
    const frontendUrl = req.headers.get("referer") || req.headers.get("origin") || "https://www.vintagevibes.hu";
    const frontendOrigin = frontendUrl.startsWith("http") ? new URL(frontendUrl).origin : frontendUrl;
    const errorUrl = `${frontendOrigin}/payment-result?status=error&message=${encodeURIComponent(error.message)}`;

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="refresh" content="0;url=${errorUrl}">
          <title>Átirányítás...</title>
        </head>
        <body>
          <p>Átirányítás...</p>
          <script>window.location.href = "${errorUrl}";</script>
        </body>
      </html>`,
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
        },
      }
    );
  }
});
