import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  orderId: string;
  customerEmail: string;
  orderStatus: string;
  trackingNumber?: string;
  orderTotal?: number;
}

const statusMessages = {
  processing: {
    subject: "Rendelése feldolgozás alatt",
    message: "Köszönjük rendelését! A rendelése feldolgozás alatt van, hamarosan csomagoljuk."
  },
  packed: {
    subject: "Rendelése becsomagolva",
    message: "Jó hírünk van! Rendelését becsomagoltuk és hamarosan feladásra kerül."
  },
  shipped: {
    subject: "Rendelése elindult",
    message: "Rendelését feladtuk! Hamarosan megérkezik önhöz."
  },
  delivered: {
    subject: "Rendelése kézbesítve",
    message: "Rendelését sikeresen kézbesítettük! Reméljük elégedett a termékkel."
  },
  cancelled: {
    subject: "Rendelése törölve",
    message: "Rendelését töröltük. Ha kérdése van, kérjük vegye fel velünk a kapcsolatot."
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { orderId, customerEmail, orderStatus, trackingNumber, orderTotal }: EmailRequest = await req.json();

    if (!orderId || !customerEmail || !orderStatus) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: orderId, customerEmail, orderStatus"
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

    const statusInfo = statusMessages[orderStatus as keyof typeof statusMessages] || {
      subject: "Rendelés státusz frissítés",
      message: "A rendelése státusza megváltozott."
    };

    const resend = new Resend(resendApiKey);

    let emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">${statusInfo.subject}</h2>
        <p style="color: #555; line-height: 1.6;">${statusInfo.message}</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Rendelés azonosító:</strong> ${orderId}</p>
          <p style="margin: 5px 0;"><strong>Státusz:</strong> ${orderStatus}</p>
          ${trackingNumber ? `<p style="margin: 5px 0;"><strong>Csomagkövetési szám:</strong> ${trackingNumber}</p>` : ''}
          ${orderTotal ? `<p style="margin: 5px 0;"><strong>Összeg:</strong> ${orderTotal.toLocaleString('hu-HU')} Ft</p>` : ''}
        </div>
        <p style="color: #777; font-size: 14px;">Köszönjük, hogy velünk vásárolt!</p>
      </div>
    `;

    const emailData = await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: statusInfo.subject,
      html: emailHtml,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        emailId: emailData.data?.id,
        emailDetails: {
          to: customerEmail,
          subject: statusInfo.subject,
          orderId,
          status: orderStatus
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
    console.error("Error in send-order-status-email:", error);
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
