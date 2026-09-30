/** Browser-only contrast sampling: solid ancestor surfaces, actual computed text colors. */
export function inspectContrast() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const rgba = (color) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data].map((value, index) =>
      index === 3 ? value / 255 : value,
    );
  };
  const over = (top, bottom) => top.slice(0, 3).map((value, i) => value * top[3] + bottom[i] * (1 - top[3]));
  const luminance = (color) =>
    color.slice(0, 3).reduce((sum, value, i) => {
      const channel = value / 255;
      return (
        sum +
        (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4) *
          [0.2126, 0.7152, 0.0722][i]
      );
    }, 0);
  const failures = [];
  let checked = 0;
  for (const node of document.querySelectorAll("main *, [role=dialog] *")) {
    const text = [...node.childNodes]
      .filter((child) => child.nodeType === Node.TEXT_NODE)
      .map((child) => child.textContent.trim())
      .join(" ");
    if (
      !text ||
      /^[\s·—→]+$/.test(text) ||
      !node.getClientRects().length ||
      node.closest("svg, [disabled], [aria-disabled=true]")
    )
      continue;
    const style = getComputedStyle(node);
    if (style.visibility === "hidden") continue;
    const layers = [];
    let transparentOrGradient = false;
    for (let parent = node; parent; parent = parent.parentElement) {
      const parentStyle = getComputedStyle(parent);
      if (Number(parentStyle.opacity) < 1 || parentStyle.backgroundImage !== "none")
        transparentOrGradient = true;
      layers.push(rgba(parentStyle.backgroundColor));
    }
    if (transparentOrGradient) continue;
    const background = layers.reverse().reduce((base, layer) => over(layer, base), [255, 255, 255]);
    const color = over(rgba(style.color), background);
    const l1 = luminance(color);
    const l2 = luminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const large =
      parseFloat(style.fontSize) >= 24 ||
      (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
    checked += 1;
    if (ratio + 0.02 < (large ? 3 : 4.5)) {
      failures.push({
        text: text.slice(0, 90),
        ratio: Number(ratio.toFixed(2)),
        color,
        background,
        tag: node.tagName,
        className: node.className,
      });
    }
  }
  return { checked, failures };
}

/** Active SVG gauge arcs convey measurements and need 3:1 against their panel. */
export function inspectGaugeContrast() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const rgba = (color) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data];
  };
  const luminance = (color) =>
    color.slice(0, 3).reduce((sum, value, i) => {
      const channel = value / 255;
      return (
        sum +
        (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4) *
          [0.2126, 0.7152, 0.0722][i]
      );
    }, 0);
  return [...document.querySelectorAll('[role="meter"]')].map((meter) => {
    const arc = meter.querySelector("path:nth-child(2)");
    let panel = meter;
    while (panel.parentElement && rgba(getComputedStyle(panel).backgroundColor)[3] === 0) {
      panel = panel.parentElement;
    }
    const stroke = getComputedStyle(arc).stroke;
    const background = getComputedStyle(panel).backgroundColor;
    const one = luminance(rgba(stroke));
    const two = luminance(rgba(background));
    const ratio = (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
    return {
      label: document.getElementById(meter.getAttribute("aria-labelledby"))?.textContent,
      stroke,
      background,
      ratio: Number(ratio.toFixed(2)),
      pass: ratio >= 3,
    };
  });
}
