export function classifyDutchFinding({ chunk, mode, location, detection }) {
  let classification = "review English candidate";
  if (mode.endsWith("fixture") && chunk.kind === "title") classification = "fixture metadata; not app copy";
  else if (chunk.kind === "validation-message") classification = "native browser validation; not app copy";
  else if (location.locations.every((item) => item.file.startsWith("tests/"))) {
    classification = "fixture/user data; not translation copy";
  } else if (/Jeukendrup A\.|Sawka MN|Allen H, Coggan A/.test(chunk.text)) {
    classification = "original publication title/citation; retain source wording";
  } else if (/\bFree\b/.test(chunk.text) && detection.englishWords.every((word) => /^(free|vs)$/i.test(word))) {
    classification = "product plan name Free; review vs separately";
  }
  return classification;
}
