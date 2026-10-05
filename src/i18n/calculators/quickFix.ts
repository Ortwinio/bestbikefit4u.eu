const nl = {
  modeLabel: "Kies je advies",
  quick: "Quick fix · zadel goed in 1 minuut",
  full: "Volledig advies",
  optionalInseam: "Heb je nog 2 minuten? Meet je binnenbeen",
  practicalTitle: "Zo stel je het nu in",
  steps: [
    {
      title: "Meet je huidige hoogte",
      description: "Meet van het midden van de trapas langs de zitbuis tot de bovenkant van je zadel.",
    },
    {
      title: "Stel je zadel af",
      description:
        "Maak de zadelklem los. Zet je zadel op het advies binnen het bereik en markeer de zadelpen met tape. " +
        "Draai de klem vast met het aanhaalmoment dat op de klem staat.",
    },
    {
      title: "Doe de hielcheck",
      description:
        "Zet je hiel op het pedaal in de onderste stand. Je been is dan net gestrekt. " +
        "Met de bal van je voet op het pedaal blijft je knie licht gebogen.",
    },
    {
      title: "Verstel in kleine stappen",
      description:
        "Wijkt je huidige hoogte meer dan 10 mm af? Verstel dan maximaal 5 mm per rit.",
    },
  ],
  safety: "Pijn of tintelingen? Stop met fietsen en laat een bikefitter naar je houding kijken.",
};

const en: typeof nl = {
  modeLabel: "Choose your advice",
  quick: "Quick fix · saddle sorted in a minute",
  full: "Full advice",
  optionalInseam: "Got 2 more minutes? Measure your inseam",
  practicalTitle: "Set it up now",
  steps: [
    {
      title: "Measure your current height",
      description: "Measure from the centre of the bottom bracket along the seat tube to the top of your saddle.",
    },
    {
      title: "Adjust your saddle",
      description:
        "Loosen the seat clamp. Set your saddle to the advice within the range and mark the seatpost with tape. " +
        "Tighten to the torque printed on the clamp.",
    },
    {
      title: "Do the heel check",
      description:
        "Put your heel on the pedal at the bottom of the stroke. Your leg should be just straight. " +
        "With the ball of your foot on the pedal, your knee should have a slight bend.",
    },
    {
      title: "Make small changes",
      description: "Does your current height differ by more than 10 mm? Change at most 5 mm per ride.",
    },
  ],
  safety: "Pain or tingling? Stop riding and see a bike fitter to check your position.",
};

export const quickFixMessages = { nl, en };
