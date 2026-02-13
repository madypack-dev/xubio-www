import { render } from "@testing-library/vue";
import { defineComponent, h } from "vue";
import { describe, expect, it, vi } from "vitest";
import { useAs400Shortcuts } from "@/shared/lib/keyboard/useAs400Shortcuts";

describe("useAs400Shortcuts", () => {
  it("executes mapped handlers and prevents default browser action", () => {
    const onF2 = vi.fn();
    const onF3 = vi.fn();
    const onF5 = vi.fn();
    const onF12 = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useAs400Shortcuts({ onF2, onF3, onF5, onF12 });
        return () => h("div", "shortcuts");
      }
    });

    render(TestComponent);

    const keys = ["F2", "F3", "F5", "F12"] as const;
    for (const key of keys) {
      const event = new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    }

    expect(onF2).toHaveBeenCalledTimes(1);
    expect(onF3).toHaveBeenCalledTimes(1);
    expect(onF5).toHaveBeenCalledTimes(1);
    expect(onF12).toHaveBeenCalledTimes(1);
  });

  it("ignores shortcuts while editing when disableWhenEditing is true", () => {
    const onF5 = vi.fn();

    const TestComponent = defineComponent({
      setup() {
        useAs400Shortcuts({ onF5 }, { disableWhenEditing: true });
        return () => h("input", { "data-testid": "editor" });
      }
    });

    const { getByTestId } = render(TestComponent);
    const input = getByTestId("editor");

    const event = new KeyboardEvent("keydown", {
      key: "F5",
      bubbles: true,
      cancelable: true
    });
    input.dispatchEvent(event);

    expect(onF5).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
