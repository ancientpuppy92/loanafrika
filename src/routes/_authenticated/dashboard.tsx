import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyApplications } from "@/lib/loans.functions";
import { formatMoney, type CountryCode } from "@/lib/loans";
import { Plus, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LendAfrica" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchApps = useServerFn(getMyApplications);
  const { data, isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => fetchApps(),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl px-4 py-10 w-full">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your applications</h1>
            <p className="text-muted-foreground mt-1">Track status and payment for each loan.</p>
          </div>
          <Button asChild><Link to="/loans"><Plus className="mr-1.5 h-4 w-4" /> New application</Link></Button>
        </div>

        <div className="mt-8 space-y-4">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && data?.applications.length === 0 && (
            <div className="rounded-xl border border-dashed bg-card p-12 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-medium">No applications yet</p>
              <p className="text-sm text-muted-foreground">Pick a loan to get started.</p>
              <Button asChild className="mt-4"><Link to="/loans">Browse loans</Link></Button>
            </div>
          )}
          {data?.applications.map((a: any) => (
            <Link
              key={a.id}
              to="/status/$id"
              params={{ id: a.id }}
              className="rounded-xl border bg-card p-5 flex flex-wrap items-center gap-4 justify-between hover:border-primary/50 hover:shadow-soft transition"
            >
              <div>
                <p className="font-semibold capitalize">{a.loan_type} loan · {a.country === "NG" ? "🇳🇬" : "🇰🇪"}</p>
                <p className="text-sm text-muted-foreground">
                  {formatMoney(Number(a.amount), a.country as CountryCode)} · {a.tenure_months} months
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant={a.payment_status === "paid" ? "default" : a.payment_status === "failed" ? "destructive" : "secondary"}>
                  Fee: {a.payment_status}
                </Badge>
                <Badge variant="outline">Status: {a.status.replace("_", " ")}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
