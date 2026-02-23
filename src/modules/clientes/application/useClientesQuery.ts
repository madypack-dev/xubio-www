import { useQuery } from "@tanstack/vue-query";
import type { ClientesRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useClientesQuery(clientesRepository: ClientesRepository) {
  return useQuery({
    queryKey: queryKeys.clientes(),
    queryFn: () => clientesRepository.list()
  });
}
