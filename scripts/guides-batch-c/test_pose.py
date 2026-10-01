"""Geometry regressions for rider contact and connected two-segment limbs."""
import math
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / 'bbf-illustraties'))
from pen import Pen
from fiets import Fiets
from pose import joint, rider_pose


class PoseTest(unittest.TestCase):
    def test_contacts_and_lengths_follow_bike_and_crank(self):
        for kind in ['race', 'gravel']:
            for angle in [-140, -90, -40, 0, 40, 90, 140]:
                with self.subTest(kind=kind, angle=angle):
                    scale = .58
                    bike = Fiets(Pen(1600,1000),710,700,scale,soort=kind,crank_hoek=angle)
                    points = bike.teken()
                    pose = rider_pose(points,scale)
                    for a,b,length in [('hip','knee',410),('knee','ankle',430),
                                       ('shoulder','elbow',300),('elbow','hand',280)]:
                        self.assertAlmostEqual(math.dist(pose[a],pose[b]),length*scale)
                    self.assertEqual(pose['hip'],(points['zadel'][0],points['zadel'][1]-35*scale))
                    self.assertEqual(pose['ankle'],(points['pedaal'][0]-60*scale,points['pedaal'][1]-42*scale))
                    self.assertEqual(pose['hand'],(points['stuur'][0]+85*scale,points['stuur'][1]-10*scale))
                    self.assertAlmostEqual(math.dist(points['pedaal'],pose['bottom_bracket']),172*scale)

    def test_unreachable_endpoint_fails_instead_of_detaching(self):
        with self.assertRaises(ValueError):
            joint((0,0),(100,0),20,30)


if __name__ == '__main__':
    unittest.main()
