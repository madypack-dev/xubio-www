import { useQuery } from "@tanstack/vue-query";
import type { DepositosRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useDepositosQuery(depositosRepository: DepositosRepository) {
  return useQuery({
    queryKey: queryKeys.depositos(),
    queryFn: () => depositosRepository.list()
  });
}
