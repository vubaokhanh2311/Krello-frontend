import { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import type { Label } from "../../utils/mapApiCardToTask";
import { notifications } from "@mantine/notifications";

import { useLabelStore } from "../../stores/labelStore";

interface LabelCreatorProps {
  boardId: string;
  editingLabel?: Label | null;
  onSubmit: (label: Label | null) => void;
  onCancel: () => void;
}

const COLOR_PALETTE = [
  "#b2f2bb",
  "#ffe066",
  "#ffda79",
  "#ffc9c9",
  "#eebefa",
  "#63e6be",
  "#ffd43b",
  "#ffa94d",
  "#ff8787",
  "#da77f2",
  "#2f9e44",
  "#a87900",
  "#c16600",
  "#e03131",
  "#9c36b5",
];

function getTextColor(bg: string | null) {
  if (!bg) return "#000";
  const c = bg.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#000" : "#fff";
}

export default function LabelCreator({
  boardId,
  editingLabel,
  onSubmit,
  onCancel,
}: LabelCreatorProps) {
  const createLabelAction = useLabelStore((s) => s.createLabelAction);
  const updateLabelAction = useLabelStore((s) => s.updateLabelAction);
  const deleteLabelAction = useLabelStore((s) => s.deleteLabelAction);

  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>("#63e6be");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingLabel) {
      setName(editingLabel.name);
      setColor(editingLabel.color);
    } else {
      setName("");
      setColor("#63e6be");
    }
  }, [editingLabel]);

  async function handleSave() {
    if (!name.trim()) {
      notifications.show({
        title: "Thất bại",
        message: "Tiêu đề không được để trống",
        color: "red",
      });
      return;
    }

    setIsLoading(true);

    try {
      let result: Label;

      if (editingLabel) {
        result = await updateLabelAction(boardId, editingLabel.id, {
          name: name.trim(),
          color: color || "#cfcfcf",
        });
      } else {
        result = await createLabelAction(boardId, {
          name: name.trim(),
          color: color || "#cfcfcf",
        });
      }

      onSubmit(result);
    } catch {
      notifications.show({
        title: "Thất bại",
        message: "Không thể lưu nhãn",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!editingLabel) return;

    setIsLoading(true);

    try {
      await deleteLabelAction(boardId, editingLabel.id);
      onSubmit(null);
    } catch {
      notifications.show({
        title: "Thất bại",
        message: "Không thể xóa nhãn",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const isEditMode = !!editingLabel;

  return (
    <div className="w-full max-w-md mx-auto bg-white">
      <div className="px-4 py-3 flex items-center justify-between border-b">
        <button
          onClick={onCancel}
          className="p-1 text-gray-600"
          disabled={isLoading}
        >
          ←
        </button>

        <div className="font-medium">
          {isEditMode ? "Chỉnh sửa nhãn" : "Tạo nhãn mới"}
        </div>

        <button
          onClick={onCancel}
          className="p-1 text-gray-600"
          disabled={isLoading}
        >
          <IconX size={20} />
        </button>
      </div>

      <div className="bg-white p-5">
        <div
          className="h-10 w-full rounded-lg flex items-center px-3 text-sm font-medium"
          style={{
            backgroundColor: color || "#e9ecef",
            color: getTextColor(color),
          }}
        >
          {name}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div>
          <div className="font-medium mb-1 text-sm">Tiêu đề</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tiêu đề..."
            className="
    w-full rounded-lg px-3 py-2 text-sm
    border border-gray-300
    focus:outline-none
    focus:ring-0
    focus:border-gray-300
  "
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="font-medium mb-2 text-sm">Chọn một màu</div>
          <div className="grid grid-cols-5 gap-3">
            {COLOR_PALETTE.map((c) => {
              const selected = c === color;
              return (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-10 h-10 rounded-lg shadow-sm relative"
                  style={{ backgroundColor: c }}
                  disabled={isLoading}
                >
                  {selected && (
                    <div className="absolute inset-0 rounded-lg border-2 border-blue-600"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setColor(null)}
          className="w-full py-2 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm disabled:opacity-50"
          disabled={isLoading}
        >
          <IconX size={16} /> Gỡ bỏ màu
        </button>

        <hr />

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : isEditMode ? "Lưu" : "Tạo mới"}
          </button>

          {isEditMode && (
            <button
              onClick={handleDelete}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Đang xoá..." : "Xoá"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
