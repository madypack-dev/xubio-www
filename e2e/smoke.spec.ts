import { expect, test } from "@playwright/test";

test("smoke: navegacion entre modulos", async ({ page }) => {
  await page.goto("/remitos");

  await expect(page.getByRole("heading", { name: "Remitos" })).toBeVisible();
  await expect(
    page.locator("table[data-nav-table='true'] tbody tr[data-nav-row='true']").first()
  ).toBeVisible();

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

  await page.getByRole("link", { name: "Clientes" }).click();
  await expect(page).toHaveURL(/\/clientes/);
  await expect(
    page.getByRole("heading", { name: "Cliente por ID (MVP)" })
  ).toBeVisible();

  await page.getByRole("link", { name: "Productos" }).click();
  await expect(page).toHaveURL(/\/productos/);
  await expect(
    page.getByRole("heading", { name: "Producto por ID (MVP)" })
  ).toBeVisible();
});

test("smoke: ArrowUp/ArrowDown/Enter sobre filas", async ({ page }) => {
  await page.goto("/remitos");

  const remitoLinks = page.locator(
    "table[data-nav-table='true'] tbody tr[data-nav-row='true'] a[data-nav-main='true']"
  );
  await expect.poll(async () => remitoLinks.count()).toBeGreaterThan(1);

  const firstRemitoId = (await remitoLinks.nth(0).innerText()).trim();
  const secondRemitoId = (await remitoLinks.nth(1).innerText()).trim();

  await remitoLinks.nth(0).focus();
  await page.keyboard.press("ArrowDown");
  await expect(remitoLinks.nth(1)).toBeFocused();

  let activeRemitoText = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    return element?.textContent?.trim() ?? "";
  });
  expect(activeRemitoText).toBe(secondRemitoId);

  await page.keyboard.press("ArrowUp");
  await expect(remitoLinks.nth(0)).toBeFocused();

  activeRemitoText = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    return element?.textContent?.trim() ?? "";
  });
  expect(activeRemitoText).toBe(firstRemitoId);

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`remitoVenta=${firstRemitoId}`));

  await page.getByRole("link", { name: "Comprobantes" }).click();
  await expect(page).toHaveURL(/\/comprobantes/);

  const comprobanteLinks = page.locator(
    "table[data-nav-table='true'] tbody tr[data-nav-row='true'] a[data-nav-main='true']"
  );
  await expect.poll(async () => comprobanteLinks.count()).toBeGreaterThan(1);

  const firstComprobanteId = (await comprobanteLinks.nth(0).innerText()).trim();
  await comprobanteLinks.nth(0).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`comprobanteVenta=${firstComprobanteId}`));
});
