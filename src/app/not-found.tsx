import Link from "next/link";
import { Button } from "@/components/ui";
import { Home, ArrowLeft } from "lucide-react";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";

const notFoundCopy = {
  en: {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    goHome: "Go Home",
    backToDashboard: "Back to Dashboard",
  },
  nl: {
    title: "Pagina niet gevonden",
    description:
      "De pagina die je zoekt bestaat niet of is verplaatst.",
    goHome: "Ga naar home",
    backToDashboard: "Terug naar dashboard",
  },
};

export default async function NotFound() {
  const locale = await getRequestLocale();
  const copy = notFoundCopy[locale];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-4 text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-600 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {copy.title}
          </h1>
          <p className="text-gray-600">
            {copy.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={withLocalePrefix("/", locale)}>
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              {copy.goHome}
            </Button>
          </Link>
          <Link href={withLocalePrefix("/dashboard", locale)}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {copy.backToDashboard}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
