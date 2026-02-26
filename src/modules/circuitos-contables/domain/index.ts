export type CircuitoContableId = string;

export type CircuitoContable = {
  circuitoContableId: CircuitoContableId | null;
  nombre: string;
  codigo: string;
  raw: Record<string, unknown>;
};

export interface CircuitosContablesRepository {
  list(): Promise<CircuitoContable[]>;
}
