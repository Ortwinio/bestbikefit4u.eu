// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { QUESTIONNAIRE_QUESTIONS } from "../../../convex/questionnaire/questions";
import { getLocalizedQuestion } from "./localization";
import { QuestionRenderer } from "./QuestionRenderer";

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: "nl", messages: getDashboardMessages("nl") }),
}));
afterEach(cleanup);

describe("Dutch questionnaire source localization", () => {
  const expectedOptions: Record<string, string[]> = {
    experience_level: ["Beginner", "Gemiddeld", "Gevorderd"],
    weekly_hours: ["0–3 u", "3–6 u", "6–10 u", "10–15 u", "15+ u"],
    typical_ride_length: ["< 30 km", "30–80 km", "80–150 km", "150+ km"],
    has_pain: ["Ja", "Nee"],
    pain_areas: ["Voorkant knie", "Achterkant knie", "Onderrug", "Nek of schouders", "Handen", "Zadelgebied", "Voeten"],
    knee_pain_timing: ["Aan het begin van je rit", "Tijdens langere ritten", "Tijdens het klimmen", "De hele rit"],
    position_priority: ["Comfort – lang fietsen zonder spanning", "Balans – comfort en efficiëntie", "Prestatie – wat minder comfort voor meer snelheid"],
    current_position_feeling: ["Over het algemeen goed, kleine aanpassingen nodig", "Sla deze stap over", "Te uitgestrekt - ik moet te ver reiken", "Te compact - ik voel me opgepropt", "Het stuur voelt te laag", "Het stuur voelt te hoog", "Het zadel voelt te hoog", "Het zadel voelt te laag"],
    wants_climbing_profile: ["Ja, voeg een klimprofiel toe", "Nee, alleen standaard fit"],
    climbing_importance: ["Ik klim zelden", "Af en toe klimmen", "Regelmatig klimmen", "Klimmen staat centraal"],
    road_riding_type: ["Ontspannen ritten en fitness", "Groepsritten en toertochten", "Gestructureerde training", "Wedstrijden (criteriums, wegwedstrijden)", "Tijdritten / triatlon"],
    mtb_terrain: ["Alleen asfalt", "Verharde wegen en lichte gravel", "Cross-country (vloeiende trails, klimmen)", "Trail (wisselend terrein, licht technisch)", "Enduro (technische afdalingen, flinke beklimmingen)", "Downhill / bikepark"],
  };
  it.each(QUESTIONNAIRE_QUESTIONS)("translates the heading for $questionId", (question) => {
    const localized = getLocalizedQuestion(question, getDashboardMessages("nl"), "nl");
    expect(localized.questionText).not.toBe(question.questionText);
    expect(localized.questionId).toBe(question.questionId);
    expect(localized.options?.map((option) => option.value)).toEqual(question.options?.map((option) => option.value));
    expect(localized.options?.map((option) => option.label)).toEqual(expectedOptions[question.questionId]);
    if (question.helpText) {
      expect(localized.helpText).toBeTruthy();
      expect(localized.helpText).not.toBe(question.helpText);
    }
    question.options?.forEach((option, index) => {
      expect(localized.options?.[index].followUpQuestionIds).toEqual(option.followUpQuestionIds);
      if (option.description) {
        expect(localized.options?.[index].description).toBeTruthy();
        expect(localized.options?.[index].description).not.toBe(option.description);
      }
    });
    if (question.isProfileQuestion) {
      expect(getLocalizedQuestion(question, getDashboardMessages("en"), "en")).toBe(question);
    }
  });
  it("uses Dutch experience descriptions and profile help text", () => {
    const question = QUESTIONNAIRE_QUESTIONS.find((entry) => entry.questionId === "experience_level")!;
    expect(getLocalizedQuestion(question, getDashboardMessages("nl"), "nl").options?.map((option) => option.description)).toEqual([
      "Je begint met fietsen of pakt het na lange tijd weer op.",
      "Je fietst regelmatig en voelt je op de meeste terreinen op je gemak.",
      "Je rijdt wedstrijden of traint serieus en wilt een prestatiegerichte houding.",
    ]);
    const distance = QUESTIONNAIRE_QUESTIONS.find((entry) => entry.questionId === "typical_ride_length")!;
    expect(getLocalizedQuestion(distance, getDashboardMessages("nl"), "nl").helpText).toBe("Denk aan de afstand die je het vaakst rijdt — niet je langste incidentele rit.");
    render(<QuestionRenderer question={distance} value="short" onChange={vi.fn()} />);
    expect(screen.getByText(/Ontspannen \/ recreatief/)).toBeTruthy();
    expect(screen.queryByText(/Casual/)).toBeNull();
  });
  it("localizes scale endpoints and the accessible group name", () => {
    const question = QUESTIONNAIRE_QUESTIONS.find((entry) => entry.questionId === "pain_severity")!;
    render(<QuestionRenderer question={question} value={2} onChange={vi.fn()} />);
    expect(screen.getByRole("radiogroup", { name: "Kies een waarde op de schaal" })).toBeTruthy();
    expect(screen.getByText("Licht – een beetje ongemak")).toBeTruthy();
    expect(screen.queryByText(question.scaleConfig!.minLabel)).toBeNull();
  });
  it("localizes the position illustration and legacy options", () => {
    const question = QUESTIONNAIRE_QUESTIONS.find((entry) => entry.questionId === "position_priority")!;
    render(<QuestionRenderer question={question} value={null} onChange={vi.fn()} />);
    expect(screen.getByAltText("Illustratie van je fietshouding")).toBeTruthy();
    expect(screen.getByText("Comfort – lang fietsen zonder spanning")).toBeTruthy();
    expect(getLocalizedQuestion(question, getDashboardMessages("en"), "en")).toBe(question);
  });
});
