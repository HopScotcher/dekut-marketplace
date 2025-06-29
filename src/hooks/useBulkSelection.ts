import { useState } from "react";

export function useBulkSelection(publishedProductIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Toggle selection for a single product
  function toggleSelection(productId: string) {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  // Select all published products
  function selectAllPublished() {
    setSelectedIds(publishedProductIds);
  }

  // Clear all selections
  function clearSelection() {
    setSelectedIds([]);
  }

  // Bulk delete selected published products (returns IDs to delete)
  function bulkDeletePublished() {
    return selectedIds;
  }

  // Toggle selection mode
  function toggleSelectionMode() {
    setSelectionMode((prev) => !prev);
    if (selectionMode) {
      setSelectedIds([]);
    }
  }

  return {
    selectedIds,
    selectionMode,
    toggleSelection,
    selectAllPublished,
    clearSelection,
    bulkDeletePublished,
    toggleSelectionMode,
    selectedCount: selectedIds.length,
    allSelected:
      selectedIds.length === publishedProductIds.length &&
      publishedProductIds.length > 0,
  };
}
