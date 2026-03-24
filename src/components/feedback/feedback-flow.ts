import type { FeedbackLocale } from "./feedback-copy";
import type { FeedbackStatus, FeedbackType } from "./feedback-api";

export type FeedbackFormState = {
  title: string;
  description: string;
  category: string;
  expectedResult: string;
  actualResult: string;
  pagePath: string;
  browserInfoJson: string;
};

export type FeedbackFieldErrors = Partial<Record<keyof FeedbackFormState | "type", string>>;

type FlowCopy = {
  dialog: {
    typePrompt: string;
    typeDescription: string;
    errorGeneric: string;
    titleLabel: string;
    descriptionLabel: string;
    expectedResultLabel: string;
    actualResultLabel: string;
  };
};

export function createEmptyFeedbackState(
  pagePath: string,
  type: FeedbackType | undefined,
  createBrowserMetadata: () => string
): FeedbackFormState {
  return {
    title: "",
    description: "",
    category: "",
    expectedResult: "",
    actualResult: "",
    pagePath,
    browserInfoJson: type === "bug" ? createBrowserMetadata() : "",
  };
}

export function buildFeedbackValidation(
  type: FeedbackType | null,
  state: FeedbackFormState,
  copy: FlowCopy
) {
  const errors: FeedbackFieldErrors = {};
  if (!type) {
    errors.type = copy.dialog.typePrompt;
    return errors;
  }

  if (!state.title.trim()) {
    errors.title = copy.dialog.titleLabel;
  }
  if (!state.description.trim()) {
    errors.description = copy.dialog.descriptionLabel;
  }
  if (type === "bug") {
    if (!state.expectedResult.trim()) {
      errors.expectedResult = copy.dialog.expectedResultLabel;
    }
    if (!state.actualResult.trim()) {
      errors.actualResult = copy.dialog.actualResultLabel;
    }
  }

  return errors;
}

export function validationMessageForField(field: string, copy: FlowCopy) {
  switch (field) {
    case "type":
      return copy.dialog.typeDescription;
    case "title":
      return `${copy.dialog.titleLabel} is required.`;
    case "description":
      return `${copy.dialog.descriptionLabel} is required.`;
    case "expectedResult":
      return `${copy.dialog.expectedResultLabel} is required.`;
    case "actualResult":
      return `${copy.dialog.actualResultLabel} is required.`;
    default:
      return copy.dialog.errorGeneric;
  }
}

export function getFeedbackGuidedPrompts(type: FeedbackType, locale: FeedbackLocale) {
  const prompts =
    locale === "nl"
      ? {
          tryingToDo: "Wat probeerde je te doen?",
          happenedInstead: "Wat gebeurde er in plaats daarvan?",
          better: "Wat had dit beter gemaakt?",
        }
      : {
          tryingToDo: "What were you trying to do?",
          happenedInstead: "What happened instead?",
          better: "What would have made this better?",
        };

  if (type === "review") {
    return [prompts.tryingToDo, prompts.better];
  }

  if (type === "feature_request") {
    return [prompts.tryingToDo, prompts.better];
  }

  return [prompts.tryingToDo, prompts.happenedInstead];
}

export function getFeedbackStatusDescription(status: FeedbackStatus, locale: FeedbackLocale) {
  const labels =
    locale === "nl"
      ? {
          new: "We hebben je feedback ontvangen.",
          triaged: "We hebben je feedback beoordeeld en in de juiste stroom geplaatst.",
          needs_info: "We hebben waarschijnlijk extra context nodig voordat we verder kunnen.",
          planned: "Dit staat op de planning voor een volgende stap of release.",
          in_progress: "We werken hier actief aan.",
          in_qa: "De oplossing wordt gecontroleerd voordat deze wordt vrijgegeven.",
          released: "Dit is verwerkt in een live of uitrollende release.",
          closed: "Dit onderwerp is afgerond.",
          declined: "We pakken dit nu niet op, maar je feedback blijft waardevol.",
        }
      : {
          new: "We have received your feedback.",
          triaged: "We reviewed it and placed it in the right workflow.",
          needs_info: "We likely need a bit more context before moving forward.",
          planned: "This is planned for a future step or release.",
          in_progress: "We are actively working on it.",
          in_qa: "The fix or change is being checked before release.",
          released: "This has been included in a live or rolling-out release.",
          closed: "This item has been completed.",
          declined: "We are not planning this right now, but the feedback still matters.",
        };

  return labels[status];
}
