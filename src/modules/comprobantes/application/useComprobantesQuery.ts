import { useQuery } from "@tanstack/vue-query";
import type { ComprobantesRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useComprobantesQuery(
  comprobantesRepository: ComprobantesRepository
) {
  return useQuery({
    queryKey: queryKeys.comprobantes(),
    queryFn: () => comprobantesRepository.list()
  });
}
