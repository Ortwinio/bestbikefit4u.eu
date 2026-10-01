import math
import json
import sys
import subprocess
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "guides-batch-c" / "bbf-illustraties"))
from pen import Pen
from fiets import Fiets

OUTPUT = Path("public/illustrations/guides")
REVIEW = Path("plans/redesign-canvas/code-renders/44b-B")
OUTPUT.mkdir(parents=True, exist_ok=True)
REVIEW.mkdir(parents=True, exist_ok=True)
RIDER_CHECKS = []


def outline(pen, points, color="wit", hatch=False):
    pen.fill(points, color)
    pen.poly(points, w=2.4)
    if hatch:
        pen.hatch(points, hoek=45, afstand=9, w=0.8, opacity=0.5)


def composite(pen, foreground):
    prefix = f"front{len(pen.defs)}-"
    def unique(value):
        return value.replace('id="clip', f'id="{prefix}clip').replace('url(#clip', f'url(#{prefix}clip')
    pen.defs.extend(unique(value) for value in foreground.defs)
    for layer in ["vlak", "arcering", "inkt"]:
        pen.layers["inkt"].extend(unique(value) for value in foreground.layers[layer])


def smooth(pen, points, color="wit"):
    contour = []
    for index, start in enumerate(points):
        before = points[index - 1]
        end = points[(index + 1) % len(points)]
        after = points[(index + 2) % len(points)]
        control_a = (start[0] + (end[0] - before[0]) / 6, start[1] + (end[1] - before[1]) / 6)
        control_b = (end[0] - (after[0] - start[0]) / 6, end[1] - (after[1] - start[1]) / 6)
        contour.extend(pen.bezier_pts(start, control_a, control_b, end, n=12)[:-1])
    outline(pen, contour, color)


def ground(pen, center=(800, 864), radius=570):
    region = pen.ellipse_pts(center, radius, 17)
    pen.fill(region, "mint", offset=(0, 0))
    pen.hatch(region, hoek=0, afstand=6, w=0.8, kleur="petrol")
    pen.line((center[0] - radius, center[1]), (center[0] + radius, center[1]), w=1.5)


def joint(start, end, upper, lower, bend=-1):
    distance = math.dist(start, end)
    if not abs(upper - lower) < distance < upper + lower:
        raise ValueError("Unreachable rider contact")
    along = (upper ** 2 - lower ** 2 + distance ** 2) / (2 * distance)
    height = math.sqrt(upper ** 2 - along ** 2)
    direction = ((end[0] - start[0]) / distance, (end[1] - start[1]) / distance)
    return (start[0] + along * direction[0] - bend * height * direction[1],
            start[1] + along * direction[1] + bend * height * direction[0])


def limb(pen, start, middle, end, width):
    foreground = Pen(1600, 1000, seed=72, papier=False, wobble=0.7, offset=(0, 0))
    foreground.tube(start, middle, width, "wit")
    foreground.tube(middle, end, width * 0.73, "wit")
    foreground.fill_circle(middle, width / 2, "wit", offset=(0, 0))
    foreground.circle(middle, width / 2, w=1.5)
    composite(pen, foreground)


def rider(pen, bike, points, upright=0, back_accent=False, aero=False, standing=False):
    foreground = Pen(1600, 1000, seed=71, papier=False, wobble=1, offset=(0, 0))
    scale = bike.s
    def offset(point, horizontal, vertical):
        return (point[0] + horizontal * scale, point[1] + vertical * scale)

    saddle, cockpit, pedal, bracket = (points[key] for key in ["zadel", "stuur", "pedaal", "trapas"])
    hip = offset(saddle, 0, -32) if not standing else offset(bracket, -65, -730)
    shoulder = offset(hip, 350 - upright / 4, -265 - upright / 2)
    if aero:
        shoulder = offset(hip, 415, -165)
    if standing:
        shoulder = offset(hip, 265, -245)
    hand = offset(cockpit, 90, -8)
    if bike.soort == "gravel":
        hand = offset(cockpit, 130, 0)
    if aero:
        hand = offset(cockpit, 195, -90)
    ankle = offset(pedal, -65, -48)
    knee = joint(hip, ankle, 410 * scale, 410 * scale)
    elbow = joint(shoulder, hand, 310 * scale, 300 * scale, bend=1)
    errors = [abs(math.dist(start, end) / scale - length) for start, end, length in
              [(hip, knee, 410), (knee, ankle, 410),
               (shoulder, elbow, 310), (elbow, hand, 300)]]
    assert max(errors) < 0.000001
    assert abs(math.dist(bracket, pedal) / scale - 172) < 0.000001
    RIDER_CHECKS.append({"standing": standing, "aero": aero, "scale": scale,
                         "saddle": saddle, "bracket": bracket, "pedal": pedal,
                         "hip": hip, "knee": knee, "ankle": ankle,
                         "shoulder": shoulder, "elbow": elbow, "hand": hand,
                         "max_segment_error_mm": max(errors),
                         "shoe_sole_y": pedal[1] - 9 * scale})
    limb(foreground, hip, knee, ankle, 66 * scale)
    shoe = [offset(ankle, -34, -7), offset(ankle, 15, -12),
            offset(pedal, 57, -29), offset(pedal, 64, -9),
            offset(pedal, -96, -9), offset(ankle, -38, 12)]
    smooth(foreground, shoe, "petrol")
    torso = [offset(hip, -37, -5), offset(hip, -22, -68),
             offset(shoulder, -44, -32), offset(shoulder, 28, -14),
             offset(shoulder, 25, 55), offset(hip, 52, 22)]
    clothing = Pen(1600, 1000, seed=73, papier=False, wobble=1, offset=(0, 0))
    smooth(clothing, torso, "mint")
    shorts = [offset(hip, -37, -22), offset(hip, 23, -31),
              offset(hip, 71, 27), offset(hip, 36, 49), offset(hip, -35, 24)]
    smooth(clothing, shorts, "petrol")
    clothing.hatch(shorts, hoek=45, afstand=7, w=0.8, opacity=0.45)
    composite(foreground, clothing)
    if aero:
        foreground.line(cockpit, offset(elbow, 0, 18), w=7, kleur="petrol")
        foreground.line(offset(elbow, 0, 18), hand, w=7, kleur="petrol")
        foreground.line(offset(elbow, -32, 18), offset(elbow, 32, 18), w=9, kleur="petrol")
    limb(foreground, shoulder, elbow, hand, 37 * scale)
    foreground.fill_circle(hand, 14 * scale, "wit", offset=(0, 0))
    foreground.circle(hand, 14 * scale, w=1.6)
    head = offset(shoulder, 65, -105)
    foreground.tube(offset(shoulder, 25, -13), offset(head, -12, 36), 36 * scale, "wit")
    foreground.fill(foreground.ellipse_pts(head, 48 * scale, 62 * scale), "wit")
    foreground.ellipse(head, 48 * scale, 62 * scale)
    foreground.arc(head, 60 * scale, math.pi, 2 * math.pi, w=2.4)
    foreground.line(offset(head, -60, 0), offset(head, 60, 0), w=1.4)
    foreground.polyline([offset(head, 46, -22), offset(head, 61, 4), offset(head, 46, 10)], w=1.4)
    if back_accent:
        zone = [offset(hip, -30, -28), offset(hip, -15, -74),
                offset(hip, 43, -108), offset(hip, 63, -72)]
        highlight = Pen(1600, 1000, seed=74, papier=False, wobble=1, offset=(0, 0))
        highlight.fill(zone, "lime", offset=(0, 0))
        highlight.poly(zone, w=1.4)
        composite(foreground, highlight)
    composite(pen, foreground)
    return {"hip": hip, "shoulder": shoulder, "hand": hand, "elbow": elbow,
            "knee": knee, "ankle": ankle, "pedal": pedal, "saddle": saddle}


def bicycle(pen, scale=0.54, origin=(724, 720), frame="mint", upright=0, **kwargs):
    bike = Fiets(pen, *origin, scale, frame=frame, spaken=18)
    points = bike.teken()
    body = rider(pen, bike, points, upright=upright, **kwargs)
    ground(pen, (origin[0] + 90 * scale, origin[1] + 270 * scale), 800 * scale)
    return bike, points, body


def accent(pen, center, radius=16):
    foreground = Pen(1600, 1000, seed=83, papier=False, wobble=1)
    foreground.fill_circle(center, radius, "lime", offset=(0, 0))
    foreground.circle(center, radius, kleur="petrol", w=1.4)
    composite(pen, foreground)


def clock(pen, center, radius=86):
    pen.fill_circle(center, radius, "wit")
    pen.circle(center, radius)
    for index in range(12):
        angle = index * math.pi / 6
        pen.line((center[0] + math.sin(angle) * radius * 0.85,
                  center[1] - math.cos(angle) * radius * 0.85),
                 (center[0] + math.sin(angle) * radius * 0.96,
                  center[1] - math.cos(angle) * radius * 0.96), w=1.2)
    pen.line(center, (center[0] + radius * 0.47, center[1] - radius * 0.35), kleur="petrol", w=3)
    pen.line(center, (center[0], center[1] - radius * 0.69), kleur="petrol", w=2)


def save(pen, name, alt):
    pen.save(str(OUTPUT / name), alt)
    (OUTPUT / f"{name}.png").replace(REVIEW / f"{name}.png")
    subprocess.run([sys.executable, "scripts/images/archive-guide-source.py",
                    str(OUTPUT / f"{name}.svg")], check=True)
    for record in RIDER_CHECKS:
        if "illustration" not in record:
            record["illustration"] = name


pen = Pen(1600, 1000, seed=21, wobble=1)
shoe = [(270, 560), (295, 423), (374, 377), (431, 455), (673, 478),
        (907, 405), (1101, 426), (1250, 501), (1334, 602), (1230, 653), (484, 671), (297, 637)]
smooth(pen, shoe, "mint")
foot = [(330, 544), (349, 444), (404, 455), (427, 523), (730, 546),
        (904, 470), (1066, 481), (1200, 532), (1232, 574), (1098, 601), (478, 613)]
smooth(pen, foot)
pressure = pen.ellipse_pts((988, 601), 140, 20)
pen.fill(pressure, "lime")
pen.ellipse((988, 601), 140, 20, w=1.6)
pen.bezier((1082, 511), (1130, 503), (1152, 535), (1177, 554), w=1.2)
pen.bezier((1065, 537), (1102, 518), (1158, 553), (1172, 573), w=1.1)
pen.polyline([(284, 621), (498, 656), (1228, 640), (1322, 604)], w=4)
outline(pen, [(866, 664), (1063, 660), (1035, 712), (891, 717)], "petrol", True)
pen.arrow((1218, 545), (1290, 545), kop=11)
pen.arrow((902, 749), (1045, 749), kop=13)
ground(pen, (803, 814), 560)
save(pen, "21-gevoelloze-tenen", "Doorsnede van een fietsschoen met teenruimte, voorvoetdruk en schoenplaatje")

pen = Pen(1600, 1000, seed=22, wobble=1)
bike, points, body = bicycle(pen, upright=80)
accent(pen, body["hip"], 18)
pen.arc(body["hip"], 89, -1.08, 0.92, kleur="petrol", w=2.2)
pen.arrow((1110, 420), (1110, 310), twee=False)
pen.line((1030, 420), (1150, 420), kleur="petrol", dash="8 7", w=1.4)
save(pen, "22-beperkte-flexibiliteit", "Fietser met hogere romp, aangegeven heuphoek en opwaartse pijl bij de cockpit")

pen = Pen(1600, 1000, seed=23, wobble=1)
bike, points, body = bicycle(pen, back_accent=True)
pen.arrow((points["zadel"][0], 890), (points["stuur"][0], 890))
pen.arrow((1210, points["zadel"][1]), (1210, points["stuur"][1]))
pen.line(points["zadel"], (1210, points["zadel"][1]), kleur="petrol", dash="8 7", w=1.1)
save(pen, "23-lage-rugpijn", "Lage rug van een fietser gemarkeerd met maatpijlen voor stuurafstand en stuurdrop")

pen = Pen(1600, 1000, seed=24, wobble=1)
climbing = Pen(1600, 1000, seed=241, papier=False, wobble=1)
bike, points, body = bicycle(climbing, scale=0.46, origin=(575, 594))
accent(climbing, points["pedaal"], 15)
pen.defs.extend(climbing.defs)
pen.layers["inkt"].append('<g transform="translate(100 14) rotate(-14 575 720)">')
for layer in ["vlak", "arcering", "inkt"]:
    pen.layers["inkt"].extend(climbing.layers[layer])
pen.layers["inkt"].append('</g>')
profile = [(190, 887), (448, 844), (713, 739), (984, 619), (1284, 460), (1430, 430)]
pen.polyline(profile, w=3)
pen.line((190, 887), (1425, 887), kleur="petrol", dash="8 7", w=1.4)
pen.arrow((1425, 882), (1425, 445))
clock(pen, (1270, 237), 92)
save(pen, "24-klimtijd", "Fietser boven een stijgend routeprofiel met hoogteverschil, afstandslijn en klok")

pen = Pen(1600, 1000, seed=25, wobble=1)
bike, points, body = bicycle(pen, upright=45)
accent(pen, points["zadel"], 17)
pen.circle(body["hand"], 27, kleur="petrol", w=1.6)
pen.arrow((1180, points["zadel"][1]), (1180, points["stuur"][1]), kop=9)
clock(pen, (1305, 255), 74)
save(pen, "25-lange-ritten", "Fietser in ontspannen duurhouding met zadelsteun, handcontact en beperkte stuurdrop")

pen = Pen(1600, 1000, seed=26, wobble=1)
bike = Fiets(pen, 655, 618, 0.62, frame="mint", spaken=16)
points = bike.teken()
rear = bike.M(*bike.g["achter"])
trainer = Pen(1600, 1000, seed=261, papier=False, wobble=1)
outline(trainer, [(rear[0] - 43, rear[1] + 7), (rear[0] + 43, rear[1] + 7),
                  (rear[0] + 115, 840), (rear[0] - 115, 840)], "petrol", True)
trainer.circle(rear, 19, kleur="mint", w=2)
composite(pen, trainer)
accent(pen, points["trapas"], 23)
outline(pen, [(1190, 539), (1395, 539), (1395, 756), (1190, 756)], "wit")
pen.polyline([(1213, 701), (1252, 661), (1285, 662), (1315, 653), (1370, 652)], kleur="petrol", w=2)
clock(pen, (1290, 285), 86)
ground(pen, (729, 856), 585)
save(pen, "26-ftp-meten", "Fiets op trainer met gemarkeerde vermogensmeter, meetcurve en klok zonder prestatielabel")

pen = Pen(1600, 1000, seed=27, wobble=1)
first = Fiets(pen, 736, 691, 0.77, frame="mint", spaken=12, bidon=False)
first.teken()
second = Pen(1600, 1000, seed=270, papier=False, wobble=1)
second.polyline([(590, 163), (646, 294), (736, 691), (1120, 196), (590, 163)], kleur="petrol", dash="9 8", w=2)
second.line((585, 160), (746, 163), kleur="petrol", w=7)
second.line((1118, 199), (1231, 179), kleur="petrol", w=8)
composite(pen, second)
pen.fill_circle((736, 691), 21, "lime")
pen.arrow((563, 180), (563, 135), kop=10)
pen.arrow((1152, 275), (1230, 275), kop=10)
ground(pen, (785, 911), 625)
save(pen, "27-fietsen-vergelijken", "Twee afstellingen vanuit dezelfde trapas met verschillende zadel- en stuurcontactpunten")

class MountainBike(Fiets):
    def cockpit(self):
        top = self.g["stuurbuis_top"]
        stem = self.M(top[0] + 58, top[1] + 53)
        self.p.tube(self.M(*top), stem, 25 * self.s, "petrol")
        self.p.line((stem[0] - 20, stem[1]), (stem[0] + 79, stem[1] - 7), w=12 * self.s, kleur="petrol")
        self.p.line((stem[0] + 22, stem[1] + 6), (stem[0] + 74, stem[1] + 13), w=2)
        return stem


pen = Pen(1600, 1000, seed=28, wobble=1)
for origin_x, is_standing in [(424, False), (1130, True)]:
    bike = MountainBike(pen, origin_x, 651, 0.36, soort="gravel", frame="lime", bidon=False, spaken=12)
    bike.g = {**bike.g, "stuurbuis_top": (390, 630), "stuurbuis_onder": (451, 430)}
    points = bike.teken()
    body = rider(pen, bike, points, standing=is_standing)
    ground(pen, (origin_x + 35, 760), 310)
pen.arrow((1035, 331), (1035, 485), twee=False)
save(pen, "28-mountainbike-afstellen", "Mountainbiker zittend en staand boven een vlak stuur met zichtbare bewegingsruimte")

pen = Pen(1600, 1000, seed=29, wobble=1)
bike, points, body = bicycle(pen)
accent(pen, bike.M(bike.g["voor"][0], bike.g["voor"][1] - bike.g["band"]), 19)
for offset in [0, 65, 130]:
    pen.arrow((1430, 310 + offset), (1155, 310 + offset), twee=False)
pen.arc((500, 890), 47, math.pi, 2 * math.pi, kleur="petrol", w=2)
pen.arrow((425, 887), (568, 887), kop=11)
save(pen, "29-vermogen-snelheid", "Fietser met tegenwindpijlen en gemarkeerd bandencontact voor lucht- en rolweerstand")

pen = Pen(1600, 1000, seed=30, wobble=1)
bike, points, body = bicycle(pen)
for contact in [points["zadel"], points["pedaal"], body["hand"]]:
    accent(pen, contact, 15)
    pen.circle(contact, 27, kleur="petrol", w=1.3)
save(pen, "30-racefiets-afstellen", "Fietser op racefiets met zadel, remgrepen en pedaal als drie gemarkeerde contactpunten")

pen = Pen(1600, 1000, seed=31, wobble=1)
bike = Fiets(pen, 711, 676, 0.75, frame="mint", spaken=16)
bike.g = {**bike.g, "stuurbuis_top": (401, 515), "stuurbuis_onder": (432, 410)}
points = bike.teken()
pen.fill_circle(points["trapas"], 19, "lime")
pen.arrow((points["trapas"][0] - 35, points["trapas"][1]),
          (points["zadel"][0] - 35, points["zadel"][1]))
pen.arrow((points["zadel"][0], 125), (points["stuur"][0], 125))
pen.arrow((1260, points["zadel"][1]), (1260, points["stuur"][1]), kop=9)
pen.line(points["zadel"], (1280, points["zadel"][1]), kleur="petrol", dash="8 7", w=1.1)
pen.line(points["stuur"], (1280, points["stuur"][1]), kleur="petrol", dash="8 7", w=1.1)
pen.arrow((points["trapas"][0] + 42, points["trapas"][1]),
          (points["pedaal"][0] + 42, points["pedaal"][1]), kop=10)
ground(pen, (800, 896), 622)
save(pen, "31-afstelmaten", "Racefiets met afzonderlijke maatpijlen voor zadelhoogte, stuurafstand, drop en cranklengte")

pen = Pen(1600, 1000, seed=32, wobble=1)
bike, points, body = bicycle(pen, aero=True)
accent(pen, body["elbow"], 18)
pen.arc(body["hip"], 90, -0.52, 0.85, kleur="petrol", w=2)
pen.arrow((points["zadel"][0], 875), (body["elbow"][0], 875))
save(pen, "32-triatlonhouding", "Triatleet op armsteunen met heuphoek en afstand tussen zadel en armsteunen")

from PIL import Image, ImageDraw

sheet = Image.new("RGB", (1600, 855), "white")
captions = ImageDraw.Draw(sheet)
heroes = sorted(path for path in REVIEW.glob("[23][0-9]-*.png") if not path.stem.endswith("-390"))
for index, path in enumerate(heroes):
    thumbnail = Image.open(path)
    mobile = thumbnail.resize((390, 244), Image.Resampling.LANCZOS)
    mobile.save(REVIEW / f"{path.stem}-390.png")
    thumbnail.thumbnail((400, 250))
    position = ((index % 4) * 400, (index // 4) * 285)
    sheet.paste(thumbnail, position)
    captions.text((position[0] + 12, position[1] + 258), path.stem, fill="black")
sheet.save(REVIEW / "illustrations-contact.png")
Path("plans/redesign-canvas/audit/44b-B.1-geometry.json").write_text(
    json.dumps(RIDER_CHECKS, indent=2) + "\n")
