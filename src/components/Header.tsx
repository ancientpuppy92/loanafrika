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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, LayoutDashboard } from "lucide-react";

export function Header() {
  const { country, config, setCountry } = useCountry();
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
              <Button variant="outline" size="sm" className="gap-1.5">
                <span className="text-base leading-none">{config.flag}</span>
                <span className="hidden sm:inline">{config.name}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(COUNTRIES) as CountryCode[]).map((c) => (
                <DropdownMenuItem key={c} onClick={() => setCountry(c)}>
                  <span className="mr-2">{COUNTRIES[c].flag}</span>
                  {COUNTRIES[c].name}
                  {country === c && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
                </DropdownMenuItem>
              ))}
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
