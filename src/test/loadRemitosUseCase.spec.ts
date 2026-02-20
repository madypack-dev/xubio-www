import { describe, expect, it, vi } from "vitest";
import { createLoadRemitosUseCase } from "@/modules/remitos/application/loadRemitosUseCase";
import { RemitosLoadError } from "@/modules/remitos/application/errors";
import { HttpClientError } from "@/shared/lib/http/httpClient";

describe("loadRemitosUseCase", () => {
  it("returns repository data when request succeeds", async () => {
    const repository = {
      list: vi.fn().mockResolvedValue([{ transaccionId: "1", items: [] }])
    } as const;

    const useCase = createLoadRemitosUseCase(
      repository as unknown as Parameters<typeof createLoadRemitosUseCase>[0]
    );

    const result = await useCase();

    expect(repository.list).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
  });

  it("wraps repository errors as RemitosLoadError preserving cause", async () => {
    const repositoryError = new HttpClientError({
      status: 200,
      url: "https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
      message: "El tunel ngrok devolvio ERR_NGROK_6024 para https://demo.ngrok-free.dev/API/1.1/remitoVentaBean",
      bodyText: "<!doctype html><html><body>ngrok</body></html>"
    });

    const repository = {
      list: vi.fn().mockRejectedValue(repositoryError)
    } as const;

    const useCase = createLoadRemitosUseCase(
      repository as unknown as Parameters<typeof createLoadRemitosUseCase>[0]
    );

    const execution = useCase();
    await expect(execution).rejects.toBeInstanceOf(RemitosLoadError);
    await expect(execution).rejects.toMatchObject({
      cause: repositoryError
    });
    expect(repository.list).toHaveBeenCalledTimes(1);
  });
});
