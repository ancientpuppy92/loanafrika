import { createFileRoute } from "@tanstack/react-router";

// Flutterwave webhook receiver. Verifies verif-hash and updates application payment status.
export const Route = createFileRoute("/api/public/flutterwave-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expectedHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
        if (!expectedHash) return new Response("not configured", { status: 500 });

        const sigHeader = request.headers.get("verif-hash");
        if (!sigHeader || sigHeader !== expectedHash) {
          return new Response("invalid signature", { status: 401 });
        }

        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response("bad json", { status: 400 });
        }

        // Flutterwave sends event data with tx_ref and status
        const data = payload?.data ?? payload;
        const txRef: string | undefined = data?.tx_ref;
        const fwStatus: string | undefined = (data?.status || "").toLowerCase();
        if (!txRef) return new Response("ok");

        const status =
          fwStatus === "successful" ? "paid" : fwStatus === "failed" ? "failed" : null;
        if (!status) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("loan_applications")
          .update({ payment_status: status })
          .eq("payment_reference", txRef);

        return new Response("ok");
      },
    },
  },
});
