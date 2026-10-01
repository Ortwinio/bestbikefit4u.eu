"""Scan live NL pages for English text (visible text + title/meta/aria/alt/placeholder)."""
import json, re, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser

BASE = "https://bestbikefit4u.eu"
EN = set("""the and your you with for from this that are will our how what why when which into than
their they there these those should would could about before after while where who been being
have has does doesn't don't can't won't it's you're we're get gets getting more most less
each every both other only just also still even because without within between during
learn read find choose check compare start using used use measure improve keep make
free first next back today step steps guide guides calculator calculators riding rider riders
bike bikes fit fitting saddle height handlebar pressure tire tires result results""".split())
# words that also exist in Dutch or are accepted cycling/brand terms
ALLOW = set("stack reach drop cleat cleats gravel fit fitting bike bikefit crank tubeless pro free".split())
STRONG = EN - ALLOW - set("guide guides step steps start check test".split())

class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.skip = 0; self.chunks = []; self.attrs = []
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg"): self.skip += 1
        d = dict(attrs)
        for a in ("aria-label", "alt", "placeholder", "title"):
            if d.get(a): self.attrs.append((a, d[a]))
        if tag == "meta" and d.get("name") in ("description",) and d.get("content"):
            self.attrs.append(("meta", d["content"]))
        if tag == "meta" and d.get("property") in ("og:title", "og:description") and d.get("content"):
            self.attrs.append((d["property"], d["content"]))
    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg") and self.skip: self.skip -= 1
    def handle_data(self, data):
        if not self.skip and data.strip(): self.chunks.append(data.strip())

def get(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "bbf-nl-scan"}), timeout=30) as r:
            return r.read().decode("utf-8", "replace")
    except Exception as e:
        return ""

def english(text):
    words = re.findall(r"[a-zA-Z']+", text.lower())
    hits = [w for w in words if w in STRONG]
    return len(words) >= 3 and len(hits) >= 2 and len(hits) / max(len(words), 1) >= 0.2

urls = set()
for sm in ("sitemap-pages.xml", "sitemap-calculators.xml", "sitemap-guides.xml"):
    for u in re.findall(r"<loc>([^<]+)</loc>", get(f"{BASE}/{sm}")):
        path = u.replace(BASE, "")
        path = re.sub(r"^/(en|nl)(?=/|$)", "", path)
        urls.add("/nl" + path if path else "/nl")

def scan(path):
    html = get(BASE + path)
    p = P(); p.feed(html)
    found = [("text", c) for c in p.chunks if english(c)]
    found += [(k, v) for k, v in p.attrs if english(v)]
    return path, bool(html), found

with ThreadPoolExecutor(8) as ex:
    results = list(ex.map(scan, sorted(urls)))

total = 0
out = {}
for path, ok, found in results:
    if not ok:
        out[path] = "FETCH FAILED"; continue
    if found:
        uniq = list(dict.fromkeys(f"{k}: {v[:140]}" for k, v in found))
        out[path] = uniq; total += len(uniq)
json.dump(out, open(sys.argv[1], "w"), indent=1, ensure_ascii=False)
print(f"pages scanned: {len(results)}; pages with English: {sum(1 for v in out.values() if v != 'FETCH FAILED')}; findings: {total}")
for path, v in sorted(out.items(), key=lambda kv: -len(kv[1]) if isinstance(kv[1], list) else 0)[:25]:
    print(f"{len(v) if isinstance(v, list) else v:>4}  {path}")
