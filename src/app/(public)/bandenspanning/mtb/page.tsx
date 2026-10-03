import { notFound } from "next/navigation";

// The proxy returns a direct 301 to the localized mountain-bike page before rendering.
export default function RetiredMtbAlias() { notFound(); }
