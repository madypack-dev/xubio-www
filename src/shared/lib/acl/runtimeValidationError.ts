import type { ZodError } from "zod";

export class RuntimeValidationError extends Error {
  readonly context: string;
  readonly issues: string[];

  constructor(context: string, error: ZodError) {
    const issues = error.issues.map(
      (issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`
    );
    super(`Payload invalido en ${context}`);
    this.name = "RuntimeValidationError";
    this.context = context;
    this.issues = issues;
  }
}
