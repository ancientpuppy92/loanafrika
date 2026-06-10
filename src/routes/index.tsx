import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCountry } from "@/lib/country-context";
import { formatMoney } from "@/lib/loans";
import { ArrowRight, ShieldCheck, Zap, Wallet, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LendAfrica — Fast loans for Nigeria & Kenya" },
      { name: "description", content: "Apply for quick, personal and SME loans in Nigeria and Kenya. Same-day decisions, transparent fees." },
    ],
  }),
  component: Home,
});

function Home() {
  const { config } = useCountry();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hero text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 py-20 md:py-28 grid gap-10 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur">
                <span>{config.flag}</span> Now lending in {config.name}
              </div>
              <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Loans that move<br /> as fast as you do.
              </h1>
              <p className="mt-5 text-lg text-primary-foreground/80 max-w-md">
                From {formatMoney(config.products[0].minAmount, config.code)} to{" "}
                {formatMoney(config.products[config.products.length - 1].maxAmount, config.code)} —
                apply in minutes, get a decision the same day.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/loans">
                    Explore loans <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-primary-foreground hover:bg-white/15">
                  <Link to="/auth">Create account</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/15 shadow-elegant">
                  <p className="text-sm text-primary-foreground/70">Sample monthly repayment</p>
                  <p className="mt-2 text-4xl font-bold">
                    {formatMoney(Math.round(config.products[1].minAmount / 12 * 1.04), config.code)}
                  </p>
                  <p className="mt-1 text-sm text-primary-foreground/70">
                    {formatMoney(config.products[1].minAmount, config.code)} over 12 months · {config.products[1].interestRate}
                  </p>
                  <div className="mt-6 space-y-2 text-sm">
                    {["No hidden fees", "Same-day disbursement", "Transparent application fee"].map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" /> {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-16 grid gap-6 md:grid-cols-3">
          {[
            { Icon: Zap, title: "Decision in minutes", body: "Apply online and hear back the same day. No branch visits." },
            { Icon: ShieldCheck, title: "Bank-grade security", body: "Your data is encrypted and never shared. Payments via Korapay." },
            { Icon: Wallet, title: "Disbursed to your bank", body: "Funds sent direct to your bank account or M-Pesa." },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card-gradient p-6 shadow-soft">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>

        {/* Products preview */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Loan products in {config.name}</h2>
              <p className="text-muted-foreground mt-1">Choose what fits your need.</p>
            </div>
            <Button asChild variant="ghost"><Link to="/loans">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {config.products.map((p) => (
              <div key={p.slug} className="rounded-xl border bg-card p-6 hover:shadow-elegant transition">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.tagline}</p>
                <div className="mt-4 text-sm space-y-1.5">
                  <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">{formatMoney(p.minAmount, config.code)} – {formatMoney(p.maxAmount, config.code)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Interest</span><span className="font-medium">{p.interestRate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">App. fee</span><span className="font-medium">{formatMoney(p.applicationFee, config.code)}</span></div>
                </div>
                <Button asChild className="w-full mt-5">
                  <Link to="/apply/$loanType" params={{ loanType: p.slug }}>Apply now</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
