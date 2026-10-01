"""Batch C guide heroes, drawn with the illustration skill's unmodified route-B engine."""
import math
from pathlib import Path
import sys
import subprocess

sys.path.insert(0, str(Path(__file__).parent / "bbf-illustraties"))
from pen import Pen
from fiets import Fiets
from pose import add, joint, rider_pose

OUT = Path("public/illustrations/guides")
REVIEW = Path("plans/redesign-canvas/code-renders/44b-C")
OUT.mkdir(parents=True, exist_ok=True)
REVIEW.mkdir(parents=True, exist_ok=True)


def shape(p, points, color="wit", shadow=False):
    p.fill(points, color)
    p.poly(points)
    if shadow:
        p.hatch(points, hoek=40, afstand=12, w=0.8, opacity=0.45)


def ground(p, x=800, y=830, width=570):
    pts = p.ellipse_pts((x, y), width, 20)
    p.fill(pts, "mint", offset=(0, 0))
    p.hatch(pts, hoek=0, afstand=6, w=0.8, kleur="petrol")
    p.line((x-width, y), (x+width, y), w=1.6)


def save(p, name, alt):
    # SVG is editable source; PNG is an ignored review artifact; WebP ships to the app.
    p.save(str(OUT / name), alt)
    (OUT / f"{name}.png").replace(REVIEW / f"{name}.png")
    subprocess.run([sys.executable, "scripts/images/archive-guide-source.py",
                    str(OUT / f"{name}.svg")], check=True)


def smooth_shape(p, points, color="wit"):
    contour = []
    for i, start in enumerate(points):
        before, end, after = points[i-1], points[(i+1)%len(points)], points[(i+2)%len(points)]
        c1 = (start[0]+(end[0]-before[0])/6, start[1]+(end[1]-before[1])/6)
        c2 = (end[0]-(after[0]-start[0])/6, end[1]-(after[1]-start[1])/6)
        contour.extend(p.bezier_pts(start,c1,c2,end,n=12)[:-1])
    shape(p,contour,color)
    return contour


def limb(p, a, b, width_a, width_b, color="wit"):
    dx,dy=b[0]-a[0],b[1]-a[1]
    length=math.hypot(dx,dy)
    nx,ny=-dy/length,dx/length
    def point(t,w): return(a[0]+dx*t+nx*w,a[1]+dy*t+ny*w)
    smooth_shape(p,[point(0,width_a/2),point(.5,width_a*.6),point(1,width_b/2),
                    point(1.025,0),point(1,-width_b/2),point(.55,-width_a*.55),
                    point(0,-width_a/2),point(-.03,0)],color)


def limb_chain(p, points, widths, color="wit"):
    # One tapered tube contour across both segments, with no open seam at the joint.
    normals = []
    for a,b in zip(points,points[1:]):
        dx,dy = b[0]-a[0],b[1]-a[1]
        length = math.hypot(dx,dy)
        normals.append((-dy/length,dx/length))
    joint_normal = (normals[0][0]+normals[1][0],normals[0][1]+normals[1][1])
    length = math.hypot(*joint_normal)
    joint_normal = (joint_normal[0]/length,joint_normal[1]/length)
    directions = [normals[0],joint_normal,normals[1]]
    left = [add(point,n[0]*w/2,n[1]*w/2) for point,n,w in zip(points,directions,widths)]
    right = [add(point,-n[0]*w/2,-n[1]*w/2) for point,n,w in zip(points,directions,widths)]
    end_angle = math.atan2(directions[-1][1],directions[-1][0])
    start_angle = math.atan2(directions[0][1],directions[0][0])
    end_cap = [add(points[-1],math.cos(end_angle-i*math.pi/12)*widths[-1]/2,
                   math.sin(end_angle-i*math.pi/12)*widths[-1]/2) for i in range(1,13)]
    start_cap = [add(points[0],math.cos(start_angle-math.pi-i*math.pi/12)*widths[0]/2,
                     math.sin(start_angle-math.pi-i*math.pi/12)*widths[0]/2) for i in range(1,13)]
    shape(p,left+end_cap+right[-2::-1]+start_cap,color)
    shadow = left + list(reversed(points))
    p.hatch(shadow,hoek=35,afstand=5,w=.8,opacity=.5)


def overlay(p, drawing):
    # Composite a complete foreground drawing so limbs correctly cover frame lines.
    prefix = f"overlay{len(p.defs)}-"
    def unique(value):
        return value.replace('id="clip', f'id="{prefix}clip').replace('url(#clip', f'url(#{prefix}clip')
    p.defs.extend(unique(value) for value in drawing.defs)
    for layer in ["vlak", "arcering", "inkt"]:
        p.layers["inkt"].extend(unique(value) for value in drawing.layers[layer])


def rider(p, bike, points, accent=False):
    r = Pen(1600, 1000, seed=137, papier=False, wobble=1.0)
    scale = bike.s
    pose = rider_pose(points, scale)
    hip, knee, ankle = (pose[key] for key in ['hip', 'knee', 'ankle'])
    shoulder, elbow, hand_point = (pose[key] for key in ['shoulder', 'elbow', 'hand'])
    # Tubes meet at exactly the same joints; each has a hatched shadow side.
    limb_chain(r,[hip,knee,ankle],[80*scale,50*scale,28*scale])
    pedal = points['pedaal']
    shape(r, [add(pedal, x*scale, y*scale) for x,y in
              [(-88,-9),(-90,-39),(-64,-55),(-40,-35),(23,-28),(45,-9)]], "petrol")
    smooth_shape(r, [add(hip,-48*scale,-12*scale), add(hip,-30*scale,-70*scale),
                    add(shoulder,-30*scale,-38*scale), add(shoulder,40*scale,-15*scale),
                    add(shoulder,25*scale,40*scale), add(hip,40*scale,30*scale)], "mint")
    limb_chain(r,[shoulder,elbow,hand_point],[46*scale,34*scale,24*scale])
    r.fill_circle(hand_point, 17*scale, "lime" if accent else "wit", offset=(0,0))
    r.circle(hand_point, 17*scale, w=1.6)
    neck = add(shoulder, 38*scale, -32*scale)
    head = add(shoulder, 60*scale, -100*scale)
    r.tube(neck, add(head,0,38*scale), 32*scale, "wit")
    r.fill(r.ellipse_pts(head,48*scale,62*scale), "wit", offset=(0,0))
    r.ellipse(head,48*scale,62*scale)
    r.arc(add(head,-18*scale,0),9*scale,-1.5,1.5,w=1.1)
    r.polyline([add(head,44*scale,-15*scale),add(head,59*scale,9*scale),
                add(head,44*scale,15*scale)],w=1.4)
    r.arc(head,60*scale,math.pi,2*math.pi,w=2.4)
    r.line(add(head,-60*scale,0),add(head,60*scale,0),w=1.4)
    overlay(p,r)


def hand(p, x, y, bent=False):
    def M(a, b): return (x+a, y+b)
    # Side silhouette of forearm, thumb resting on the brake hood and curled fingers.
    bend = 64 if bent else 0
    outline = [M(-240, 35), M(-70, 20), M(10, -15-bend), M(70, -45-bend),
               M(125, -30), M(156, 8), M(171, 58), M(155, 81), M(135, 75),
               M(119, 36), M(92, 18), M(105, 60), M(99, 104), M(75, 115),
               M(56, 99), M(56, 54), M(25, 76), M(-31, 100), M(-240, 119)]
    shape(p, outline)
    p.bezier(M(-70, 53), M(-15, 30-bend), M(40, 27-bend), M(75, 3), w=1.3)
    p.line(M(-15, 53), M(1, 83), w=1.1)
    # Hood and the visible bar behind it, kept clear of the hand contour.
    shape(p, [M(16, 126), M(119, 116), M(146, 148), M(136, 230),
              M(100, 256), M(60, 238), M(49, 178)], "petrol")
    p.bezier(M(84, 246), M(58, 300), M(9, 300), M(-19, 264))
    p.bezier(M(115, 253), M(81, 341), M(-11, 339), M(-47, 279))
    p.fill_circle(M(48, 119), 18, "lime")
    p.circle(M(48, 119), 18, w=1.3)
    p.line(M(-230, -9), M(-50, -25), kleur="petrol", dash="8 7", w=1.4)
    p.line(M(-50, -25), M(74, -43-bend), kleur="petrol", dash="8 7", w=1.4)
    p.hatch([M(-232, 104), M(-70, 88), M(-34, 101), M(-232, 118)], afstand=8, w=0.8)


p = Pen(1600, 1000, seed=33, wobble=1.0)
hand(p, 480, 400)
hand(p, 1170, 400, True)
p.line((795, 300), (795, 730), kleur="petrol", dash="4 10", w=1)
save(p, "33-gevoelloze-handen", "Twee handen op remgrepen: rechte en gebogen pols met de drukzone gemarkeerd")

p = Pen(1600, 1000, seed=34, wobble=1.0)
# Saddle top view with two posterior support regions and an open central channel.
left = p.bezier_pts((800, 230), (480, 140), (370, 310), (510, 515))
left += p.bezier_pts((510, 515), (610, 640), (666, 780), (760, 815))[1:]
right = [(1600-x, y) for x, y in reversed(left)]
shape(p, left+right, "wit")
for x in [615, 985]:
    pts = p.ellipse_pts((x, 360), 103, 92)
    p.fill(pts, "lime")
    p.ellipse((x, 360), 103, 92, w=1.5, kleur="petrol")
    p.hatch(p.ellipse_pts((x, 395), 74, 27), hoek=30, afstand=9, w=0.8)
p.bezier((785, 332), (716, 450), (735, 625), (785, 690))
p.bezier((815, 332), (884, 450), (865, 625), (815, 690))
p.bezier((785, 332), (795, 316), (805, 316), (815, 332))
p.bezier((785, 690), (795, 710), (805, 710), (815, 690))
p.arrow((615, 175), (985, 175))
for x in [615, 985]: p.line((x, 180), (x, 255), kleur="petrol", dash="7 6")
save(p, "34-zadelsteun", "Bovenaanzicht van een zadel met twee steunvlakken en een vrij middenkanaal")


def frames(p, endurance=False):
    ground(p, y=815, width=685)
    for x, kind in [(445, "race"), (1150, "race")]:
        bike = Fiets(p, x, 690, .43, soort=kind, frame="lime" if x==445 else "mint", bidon=False)
        bike.g = dict(bike.g)
        if x == 1150:
            # Illustrative proportions, not a geometry claim about any named model.
            bike.g.update(stuurbuis_top=(335, 640), stuurbuis_onder=(411, 427), voor=(565, 70))
        if endurance and x == 445:
            bike.g.update(stuurbuis_top=(400, 525), stuurbuis_onder=(431, 407))
        bike.teken()
        a = bike.M(0, 0)
        head = bike.M(*bike.g["stuurbuis_top"])
        p.arrow((a[0], head[1]-50), (head[0], head[1]-50), kop=10)
        p.line(a, (a[0], head[1]-64), kleur="petrol", dash="7 6", w=1.2)
        p.line(head, (head[0], head[1]-64), kleur="petrol", dash="7 6", w=1.2)
        p.arrow((head[0]+110, a[1]), (head[0]+110, head[1]), kop=10)
        p.line(a, (head[0]+125, a[1]), kleur="petrol", dash="7 6", w=1.2)
        p.line(head, (head[0]+125, head[1]), kleur="petrol", dash="7 6", w=1.2)

p = Pen(1600, 1000, seed=35, wobble=1.0)
frames(p)
save(p, "35-fietsmaat-geometrie", "Twee fietsframes met aparte maatpijlen voor stack en reach")

p = Pen(1600, 1000, seed=36, wobble=1.0)
for x, radius, color in [(435, 235, "lime"), (1165, 285, "mint")]:
    p.circle((x, 495), radius, kleur="petrol", dash="7 8", w=1.1)
    p.circle((x, 495), 82, w=2.8)
    p.circle((x, 495), 69, w=1.1)
    p.circle((x, 495), 17)
    end = (x+radius*.64, 495+radius*.77)
    p.tube((x, 495), end, 31, color, caps=True)
    p.circle((x, 495), 9)
    shape(p, [(end[0]-48,end[1]-10),(end[0]+60,end[1]-10),
              (end[0]+66,end[1]+17),(end[0]-48,end[1]+17)], "wit", True)
    p.arrow((x-35, 545), (end[0]-45, end[1]+45), kop=11)
    for angle in range(0, 360, 15):
        a=math.radians(angle)
        p.line((x+83*math.cos(a),495+83*math.sin(a)),
               (x+92*math.cos(a),495+92*math.sin(a)),w=1.5)
save(p, "36-cranklengte", "Twee cranks met verschillende lengtes en hun pedaalcirkels rond de trapas")

p = Pen(1600, 1000, seed=37, wobble=1.0)
b = Fiets(p, 675, 750, .60, frame="wit", bidon=False)
q = b.teken()
rider(p, b, q, accent=True)
for key in ['zadel','stuur','pedaal']:
    p.circle(q[key], 38, kleur="petrol", w=2)
    p.fill_circle(q[key], 12, "lime")
p.arrow((520, 245), (1150, 245))
p.line(q['zadel'],(520,260),kleur="petrol",dash="8 8",w=1.2)
p.line(q['stuur'],(1150,260),kleur="petrol",dash="8 8",w=1.2)
ground(p,y=922,width=610)
save(p, "37-bikefit-contactpunten", "Fietser met zadel, stuur en pedaal als drie gemarkeerde meetpunten")

p = Pen(1600, 1000, seed=38, wobble=1.0)
b = Fiets(p, 710, 700, .58, soort="gravel", frame="wit", bidon=True)
q = b.teken()
rider(p, b, q, accent=True)
p.stroke([(130,875),(270,862),(360,884),(490,866),(660,879),(790,866),(940,882),(1120,858),(1440,878)])
for x,y in [(240,907),(390,910),(610,928),(980,917),(1210,907),(1360,930)]:
    shape(p,[(x,y),(x+18,y-8),(x+37,y+2),(x+13,y+11)],"mint")
save(p, "38-gravelbike-afstellen", "Fietser op een gravelbike met licht gebogen armen boven een onregelmatige ondergrond")


def bottle(p, x, y, scale=1, color="lime"):
    def M(a,b): return(x+a*scale,y+b*scale)
    pts=[M(-50,0),M(-51,-192),M(-36,-225),M(-33,-257),M(33,-257),M(36,-225),M(51,-192),M(50,0)]
    shape(p,pts,color)
    shape(p,[M(-38,-262),M(-38,-281),M(38,-281),M(38,-262)],"wit")
    p.poly([M(-14,-283),M(-14,-299),M(14,-299),M(14,-283)])
    p.line(M(-47,-165),M(47,-165),w=1.1)
    p.line(M(-47,-58),M(47,-58),w=1.1)
    p.hatch([M(30,-185),M(46,-181),M(46,-5),M(30,-5)],afstand=8,w=.8)

p = Pen(1600, 1000, seed=39, wobble=1.0)
# Two scales mark the before/after weighing method without prescribing a target.
for x in [400,1180]:
    shape(p,[(x-210,680),(x-175,425),(x+175,425),(x+210,680),(x+180,740),(x-175,740)],"mint")
    shape(p,[(x-70,455),(x+70,455),(x+75,510),(x-75,510)],"wit")
    for dx in [-95,95]: p.ellipse((x+dx,594),45,80,w=1.3)
    p.line((x-197,698),(x+197,698),w=1.2)
bottle(p,800,680,1.1)
p.arrow((480,335),(1120,335))
save(p, "39-zweetverlies-meten", "Twee personenweegschalen met een bidon ertussen voor meten voor en na een rit")

p = Pen(1600, 1000, seed=40, wobble=1.0)
bottle(p,485,735,1.55)
# Banana and a wrapped food bar, separated from the bottle.
banana=p.bezier_pts((815,390),(850,620),(1080,655),(1270,510))
banana+=p.bezier_pts((1270,510),(1120,780),(830,730),(782,420))[1:]
shape(p,banana,"lime")
p.bezier((812,418),(860,665),(1115,709),(1246,551),w=1.3)
shape(p,[(920,810),(910,720),(1310,720),(1330,810),(1280,798),(1250,815),
         (970,815),(950,797)],"mint")
p.line((965,740),(1265,740),w=1.2)
p.line((965,789),(1265,789),w=1.2)
p.hatch([(970,753),(1240,753),(1240,780),(970,780)],afstand=14,w=.8)
ground(p,y=864,width=540)
save(p, "40-voeding-drinken", "Bidon naast een banaan en verpakte voedingsreep: drinken en brandstof afzonderlijk plannen")

p = Pen(1600, 1000, seed=41, wobble=1.0)
b = Fiets(p, -180, 1610, 2.25, frame="wit", bidon=False)
b.cockpit()
p.fill([(662,246),(901,220),(911,288),(682,323)], "lime")
p.arrow((670,165),(910,165))
p.line((670,180),(670,282),kleur="petrol",dash="8 7",w=1.3)
p.line((910,180),(910,242),kleur="petrol",dash="8 7",w=1.3)
p.arrow((910,640),(1160,640))
p.line((910,325),(910,655),kleur="petrol",dash="8 7",w=1.3)
p.line((1160,365),(1160,655),kleur="petrol",dash="8 7",w=1.3)
for layer in p.layers:
    p.layers[layer] = ['<g transform="translate(-580,-125) scale(1.5)">'] + p.layers[layer] + ['</g>']
save(p, "41-stuurpen-bereik", "Stuurpen en remgreep in zijaanzicht met aparte maatlijnen voor stuurpen en handbereik")

p = Pen(1600, 1000, seed=42, wobble=1.0)
frames(p,True)
save(p, "42-race-endurance-geometrie", "Twee fietsen naast elkaar met stack en reach als vergelijkbare framematen")

p = Pen(1600, 1000, seed=43, wobble=1.0)
# Sole outline and detached cleat show width and pedal attachment as separate decisions.
sole=p.bezier_pts((420,210),(230,200),(230,440),(330,560))
sole+=p.bezier_pts((330,560),(360,620),(290,790),(430,810))[1:]
sole+=p.bezier_pts((430,810),(590,815),(505,620),(535,540))[1:]
sole+=p.bezier_pts((535,540),(670,365),(610,210),(420,210))[1:]
shape(p,sole,"wit")
for y in [375,425,475]:
    p.ellipse((435,y),25,8,w=1.2)
p.arrow((262,340),(602,340))
shape(p,[(1000,450),(1145,450),(1200,670),(950,670)],"lime")
for x,y in [(1030,505),(1110,505),(1070,600)]:
    p.circle((x,y),17);p.circle((x,y),7,w=1.2)
p.hatch([(961,649),(1193,649),(1200,670),(950,670)],afstand=9,w=.8)
p.arrow((715,500),(873,500),twee=False)
save(p, "43-schoen-cleat", "Fietsschoenzool met breedtemaat en een los schoenplaatje met bevestigingsgaten")

p = Pen(1600, 1000, seed=44, wobble=1.0)
# Side-view bicycle plus clipboard: measurements need observation and interpretation.
b = Fiets(p, 575, 670, .53, frame="wit", bidon=False)
q = b.teken()
rider(p, b, q, accent=True)
f = Pen(1600,1000,seed=144,papier=False,wobble=1.0)
f.tube((1260,575),(1215,806),36,"wit",caps=True)
f.tube((1305,575),(1350,806),36,"wit",caps=True)
smooth_shape(f,[(1225,340),(1270,330),(1320,340),(1330,422),(1316,540),(1332,592),(1220,592),(1228,500),(1215,404)],"mint")
f.fill_circle((1270,274),44,"wit")
f.circle((1270,274),44)
f.line((1251,314),(1251,331),w=2)
f.line((1289,314),(1289,331),w=2)
f.arc((1294,275),8,-1.5,1.5,w=1.2)
f.polyline([(1229,263),(1220,283),(1235,286)],w=1.4)
observer_elbow = joint((1236,371),(1045,408),125,110,-1)
limb_chain(f,[(1236,371),observer_elbow,(1045,408)],[37,28,19])
elbow = joint((1320,373),(1348,502),88,85,-1)
limb_chain(f,[(1320,373),elbow,(1348,502)],[29,25,19])
shape(f,[(1340,451),(1450,475),(1410,624),(1300,595)],"wit")
for y in [497,533,569]:
    f.line((1340,y),(1410,y+16),w=1.1)
shape(f,[(1203,794),(1228,794),(1244,820),(1188,820)],"petrol")
shape(f,[(1337,794),(1364,794),(1385,820),(1334,820)],"petrol")
overlay(p,f)
ground(p,x=690,y=823,width=550)
save(p, "44-grenzen-online-bikefit", "Fietser naast een fitter die de contactpunten bekijkt en observaties noteert")
