import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COUNTRIES, type CountryCode } from "./loans";

interface DetectedInfo {
  country: CountryCode | null;
  countryName?: string;
  city?: string;
  ip?: string;
  org?: string;
  isProxy?: boolean;
}

interface CountryContextValue {
  country: CountryCode;
  config: typeof COUNTRIES[CountryCode];
  setCountry: (c: CountryCode) => void;
  resetToDetected: () => void;
  detected: DetectedInfo;
  detecting: boolean;
  isOverridden: boolean;
}

const CountryContext = createContext<CountryContextValue | null>(null);
const STORAGE_KEY = "lendafrica.country";

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>("NG");
  const [detected, setDetected] = useState<DetectedInfo>({ country: null });
  const [detecting, setDetecting] = useState(true);
  const [isOverridden, setIsOverridden] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "NG" || saved === "KE") {
      setCountryState(saved);
      setIsOverridden(true);
    }
    // Proxy / geo detection via free IP API
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const code = (data?.country_code || "").toUpperCase();
        const detectedCountry: CountryCode | null =
          code === "KE" ? "KE" : code === "NG" ? "NG" : null;
        const org: string = data?.org || "";
        const isProxy = /vpn|proxy|hosting|datacenter|cloud|amazon|google|digital ?ocean|ovh|linode|cloudflare/i.test(org);
        setDetected({
          country: detectedCountry,
          countryName: data?.country_name,
          city: data?.city,
          ip: data?.ip,
          org,
          isProxy,
        });
        if (!saved && detectedCountry) setCountryState(detectedCountry);
      })
      .catch(() => {})
      .finally(() => setDetecting(false));
  }, []);

  const setCountry = (c: CountryCode) => {
    setCountryState(c);
    setIsOverridden(detected.country ? c !== detected.country : true);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, c);
  };

  const resetToDetected = () => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    if (detected.country) {
      setCountryState(detected.country);
      setIsOverridden(false);
    }
  };

  return (
    <CountryContext.Provider
      value={{ country, config: COUNTRIES[country], setCountry, resetToDetected, detected, detecting, isOverridden }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be inside CountryProvider");
  return ctx;
}
