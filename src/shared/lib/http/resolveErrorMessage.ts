import { diagnoseHttpError } from "./httpErrorDiagnostics";

function unwrapErrorCause(error: unknown): unknown {
  if (!error || typeof error !== "object") {
    return error;
  }

  const maybeCause = (error as { cause?: unknown }).cause;
  if (maybeCause === undefined) {
    return error;
  }
  return maybeCause;
}

export function resolveErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  const diagnosis = diagnoseHttpError(unwrapErrorCause(error), fallbackMessage);
  return diagnosis.userMessage;
}
