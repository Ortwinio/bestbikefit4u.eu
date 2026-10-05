export const reliabilityEmailCopy = {
  nl: {
    subject: "Hoe voelt je zadelhoogte na een week?",
    preheader: "Evalueer je knie, onderrug en stabiliteit op het zadel.",
    eyebrow: "Je kniehoekcontrole", greeting: "Hoi", intro: "Je hebt zeven dagen geleden je kniehoek gemeten. "
      + "Heb je twee rustige ritten gemaakt? Kijk dan hoe je afstelling voelt.",
    angle: "Gemeten kniehoek", height: "Zadelhoogte uit je plan",
    questions: ["Hoe voelen je knieën en onderrug?", "Blijf je stabiel op het zadel zonder te wiegen?",
      "Voelt het beter, hetzelfde of minder prettig dan voor de aanpassing?"],
    next: "Nog buiten het venster van 25–35°? Meet opnieuw en verstel maximaal 5 mm per stap.",
    warning: "Heb je pijn of tintelingen? Stop met aanpassen en vraag advies aan een erkende bikefitter of zorgverlener.",
    button: "Bekijk je kniehoek en plan", footer: "Je ontvangt deze servicemail omdat je een kniehoekcontrole hebt bewaard.",
  },
  en: {
    subject: "How does your saddle height feel after a week?",
    preheader: "Check your knees, lower back and stability on the saddle.",
    eyebrow: "Your knee-angle check", greeting: "Hi", intro: "You measured your knee angle seven days ago. "
      + "Have you completed two easy rides? Take a moment to check how your setup feels.",
    angle: "Measured knee angle", height: "Saddle height in your plan",
    questions: ["How do your knees and lower back feel?", "Can you stay stable on the saddle without rocking?",
      "Does it feel better, the same or less comfortable than before the adjustment?"],
    next: "Still outside the 25–35° window? Measure again and adjust by no more than 5 mm per step.",
    warning: "Pain or tingling? Stop adjusting and ask a qualified bike fitter or healthcare professional for advice.",
    button: "View your knee angle and plan", footer: "You received this service email because you saved a knee-angle check.",
  },
} satisfies Record<"nl" | "en", {
  subject: string; preheader: string; eyebrow: string; greeting: string; intro: string; angle: string; height: string;
  questions: string[]; next: string; warning: string; button: string; footer: string;
}>;
