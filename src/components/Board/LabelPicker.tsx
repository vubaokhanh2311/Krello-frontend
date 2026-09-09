import { useState, useMemo, useEffect } from "react";
import { Checkbox } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import type { Label } from "../../utils/mapApiCardToTask";
import LabelCreator from "./LabelCreator";
import { includesIgnoreCase, normalizeKeyword } from "../../utils/stringUtils";

import { useLabelStore } from "../../stores/labelStore";

interface LabelPickerProps {
  boardId: string;
  taskLabels: string[];
  labels: Label[];
  onToggleLabel: (id: string) => void;
}

export default function LabelPicker({
  boardId,
  taskLabels = [],
  onToggleLabel,
}: LabelPickerProps) {
  const labels = useLabelStore((s) => s.labels);
  const fetchLabels = useLabelStore((s) => s.fetchLabels);

  const [search, setSearch] = useState("");
  const [showCreator, setShowCreator] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  useEffect(() => {
    fetchLabels(boardId);
  }, [boardId, fetchLabels]);

  const filtered = useMemo(() => {
    const keyword = normalizeKeyword(search);

    if (!Array.isArray(labels)) return [];

    return labels.filter((l) => {
      if (!l || typeof l !== "object") return false;
      if (!l.name) return false;
      return includesIgnoreCase(l.name, keyword);
    });
  }, [search, labels]);

  const handleOpenCreate = () => {
    setEditingLabel(null);
    setShowCreator(true);
  };

  const handleOpenEdit = (label: Label) => {
    setEditingLabel(label);
    setShowCreator(true);
  };

  const handleClose = () => {
    setShowCreator(false);
    setEditingLabel(null);
  };

  return (
    <div className="w-72 space-y-3">
      {showCreator ? (
        <div className="-mt-30">
          <LabelCreator
            boardId={boardId}
            editingLabel={editingLabel}
            onSubmit={() => {
              fetchLabels(boardId);
              handleClose();
            }}
            onCancel={handleClose}
          />
        </div>
      ) : (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nhãn..."
            className="
    w-full rounded-lg px-3 py-2 text-sm
    border border-gray-300
    focus:outline-none
    focus:ring-0
    focus:border-gray-300
  "
          />

          <div className="text-sm font-medium mt-2">Nhãn</div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filtered.map((label) => {
              const isChecked = taskLabels.includes(label.id);

              return (
                <div
                  key={label.id}
                  className="flex items-center gap-2 group relative"
                >
                  <div className="shrink-0 bg-white rounded p-1">
                    <Checkbox
                      checked={isChecked}
                      onChange={() => onToggleLabel(label.id)}
                      size="sm"
                    />
                  </div>

                  <div
                    className="flex-1 h-8 rounded flex items-center px-2 font-medium text-white cursor-pointer truncate"
                    style={{ backgroundColor: label.color }}
                    onClick={() => onToggleLabel(label.id)}
                  >
                    {label.name}
                  </div>

                  <IconPencil
                    size={18}
                    className="opacity-0 group-hover:opacity-100 cursor-pointer text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(label);
                    }}
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={handleOpenCreate}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
          >
            Tạo nhãn mới
          </button>
        </>
      )}
    </div>
  );
}
