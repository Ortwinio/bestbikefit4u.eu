"""Connected side-view anatomy anchored to Fiets.teken() contact points."""
import math


def add(point, dx, dy):
    return point[0] + dx, point[1] + dy


def joint(start, end, upper, lower, bend=1):
    """Circle intersection: fixed segment lengths, no detached or stretched endpoint."""
    dx, dy = end[0] - start[0], end[1] - start[1]
    distance = math.hypot(dx, dy)
    if not abs(upper - lower) < distance < upper + lower:
        raise ValueError("Unreachable limb endpoint")
    along = (upper * upper - lower * lower + distance * distance) / (2 * distance)
    height = math.sqrt(max(0, upper * upper - along * along))
    return (start[0] + along * dx / distance - bend * height * dy / distance,
            start[1] + along * dy / distance + bend * height * dx / distance)


def rider_pose(points, scale):
    # Saddle anchor is its upper contact surface. The pelvis overlaps that surface.
    hip = add(points['zadel'], 0, -35 * scale)
    # Ball of foot is over the actual pedal spindle; sole rests on the pedal top.
    ankle = add(points['pedaal'], -60 * scale, -42 * scale)
    knee = joint(hip, ankle, 410 * scale, 430 * scale, -1)
    shoulder = add(hip, 350 * scale, -240 * scale)
    # Fiets returns the stem/bar clamp. The hood is 85 mm forward and 10 mm higher.
    hand = add(points['stuur'], 85 * scale, -10 * scale)
    elbow = joint(shoulder, hand, 300 * scale, 280 * scale, 1)
    return dict(hip=hip, knee=knee, ankle=ankle, shoulder=shoulder, elbow=elbow,
                hand=hand, pedal=points['pedaal'], bottom_bracket=points['trapas'])
