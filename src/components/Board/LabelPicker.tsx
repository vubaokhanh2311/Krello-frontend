import { useState, useMemo } from "react";
import { Checkbox } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import type { Label } from "../../utils/mapApiCardToTask";

interface LabelPickerProps {
  labels: Label[];
  taskLabels: string[];
  onToggleLabel: (id: string) => void;
  onEditLabel: (label: Label) => void;
  onCreateLabel: () => void;
}

export default function LabelPicker({
  labels: labelsProp = [],
  taskLabels = [],
  onToggleLabel,
  onEditLabel,
  onCreateLabel,
}: LabelPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return labelsProp.filter((l) =>
      (l.name || "").toLowerCase().includes(keyword)
    );
  }, [search, labelsProp]);

  return (
    <div className="w-72 space-y-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm nhãn..."
        className="w-full border rounded px-2 py-1.5 text-sm"
      />

      <div className="text-sm font-medium mt-2">Nhãn</div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map((label) => {
          const isChecked = taskLabels.includes(label.id);

          return (
            <div
              key={label.id}
              className="flex items-center gap-2 group relative"
              style={{ zIndex: 10 }}
            >
              <div className="shrink-0 bg-white rounded p-1">
                <Checkbox
                  checked={isChecked}
                  onChange={() => {
                    onToggleLabel(label.id);
                  }}
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
                  onEditLabel(label);
                }}
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={onCreateLabel}
        className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
      >
        Tạo nhãn mới
      </button>
    </div>
  );
}
