"""Joint placement in screen coordinates, anchored to Fiets' rendered contact points."""
import math


def offset(point, dx, dy, scale):
    return point[0] + dx * scale, point[1] + dy * scale


def joint(start, end, upper, lower, bend):
    dx, dy = end[0] - start[0], end[1] - start[1]
    distance = math.hypot(dx, dy)
    if not abs(upper - lower) < distance < upper + lower:
        raise ValueError("Unreachable rider contact point")
    along = (upper * upper - lower * lower + distance * distance) / (2 * distance)
    height = math.sqrt(max(0, upper * upper - along * along))
    return (start[0] + along * dx / distance - bend * height * dy / distance,
            start[1] + along * dy / distance + bend * height * dx / distance)


def pose(contacts, scale, posture="road"):
    hip = offset(contacts["zadel"], -15, -46, scale)
    ankle = offset(contacts["pedaal"], -100, -48, scale)
    forward, rise = {"road": (400, 260), "gravel": (400, 280), "flat": (365, 285)}[posture]
    shoulder = offset(hip, forward, -rise, scale)
    # Fiets returns the bar clamp; its hood is 85 mm forward and 8 mm above that point.
    hand = contacts["stuur"] if posture == "flat" else offset(contacts["stuur"], 85, -8, scale)
    return {"hip": hip, "knee": joint(hip, ankle, 450 * scale, 440 * scale, -1),
            "ankle": ankle, "shoulder": shoulder,
            "elbow": joint(shoulder, hand, 270 * scale, 255 * scale, 1), "hand": hand,
            "pedal": contacts["pedaal"], "saddle": contacts["zadel"], "bb": contacts["trapas"]}
