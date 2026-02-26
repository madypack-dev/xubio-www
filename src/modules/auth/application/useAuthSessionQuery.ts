import { useQuery } from "@tanstack/vue-query";
import type { AuthRepository } from "../domain";
import { queryKeys } from "@/shared/lib/queryKeys";

export function useAuthSessionQuery(authRepository: AuthRepository) {
  return useQuery({
    queryKey: queryKeys.authSession(),
    queryFn: () => authRepository.getSession(),
    staleTime: 30_000
  });
}
