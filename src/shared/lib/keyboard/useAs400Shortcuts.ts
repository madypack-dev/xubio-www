import { onBeforeUnmount, onMounted, toValue, type MaybeRefOrGetter } from "vue";

export type As400Shortcuts = {
  onF2?: () => void | Promise<void>;
  onF3?: () => void | Promise<void>;
  onF5?: () => void | Promise<void>;
  onF12?: () => void | Promise<void>;
};

const SHORTCUT_HANDLER_BY_KEY: Record<string, keyof As400Shortcuts> = {
  F2: "onF2",
  F3: "onF3",
  F5: "onF5",
  F12: "onF12"
};

function isKeyFromEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tagName = target.tagName.toUpperCase();
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

export function useAs400Shortcuts(
  shortcuts: MaybeRefOrGetter<As400Shortcuts>,
  options?: {
    disableWhenEditing?: boolean;
  }
) {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat) {
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const shortcutName = SHORTCUT_HANDLER_BY_KEY[event.key];
    if (!shortcutName) {
      return;
    }

    if (options?.disableWhenEditing && isKeyFromEditableElement(event.target)) {
      return;
    }

    const resolvedShortcuts = toValue(shortcuts);
    const handler = resolvedShortcuts[shortcutName];
    if (!handler) {
      return;
    }

    event.preventDefault();
    Promise.resolve(handler()).catch((error) => {
      console.error("[MVP] Error ejecutando atajo AS400", {
        key: event.key,
        error
      });
    });
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
}
