import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COUNTRIES, type CountryCode } from "./loans";

interface CountryContextValue {
  country: CountryCode;
  config: typeof COUNTRIES[CountryCode];
  setCountry: (c: CountryCode) => void;
  detected: boolean;
}

const CountryContext = createContext<CountryContextValue | null>(null);
const STORAGE_KEY = "lendafrica.country";

export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<CountryCode>("NG");
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "NG" || saved === "KE") {
      setCountryState(saved);
      setDetected(true);
      return;
    }
    // Auto-detect via free IP API
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const code = (data?.country_code || "").toUpperCase();
        if (code === "KE") setCountryState("KE");
        else if (code === "NG") setCountryState("NG");
      })
      .catch(() => {})
      .finally(() => setDetected(true));
  }, []);

  const setCountry = (c: CountryCode) => {
    setCountryState(c);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, c);
  };

  return (
    <CountryContext.Provider value={{ country, config: COUNTRIES[country], setCountry, detected }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be inside CountryProvider");
  return ctx;
}
