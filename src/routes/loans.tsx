import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/lib/country-context";
import { formatMoney } from "@/lib/loans";

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [
      { title: "Loan Products — LendAfrica" },
      { name: "description", content: "Quick, personal and business loans tailored for Nigeria and Kenya." },
    ],
  }),
  component: LoansPage,
});

function LoansPage() {
  const { config } = useCountry();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-4 py-14 w-full">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Loans in {config.name} {config.flag}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          All loans require a small application fee that is collected securely at submission.
          Approved disbursements happen the same day.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {config.products.map((p) => (
            <div key={p.slug} className="rounded-2xl border bg-card-gradient p-6 shadow-soft hover:shadow-elegant transition flex flex-col">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{p.tagline}</p>
              <dl className="mt-5 space-y-2 text-sm flex-1">
                <Row k="Amount range" v={`${formatMoney(p.minAmount, config.code)} – ${formatMoney(p.maxAmount, config.code)}`} />
                <Row k="Tenure" v={`${p.tenureMonths[0]} – ${p.tenureMonths[p.tenureMonths.length - 1]} months`} />
                <Row k="Interest" v={p.interestRate} />
                <Row k="Application fee" v={formatMoney(p.applicationFee, config.code)} highlight />
              </dl>
              <Button asChild className="mt-6 w-full">
                <Link to="/apply/$loanType" params={{ loanType: p.slug }}>Apply now</Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between ${highlight ? "border-t pt-2 mt-2" : ""}`}>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={`font-medium ${highlight ? "text-primary" : ""}`}>{v}</dd>
    </div>
  );
}
