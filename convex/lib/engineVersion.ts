export type SupportedEngineVersion = "v1" | "v2";

export function getDefaultEngineVersion(): SupportedEngineVersion {
  return process.env.ENGINE_VERSION_DEFAULT?.toLowerCase() === "v1"
    ? "v1"
    : "v2";
}
