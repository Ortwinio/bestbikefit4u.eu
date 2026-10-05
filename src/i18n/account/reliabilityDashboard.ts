import type { Locale } from "@/i18n/config";

const copy = {
  nl: {
    range: "Bereik = 95%",
    basedOn: "Gebaseerd op",
    greatestGain: "Grootste winst",
    unavailable: "Het betrouwbaarheidsbereik is nog niet beschikbaar.",
    parameters: {
      saddleHeight: "Zadelhoogte",
      saddleSetback: "Zadelterugstand",
      handlebarDrop: "Stuurdrop",
      handlebarReach: "Reach",
    },
    profile: "Mijn profiel · maat",
    inseam: "Binnenbeen",
    origin: "Herkomst",
    date: "Datum",
    check: "Controle",
    missing: "Niet vastgelegd",
    measureAgain: "Meet opnieuw",
    measured: "Zelf gemeten",
    fitter: "Gemeten door een bikefitter",
    video: "Gemeten op video",
    estimated: "Zelf ingeschat",
    derived: "Berekend uit andere maten",
    declared: "Zelf opgegeven",
    checks: {
      ok: "Past bij je lengte",
      confirmed: "Door jou bevestigd",
      warning: "Controleer je meting",
      inconsistent: "Metingen liggen meer dan 5 mm uit elkaar",
      unknown: "Nog niet gecontroleerd",
    },
    impactNow: "Beïnvloedt je zadelhoogte: nu",
    impactAfter: "na 3 metingen",
    basis: {
      saddleHeight: {
        measured: "Binnenbeen gemeten", estimated: "Binnenbeen geschat", derived: "Binnenbeen afgeleid uit lengte",
        declared: "Binnenbeen zelf opgegeven", "knee-angle-measured": "Kniehoek gemeten",
      },
      saddleSetback: {
        "public-input": "Dijbeen geschat", "profile-measurement": "Dijbeen en voet gemeten",
        "validated-measurement": "Knie boven pedaalas gemeten op foto",
      },
      handlebarDrop: {
        "public-input": "Gemiddelde lenigheid aangenomen", "profile-measurement": "Lenigheid en core zelf ingeschat",
        "validated-measurement": "Geleide lenigheids- en core-test",
      },
      handlebarReach: {
        "public-input": "Torso en arm geschat", "profile-measurement": "Torso en arm gemeten, fietsgeometrie",
        "validated-measurement": "Houdingsfoto op de fiets",
      },
    },
    actions: {
      remeasure: "Meet je binnenbeen opnieuw", "measure-inseam": "Meet je binnenbeen",
      "repeat-inseam": "Herhaal je binnenbeenmeting", "measure-knee-angle": "Controleer je kniehoek",
      "add-measurements": "Vul je metingen aan", "validate-measurements": "Controleer je metingen",
      "narrowest-online": "Dit is het smalste bereik dat we online kunnen geven",
    },
  },
  en: {
    range: "Range = 95%",
    basedOn: "Based on",
    greatestGain: "Greatest gain",
    unavailable: "The reliability range is not available yet.",
    parameters: {
      saddleHeight: "Saddle height",
      saddleSetback: "Saddle setback",
      handlebarDrop: "Handlebar drop",
      handlebarReach: "Reach",
    },
    profile: "My profile · measurement",
    inseam: "Inseam",
    origin: "Source",
    date: "Date",
    check: "Check",
    missing: "Not recorded",
    measureAgain: "Measure again",
    measured: "Self-measured",
    fitter: "Measured by a bike fitter",
    video: "Measured on video",
    estimated: "Self-assessed",
    derived: "Calculated from other measurements",
    declared: "Self-reported",
    checks: {
      ok: "Consistent with your height",
      confirmed: "Confirmed by you",
      warning: "Check your measurement",
      inconsistent: "Measurements differ by more than 5 mm",
      unknown: "Not checked yet",
    },
    impactNow: "Affects your saddle height: currently",
    impactAfter: "after 3 measurements",
    basis: {
      saddleHeight: {
        measured: "Measured inseam", estimated: "Estimated inseam", derived: "Inseam derived from height",
        declared: "Self-reported inseam", "knee-angle-measured": "Measured knee angle",
      },
      saddleSetback: {
        "public-input": "Estimated femur length", "profile-measurement": "Measured femur and foot",
        "validated-measurement": "Knee over pedal spindle measured in a photo",
      },
      handlebarDrop: {
        "public-input": "Average flexibility assumed", "profile-measurement": "Self-assessed flexibility and core",
        "validated-measurement": "Guided flexibility and core test",
      },
      handlebarReach: {
        "public-input": "Estimated torso and arm", "profile-measurement": "Measured torso and arm, bike geometry",
        "validated-measurement": "Posture photo on the bike",
      },
    },
    actions: {
      remeasure: "Measure your inseam again", "measure-inseam": "Measure your inseam",
      "repeat-inseam": "Repeat your inseam measurement", "measure-knee-angle": "Check your knee angle",
      "add-measurements": "Add your measurements", "validate-measurements": "Check your measurements",
      "narrowest-online": "This is the narrowest range we can provide online",
    },
  },
};

export function getReliabilityDashboardCopy(locale: Locale) {
  return copy[locale];
}
