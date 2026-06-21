import { AlertTriangle, CheckCircle2, ClipboardList } from "lucide-react";

const REQUIRED_ENV_VARS = [
  {
    name: "VITE_SUPABASE_URL",
    example: "https://your-project.supabase.co",
    purpose: "Supabase project URL (used by frontend)",
  },
  {
    name: "VITE_SUPABASE_PUBLISHABLE_KEY",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    purpose: "Supabase anon/public key (used by frontend)",
  },
  {
    name: "SUPABASE_URL",
    example: "https://your-project.supabase.co",
    purpose: "Supabase project URL (used by backend)",
  },
  {
    name: "SUPABASE_PUBLISHABLE_KEY",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    purpose: "Supabase anon/public key (used by backend)",
  },
  {
    name: "KORAPAY_SECRET_KEY",
    example: "sk_live_... or sk_test_...",
    purpose: "Korapay API secret for Nigeria payments",
  },
  {
    name: "FLUTTERWAVE_SECRET_KEY",
    example: "FLWSECK_TEST-... or FLWSECK-...",
    purpose: "Flutterwave API secret for Kenya & Nigeria payments",
  },
  {
    name: "FLUTTERWAVE_WEBHOOK_HASH",
    example: "your-flutterwave-webhook-secret",
    purpose: "Webhook verification hash from Flutterwave dashboard",
  },
];

export function RenderEnvChecklist({ detectedMissing }: { detectedMissing?: string[] }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-left dark:border-amber-900 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <ClipboardList className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200">
            Render Environment Variable Checklist
          </h3>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-300/90">
            Add these variables in your Render dashboard under{" "}
            <strong>Settings → Environment</strong> so payments work on your custom domain.
          </p>

          <ul className="mt-4 space-y-3">
            {REQUIRED_ENV_VARS.map((env) => {
              const isMissing = detectedMissing?.includes(env.name);
              const isDetected = detectedMissing !== undefined;
              return (
                <li
                  key={env.name}
                  className="flex items-start gap-3 rounded-lg border border-amber-200/60 bg-white/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20"
                >
                  {isDetected ? (
                    isMissing ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-red-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                    )
                  ) : (
                    <span className="mt-0.5 h-4 w-4 rounded-full border-2 border-amber-300 dark:border-amber-700 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <code className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      {env.name}
                    </code>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                      {env.purpose}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Example: <code className="text-[11px]">{env.example}</code>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 rounded-md bg-amber-100 p-3 text-xs text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
            <strong>Tip:</strong> After saving variables, Render will redeploy automatically.
            If payments still fail, check the server logs for {" "}
            <code>[flutterwave-webhook]</code> or <code>[korapay]</code> entries.
          </div>
        </div>
      </div>
    </div>
  );
}
