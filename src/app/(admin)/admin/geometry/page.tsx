import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function GeometryHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-[color:var(--muted-foreground)]">Geometry library</div>
        <h1 className="text-3xl font-semibold tracking-tight">Geometry hub</h1>
        <p className="mt-2 max-w-2xl text-[color:var(--muted-foreground)]">
          Contract-shaped admin UI for brands, models, size records, and imports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Brands</CardTitle></CardHeader>
          <CardContent><Button render={<Link href="/admin/geometry/brands" />}>Open brand library</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Imports</CardTitle></CardHeader>
          <CardContent><Button render={<Link href="/admin/geometry/import" />}>Preview CSV import</Button></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Records</CardTitle></CardHeader>
          <CardContent><Button render={<Link href="/admin/geometry/brands/brand_canyon/models/model_endurace" />}>Review active records</Button></CardContent>
        </Card>
      </div>
    </div>
  );
}

