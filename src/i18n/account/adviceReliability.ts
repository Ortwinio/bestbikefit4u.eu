import type { Locale } from "@/i18n/config";

const nl = {
  title: "Betrouwbaarheid van dit advies",
  reason: "Alleen de gegevens die dit advies gebruikt tellen mee. De meetmethode en datum bepalen hoe zwaar ze meetellen.",
  missing: (count: number) => `${count} ${count === 1 ? "gegeven ontbreekt" : "gegevens ontbreken"}. Ontbrekende gegevens tellen niet als betrouwbaar.`,
  empty: "Er zijn nog geen gegevens voor dit advies geselecteerd.",
  dated: "Van sommige gegevens is de meetdatum onbekend.",
  value: (value: number) => `${value} van 100`,
};

const en: typeof nl = {
  title: "Reliability of this advice",
  reason: "Only the inputs used by this advice count. Their measurement method and date determine their contribution.",
  missing: (count: number) => `${count} ${count === 1 ? "input is" : "inputs are"} missing. Missing inputs do not count as reliable.`,
  empty: "No inputs have been selected for this advice yet.",
  dated: "The measurement date of some inputs is unknown.",
  value: (value: number) => `${value} out of 100`,
};

export const getAdviceReliabilityCopy = (locale: Locale) => locale === "nl" ? nl : en;
