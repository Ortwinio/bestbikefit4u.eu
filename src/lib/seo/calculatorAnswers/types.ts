export interface CalculatorAnswerContent {
  answer: string;
  method: string;
  limits: string;
  example: {
    inputs: { label: string; value: string }[];
    results: { label: string; value: string }[];
  };
  mistakes: readonly string[];
}
