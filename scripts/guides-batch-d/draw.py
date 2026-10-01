"""Twelve guide heroes using the required route-B pen/fiets engine. No photos or image text."""
from pathlib import Path
import math
import sys
import subprocess
sys.path.insert(0, str(Path(__file__).parents[1] / "guides-batch-c/bbf-illustraties"))
from pen import Pen
from fiets import Fiets
from rider_geometry import pose, offset
OUT = Path("public/illustrations/guides")
REVIEW = Path("plans/redesign-canvas/code-renders/44b-D")
OUT.mkdir(parents=True, exist_ok=True)
REVIEW.mkdir(parents=True, exist_ok=True)


def shape(p, pts, color="wit"):
    p.fill(pts, color)
    p.poly(pts, w=2.5)


def ground(p, y=855, width=610):
    pts = p.ellipse_pts((800, y), width, 24)
    p.fill(pts, "mint", offset=(0, 0))
    p.hatch(pts, hoek=0, afstand=7, w=.8, kleur="petrol")
    p.line((800-width, y), (800+width, y), w=1.6)


def save(p, name, alt):
    p.save(str(OUT/name), alt)
    (OUT/f"{name}.png").replace(REVIEW/f"{name}.png")
    subprocess.run([sys.executable, "scripts/images/archive-guide-source.py",
                    str(OUT / f"{name}.svg")], check=True)


def flatten_layers(p):
    """Keep previous objects behind new fills without changing the shared pen engine."""
    p.layers["vlak"] += p.layers["arcering"] + p.layers["inkt"]
    p.layers["arcering"] = []
    p.layers["inkt"] = []


def draw_rider(p, contacts, scale, focus="neck", posture="road"):
    flatten_layers(p)
    p.offset = (0, 0)
    joints = pose(contacts, scale, posture)
    hip, knee, ankle = [joints[key] for key in ["hip", "knee", "ankle"]]
    shoulder, elbow, hand = [joints[key] for key in ["shoulder", "elbow", "hand"]]

    # Filled connected silhouettes cover the frame behind the near-side body.
    p.tube(hip, shoulder, 112 * scale, "wit")
    flatten_layers(p)
    p.fill_circle(hip, 55 * scale, "wit", offset=(0, 0))
    p.tube(hip, knee, 87 * scale, "wit")
    flatten_layers(p)
    p.fill_circle(knee, 37 * scale, "wit", offset=(0, 0))
    p.tube(knee, ankle, 57 * scale, "wit")
    p.circle(knee, 37 * scale, w=1.4)
    flatten_layers(p)
    p.fill_circle(ankle, 27 * scale, "wit", offset=(0, 0))
    # The ball of the shoe rests exactly on the top of the already drawn pedal.
    pedal = joints["pedal"]
    shoe = [offset(pedal, x, y, scale) for x, y in
            [(-139, -9), (-145, -51), (-105, -75), (-64, -40), (39, -30), (57, -9)]]
    shape(p, shoe, "wit")
    p.line(offset(pedal, -139, -9, scale), offset(pedal, 57, -9, scale), w=2, kleur="petrol")
    p.hatch(shoe, hoek=25, afstand=max(3, 9 * scale), w=.7)

    flatten_layers(p)
    neck = offset(shoulder, 40, -59, scale)
    p.tube(shoulder, neck, 55 * scale, "lime" if focus == "neck" else "wit")
    head = offset(neck, 44, -62, scale)
    shape(p, p.ellipse_pts(head, 65 * scale, 73 * scale, rot=.25))
    p.arc(head, 70 * scale, math.pi, math.pi * 1.95, w=2)
    p.poly([offset(head, 55, -15, scale), offset(head, 77, 8, scale),
            offset(head, 59, 18, scale)], w=1.5)
    flatten_layers(p)
    p.fill_circle(shoulder, 40 * scale, "lime" if focus == "neck" else "wit", offset=(0, 0))
    p.tube(shoulder, elbow, 58 * scale, "wit")
    flatten_layers(p)
    p.fill_circle(elbow, 27 * scale, "wit", offset=(0, 0))
    p.tube(elbow, hand, 45 * scale, "wit")
    p.circle(elbow, 25 * scale, w=1.2)
    flatten_layers(p)
    p.fill_circle(hand, 25 * scale, "wit", offset=(0, 0))
    p.circle(hand, 25 * scale, w=1.5)

    if focus == "tall":
        z, bb = joints["saddle"], joints["bb"]
        p.arrow(offset(z, -130, 0, scale), offset(bb, -130, 0, scale), kop=11)
        p.arrow(offset(z, 0, 115, scale), offset(hand, 0, 115, scale), kop=11)
        p.fill_circle(z, 16 * scale, "lime", offset=(0, 0))
    elif focus == "contacts":
        for point in [shoulder, hand, joints["saddle"], knee, pedal]:
            p.fill_circle(point, 22 * scale, "lime", offset=(0, 0))
            p.circle(point, 25 * scale, kleur="petrol", w=1.3)
    return joints


def rider(p, focus="neck", scale=.62):
    ground(p, y=943, width=650)
    bike = Fiets(p, 670, 755, scale, frame="wit", tape="petrol", bidon=False)
    contacts = bike.teken()
    draw_rider(p, contacts, scale, focus)
    return bike


p=Pen(1600,1000,seed=45,wobble=1)
rider(p)
save(p,"45-nek-en-schouders","Fietser met gebogen armen en een gemarkeerde nekzone bij de afstand tot het stuur")
p=Pen(1600,1000,seed=46,wobble=1)
rider(p,"tall")
save(p,"46-lange-fietser","Fietser met maatpijlen langs de zadelhoogte en tussen het zadel en de remgrepen")


def bottle(p,x,y,s=1,color="lime"):
    def M(a,b): return (x+a*s,y+b*s)
    shape(p,[M(-76,0),M(-83,48),M(-100,91),M(-97,350),M(-76,380),M(78,380),
             M(99,350),M(100,91),M(83,48),M(76,0)],color)
    shape(p,[M(-76,-30),M(76,-30),M(76,6),M(-76,6)],"petrol")
    shape(p,[M(-26,-50),M(26,-50),M(26,-30),M(-26,-30)])
    for dy in [135,215,280]: p.line(M(-90,dy),M(90,dy),w=1.2)
    p.hatch([M(65,85),M(94,95),M(92,349),M(65,367)],afstand=9,w=.8)


def banana(p,x,y,s=1):
    M=lambda a,b:(x+a*s,y+b*s)
    top=p.bezier_pts(M(-160,-50),M(-90,85),M(100,118),M(220,-45))
    bottom=p.bezier_pts(M(220,-45),M(159,164),M(-97,162),M(-160,-50))
    shape(p,top+bottom[1:],"wit")
    p.bezier(M(-134,-11),M(-18,117),M(102,124),M(196,-8),w=1.2)
    p.line(M(-164,-53),M(-171,-78),w=7,kleur="petrol")


def packet(p,x,y,s=1):
    M=lambda a,b:(x+a*s,y+b*s)
    shape(p,[M(-75,0),M(67,-18),M(91,188),M(-61,207)],"mint")
    for dy in [8,192]: p.line(M(-58,dy),M(64,dy-14),w=1.2)
    p.circle(M(10,92),28,w=1.2,kleur="petrol")


p=Pen(1600,1000,seed=47,wobble=1)
ground(p)
bottle(p,550,360)
banana(p,1000,710,1.15)
packet(p,1080,430,.9)
p.circle((890,245),117)
p.circle((890,245),106,w=1.2)
for i in range(12):
    a=i*math.pi/6
    p.line((890+98*math.sin(a),245-98*math.cos(a)),(890+89*math.sin(a),245-89*math.cos(a)),w=1.3)
p.line((890,245),(890,175),w=2)
p.line((890,245),(943,276),w=2)
save(p,"47-koolhydraten-onderweg","Bidon, banaan en voedselzakje naast een klok zonder doseringscijfers")
p=Pen(1600,1000,seed=48,wobble=1)
ground(p)
# Jersey rear pocket with accessible food, separate drinking bottle and wrapper.
shape(p,[(268,290),(474,236),(737,290),(799,772),(227,772)],"wit")
p.hatch([(249,672),(768,672),(778,752),(239,752)],afstand=11,w=.8)
packet(p,397,432,.75)
banana(p,637,490,.55)
shape(p,[(251,570),(773,570),(782,760),(240,760)],"mint")
for x in [414,603]: p.line((x,578),(x,746),w=1.2)
bottle(p,1118,367,1,"lime")
p.arrow((417,420),(417,310),twee=False)
save(p,"48-eten-tijdens-fietsen","Achterzak van een fietsshirt met eten binnen handbereik en een bidon ernaast")
p=Pen(1600,1000,seed=49,wobble=1)
shape(p,[(410,165),(1123,165),(1123,855),(410,855)],"wit")
foot=p.bezier_pts((692,793),(541,762),(632,605),(603,482))
foot+=p.bezier_pts((603,482),(547,380),(563,265),(635,244))[1:]
foot+=p.bezier_pts((635,244),(659,172),(707,181),(724,242))[1:]
foot+=p.bezier_pts((724,242),(779,213),(832,246),(840,306))[1:]
foot+=p.bezier_pts((840,306),(891,363),(851,472),(794,587))[1:]
foot+=p.bezier_pts((794,587),(752,681),(785,772),(692,793))[1:]
shape(p,foot,"mint")
p.arrow((511,203),(511,794))
p.arrow((565,384),(875,384))
shape(p,[(949,202),(1009,202),(1009,796),(949,796)],"lime")
for y in range(219,783,17): p.line((952,y),(971 if y%2 else 986,y),w=1.1)
p.tube((1194,370),(1228,812),17,"petrol")
save(p,"49-voet-opmeten","Voetomtrek op papier met lengte- en breedtepijlen en een meetlat naast de voet")
p=Pen(1600,1000,seed=50,wobble=1)
ground(p,y=902)
b=Fiets(p,730,1110,1.1,frame="wit",tape="lime",bidon=False)
b.g = dict(b.g, stuurbuis_top=(385, 480), stuurbuis_onder=(431, 397))
b.frameset()
z=b.zadel_en_pen(); h=b.cockpit()
for point in [z,h]: p.line(point,(1410,point[1]),kleur="petrol",dash="8 7",w=1.5)
p.arrow((1390,z[1]),(1390,h[1]),kop=11)
save(p,"50-stuurhoogte-en-drop","Zadel en stuur van opzij met horizontale hulplijnen en een verticale pijl voor drop")
p=Pen(1600,1000,seed=51,wobble=1)
ground(p,y=892)
b=Fiets(p,697,675,.73,frame="wit",bidon=False)
b.frameset();b.wiel(b.g["voor"]);b.aandrijving();b.zadel_en_pen();b.cockpit()
rear=b.M(*b.g["achter"])
shape(p,[(rear[0]-90,rear[1]-35),(rear[0]+90,rear[1]-35),(rear[0]+125,855),
         (rear[0]-132,855)],"lime")
p.circle(rear,83);p.circle(rear,60,w=1.5)
p.tube((rear[0],rear[1]+45),(rear[0]-145,864),24,"petrol")
p.tube((rear[0],rear[1]+45),(rear[0]+157,864),24,"petrol")
shape(p,[(1065,877),(1180,877),(1175,901),(1067,901)],"mint")
shape(p,[(674,330),(994,330),(994,365),(674,365)],"wit")
p.ellipse((834,347),23,9,kleur="petrol")
save(p,"51-fiets-op-trainer","Fiets op een trainer met voorwielsteun en een waterpas boven de bovenbuis")
p=Pen(1600,1000,seed=52,wobble=1)
rider(p,"contacts")
save(p,"52-pijn-en-contactpunten","Fietser met gemarkeerde zones bij schouder, hand, zadel, knie en voet")
p=Pen(1600,1000,seed=53,wobble=1)
ground(p,y=805,width=735)
for x, kind, posture in [(295, "race", "road"), (805, "gravel", "gravel"), (1305, "gravel", "flat")]:
    b = Fiets(p, x, 712, .27, soort=kind, frame="wit", tape="lime", bidon=False)
    if posture == "flat":
        b.wiel(b.g["achter"]); b.wiel(b.g["voor"]); b.frameset()
        pedal = b.aandrijving(); saddle = b.zadel_en_pen()
        grip = b.M(540, 640)
        p.tube(b.M(*b.g["stuurbuis_top"]), b.M(475, 640), 8, "petrol")
        p.line(b.M(450, 640), grip, w=7, kleur="lime")
        contacts = {"zadel": saddle, "stuur": grip, "pedaal": pedal, "trapas": b.M(0, 0)}
    else:
        contacts = b.teken()
    draw_rider(p, contacts, .27, focus="position", posture=posture)
    p.arrow((x-59, 766), (x+141, 766), kop=8)

save(p,"53-fietstype-en-houding","Drie schematische fietsposities met verschillende stuur- en contactpunthoogten")
p=Pen(1600,1000,seed=54,wobble=1)
ground(p,y=849,width=550)
b=Fiets(p,1375,2570,3.2,frame="wit",bidon=False)
z=b.zadel_en_pen()
p.arrow((330,361),(1250,361))
p.line((800,286),(1180,286),kleur="petrol",dash="8 7",w=1.4)
p.arc((820,306),192,-.23,.13,kleur="petrol",w=2)
p.arrow((999,261),(1007,329),twee=False,kop=10)
p.fill_circle((782,617),24,"lime")
save(p,"54-zadel-terugstand-kanteling","Zadel op rails met aparte pijlen voor horizontale verschuiving en kanteling")
p=Pen(1600,1000,seed=55,wobble=1)
ground(p)
bottle(p,520,356,1.1)
shape(p,[(842,372),(1087,372),(1072,753),(856,753)],"wit")
p.poly([(1084,421),(1165,425),(1161,637),(1082,649)],w=2)
for y in range(431,700,43): p.line((856,y),(904,y),kleur="petrol",w=1.5)
p.fill([(862,569),(1079,569),(1071,747),(857,747)],"mint")
p.ellipse((967,569),107,13,kleur="petrol",w=1.3)
p.tube((1120,296),(1365,210),17,"wit")
p.ellipse((1081,310),56,24,rot=-.3)
for x,y in [(1051,328),(1079,357),(1059,385),(1067,407)]:p.fill_circle((x,y),3,"petrol",offset=(0,0))
save(p,"55-natriumconcentratie",
     "Bidon naast een maatbeker en een kleine schep sportdrankpoeder om concentratie uit te leggen")
p=Pen(1600,1000,seed=56,wobble=1)
ground(p,y=825)
shape(p,[(240,326),(698,326),(720,791),(214,791)],"mint")
shape(p,[(329,386),(609,386),(609,492),(329,492)],"wit")
for x in [296,648]:p.line((x,558),(x,713),w=3,kleur="petrol")
p.circle((1147,528),218,w=2.5)
p.circle((1147,528),181,w=1.4)
for i in range(8):
    a=i*math.pi/4
    p.line((1147+86*math.cos(a),528+86*math.sin(a)),
           (1147+178*math.cos(a),528+178*math.sin(a)),w=2)
p.tube((1147,528),(1043,725),41,"lime")
p.circle((1147,528),36,w=2)
shape(p,[(983,710),(1102,710),(1102,752),(983,752)],"petrol")
p.arrow((780,530),(886,530),kop=12)
save(p,"56-gewicht-en-vermogen",
     "Weegschaal naast een crank met vermogensmeter als twee afzonderlijke metingen voor watt per kilo")
