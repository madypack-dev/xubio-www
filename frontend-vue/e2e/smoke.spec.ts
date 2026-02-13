import { expect, test } from "@playwright/test";

test("smoke: modulos y drill-down principal", async ({ page }) => {
  await page.goto("/remitos");

  await expect(page.getByRole("heading", { name: "Remitos" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "38925753" })).toBeVisible();

  await page.getByRole("link", { name: "Listas de precio" }).click();
  await expect(page).toHaveURL(/\/listas-precio/);
  await expect(
    page.getByRole("heading", { name: "Listas de precio (MVP)" })
  ).toBeVisible();

  await page.getByRole("link", { name: "Comprobantes" }).click();
  await expect(page).toHaveURL(/\/comprobantes/);
  await expect(
    page.getByRole("heading", { name: "Comprobantes (MVP)" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Ver detalle" }).first().click();
  const detalleComprobante = page.locator("section").filter({
    hasText: "Detalle de comprobante"
  });
  await expect(detalleComprobante).toBeVisible();
  await expect(
    detalleComprobante.getByRole("row", { name: "ID 5001" })
  ).toBeVisible();

  await page.getByRole("link", { name: "Remitos" }).click();
  await expect(page).toHaveURL(/\/remitos/);
  await expect(page.getByRole("heading", { name: "Remitos" })).toBeVisible();
  await page.getByRole("button", { name: "Ver items" }).first().click();
  await expect(page).toHaveURL(/remitoVenta=38925753/);
  await expect(page.getByText("Detalle de items del remito")).toBeVisible();
  await expect(page.getByText("12.5x8x19 Bolsa Marron 100g C/M")).toBeVisible();

  await page.getByRole("button", { name: "Cliente" }).first().click();
  await expect(page).toHaveURL(/\/clientes/);
  await expect(page).toHaveURL(/cliente=5182181/);
  await expect(
    page.getByRole("heading", { name: "Cliente por ID (MVP)" })
  ).toBeVisible();
  await expect(page.getByText("Cliente Demo SA")).toBeVisible();

  await page.getByRole("link", { name: "Remitos" }).click();
  await page.getByRole("button", { name: "Ver items" }).first().click();
  await page.getByRole("button", { name: "Producto" }).first().click();
  await expect(page).toHaveURL(/\/productos/);
  await expect(page).toHaveURL(/producto=1672624/);
  await expect(
    page.getByRole("heading", { name: "Producto por ID (MVP)" })
  ).toBeVisible();
  await expect(page.getByText("Bolsa Marron 12.5x8x19")).toBeVisible();
});
