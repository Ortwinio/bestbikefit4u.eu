type BikePhotoCountOptions = {
  count: number;
  oneLabel: string;
  manyLabel: string;
};

type BikePhotoAltOptions = {
  bikeName: string;
  index: number;
  total: number;
};

type BikePhotoThumbnailLabelOptions = BikePhotoAltOptions & {
  isPrimary: boolean;
  isSelected: boolean;
  primaryLabel: string;
};

export function formatBikePhotoCount({
  count,
  oneLabel,
  manyLabel,
}: BikePhotoCountOptions) {
  if (count === 1) {
    return oneLabel;
  }

  return manyLabel.replace("{count}", String(count));
}

export function getBikePhotoAltText({
  bikeName,
  index,
  total,
}: BikePhotoAltOptions) {
  return `${bikeName} photo ${index} of ${total}`;
}

export function buildBikePhotoThumbnailLabel({
  bikeName,
  index,
  total,
  isPrimary,
  isSelected,
  primaryLabel,
}: BikePhotoThumbnailLabelOptions) {
  const parts = [getBikePhotoAltText({ bikeName, index, total })];

  if (isPrimary) {
    parts.push(primaryLabel);
  }

  if (isSelected) {
    parts.push("selected");
  }

  return parts.join(", ");
}
