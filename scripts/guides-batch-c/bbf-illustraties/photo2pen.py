"""photo2pen.py - foto naar pentekening in BestBikeFit4U-huisstijl. Alleen foto's met rechten gebruiken."""
import argparse
import math
import os
import random

import cv2
import numpy as np

KLEUR = {  # BGR
    "inkt": (0x20, 0x24, 0x0F),
    "lime": (0x6A, 0xF2, 0xCF),
    "petrol": (0x63, 0x72, 0x0A),
    "papier": (0xF3, 0xF8, 0xF5),
    "mint": (0xEE, 0xF2, 0xE1),
}


def xdog(gray, sigma=0.9, k=1.6, tau=0.985, eps=0.02, phi=12.0):
    g = gray.astype(np.float32) / 255.0
    g1 = cv2.GaussianBlur(g, (0, 0), sigma)
    g2 = cv2.GaussianBlur(g, (0, 0), sigma * k)
    d = g1 - tau * g2
    e = np.where(d >= eps, 1.0, 1.0 + np.tanh(phi * (d - eps)))
    return np.clip(e, 0, 1)


def hatch_layer(h, w, hoek, afstand, dikte=1, seed=0):
    rng = random.Random(seed)
    img = np.full((h, w), 255, np.uint8)
    diag = int(math.hypot(w, h)) + 20
    t = math.radians(hoek)
    ux, uy = math.cos(t), math.sin(t)
    nx, ny = -uy, ux
    cx, cy = w / 2, h / 2
    k = -diag / 2
    while k < diag / 2:
        pts = []
        for i in range(0, diag + 1, 24):
            s = i - diag / 2
            wob = math.sin(i * 0.02 + k) * 0.8
            pts.append([cx + nx * (k + wob) + ux * s, cy + ny * (k + wob) + uy * s])
        cv2.polylines(img, [np.array(pts, np.int32)], False, 0, dikte, cv2.LINE_AA)
        k += afstand * rng.uniform(0.85, 1.15)
    return img


def auto_masker(bgr, min_aandeel=0.02, max_aandeel=0.45):
    klein = cv2.resize(bgr, (0, 0), fx=0.25, fy=0.25)
    lab = cv2.cvtColor(klein, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
    _, labels, centers = cv2.kmeans(lab, 6, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1.0),
                                    3, cv2.KMEANS_PP_CENTERS)
    labels = labels.reshape(klein.shape[:2])
    beste, score = None, -1
    for i, c in enumerate(centers):
        aandeel = float((labels == i).mean())
        chroma = math.hypot(c[1] - 128, c[2] - 128)
        if min_aandeel <= aandeel <= max_aandeel and chroma > score:
            beste, score = i, chroma
    if beste is None or score < 12:
        return None
    m = (labels == beste).astype(np.uint8) * 255
    m = cv2.resize(m, (bgr.shape[1], bgr.shape[0]), interpolation=cv2.INTER_LINEAR)
    m = cv2.GaussianBlur(m, (0, 0), max(2.0, bgr.shape[1] / 300))
    m = ((m > 127) * 255).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats((m > 0).astype(np.uint8), 8)
    if n <= 1:
        return None
    grootste = stats[1:, cv2.CC_STAT_AREA].max()
    houd = np.zeros(n, bool)
    houd[1:] = stats[1:, cv2.CC_STAT_AREA] >= grootste * 0.25
    return (houd[lab] * 255).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("foto")
    ap.add_argument("uit", help="pad zonder extensie")
    ap.add_argument("--breedte", type=int, default=1600)
    ap.add_argument("--accent", default="auto", choices=["auto", "geen"])
    ap.add_argument("--masker")
    ap.add_argument("--accent-kleur", default="lime", choices=["lime", "petrol"])
    ap.add_argument("--lijn", type=float, default=1.0)
    ap.add_argument("--arcering", type=float, default=1.0)
    ap.add_argument("--was", action="store_true")
    a = ap.parse_args()

    bgr = cv2.imread(a.foto)
    if bgr is None:
        raise SystemExit("Kan foto niet lezen: " + a.foto)
    h0, w0 = bgr.shape[:2]
    W = a.breedte
    H = int(h0 * W / w0)
    bgr = cv2.resize(bgr, (W, H), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
    zacht = cv2.bilateralFilter(gray, 11, 60, 11)
    zacht = cv2.bilateralFilter(zacht, 9, 40, 9)

    schaal = W / 1600
    lijnen = xdog(zacht, sigma=1.1 * schaal * a.lijn + 0.3, eps=0.012, phi=22.0)
    inkt_lijn = 1.0 - lijnen
    binair = (inkt_lijn > 0.5).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(binair, 8)
    min_px = int(40 * schaal * schaal) + 8
    houd = np.zeros(n, bool)
    houd[1:] = stats[1:, cv2.CC_STAT_AREA] >= min_px
    inkt_lijn = inkt_lijn * houd[lab]

    toon = cv2.GaussianBlur(zacht, (0, 0), 4 * schaal + 1).astype(np.float32)
    lo, hi = np.percentile(toon, 3), np.percentile(toon, 97)
    toon = np.clip((toon - lo) / max(1.0, hi - lo), 0, 1)
    afst = max(5, int(9 * schaal))
    inkt_arc = np.zeros((H, W), np.float32)
    if a.arcering > 0:
        niveaus = [(0.38, 45, afst * 1.3), (0.24, -45, afst * 1.15), (0.12, 0, afst)]
        for i, (grens, hoek, gap) in enumerate(niveaus):
            laag = (255 - hatch_layer(H, W, hoek, gap / a.arcering, 1, seed=i)).astype(np.float32) / 255.0
            zone = np.clip((grens - toon) / 0.06, 0, 1)
            inkt_arc = np.maximum(inkt_arc, laag * zone * 0.62)

    masker = None
    if a.masker:
        m = cv2.imread(a.masker, cv2.IMREAD_GRAYSCALE)
        masker = cv2.resize(m, (W, H), interpolation=cv2.INTER_NEAREST)
    elif a.accent == "auto":
        masker = auto_masker(bgr)

    out = np.zeros((H, W, 3), np.float32)
    out[:] = KLEUR["papier"]
    if a.was:
        was = np.clip((0.7 - toon) / 0.25, 0, 1)[..., None] * 0.6
        out = out * (1 - was) + np.array(KLEUR["mint"], np.float32) * was
    if masker is not None:
        dx, dy = int(6 * schaal) + 1, int(5 * schaal) + 1
        mk = cv2.warpAffine(masker, np.float32([[1, 0, dx], [0, 1, dy]]), (W, H))
        mk = cv2.GaussianBlur(mk, (0, 0), 1.2).astype(np.float32)[..., None] / 255.0
        out = out * (1 - mk) + np.array(KLEUR[a.accent_kleur], np.float32) * mk
    inkt = np.clip(np.maximum(inkt_lijn, inkt_arc), 0, 1)[..., None]
    out = out * (1 - inkt) + np.array(KLEUR["inkt"], np.float32) * inkt
    out = np.clip(out, 0, 255).astype(np.uint8)

    os.makedirs(os.path.dirname(os.path.abspath(a.uit)), exist_ok=True)
    cv2.imwrite(a.uit + ".png", out)
    cv2.imwrite(a.uit + ".webp", out, [cv2.IMWRITE_WEBP_QUALITY, 88])
    print("klaar:", a.uit + ".png", "(accent:", "ja" if masker is not None else "nee", ")")


if __name__ == "__main__":
    main()
