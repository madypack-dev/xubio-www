import { useQuery } from "@tanstack/vue-query";
import type { VendedoresRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useVendedoresQuery(vendedoresRepository: VendedoresRepository) {
  return useQuery({
    queryKey: queryKeys.vendedores(),
    queryFn: () => vendedoresRepository.list()
  });
}
