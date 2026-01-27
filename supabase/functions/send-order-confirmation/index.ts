import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderConfirmationRequest {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  orderTotal: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    zip: string;
    country: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      orderId,
      customerEmail,
      customerName,
      orderTotal,
      items,
      shippingAddress
    }: OrderConfirmationRequest = await req.json();

    if (!orderId || !customerEmail || !orderTotal || !items) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: orderId, customerEmail, orderTotal, items"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          error: "RESEND_API_KEY environment variable is not set"
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

    const resend = new Resend(resendApiKey);

    const itemsHtml = items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px;">${item.name}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">${item.price.toLocaleString('hu-HU')} Ft</td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Rendelés visszaigazolás</h2>
        <p style="color: #555; line-height: 1.6;">
          Kedves ${customerName || customerEmail}!
        </p>
        <p style="color: #555; line-height: 1.6;">
          Köszönjük rendelését! Rendelését sikeresen rögzítettük és hamarosan feldolgozzuk.
        </p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Rendelés azonosító:</strong> ${orderId}</p>
          <p style="margin: 5px 0;"><strong>Összeg:</strong> ${orderTotal.toLocaleString('hu-HU')} Ft</p>
        </div>

        <h3 style="color: #333; margin-top: 30px;">Rendelt termékek</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Termék</th>
              <th style="padding: 10px; text-align: center;">Mennyiség</th>
              <th style="padding: 10px; text-align: right;">Ár</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #f5f5f5;">
              <td colspan="2" style="padding: 10px; text-align: right;">Összesen:</td>
              <td style="padding: 10px; text-align: right;">${orderTotal.toLocaleString('hu-HU')} Ft</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="color: #333; margin-top: 30px;">Szállítási cím</h3>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;">${shippingAddress.name}</p>
          <p style="margin: 5px 0;">${shippingAddress.street}</p>
          <p style="margin: 5px 0;">${shippingAddress.zip} ${shippingAddress.city}</p>
          <p style="margin: 5px 0;">${shippingAddress.country}</p>
        </div>

        <p style="color: #555; line-height: 1.6; margin-top: 30px;">
          A rendelés állapotáról e-mailben értesítjük.
        </p>

        <p style="color: #777; font-size: 14px; margin-top: 30px;">
          Üdvözlettel,<br>
          A Vintage Ruhabolt csapata
        </p>
      </div>
    `;

    const emailData = await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `Rendelés visszaigazolás - ${orderId}`,
      html: emailHtml,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order confirmation email sent successfully",
        emailId: emailData.data?.id,
        emailDetails: {
          to: customerEmail,
          subject: `Rendelés visszaigazolás - ${orderId}`,
          orderId
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in send-order-confirmation:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
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
