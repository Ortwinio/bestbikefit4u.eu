import { createRoot } from "react-dom/client";
import { DeleteBikeAction } from "@/components/bikes/DeleteBikeAction";
import { ToastProvider } from "@/components/ui/Toast";

const locale = window.location.pathname.startsWith("/nl/") ? "nl" : "en";
document.documentElement.lang = locale;
document.documentElement.classList.toggle("dark", new URLSearchParams(window.location.search).get("theme") === "dark");
createRoot(document.getElementById("root")).render(
  <ToastProvider>
    <main className="mx-auto max-w-3xl p-6 text-foreground">
      <h1 className="mb-6 text-3xl font-semibold">{locale === "nl" ? "Mijn fietsen" : "My bikes"}</h1>
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Trek Domane SL 6</h2>
        <DeleteBikeAction bikeId="visual-bike" bikeName="Trek Domane SL 6" />
      </section>
    </main>
  </ToastProvider>,
);
