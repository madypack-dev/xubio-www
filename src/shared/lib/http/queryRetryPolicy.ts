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
    void diagnosticError;
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
  void failureCount;
  void decision;
}
