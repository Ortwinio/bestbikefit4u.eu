"""pen.py - handgetekende inktillustraties in de BestBikeFit4U-huisstijl."""
import math
import random

PALET = {
    "inkt": "#0F2420",
    "lime": "#CFF26A",
    "petrol": "#0A7263",
    "papier": "#F5F8F3",
    "mint": "#E1F2EE",
    "wit": "#FFFFFF",
}


def _lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def _dist(a, b):
    return math.hypot(b[0] - a[0], b[1] - a[1])


def _fmt(v):
    return f"{v:.1f}"


class Pen:
    def __init__(self, w, h, seed=7, papier=True, wobble=1.35, offset=(5, 4)):
        self.w, self.h = w, h
        self.rng = random.Random(seed)
        self.wobble = wobble
        self.offset = offset
        self.layers = {"vlak": [], "arcering": [], "inkt": []}
        self.defs = []
        self._clip = 0
        self.papier = papier

    def _noise_fn(self, amp):
        comps = [(self.rng.uniform(0.01, 0.035), self.rng.uniform(0, 6.3), self.rng.uniform(0.4, 1.0))
                 for _ in range(3)]
        tot = sum(c[2] for c in comps)

        def f(s):
            return amp * sum(a * math.sin(fr * s + ph) for fr, ph, a in comps) / tot
        return f

    def _hand_points(self, pts, amp, step=9.0, closed=False, overshoot=0.0):
        if closed:
            pts = list(pts) + [pts[0]]
        res = [pts[0]]
        for a, b in zip(pts, pts[1:]):
            d = _dist(a, b)
            n = max(1, int(d / step))
            for i in range(1, n + 1):
                res.append(_lerp(a, b, i / n))
        if overshoot and len(res) > 2:
            extra = int(len(res) * overshoot)
            res = res + res[1:extra + 1]
        noise = self._noise_fn(amp)
        out = []
        s = 0.0
        for i, p in enumerate(res):
            if i > 0:
                s += _dist(res[i - 1], p)
            a = res[max(0, i - 1)]
            b = res[min(len(res) - 1, i + 1)]
            dx, dy = b[0] - a[0], b[1] - a[1]
            ln = math.hypot(dx, dy) or 1
            nx, ny = -dy / ln, dx / ln
            k = noise(s)
            out.append((p[0] + nx * k, p[1] + ny * k))
        return out

    @staticmethod
    def _path_d(pts):
        if len(pts) < 3:
            return "M" + " L".join(f"{_fmt(x)} {_fmt(y)}" for x, y in pts)
        d = [f"M{_fmt(pts[0][0])} {_fmt(pts[0][1])}"]
        for i in range(len(pts) - 1):
            p0 = pts[max(0, i - 1)]
            p1, p2 = pts[i], pts[i + 1]
            p3 = pts[min(len(pts) - 1, i + 2)]
            c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
            c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
            d.append(f"C{_fmt(c1[0])} {_fmt(c1[1])} {_fmt(c2[0])} {_fmt(c2[1])} {_fmt(p2[0])} {_fmt(p2[1])}")
        return "".join(d)

    def stroke(self, pts, w=2.4, kleur="inkt", closed=False, laag="inkt", opacity=1.0,
               texture=True, overshoot=None, dash=None):
        col = PALET.get(kleur, kleur)
        if overshoot is None:
            overshoot = 0.06 if closed else 0.0
        hp = self._hand_points(pts, 0.9 * self.wobble, closed=closed, overshoot=overshoot)
        d = self._path_d(hp)
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        self.layers[laag].append(
            f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{_fmt(w)}" '
            f'stroke-linecap="round" stroke-linejoin="round" opacity="{opacity}"{extra}/>')
        if texture and w >= 1.6 and not dash:
            hp2 = self._hand_points(pts, 0.7 * self.wobble, closed=closed, overshoot=overshoot * 0.5)
            hp2 = [(x + 0.4, y + 0.3) for x, y in hp2]
            self.layers[laag].append(
                f'<path d="{self._path_d(hp2)}" fill="none" stroke="{col}" stroke-width="{_fmt(w * 0.45)}" '
                f'stroke-linecap="round" opacity="{0.55 * opacity:.2f}"/>')

    def line(self, a, b, **kw):
        self.stroke([a, b], **kw)

    def polyline(self, pts, **kw):
        self.stroke(pts, **kw)

    def poly(self, pts, **kw):
        self.stroke(pts, closed=True, **kw)

    @staticmethod
    def ellipse_pts(c, rx, ry=None, rot=0.0, a0=0.0, a1=2 * math.pi, n=None):
        ry = rx if ry is None else ry
        n = n or max(24, int(max(rx, ry) * abs(a1 - a0) / 6))
        cr, sr = math.cos(rot), math.sin(rot)
        pts = []
        for i in range(n + 1):
            t = a0 + (a1 - a0) * i / n
            x, y = rx * math.cos(t), ry * math.sin(t)
            pts.append((c[0] + x * cr - y * sr, c[1] + x * sr + y * cr))
        return pts

    def circle(self, c, r, **kw):
        self.stroke(self.ellipse_pts(c, r)[:-1], closed=True, **kw)

    def ellipse(self, c, rx, ry, rot=0.0, **kw):
        self.stroke(self.ellipse_pts(c, rx, ry, rot)[:-1], closed=True, **kw)

    def arc(self, c, r, a0, a1, **kw):
        self.stroke(self.ellipse_pts(c, r, r, 0, a0, a1), **kw)

    @staticmethod
    def bezier_pts(p0, p1, p2, p3, n=30):
        pts = []
        for i in range(n + 1):
            t = i / n
            mt = 1 - t
            x = mt**3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t**3 * p3[0]
            y = mt**3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t**3 * p3[1]
            pts.append((x, y))
        return pts

    def bezier(self, p0, p1, p2, p3, **kw):
        self.stroke(self.bezier_pts(p0, p1, p2, p3), **kw)

    def fill(self, pts, kleur="lime", offset=None, opacity=1.0, jitter=1.2):
        col = PALET.get(kleur, kleur)
        ox, oy = self.offset if offset is None else offset
        jp = [(x + ox + self.rng.uniform(-jitter, jitter), y + oy + self.rng.uniform(-jitter, jitter))
              for x, y in pts]
        d = "M" + " L".join(f"{_fmt(x)} {_fmt(y)}" for x, y in jp) + "Z"
        self.layers["vlak"].append(f'<path d="{d}" fill="{col}" opacity="{opacity}"/>')

    def fill_circle(self, c, r, kleur="lime", **kw):
        self.fill(self.ellipse_pts(c, r)[:-1], kleur, **kw)

    def hatch(self, region, hoek=45, afstand=7.0, w=1.1, kleur="inkt", kruis=False, opacity=0.85):
        col = PALET.get(kleur, kleur)
        self._clip += 1
        cid = f"clip{self._clip}"
        d = "M" + " L".join(f"{_fmt(x)} {_fmt(y)}" for x, y in region) + "Z"
        self.defs.append(f'<clipPath id="{cid}"><path d="{d}"/></clipPath>')
        xs = [p[0] for p in region]
        ys = [p[1] for p in region]
        cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        rad = math.hypot(max(xs) - min(xs), max(ys) - min(ys)) / 2 + 10
        paths = []
        for ang in ([hoek, hoek + 90] if kruis else [hoek]):
            t = math.radians(ang)
            ux, uy = math.cos(t), math.sin(t)
            nx, ny = -uy, ux
            k = -rad
            while k <= rad:
                jit = self.rng.uniform(-0.8, 0.8)
                a = (cx + nx * (k + jit) - ux * rad, cy + ny * (k + jit) - uy * rad)
                b = (cx + nx * (k + jit) + ux * rad, cy + ny * (k + jit) + uy * rad)
                hp = self._hand_points([a, b], 0.5 * self.wobble, step=14)
                paths.append(f'<path d="{self._path_d(hp)}"/>')
                k += afstand * self.rng.uniform(0.85, 1.15)
        self.layers["arcering"].append(
            f'<g clip-path="url(#{cid})" fill="none" stroke="{col}" stroke-width="{_fmt(w)}" '
            f'stroke-linecap="round" opacity="{opacity}">' + "".join(paths) + "</g>")

    def hatch_circle(self, c, r, **kw):
        self.hatch(self.ellipse_pts(c, r)[:-1], **kw)

    def tube(self, a, b, dikte, kleur="lime", w=2.2, caps=False, schaduw=True):
        dx, dy = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(dx, dy) or 1
        nx, ny = -dy / ln * dikte / 2, dx / ln * dikte / 2
        p1, p2 = (a[0] + nx, a[1] + ny), (b[0] + nx, b[1] + ny)
        p3, p4 = (b[0] - nx, b[1] - ny), (a[0] - nx, a[1] - ny)
        if kleur:
            self.fill([p1, p2, p3, p4], kleur)
        if schaduw and dikte > 9:
            if (p1[1] + p2[1]) > (p3[1] + p4[1]):
                zone = [p1, p2, b, a]
            else:
                zone = [a, b, p3, p4]
            ang = math.degrees(math.atan2(dy, dx)) + 65
            self.hatch(zone, hoek=ang, afstand=max(3.0, dikte / 7), w=0.8, opacity=0.55)
        self.line(p1, p2, w=w)
        self.line(p4, p3, w=w)
        if caps:
            self.line(p1, p4, w=w * 0.8)
            self.line(p2, p3, w=w * 0.8)
        return p1, p2, p3, p4

    def arrow(self, a, b, kleur="petrol", w=2.2, kop=14, twee=True, dash=None):
        self.stroke([a, b], w=w, kleur=kleur, dash=dash, texture=False)
        for p, q in ([(b, a), (a, b)] if twee else [(b, a)]):
            ang = math.atan2(p[1] - q[1], p[0] - q[0])
            for s in (-0.45, 0.45):
                e = (p[0] - kop * math.cos(ang + s), p[1] - kop * math.sin(ang + s))
                self.stroke([e, p], w=w, kleur=kleur, texture=False)

    def svg(self, titel="Illustratie"):
        bg = f'<rect width="{self.w}" height="{self.h}" fill="{PALET["papier"]}"/>' if self.papier else ""
        body = "".join(self.layers["vlak"]) + "".join(self.layers["arcering"]) + "".join(self.layers["inkt"])
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" '
                f'viewBox="0 0 {self.w} {self.h}" role="img" aria-label="{titel}"><title>{titel}</title>'
                f'<defs>{"".join(self.defs)}</defs>{bg}{body}</svg>')

    def save(self, basis, titel="Illustratie", png_breedte=None, webp=True):
        import os
        import cairosvg
        os.makedirs(os.path.dirname(os.path.abspath(basis)), exist_ok=True)
        code = self.svg(titel)
        with open(basis + ".svg", "w") as fh:
            fh.write(code)
        cairosvg.svg2png(bytestring=code.encode(), write_to=basis + ".png", output_width=png_breedte or self.w)
        if webp:
            from PIL import Image
            Image.open(basis + ".png").convert("RGB").save(basis + ".webp", "WEBP", quality=88, method=6)
        return code
