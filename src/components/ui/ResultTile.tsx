import { MeasurementTile, type MeasurementTileProps } from "./MeasurementTile";

export type ResultTileProps = MeasurementTileProps;

/** A result-sized measurement, using the same renderer as existing measurement tiles. */
export function ResultTile(props: ResultTileProps) {
  return <MeasurementTile {...props} />;
}
