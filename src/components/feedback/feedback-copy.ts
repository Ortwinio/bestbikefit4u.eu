export type FeedbackLocale = "en" | "nl";

type FeedbackCopy = {
  page: {
    title: string;
    subtitle: string;
    primaryCta: string;
    floatingCta: string;
    dashboardHint: string;
    backToDashboard: string;
  };
    tabs: {
      mine: string;
      board: string;
      changelog: string;
    };
  dialog: {
    title: string;
    subtitle: string;
    mission: string;
    chooseTypeTitle: string;
    chooseTypeSubtitle: string;
    formTitle: string;
    formSubtitle: string;
    successTitle: string;
    successSubtitle: string;
    nextStepsTitle: string;
    nextSteps: string[];
    guidedPromptsTitle: string;
    submit: string;
    submitting: string;
    submitAnother: string;
    close: string;
    back: string;
    changeType: string;
    errorGeneric: string;
    typePrompt: string;
    typeDescription: string;
    pagePathLabel: string;
    browserInfoLabel: string;
    browserInfoHelper: string;
    technicalDetailsLabel: string;
    technicalDetailsHint: string;
    contactEmailLabel: string;
    contactNameLabel: string;
    categoryHelper: string;
    placeholders: {
      bugTitle: string;
      featureRequestTitle: string;
      supportCaseTitle: string;
      reviewTitle: string;
      description: string;
      category: string;
      expectedResult: string;
      actualResult: string;
      pagePath: string;
      browserInfo: string;
      contactEmail: string;
      contactName: string;
    };
    linkedContextLabel: string;
    linkedSessionLabel: string;
    linkedBikeLabel: string;
    titleLabel: string;
    descriptionLabel: string;
    categoryLabel: string;
    expectedResultLabel: string;
    actualResultLabel: string;
  };
  types: Record<"bug" | "feature_request" | "support_case" | "review", { label: string; description: string }>;
  statuses: Record<
    "new" | "triaged" | "needs_info" | "planned" | "in_progress" | "in_qa" | "released" | "closed" | "declined",
    string
  >;
  releaseStatuses: Record<"rolling_out" | "live", string>;
  releaseTypes: Record<
    "app" | "fit_engine" | "geometry_data" | "content" | "integration" | "internal",
    string
  >;
  actions: {
    viewDetails: string;
    upvote: string;
    removeVote: string;
    openFeedback: string;
    emptySubmit: string;
    requesters: string;
    votes: string;
  };
  states: {
    loading: string;
    emptyMineTitle: string;
    emptyMineDescription: string;
    emptyBoardTitle: string;
    emptyBoardDescription: string;
    emptyChangelogTitle: string;
    emptyChangelogDescription: string;
    detailLoading: string;
    comments: string;
    noComments: string;
    releaseNotes: string;
    linkedRelease: string;
    shippedItems: string;
    detailNotFound: string;
    voteError: string;
    commentAuthorFallback: string;
  };
};

const feedbackCopyByLocale: Record<FeedbackLocale, FeedbackCopy> = {
  en: {
    page: {
      title: "Feedback portal",
      subtitle:
        "Track your reports, vote on ideas, and stay close to what improves the ride.",
      primaryCta: "Submit feedback",
      floatingCta: "Give feedback",
      dashboardHint: "Available anywhere in the dashboard.",
      backToDashboard: "Back to dashboard",
    },
    tabs: {
      mine: "My submissions",
      board: "Feature requests",
      changelog: "Changelog",
    },
    dialog: {
      title: "Submit feedback",
      subtitle: "Share what happened, what you need, or what would make BestBikeFit even better.",
      mission:
        "Together we create the BestBikeFit experience. We ride longer, hurt less often, and perform better. Your feedback is food for champions.",
      chooseTypeTitle: "What do you want to share?",
      chooseTypeSubtitle: "Pick the path that fits best. We will keep it short and useful.",
      formTitle: "Add the details",
      formSubtitle: "A little context goes a long way. Keep it clear and practical.",
      successTitle: "Thank you for your feedback.",
      successSubtitle: "We review every message carefully and share updates back in your dashboard when relevant.",
      nextStepsTitle: "What happens next",
      nextSteps: [
        "We review your feedback and place it in the right workflow.",
        "If the team replies, you will see it in your dashboard.",
        "When a fix or improvement ships, we can link it back to your report.",
      ],
      guidedPromptsTitle: "Helpful prompts",
      submit: "Send feedback",
      submitting: "Sending...",
      submitAnother: "Send another",
      close: "Close",
      back: "Back",
      changeType: "Change type",
      errorGeneric: "Please fix the highlighted fields before sending.",
      typePrompt: "Select one",
      typeDescription: "You can switch later before you send it.",
      pagePathLabel: "Page path",
      browserInfoLabel: "Browser metadata",
      browserInfoHelper: "Captured automatically for bug reports and support diagnostics.",
      technicalDetailsLabel: "Technical details",
      technicalDetailsHint:
        "Captured automatically for debugging and support. You do not need to edit this.",
      contactEmailLabel: "Contact email",
      contactNameLabel: "Name",
      categoryHelper: "Optional, but useful when the issue belongs to a specific area.",
      placeholders: {
        bugTitle: "Crash when saving a bike",
        featureRequestTitle: "Add keyboard shortcuts",
        supportCaseTitle: "Need help connecting Strava",
        reviewTitle: "This really helped my riding position",
        description: "Tell us what you were trying to do, what happened, and what would have made it better.",
        category: "Dashboard, fit engine, data, setup...",
        expectedResult: "What should have happened?",
        actualResult: "What actually happened?",
        pagePath: "Captured from the current dashboard route.",
        browserInfo: "Collected automatically for bug reports and support cases.",
        contactEmail: "name@example.com",
        contactName: "Your name",
      },
      linkedContextLabel: "Linked context",
      linkedSessionLabel: "Fit session",
      linkedBikeLabel: "Bike",
      titleLabel: "Title",
      descriptionLabel: "Description",
      categoryLabel: "Category",
      expectedResultLabel: "Expected result",
      actualResultLabel: "Actual result",
    },
    types: {
      bug: {
        label: "Bug",
        description: "Something is broken or behaving differently than expected.",
      },
      feature_request: {
        label: "Feature request",
        description: "A new capability or improvement to the product.",
      },
      support_case: {
        label: "Support case",
        description: "A question or setup issue you want help with.",
      },
      review: {
        label: "Review",
        description: "Share what felt great or what improved your riding experience.",
      },
    },
    statuses: {
      new: "Received",
      triaged: "Under review",
      needs_info: "Needs info",
      planned: "Planned",
      in_progress: "In progress",
      in_qa: "Testing",
      released: "Released",
      closed: "Closed",
      declined: "Not planned",
    },
    releaseStatuses: {
      rolling_out: "Rolling out",
      live: "Live",
    },
    releaseTypes: {
      app: "App",
      fit_engine: "Fit engine",
      geometry_data: "Geometry data",
      content: "Content",
      integration: "Integration",
      internal: "Internal",
    },
    actions: {
      viewDetails: "View details",
      upvote: "Upvote",
      removeVote: "Remove vote",
      openFeedback: "Open feedback",
      emptySubmit: "Submit the first item",
      requesters: "requesters",
      votes: "votes",
    },
    states: {
      loading: "Loading feedback...",
      emptyMineTitle: "No submissions yet",
      emptyMineDescription: "Send the first bug, request, or support case from this portal.",
      emptyBoardTitle: "No open feature requests",
      emptyBoardDescription: "There are no active feature requests to vote on right now.",
      emptyChangelogTitle: "No public releases",
      emptyChangelogDescription: "Published releases will appear here once they go live.",
      detailLoading: "Loading feedback details...",
      comments: "Comments",
      noComments: "No public comments yet.",
      releaseNotes: "Release notes",
      linkedRelease: "Linked release",
      shippedItems: "Shipped items",
      detailNotFound: "Feedback not found",
      voteError: "Could not update your vote right now.",
      commentAuthorFallback: "Team",
    },
  },
  nl: {
    page: {
      title: "Feedbackportaal",
      subtitle:
        "Volg je meldingen, stem op ideeën en blijf dicht bij wat jouw rit verbetert.",
      primaryCta: "Feedback sturen",
      floatingCta: "Geef feedback",
      dashboardHint: "Beschikbaar in het hele dashboard.",
      backToDashboard: "Terug naar dashboard",
    },
    tabs: {
      mine: "Mijn inzendingen",
      board: "Functieverzoeken",
      changelog: "Wijzigingslog",
    },
    dialog: {
      title: "Feedback sturen",
      subtitle: "Deel wat er gebeurde, wat je nodig hebt of wat BestBikeFit nog beter kan maken.",
      mission:
        "Samen bouwen we aan de BestBikeFit-beleving. We rijden langer, hebben minder vaak last en presteren beter. Jouw feedback is voeding voor kampioenen.",
      chooseTypeTitle: "Wat wil je delen?",
      chooseTypeSubtitle: "Kies de route die het best past. We houden het kort en bruikbaar.",
      formTitle: "Voeg de details toe",
      formSubtitle: "Een beetje context helpt al veel. Houd het duidelijk en praktisch.",
      successTitle: "Dank je wel voor je feedback.",
      successSubtitle: "We bekijken ieder bericht zorgvuldig en delen relevante updates terug in je dashboard.",
      nextStepsTitle: "Wat gebeurt er nu",
      nextSteps: [
        "We beoordelen je feedback en plaatsen die in de juiste workflow.",
        "Als het team reageert, zie je dat terug in je dashboard.",
        "Wanneer een fix of verbetering live gaat, kunnen we die aan je melding koppelen.",
      ],
      guidedPromptsTitle: "Handige denkvragen",
      submit: "Verstuur feedback",
      submitting: "Versturen...",
      submitAnother: "Nog een sturen",
      close: "Sluiten",
      back: "Terug",
      changeType: "Type wijzigen",
      errorGeneric: "Los de gemarkeerde velden op voordat je verstuurt.",
      typePrompt: "Selecteer één",
      typeDescription: "Je kunt dit later nog wijzigen vóór je verstuurt.",
      pagePathLabel: "Paginapad",
      browserInfoLabel: "Browsermetadata",
      browserInfoHelper: "Wordt automatisch vastgelegd voor bugmeldingen en supportdiagnose.",
      technicalDetailsLabel: "Technische details",
      technicalDetailsHint:
        "Wordt automatisch vastgelegd voor debugging en support. Je hoeft dit niet te bewerken.",
      contactEmailLabel: "E-mailadres",
      contactNameLabel: "Naam",
      categoryHelper: "Optioneel, maar handig wanneer het probleem bij een specifiek onderdeel hoort.",
      placeholders: {
        bugTitle: "Crash bij het opslaan van een fiets",
        featureRequestTitle: "Sneltoetsen toevoegen",
        supportCaseTitle: "Hulp nodig bij Strava-koppeling",
        reviewTitle: "Dit hielp mijn fietspositie echt vooruit",
        description: "Vertel wat je probeerde te doen, wat er gebeurde en wat dit beter had gemaakt.",
        category: "Dashboard, fit engine, data, setup...",
        expectedResult: "Wat had er moeten gebeuren?",
        actualResult: "Wat gebeurde er daadwerkelijk?",
        pagePath: "Overgenomen van de huidige dashboardroute.",
        browserInfo: "Automatisch verzameld voor bugmeldingen en supportvragen.",
        contactEmail: "naam@voorbeeld.nl",
        contactName: "Je naam",
      },
      linkedContextLabel: "Gekoppelde context",
      linkedSessionLabel: "Fitsessie",
      linkedBikeLabel: "Fiets",
      titleLabel: "Titel",
      descriptionLabel: "Beschrijving",
      categoryLabel: "Categorie",
      expectedResultLabel: "Verwacht resultaat",
      actualResultLabel: "Werkelijk resultaat",
    },
    types: {
      bug: {
        label: "Bug",
        description: "Iets werkt niet of gedraagt zich anders dan verwacht.",
      },
      feature_request: {
        label: "Functieverzoek",
        description: "Een nieuwe mogelijkheid of verbetering van het product.",
      },
      support_case: {
        label: "Supportcase",
        description: "Een vraag of installatieprobleem waarbij je hulp wilt.",
      },
      review: {
        label: "Review",
        description: "Deel wat goed voelde of wat jouw rijervaring beter maakte.",
      },
    },
    statuses: {
      new: "Ontvangen",
      triaged: "In beoordeling",
      needs_info: "Meer info nodig",
      planned: "Gepland",
      in_progress: "In uitvoering",
      in_qa: "In testfase",
      released: "Uitgebracht",
      closed: "Gesloten",
      declined: "Niet gepland",
    },
    releaseStatuses: {
      rolling_out: "Uitrol bezig",
      live: "Live",
    },
    releaseTypes: {
      app: "App",
      fit_engine: "Fit-engine",
      geometry_data: "Geometriedata",
      content: "Content",
      integration: "Integratie",
      internal: "Intern",
    },
    actions: {
      viewDetails: "Details bekijken",
      upvote: "Stem omhoog",
      removeVote: "Stem verwijderen",
      openFeedback: "Feedback openen",
      emptySubmit: "Dien het eerste item in",
      requesters: "aanvragers",
      votes: "stemmen",
    },
    states: {
      loading: "Feedback laden...",
      emptyMineTitle: "Nog geen inzendingen",
      emptyMineDescription: "Stuur de eerste bug, aanvraag of supportcase vanuit dit portaal.",
      emptyBoardTitle: "Geen open feature requests",
      emptyBoardDescription: "Er zijn op dit moment geen actieve feature requests om op te stemmen.",
      emptyChangelogTitle: "Geen publieke releases",
      emptyChangelogDescription: "Uitgebrachte releases verschijnen hier zodra ze live staan.",
      detailLoading: "Feedbackdetails laden...",
      comments: "Reacties",
      noComments: "Nog geen publieke reacties.",
      releaseNotes: "Releasenotes",
      linkedRelease: "Gekoppelde release",
      shippedItems: "Uitgebrachte items",
      detailNotFound: "Feedback niet gevonden",
      voteError: "Je stem kan nu niet worden bijgewerkt.",
      commentAuthorFallback: "Team",
    },
  },
};

export function getFeedbackCopy(locale: FeedbackLocale | null | undefined) {
  return feedbackCopyByLocale[locale ?? "en"] ?? feedbackCopyByLocale.en;
}

export function getFeedbackLocale(locale: string | null | undefined): FeedbackLocale {
  return locale === "nl" ? "nl" : "en";
}

export const feedbackLocales = feedbackCopyByLocale;
