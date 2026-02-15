/**
 * Backend input validation helpers.
 * These provide defense-in-depth against oversized inputs
 * that bypass frontend validation.
 */

const MAX_SHORT_STRING = 100;
const MAX_TEXT_STRING = 500;

export function validateStringLength(
  value: string,
  fieldName: string,
  maxLength: number = MAX_TEXT_STRING
): void {
  if (value.length > maxLength) {
    throw new Error(
      `${fieldName} exceeds maximum length of ${maxLength} characters`
    );
  }
}

export function validateShortString(value: string, fieldName: string): void {
  validateStringLength(value, fieldName, MAX_SHORT_STRING);
}

export function validateTextString(value: string, fieldName: string): void {
  validateStringLength(value, fieldName, MAX_TEXT_STRING);
}
