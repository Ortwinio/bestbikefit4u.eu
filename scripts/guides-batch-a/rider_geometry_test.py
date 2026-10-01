import math
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "guides-batch-c/bbf-illustraties"))
from pen import Pen
from fiets import Fiets
from rider_geometry import rider_pose, two_segment_joint


class RiderGeometryTest(unittest.TestCase):
    def test_contact_points_and_bone_lengths_at_each_crank_angle(self):
        for scale in [.42, .64]:
            for angle in [-90, -40, 0, 40, 90, 180]:
                for short in [False, True]:
                    with self.subTest(scale=scale, angle=angle, short=short):
                        bike = Fiets(Pen(1600,1000),730,730,scale,crank_hoek=angle)
                        points = bike.teken()
                        pose = rider_pose(points,scale,short)
                        self.assertEqual(pose["hip"],points["zadel"])
                        self.assertEqual(pose["sole"],(points["pedaal"][0],points["pedaal"][1]-9*scale))
                        self.assertEqual(pose["hand"],(points["stuur"][0]+82*scale,points["stuur"][1]-8*scale))
                        for first, second, length in [
                            ("hip","knee",410),("knee","ankle",430),
                            ("shoulder","elbow",300),("elbow","hand",300),
                        ]:
                            self.assertAlmostEqual(math.dist(pose[first],pose[second]),length*scale,places=7)

    def test_unreachable_contact_is_rejected_instead_of_stretching(self):
        with self.assertRaises(ValueError):
            two_segment_joint((0,0),(10,0),2,3)


if __name__ == "__main__":
    unittest.main()
