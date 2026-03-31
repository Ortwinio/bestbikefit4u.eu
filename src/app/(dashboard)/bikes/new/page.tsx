import Link from "next/link";
import { CopyPlus, PencilLine, Store } from "lucide-react";
import { Button, Card, CardContent, CardDescription } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getRequestLocale } from "@/i18n/request";

export default async function NewBikePage() {
  const locale = await getRequestLocale();
  const messages = getDashboardMessages(locale);
  const t = messages.bikeForm.createChooser;

  const options = [
    {
      icon: PencilLine,
      title: t.manual.title,
      description: t.manual.description,
      href: "/bikes/new/manual",
      cta: t.manual.cta,
    },
    {
      icon: Store,
      title: t.marktplaats.title,
      description: t.marktplaats.description,
      href: "/bikes/import/marktplaats",
      cta: t.marktplaats.cta,
    },
    {
      icon: CopyPlus,
      title: t.passport.title,
      description: t.passport.description,
      href: "/bikes/import/passport",
      cta: t.passport.cta,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.href} variant="bordered" className="dashboard-card-surface h-full">
              <CardContent className="flex h-full flex-col pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--secondary)] text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-foreground">{option.title}</h2>
                <CardDescription className="mt-2 flex-1">{option.description}</CardDescription>
                <Button className="mt-6" render={<Link href={withLocalePrefix(option.href, locale)} />}>
                  {option.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
