import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth-context";
import { CountryProvider } from "@/lib/country-context";
import { RenderEnvChecklist } from "@/components/RenderEnvChecklist";
import { ServerOff } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const msg = error.message ?? "";
  const isEnvError =
    msg.includes("Missing Supabase environment variable") ||
    msg.includes("SUPABASE_URL") ||
    msg.includes("SUPABASE_PUBLISHABLE_KEY") ||
    msg.includes("not configured");

  const detectedMissing: string[] = [];
  if (msg.includes("SUPABASE_URL")) detectedMissing.push("SUPABASE_URL", "VITE_SUPABASE_URL");
  if (msg.includes("SUPABASE_PUBLISHABLE_KEY")) detectedMissing.push("SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY");
  if (msg.includes("not configured")) detectedMissing.push("KORAPAY_SECRET_KEY", "FLUTTERWAVE_SECRET_KEY", "FLUTTERWAVE_WEBHOOK_HASH");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ServerOff className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {isEnvError ? "Deployment configuration incomplete" : "This page didn't load"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEnvError
              ? "Some required environment variables are missing on this deployment."
              : "Something went wrong on our end. You can try refreshing or head back home."}
          </p>
        </div>

        {isEnvError && <RenderEnvChecklist detectedMissing={detectedMissing} />}

        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Loanafrika" },
      { name: "description", content: "AfriLoan Connect is a loan platform for Nigeria and Kenya, enabling users to access loans with application fees." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Loanafrika" },
      { property: "og:description", content: "AfriLoan Connect is a loan platform for Nigeria and Kenya, enabling users to access loans with application fees." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Loanafrika" },
      { name: "twitter:description", content: "AfriLoan Connect is a loan platform for Nigeria and Kenya, enabling users to access loans with application fees." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/32ba9998-3b8f-4a0f-8c74-7be2de45a659/id-preview-81f7c053--665b4754-d09f-4223-803b-8c762eed3ced.lovable.app-1781050572968.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/32ba9998-3b8f-4a0f-8c74-7be2de45a659/id-preview-81f7c053--665b4754-d09f-4223-803b-8c762eed3ced.lovable.app-1781050572968.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CountryProvider>
          <Outlet />
          <Toaster position="top-center" richColors />
        </CountryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
