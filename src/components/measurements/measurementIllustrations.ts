export type MeasurementIllustrationKey =
  | "height"
  | "inseam"
  | "torsoLength"
  | "armLength"
  | "shoulderWidth";

export type MeasurementIllustrationConfig = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
};

export const measurementIllustrations: Record<
  MeasurementIllustrationKey,
  MeasurementIllustrationConfig
> = {
  height: {
    src: "/measure/height-bbf4u.png",
    alt: "Height measurement guide showing a rider standing upright against a wall with a book placed flat on the head.",
    width: 1512,
    height: 1512,
    caption: "Stand tall against a wall and measure from the floor to the top-of-head mark.",
  },
  inseam: {
    src: "/measure/inseam-bbf4u.png",
    alt: "Inseam measurement guide showing a rider standing with a book pressed upward between the legs and measured from the floor.",
    width: 1512,
    height: 1512,
    caption: "Press a hardcover book upward like a saddle and measure from the floor to the top edge.",
  },
  torsoLength: {
    src: "/measure/torso-bbf4u.png",
    alt: "Torso length measurement guide showing the expected upper-body landmarks and the distance to measure through the torso.",
    width: 1512,
    height: 1512,
    caption: "Measure the torso using the illustrated body landmarks and keep your posture neutral.",
  },
  armLength: {
    src: "/measure/arm-length-bbf4u.png",
    alt: "Arm length measurement guide showing the shoulder landmark and the line to the end of the arm to be measured.",
    width: 1512,
    height: 1512,
    caption: "Measure from the shoulder point along the arm to the hand landmark shown in the illustration.",
  },
  shoulderWidth: {
    src: "/measure/shoulder-bbf4u.png",
    alt: "Shoulder width measurement guide showing the two acromion points and the straight distance between them.",
    width: 1512,
    height: 1512,
    caption: "Measure straight across from acromion to acromion, not around the chest.",
  },
};
