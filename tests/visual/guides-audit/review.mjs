import { readFile, writeFile } from 'node:fs/promises';

const path = 'plans/redesign-canvas/audit/44a-guides-audit';
const audit = JSON.parse(await readFile(`${path}.json`, 'utf8'));
// Editorial proposals, not traffic/research claims or approved SEO assignments.
const proposals = {
  'stance-width-q-factor-and-pedal-spacer-guide': ['standbreedte pedalen afstellen', 'pedal stance width',
    'Crank, pedaal en schoen van voren; standbreedte en pedaalring afzonderlijk aangeven.'],
  'insoles-arch-support-and-footbeds-guide': ['inlegzolen fietsschoenen', 'cycling shoe insoles',
    'Voetboog boven fietsinlegzool in doorsnede; ondersteuningsvlak en schoenvolume zichtbaar.'],
  'bike-size-and-geometry': ['fietsmaat en geometrie', 'bike size and geometry',
    'Twee frames naast elkaar met stack en reach; gelijke maatnaam maar andere verhoudingen.'],
  'frame-size-guide': ['framemaat fiets bepalen', 'bike frame size',
    'Fietser naast frame; binnenbeenmaat, standover, stack en reach als meetpunten.'],
  'road-vs-endurance-vs-race-geometry': ['racefiets of endurance geometrie', 'race versus endurance geometry',
    'Twee racefietsframes naast elkaar; hogere voorkant en korter bereik bij duurgeometrie.'],
  'how-to-compare-two-bikes-for-fit': ['fietsen vergelijken zithouding', 'compare bikes for fit',
    'Twee fietssilhouetten met gedeelde trapas; zadel- en stuurcontactpunten tegenover elkaar.'],
  'nutrition-and-hydration': ['voeding en drinken wielrennen', 'cycling nutrition and hydration',
    'Bidon en eenvoudige koolhydraatbronnen naast fiets; voeding en vocht afzonderlijk herkenbaar.'],
  'cycling-fueling-basics': ['eten tijdens fietsen', 'cycling fueling basics',
    'Fietser met bidon en voedsel uit achterzak; rustige eet- en drinkmomenten onderweg.'],
  'carbs-per-hour-guide': ['koolhydraten per uur fietsen', 'carbohydrates per hour cycling',
    'Bidon, banaan en gel naast eenvoudige klok; geen doseringscijfers of tekst in beeld.'],
  'hydration-and-sweat-rate-guide': ['zweetverlies meten fietsen', 'cycling sweat rate',
    'Weegschaal voor en na rit, bidon en maatbeker; meetprocedure zonder voorgeschreven dosis.'],
  'sodium-and-electrolytes-guide': ['natrium sportdrank fietsen', 'sodium cycling drink',
    'Bidon met maatbeker en kleine hoeveelheid sportdrankpoeder; concentratieconcept zonder getal.'],
  'power-ftp-pacing': ['vermogen en tempo fietsen', 'cycling power and pacing',
    'Fietser met vermogensmeter en eenvoudige gelijkmatige inspanningscurve zonder labels.'],
  'ftp-explained': ['wat is FTP fietsen', 'what is cycling FTP',
    'Fiets op trainer met vermogensmeter en klok; gemeten inspanning, geen prestatielabel.'],
  'wkg-and-power-zones-guide': ['watt per kilo fietsen', 'cycling watts per kilogram',
    'Weegschaal naast vermogensmeter; twee verschillende meetgrootheden, geen genderindeling.'],
  'power-to-speed-guide': ['vermogen en snelheid fietsen', 'cycling power and speed',
    'Fietser met tegenwindpijlen en bandencontact; lucht- en rolweerstand naast vermogen.'],
  'climb-time-and-event-pacing-guide': ['klimtijd fietsen berekenen', 'cycling climb time',
    'Fietser op klimprofiel; stijging, afstand en klok als afzonderlijke factoren.'],
  'fit-science': ['wetenschap achter bikefitting', 'bike fitting science',
    'Fietser met drie contactpunten en meetlijnen; eenvoudige observatie in plaats van diagnose.'],
  'when-online-bike-fit-has-limits': ['wanneer professionele bikefit', 'online bike fit limitations',
    'Fietser naast fitter die contactpunten bekijkt; online meetgegevens als startpunt.'],
  'bike-fit-for-beginners-and-returning-riders': ['fiets afstellen voor beginners', 'bike fit for beginners',
    'Zijaanzicht beginnende fietser; ontspannen ellebogen, zadelhoogte en bereik met maatpijlen.'],
  'bike-fit-for-foot-pain-hot-foot-and-numb-toes': ['gevoelloze tenen fietsen', 'numb toes cycling',
    'Voet in doorsnede van fietsschoen; voorvoetdruk en ruimte rond tenen, cleat zichtbaar.'],
  'bike-fit-for-hand-numbness-and-wrist-pain': ['gevoelloze handen fietsen', 'numb hands cycling',
    'Hand op remgreep in zijaanzicht; neutrale polshoek naast overstrekte pols, drukpunt gemarkeerd.'],
  'bike-fit-for-neck-and-shoulder-pain': ['nekpijn fietsen', 'neck pain cycling',
    'Bovenlichaam op racefiets; nek, schouders en afstand tot remgrepen met maatpijl.'],
  'bike-fit-for-riders-with-a-shorter-torso': ['fiets afstellen korte romp', 'bike fit short torso',
    'Fietser met korte romp; twee cockpitlengtes en ontspannen ellebooghoek naast elkaar.'],
  'bike-fit-for-riders-with-limited-flexibility': ['fiets afstellen beperkte flexibiliteit', 'bike fit limited flexibility',
    'Fietser met beperkte heupbuiging; hogere cockpit en heuphoek als veilige bewegingsruimte.'],
  'bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores': ['zadelpijn fietsen', 'saddle pain cycling',
    'Zadel in bovenaanzicht met zitbotsteun en ontlast middengebied; geen medische diagnose.'],
  'bike-fit-for-tall-riders': ['fiets afstellen lange fietsers', 'bike fit tall riders',
    'Lange fietser op passend frame; zadelhoogte en stuurafstand met evenwichtige verhoudingen.'],
  'bike-fitting-for-knee-pain': ['kniepijn fietsen', 'knee pain cycling',
    'Knie bij pedaal onderaan en bovenaan; zadelhoogte als maatlijn, pijngebied subtiel gemarkeerd.'],
  'bike-fitting-for-lower-back-pain': ['lage rugpijn fietsen', 'lower back pain cycling',
    'Bekken en lage rug van fietser; stuurdrop en reach zichtbaar met twee maatpijlen.'],
  'cleat-position-basics-guide': ['schoenplaatjes afstellen', 'cleat position',
    'Onderzijde fietsschoen met cleat; voor-achterpositie en rotatie aangegeven met pijlen.'],
  'crank-length-guide': ['cranklengte kiezen', 'crank length',
    'Twee cranklengtes rond dezelfde trapas; pedaalcirkel en maatlijn van as tot pedaalas.'],
  'cycling-shoe-fit-width-and-last-guide': ['fietsschoenen breedte', 'cycling shoe width',
    'Voet en schoenleest in bovenaanzicht; voorvoetbreedte en teenruimte als maatlijnen.'],
  'endurance-bike-fit-guide': ['fiets afstellen lange ritten', 'endurance bike fit',
    'Fietser in ontspannen duurhouding; zadelsteun, lichte handdruk en gematigde stuurdrop.'],
  'foot-measurement-guide-for-cyclists': ['voet opmeten fietsschoenen', 'foot measurement cycling',
    'Voet op vel papier met omtrek, meetlint langs lengte en breedte; bovenaanzicht.'],
  'gravel-bike-fit-guide': ['gravelbike afstellen', 'gravel bike fit',
    'Gravelfiets op ongelijke ondergrond; ontspannen armen en bereik naar remgrepen benadrukt.'],
  'handlebar-drop-guide': ['stuurhoogte racefiets', 'handlebar drop',
    'Zadel en stuur van opzij met horizontale hulplijnen en verticale drop-maatpijl.'],
  'handlebar-width-and-hood-position-guide': ['stuurbreedte racefiets', 'handlebar width',
    'Stuur in bovenaanzicht; breedte en symmetrische remgreephoeken, handen ontspannen.'],
  'indoor-trainer-bike-fit-guide': ['fiets afstellen indoortrainer', 'indoor trainer bike fit',
    'Fiets op trainer met waterpas; zadel- en handcontactpunten, voorwielhoogte zichtbaar.'],
  'mountain-bike-fit-guide': ['mountainbike afstellen', 'mountain bike fit',
    'Mountainbiker in klim- en afdaalhouding; bewegingsruimte boven fiets en stuurcontrole.'],
  'pain-and-discomfort': ['pijn bij fietsen', 'cycling pain',
    'Fietser van opzij met knie, onderrug, hand, zitbot en voet als vijf contact-/klachtgebieden.'],
  'reach-and-stem-guide': ['stuurpenlengte bepalen', 'stem length',
    'Cockpit van opzij; stuurpenlengte en bereik naar remgreep als verschillende maatlijnen.'],
  'ride-types': ['fiets afstellen per fietstype', 'bike fit riding styles',
    'Race-, gravel- en mountainbikehoudingen naast elkaar met verschillende contactpunten.'],
  'rider-profiles': ['fiets afstellen lichaamsbouw', 'bike fit body proportions',
    'Twee fietsers met andere romp-beenverhouding; passend bereik en zadelhoogte naast elkaar.'],
  'road-bike-fit-guide': ['racefiets afstellen', 'road bike fit',
    'Racefiets met fietser; drie contactpunten zadel, remgrepen en pedalen in samenhang.'],
  'saddle-fore-aft-and-tilt-guide': ['zadel terugstand en kanteling', 'saddle setback and tilt',
    'Zadel op rails van opzij; horizontale verplaatsing en kantelhoek met aparte pijlen.'],
  'saddle-height-guide': ['zadelhoogte instellen', 'saddle height',
    'Meetlint van trapas tot bovenkant zadel; fietser toont beenhoek onderaan pedaalslag.'],
  'setup-parameters': ['fiets afstellen maten', 'bike setup measurements',
    'Fiets van opzij met aparte maatlijnen voor zadelhoogte, reach, stuurdrop en crank.'],
  'shoe-foot-cleat-fit': ['fietsschoenen en schoenplaatjes afstellen', 'cycling shoe and cleat fit',
    'Voet, passende schoen en cleat naast elkaar; breedte, steun en pedaalpositie verbonden.'],
  'triathlon-bike-fit-guide': ['triatlonfiets afstellen', 'triathlon bike fit',
    'Triatleet op aerobars; heuphoek, zadelsteun en afstand tot armsteunen duidelijk zichtbaar.'],
};
const normalize = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const words = (text) => text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
const sourceRefs = {
  selection: 'src/lib/guides/content.ts:229',
  libraryBody: 'src/app/(public)/guides/[slug]/page.tsx:285',
  markdownMarker: 'src/components/content/GuideBodyMarkdown.tsx:50',
  metadata: 'src/app/(public)/guides/[slug]/page.tsx:173',
  image: 'src/app/(public)/guides/[slug]/page.tsx:351',
  schema: 'src/lib/seo/jsonLd.ts:125',
};
for (const row of audit.rows) {
  const [nl, en, subject] = proposals[row.slug];
  row.proposedDutchKeyword = nl;
  row.proposedEnglishKeyword = en;
  row.proposedIllustration = subject;
  row.keywordBasis = 'Editorial proposal; no search-volume claim. Exact-match checks are diagnostic, variants need review.';
  row.keyword = row.locale === 'nl' ? nl : en;
  row.declaredKeyword = row.keywordMeta || null;
  const hasKeyword = (text) => normalize(text).includes(normalize(row.keyword));
  row.checks.keywordH1 = hasKeyword(row.h1.join(' '));
  row.checks.keywordOpening = hasKeyword(words(`${row.heroIntro} ${row.quick} ${row.article}`).slice(0, 100).join(' '));
  row.checks.keywordH2 = row.sections.some((section) => hasKeyword(section.title));
  row.checks.keywordTitleFront = normalize(row.title).startsWith(normalize(row.keyword));
  row.checks.imageAltDescriptive = !row.cmsMarkdown && !!row.image?.alt;
  row.checks.imageHouseStyle = !row.cmsMarkdown;
  row.imageVisualReview = row.cmsMarkdown ? 'Local counterpart contact-sheet review: blue digital artwork with orange/blue accents; '
    + 'not the specified mint-paper fineliner/lime/petrol style. Local originals match public byte counts.'
    : 'Code fallback reuses 03-cockpit-afstellen.webp in the house illustration style; generally unrelated to topic.';
  row.imageRelevance = ['bike-fitting-for-knee-pain', 'bike-fitting-for-lower-back-pain',
    'cycling-shoe-fit-width-and-last-guide', 'handlebar-width-and-hood-position-guide',
    'indoor-trainer-bike-fit-guide', 'pain-and-discomfort', 'ride-types', 'shoe-foot-cleat-fit',
    'triathlon-bike-fit-guide', 'mountain-bike-fit-guide'].includes(row.slug)
    ? 'Broad subject recognizable; does not explain the specific measurement or correction.'
    : 'Generic rider/bike; specific measurement or adjustment is not clearly communicated.';
  row.checks.imageRelevance = row.cmsMarkdown
    ? row.imageRelevance.startsWith('Broad subject') ? true : null
    : /nutrition|fuel|carbs|hydration|sodium|power|ftp|wkg|climb|insoles|stance-width/.test(row.slug) ? false : null;
  row.imageAltReview = row.cmsMarkdown
    ? 'Hero alt repeats H1 plus brand/guide; no concrete description of what the image shows.'
    : 'Generic cockpit alt describes the reused image, not the guide topic; replace together with hero.';
  row.sourceRefs = sourceRefs;
  row.checks.parityStructure = row.parity.sectionCounts[0] === row.parity.sectionCounts[1];
  row.sourceEvidence = row.sourceEvidence.split(' Hero intro/closing')[0];
  row.sourceEvidence = row.sourceEvidence.split(' Hero intro/closing copy')[0]
    + ' Hero intro/closing copy may still come from code; this is body provenance, '
    + 'not proof that every field is CMS-authored. No database reads or writes were used.';
  const faq = row.schemas.find((s) => s['@type'] === 'FAQPage')?.mainEntity ?? [];
  row.faqReview = { count: faq.length, words: faq.reduce((sum, q) => sum
    + words(`${q.name} ${q.acceptedAnswer?.text ?? ''}`).length, 0),
  longestAnswerWords: Math.max(0, ...faq.map((q) => words(q.acceptedAnswer?.text ?? '').length)),
  repetition: 'Manual editorial review needed; count/length failure already blocks acceptance.' };
  row.checks.sitemapListed = row.sitemapListed;
  row.checks.descriptionComplete = /[.!?]$/.test(row.description);
  row.checks.anchorLanguage = row.locale !== 'nl' || !row.links.some((link) =>
    /\b(?:Guide|Start Free Fit|Width|Height|For|And|Riders|Saddle|Road|Lower Back)\b/.test(link.text));
  row.checks.linkRationale = !row.links.some((link) => /Open (?:the next relevant page|de volgende relevante pagina)/
    .test(link.text));
  row.manual = {
    symptomRecognition: 'Present across prose; needs compression into the required 120–200-word problem block.',
    causalExplanation: 'Present, but dispersed across many chapters rather than one 200–350-word background block.',
    preciseTips: /\b(?:mm|cm|graden|degrees)\b/.test(row.article)
      ? 'Measurements/units present; verify each adjustment, test interval and rollback advice during rewrite.'
      : 'No mm/cm/degree token found; add applicable concrete measurement and test sequence.',
    inventedNumbers: 'UNVERIFIED: numeric claims inventoried, not declared invented or evidence-based without source audit.',
    naturalTone: 'REVIEW: automated je-vorm/sentence heuristics cannot certify natural Dutch or active voice.',
    medicalSafety: 'REVIEW: warning tokens are only a screening proxy; verify all required red flags explicitly.',
    semanticParity: 'REVIEW: bilingual content needs sentence-level editorial comparison, not automatic equivalence.',
    cta: 'REVIEW: current mid-page CTA is captured; closing CTA outside article was not counted as content.',
  };
  row.topFixes = [
    `Restructure ${row.counts.words} visible words / ${row.sections.length} H2 sections into 900–1500 words and blocks 0–6.`,
    `FAQ ${row.faqReview.count} questions / ${row.faqReview.words} words; use 3–5 questions, 150–300 words total.`,
    `SEO title ${row.counts.title} / description ${row.counts.description} characters; target ≤60 / 140–155.`,
  ];
  if (!row.checks.guideCalculatorLinks || !row.checks.inbound) row.topFixes.push(
    `Link graph: ${row.counts.guideLinks} distinct guide targets, ${row.counts.calculatorLinks} calculator links, `
    + `${row.inbound.length} inbound guide pages.`);
  if (row.locale === 'nl') row.topFixes.push('Translate English guide anchors and “Start Free Fit”; review raw language candidates.');
  row.topFixes.push('Add visible updated date + Article.dateModified; replace PNG/alt with proposed subject in house style.');
}
audit.methodology = {
  scope: 'All 96 guide detail URLs from public sitemap and code backlog, 48 per locale. The 36 omitted from sitemap '
    + 'return real guide articles, not soft-404. /guides index is not a detail guide.',
  fetched: 'Production public HTML and original hero assets. No Convex/database calls or writes.',
  wordCount: 'Initial article text plus hero/quick answer; excludes global navigation/footer; hidden FAQ answers are separately '
    + 'counted from FAQPage. This is a visible-text count, not exact editable manuscript length.',
  sections: 'H2 sections scored with documented heading regex proxies. Actual sequence differs from fixed writing-guide '
    + 'structure on all pages. Semantic matching and heading variants require editorial review.',
  language: 'Raw detector candidates retained; terms such as cockpit/endurance/smaller may be legitimate. '
    + 'Confirmed English anchors and CTA independently fail NL language. No blanket claim all candidates are errors.',
  links: 'Inbound counts within these 48 guides per locale only; excludes site header/footer, index and external pages.',
  keyword: 'Proposed primary keyword, not H1-as-keyword. Exact text diagnostics do not reject sensible variants automatically.',
  provenance: 'CMS libraryBody positive evidence from its exclusive Markdown render wrapper in page code; '
    + 'other fields are a CMS/code hybrid. Production code revision is not guaranteed identical to local HEAD.',
  image: 'Original asset size/format/dimensions, not optimized Next image response. Visual review of local counterpart '
    + 'contact sheet; byte-count correspondence verified, not cryptographic identity.',
  unknown: 'Claims, naturalness, active voice, full medical safety and full semantic translation parity need editorial '
    + 'review. Unverified checks are not marked pass.',
};
const allChecks = Object.keys(audit.rows[0].checks);
audit.summary = Object.fromEntries(allChecks.map((key) => [key, {
  pass: audit.rows.filter((row) => row.checks[key]).length,
  fail: audit.rows.filter((row) => row.checks[key] === false).length,
  review: audit.rows.filter((row) => row.checks[key] === null).length,
}]));
await writeFile(`${path}.json`, `${JSON.stringify(audit, null, 2)}\n`);
const md = [
  '# 44a — Production guides audit', '',
  `Read-only scan: ${audit.scannedAt}. **96/96 URLs fetched: 48 NL + 48 EN; 0 fetch failures.**`,
  'All 96 fail the complete writing-guide contract. No content, app code or database was changed.', '',
  '## Scope and evidence', '',
  ...Object.entries(audit.methodology).map(([key, value]) => `- **${key}:** ${value}`), '',
  'The inventory includes 48 slugs: 30 sitemap entries and 18 additional real guides per locale. See JSON sitemapListed.',
  '60 bodies have positive CMS-libraryBody evidence. The other 36 have no public source marker: CMS body versus code '
    + 'fallback remains unresolved. Rewriting only fallback TypeScript will not replace the 60 CMS bodies.',
  'Prepare CMS import files in 44b; production publishing still needs the separate authorization in the brief.', '',
  'The localCodeReferenceCommit in JSON identifies local code inspected, not a verified deployed release SHA.', '',
  'Code: `src/lib/guides/content.ts:229` selects CMS first; `src/app/(public)/guides/[slug]/page.tsx:285`',
  'selects libraryBody; `src/components/content/GuideBodyMarkdown.tsx:50` emits the exclusive render wrapper.',
  'Hero intro/CTA may come from code; quick answer and FAQ may be extracted from CMS. Do not treat the page as one source.', '',
  '## Check totals', '',
  '| Check | Pass | Fail | Review |', '|---|---:|---:|---:|',
  ...Object.entries(audit.summary).map(([key, value]) => `| ${key} | ${value.pass} | ${value.fail} | ${value.review} |`), '',
  'Schema means presence only; tipsNumbered means an ordered list exists, not that the whole procedure is safe. QuickLength '
    + 'only measures the card word band, not the required 2–3-sentence answer. These are measured/heuristic checks. Claims, active voice, full safety and semantic parity remain **REVIEW**, not pass.',
  'Keyword totals use editorial proposals below; there is no approved keyword registry or traffic evidence.', '',
  '## Every guide, both locales', '',
  'P = measured pass; F = measured fail; R = unverified semantic judgement. Each cell lists checks in header order.',
  'Structure/words: ordered required blocks / total visible words / quick answer length. Tips: numbered / warning proxy.',
  'SEO: title / description / one H1 / keyword H1-opening-H2. Links: 3–5 guides + calculator / inbound / rationale.',
  'Tone: language screen / je-vorm / sentence length / paragraphs / hype. Data: schemas / dates / canonical / hreflang.',
  'Image: spec / descriptive alt / style / relevance / OG. Claims and bilingual equivalence = R for every row.', '',
  '| Locale / guide | Source | Words | Structure/words | Tips | FAQ | Links | SEO | Tone | Data | Image |',
  '|---|---|---:|---|---|---|---|---|---|---|---|',
];
const status = (row, keys) => keys.map((key) => row.checks[key] === null ? 'R' : row.checks[key] ? 'P' : 'F').join('/');
for (const row of audit.rows) md.push(`| [${row.locale}/${row.slug}](${row.url}) | ${row.cmsMarkdown ? "CMS body" : "unresolved"} | ${row.counts.words} | `
  + `${status(row, ['structure', 'totalWords', 'quickLength'])} | `
  + `${status(row, ['tipsNumbered', 'warningSigns'])} | ${status(row, ['faqCountLength'])} | `
  + `${status(row, ['guideCalculatorLinks', 'inbound', 'linkRationale'])} | `
  + `${status(row, ['title', 'description', 'oneH1', 'keywordH1', 'keywordOpening', 'keywordH2'])} | `
  + `${status(row, ['language', 'personalTone', 'sentenceLength', 'paragraphLength', 'noHype'])} | `
  + `${status(row, ['schema', 'dateModified', 'canonical', 'hreflang'])} | `
  + `${status(row, ['imageSpec', 'imageAltDescriptive', 'imageHouseStyle', 'imageRelevance', 'imageOg'])} |`);
md.push('', '## Proposed Dutch keywords, illustration briefs and priority fixes', '',
  'These are editorial proposals, with no search-volume or ranking claims. Each applies to its NL/EN pair.',
  'Every replacement: code-drawn fineliner, mint paper, lime focus, petrol measurement arrows, no text; 1600×1000 WebP <200kB.', '',
  '| Guide | Proposed NL primary keyword | Illustration subject | Top content fixes (NL / EN where different) |',
  '|---|---|---|---|');
for (const row of audit.rows.filter((r) => r.locale === 'nl')) {
  const en = audit.rows.find((r) => r.locale === 'en' && r.slug === row.slug);
  md.push(`| ${row.slug} | ${row.proposedDutchKeyword} | ${row.proposedIllustration} | `
    + `Words ${row.counts.words}/${en.counts.words}; H2 ${row.sections.length}/${en.sections.length}; `
    + `FAQ ${row.counts.faq}/${en.counts.faq}; title ${row.counts.title}/${en.counts.title}, `
    + `description ${row.counts.description}/${en.counts.description}. `
    + `${!row.checks.inbound ? 'Add ≥2 inbound links. ' : ''}`
    + `${!row.checks.guideCalculatorLinks ? 'Repair guide/calculator link mix. ' : ''}`
    + 'Rebuild prescribed order, translate English anchors/CTA, add date, replace hero/alt. |');
}
md.push('', '## Concrete cross-guide fixes', '',
  '- **Sitemap:** 36 live guide URLs are absent. Align the sitemap with the intended indexable guide inventory; '
    + 'the newly discovered pages also need the content review below.',
  '- **Structure:** CMS bodies exceed the target and use extra chapters; fallback-like pages are thin. '
    + 'NL often repeats “Kort antwoord” inside the body in addition to the hero answer because stripping uses the English heading.',
  '- **Links:** related blocks contain generic “Open de volgende relevante pagina…” rationale, not a topic-specific reason. '
    + 'NL target labels and “Start Free Fit” remain English. Raw links and inbound sources are retained per row.',
  '- **Metadata:** keep slugs/canonical/hreflang; rewrite overlong titles and out-of-band descriptions, retain unique metadata.',
  '- **Dates:** Article exists but lacks dateModified; no visible updated label was found. Implement both from an honest revision date.',
  '- **Images:** CMS originals are PNG; hero alt repeats the page title. Existing blue/orange digital riders fail the requested '
    + 'illustration style. Fallback-like pages reuse a cockpit illustration regardless of topic. Use proposed subjects.',
  '- **Claims/safety:** numeric values are inventoried in JSON; each needs a source, engine reference or accepted rule-of-thumb '
    + 'decision. This audit does not assert the existing figures are fabricated. Review rest/night pain, swelling, radiating '
    + 'tingling and persistent symptoms individually; the automated warning check is only a proxy.',
  '- **Translation parity:** every slug has both locales. For the 30 CMS pairs, removing the extra NL quick-answer chapter '
    + 'aligns chapter counts and numeric sequences (decimal comma normalized); this supports structural/numeric parity only. '
    + 'Rewrite NL first and review EN against it sentence by sentence.', '',
  '## Reproduce and handoff', '',
  'Run `node tests/visual/guides-audit/audit.mjs`, then `node tests/visual/guides-audit/review.mjs`.',
  'The first command performs public GET reads and closes Chromium; no local server, CMS call or mutation is used.',
  'The second applies explicitly documented editorial proposals to retained evidence. Full details and text are in',
  '`44a-guides-audit.json`. Re-run before 44b acceptance; manual R items still need an editorial decision.', '',
  'Validation: both scripts pass ESLint; all 96 records have a counterpart and 48 unique NL proposals; no links to guide '
    + 'detail URLs remain outside the final inventory. All 96 have a real #guide-content article.', '',
  'Files: `tests/visual/guides-audit/audit.mjs`, `tests/visual/guides-audit/review.mjs`, this Markdown, matching JSON,',
  '`files-44a.txt`. No PNGs are versioned or listed. No commit.', '');
await writeFile(`${path}.md`, md.join('\n'));
console.log(JSON.stringify({ rows: audit.rows.length, summary: audit.summary }, null, 2));
