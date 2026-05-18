import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({
          error: "Missing required field: email"
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

    const displayName = name || email;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Üdvözöljük a Vintage Ruhaboltban!</h2>
        <p style="color: #555; line-height: 1.6;">Kedves ${displayName}!</p>
        <p style="color: #555; line-height: 1.6;">
          Köszönjük, hogy regisztrált weboldalunkon! Mostantól élvezheti a vintage vásárlás minden előnyét:
        </p>
        <ul style="color: #555; line-height: 1.8;">
          <li>Gyorsabb fizetés és rendelés</li>
          <li>Rendelései nyomon követése</li>
          <li>Kedvencek mentése</li>
          <li>Exkluzív ajánlatok és kedvezmények</li>
        </ul>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email cím:</strong> ${email}</p>
        </div>
        <p style="color: #555; line-height: 1.6;">
          Kezdje el a böngészést és találja meg a tökéletes vintage darabokat!
        </p>
        <p style="color: #777; font-size: 14px; margin-top: 30px;">
          Üdvözlettel,<br>
          A Vintage Ruhabolt csapata
        </p>
      </div>
    `;

    const emailData = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Üdvözöljük a Vintage Ruhaboltban!",
      html: emailHtml,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Welcome email sent successfully",
        emailId: emailData.data?.id,
        emailDetails: {
          to: email,
          subject: "Üdvözöljük a Vintage Ruhaboltban!"
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
    console.error("Error in send-welcome-email:", error);
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
