export const FTP_ESTIMATE_EVIDENCE = [
  {
    id: "garmin-ftp-ratings",
    title: "Garmin: FTP Ratings (Allen and Coggan, 2010)",
    url: "https://www8.garmin.com/manuals-apac/webhelp/fenix7series/EN-SG/GUID-6C0F3C49-1E05-4AE5-8EC0-367A47C07DAB-4498.html",
    checkedAt: "2026-10-03",
    use: "Classifies a known FTP in W/kg using separate male and female rating tables.",
    limitation: "A rating boundary does not predict an individual's FTP from sex, age and weight.",
  },
  {
    id: "coggan-power-profiling",
    title: "Andrew Coggan: Creating Your Power Profile",
    url: "https://www.trainingpeaks.com/blog/power-profiling/",
    checkedAt: "2026-10-03",
    use: "Compares measured best-effort power across durations and performance categories.",
    limitation: "The author explicitly did not create age-specific standards because sufficient direct data were unavailable.",
  },
  {
    id: "mcgrath-2022-ftp-prediction",
    title: "McGrath et al. (2022): Prediction of Functional Threshold Power from Graded Exercise Test Data",
    url: "https://intjexersci.com/ijes/vol15/iss4/16",
    checkedAt: "2026-10-03",
    use: "Predicts FTP using body mass plus laboratory exercise-test power measurements.",
    limitation: "Requires power at a blood lactate concentration of 4 mmol/L and maximal power; demographics alone are insufficient.",
  },
] as const;

export const FTP_DEMOGRAPHIC_MODEL = {
  status: "unsupported",
  placeholder: "[PLACEHOLDER — bron?]",
  reason: "No verified model reviewed here supports estimating individual FTP from only sex, birth date and weight.",
} as const;
