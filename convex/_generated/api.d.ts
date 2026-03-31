/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_actions from "../admin/actions.js";
import type * as admin_audit from "../admin/audit.js";
import type * as admin_authz from "../admin/authz.js";
import type * as admin_bootstrap from "../admin/bootstrap.js";
import type * as admin_mutations from "../admin/mutations.js";
import type * as admin_queries from "../admin/queries.js";
import type * as analytics_mutations from "../analytics/mutations.js";
import type * as analytics_queries from "../analytics/queries.js";
import type * as auth from "../auth.js";
import type * as authLocalDev from "../authLocalDev.js";
import type * as authRateLimit from "../authRateLimit.js";
import type * as bikeData_queries from "../bikeData/queries.js";
import type * as bikeImports_actions from "../bikeImports/actions.js";
import type * as bikeImports_mutations from "../bikeImports/mutations.js";
import type * as bikeImports_queries from "../bikeImports/queries.js";
import type * as bikeImports_shared from "../bikeImports/shared.js";
import type * as bikePhotos_mutations from "../bikePhotos/mutations.js";
import type * as bikePhotos_queries from "../bikePhotos/queries.js";
import type * as bikeProfiles_defaults from "../bikeProfiles/defaults.js";
import type * as bikeProfiles_mutations from "../bikeProfiles/mutations.js";
import type * as bikeProfiles_queries from "../bikeProfiles/queries.js";
import type * as bikes_actions from "../bikes/actions.js";
import type * as bikes_description from "../bikes/description.js";
import type * as bikes_mutations from "../bikes/mutations.js";
import type * as bikes_queries from "../bikes/queries.js";
import type * as caseStudyLeads_mutations from "../caseStudyLeads/mutations.js";
import type * as crons from "../crons.js";
import type * as emails_actions from "../emails/actions.js";
import type * as emails_mutations from "../emails/mutations.js";
import type * as emails_queries from "../emails/queries.js";
import type * as feedback_mutations from "../feedback/mutations.js";
import type * as feedback_queries from "../feedback/queries.js";
import type * as feedback_shared from "../feedback/shared.js";
import type * as files_actions from "../files/actions.js";
import type * as http from "../http.js";
import type * as integrations_actions from "../integrations/actions.js";
import type * as integrations_activitySync from "../integrations/activitySync.js";
import type * as integrations_mutations from "../integrations/mutations.js";
import type * as integrations_queries from "../integrations/queries.js";
import type * as integrations_strava from "../integrations/strava.js";
import type * as integrations_stravaToken from "../integrations/stravaToken.js";
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
import type * as marktplaats_actions from "../marktplaats/actions.js";
import type * as marktplaats_mutations from "../marktplaats/mutations.js";
import type * as marktplaats_parser from "../marktplaats/parser.js";
import type * as marktplaats_queries from "../marktplaats/queries.js";
import type * as messages_mutations from "../messages/mutations.js";
import type * as messages_queries from "../messages/queries.js";
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
import type * as recommendations_bikeRoleBias from "../recommendations/bikeRoleBias.js";
import type * as recommendations_inputMapping from "../recommendations/inputMapping.js";
import type * as recommendations_internalMutations from "../recommendations/internalMutations.js";
import type * as recommendations_mutations from "../recommendations/mutations.js";
import type * as recommendations_queries from "../recommendations/queries.js";
import type * as recommendations_refinement from "../recommendations/refinement.js";
import type * as recommendations_seedEngine from "../recommendations/seedEngine.js";
import type * as recommendations_shadowMode from "../recommendations/shadowMode.js";
import type * as releases_queries from "../releases/queries.js";
import type * as reportRateLimit from "../reportRateLimit.js";
import type * as rideFeedback_mutations from "../rideFeedback/mutations.js";
import type * as rideFeedback_queries from "../rideFeedback/queries.js";
import type * as sessions_mutations from "../sessions/mutations.js";
import type * as sessions_queries from "../sessions/queries.js";
import type * as system_queries from "../system/queries.js";
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
  "admin/actions": typeof admin_actions;
  "admin/audit": typeof admin_audit;
  "admin/authz": typeof admin_authz;
  "admin/bootstrap": typeof admin_bootstrap;
  "admin/mutations": typeof admin_mutations;
  "admin/queries": typeof admin_queries;
  "analytics/mutations": typeof analytics_mutations;
  "analytics/queries": typeof analytics_queries;
  auth: typeof auth;
  authLocalDev: typeof authLocalDev;
  authRateLimit: typeof authRateLimit;
  "bikeData/queries": typeof bikeData_queries;
  "bikeImports/actions": typeof bikeImports_actions;
  "bikeImports/mutations": typeof bikeImports_mutations;
  "bikeImports/queries": typeof bikeImports_queries;
  "bikeImports/shared": typeof bikeImports_shared;
  "bikePhotos/mutations": typeof bikePhotos_mutations;
  "bikePhotos/queries": typeof bikePhotos_queries;
  "bikeProfiles/defaults": typeof bikeProfiles_defaults;
  "bikeProfiles/mutations": typeof bikeProfiles_mutations;
  "bikeProfiles/queries": typeof bikeProfiles_queries;
  "bikes/actions": typeof bikes_actions;
  "bikes/description": typeof bikes_description;
  "bikes/mutations": typeof bikes_mutations;
  "bikes/queries": typeof bikes_queries;
  "caseStudyLeads/mutations": typeof caseStudyLeads_mutations;
  crons: typeof crons;
  "emails/actions": typeof emails_actions;
  "emails/mutations": typeof emails_mutations;
  "emails/queries": typeof emails_queries;
  "feedback/mutations": typeof feedback_mutations;
  "feedback/queries": typeof feedback_queries;
  "feedback/shared": typeof feedback_shared;
  "files/actions": typeof files_actions;
  http: typeof http;
  "integrations/actions": typeof integrations_actions;
  "integrations/activitySync": typeof integrations_activitySync;
  "integrations/mutations": typeof integrations_mutations;
  "integrations/queries": typeof integrations_queries;
  "integrations/strava": typeof integrations_strava;
  "integrations/stravaToken": typeof integrations_stravaToken;
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
  "marktplaats/actions": typeof marktplaats_actions;
  "marktplaats/mutations": typeof marktplaats_mutations;
  "marktplaats/parser": typeof marktplaats_parser;
  "marktplaats/queries": typeof marktplaats_queries;
  "messages/mutations": typeof messages_mutations;
  "messages/queries": typeof messages_queries;
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
  "recommendations/bikeRoleBias": typeof recommendations_bikeRoleBias;
  "recommendations/inputMapping": typeof recommendations_inputMapping;
  "recommendations/internalMutations": typeof recommendations_internalMutations;
  "recommendations/mutations": typeof recommendations_mutations;
  "recommendations/queries": typeof recommendations_queries;
  "recommendations/refinement": typeof recommendations_refinement;
  "recommendations/seedEngine": typeof recommendations_seedEngine;
  "recommendations/shadowMode": typeof recommendations_shadowMode;
  "releases/queries": typeof releases_queries;
  reportRateLimit: typeof reportRateLimit;
  "rideFeedback/mutations": typeof rideFeedback_mutations;
  "rideFeedback/queries": typeof rideFeedback_queries;
  "sessions/mutations": typeof sessions_mutations;
  "sessions/queries": typeof sessions_queries;
  "system/queries": typeof system_queries;
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
