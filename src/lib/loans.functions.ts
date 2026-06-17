import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const initiateSchema = z.object({
  country: z.enum(["NG", "KE"]),
  loanType: z.string().min(1).max(50),
  amount: z.number().positive().max(50_000_000),
  tenureMonths: z.number().int().positive().max(60),
  applicationFee: z.number().positive().max(1_000_000),
  currency: z.enum(["NGN", "KES"]),
  purpose: z.string().max(500).optional(),
  employmentStatus: z.string().max(50).optional(),
  monthlyIncome: z.number().nonnegative().optional(),
  bvnOrId: z.string().max(50).optional(),
  bankName: z.string().max(100).optional(),
  accountNumber: z.string().max(30).optional(),
  fullName: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(5).max(30),
  redirectUrl: z.string().url(),
});

export const initiateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => initiateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: app, error } = await supabase
      .from("loan_applications")
      .insert({
        user_id: userId,
        country: data.country,
        loan_type: data.loanType,
        amount: data.amount,
        tenure_months: data.tenureMonths,
        application_fee: data.applicationFee,
        currency: data.currency,
        purpose: data.purpose,
        employment_status: data.employmentStatus,
        monthly_income: data.monthlyIncome,
        bvn_or_id: data.bvnOrId,
        bank_name: data.bankName,
        account_number: data.accountNumber,
      })
      .select()
      .single();

    if (error || !app) throw new Error(error?.message || "Failed to create application");

    const secret = process.env.KORAPAY_SECRET_KEY;
    if (!secret) throw new Error("Payment provider not configured");

    const reference = `LA-${app.id.slice(0, 8)}-${Date.now()}`;

    const res = await fetch("https://api.korapay.com/merchant/api/v1/charges/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        amount: data.applicationFee,
        currency: data.currency,
        reference,
        narration: `Loan application fee — ${data.loanType}`,
        notification_url: `${new URL(data.redirectUrl).origin}/api/public/korapay-webhook`,
        redirect_url: `${data.redirectUrl}?ref=${reference}&app=${app.id}`,
        customer: { name: data.fullName, email: data.email },
        metadata: { application_id: app.id, user_id: userId },
      }),
    });

    const payload = (await res.json()) as {
      status: boolean;
      message?: string;
      data?: { checkout_url: string; reference: string };
    };

    if (!res.ok || !payload.status || !payload.data?.checkout_url) {
      throw new Error(payload.message || "Could not initialize payment");
    }

    await supabase
      .from("loan_applications")
      .update({ payment_reference: payload.data.reference })
      .eq("id", app.id);

    return { checkoutUrl: payload.data.checkout_url, reference: payload.data.reference, applicationId: app.id };
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ reference: z.string().min(1).max(120), applicationId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const secret = process.env.KORAPAY_SECRET_KEY;
    if (!secret) throw new Error("Payment provider not configured");

    const res = await fetch(
      `https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(data.reference)}`,
      { headers: { Authorization: `Bearer ${secret}` } },
    );
    const payload = (await res.json()) as {
      status: boolean;
      data?: { status: string; amount: number; currency: string };
    };

    const koraStatus = payload?.data?.status?.toLowerCase();
    const newStatus = koraStatus === "success" ? "paid" : koraStatus === "failed" ? "failed" : "pending";

    const { error } = await supabase
      .from("loan_applications")
      .update({ payment_status: newStatus })
      .eq("id", data.applicationId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { paymentStatus: newStatus };
  });

export const getMyApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("loan_applications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { applications: data ?? [] };
  });

export const getApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: app, error } = await supabase
      .from("loan_applications")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!app) throw new Error("Application not found");
    return { application: app };
  });
