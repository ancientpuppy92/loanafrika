import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getApplication } from "@/lib/loans.functions";
import { formatMoney, type CountryCode } from "@/lib/loans";
import { ArrowLeft, CheckCircle2, Clock, XCircle, CreditCard, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/status/$id")({
  head: () => ({ meta: [{ title: "Application status — LendAfrica" }] }),
  component: StatusPage,
});

const STEPS = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under review" },
  { key: "approved", label: "Approved" },
  { key: "disbursed", label: "Disbursed" },
];

function StatusPage() {
  const { id } = Route.useParams();
  const fetchApp = useServerFn(getApplication);
  const { data, isLoading, error } = useQuery({
    queryKey: ["application", id],
    queryFn: () => fetchApp({ data: { id } }),
  });

  const app = data?.application as any;
  const currentStepIdx = app ? Math.max(0, STEPS.findIndex((s) => s.key === app.status)) : 0;
  const rejected = app?.status === "rejected";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 w-full">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/dashboard"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to applications</Link>
        </Button>

        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {error && <p className="text-destructive">{(error as Error).message}</p>}

        {app && (
          <>
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {app.country === "NG" ? "🇳🇬 Nigeria" : "🇰🇪 Kenya"} · Ref {String(app.id).slice(0, 8)}
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight capitalize mt-1">{app.loan_type} loan</h1>
                  <p className="text-muted-foreground mt-1">
                    {formatMoney(Number(app.amount), app.country as CountryCode)} over {app.tenure_months} months
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={app.payment_status === "paid" ? "default" : app.payment_status === "failed" ? "destructive" : "secondary"}>
                    <CreditCard className="mr-1 h-3 w-3" /> Fee {app.payment_status}
                  </Badge>
                  <Badge variant={rejected ? "destructive" : "outline"}>
                    Status: {String(app.status).replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="font-semibold mb-4">Progress</h2>
                {rejected ? (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" /> Application was not approved.
                  </div>
                ) : (
                  <ol className="space-y-3">
                    {STEPS.map((step, i) => {
                      const done = i <= currentStepIdx;
                      const active = i === currentStepIdx;
                      return (
                        <li key={step.key} className="flex items-center gap-3">
                          {done ? (
                            <CheckCircle2 className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground/40" />
                          )}
                          <span className={done ? (active ? "font-medium" : "text-foreground") : "text-muted-foreground"}>
                            {step.label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 text-sm">
                <Info label="Application fee" value={formatMoney(Number(app.application_fee), app.country as CountryCode)} />
                <Info label="Currency" value={app.currency} />
                <Info label="Employment" value={app.employment_status || "—"} />
                <Info label="Monthly income" value={app.monthly_income ? formatMoney(Number(app.monthly_income), app.country as CountryCode) : "—"} />
                <Info label="Bank" value={app.bank_name || "—"} />
                <Info label="Account" value={app.account_number || "—"} />
                <Info label="Submitted" value={new Date(app.created_at).toLocaleString()} full />
              </div>
            </div>

            {app.payment_status !== "paid" && (
              <div className="mt-4 rounded-lg border bg-muted/40 p-4 flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Your application fee is {app.payment_status}. Reviews begin once payment is confirmed.
                </p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Info({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium mt-0.5">{value}</p>
    </div>
  );
}
