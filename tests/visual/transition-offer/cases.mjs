export const root = "/Users/ortwinverreck/Developer/bikefitboost-stripe";
export const folder = `${root}/tests/visual/transition-offer`;
export const audit = `${root}/plans/feature-stripe-live-release/audit/02a-visual.json`;
export const renders = `${root}/plans/feature-stripe-live-release/renders`;
export const cases = ["dashboard", "paid-limit"].flatMap(surface =>
  ["available", "upcoming", "redeemed"].flatMap(state =>
    ["nl", "en"].flatMap(locale => [390, 1440].map(width => ({ surface, state, locale, width })))));
