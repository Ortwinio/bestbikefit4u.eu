"""fiets.py - realistische fiets in pentekenstijl, uit echte geometrie (mm). Oorsprong = trapas."""
import math

GEO = {
    "race": dict(achter=(-405, 70), voor=(585, 70), band=340, velg=311, velgdiepte=40,
                 zadelbuis_top=(-153, 518), stuurbuis_top=(385, 570), stuurbuis_onder=(431, 427)),
    "gravel": dict(achter=(-425, 70), voor=(615, 70), band=355, velg=311, velgdiepte=22,
                   zadelbuis_top=(-150, 505), stuurbuis_top=(400, 585), stuurbuis_onder=(452, 425)),
}


class Fiets:
    def __init__(self, pen, ox, oy, s, soort="race", frame="lime", tape="petrol", bidon=True,
                 tassen=False, crank_hoek=-40, spaken=24):
        self.p, self.ox, self.oy, self.s = pen, ox, oy, s
        self.g = GEO[soort]
        self.soort = soort
        self.frame, self.tape, self.bidon, self.tassen = frame, tape, bidon, tassen
        self.crank_hoek, self.spaken = crank_hoek, spaken

    def M(self, x, y):
        return (self.ox + x * self.s, self.oy - y * self.s)

    def Ms(self, pts):
        return [self.M(x, y) for x, y in pts]

    def wiel(self, hub):
        p, s, g = self.p, self.s, self.g
        c = self.M(*hub)
        R, rv, rd = g["band"] * s, g["velg"] * s, (g["velg"] - g["velgdiepte"]) * s
        buiten = p.ellipse_pts(c, R)[:-1]
        binnen = p.ellipse_pts(c, rv)[:-1][::-1]
        p.hatch(buiten + [buiten[0]] + [binnen[-1]] + binnen, hoek=60, afstand=max(3.2, 4.2 * s), w=0.9 * max(1, s))
        p.circle(c, R, w=2.6 * max(1, s * 0.9))
        p.circle(c, rv, w=1.8 * max(1, s * 0.9))
        if self.soort == "gravel":
            for i in range(72):
                a = i / 72 * 2 * math.pi
                p1 = (c[0] + math.cos(a) * R, c[1] + math.sin(a) * R)
                p2 = (c[0] + math.cos(a) * (R + 4 * s), c[1] + math.sin(a) * (R + 4 * s))
                p.line(p1, p2, w=2.2 * max(1, s), texture=False)
        p.circle(c, rd, w=1.4 * max(1, s * 0.9), texture=False)
        n = self.spaken
        for i in range(n):
            a = i / n * 2 * math.pi
            flens = (c[0] + math.cos(a) * 22 * s, c[1] + math.sin(a) * 22 * s)
            b = a + (0.32 if i % 2 else -0.32)
            eind = (c[0] + math.cos(b) * rd, c[1] + math.sin(b) * rd)
            p.line(flens, eind, w=0.8 * max(1, s * 0.8), texture=False, opacity=0.8)
        p.circle(c, 24 * s, w=1.8 * max(1, s * 0.9))
        p.fill_circle(c, 24 * s, "petrol", offset=(2, 2))
        p.circle(c, 7 * s, w=1.6, texture=False)

    def aandrijving(self):
        p, s = self.p, self.s
        bb = self.M(0, 0)
        achter = self.M(*self.g["achter"])
        R1, R2 = 108 * s, 76 * s
        p.circle(bb, R1, w=2.2 * max(1, s * 0.8))
        tanden = []
        for i in range(100):
            a = i / 100 * 2 * math.pi
            r = R1 + (3.5 * s if i % 2 == 0 else 0)
            tanden.append((bb[0] + math.cos(a) * r, bb[1] + math.sin(a) * r))
        p.stroke(tanden, w=0.9 * max(1, s * 0.7), closed=True, texture=False)
        p.circle(bb, R2, w=1.4 * max(1, s * 0.8), texture=False)
        for i in range(4):
            a = math.radians(self.crank_hoek + 45 + i * 90)
            p.line(bb, (bb[0] + math.cos(a) * R2, bb[1] + math.sin(a) * R2), w=5 * s, texture=False)
        for r in (52, 42, 32):
            p.circle(achter, r * s, w=1.2 * max(1, s * 0.8), texture=False)
        top_blad, top_cas = (bb[0], bb[1] - R1), (achter[0], achter[1] - 52 * s)
        p.line(top_blad, top_cas, w=1.8 * max(1, s * 0.8), dash=f"{6 * s:.1f} {3 * s:.1f}")
        p.line(top_blad, top_cas, w=1.0 * max(1, s * 0.8), texture=False)
        pul1 = self.M(self.g["achter"][0] + 10, self.g["achter"][1] - 70)
        pul2 = self.M(self.g["achter"][0] + 30, self.g["achter"][1] - 130)
        onder_blad = (bb[0], bb[1] + R1)
        p.line(onder_blad, (pul2[0], pul2[1] + 10 * s), w=1.4 * max(1, s * 0.8), texture=False)
        p.circle(pul1, 11 * s, w=1.4, texture=False)
        p.circle(pul2, 11 * s, w=1.4, texture=False)
        p.line(pul1, pul2, w=5 * s, texture=False)
        p.line(achter, pul1, w=3 * s, texture=False)
        a = math.radians(self.crank_hoek)
        eind = (bb[0] + math.cos(a) * 172 * s, bb[1] - math.sin(a) * 172 * s)
        p.tube(bb, eind, 26 * s, kleur="inkt", w=2)
        p.circle(bb, 20 * s, w=2)
        ped = [(eind[0] - 45 * s, eind[1] - 9 * s), (eind[0] + 45 * s, eind[1] - 9 * s),
               (eind[0] + 45 * s, eind[1] + 9 * s), (eind[0] - 45 * s, eind[1] + 9 * s)]
        p.fill(ped, "petrol")
        p.poly(ped, w=2)
        p.circle(eind, 6 * s, w=1.6, texture=False)
        return eind

    def frameset(self):
        p, s, g, M = self.p, self.s, self.g, self.M
        f = self.frame
        st_top, ht_top, ht_bot = g["zadelbuis_top"], g["stuurbuis_top"], g["stuurbuis_onder"]
        cluster = (st_top[0] + 8, st_top[1] - 22)
        p.tube(M(*g["achter"]), M(0, 0), 18 * s, f)
        p.tube(M(*g["achter"]), M(*cluster), 16 * s, f)
        p.tube(M(0, 0), M(ht_bot[0] - 16, ht_bot[1] + 34), 44 * s, f)
        p.tube(M(*cluster), M(ht_top[0] + 4, ht_top[1] - 16), 32 * s, f)
        p.tube(M(0, 0), M(*st_top), 32 * s, f)
        p.tube(M(*ht_top), M(*ht_bot), 42 * s, f, caps=True)
        vo = g["voor"]
        a = M(*ht_bot)
        c1 = M(ht_bot[0] + 30, ht_bot[1] - 120)
        c2 = M(vo[0] - 30, vo[1] + 120)
        b = M(*vo)
        links = p.bezier_pts((a[0] - 12 * s, a[1]), (c1[0] - 12 * s, c1[1]), (c2[0] - 6 * s, c2[1]), (b[0] - 6 * s, b[1]))
        rechts = p.bezier_pts((a[0] + 12 * s, a[1]), (c1[0] + 12 * s, c1[1]), (c2[0] + 6 * s, c2[1]), (b[0] + 6 * s, b[1]))
        p.fill(links + rechts[::-1], f)
        p.stroke(links, w=2.2)
        p.stroke(rechts, w=2.2)
        p.circle(M(0, 0), 26 * s, w=2.2)

    def bidonhouder(self):
        if not self.bidon:
            return
        p, s = self.p, self.s
        a, b = (0, 0), self.g["stuurbuis_onder"]
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        base = (a[0] + math.cos(ang) * 150, a[1] + math.sin(ang) * 150)
        ux, uy = math.cos(ang), math.sin(ang)
        nx, ny = -uy, ux
        L, D = 200, 70
        pts_mm = [(base[0] + nx * 26, base[1] + ny * 26),
                  (base[0] + nx * 26 + ux * L, base[1] + ny * 26 + uy * L),
                  (base[0] + nx * (26 + D) + ux * L, base[1] + ny * (26 + D) + uy * L),
                  (base[0] + nx * (26 + D), base[1] + ny * (26 + D))]
        pts = self.Ms(pts_mm)
        p.fill(pts, "wit", offset=(0, 0))
        p.fill(pts, "mint")
        p.poly(pts, w=2)
        dop = self.Ms([pts_mm[1], (pts_mm[1][0] + ux * 25, pts_mm[1][1] + uy * 25),
                       (pts_mm[2][0] + ux * 25 - nx * 15, pts_mm[2][1] + uy * 25 - ny * 15), pts_mm[2]])
        p.poly(dop, w=1.8)
        p.hatch(pts, hoek=math.degrees(-ang) + 90, afstand=6 * max(1, s), w=0.9, opacity=0.6)

    def frametas(self):
        if not self.tassen:
            return
        p, g = self.p, self.g
        st, ht = g["zadelbuis_top"], g["stuurbuis_top"]
        pts = self.Ms([(st[0] + 60, st[1] - 60), (ht[0] - 45, ht[1] - 50), (ht[0] - 90, ht[1] - 200),
                       (120, 150), (st[0] + 50, st[1] - 200)])
        p.fill(pts, "petrol")
        p.poly(pts, w=2)
        rits = self.Ms([(st[0] + 70, st[1] - 90), (ht[0] - 70, ht[1] - 80)])
        p.line(*rits, w=1.4, dash="5 4")

    def zadel_en_pen(self):
        p, s, M = self.p, self.s, self.M
        st = self.g["zadelbuis_top"]
        top = (st[0] - 0.284 * 105, st[1] + 0.959 * 105)
        p.tube(M(*st), M(*top), 27 * s, "wit", schaduw=False)
        sx, sy = top
        buiten = p.bezier_pts(M(sx - 140, sy + 12), M(sx - 100, sy + 42), M(sx + 40, sy + 22), M(sx + 135, sy + 10))
        onder = p.bezier_pts(M(sx + 135, sy + 10), M(sx + 60, sy - 6), M(sx - 60, sy - 4), M(sx - 140, sy + 12))
        shape = buiten + onder[1:]
        p.fill(shape, "inkt", offset=(0, 0), opacity=0.9)
        p.poly(shape, w=2.2)
        p.hatch(shape, hoek=10, afstand=4 * max(1, s), w=0.8, kleur="wit", opacity=0.35)
        p.line(M(sx - 80, sy - 2), M(sx + 50, sy - 2), w=2)
        p.line(M(sx - 70, sy - 2), M(sx - 40, sy + 8), w=1.6, texture=False)
        p.line(M(sx + 40, sy - 2), M(sx + 60, sy + 8), w=1.6, texture=False)
        return M(sx, sy + 20)

    def cockpit(self):
        p, s, M = self.p, self.s, self.M
        ht = self.g["stuurbuis_top"]
        spacer_top = (ht[0] - 6, ht[1] + 25)
        for i in range(3):
            y = ht[1] + i * 8
            p.line(M(ht[0] - 22, y), M(ht[0] + 16, y), w=1.4, texture=False)
        p.tube(M(*ht), M(*spacer_top), 38 * s, "mint", schaduw=False)
        klem = (ht[0] + 100, ht[1] + 38)
        p.tube(M(spacer_top[0], spacer_top[1] - 4), M(*klem), 34 * s, "inkt")
        cx, cy = klem
        stuur = p.bezier_pts(M(cx, cy), M(cx + 80, cy + 4), M(cx + 110, cy - 40), M(cx + 95, cy - 110))
        stuur += p.bezier_pts(M(cx + 95, cy - 110), M(cx + 85, cy - 150), M(cx + 40, cy - 150), M(cx + 10, cy - 138))[1:]
        p.stroke(stuur, w=26 * s, kleur=self.tape, texture=False)
        p.stroke(stuur, w=2.2)
        grip = self.Ms([(cx + 60, cy + 4), (cx + 92, cy + 22), (cx + 112, cy + 12), (cx + 104, cy - 30), (cx + 84, cy - 12)])
        p.fill(grip, "inkt", offset=(0, 0))
        p.poly(grip, w=2)
        hendel = p.bezier_pts(M(cx + 104, cy - 20), M(cx + 116, cy - 70), M(cx + 110, cy - 100), M(cx + 95, cy - 118))
        p.stroke(hendel, w=3.2)
        p.circle(M(cx, cy), 18 * s, w=2)
        return M(cx, cy)

    def teken(self):
        self.wiel(self.g["achter"])
        self.wiel(self.g["voor"])
        self.frametas()
        self.frameset()
        self.bidonhouder()
        pedaal = self.aandrijving()
        zadel = self.zadel_en_pen()
        klem = self.cockpit()
        return {"zadel": zadel, "stuur": klem, "pedaal": pedaal, "trapas": self.M(0, 0)}
