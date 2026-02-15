/**
 * Question Definitions for Bike Fit Questionnaire
 * These define the dynamic questions asked during a fit session
 */

export interface QuestionDefinition {
  questionId: string;
  category: string;
  questionText: string;
  helpText?: string;
  responseType: "single_choice" | "multiple_choice" | "numeric" | "text" | "scale";
  options?: Array<{
    value: string;
    label: string;
    followUpQuestionIds?: string[];
  }>;
  numericConfig?: {
    min?: number;
    max?: number;
    unit?: string;
  };
  scaleConfig?: {
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
  };
  showCondition?: {
    dependsOnQuestionId: string;
    requiredValues: string[];
  };
  baseOrder: number;
  isRequired: boolean;
}

/**
 * Core questionnaire questions
 */
export const QUESTIONNAIRE_QUESTIONS: QuestionDefinition[] = [
  // ========================================
  // RIDING CONTEXT
  // ========================================
  {
    questionId: "experience_level",
    category: "riding_context",
    questionText: "How would you describe your cycling experience?",
    helpText: "This helps us adjust recommendations for your skill level",
    responseType: "single_choice",
    options: [
      {
        value: "beginner",
        label: "Beginner - New to cycling or returning after a long break",
      },
      {
        value: "intermediate",
        label: "Intermediate - Regular rider, comfortable on most terrain",
      },
      {
        value: "advanced",
        label: "Advanced - Experienced cyclist, races or trains seriously",
      },
    ],
    baseOrder: 10,
    isRequired: true,
  },
  {
    questionId: "weekly_hours",
    category: "riding_context",
    questionText: "How many hours per week do you typically ride?",
    responseType: "single_choice",
    options: [
      { value: "0-3", label: "0-3 hours" },
      { value: "3-6", label: "3-6 hours" },
      { value: "6-10", label: "6-10 hours" },
      { value: "10-15", label: "10-15 hours" },
      { value: "15+", label: "More than 15 hours" },
    ],
    baseOrder: 20,
    isRequired: true,
  },
  {
    questionId: "typical_ride_length",
    category: "riding_context",
    questionText: "What is your typical ride distance?",
    responseType: "single_choice",
    options: [
      { value: "short", label: "Short rides (under 30km / 20mi)" },
      { value: "medium", label: "Medium rides (30-80km / 20-50mi)" },
      { value: "long", label: "Long rides (80-150km / 50-100mi)" },
      { value: "ultra", label: "Ultra-distance (150km+ / 100mi+)" },
    ],
    baseOrder: 30,
    isRequired: true,
  },

  // ========================================
  // PAIN POINTS
  // ========================================
  {
    questionId: "has_pain",
    category: "pain_points",
    questionText: "Do you experience any discomfort or pain while cycling?",
    helpText: "Identifying pain points helps us recommend targeted adjustments",
    responseType: "single_choice",
    options: [
      {
        value: "yes",
        label: "Yes, I have some discomfort",
        followUpQuestionIds: ["pain_areas"],
      },
      { value: "no", label: "No, I'm comfortable" },
    ],
    baseOrder: 40,
    isRequired: true,
  },
  {
    questionId: "pain_areas",
    category: "pain_points",
    questionText: "Where do you experience discomfort? (Select all that apply)",
    responseType: "multiple_choice",
    options: [
      {
        value: "knee_front",
        label: "Front of knee",
        followUpQuestionIds: ["knee_pain_timing"],
      },
      {
        value: "knee_back",
        label: "Back of knee",
        followUpQuestionIds: ["knee_pain_timing"],
      },
      { value: "lower_back", label: "Lower back" },
      { value: "neck", label: "Neck or shoulders" },
      { value: "hands", label: "Hands (numbness or pain)" },
      { value: "saddle", label: "Saddle area" },
      { value: "feet", label: "Feet (hot foot, numbness)" },
    ],
    showCondition: {
      dependsOnQuestionId: "has_pain",
      requiredValues: ["yes"],
    },
    baseOrder: 50,
    isRequired: false,
  },
  {
    questionId: "knee_pain_timing",
    category: "pain_points",
    questionText: "When does your knee pain typically occur?",
    responseType: "single_choice",
    options: [
      { value: "start", label: "At the start of rides" },
      { value: "during", label: "During longer rides" },
      { value: "climbing", label: "When climbing" },
      { value: "always", label: "Throughout the ride" },
    ],
    showCondition: {
      dependsOnQuestionId: "pain_areas",
      requiredValues: ["knee_front", "knee_back"],
    },
    baseOrder: 55,
    isRequired: false,
  },
  {
    questionId: "pain_severity",
    category: "pain_points",
    questionText: "How severe is your most significant discomfort?",
    responseType: "scale",
    scaleConfig: {
      min: 1,
      max: 5,
      minLabel: "Mild - minor annoyance",
      maxLabel: "Severe - limits my riding",
    },
    showCondition: {
      dependsOnQuestionId: "has_pain",
      requiredValues: ["yes"],
    },
    baseOrder: 60,
    isRequired: false,
  },

  // ========================================
  // POSITION PREFERENCES
  // ========================================
  {
    questionId: "position_priority",
    category: "position",
    questionText: "What's most important to you in your riding position?",
    responseType: "single_choice",
    options: [
      {
        value: "comfort",
        label: "Maximum comfort - I want to enjoy long rides without strain",
      },
      {
        value: "balanced",
        label: "Balance - Good mix of comfort and efficiency",
      },
      {
        value: "performance",
        label: "Performance - I'm willing to sacrifice some comfort for speed",
      },
    ],
    baseOrder: 70,
    isRequired: true,
  },
  {
    questionId: "current_position_feeling",
    category: "position",
    questionText: "How does your current bike position feel?",
    helpText: "If you don't have a current bike, select 'No current bike'",
    responseType: "single_choice",
    options: [
      { value: "too_stretched", label: "Too stretched out - reaching too far" },
      { value: "too_compact", label: "Too compact - feel cramped" },
      { value: "too_low", label: "Handlebars feel too low" },
      { value: "too_high", label: "Handlebars feel too high" },
      { value: "good", label: "Generally good, minor tweaks needed" },
      { value: "no_bike", label: "No current bike / not sure" },
    ],
    baseOrder: 80,
    isRequired: true,
  },

  // ========================================
  // BIKE-SPECIFIC (shown based on bike type)
  // ========================================
  {
    questionId: "road_riding_type",
    category: "bike_specific",
    questionText: "What type of road riding do you primarily do?",
    responseType: "single_choice",
    options: [
      { value: "casual", label: "Casual rides and fitness" },
      { value: "group", label: "Group rides and sportives" },
      { value: "training", label: "Structured training" },
      { value: "racing", label: "Racing (crits, road races)" },
      { value: "tt", label: "Time trials / triathlon" },
    ],
    baseOrder: 90,
    isRequired: false,
  },
  {
    questionId: "mtb_terrain",
    category: "bike_specific",
    questionText: "What terrain do you primarily ride?",
    responseType: "single_choice",
    options: [
      { value: "xc", label: "Cross-country (smooth trails, climbing)" },
      { value: "trail", label: "Trail (varied terrain, some technical)" },
      { value: "enduro", label: "Enduro (technical descents, big climbs)" },
      { value: "dh", label: "Downhill / bike park" },
    ],
    baseOrder: 95,
    isRequired: false,
  },

  // ========================================
  // ADDITIONAL CONTEXT
  // ========================================
  {
    questionId: "injury_history",
    category: "health",
    questionText: "Do you have any injuries or conditions affecting your riding?",
    responseType: "single_choice",
    options: [
      { value: "none", label: "No injuries or conditions" },
      {
        value: "back",
        label: "Back issues (herniated disc, chronic pain)",
      },
      { value: "knee", label: "Knee issues (previous injury, arthritis)" },
      { value: "hip", label: "Hip issues (flexibility, replacement)" },
      { value: "shoulder", label: "Shoulder/neck issues" },
      { value: "other", label: "Other condition" },
    ],
    baseOrder: 100,
    isRequired: false,
  },
  {
    questionId: "flexibility_confidence",
    category: "health",
    questionText: "How confident are you in your flexibility assessment?",
    helpText: "We asked about flexibility earlier - this helps us weight that data",
    responseType: "single_choice",
    options: [
      { value: "very", label: "Very confident - I tested properly" },
      { value: "somewhat", label: "Somewhat confident - rough estimate" },
      { value: "unsure", label: "Not sure - I guessed" },
    ],
    baseOrder: 110,
    isRequired: false,
  },
];

/**
 * Get questions for a specific category
 */
export function getQuestionsByCategory(category: string): QuestionDefinition[] {
  return QUESTIONNAIRE_QUESTIONS.filter((q) => q.category === category).sort(
    (a, b) => a.baseOrder - b.baseOrder
  );
}

/**
 * Get all active questions sorted by order
 */
export function getAllQuestions(): QuestionDefinition[] {
  return [...QUESTIONNAIRE_QUESTIONS].sort((a, b) => a.baseOrder - b.baseOrder);
}

/**
 * Get a question by ID
 */
export function getQuestionById(questionId: string): QuestionDefinition | undefined {
  return QUESTIONNAIRE_QUESTIONS.find((q) => q.questionId === questionId);
}
