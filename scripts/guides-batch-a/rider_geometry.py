import math


def two_segment_joint(start, end, first_length, second_length, bend=1):
    delta_x = end[0] - start[0]
    delta_y = end[1] - start[1]
    distance = math.hypot(delta_x, delta_y)
    if not abs(first_length - second_length) < distance < first_length + second_length:
        raise ValueError("Contact point lies outside the limb's reachable range")
    along = (first_length**2 - second_length**2 + distance**2) / (2 * distance)
    perpendicular = math.sqrt(max(0, first_length**2 - along**2))
    direction_x, direction_y = delta_x / distance, delta_y / distance
    return (
        start[0] + along * direction_x - bend * perpendicular * direction_y,
        start[1] + along * direction_y + bend * perpendicular * direction_x,
    )


def rider_pose(points, scale, short=False):
    hip = points["zadel"]
    pedal = points["pedaal"]
    ankle = (pedal[0] - 60 * scale, pedal[1] - 48 * scale)
    knee = two_segment_joint(hip, ankle, 410 * scale, 430 * scale, bend=-1)
    shoulder = (hip[0] + (275 if short else 320) * scale,
                hip[1] - (255 if short else 280) * scale)
    hand = (points["stuur"][0] + 82 * scale, points["stuur"][1] - 8 * scale)
    elbow = two_segment_joint(shoulder, hand, 300 * scale, 300 * scale)
    head = (shoulder[0] + 60 * scale, shoulder[1] - 100 * scale)
    sole = (pedal[0], pedal[1] - 9 * scale)
    return {
        "hip": hip, "knee": knee, "ankle": ankle,
        "shoulder": shoulder, "elbow": elbow, "hand": hand,
        "head": head, "sole": sole, "pedal": pedal,
    }
