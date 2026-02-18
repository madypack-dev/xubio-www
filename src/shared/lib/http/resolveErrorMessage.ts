import { diagnoseHttpError } from "./httpErrorDiagnostics";

export function resolveErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  const diagnosis = diagnoseHttpError(error, fallbackMessage);
  return diagnosis.userMessage;
}
