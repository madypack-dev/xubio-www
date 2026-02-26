import { useQuery } from "@tanstack/vue-query";
import type { CircuitosContablesRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useCircuitosContablesQuery(
  circuitosContablesRepository: CircuitosContablesRepository
) {
  return useQuery({
    queryKey: queryKeys.circuitosContables(),
    queryFn: () => circuitosContablesRepository.list()
  });
}
