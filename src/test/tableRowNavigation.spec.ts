import { fireEvent, render } from "@testing-library/vue";
import { defineComponent } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useTableRowNavigation } from "@/shared/lib/keyboard/useTableRowNavigation";

describe("useTableRowNavigation", () => {
  it("moves focus across row main actions with ArrowUp/ArrowDown", async () => {
    const TestComponent = defineComponent({
      setup() {
        useTableRowNavigation();
        return {};
      },
      template: `
        <table data-nav-table="true">
          <tbody>
            <tr data-nav-row="true" tabindex="-1">
              <td><a data-testid="link-1" data-nav-main="true" href="#">Uno</a></td>
            </tr>
            <tr data-nav-row="true" tabindex="-1">
              <td><a data-testid="link-2" data-nav-main="true" href="#">Dos</a></td>
            </tr>
          </tbody>
        </table>
      `
    });

    const { getByTestId } = render(TestComponent);
    const link1 = getByTestId("link-1") as HTMLElement;
    const link2 = getByTestId("link-2") as HTMLElement;

    link1.focus();
    await fireEvent.keyDown(link1, { key: "ArrowDown" });
    expect(document.activeElement).toBe(link2);

    await fireEvent.keyDown(link2, { key: "ArrowUp" });
    expect(document.activeElement).toBe(link1);
  });

  it("opens main row action with Enter when row has focus", async () => {
    const onOpen = vi.fn();
    const TestComponent = defineComponent({
      setup() {
        useTableRowNavigation();
        return { onOpen };
      },
      template: `
        <table data-nav-table="true">
          <tbody>
            <tr data-testid="row-1" data-nav-row="true" tabindex="-1">
              <td>
                <a
                  data-testid="link-main"
                  data-nav-main="true"
                  href="#"
                  @click.prevent="onOpen"
                >
                  Abrir
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      `
    });

    const { getByTestId } = render(TestComponent);
    const row = getByTestId("row-1") as HTMLElement;
    row.focus();

    await fireEvent.keyDown(row, { key: "Enter" });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
