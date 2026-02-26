export type DepositoId = string;

export type Deposito = {
  depositoId: DepositoId | null;
  nombre: string;
  raw: Record<string, unknown>;
};

export interface DepositosRepository {
  list(): Promise<Deposito[]>;
}
