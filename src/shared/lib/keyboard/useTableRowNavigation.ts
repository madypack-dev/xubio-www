import { onBeforeUnmount, onMounted } from "vue";

type RowNavigationOptions = {
  tableSelector?: string;
  rowSelector?: string;
  mainActionSelector?: string;
};

const DEFAULT_OPTIONS: Required<RowNavigationOptions> = {
  tableSelector: "[data-nav-table='true']",
  rowSelector: "[data-nav-row='true']",
  mainActionSelector: "[data-nav-main='true']"
};

function isInteractiveElement(element: HTMLElement | null) {
  if (!element) {
    return false;
  }
  const tagName = element.tagName.toUpperCase();
  if (tagName === "A" || tagName === "BUTTON") {
    return true;
  }
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }
  return element.isContentEditable;
}

function getFocusableInRow(
  row: HTMLElement,
  options: Required<RowNavigationOptions>
): HTMLElement | null {
  const mainAction = row.querySelector<HTMLElement>(options.mainActionSelector);
  if (mainAction) {
    return mainAction;
  }

  const fallback = row.querySelector<HTMLElement>(
    "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
  );
  if (fallback) {
    return fallback;
  }

  return null;
}

function focusRow(
  row: HTMLElement,
  options: Required<RowNavigationOptions>
) {
  const nextFocusable = getFocusableInRow(row, options);
  if (nextFocusable) {
    nextFocusable.focus();
    return;
  }
  row.focus();
}

export function useTableRowNavigation(inputOptions?: RowNavigationOptions) {
  const options = {
    ...DEFAULT_OPTIONS,
    ...inputOptions
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat) {
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (isInteractiveElement(target) && event.key === "Enter") {
      return;
    }

    const table = target.closest<HTMLElement>(options.tableSelector);
    if (!table) {
      return;
    }
    const currentRow = target.closest<HTMLElement>(options.rowSelector);
    if (!currentRow) {
      return;
    }

    const rows = Array.from(
      table.querySelectorAll<HTMLElement>(`tbody ${options.rowSelector}`)
    );
    if (rows.length === 0) {
      return;
    }

    const currentIndex = rows.findIndex((row) => row === currentRow);
    if (currentIndex < 0) {
      return;
    }

    if (event.key === "Enter") {
      const mainAction = getFocusableInRow(currentRow, options);
      if (!mainAction) {
        return;
      }
      event.preventDefault();
      mainAction.click();
      return;
    }

    const offset = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = Math.min(Math.max(currentIndex + offset, 0), rows.length - 1);
    if (nextIndex === currentIndex) {
      return;
    }
    event.preventDefault();
    focusRow(rows[nextIndex], options);
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
}
