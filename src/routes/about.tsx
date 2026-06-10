import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LendAfrica" },
      { name: "description", content: "Why LendAfrica — our mission to make credit fast, fair, and transparent in Nigeria and Kenya." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-16 w-full">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">About LendAfrica</h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          LendAfrica is on a mission to make credit fast, fair, and transparent across Africa.
          Today we serve customers in Nigeria and Kenya with quick-cash, personal, and SME loans —
          all online, all in minutes.
        </p>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          We charge a small, upfront application fee that covers verification and credit assessment.
          There are no hidden charges. If your loan isn't approved, we'll tell you why.
        </p>
        <div className="mt-8 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Need help?</h2>
          <p className="text-sm text-muted-foreground mt-1">Email support@lendafrica.example or <Link to="/loans" className="text-primary underline">explore our loans</Link>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
