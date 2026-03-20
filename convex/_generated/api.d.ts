/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics_mutations from "../analytics/mutations.js";
import type * as analytics_queries from "../analytics/queries.js";
import type * as auth from "../auth.js";
import type * as authRateLimit from "../authRateLimit.js";
import type * as bikeProfiles_defaults from "../bikeProfiles/defaults.js";
import type * as bikeProfiles_mutations from "../bikeProfiles/mutations.js";
import type * as bikeProfiles_queries from "../bikeProfiles/queries.js";
import type * as bikes_mutations from "../bikes/mutations.js";
import type * as bikes_queries from "../bikes/queries.js";
import type * as emails_actions from "../emails/actions.js";
import type * as emails_mutations from "../emails/mutations.js";
import type * as emails_queries from "../emails/queries.js";
import type * as files_actions from "../files/actions.js";
import type * as http from "../http.js";
import type * as integrations_actions from "../integrations/actions.js";
import type * as integrations_mutations from "../integrations/mutations.js";
import type * as integrations_queries from "../integrations/queries.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_brand from "../lib/brand.js";
import type * as lib_fitAlgorithm_calculations from "../lib/fitAlgorithm/calculations.js";
import type * as lib_fitAlgorithm_constants from "../lib/fitAlgorithm/constants.js";
import type * as lib_fitAlgorithm_index from "../lib/fitAlgorithm/index.js";
import type * as lib_fitAlgorithm_types from "../lib/fitAlgorithm/types.js";
import type * as lib_fitAlgorithm_validation from "../lib/fitAlgorithm/validation.js";
import type * as lib_pressureFitInteraction from "../lib/pressureFitInteraction.js";
import type * as lib_pressureStaleness from "../lib/pressureStaleness.js";
import type * as lib_validation from "../lib/validation.js";
import type * as pressureCalculations_mutations from "../pressureCalculations/mutations.js";
import type * as pressureCalculations_queries from "../pressureCalculations/queries.js";
import type * as pressureProfiles_mutations from "../pressureProfiles/mutations.js";
import type * as pressureProfiles_queries from "../pressureProfiles/queries.js";
import type * as profiles_index from "../profiles/index.js";
import type * as profiles_mutations from "../profiles/mutations.js";
import type * as profiles_queries from "../profiles/queries.js";
import type * as questionnaire_mutations from "../questionnaire/mutations.js";
import type * as questionnaire_queries from "../questionnaire/queries.js";
import type * as questionnaire_questions from "../questionnaire/questions.js";
import type * as questionnaire_responseValidation from "../questionnaire/responseValidation.js";
import type * as recommendations_actions from "../recommendations/actions.js";
import type * as recommendations_inputMapping from "../recommendations/inputMapping.js";
import type * as recommendations_internalMutations from "../recommendations/internalMutations.js";
import type * as recommendations_mutations from "../recommendations/mutations.js";
import type * as recommendations_queries from "../recommendations/queries.js";
import type * as recommendations_refinement from "../recommendations/refinement.js";
import type * as recommendations_seedEngine from "../recommendations/seedEngine.js";
import type * as recommendations_shadowMode from "../recommendations/shadowMode.js";
import type * as reportRateLimit from "../reportRateLimit.js";
import type * as rideFeedback_mutations from "../rideFeedback/mutations.js";
import type * as rideFeedback_queries from "../rideFeedback/queries.js";
import type * as sessions_mutations from "../sessions/mutations.js";
import type * as sessions_queries from "../sessions/queries.js";
import type * as tireSetups_mutations from "../tireSetups/mutations.js";
import type * as tireSetups_queries from "../tireSetups/queries.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";
import type * as validationCaptures_mutations from "../validationCaptures/mutations.js";
import type * as validationCaptures_queries from "../validationCaptures/queries.js";
import type * as wheelsets_mutations from "../wheelsets/mutations.js";
import type * as wheelsets_queries from "../wheelsets/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "analytics/mutations": typeof analytics_mutations;
  "analytics/queries": typeof analytics_queries;
  auth: typeof auth;
  authRateLimit: typeof authRateLimit;
  "bikeProfiles/defaults": typeof bikeProfiles_defaults;
  "bikeProfiles/mutations": typeof bikeProfiles_mutations;
  "bikeProfiles/queries": typeof bikeProfiles_queries;
  "bikes/mutations": typeof bikes_mutations;
  "bikes/queries": typeof bikes_queries;
  "emails/actions": typeof emails_actions;
  "emails/mutations": typeof emails_mutations;
  "emails/queries": typeof emails_queries;
  "files/actions": typeof files_actions;
  http: typeof http;
  "integrations/actions": typeof integrations_actions;
  "integrations/mutations": typeof integrations_mutations;
  "integrations/queries": typeof integrations_queries;
  "lib/authz": typeof lib_authz;
  "lib/brand": typeof lib_brand;
  "lib/fitAlgorithm/calculations": typeof lib_fitAlgorithm_calculations;
  "lib/fitAlgorithm/constants": typeof lib_fitAlgorithm_constants;
  "lib/fitAlgorithm/index": typeof lib_fitAlgorithm_index;
  "lib/fitAlgorithm/types": typeof lib_fitAlgorithm_types;
  "lib/fitAlgorithm/validation": typeof lib_fitAlgorithm_validation;
  "lib/pressureFitInteraction": typeof lib_pressureFitInteraction;
  "lib/pressureStaleness": typeof lib_pressureStaleness;
  "lib/validation": typeof lib_validation;
  "pressureCalculations/mutations": typeof pressureCalculations_mutations;
  "pressureCalculations/queries": typeof pressureCalculations_queries;
  "pressureProfiles/mutations": typeof pressureProfiles_mutations;
  "pressureProfiles/queries": typeof pressureProfiles_queries;
  "profiles/index": typeof profiles_index;
  "profiles/mutations": typeof profiles_mutations;
  "profiles/queries": typeof profiles_queries;
  "questionnaire/mutations": typeof questionnaire_mutations;
  "questionnaire/queries": typeof questionnaire_queries;
  "questionnaire/questions": typeof questionnaire_questions;
  "questionnaire/responseValidation": typeof questionnaire_responseValidation;
  "recommendations/actions": typeof recommendations_actions;
  "recommendations/inputMapping": typeof recommendations_inputMapping;
  "recommendations/internalMutations": typeof recommendations_internalMutations;
  "recommendations/mutations": typeof recommendations_mutations;
  "recommendations/queries": typeof recommendations_queries;
  "recommendations/refinement": typeof recommendations_refinement;
  "recommendations/seedEngine": typeof recommendations_seedEngine;
  "recommendations/shadowMode": typeof recommendations_shadowMode;
  reportRateLimit: typeof reportRateLimit;
  "rideFeedback/mutations": typeof rideFeedback_mutations;
  "rideFeedback/queries": typeof rideFeedback_queries;
  "sessions/mutations": typeof sessions_mutations;
  "sessions/queries": typeof sessions_queries;
  "tireSetups/mutations": typeof tireSetups_mutations;
  "tireSetups/queries": typeof tireSetups_queries;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
  "validationCaptures/mutations": typeof validationCaptures_mutations;
  "validationCaptures/queries": typeof validationCaptures_queries;
  "wheelsets/mutations": typeof wheelsets_mutations;
  "wheelsets/queries": typeof wheelsets_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
