export { default, generateMetadata } from "../../tire-pressure/[slug]/page";

// Road and gravel have dedicated route files; only this path belongs to the dynamic route.
export function generateStaticParams() { return [{ slug: "mountainbike" }]; }
