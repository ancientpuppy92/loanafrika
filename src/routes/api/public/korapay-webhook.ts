import { createFileRoute } from "@tanstack/react-router";

// Korapay webhook receiver. Verifies signature and updates application payment status.
export const Route = createFileRoute("/api/public/korapay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature = request.headers.get("x-korapay-signature");
        const secret = process.env.KORAPAY_SECRET_KEY;
        if (!secret) return new Response("not configured", { status: 500 });

        let payload: any;
        try { payload = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }

        // Verify HMAC SHA-256 of payload.data with secret key
        try {
          const { createHmac, timingSafeEqual } = await import("crypto");
          const expected = createHmac("sha256", secret).update(JSON.stringify(payload.data ?? {})).digest("hex");
          if (!signature || signature.length !== expected.length ||
              !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
            return new Response("invalid signature", { status: 401 });
          }
        } catch {
          return new Response("verification failed", { status: 401 });
        }

        const event = payload.event as string | undefined;
        const data = payload.data ?? {};
        const reference = data.reference as string | undefined;
        if (!reference) return new Response("ok");

        const status = event === "charge.success" ? "paid"
          : event === "charge.failed" ? "failed"
          : null;
        if (!status) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("loan_applications")
          .update({ payment_status: status })
          .eq("payment_reference", reference);

        return new Response("ok");
      },
    },
  },
});
