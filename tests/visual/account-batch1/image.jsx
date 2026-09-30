import { createElement } from "react";

export default function FixtureImage({ src, alt, priority, fill, unoptimized, quality, loader, placeholder, blurDataURL, ...props }) {
  return createElement("img", { ...props, alt, src: typeof src === "string" ? src : src.src, style: { ...(fill ? { position: "absolute", width: "100%", height: "100%", inset: 0 } : {}), ...props.style } });
}
