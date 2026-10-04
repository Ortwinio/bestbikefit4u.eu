/** Explicit vocabulary, not substring matching: Dutch homographs are never evidence of English. */
const englishWords = new Set(`
theme sidebar increase decrease breadcrumb breadcrumbs
about above access accuracy accurate activate activity actual add added adjust adjustment adjustments advanced advice
ago agree all allow already also always amount analysis analyze and another any apply are article articles assessment
available average back based because before below benefit benefits between body both browse build built button by
calculate calculated calculating calculation calculations cancel cannot category change changed changes changing
check choose chosen clear click close compared comparing comparison complete completed completing completion
confirm confirmation congratulations connect connected connection contact continue copied copy correct create
created creating current customize daily data date days default delete deleted deleting description details detect
detected different discard discover dismiss display done download downloaded downloading duration each easy edit
editing email empty enable enabled energy enter entered equipment error errors estimate estimated estimates example
exceeds existing experience explore failed failure favorite feedback field fields file files fill find finish first
fitting follow following for forgot form free from full generate generated generating get getting goal goals guide
guides handlebar handlebars height help here hide history hour hours how image images import imported importing
improve improved improvement include includes including incorrect individual information input insights intensity
invalid is issue issues item items join keep key label language last latest learn left length less level levels
library light limit limits link list load loaded loading local location log login logout long longer look lower
make manage manual maximum measure measured measurement measurements measuring method methods metric metrics
minimum missing more most move must name need needed needs new next no none not note notes now number of off
on once one only open opening optional options or other our out output overall overview own page pages password
paste pending per personal please position positioning possible power preference preferences preferred previous
primary privacy private processing profile progress provide public quality question questions range rate rating
read ready reason receive recommended recommendation recommendations record refresh remove removed removing
repeat replace request required requires reset resize resolve result results retry return review right ride rider
rides riding save saved saving search searching second seconds see select selected selection send sending sent
session sessions set setting settings share shared sharing should show showing shown sign signed size skip small
smaller something source sources speed stable start started starting step steps still stop storage strength submit
submitted success successful successfully suggested suggestion summary support sure target template test testing
than that the their them then there these they this those through time tips title to today toggle total training
try type unable unchanged unit units unknown unlock unsupported until update updated updating upload uploaded
uploading use used useful user username users using value values view viewing visit warning was week weekly weeks
weight welcome were what when where which while width will with without work works would wrong year years yes
yet you your yours yourself required recommended beginner intermediate professional recreational athlete athletes
nutrition hydration carbohydrate carbohydrates sodium fluid fluids bottle bottles recommended male female men
women threshold fitness performance endurance recreational racing competitive unrestricted unavailable length
inches pounds millimeters centimeters degrees visibility experience unavailable exceeded understood estimated
under over saddle crank stem distance safety comfortable comfort recommended suitable road mountain advanced
balanced aggressive relaxed optimal optimization optimize confidence reliability evidence scientific research
report reports saddle handlebars crank cockpit recommended recommendations settings profile manual default body
height weight measurements fit fitting export exporting uploaded imported saved unsaved remaining completed
subscription subscriptions billing payment payments premium upgrade trial paid overview notification notifications
signout logout signin signup logout welcoming back forward optional required continue cancel following previous
`.trim().split(/\s+/));

const allowedWords = new Set(`
stack reach drop cleat cleats gravel bikefit bestbikefit4u bestbikefit convex garmin shimano sram campagnolo
ftp wkg vo2max bmi html pdf csv json api url gps rpm bpm mmol acsm jeukendrup sawka allen coggan
email e-mail account dashboard menu cookies cookie browser internet online offline link links data contact correct
check feedback help import input is label login maximum minimum open per privacy reset review set start status stop
support test tips training type unit update upload week fitness was over of men
comfort details complete incorrect item items fit download finish stem record premium upgrade display relaxed
millimeters centimeters last beginner export
`.trim().split(/\s+/));

// These are unambiguous UI/grammar leaks even inside an otherwise Dutch phrase.
const strongWords = new Set(`
theme sidebar increase decrease breadcrumb breadcrumbs
about accuracy accurate add added adjustments advanced agree already also always and are available back because
before below benefits between both browse calculate calculating calculations cancel cannot choose chosen click
close comparison complete completed confirm confirmation continue copied create created creating customize days
delete deleted description details different discard discover dismiss done download downloaded downloading
duration each easy edit editing empty enable enabled enter equipment error errors example failed failure favorite
field fields fill find finish first follow following forgot free from full generate generated get goal goals guide
guides height here hide history hour hours how images improve improvement incorrect individual information
insights intensity invalid issue issues item items keep language last latest learn left length less levels loading
longer lower make manage measure measured measurement measurements missing more most move must need needed
needs new next none not notes now number only optional other our overview password paste pending please
position preference preferences previous question questions rating read ready reason recommended remove removed
required requires retry return rider rides riding save saved saving search searching seconds selected selection
send sending sent sessions share shared sharing should showing shown signed size skip smaller something sources
started starting steps still strength submit submitted success successful successfully summary sure template than
that the their them then there these they this those through today try unable unchanged unknown unsupported
until updated updating uploaded using username users values view viewing visit warning was weekly weeks weight
welcome were what when where which while width will with without works would wrong years yes yet you your
beginner intermediate professional recreational athlete athletes carbohydrate carbohydrates sodium fluids bottles
male female women threshold fitness endurance racing competitive unavailable exceeded understood inches pounds
report reports settings profile manual default body export exporting unsaved remaining subscription subscriptions
billing payment payments upgrade trial paid overview notification notifications signout logout signin signup
millimeters centimeters degrees under over saddle distance comfortable comfort suitable mountain balanced relaxed
`.trim().split(/\s+/));

export function analyzeDutchText(text, context = {}) {
  if (context.kind === "validation-message" && context.browserGenerated === true) return null;
  let analyzed = String(text)
    .replace(/\bFree (en|als) Pro\b/g, "Pro")
    .replace("Training and Racing with a Power Meter", "")
    .replace("A Step Towards Personalized Sports Nutrition: Carbohydrate Intake During Exercise", "")
    .replace("American College of Sports Medicine position stand. Exercise and fluid replacement", "");
  if (analyzed === "Free" && context.kind === "visible-text" && context.pathname === "/nl/pricing"
    && /(?:h2|th):nth-of-type\(\d+\)$/.test(context.selector ?? "")) {
    analyzed = "";
  }
  const words = analyzed.toLowerCase().replace(/https?:\/\/\S+|\b\S+@\S+\b/g, " ")
    .match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? [];
  const meaningful = words.filter((word) => !allowedWords.has(word));
  const matches = meaningful.filter((word) => englishWords.has(word));
  const ratio = meaningful.length ? matches.length / meaningful.length : 0;
  const strong = matches.filter((word) => strongWords.has(word));
  const passesRatio = matches.length >= 2 && ratio >= 0.35;
  if (!strong.length && !passesRatio) return null;
  return {
    englishWords: [...new Set(matches)],
    ratio: Number(ratio.toFixed(3)),
    wordCount: words.length,
    reason: strong.length ? "unambiguous-english-word" : "english-word-ratio",
  };
}

/** All collected strings are returned for audit, including strings without English evidence. */
export async function collectDutchLanguage(page) {
  return page.evaluate(() => {
    const chunks = [];
    const seen = new Set();
    const selectorFor = (element) => {
      if (element.id) return `#${CSS.escape(element.id)}`;
      const parts = [];
      for (let current = element; current && current !== document.body; current = current.parentElement) {
        const tag = current.tagName.toLowerCase();
        const siblings = [...(current.parentElement?.children ?? [])]
          .filter((item) => item.tagName === current.tagName);
        parts.unshift(`${tag}:nth-of-type(${siblings.indexOf(current) + 1})`);
      }
      if (!parts.length) return "body";
      return element.closest("body") ? `body > ${parts.join(" > ")}` : parts.join(" > ");
    };
    const add = (kind, text, element, extra = {}) => {
      text = String(text ?? "").replace(/\s+/g, " ").trim();
      if (!text) return;
      const selector = selectorFor(element);
      const key = JSON.stringify([kind, text, selector]);
      if (seen.has(key)) return;
      seen.add(key);
      chunks.push({ kind, text, selector, pathname: window.location.pathname, ...extra });
    };
    const visible = (element) => {
      if (element.closest("script,style,noscript,template,[hidden],[inert]")) return false;
      const style = getComputedStyle(element);
      return style.visibility !== "hidden" && style.display !== "none" && element.getClientRects().length > 0;
    };
    add("title", document.title, document.querySelector("title") ?? document.documentElement);
    for (const element of document.querySelectorAll('meta[name="description"],meta[property^="og:"]')) {
      if (["og:title", "og:description", "og:image:alt"].includes(element.getAttribute("property")) ||
          element.getAttribute("name") === "description") {
        add(element.getAttribute("property") ?? "description", element.content, element);
      }
    }
    for (const element of document.body.querySelectorAll("*")) {
      if (!visible(element)) continue;
      const directText = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent).join(" ");
      add("visible-text", directText, element);
      for (const attribute of ["aria-label", "alt", "placeholder", "title"]) {
        add(attribute, element.getAttribute(attribute), element);
      }
      if (element.validationMessage) add("validation-message", element.validationMessage, element,
        { browserGenerated: element.validity?.customError === false });
      if (["alert", "status"].includes(element.getAttribute("role"))) {
        add(`role-${element.getAttribute("role")}`, element.innerText, element);
      }
      if (element.matches("select")) {
        for (const option of element.options) add("select-option", option.text, option);
      }
    }
    return chunks;
  });
}
