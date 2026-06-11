import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCountry } from "@/lib/country-context";
import { useAuth } from "@/lib/auth-context";
import { getProduct, formatMoney, calculateApplicationFee } from "@/lib/loans";
import { initiateApplication, verifyPayment } from "@/lib/loans.functions";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

const searchSchema = z.object({
  ref: z.string().optional(),
  app: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/apply/$loanType")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Apply for a loan — LendAfrica" }] }),
  component: ApplyPage,
});

function ApplyPage() {
  const { loanType } = Route.useParams();
  const search = useSearch({ from: "/_authenticated/apply/$loanType" });
  const { config, country } = useCountry();
  const { user } = useAuth();
  const navigate = useNavigate();
  const product = getProduct(country, loanType);

  const verifyFn = useServerFn(verifyPayment);
  const initiateFn = useServerFn(initiateApplication);

  const [amount, setAmount] = useState<number>(product?.minAmount ?? 0);
  const [tenure, setTenure] = useState<number>(product?.tenureMonths[0] ?? 6);
  const [purpose, setPurpose] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("Employed");
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [bvnOrId, setBvnOrId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifyState, setVerifyState] = useState<"idle" | "verifying" | "done">("idle");

  useEffect(() => {
    if (product) {
      setAmount(product.minAmount);
      setTenure(product.tenureMonths[0]);
    }
  }, [product]);

  // Handle payment return
  useEffect(() => {
    if (search.ref && search.app && verifyState === "idle") {
      setVerifyState("verifying");
      verifyFn({ data: { reference: search.ref, applicationId: search.app } })
        .then((res) => {
          setVerifyState("done");
          if (res.paymentStatus === "paid") {
            toast.success("Payment received — your application is being reviewed.");
            navigate({ to: "/dashboard" });
          } else if (res.paymentStatus === "failed") {
            toast.error("Payment failed. Please try again.");
          } else {
            toast.info("Payment pending confirmation.");
          }
        })
        .catch((e) => {
          setVerifyState("done");
          toast.error(e.message ?? "Could not verify payment");
        });
    }
  }, [search.ref, search.app, verifyFn, verifyState, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 grid place-items-center p-6 text-center">
          <div>
            <h1 className="text-xl font-semibold">Loan product not available in {config.name}</h1>
            <Button className="mt-4" onClick={() => navigate({ to: "/loans" })}>See available loans</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const applicationFee = product ? calculateApplicationFee(amount || product.minAmount, product.applicationFee) : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    if (amount < product.minAmount || amount > product.maxAmount) {
      toast.error(`Amount must be between ${formatMoney(product.minAmount, country)} and ${formatMoney(product.maxAmount, country)}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await initiateFn({
        data: {
          country,
          loanType: product.slug,
          amount,
          tenureMonths: tenure,
          applicationFee,
          currency: config.korapayCurrency,
          purpose: purpose || undefined,
          employmentStatus,
          monthlyIncome: monthlyIncome ? Number(monthlyIncome) : undefined,
          bvnOrId: bvnOrId || undefined,
          bankName: bankName || undefined,
          accountNumber: accountNumber || undefined,
          fullName,
          email: user!.email!,
          phone,
          redirectUrl: `${window.location.origin}/apply/${product.slug}`,
        },
      });
      // Redirect to Korapay checkout
      window.location.href = res.checkoutUrl;
    } catch (err: any) {
      toast.error(err.message ?? "Could not start payment");
      setSubmitting(false);
    }
  }

  if (verifyState === "verifying") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 grid place-items-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 font-medium">Confirming your payment…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 w-full">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">{config.flag} {config.name}</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name} application</h1>
          <p className="text-muted-foreground mt-1">{product.tagline}</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6 space-y-6 shadow-soft">
          <Section title="Loan details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`Amount (${config.currency})`}>
                <Input
                  type="number" required
                  min={product.minAmount} max={product.maxAmount}
                  value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatMoney(product.minAmount, country)} – {formatMoney(product.maxAmount, country)}
                </p>
              </Field>
              <Field label="Tenure">
                <Select value={String(tenure)} onValueChange={(v) => setTenure(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {product.tenureMonths.map((m) => (
                      <SelectItem key={m} value={String(m)}>{m} months</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Purpose (optional)" full>
                <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} maxLength={500} placeholder="What will you use this for?" />
              </Field>
            </div>
          </Section>

          <Section title="About you">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name"><Input required value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} /></Field>
              <Field label="Phone"><Input required value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} /></Field>
              <Field label="Employment status">
                <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Employed", "Self-employed", "Business owner", "Student", "Unemployed"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={`Monthly income (${config.currency})`}>
                <Input type="number" min={0} value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} />
              </Field>
              <Field label={country === "NG" ? "BVN" : "National ID"}>
                <Input value={bvnOrId} onChange={(e) => setBvnOrId(e.target.value)} maxLength={50} />
              </Field>
            </div>
          </Section>

          <Section title="Disbursement account">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bank name"><Input value={bankName} onChange={(e) => setBankName(e.target.value)} maxLength={100} /></Field>
              <Field label="Account number"><Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} maxLength={30} /></Field>
            </div>
          </Section>

          <div className="rounded-lg bg-muted p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Application fee: {formatMoney(product.applicationFee, country)}</p>
              <p className="text-muted-foreground">
                Charged securely via Korapay. Required to process your application.
              </p>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay {formatMoney(product.applicationFee, country)} & submit
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
