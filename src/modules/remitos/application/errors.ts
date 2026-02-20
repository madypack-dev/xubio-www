export class RemitosLoadError extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super("No se pudieron cargar los remitos.");
    this.name = "RemitosLoadError";
    this.cause = cause;
  }
}
