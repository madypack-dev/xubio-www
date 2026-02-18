import { diagnoseHttpError, type HttpErrorDiagnosis } from "./httpErrorDiagnostics";

type RetryPolicyInput = {
  failureCount: number;
  error: unknown;
  maxRetries?: number;
};

type RetryPolicyDecision = {
  allowRetry: boolean;
  diagnosis: HttpErrorDiagnosis | null;
};

export function decideHttpQueryRetry({
  failureCount,
  error,
  maxRetries = 2
}: RetryPolicyInput): RetryPolicyDecision {
  try {
    const diagnosis = diagnoseHttpError(error);
    const allowRetry = diagnosis.retryable && failureCount < maxRetries;
    return { allowRetry, diagnosis };
  } catch (diagnosticError) {
    console.error("[MVP] Fallo diagnostico de retry HTTP", {
      failureCount,
      maxRetries,
      diagnosticErrorName:
        diagnosticError instanceof Error ? diagnosticError.name : "UnknownError",
      diagnosticErrorMessage:
        diagnosticError instanceof Error
          ? diagnosticError.message
          : String(diagnosticError)
    });

    return {
      allowRetry: failureCount < 1,
      diagnosis: null
    };
  }
}

export function logHttpQueryRetryDecision(
  failureCount: number,
  decision: RetryPolicyDecision
) {
  if (!decision.diagnosis) {
    console.warn("[MVP] Retry decision fallback por diagnostico nulo", {
      failureCount,
      allowRetry: decision.allowRetry
    });
    return;
  }

  if (!decision.allowRetry) {
    console.warn("[MVP] Retry deshabilitado por diagnostico HTTP", {
      failureCount,
      kind: decision.diagnosis.kind,
      status: decision.diagnosis.status ?? null,
      url: decision.diagnosis.url ?? null,
      ngrokErrorCode: decision.diagnosis.ngrokErrorCode ?? null,
      requestId: decision.diagnosis.requestId ?? null
    });
    return;
  }

  console.log("[MVP] Retry habilitado por diagnostico HTTP", {
    failureCount,
    kind: decision.diagnosis.kind,
    status: decision.diagnosis.status ?? null,
    requestId: decision.diagnosis.requestId ?? null
  });
}
