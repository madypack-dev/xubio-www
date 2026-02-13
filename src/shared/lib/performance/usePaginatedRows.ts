import { computed, ref, toValue, watch, type MaybeRefOrGetter } from "vue";

const DEFAULT_THRESHOLD = 150;
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE_OPTIONS = [50, 100, 250, 500];

function normalizePageSizeOptions(
  options: readonly number[] | undefined,
  defaultPageSize: number
) {
  const source = options && options.length > 0 ? options : DEFAULT_PAGE_SIZE_OPTIONS;
  const normalized = source
    .map((value) => Math.trunc(value))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!normalized.includes(defaultPageSize)) {
    normalized.push(defaultPageSize);
  }
  return Array.from(new Set(normalized)).sort((left, right) => left - right);
}

function toSafePageSize(
  input: unknown,
  fallback: number,
  options: readonly number[]
) {
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const normalized = Math.trunc(parsed);
  if (normalized < 1) {
    return fallback;
  }
  if (options.includes(normalized)) {
    return normalized;
  }
  return fallback;
}

export function usePaginatedRows<T>(
  sourceRows: MaybeRefOrGetter<readonly T[]>,
  options?: {
    threshold?: number;
    defaultPageSize?: number;
    pageSizeOptions?: readonly number[];
  }
) {
  const threshold = Math.max(1, Math.trunc(options?.threshold ?? DEFAULT_THRESHOLD));
  const initialPageSize = Math.max(
    1,
    Math.trunc(options?.defaultPageSize ?? DEFAULT_PAGE_SIZE)
  );
  const pageSizeOptions = normalizePageSizeOptions(
    options?.pageSizeOptions,
    initialPageSize
  );

  const page = ref(1);
  const pageSize = ref(
    toSafePageSize(initialPageSize, pageSizeOptions[0] ?? DEFAULT_PAGE_SIZE, pageSizeOptions)
  );

  const totalRows = computed(() => toValue(sourceRows).length);
  const isActive = computed(() => totalRows.value > threshold);

  const totalPages = computed(() => {
    if (!isActive.value) {
      return 1;
    }
    return Math.max(1, Math.ceil(totalRows.value / pageSize.value));
  });

  const rows = computed(() => {
    const allRows = toValue(sourceRows);
    if (!isActive.value) {
      return [...allRows];
    }
    const startIndex = (page.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    return allRows.slice(startIndex, endIndex);
  });

  const pageStart = computed(() => {
    if (totalRows.value === 0) {
      return 0;
    }
    if (!isActive.value) {
      return 1;
    }
    return (page.value - 1) * pageSize.value + 1;
  });

  const pageEnd = computed(() => {
    if (totalRows.value === 0) {
      return 0;
    }
    if (!isActive.value) {
      return totalRows.value;
    }
    return Math.min(totalRows.value, page.value * pageSize.value);
  });

  function setPage(nextPage: number) {
    if (!isActive.value) {
      page.value = 1;
      return;
    }
    const bounded = Math.min(Math.max(1, Math.trunc(nextPage)), totalPages.value);
    page.value = bounded;
  }

  function setPageSize(nextPageSize: number) {
    const normalized = toSafePageSize(nextPageSize, pageSize.value, pageSizeOptions);
    pageSize.value = normalized;
    page.value = 1;
  }

  function goToPreviousPage() {
    setPage(page.value - 1);
  }

  function goToNextPage() {
    setPage(page.value + 1);
  }

  watch(totalPages, (value) => {
    if (page.value > value) {
      page.value = value;
    }
  });

  watch(isActive, (value) => {
    if (!value) {
      page.value = 1;
    }
  });

  return {
    isActive,
    rows,
    page,
    pageSize,
    pageSizeOptions,
    totalRows,
    totalPages,
    pageStart,
    pageEnd,
    setPage,
    setPageSize,
    goToPreviousPage,
    goToNextPage
  };
}
