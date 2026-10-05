export const products = ["single", "annual", "annual_upgrade", "annual_personal", "personal_fit_standalone"];

export const scenarios = [
  { id: "pricing-page", surface: "pricing" },
  ...["single", "annual", "annual_personal"].map(product => ({ id: `pricing-card-${product}`, surface: "card", product })),
  ...products.flatMap(product => ["choose", "review", "pending", "paid", "failed"].map(state => ({
    id: `checkout-${product}-${state}`, surface: "checkout", product, state,
  }))),
  ...["auth", "code", "payment-error", "billing-off", "standalone-ineligible"].map(state => ({
    id: `checkout-${state}`, surface: "checkout", product: state === "standalone-ineligible" ? "personal_fit_standalone" : "annual", state,
  })),
  ...["loading", "unavailable", "free", "free-open", "single", "expired-upgrade", "annual", "upgrade", "renewed", "personal", "cancelled", "cancel-confirm", "cancel-off", "cancel-confirmed", "cancel-renewed-confirmed", "cancel-error"].map(state => ({
    id: `subscription-${state}`, surface: "subscription", state,
  })),
];
