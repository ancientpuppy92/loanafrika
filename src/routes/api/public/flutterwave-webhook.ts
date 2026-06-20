import { createFileRoute } from "@tanstack/react-router";

// Flutterwave webhook receiver. Verifies verif-hash and updates application payment status.
// Logs every step so failures can be diagnosed from server logs.
export const Route = createFileRoute("/api/public/flutterwave-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const log = (level: "info" | "warn" | "error", msg: string, extra?: unknown) => {
          const line = `[flutterwave-webhook] ${msg}`;
          if (extra !== undefined) console[level](line, extra);
          else console[level](line);
        };

        const expectedHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
        if (!expectedHash) {
          log("error", "FLUTTERWAVE_WEBHOOK_HASH not configured");
          return new Response("not configured", { status: 500 });
        }

        const sigHeader = request.headers.get("verif-hash");
        if (!sigHeader) {
          log("warn", "missing verif-hash header", {
            headers: Array.from(request.headers.keys()),
          });
          return new Response("missing signature", { status: 401 });
        }

        // Constant-time compare to avoid timing leaks
        const a = Buffer.from(sigHeader);
        const b = Buffer.from(expectedHash);
        let mismatch = a.length !== b.length;
        const len = Math.max(a.length, b.length);
        for (let i = 0; i < len; i++) {
          mismatch ||= (a[i] ?? 0) !== (b[i] ?? 0);
        }
        if (mismatch) {
          log("warn", "invalid verif-hash", { received_len: sigHeader.length });
          return new Response("invalid signature", { status: 401 });
        }

        const raw = await request.text();
        let payload: any;
        try {
          payload = JSON.parse(raw);
        } catch (e) {
          log("error", "bad json body", { raw: raw.slice(0, 500) });
          return new Response("bad json", { status: 400 });
        }

        const event: string | undefined = payload?.event;
        const data = payload?.data ?? payload;
        const txRef: string | undefined = data?.tx_ref;
        const fwStatus: string = String(data?.status ?? "").toLowerCase();
        const txId = data?.id;

        log("info", "received event", { event, tx_ref: txRef, status: fwStatus, tx_id: txId });

        if (!txRef) {
          log("warn", "no tx_ref in payload — acknowledging");
          return new Response("ok");
        }

        const status =
          fwStatus === "successful" ? "paid" : fwStatus === "failed" ? "failed" : null;
        if (!status) {
          log("info", "non-terminal status — acknowledging without update", { fwStatus });
          return new Response("ok");
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: updated, error } = await supabaseAdmin
            .from("loan_applications")
            .update({ payment_status: status })
            .eq("payment_reference", txRef)
            .select("id, payment_status");

          if (error) {
            log("error", "supabase update failed", { error: error.message, tx_ref: txRef });
            return new Response("db error", { status: 500 });
          }
          if (!updated || updated.length === 0) {
            log("warn", "no application matched payment_reference", { tx_ref: txRef });
            return new Response("ok");
          }
          log("info", "application updated", { tx_ref: txRef, status, rows: updated.length });
        } catch (e: any) {
          log("error", "unexpected error", { error: e?.message ?? String(e) });
          return new Response("internal error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
