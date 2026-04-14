import { headers } from "next/headers";
import { NONCE_HEADER_NAME } from "@/lib/csp";

interface JsonLdProps {
  schema: object | object[];
}

export async function JsonLd({ schema }: JsonLdProps) {
  const nonce = (await headers()).get(NONCE_HEADER_NAME) ?? undefined;

  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
