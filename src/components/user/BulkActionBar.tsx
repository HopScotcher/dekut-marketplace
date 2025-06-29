import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, CheckSquare, XSquare } from "lucide-react";
import { useState } from "react";

interface BulkActionBarProps {
  selectionMode: boolean;
  selectedCount: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onClear: () => void;
  onBulkDelete: () => void;
  onToggleSelectionMode: () => void;
}

export default function BulkActionBar({
  selectionMode,
  selectedCount,
  allSelected,
  onSelectAll,
  onClear,
  onBulkDelete,
  onToggleSelectionMode,
}: BulkActionBarProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex items-center gap-4 py-2 px-4 bg-gray-50 border-b rounded-t-md">
      <Button
        variant={selectionMode ? "secondary" : "outline"}
        onClick={onToggleSelectionMode}
        size="sm"
      >
        {selectionMode ? (
          <XSquare className="mr-1 h-4 w-4" />
        ) : (
          <CheckSquare className="mr-1 h-4 w-4" />
        )}
        {selectionMode ? "Exit Selection" : "Select Products"}
      </Button>
      {selectionMode && (
        <>
          <span className="text-sm text-gray-700">
            {selectedCount} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={allSelected ? onClear : onSelectAll}
          >
            {allSelected ? "Clear All" : "Select All"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={selectedCount === 0}
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete Selected
          </Button>
          <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Delete {selectedCount} product{selectedCount !== 1 ? "s" : ""}
                  ?
                </DialogTitle>
              </DialogHeader>
              <p className="text-gray-600">
                This action cannot be undone. Are you sure you want to delete
                the selected published products?
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onBulkDelete();
                    setShowConfirm(false);
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
