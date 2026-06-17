import { Link, useNavigate } from "@tanstack/react-router";
import { useCountry } from "@/lib/country-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES, type CountryCode } from "@/lib/loans";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, LayoutDashboard, ShieldAlert, Globe2, RotateCcw } from "lucide-react";

export function Header() {
  const { country, config, setCountry, detected, detecting, isOverridden, resetToDetected } = useCountry();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-hero text-primary-foreground font-bold">L</div>
          <span className="text-lg font-semibold tracking-tight">LendAfrica</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">Home</Link>
          <Link to="/loans" className="text-sm text-muted-foreground hover:text-foreground transition">Loans</Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition">About</Link>
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 relative">
                <span className="text-base leading-none">{config.flag}</span>
                <span className="hidden sm:inline">{config.name}</span>
                {detected.isProxy && (
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500" aria-label="Proxy detected" />
                )}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <Globe2 className="h-3.5 w-3.5" />
                {detecting
                  ? "Detecting location…"
                  : detected.country
                    ? <>Detected: <span className="font-medium text-foreground">{detected.countryName || COUNTRIES[detected.country].name}</span>{detected.city ? ` · ${detected.city}` : ""}</>
                    : "Location unavailable"}
              </DropdownMenuLabel>
              {detected.isProxy && (
                <DropdownMenuLabel className="flex items-start gap-2 text-xs font-normal text-amber-600 dark:text-amber-400 pt-0">
                  <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Proxy / VPN detected{detected.org ? ` (${detected.org})` : ""}</span>
                </DropdownMenuLabel>
              )}
              <DropdownMenuSeparator />
              {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => (
                <DropdownMenuItem key={c} onClick={() => setCountry(c)}>
                  <span className="mr-2">{COUNTRIES[c].flag}</span>
                  {COUNTRIES[c].name}
                  {country === c && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
                </DropdownMenuItem>
              ))}
              {isOverridden && detected.country && detected.country !== country && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetToDetected}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to detected ({COUNTRIES[detected.country].name})
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1.5">
                  {user.email?.split("@")[0]}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate({ to: "/auth" })}>Sign in</Button>
          )}
        </div>
      </div>
    </header>
  );
}
