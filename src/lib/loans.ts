export type CountryCode = "NG" | "KE";

export interface LoanProduct {
  slug: string;
  name: string;
  tagline: string;
  minAmount: number;
  maxAmount: number;
  tenureMonths: number[];
  interestRate: string;
  applicationFee: number;
}

export interface CountryConfig {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  korapayCurrency: "NGN" | "KES";
  products: LoanProduct[];
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  NG: {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    currency: "NGN",
    currencySymbol: "₦",
    locale: "en-NG",
    korapayCurrency: "NGN",
    products: [
      {
        slug: "quick",
        name: "Quick Cash Loan",
        tagline: "Same-day disbursement for emergencies",
        minAmount: 50_000,
        maxAmount: 500_000,
        tenureMonths: [1, 3, 6],
        interestRate: "4% / month",
        applicationFee: 2_400,
      },
      {
        slug: "personal",
        name: "Personal Loan",
        tagline: "Flexible financing for life's big moments",
        minAmount: 500_000,
        maxAmount: 2_000_000,
        tenureMonths: [6, 12, 18, 24],
        interestRate: "3% / month",
        applicationFee: 3_600,
      },
      {
        slug: "business",
        name: "SME Business Loan",
        tagline: "Working capital to scale your business",
        minAmount: 2_000_000,
        maxAmount: 10_000_000,
        tenureMonths: [12, 18, 24, 36],
        interestRate: "2.5% / month",
        applicationFee: 6_000,
      },
    ],
  },
  KE: {
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    currency: "KES",
    currencySymbol: "KSh",
    locale: "en-KE",
    korapayCurrency: "KES",
    products: [
      {
        slug: "quick",
        name: "Quick Cash Loan",
        tagline: "Instant M-Pesa disbursement",
        minAmount: 5_000,
        maxAmount: 50_000,
        tenureMonths: [1, 3, 6],
        interestRate: "4% / month",
        applicationFee: 199,
      },
      {
        slug: "personal",
        name: "Personal Loan",
        tagline: "Flexible financing for life's big moments",
        minAmount: 50_000,
        maxAmount: 200_000,
        tenureMonths: [6, 12, 18, 24],
        interestRate: "3% / month",
        applicationFee: 299,
      },
      {
        slug: "business",
        name: "SME Business Loan",
        tagline: "Working capital to scale your business",
        minAmount: 200_000,
        maxAmount: 1_000_000,
        tenureMonths: [12, 18, 24, 36],
        interestRate: "2.5% / month",
        applicationFee: 499,
      },
    ],
  },
};

export function formatMoney(amount: number, country: CountryCode) {
  const c = COUNTRIES[country];
  return `${c.currencySymbol}${amount.toLocaleString(c.locale)}`;
}

export function getProduct(country: CountryCode, slug: string) {
  return COUNTRIES[country].products.find((p) => p.slug === slug);
}

// Processing fee scales with loan amount.
// Starting fee is the product's base (KE = 230 KSh, NG = 5,000 NGN) and grows at 1% of the requested amount.
export function calculateApplicationFee(amount: number, baseFee: number) {
  const computed = Math.round((amount * 0.01) / 10) * 10; // round to nearest 10
  return Math.max(baseFee, computed);
}
