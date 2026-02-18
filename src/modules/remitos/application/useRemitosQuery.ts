import { useQuery } from "@tanstack/vue-query";
import type { RemitosRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";
import { createLoadRemitosUseCase } from "./loadRemitosUseCase";

export function useRemitosQuery(remitosRepository: RemitosRepository) {
  const loadRemitos = createLoadRemitosUseCase(remitosRepository);

  return useQuery({
    queryKey: queryKeys.remitos(),
    queryFn: loadRemitos
  });
}
