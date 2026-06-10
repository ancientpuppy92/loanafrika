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
        applicationFee: 5_000,
      },
      {
        slug: "personal",
        name: "Personal Loan",
        tagline: "Flexible financing for life's big moments",
        minAmount: 500_000,
        maxAmount: 2_000_000,
        tenureMonths: [6, 12, 18, 24],
        interestRate: "3% / month",
        applicationFee: 10_000,
      },
      {
        slug: "business",
        name: "SME Business Loan",
        tagline: "Working capital to scale your business",
        minAmount: 2_000_000,
        maxAmount: 10_000_000,
        tenureMonths: [12, 18, 24, 36],
        interestRate: "2.5% / month",
        applicationFee: 15_000,
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
        applicationFee: 500,
      },
      {
        slug: "personal",
        name: "Personal Loan",
        tagline: "Flexible financing for life's big moments",
        minAmount: 50_000,
        maxAmount: 200_000,
        tenureMonths: [6, 12, 18, 24],
        interestRate: "3% / month",
        applicationFee: 1_000,
      },
      {
        slug: "business",
        name: "SME Business Loan",
        tagline: "Working capital to scale your business",
        minAmount: 200_000,
        maxAmount: 1_000_000,
        tenureMonths: [12, 18, 24, 36],
        interestRate: "2.5% / month",
        applicationFee: 1_500,
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
