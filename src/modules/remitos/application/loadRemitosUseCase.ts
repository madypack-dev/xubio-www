import type { RemitosRepository } from "../domain";
import { RemitosLoadError } from "./errors";

export function createLoadRemitosUseCase(remitosRepository: RemitosRepository) {
  return async function loadRemitos() {
    try {
      return await remitosRepository.list();
    } catch (error) {
      throw new RemitosLoadError(error);
    }
  };
}
