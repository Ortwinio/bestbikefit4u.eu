import type { BikeType } from "@/lib/bikes";

export type MarktplaatsFieldConfidence = "high" | "medium" | "low" | "none";

export type MarktplaatsFieldSource =
  | "structured_data"
  | "canonical_meta"
  | "open_graph"
  | "html_selector"
  | "title_normalization"
  | "description_keywords"
  | "url_validation"
  | "none";

export type MarktplaatsParserErrorCode =
  | "unsupported_url"
  | "fetch_failed"
  | "unexpected_status"
  | "non_html_response"
  | "response_too_large"
  | "not_an_advert"
  | "missing_advert_title";

export type MarktplaatsParserError = {
  code: MarktplaatsParserErrorCode;
  message: string;
  status?: number;
  retryable: boolean;
};

export type ParsedField<T> = {
  value: T | null;
  confidence: MarktplaatsFieldConfidence;
  source: MarktplaatsFieldSource;
  needsReview: boolean;
  reasons: string[];
};

export type ParsedMarktplaatsAdvert = {
  sourceName: "marktplaats";
  sourceUrl: string;
  canonicalUrl: string;
  advertTitle: string;
  description: string;
  imageUrls: string[];
  candidateBrand: ParsedField<string>;
  candidateModel: ParsedField<string>;
  candidateBikeType: ParsedField<BikeType>;
};

export type MarktplaatsParseSuccess = {
  ok: true;
  advert: ParsedMarktplaatsAdvert;
};

export type MarktplaatsParseFailure = {
  ok: false;
  error: MarktplaatsParserError;
};

export type MarktplaatsParseResult =
  | MarktplaatsParseSuccess
  | MarktplaatsParseFailure;

export type MarktplaatsFetchOptions = {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxBytes?: number;
};
