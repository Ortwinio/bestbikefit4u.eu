import type { FeedbackLocale } from "./feedback-copy";
import type { FeedbackStatus, FeedbackType, SubmitFeedbackArgs } from "./feedback-api";
import type { FeedbackActivityEntry } from "./feedback-activity";

export type FeedbackFormState = {
  title: string;
  description: string;
  category: string;
  expectedResult: string;
  actualResult: string;
  pagePath: string;
  browserInfoJson: string;
  contactEmail: string;
  contactName: string;
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
    contactEmailLabel: string;
    contactNameLabel: string;
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
    browserInfoJson:
      type === "bug" || type === "support_case" ? createBrowserMetadata() : "",
    contactEmail: "",
    contactName: "",
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

export function buildFeedbackSubmissionPayload({
  type,
  form,
  locale,
  pathname,
  pageUrl,
  queryString,
  routeFamily,
  activityTrail,
  activitySummary,
  isAuthenticated,
  linkedSessionId,
  linkedBikeId,
}: {
  type: FeedbackType;
  form: FeedbackFormState;
  locale: FeedbackLocale;
  pathname: string;
  pageUrl?: string;
  queryString?: string;
  routeFamily: SubmitFeedbackArgs["routeFamily"];
  activityTrail: FeedbackActivityEntry[];
  activitySummary?: string;
  isAuthenticated: boolean;
  linkedSessionId?: SubmitFeedbackArgs["linkedSessionId"];
  linkedBikeId?: SubmitFeedbackArgs["linkedBikeId"];
}): SubmitFeedbackArgs {
  const browserInfoRequired = type === "bug" || type === "support_case";
  const trimmedCategory = form.category.trim();
  const trimmedContactEmail = form.contactEmail.trim();
  const trimmedContactName = form.contactName.trim();
  const trimmedTitle = form.title.trim();
  const trimmedDescription = form.description.trim();

  return {
    type,
    title: trimmedTitle,
    description: trimmedDescription,
    category: type === "review" || !trimmedCategory ? undefined : trimmedCategory,
    pageUrl: pageUrl?.trim() || undefined,
    pathname: pathname.trim() || undefined,
    queryString: queryString?.trim() || undefined,
    locale,
    pagePath: form.pagePath.trim() || undefined,
    routeFamily,
    activitySummary,
    activityTrailJson:
      activityTrail.length > 0 ? JSON.stringify(activityTrail.slice(-6)) : undefined,
    linkedSessionId,
    linkedBikeId,
    contactEmail: isAuthenticated || !trimmedContactEmail ? undefined : trimmedContactEmail,
    contactName: isAuthenticated || !trimmedContactName ? undefined : trimmedContactName,
    expectedResult: type === "bug" ? form.expectedResult.trim() || undefined : undefined,
    actualResult: type === "bug" ? form.actualResult.trim() || undefined : undefined,
    browserInfoJson:
      browserInfoRequired ? form.browserInfoJson.trim() || undefined : undefined,
  };
}
