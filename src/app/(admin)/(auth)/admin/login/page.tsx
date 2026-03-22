import { redirect } from "next/navigation";
import { CircuitBoard, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { AdminLoginForm } from "@/components/admin/auth/AdminLoginForm";
import { getCurrentAdminSession } from "@/components/admin/auth/admin-session";

export default async function AdminLoginPage() {
  const session = await getCurrentAdminSession();
  if (session) {
    redirect("/admin/overview");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--primary)_14%,transparent)_0%,transparent_34%),linear-gradient(180deg,color-mix(in_oklch,var(--background)_92%,var(--primary)_8%)_0%,var(--background)_45%,var(--background)_100%)] px-4 py-10 text-[color:var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.9fr)]">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-[color:color-mix(in_oklch,var(--primary)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--secondary))] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--foreground)]">
            <CircuitBoard className="size-4" />
            Admin shell
          </div>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              BestBikeFit4U operations
            </h1>
            <p className="max-w-xl text-base leading-7 text-[color:var(--muted-foreground)]">
              Sign in with an admin account to access the protected command surface. The rider dashboard and the admin panel remain separate, and the server verifies the admin role before the shell loads.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
              <CardHeader className="space-y-2">
                <CardTitle className="text-base">Server-side gate</CardTitle>
                <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                  `/admin/overview` and the admin shell only render after the session is checked on the server.
                </p>
              </CardHeader>
            </Card>
            <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
              <CardHeader className="space-y-2">
                <CardTitle className="text-base">Role-based access</CardTitle>
                <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                  Only users with a valid `adminRole` can stay signed in to the admin surface.
                </p>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section>
          <Card className="border-[color:var(--border)] bg-[color:var(--card)] shadow-2xl shadow-black/10">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[color:var(--primary)] text-[color:var(--primary-foreground)]">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                    Admin login
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight">Magic-code access</h2>
                </div>
              </div>
              <AdminLoginForm />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
