import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { API_VERSION, loadCatalogueSource, desiredCatalogue, parseOptions, syncCatalogue } from './sync-catalog.mjs';

const source = await loadCatalogueSource();
const desired = desiredCatalogue(source);
const options = { mode: 'test', apply: true, webhookUrl: 'https://fixture.convex.site/stripe/webhook' };
function mock() {
  const writes = [];
  const requests = [];
  const creations = new Map();
  const data = { products: [], prices: [], coupons: [], webhookEndpoints: [] };
  const client = {};
  for (const name of Object.keys(data)) {
    client[name] = {
      retrieve: async (id) => {
        const item = data[name].find((value) => value.id === id);
        if (!item) throw Object.assign(new Error('missing'), { code: 'resource_missing', statusCode: 404 });
        return item;
      },
      list: async (params) => ({ has_more: false, data: data[name].filter((p) =>
        !params.lookup_keys || params.lookup_keys.includes(p.lookup_key)) }),
      create: async (value, requestOptions) => {
        requests.push([name, requestOptions]);
        const key = `${name}:${requestOptions?.idempotencyKey}`;
        if (requestOptions?.idempotencyKey && creations.has(key)) return creations.get(key);
        writes.push([name, 'create', value]);
        const item = { id: value.id ?? `${name}_${data[name].length}`, active: true, livemode: false,
          valid: true, status: 'enabled', ...value };
        if (name === 'prices') Object.assign(item, { billing_scheme: 'per_unit',
          type: value.recurring ? 'recurring' : 'one_time',
          recurring: value.recurring ? { usage_type: 'licensed', ...value.recurring } : null });
        data[name].push(item);
        const result = name === 'webhookEndpoints' ? { ...item, secret: 'synthetic-one-time-value' } : item;
        if (requestOptions?.idempotencyKey) creations.set(key, result);
        return result;
      },
      update: async (id, value) => {
        writes.push([name, 'update', value]);
        const item = data[name].find((p) => p.id === id);
        Object.assign(item, value);
        return item;
      },
    };
  }
  return { client, data, writes, requests };
}
const silent = () => {};
test('amounts come from the shared catalogue; inactive old standalone is never created', () => {
  assert.deepEqual(desired.prices.map((p) => p.unit_amount), [2150, 1350, 21300, 20950]);
  assert.equal(desired.coupon.amount_off, source.ANNUAL_UPGRADE_COUPON_CENTS);
  const changed = desiredCatalogue({ ...source, PRODUCTS: { ...source.PRODUCTS,
    annual: { ...source.PRODUCTS.annual, priceCents: 2200 } } });
  assert.equal(changed.prices[0].unit_amount, 2200);
  assert.ok(!desired.prices.some((p) => p.lookup_key === 'personal_fit_standalone_19900'));
});
test('dry-run is the default; a full empty-account plan writes nothing', async () => {
  assert.equal(parseOptions(['--mode', 'test'], { STRIPE_SECRET_KEY: 'sk_test_mock' }).apply, false);
  const m = mock();
  const result = await syncCatalogue(m.client, desired, { ...options, apply: false }, silent);
  assert.equal(result.changes.length, 9);
  assert.equal(m.writes.length, 0);
});
test('apply then repeat is idempotent; secret emitted only on creation; exact events/version', async () => {
  const m = mock(); const out = [];
  const first = await syncCatalogue(m.client, desired, options, (v) => out.push(v));
  assert.equal(Object.keys(first.env).length, 5);
  assert.equal(m.writes.length, 9);
  assert.deepEqual(m.data.webhookEndpoints[0].enabled_events, [...source.STRIPE_WEBHOOK_EVENTS].sort());
  assert.equal(m.data.webhookEndpoints[0].api_version, API_VERSION);
  assert.equal(out.filter((s) => s.includes('STRIPE_WEBHOOK_SECRET=')).length, 1);
  out.length = 0; m.writes.length = 0;
  await syncCatalogue(m.client, desired, options, (v) => out.push(v));
  assert.equal(m.writes.length, 0);
  assert.ok(out.includes('no changes'));
  assert.ok(!out.join('\n').includes('STRIPE_WEBHOOK_SECRET='));
});
for (const [field, value] of Object.entries({ unit_amount: 1, currency: 'usd', product: 'wrong',
  tax_behavior: 'exclusive', active: false, billing_scheme: 'tiered', transform_quantity: {},
  custom_unit_amount: {}, type: 'one_time', livemode: true, recurring: { interval: 'month' } })) {
  test(`price mismatch ${field} stops before ANY writes`, async () => {
    const m = mock(); await syncCatalogue(m.client, desired, options, silent);
    m.data.products[0].name = 'needs update';
    m.data.prices[0][field] = value; m.writes.length = 0;
    await assert.rejects(syncCatalogue(m.client, desired, options, silent), /Catalogue mismatch/);
    assert.equal(m.writes.length, 0);
  });
}
test('new products use NL defaults without external files; existing descriptions and names stay untouched', async () => {
  const m = mock();
  await syncCatalogue(m.client, desiredCatalogue(source), options, silent);
  assert.equal(m.data.products[0].description, 'Al je fietsen afstellen en hun afstelwaarden bewaren.');
  assert.equal(m.data.products[1].description, 'Het volledige stappenplan voor één fiets, in de juiste volgorde.');
  assert.equal(m.data.products[2].description,
    'Persoonlijke bikefit-afspraak bij een fitter, met je profiel en metingen als basis.');
  for (const product of m.data.products) {
    product.name = 'Existing sandbox name';
    product.description = 'Existing sandbox description';
  }
  m.writes.length = 0;
  for (const apply of [false, true]) {
    const out = [];
    const result = await syncCatalogue(m.client, desired, { ...options, apply }, (line) => out.push(line));
    assert.equal(result.changes.length, 0);
    assert.equal(result.info.length, 6);
    assert.ok(out.includes('no changes'));
    assert.ok(result.info.some((line) => line.includes('description') && line.includes('preserved')));
    assert.equal(m.writes.length, 0);
    assert.ok(m.data.products.every((p) => p.name === 'Existing sandbox name' &&
      p.description === 'Existing sandbox description'));
  }
  // Even when another field needs updating, these two fields must never be sent to Stripe.
  m.data.products[0].url = 'https://old.example/pricing';
  await syncCatalogue(m.client, desired, options, silent);
  assert.equal(m.writes.length, 1);
  assert.deepEqual(m.writes[0][2], { url: 'https://bikefitboost.com/pricing' });
});
test('webhook event update uses exact list, no secret; wrong API version stops', async () => {
  const m = mock(); await syncCatalogue(m.client, desired, options, silent); m.writes.length = 0;
  m.data.webhookEndpoints[0].enabled_events = ['*'];
  const out = [];
  await syncCatalogue(m.client, desired, options, (s) => out.push(s));
  assert.deepEqual(m.data.webhookEndpoints[0].enabled_events, desired.events);
  assert.ok(!out.join('\n').includes('STRIPE_WEBHOOK_SECRET='));
  m.data.webhookEndpoints[0].api_version = 'old'; m.writes.length = 0;
  await assert.rejects(syncCatalogue(m.client, desired, options, silent), /API version/);
  assert.equal(m.writes.length, 0);
});
test('key mode, malformed flags, credential arguments and unsafe webhook URLs reject', () => {
  for (const mode of ['test', 'live']) for (const prefix of ['sk', 'rk']) {
    assert.equal(parseOptions(['--mode', mode], { STRIPE_SECRET_KEY: `${prefix}_${mode}_mock` }).mode, mode);
    assert.throws(() => parseOptions(['--mode', mode], {
      STRIPE_SECRET_KEY: `${prefix}_${mode === 'test' ? 'live' : 'test'}_mock` }));
  }
  for (const args of [[], ['--mode', 'test', '--key', 'hidden'], ['--mode', 'test', '--apply', '--dry-run'],
    ['--mode', 'test', '--descriptions-file', 'relative.json'], ['--mode', 'test', '--mode', 'live']]) {
    assert.throws(() => parseOptions(args, { STRIPE_SECRET_KEY: 'sk_test_mock' }));
  }
  for (const url of ['http://fixture.convex.site/stripe/webhook', 'https://convex.site.evil.test/stripe/webhook',
    'https://fixture.convex.site/stripe/webhook?secret=value', 'https://user@fixture.convex.site/stripe/webhook']) {
    assert.throws(() => parseOptions(['--mode', 'test', '--webhook-url', url], { STRIPE_SECRET_KEY: 'sk_test_mock' }));
  }
});
test('shared event list equals actual eventType dispatch branches in Convex', async () => {
  const text = await readFile(new URL('../../convex/stripe/events.ts', import.meta.url), 'utf8');
  const ast = ts.createSourceFile('events.ts', text, ts.ScriptTarget.Latest, true);
  const handled = new Set();
  function visit(node) {
    if (ts.isBinaryExpression(node) && node.left.getText(ast) === 'eventType' &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken && ts.isStringLiteral(node.right)) {
      handled.add(node.right.text);
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'includes' && ts.isArrayLiteralExpression(node.expression.expression) &&
      node.arguments[0]?.getText(ast) === 'eventType') {
      for (const item of node.expression.expression.elements) if (ts.isStringLiteral(item)) handled.add(item.text);
    }
    // Traverse compound conditions too (e.g. refund.created OR refund.updated).
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.equal(handled.size, 14);
  assert.deepEqual([...handled].sort(), [...source.STRIPE_WEBHOOK_EVENTS].sort());
});
for (const [field, value] of Object.entries({ amount_off: 100, currency: 'usd', duration: 'forever',
  percent_off: 5, redeem_by: 100, max_redemptions: 1, applies_to: { products: ['wrong'] }, valid: false })) {
  test(`coupon mismatch ${field} aborts the entire plan before writes`, async () => {
    const m = mock(); await syncCatalogue(m.client, desired, options, silent);
    m.data.products.length = 0; m.data.coupons[0][field] = value; m.writes.length = 0;
    await assert.rejects(syncCatalogue(m.client, desired, options, silent), /upgrade coupon/);
    assert.equal(m.writes.length, 0);
  });
}
test('provider permission errors are not mistaken for missing products', async () => {
  const m = mock();
  m.client.products.retrieve = async () => { throw Object.assign(new Error('denied'), { statusCode: 403 }); };
  await assert.rejects(syncCatalogue(m.client, desired, options, silent), /denied/);
  assert.equal(m.writes.length, 0);
});
test('re-running a partially completed apply creates only remaining resources', async () => {
  const m = mock(); const original = m.client.prices.create;
  let failed = false;
  m.client.prices.create = async (value) => {
    if (!failed) { failed = true; throw new Error('synthetic transient failure'); }
    return original(value);
  };
  await assert.rejects(syncCatalogue(m.client, desired, options, silent), /synthetic transient/);
  assert.equal(m.data.products.length, 3);
  await syncCatalogue(m.client, desired, options, silent);
  assert.equal(m.data.products.length, 3);
  assert.equal(m.data.prices.length, 4);
});
test('concurrent catalogue runs share creation keys and converge without duplicate endpoints or prices', async () => {
  const m = mock();
  await Promise.all([
    syncCatalogue(m.client, desired, options, silent),
    syncCatalogue(m.client, desired, options, silent),
  ]);
  assert.equal(m.data.webhookEndpoints.length, 1);
  assert.equal(m.data.prices.length, 4);
  assert.equal(m.data.products.length, 3);
  assert.equal(m.data.coupons.length, 1);
  const endpointKeys = m.requests.filter(([name]) => name === 'webhookEndpoints').map(([, v]) => v.idempotencyKey);
  assert.equal(endpointKeys.length, 2);
  assert.equal(new Set(endpointKeys).size, 1);
  assert.match(endpointKeys[0], /^bfb-catalog-v1-test-webhook-[a-f0-9]{64}$/);
});
test('lost creation response retry preserves endpoint and warns that its secret requires owner recovery', async () => {
  const m = mock();
  const create = m.client.webhookEndpoints.create;
  m.client.webhookEndpoints.create = async (...args) => {
    await create(...args);
    throw new Error('synthetic response lost after remote commit');
  };
  await assert.rejects(syncCatalogue(m.client, desired, options, silent), /response lost/);
  m.writes.length = 0;
  const out = [];
  await syncCatalogue(m.client, desired, options, (line) => out.push(line));
  assert.equal(m.data.webhookEndpoints.length, 1);
  assert.equal(m.writes.length, 0);
  assert.ok(out.some((line) => line.includes('not retrievable here') && line.includes('update Convex before enabling')));
  assert.ok(!out.join('\n').includes('synthetic-one-time-value'));
  assert.ok(!out.join('\n').includes('STRIPE_WEBHOOK_SECRET='));
});
test('creation keys are deterministic across event order and change for different mode, URL or API payload', async () => {
  async function keyFor(state, settings) {
    const m = mock();
    await syncCatalogue(m.client, state, settings, silent);
    return m.requests.find(([name]) => name === 'webhookEndpoints')[1].idempotencyKey;
  }
  const key = await keyFor(desired, options);
  assert.equal(key, await keyFor({ ...desired, events: [...desired.events].reverse() }, options));
  assert.notEqual(key, await keyFor(desired, { ...options, mode: 'live' }));
  assert.notEqual(key, await keyFor(desired, { ...options, webhookUrl: 'https://other.convex.site/stripe/webhook' }));
  assert.notEqual(key, await keyFor({ ...desired, events: desired.events.slice(1) }, options));
});
