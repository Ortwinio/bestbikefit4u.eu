import { describe, expect, it } from "vitest";
import { toolsApp } from "./toolsApp";
import { toolsCleatMessages } from "./toolsCleat";
import { toolsFeedback } from "./toolsFeedback";
import { toolsGearingMessages } from "./toolsGearing";
import { toolsPressureMessages } from "./toolsPressure";
import { toolsSaddleMessages } from "./toolsSaddle";
import { toolsSettings } from "./toolsSettings";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, shape(child)]));
  }
  return typeof value;
}

describe("account tool dictionary parity", () => {
  it.each(Object.entries({
    app: toolsApp, cleat: toolsCleatMessages, feedback: toolsFeedback, gearing: toolsGearingMessages,
    pressure: toolsPressureMessages, saddle: toolsSaddleMessages, settings: toolsSettings,
  }))("keeps Dutch and English %s structures aligned", (_name, copy) => {
    expect(shape(copy.nl)).toEqual(shape(copy.en));
  });
});
