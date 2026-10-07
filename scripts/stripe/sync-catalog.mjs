import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { tsImport } from 'tsx/esm/api';

const unwrap = (module) => module.default ?? module;
const { assertStripeKeyMode } = unwrap(await tsImport('../../shared/billing/stripeMode.ts', import.meta.url));
class CatalogueError extends Error {}

export const API_VERSION = '2026-06-24.dahlia';
// New-product defaults derived from src/i18n/marketing/pricing.ts (NL products copy).
// Existing Stripe names/descriptions are intentionally preserved per the lead decision.
export const PRODUCT_DESCRIPTIONS = {
  bfb_annual: 'Al je fietsen afstellen en hun afstelwaarden bewaren.',
  bfb_single_fit: 'Het volledige stappenplan voor één fiets, in de juiste volgorde.',
  bfb_personal_fit_addon: 'Persoonlijke bikefit-afspraak bij een fitter, met je profiel en metingen als basis.',
};

export async function loadCatalogueSource() {
  const pricing = await tsImport('../../shared/pricing/products.ts', import.meta.url);
  const events = await tsImport('../../shared/billing/stripeWebhookEvents.ts', import.meta.url);
  return { ...unwrap(pricing), ...unwrap(events) };
}

export function desiredCatalogue(source) {
  const { PRODUCTS, PERSONAL_FIT_ADDON_CENTS, ANNUAL_UPGRADE_COUPON_CENTS, STRIPE_WEBHOOK_EVENTS } = source;
  const product = (id, name, key, extra = {}) => ({
    id, name, metadata: { product_key: key }, description: PRODUCT_DESCRIPTIONS[id],
    url: 'https://bikefitboost.com/pricing', active: true, ...extra,
  });
  const price = (lookup_key, product, amount, env, recurring = null) => ({
    lookup_key, product, unit_amount: amount, currency: 'eur', tax_behavior: 'inclusive', recurring, env,
  });
  return {
    products: [
      product('bfb_annual', 'Jaarabonnement', 'annual', { statement_descriptor: 'BIKEFITBOOST JAAR' }),
      product('bfb_single_fit', 'Losse meting', 'single_fit'),
      product('bfb_personal_fit_addon', 'Persoonlijke bikefit-afspraak', 'personal_fit_addon'),
    ],
    prices: [
      price('annual_yearly_2150', 'bfb_annual', PRODUCTS.annual.priceCents,
        'STRIPE_ANNUAL_PRICE_ID', { interval: 'year', interval_count: 1 }),
      price('single_fit_1350', 'bfb_single_fit', PRODUCTS.single.priceCents, 'STRIPE_SINGLE_FIT_PRICE_ID'),
      price('personal_fit_addon_21300', 'bfb_personal_fit_addon', PERSONAL_FIT_ADDON_CENTS,
        'STRIPE_PERSONAL_FIT_ADDON_PRICE_ID'),
      price('personal_fit_standalone_20950', 'bfb_personal_fit_addon', PRODUCTS.personal_fit_standalone.priceCents,
        'STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID'),
    ],
    coupon: { id: 'UPGRADE_SINGLE_FIT_1200', amount_off: ANNUAL_UPGRADE_COUPON_CENTS,
      currency: 'eur', duration: 'once', metadata: { purpose: 'upgrade_single_fit_to_annual' } },
    events: [...STRIPE_WEBHOOK_EVENTS],
  };
}

export function parseOptions(argv, env) {
  const options = { apply: false };
  let action;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--mode' || arg === '--webhook-url') {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new CatalogueError('Missing option value');
      const field = arg === '--mode' ? 'mode' : 'webhookUrl';
      if (options[field]) throw new CatalogueError('Duplicate option');
      options[field] = argv[++i];
    } else if (arg === '--dry-run' || arg === '--apply') {
      if (action) throw new CatalogueError('Choose one action');
      action = arg;
      options.apply = arg === '--apply';
    } else throw new CatalogueError('Unknown option; keys may only be supplied through STRIPE_SECRET_KEY');
  }
  try { assertStripeKeyMode(options.mode, env.STRIPE_SECRET_KEY); }
  catch { throw new CatalogueError('Invalid --mode or STRIPE_SECRET_KEY mode/prefix'); }
  if (options.webhookUrl) {
    const url = new URL(options.webhookUrl);
    if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.convex\.site$/.test(url.hostname) ||
      url.pathname !== '/stripe/webhook' || url.username || url.password || url.port || url.search || url.hash) {
      throw new CatalogueError('Webhook URL must be an HTTPS Convex /stripe/webhook endpoint');
    }
    options.webhookUrl = url.href;
  }
  return options;
}

async function retrieveOrNull(resource, id) {
  try { return await resource.retrieve(id); }
  catch (error) {
    if (error?.code === 'resource_missing' && error?.statusCode === 404) return null;
    throw error;
  }
}

async function listAll(resource, params = {}) {
  const values = [];
  let starting_after;
  do {
    const page = await resource.list({ ...params, limit: 100, ...(starting_after ? { starting_after } : {}) });
    values.push(...page.data);
    if (!page.has_more) return values;
    const last = page.data.at(-1)?.id;
    if (!last || last === starting_after) throw new CatalogueError('Invalid Stripe pagination');
    starting_after = last;
  } while (true);
}

function assertMatch(ok, label) {
  if (!ok) throw new CatalogueError(`Catalogue mismatch: ${label}; no changes applied`);
}
function idOf(value) { return typeof value === 'string' ? value : value?.id; }
function sameEvents(a, b) { return a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|'); }

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => [key, stableValue(nested)]));
  }
  return value;
}
function creationOptions(mode, kind, fields) {
  const digest = createHash('sha256').update(JSON.stringify(stableValue(fields))).digest('hex');
  return { idempotencyKey: `bfb-catalog-v1-${mode}-${kind}-${digest}` };
}
const EXISTING_WEBHOOK_NOTICE = 'Existing endpoint signing secret is not retrievable here. ' +
  'If the creation response was lost, rotate/recover via the owner Stripe Dashboard and update Convex before enabling.';

/** Read and validate the whole remote catalogue before making the first write. */
export async function syncCatalogue(stripe, desired, options, output = console.log) {
  const changes = [];
  let existingWebhook = false;
  const env = {};
  const info = [];
  const modeMatches = (item) => item.livemode === (options.mode === 'live');
  for (const product of desired.products) {
    const existing = await retrieveOrNull(stripe.products, product.id);
    if (!existing) {
      changes.push({ kind: 'product', action: 'create', desired: product });
    }
    else {
      assertMatch(!existing.deleted && modeMatches(existing), `${product.id} mode/deleted`);
      if (existing.description !== product.description) {
        info.push(`${product.id}: existing description differs from the new-product default; preserved`);
      }
      if (existing.name !== product.name) {
        info.push(`${product.id}: existing name differs from the new-product default; preserved`);
      }
      const updates = {};
      for (const key of ['url', 'active', 'statement_descriptor']) {
        if (product[key] != null && existing[key] !== product[key]) updates[key] = product[key];
      }
      if (existing.metadata?.product_key !== product.metadata.product_key) updates.metadata = product.metadata;
      // VAT decision is pending: keep absent tax codes absent and never erase a configured code silently.
      assertMatch(!existing.tax_code, `${product.id} tax_code needs owner decision`);
      if (Object.keys(updates).length) changes.push({ kind: 'product', action: 'update', id: existing.id, desired: updates });
    }
  }
  for (const price of desired.prices) {
    const matches = await listAll(stripe.prices, { lookup_keys: [price.lookup_key] });
    assertMatch(matches.length <= 1, `${price.lookup_key} duplicate lookup key`);
    const existing = matches[0];
    if (!existing) changes.push({ kind: 'price', action: 'create', desired: price });
    else {
      assertMatch(modeMatches(existing) && existing.active && idOf(existing.product) === price.product &&
        existing.unit_amount === price.unit_amount &&
        (existing.unit_amount_decimal == null || existing.unit_amount_decimal === String(price.unit_amount)) &&
        !existing.currency_options && !existing.tiers_mode && existing.currency === price.currency &&
        existing.tax_behavior === price.tax_behavior && existing.billing_scheme === 'per_unit' &&
        !existing.transform_quantity && !existing.custom_unit_amount &&
        existing.type === (price.recurring ? 'recurring' : 'one_time'), `${price.lookup_key} immutable fields`);
      assertMatch(price.recurring
        ? existing.recurring?.interval === 'year' && existing.recurring.interval_count === 1 &&
          existing.recurring.usage_type === 'licensed' && !existing.recurring.trial_period_days &&
          !existing.recurring.meter
        : existing.recurring == null, `${price.lookup_key} recurrence`);
      env[price.env] = existing.id;
    }
  }
  const coupon = await retrieveOrNull(stripe.coupons, desired.coupon.id);
  if (!coupon) changes.push({ kind: 'coupon', action: 'create', desired: desired.coupon });
  else {
    assertMatch(modeMatches(coupon) && coupon.valid && coupon.amount_off === desired.coupon.amount_off &&
      coupon.currency === desired.coupon.currency && coupon.duration === 'once' && !coupon.percent_off &&
      !coupon.redeem_by && !coupon.max_redemptions && !coupon.applies_to && !coupon.duration_in_months &&
      coupon.metadata?.purpose === desired.coupon.metadata.purpose, 'upgrade coupon');
    env.STRIPE_UPGRADE_COUPON_ID = coupon.id;
  }
  if (options.webhookUrl) {
    const endpoints = (await listAll(stripe.webhookEndpoints)).filter((p) => p.url === options.webhookUrl);
    assertMatch(endpoints.length <= 1, 'duplicate webhook endpoints');
    const existing = endpoints[0];
    if (!existing) changes.push({ kind: 'webhook', action: 'create', desired: {
      url: new URL(options.webhookUrl).href, api_version: API_VERSION, enabled_events: [...desired.events].sort(),
    } });
    else {
      existingWebhook = true;
      // Stripe cannot update an endpoint's API version. Never replace it silently (would rotate its secret).
      assertMatch(modeMatches(existing) && existing.api_version === API_VERSION, 'webhook mode/API version');
      if (existing.status !== 'enabled' || !sameEvents(existing.enabled_events, desired.events)) {
        changes.push({ kind: 'webhook', action: 'update', id: existing.id,
          desired: { enabled_events: desired.events, disabled: false } });
      }
    }
  }
  const diff = changes.map((change) => ({ kind: change.kind, action: change.action,
    id: change.id ?? change.desired.id ?? change.desired.lookup_key ?? 'webhook', fields: change.desired }));
  output(JSON.stringify({ mode: options.mode, dryRun: !options.apply, changes: diff,
    info }, null, 2));
  if (!changes.length) output('no changes');
  if (existingWebhook) output(EXISTING_WEBHOOK_NOTICE);
  if (!options.apply) return { changes: diff, env, info };
  for (const change of changes) {
    const { kind, action, id, desired: value } = change;
    if (kind === 'product') {
      await stripe.products[action](...(action === 'update' ? [id, value]
        : [value, creationOptions(options.mode, kind, value)]));
    } else if (kind === 'price') {
      const { env: envName, recurring, ...fields } = value;
      const payload = { ...fields, ...(recurring ? { recurring } : {}) };
      const created = await stripe.prices.create(payload, creationOptions(options.mode, kind, payload));
      env[envName] = created.id;
    } else if (kind === 'coupon') {
      const created = await stripe.coupons.create(value, creationOptions(options.mode, kind, value));
      env.STRIPE_UPGRADE_COUPON_ID = created.id;
    } else {
      const endpoint = await stripe.webhookEndpoints[action](...(action === 'update' ? [id, value]
        : [value, creationOptions(options.mode, kind, value)]));
      if (action === 'create' && endpoint.secret) {
        output('WARNING: webhook signing secret shown once on creation. Store securely; do not log or commit.');
        output(`STRIPE_WEBHOOK_SECRET=${endpoint.secret}`);
      }
    }
  }
  output(Object.entries(env).map(([name, value]) => `${name}=${value}`).join('\n'));
  return { changes: diff, env, info };
}

export async function main(argv = process.argv.slice(2), env = process.env) {
  const options = parseOptions(argv, env);
  const source = await loadCatalogueSource();
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: API_VERSION });
  return syncCatalogue(stripe, desiredCatalogue(source), options);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    // SDK errors can contain credentials/request data. Keep the CLI boundary safe.
    console.error(error instanceof CatalogueError ? error.message :
      'Catalogue sync failed. Verify mode, credentials and input; provider details withheld.');
    process.exitCode = 1;
  });
}
