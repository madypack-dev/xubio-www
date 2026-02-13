import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { usePaginatedRows } from "@/shared/lib/performance/usePaginatedRows";

describe("usePaginatedRows", () => {
  it("returns full dataset when threshold is not reached", () => {
    const rows = ref([1, 2, 3, 4, 5]);
    const pagination = usePaginatedRows(rows, {
      threshold: 10,
      defaultPageSize: 2
    });

    expect(pagination.isActive.value).toBe(false);
    expect(pagination.rows.value).toEqual([1, 2, 3, 4, 5]);
    expect(pagination.totalPages.value).toBe(1);
  });

  it("slices rows by page when threshold is reached", () => {
    const rows = ref(Array.from({ length: 130 }, (_value, index) => index + 1));
    const pagination = usePaginatedRows(rows, {
      threshold: 100,
      defaultPageSize: 50
    });

    expect(pagination.isActive.value).toBe(true);
    expect(pagination.rows.value).toEqual(Array.from({ length: 50 }, (_value, i) => i + 1));

    pagination.setPage(3);
    expect(pagination.rows.value).toEqual(
      Array.from({ length: 30 }, (_value, i) => i + 101)
    );
  });

  it("resets to first page when page size changes", () => {
    const rows = ref(Array.from({ length: 200 }, (_value, index) => index + 1));
    const pagination = usePaginatedRows(rows, {
      threshold: 50,
      defaultPageSize: 50
    });

    pagination.setPage(2);
    expect(pagination.page.value).toBe(2);

    pagination.setPageSize(100);
    expect(pagination.page.value).toBe(1);
    expect(pagination.rows.value).toEqual(
      Array.from({ length: 100 }, (_value, index) => index + 1)
    );
  });
});
