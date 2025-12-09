import React, { useState, useEffect } from "react";
import {
  Modal,
  Textarea,
  Button,
  Avatar,
  ScrollArea,
  Popover,
} from "@mantine/core";

import {
  IconAlignLeft,
  IconMessageCircle,
  IconPlus,
} from "@tabler/icons-react";

import type { Task, Label } from "../../utils/mapApiCardToTask";
import LabelPicker from "./LabelPicker";

interface TaskDetailModalProps {
  opened: boolean;
  onClose: () => void;
  task: Task | null;
  columnTitle?: string;

  onSaveDescription: (taskId: string, desc: string) => void;
  onSaveTitle: (taskId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;

  boardLabels: Label[];

  onUpdateTaskLabels: (taskId: string, labelId: string) => void;
  onOpenEditLabel: (label: Label) => void;
  onOpenCreateLabel: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  opened,
  onClose,
  task,
  columnTitle,
  onSaveDescription,
  onSaveTitle,
  // onDeleteTask,
  boardLabels,
  onUpdateTaskLabels,
  onOpenEditLabel,
  onOpenCreateLabel,
}) => {
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (task) {
      setTitleValue(task.title ?? "");
      setDescription(task.description ?? "");
      setIsEditingTitle(false);
      setIsEditingDesc(false);
    }
  }, [task]);

  if (!task) return null;

  const toggleLabel = (labelId: string) => {
    onUpdateTaskLabels(task.id, labelId);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="100%"
      padding={0}
      radius="lg"
      withCloseButton={false}
      scrollAreaComponent={ScrollArea.Autosize}
      styles={{ body: { backgroundColor: "white" } }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-semibold text-gray-900">{columnTitle}</h1>

        <button
          onClick={onClose}
          className="text-gray-700 hover:bg-gray-200 p-2 rounded-full"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-12 min-h-[70vh]">
        <div className="col-span-7 p-8 space-y-8">
          <div
            className="flex items-center gap-3 cursor-text"
            onClick={() => !isEditingTitle && setIsEditingTitle(true)}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-gray-600 shrink-0"
              onClick={(e) => e.stopPropagation()}
            />

            {isEditingTitle ? (
              <input
                autoFocus
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => {
                  const newTitle = titleValue.trim();
                  if (newTitle !== task.title.trim())
                    onSaveTitle(task.id, newTitle);

                  setIsEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const newTitle = titleValue.trim();
                    if (newTitle !== task.title.trim())
                      onSaveTitle(task.id, newTitle);

                    setIsEditingTitle(false);
                  }
                  if (e.key === "Escape") {
                    setTitleValue(task.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="w-full text-lg font-bold text-gray-900 border-2 border-blue-500 rounded px-2 py-2 bg-white"
              />
            ) : (
              <h2 className="text-2xl font-semibold text-gray-900 w-full">
                {task.title}
              </h2>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Popover position="bottom-start" shadow="md">
              <Popover.Target>
                <Button leftSection={<IconPlus size={16} />}>Nhãn</Button>
              </Popover.Target>

              <Popover.Dropdown>
                <LabelPicker
                  key={task.id}
                  labels={boardLabels}
                  taskLabels={task.labelIds}
                  onToggleLabel={toggleLabel}
                  onEditLabel={onOpenEditLabel}
                  onCreateLabel={onOpenCreateLabel}
                />
              </Popover.Dropdown>
            </Popover>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <IconAlignLeft size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-800">Mô tả</h2>
            </div>

            {isEditingDesc ? (
              <div className="space-y-3">
                <Textarea
                  minRows={4}
                  autosize
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const newDesc = description.trim();
                      if (newDesc !== task.description.trim())
                        onSaveDescription(task.id, newDesc);

                      setIsEditingDesc(false);
                    }}
                  >
                    Lưu
                  </Button>

                  <Button
                    variant="subtle"
                    onClick={() => {
                      setDescription(task.description);
                      setIsEditingDesc(false);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingDesc(true)}
                className="rounded-lg p-4 text-gray-700 cursor-text hover:bg-gray-50 whitespace-pre-line"
              >
                {description?.trim()
                  ? description
                  : "Thêm mô tả chi tiết hơn..."}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-5 border-l bg-gray-50 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconMessageCircle size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-800">
                Nhận xét & hoạt động
              </h2>
            </div>
            <Button variant="subtle" color="gray">
              Hiện chi tiết
            </Button>
          </div>

          <Textarea
            placeholder="Viết bình luận..."
            minRows={1}
            autosize
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Avatar color="orange">VK</Avatar>
            <div>
              <p className="text-sm text-gray-800">
                <b>Vũ Bảo Khanh</b> đã thêm thẻ vào danh sách{" "}
                <b>{columnTitle}</b>
              </p>
              <p className="text-xs text-blue-600 underline cursor-pointer">
                21:32 31 thg 10, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
