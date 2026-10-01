"""Contact and segment invariants for every D rider posture and scale."""
import math
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).parents[1] / "guides-batch-c/bbf-illustraties"))
from fiets import Fiets
from pen import Pen
from rider_geometry import joint, offset, pose


class RiderGeometryTests(unittest.TestCase):
    def test_contacts_and_lengths_follow_the_drawn_bike(self):
        for scale in [.27, .62]:
            for posture in ["road", "gravel", "flat"]:
                for crank in [-40, 0, 90]:
                    with self.subTest(scale=scale, posture=posture, crank=crank):
                        bike = Fiets(Pen(1600, 1000), 670, 755, scale, crank_hoek=crank,
                                     soort="race" if posture == "road" else "gravel")
                        contacts = bike.teken()
                        if posture == "flat":
                            contacts["stuur"] = bike.M(540, 640)
                        rider = pose(contacts, scale, posture)
                        for start, end, length in [("hip", "knee", 450), ("knee", "ankle", 440),
                                                   ("shoulder", "elbow", 270), ("elbow", "hand", 255)]:
                            self.assertAlmostEqual(math.dist(rider[start], rider[end]), length * scale)
                        self.assertLess(math.dist(rider["hip"], contacts["zadel"]), 55 * scale)
                        self.assertEqual(rider["ankle"], offset(contacts["pedaal"], -100, -48, scale))
                        self.assertEqual(rider["hand"], contacts["stuur"] if posture == "flat"
                                         else offset(contacts["stuur"], 85, -8, scale))
                        self.assertAlmostEqual(math.dist(rider["pedal"], rider["bb"]), 172 * scale)

    def test_unreachable_contacts_fail_instead_of_detaching_a_limb(self):
        with self.assertRaises(ValueError):
            joint((0, 0), (100, 100), 10, 10, 1)


if __name__ == "__main__":
    unittest.main()
