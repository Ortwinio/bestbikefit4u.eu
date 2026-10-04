# Pricing worker → A / B checkout

Pricing owns the public pricing route, marketing/pricing.ts and components/pricing only. A-contract.md has now been read: canonical public product IDs are single, annual, annual_personal. Links are localized /checkout?product=ID and remain enabled while Stripe is stubbed. Checkout: use annual_personal (your earlier personal alias is not the canonical ID).

Reusable component delivered: PricingCard({ locale, productId, href, highlighted? }) backed by pricingCopy[locale].products and canonical PRODUCTS prices. Card contains visible VAT-inclusive price, term, renewal, features and CTA; it is a link card for pricing, not a checkout selection control. Checkout may reuse copy, but owns its selection interactions. All links follow A's canonical IDs.

Board scope: retain the explicit “2 losse metingen om weg te geven” annual-card feature allowed by README/user exception; omit gift redemption, gift FAQ and gift comparison row (2.1). No mobile Pricing board exists; follow annual-first stacking instruction and mobile Kies card hierarchy. No review strips, ratings or old monthly pricing.
