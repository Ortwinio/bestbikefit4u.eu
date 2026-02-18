/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as authBackdoor from "../authBackdoor.js";
import type * as bikes_mutations from "../bikes/mutations.js";
import type * as bikes_queries from "../bikes/queries.js";
import type * as emails_actions from "../emails/actions.js";
import type * as emails_mutations from "../emails/mutations.js";
import type * as emails_queries from "../emails/queries.js";
import type * as http from "../http.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_fitAlgorithm_calculations from "../lib/fitAlgorithm/calculations.js";
import type * as lib_fitAlgorithm_constants from "../lib/fitAlgorithm/constants.js";
import type * as lib_fitAlgorithm_index from "../lib/fitAlgorithm/index.js";
import type * as lib_fitAlgorithm_types from "../lib/fitAlgorithm/types.js";
import type * as lib_fitAlgorithm_validation from "../lib/fitAlgorithm/validation.js";
import type * as lib_validation from "../lib/validation.js";
import type * as profiles_index from "../profiles/index.js";
import type * as profiles_mutations from "../profiles/mutations.js";
import type * as profiles_queries from "../profiles/queries.js";
import type * as questionnaire_mutations from "../questionnaire/mutations.js";
import type * as questionnaire_queries from "../questionnaire/queries.js";
import type * as questionnaire_questions from "../questionnaire/questions.js";
import type * as questionnaire_responseValidation from "../questionnaire/responseValidation.js";
import type * as recommendations_actions from "../recommendations/actions.js";
import type * as recommendations_inputMapping from "../recommendations/inputMapping.js";
import type * as recommendations_mutations from "../recommendations/mutations.js";
import type * as recommendations_queries from "../recommendations/queries.js";
import type * as sessions_mutations from "../sessions/mutations.js";
import type * as sessions_queries from "../sessions/queries.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  authBackdoor: typeof authBackdoor;
  "bikes/mutations": typeof bikes_mutations;
  "bikes/queries": typeof bikes_queries;
  "emails/actions": typeof emails_actions;
  "emails/mutations": typeof emails_mutations;
  "emails/queries": typeof emails_queries;
  http: typeof http;
  "lib/authz": typeof lib_authz;
  "lib/fitAlgorithm/calculations": typeof lib_fitAlgorithm_calculations;
  "lib/fitAlgorithm/constants": typeof lib_fitAlgorithm_constants;
  "lib/fitAlgorithm/index": typeof lib_fitAlgorithm_index;
  "lib/fitAlgorithm/types": typeof lib_fitAlgorithm_types;
  "lib/fitAlgorithm/validation": typeof lib_fitAlgorithm_validation;
  "lib/validation": typeof lib_validation;
  "profiles/index": typeof profiles_index;
  "profiles/mutations": typeof profiles_mutations;
  "profiles/queries": typeof profiles_queries;
  "questionnaire/mutations": typeof questionnaire_mutations;
  "questionnaire/queries": typeof questionnaire_queries;
  "questionnaire/questions": typeof questionnaire_questions;
  "questionnaire/responseValidation": typeof questionnaire_responseValidation;
  "recommendations/actions": typeof recommendations_actions;
  "recommendations/inputMapping": typeof recommendations_inputMapping;
  "recommendations/mutations": typeof recommendations_mutations;
  "recommendations/queries": typeof recommendations_queries;
  "sessions/mutations": typeof sessions_mutations;
  "sessions/queries": typeof sessions_queries;
  "users/queries": typeof users_queries;
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
