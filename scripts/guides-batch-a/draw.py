import math
import sys
import subprocess
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "guides-batch-c/bbf-illustraties"))
from pen import Pen
from fiets import Fiets
from rider_geometry import rider_pose

OUT = Path("public/illustrations/guides")
REVIEW = Path("plans/redesign-canvas/code-renders/44b-A")
OUT.mkdir(parents=True, exist_ok=True)
REVIEW.mkdir(parents=True, exist_ok=True)


def shape(pen, points, color="wit", hatch=False):
    pen.fill(points, color, offset=(0, 0) if color == "wit" else None)
    pen.poly(points, w=2.4)
    if hatch:
        pen.hatch(points, hoek=55, afstand=10, w=.85, opacity=.45)


def smooth(pen, points, color="wit"):
    contour = []
    for index, start in enumerate(points):
        before = points[index - 1]
        end = points[(index + 1) % len(points)]
        after = points[(index + 2) % len(points)]
        control_one = (start[0] + (end[0] - before[0]) / 6, start[1] + (end[1] - before[1]) / 6)
        control_two = (end[0] - (after[0] - start[0]) / 6, end[1] - (after[1] - start[1]) / 6)
        contour.extend(pen.bezier_pts(start, control_one, control_two, end, n=12)[:-1])
    shape(pen, contour, color)


def overlay(pen, foreground):
    prefix = f"foreground{len(pen.defs)}-"
    def unique(value):
        return value.replace('id="clip', f'id="{prefix}clip').replace('url(#clip', f'url(#{prefix}clip')
    pen.defs.extend(unique(value) for value in foreground.defs)
    for layer in ["vlak", "arcering", "inkt"]:
        pen.layers["inkt"].extend(unique(value) for value in foreground.layers[layer])


def ground(pen, center=800, level=900, radius=570):
    ellipse = pen.ellipse_pts((center, level), radius, 18)
    pen.fill(ellipse, "mint", offset=(0, 0))
    pen.hatch(ellipse, hoek=0, afstand=5, w=.8, kleur="petrol")
    pen.line((center-radius, level), (center+radius, level), w=1.5)


def limb(pen, start, end, width):
    pen.tube(start, end, width, "wit", caps=False, schaduw=True)


def rider(pen, bike, points, short=False, knee_accent=False, torso_accent=False):
    foreground = Pen(1600, 1000, seed=191, papier=False, wobble=1)
    pose = rider_pose(points, bike.s, short)
    hip, knee, ankle = pose["hip"], pose["knee"], pose["ankle"]
    shoulder, elbow, hand = pose["shoulder"], pose["elbow"], pose["hand"]
    head, sole, pedal = pose["head"], pose["sole"], pose["pedal"]
    jersey = "lime" if short or torso_accent else "mint"
    foreground.tube(hip, shoulder, 92*bike.s, jersey, schaduw=True)
    limb(foreground, hip, knee, 70*bike.s)
    limb(foreground, knee, ankle, 44*bike.s)
    foreground.fill_circle(knee, 26*bike.s, "wit", offset=(0,0))
    foreground.circle(knee, 26*bike.s, w=1.8)
    shoe = [(ankle[0]-38*bike.s,sole[1]), (ankle[0]-37*bike.s,ankle[1]+7*bike.s),
            (ankle[0]-12*bike.s,ankle[1]-16*bike.s), (ankle[0]+23*bike.s,ankle[1]-10*bike.s),
            (pedal[0]+32*bike.s,sole[1]-22*bike.s), (pedal[0]+75*bike.s,sole[1]-12*bike.s),
            (pedal[0]+78*bike.s,sole[1]), sole]
    shape(foreground, shoe, "petrol")
    foreground.line((ankle[0]-38*bike.s,sole[1]), (pedal[0]+78*bike.s,sole[1]),w=2)
    limb(foreground, shoulder, elbow, 43*bike.s)
    limb(foreground, elbow, hand, 32*bike.s)
    foreground.fill_circle(elbow, 19*bike.s, "wit", offset=(0,0))
    foreground.circle(elbow, 19*bike.s, w=1.7)
    foreground.fill_circle(hand, 15*bike.s, "wit", offset=(0,0))
    foreground.circle(hand, 15*bike.s, w=1.7)
    neck_base = (shoulder[0]+8*bike.s,shoulder[1]-22*bike.s)
    neck_top = (head[0]-15*bike.s,head[1]+45*bike.s)
    limb(foreground,neck_base,neck_top,31*bike.s)
    foreground.fill(foreground.ellipse_pts(head, 44*bike.s, 58*bike.s), "wit", offset=(0,0))
    foreground.ellipse(head, 44*bike.s, 58*bike.s)
    foreground.arc(head, 55*bike.s, math.pi, 2*math.pi)
    foreground.line((head[0]-55*bike.s,head[1]),(head[0]+55*bike.s,head[1]),w=1.4)
    joints = Pen(1600,1000,seed=392,papier=False,wobble=1)
    joints.fill(joints.ellipse_pts((hip[0],hip[1]-8*bike.s),43*bike.s,25*bike.s),jersey,offset=(0,0))
    joints.ellipse((hip[0],hip[1]-8*bike.s),43*bike.s,25*bike.s,w=1.7)
    joints.fill_circle(shoulder,25*bike.s,jersey,offset=(0,0))
    joints.circle(shoulder,25*bike.s,w=1.7)
    overlay(foreground,joints)
    if knee_accent:
        foreground.fill_circle(knee, 29*bike.s, "lime", offset=(0,0))
        foreground.circle(knee, 29*bike.s, kleur="petrol", w=1.5)
    overlay(pen, foreground)
    return hip, knee, ankle, shoulder, hand


def save(pen, name, alt):
    pen.save(str(OUT / name), alt)
    (OUT / f"{name}.png").replace(REVIEW / f"{name}.png")
    subprocess.run([sys.executable, "scripts/images/archive-guide-source.py",
                    str(OUT / f"{name}.svg")], check=True)


def saddle_dimension(pen, points, offset=100):
    bottom = (points["trapas"][0]-offset, points["trapas"][1])
    top = (points["zadel"][0]-offset, points["zadel"][1])
    pen.arrow(bottom,top,w=2.8)
    pen.line(bottom,points["trapas"],kleur="petrol",dash="8 7",w=1.3)
    pen.line(top,points["zadel"],kleur="petrol",dash="8 7",w=1.3)


def bike_scene(seed, short=False, knee=False, frame="wit", seat_accent=False):
    pen = Pen(1600, 1000, seed=seed, wobble=1)
    ground(pen, level=914, radius=515)
    bike = Fiets(pen, 730, 730, .64, frame=frame, bidon=False)
    points = bike.teken()
    if seat_accent:
        seat_start = bike.g["zadelbuis_top"]
        seat_end = (seat_start[0]-.284*105,seat_start[1]+.959*105)
        pen.tube(bike.M(*seat_start),bike.M(*seat_end),27*bike.s,"lime",schaduw=True)
    body = rider(pen, bike, points, short=short, knee_accent=knee)
    return pen, bike, points, body


pen, bike, points, body = bike_scene(209, frame="lime")
saddle_dimension(pen,points)
pen.arrow((657,295), (1063,295))
pen.fill_circle(points["zadel"], 13, "lime")
pen.circle(points["zadel"], 13, w=1.4)
save(pen, "09-beginners-fietsafstelling", "Fietser met licht gebogen armen en maatpijlen voor zadelhoogte en stuurafstand")

pen, bike, points, body = bike_scene(210, short=True)
pen.arrow((670,263), (1075,263))
pen.line((990,289),(990,470), kleur="petrol", dash="8 7", w=1.5)
pen.line((1080,289),(1080,470), kleur="petrol", dash="8 7", w=1.5)
pen.arrow((990,330),(1080,330))
save(pen, "10-korte-romp-stuurafstand", "Fietser met korte romp en maatpijlen die twee mogelijke stuurafstanden vergelijken")

pen, bike, points, body = bike_scene(211, knee=True)
saddle_dimension(pen,points)
save(pen, "11-knie-pedaalbeweging", "Knie van een fietser gemarkeerd naast de maatlijn van trapas tot zadel")


def sole(pen, center=770, top=130, scale=1, color="wit"):
    def point(horizontal, vertical):
        return center + horizontal*scale, top + vertical*scale
    smooth(pen, [point(-63,0),point(-149,53),point(-174,176),point(-143,303),
        point(-93,427),point(-93,557),point(-47,622),point(46,622),
        point(92,566),point(93,414),point(143,278),point(151,149),point(103,40)], color)
    pen.bezier(point(-135,165), point(-124,300), point(-50,361), point(-65,516), w=1.2)
    pen.bezier(point(119,157), point(107,295), point(45,362), point(65,516), w=1.2)
    for vertical in [88,105,122]:
        pen.line(point(-84,vertical), point(88,vertical), w=1.1)
    return point


pen = Pen(1600,1000,seed=212,wobble=1)
point = sole(pen,center=800,top=110,scale=1.2)
shape(pen,[point(-78,193),point(73,193),point(96,302),point(-95,302)],"lime",True)
for center in [(-42,217),(42,217),(0,277)]:
    pen.ellipse(point(*center), 9, 17, w=1.4)
pen.arrow((1115,315),(1115,495))
pen.line((1060,315),(1130,315),kleur="petrol",dash="8 7",w=1.3)
pen.line((1060,495),(1130,495),kleur="petrol",dash="8 7",w=1.3)
pen.arc((800,425),225,-.65,.65,kleur="petrol",w=2)
pen.arrow((1015,332),(1034,384),twee=False)
ground(pen,level=900,radius=395)
save(pen,"12-schoenplaatjes-positie","Onderzijde fietsschoen met lime schoenplaatje en pijlen voor voor-achterpositie en rotatie")

pen = Pen(1600,1000,seed=213,wobble=1)
point = sole(pen,center=580,top=135,scale=1,color="wit")
smooth(pen,[(1020,177),(1110,150),(1200,185),(1240,289),(1200,409),(1155,501),
    (1160,689),(1100,759),(1030,722),(1014,542),(950,381),(956,253)],"lime")
pen.arrow((420,332),(730,332))
pen.arrow((952,323),(1236,323))
pen.arrow((1320,150),(1320,759))
ground(pen,level=837,radius=485)
save(pen,"13-fietsschoen-leestbreedte","Schoenzool naast een voetvorm met maatpijlen voor breedte en lengte")

pen = Pen(1600,1000,seed=214,wobble=1)
ground(pen,level=872,radius=635)
bike = Fiets(pen,815,680,.67,frame="lime",bidon=False)
bike.teken()
pen.arrow((815,680),(815,298))
pen.arrow((815,270),(1073,270))
pen.line((1073,270),(1073,298),kleur="petrol",dash="7 6",w=1.3)
pen.line((815,298),(1073,298),kleur="petrol",dash="7 6",w=1.3)
person = Pen(1600,1000,seed=314,papier=False)
person.fill_circle((296,188),45,"wit",offset=(0,0))
person.circle((296,188),45)
limb(person,(296,226),(296,262),23)
smooth(person,[(269,246),(321,246),(350,442),(324,514),(269,513),(242,443)],"mint")
limb(person,(279,513),(263,851),30)
limb(person,(318,513),(339,851),30)
shape(person,[(247,842),(273,842),(303,861),(303,872),(240,872)],"petrol")
shape(person,[(324,842),(350,842),(380,861),(380,872),(317,872)],"petrol")
limb(person,(264,285),(212,468),22)
limb(person,(327,285),(369,468),22)
person.fill_circle((212,468),13,"wit",offset=(0,0))
person.circle((212,468),13,w=1.4)
person.fill_circle((369,468),13,"wit",offset=(0,0))
person.circle((369,468),13,w=1.4)
overlay(pen,person)
pen.arrow((385,514),(385,837))
save(pen,"14-framemaat-meetpunten","Fietser naast fietsframe met binnenbeenmaat en aparte stack- en reachpijlen")

pen = Pen(1600,1000,seed=215,wobble=1)
pen.tube((550,480),(1050,480),38,"wit")
pen.tube((800,479),(800,713),40,"wit")
for direction in [-1,1]:
    center=800+direction*300
    pen.bezier((800+direction*250,480),(center+direction*65,480),
        (center+direction*112,373),(center+direction*57,324),w=24,kleur="petrol",texture=False)
    smooth(pen,[(center-34,327),(center-40,265),(center-24,183),
        (center+22,166),(center+50,203),(center+38,326)],"lime")
    pen.bezier((center+direction*40,205),(center+direction*90,270),
        (center+direction*76,334),(center+direction*59,378),w=3)
    pen.line((center,156),(center,546),kleur="petrol",dash="8 7",w=1.2)
pen.arrow((500,570),(1100,570))
pen.circle((800,480),24,w=1.7)
ground(pen,level=810,radius=455)
save(pen,"15-stuurbreedte-remgrepen","Racefietsstuur van boven met symmetrische remgrepen en een breedtemaat")

pen = Pen(1600,1000,seed=216,wobble=1)
smooth(pen,[(278,577),(317,444),(423,407),(577,446),(741,519),(934,548),
    (1142,544),(1242,583),(1267,627),(1186,650),(942,642),(770,604),
    (580,557),(414,614),(305,624)],"wit")
smooth(pen,[(275,685),(432,680),(587,610),(767,666),(946,694),(1206,699),
    (1272,733),(1182,752),(928,744),(765,718),(587,667),(431,722),(279,722)],"lime")
pen.hatch([(290,704),(429,704),(590,638),(758,691),(934,720),(1220,727),
    (1179,744),(928,735),(765,711),(587,660),(431,717),(290,717)],afstand=10,w=.9)
pen.arrow((574,547),(574,609))
pen.line((310,330),(1240,330),kleur="petrol",dash="8 7",w=1.3)
pen.arrow((1320,332),(1320,735))
ground(pen,level=842,radius=565)
save(pen,"16-inlegzool-voetboog","Zijaanzicht voet boven een inlegzool met ondersteuning onder de voetboog en ruimte in de schoen")

pen,bike,points,body=bike_scene(217)
pen.fill_circle(points["trapas"],19,"lime")
pen.circle(points["trapas"],19,w=1.5)
shape(pen,[(1160,210),(1400,210),(1400,450),(1160,450)],"wit")
pen.line((1190,419),(1371,419),w=1.2)
pen.line((1190,419),(1190,241),w=1.2)
pen.polyline([(1202,373),(1238,345),(1275,354),(1317,341),(1362,348)],kleur="petrol",w=3)
pen.line((1080,375),(1160,375),kleur="petrol",dash="8 7",w=1.3)
save(pen,"17-vermogen-gelijkmatig-tempo","Fietser met gemarkeerde vermogensmeter en een gelijkmatige inspanningscurve zonder cijfers")

pen=Pen(1600,1000,seed=218,wobble=1)
for center,short in [(375,False),(1130,True)]:
    bike=Fiets(pen,center,723,.42,frame="wit",bidon=False,spaken=16)
    points=bike.teken()
    body=rider(pen,bike,points,short=short,torso_accent=True)
    pen.arrow((center-105,464),(center+226,464))
    saddle_dimension(pen,points,offset=60)
    ground(pen,center=center+35,level=847,radius=260)
save(pen,"18-lichaamsbouw-fietshouding","Twee fietsers met verschillende rompverhoudingen naast maatlijnen voor zadel en stuurafstand")

pen,bike,points,body=bike_scene(219,seat_accent=True)
saddle_dimension(pen,points)
pen.arc(body[1],57,.65,2.28,kleur="petrol",w=2)
save(pen,"19-zadelhoogte-beenhoek","Maatlijn van trapas tot zadel naast een fietser met zichtbare kniehoek")

pen=Pen(1600,1000,seed=220,wobble=1)
pen.tube((715,520),(885,520),62,"wit")
pen.circle((715,520),35,w=2)
pen.circle((885,520),35,w=2)
pen.tube((712,520),(712,703),36,"wit")
pen.tube((888,520),(888,703),36,"wit")
pen.tube((545,705),(704,705),18,"petrol")
pen.tube((896,705),(1055,705),18,"petrol")
for center in [534,1066]:
    smooth(pen,[(center-105,611),(center-81,518),(center-32,497),
        (center+39,504),(center+100,568),(center+100,650),(center-104,649)],"wit")
    shape(pen,[(center-122,671),(center+122,671),(center+122,707),(center-122,707)],"lime",True)
    pen.line((center-61,561),(center+52,561),w=1.2)
pen.arrow((534,797),(1066,797))
pen.line((534,710),(534,815),kleur="petrol",dash="8 7",w=1.3)
pen.line((1066,710),(1066,815),kleur="petrol",dash="8 7",w=1.3)
pen.ellipse((690,706),8,21,kleur="petrol",w=2)
pen.line((690,685),(755,380),kleur="petrol",dash="8 7",w=1.2)
pen.ellipse((779,311),43,69,kleur="petrol",w=2)
pen.ellipse((779,311),20,40,w=1.6)
ground(pen,level=879,radius=475)
save(pen,"20-standbreedte-pedalen","Vooraanzicht van schoenen, cranks en pedalen met standbreedtemaat en een apart afgebeelde pedaalring")
