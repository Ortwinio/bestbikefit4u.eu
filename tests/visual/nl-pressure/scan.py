"""Audit task 40b against a running build; uses only the Python standard library.

python3 tests/visual/nl-pressure/scan.py --base-url http://localhost:3000 \
    --output plans/redesign-canvas/audit/40b-local-scan.json

Optionally use --baseline <previous output> to compare English text exactly.
The English heuristic comes from audit/40-nl-scan-live.py. Findings need human
review: technical cycling terms and Dutch/English homographs can be ambiguous.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import ssl
import urllib.error
import urllib.parse
import urllib.request


ROOT = Path(__file__).resolve().parents[3]
ENGLISH = set("""the and your you with for from this that are will our how what why when which into than
their they there these those should would could about before after while where who been being
have has does doesn't don't can't won't it's you're we're get gets getting more most less
each every both other only just also still even because without within between during
learn read find choose check compare start using used use measure improve keep make
free first next back today step steps guide guides calculator calculators riding rider riders
bike bikes fit fitting saddle height handlebar pressure tire tires result results""".split())
ALLOW = set("stack reach drop cleat cleats gravel fit fitting bike bikefit crank tubeless pro free".split())
STRONG = ENGLISH - ALLOW - set("guide guides step steps start check test".split())
BIKES = {"road-bike": "racefiets", "gravel-bike": "gravelbike", "mountain-bike": "mountainbike"}


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.text = []
        self.attributes = []
        self.metadata = {}
        self.canonical = None
        self.languages = {}
        self.html_language = None
        self.capture = None
        self.headings = []
        self.title = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag in ("script", "style", "noscript", "svg"):
            self.skip += 1
        if tag == "html":
            self.html_language = attributes.get("lang")
        for key in ("aria-label", "alt", "placeholder", "title"):
            if attributes.get(key):
                self.attributes.append([key, attributes[key]])
        if tag == "meta":
            key = attributes.get("property") or attributes.get("name")
            if key in ("description", "og:title", "og:description", "og:url"):
                self.metadata[key] = attributes.get("content", "")
        if tag == "link":
            if attributes.get("rel") == "canonical":
                self.canonical = attributes.get("href")
            if attributes.get("rel") == "alternate" and attributes.get("hreflang"):
                self.languages[attributes["hreflang"]] = attributes.get("href")
        if tag in ("h1", "title"):
            self.capture = tag

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg") and self.skip:
            self.skip -= 1
        if tag == self.capture:
            self.capture = None

    def handle_data(self, data):
        value = " ".join(data.split())
        if not self.skip and value:
            self.text.append(value)
            if self.capture == "h1":
                self.headings.append(value)
            elif self.capture == "title":
                self.title.append(value)


def english(text):
    words = re.findall(r"[a-zA-Z']+", text.lower())
    hits = [word for word in words if word in STRONG]
    return len(words) >= 3 and len(hits) >= 2 and len(hits) / len(words) >= 0.2


def routes(include_english):
    source = (ROOT / "src/lib/seo/programmatic/tirePressure.ts").read_text()
    match = re.search(r"WEIGHT_STEPS\s*=\s*\[([^]]+)\]", source)
    if not match:
        raise ValueError("Could not read WEIGHT_STEPS from tirePressure.ts")
    weights = [int(weight) for weight in re.findall(r"\d+", match[1])]
    result = []
    for locale in (["nl", "en"] if include_english else ["nl"]):
        for weight in weights:
            for bike in BIKES:
                result.append((f"/{locale}/tire-pressure/{weight}kg-{bike}", locale, weight, bike))
    calculator_dir = ROOT / "src/app/(public)/calculators"
    for page in sorted(calculator_dir.glob("*/page.tsx")):
        result.append((f"/nl/calculators/{page.parent.name}", "nl", None, None))
    result += [(path, "nl", None, None) for path in (
        "/nl/tire-pressure-calculator", "/nl/bandenspanning-calculator",
    )]
    return result


class ExplicitRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        return None


def fetch(url, insecure):
    """Follow 308 as well as older redirects, recording every hop for the audit."""
    context = ssl._create_unverified_context() if insecure else ssl.create_default_context()
    opener = urllib.request.build_opener(ExplicitRedirects(), urllib.request.HTTPSHandler(context=context))
    redirects = []
    for _ in range(10):
        if insecure and urllib.parse.urlparse(url).hostname not in ("localhost", "127.0.0.1", "::1"):
            raise ValueError("Refusing non-loopback redirect with --insecure")
        request = urllib.request.Request(url, headers={"User-Agent": "bbf-task40b-nl-scan"})
        try:
            with opener.open(request, timeout=90) as response:
                return response.status, response.url, response.read().decode("utf-8", "replace"), redirects
        except urllib.error.HTTPError as error:
            if error.code not in (301, 302, 303, 307, 308) or not error.headers.get("Location"):
                raise
            destination = urllib.parse.urljoin(url, error.headers["Location"])
            redirects.append({"status": error.code, "from": url, "to": destination})
            url = destination
    raise ValueError("Redirect limit exceeded")


def scan(base_url, route, insecure=False):
    path, locale, weight, bike = route
    result = {"path": path, "locale": locale, "errors": [], "english_findings": []}
    try:
        status, final_url, html, redirects = fetch(base_url + path, insecure)
        result.update(status=status, final_url=final_url, redirects=redirects)
        if not html.strip():
            raise ValueError("Empty HTTP response")
    except (urllib.error.URLError, TimeoutError, ValueError) as error:
        result["fetch_error"] = str(error)
        result["errors"].append("fetch_failed")
        return result
    page = Page()
    page.feed(html)
    result.update(title=" ".join(page.title), h1=" ".join(page.headings), metadata=page.metadata,
                  canonical=page.canonical, hreflang=page.languages, html_language=page.html_language)
    if page.html_language != locale:
        result["errors"].append("incorrect_html_language")
    strings = [["text", text] for text in page.text] + page.attributes + [
        item for item in page.metadata.items() if item[0] != "og:url"
    ]
    if path == "/nl/tire-pressure-calculator":
        if urllib.parse.urlparse(result["final_url"]).path != "/nl/bandenspanning-calculator":
            result["errors"].append("incorrect_pressure_calculator_alias_destination")
        if not result["redirects"]:
            result["errors"].append("missing_pressure_calculator_alias_redirect")
    if locale == "nl":
        result["english_findings"] = [list(item) for item in dict.fromkeys(
            tuple(item) for item in strings if english(item[1])
        )]
    else:
        result["english_content_sha256"] = hashlib.sha256(
            json.dumps(strings, ensure_ascii=False).encode()
        ).hexdigest()
    if not result["title"] or not result["h1"]:
        result["errors"].append("missing_title_or_h1")
    for key in ("description", "og:title", "og:description"):
        if not page.metadata.get(key):
            result["errors"].append(f"missing_{key}")
    if weight is not None:
        expected = {
            "en": f"/en/tire-pressure/{weight}kg-{bike}",
            "nl": f"/nl/bandenspanning/{weight}kg-{BIKES[bike]}",
            "x-default": f"/en/tire-pressure/{weight}kg-{bike}",
        }
        if urllib.parse.urlparse(page.canonical or "").path != expected[locale]:
            result["errors"].append("incorrect_canonical")
        if urllib.parse.urlparse(page.metadata.get("og:url", "")).path != expected[locale]:
            result["errors"].append("incorrect_og_url")
        for language, expected_path in expected.items():
            if urllib.parse.urlparse(page.languages.get(language) or "").path != expected_path:
                result["errors"].append(f"incorrect_hreflang_{language}")
        if locale == "nl":
            for key, value in [("title", result["title"]), ("h1", result["h1"]), *page.metadata.items()]:
                if key == "og:url":
                    continue
                dutch_term = "achterdruk" if key in ("description", "og:description") else "bandenspanning"
                if dutch_term not in value.lower() or str(weight) not in value or BIKES[bike] not in value.lower():
                    result["errors"].append(f"missing_dutch_weight_bike_copy_{key}")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://localhost:3000")
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--baseline", type=Path, help="Previous scan output for exact EN text comparison")
    parser.add_argument("--skip-en", action="store_true")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--insecure", action="store_true", help="Allow local self-signed HTTPS only")
    args = parser.parse_args()
    if args.insecure and urllib.parse.urlparse(args.base_url).hostname not in ("localhost", "127.0.0.1", "::1"):
        parser.error("--insecure is only supported for a loopback local preview")
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        results = list(executor.map(
            lambda route: scan(args.base_url.rstrip("/"), route, args.insecure), routes(not args.skip_en)
        ))
    if args.baseline:
        previous = {row["path"]: row for row in json.loads(args.baseline.read_text())["pages"]}
        for result in results:
            if result["locale"] == "en":
                before = previous.get(result["path"], {}).get("english_content_sha256")
                if not before:
                    result["errors"].append("english_baseline_missing")
                elif before != result.get("english_content_sha256"):
                    result["errors"].append("english_content_changed")
    summary = {
        "pages": len(results),
        "fetch_errors": sum("fetch_error" in row for row in results),
        "pages_with_errors": sum(bool(row["errors"]) for row in results),
        "pages_with_english_findings": sum(bool(row["english_findings"]) for row in results),
        "english_findings": sum(len(row["english_findings"]) for row in results),
        "english_baseline_compared": bool(args.baseline),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({"base_url": args.base_url, "summary": summary, "pages": results},
                                      ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(summary, indent=2))
    raise SystemExit(1 if summary["pages_with_errors"] or summary["english_findings"] else 0)


if __name__ == "__main__":
    main()
