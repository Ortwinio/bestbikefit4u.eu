export type BikeRoleBiasContext = {
  bikeName?: string | null;
  bikeType?: string | null;
  discipline?: string | null;
  ridingStyle?: string | null;
  primaryGoal?: string | null;
  profileName?: string | null;
  profileType?: string | null;
};

export type BikeRoleBias = {
  source: "none" | "bike" | "bike_profile" | "mixed";
  confidence: "low" | "medium" | "high";
  suggestedRidingStyle?: string;
  suggestedPrimaryGoal?: string;
  summary: string;
  advisoryNotes: string[];
};

type ProfileBias = {
  ridingStyle?: string;
  primaryGoal?: string;
  summary: string;
};

type BikeUsageBias = {
  ridingStyle?: string;
  primaryGoal?: string;
  summary: string;
};

const PROFILE_BIAS_MAP: Record<string, ProfileBias> = {
  base: {
    summary: "The base bike profile does not add a role bias.",
  },
  mountain: {
    ridingStyle: "sportive",
    primaryGoal: "balanced",
    summary: "Mountain-oriented usage usually benefits from a more stable, balanced cockpit.",
  },
  climbing: {
    ridingStyle: "sportive",
    primaryGoal: "performance",
    summary: "Climbing-focused usage tends to favor a performance-leaning fit.",
  },
  endurance: {
    ridingStyle: "touring",
    primaryGoal: "comfort",
    summary: "Endurance usage usually leans toward comfort and longer-session stability.",
  },
  performance: {
    ridingStyle: "racing",
    primaryGoal: "performance",
    summary: "Performance-oriented usage usually leans aggressive and race-biased.",
  },
  aero: {
    ridingStyle: "racing",
    primaryGoal: "aerodynamics",
    summary: "Aero-oriented usage usually leans toward a lower, more aggressive position.",
  },
  indoor: {
    ridingStyle: "fitness",
    primaryGoal: "balanced",
    summary: "Indoor setups usually favor a controlled, repeatable position over aggressive reach.",
  },
  technical: {
    ridingStyle: "commuting",
    primaryGoal: "balanced",
    summary: "Technical riding usually benefits from a stable and adaptable fit bias.",
  },
  comfort: {
    ridingStyle: "recreational",
    primaryGoal: "comfort",
    summary: "Comfort-oriented usage usually benefits from a relaxed, forgiving fit bias.",
  },
  custom: {
    summary: "Custom bike profiles stay neutral unless they carry explicit usage fields.",
  },
};

const BIKE_USAGE_BIAS_MAP: Record<string, BikeUsageBias> = {
  road: {
    ridingStyle: "racing",
    primaryGoal: "performance",
    summary: "Road-bike usage usually leans toward a performance-oriented position.",
  },
  gravel: {
    ridingStyle: "sportive",
    primaryGoal: "balanced",
    summary: "Gravel-bike usage usually leans toward a balanced and adaptable fit.",
  },
  mountain: {
    ridingStyle: "recreational",
    primaryGoal: "balanced",
    summary: "Mountain-bike usage usually leans toward a stable, control-first fit.",
  },
  hybrid: {
    ridingStyle: "commuting",
    primaryGoal: "comfort",
    summary: "Hybrid-bike usage usually leans toward comfort and everyday control.",
  },
  city: {
    ridingStyle: "commuting",
    primaryGoal: "comfort",
    summary: "City-bike usage usually leans toward an upright, comfort-first position.",
  },
  tt_triathlon: {
    ridingStyle: "racing",
    primaryGoal: "aerodynamics",
    summary: "TT and triathlon bikes usually lean aggressive and aero-focused.",
  },
  cyclocross: {
    ridingStyle: "sportive",
    primaryGoal: "balanced",
    summary: "Cyclocross bikes usually lean toward a stable, all-round race fit.",
  },
  touring: {
    ridingStyle: "touring",
    primaryGoal: "comfort",
    summary: "Touring bikes usually lean toward comfort and long-session stability.",
  },
};

function normalize(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

function buildSummary(
  bikeLabel: string,
  ridingStyle?: string,
  primaryGoal?: string
) {
  const parts: string[] = [];
  if (ridingStyle) {
    parts.push(`riding style ${humanize(ridingStyle)}`);
  }
  if (primaryGoal) {
    parts.push(`goal ${humanize(primaryGoal)}`);
  }

  if (parts.length === 0) {
    return `${bikeLabel} does not expose a clear usage bias.`;
  }

  return `${bikeLabel} suggests ${parts.join(" and ")}.`;
}

export function buildBikeRoleBias(context: BikeRoleBiasContext): BikeRoleBias {
  const directRidingStyle = normalize(context.ridingStyle);
  const directPrimaryGoal = normalize(context.primaryGoal);
  const usageKey = normalize(context.discipline) ?? normalize(context.bikeType);
  const profileType = normalize(context.profileType);
  const profileBias = profileType ? PROFILE_BIAS_MAP[profileType] : undefined;
  const usageBias = usageKey ? BIKE_USAGE_BIAS_MAP[usageKey] : undefined;
  const suggestedRidingStyle =
    directRidingStyle ?? profileBias?.ridingStyle ?? usageBias?.ridingStyle;
  const suggestedPrimaryGoal =
    directPrimaryGoal ?? profileBias?.primaryGoal ?? usageBias?.primaryGoal;

  const bikeLabel = normalize(context.bikeName) ?? normalize(context.profileName) ?? "Imported bike";
  const hasDirectBias = Boolean(directRidingStyle || directPrimaryGoal);
  const hasProfileBias = Boolean(profileBias);
  const hasUsageBias = Boolean(usageBias);
  const source =
    hasDirectBias && (hasProfileBias || hasUsageBias)
      ? "mixed"
      : hasDirectBias
        ? "bike"
        : hasProfileBias && hasUsageBias
          ? "mixed"
          : hasProfileBias
            ? "bike_profile"
            : hasUsageBias
              ? "bike"
              : "none";

  const confidence =
    suggestedRidingStyle && suggestedPrimaryGoal
      ? "high"
      : suggestedRidingStyle || suggestedPrimaryGoal
        ? "medium"
        : "low";

  const summary =
    profileBias?.summary && source === "bike_profile"
      ? `${bikeLabel}: ${profileBias.summary}`
      : profileBias && usageBias && source === "mixed" && !hasDirectBias
        ? `${bikeLabel}: ${profileBias.summary} ${usageBias.summary}`
        : profileBias && source === "mixed"
          ? `${bikeLabel}: ${profileBias.summary}`
          : usageBias && source === "bike"
            ? `${bikeLabel}: ${usageBias.summary}`
            : usageBias && source === "mixed"
              ? `${bikeLabel}: ${usageBias.summary}`
              : buildSummary(bikeLabel, suggestedRidingStyle, suggestedPrimaryGoal);

  const advisoryNotes = [
    `${summary} Treat this as advisory context only; the solver still prioritizes rider measurements and explicit fit inputs.`,
  ];

  return {
    source,
    confidence,
    suggestedRidingStyle,
    suggestedPrimaryGoal,
    summary,
    advisoryNotes,
  };
}
