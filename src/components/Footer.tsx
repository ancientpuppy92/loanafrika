export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/40 py-10 mt-20">
      <div className="mx-auto max-w-6xl px-4 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-hero text-primary-foreground font-bold">L</div>
            <span className="font-semibold">LendAfrica</span>
          </div>
          <p className="text-muted-foreground">
            Fast, transparent loans for Nigeria and Kenya. Apply in minutes, get a decision the same day.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Products</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Quick Cash Loan</li>
            <li>Personal Loan</li>
            <li>SME Business Loan</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>support@lendafrica.example</li>
            <li>Lagos · Nairobi</li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} LendAfrica. Loans subject to approval. Terms apply.
      </p>
    </footer>
  );
}
