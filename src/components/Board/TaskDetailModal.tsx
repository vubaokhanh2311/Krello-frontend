import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Textarea,
  Button,
  Avatar,
  ScrollArea,
  Popover,
  Badge,
  FileButton,
} from "@mantine/core";
import {
  IconAlignLeft,
  IconMessageCircle,
  IconPlus,
  IconUser,
  IconCalendar,
  IconTag,
  IconPaperclip,
  IconDownload,
  IconTrash,
  IconEdit,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import type { Task } from "../../utils/mapApiCardToTask";
import type { Label } from "../../types/BoardDetail";
import LabelPicker from "./LabelPicker";
import MemberPicker from "./MemberPicker";
import type { Member } from "../../types/Member";
import DuePicker from "./DuePicker";
import { useLabelStore } from "../../stores/labelStore";
import { useUserStore } from "../../stores/userStore";
import { useCommentStore } from "../../stores/commentStore";
import { useAttachmentStore } from "../../stores/AttachmentStore";
import type { Comment } from "../../types/Comment";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { resolveAvatarUrl } from "../../utils/avatar";
dayjs.extend(relativeTime);
dayjs.locale("vi");

interface TaskDetailModalProps {
  opened: boolean;
  onClose: () => void;
  task: Task | null;
  columnTitle?: string;
  boardId: string;
  onDeleteTask?: (taskId: string) => void;
  boardMembers: Member[];
  onSaveDescription: (taskId: string, desc: string) => void;
  onSaveTitle: (taskId: string, title: string) => void;
  onUpdateTaskLabels: (taskId: string, labelId: string) => void;
  onUpdateTaskMembers: (taskId: string, userId: string) => void;
  onSaveDueDate: (taskId: string, dueDate: string | null) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  opened,
  onClose,
  task,
  columnTitle,
  boardId,
  boardMembers,
  onSaveDescription,
  onSaveTitle,
  onUpdateTaskLabels,
  onUpdateTaskMembers,
  onSaveDueDate,
}) => {
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [editingAttachmentId, setEditingAttachmentId] = useState<string | null>(
    null
  );
  const [editingAttachmentName, setEditingAttachmentName] = useState("");

  const labels = useLabelStore((s) => s.labels);
  const fetchLabels = useLabelStore((s) => s.fetchLabels);
  const user = useUserStore((s) => s.user);

  const taskCommentsRaw = useCommentStore((state) =>
    task?.id ? state.comments[task.id] : undefined
  );

  const fetchComments = useCommentStore((s) => s.fetchComments);
  const addComment = useCommentStore((s) => s.addComment);
  const updateComment = useCommentStore((s) => s.updateComment);
  const deleteComment = useCommentStore((s) => s.deleteComment);

  const taskAttachmentsRaw = useAttachmentStore((state) =>
    task?.id ? state.attachments[task.id] : undefined
  );

  const fetchAttachments = useAttachmentStore((s) => s.fetchAttachments);
  const addAttachment = useAttachmentStore((s) => s.addAttachment);
  const updateAttachment = useAttachmentStore((s) => s.updateAttachment);
  const deleteAttachment = useAttachmentStore((s) => s.deleteAttachment);

  const taskComments = useMemo(() => {
    if (!taskCommentsRaw) return [];
    return taskCommentsRaw.filter((c) => c && c.user);
  }, [taskCommentsRaw]);

  const taskAttachments = useMemo(() => {
    if (!taskAttachmentsRaw) return [];
    return taskAttachmentsRaw;
  }, [taskAttachmentsRaw]);

  const [dueDate, setDueDate] = useState<Date | null>(null);

  const taskLabels = useMemo(() => {
    if (!task?.labelIds?.length || !Array.isArray(labels)) return [];

    return labels.filter(
      (label): label is Label =>
        Boolean(label) && task.labelIds.includes(label.id)
    );
  }, [task?.labelIds, labels]);

  const taskMembers = useMemo(() => {
    if (!task?.members) return [];
    return task.members;
  }, [task?.members]);

  useEffect(() => {
    if (opened && boardId) {
      fetchLabels(boardId);
    }
  }, [opened, boardId]);

  useEffect(() => {
    if (task) {
      setTitleValue(task.title ?? "");
      setDescription(task.description ?? "");
      setIsEditingTitle(false);
      setIsEditingDesc(false);

      if (task.date && task.date.trim()) {
        const parsedDate = new Date(task.date);
        if (!isNaN(parsedDate.getTime())) {
          setDueDate(parsedDate);
        } else {
          setDueDate(null);
        }
      } else {
        setDueDate(null);
      }
      fetchComments(task.id);
      fetchAttachments(task.id);
    }
  }, [task, fetchComments, fetchAttachments]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !task) return;
    const commentContent = commentText.trim();
    setCommentText("");
    try {
      await addComment(task.id, commentContent);
    } catch (error) {
      setCommentText(commentContent);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentText.trim() || !task) return;
    try {
      await updateComment(task.id, commentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!task) return;

    try {
      await deleteComment(task.id, commentId);
      notifications.show({
        title: "Thành công",
        message: "Xoá bình luận thành công",
        color: "green",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!task) return;
    try {
      await addAttachment(task.id, file);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!task) return;
    try {
      await deleteAttachment(task.id, attachmentId);
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  };

  const startEditingAttachment = (attachment: any) => {
    setEditingAttachmentId(attachment.id);
    setEditingAttachmentName(
      attachment.fileName || attachment.fileUrl?.split("/").pop() || ""
    );
  };

  const handleUpdateAttachment = async () => {
    if (!editingAttachmentId || !editingAttachmentName.trim() || !task) return;

    await updateAttachment(
      task.id,
      editingAttachmentId,
      editingAttachmentName.trim()
    );

    cancelEditingAttachment();
  };

  const cancelEditingAttachment = () => {
    setEditingAttachmentId(null);
    setEditingAttachmentName("");
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  if (!task) return null;

  const toggleLabel = (labelId: string) => {
    onUpdateTaskLabels(task.id, labelId);
  };

  const toggleMember = (userId: string) => {
    onUpdateTaskMembers(task.id, userId);
  };

  const isOverdue = dueDate && dayjs(dueDate).isBefore(dayjs(), "day");
  const isDueToday = dueDate && dayjs(dueDate).isSame(dayjs(), "day");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="100%"
      padding={0}
      radius="lg"
      withCloseButton={false}
      zIndex={200}
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

          <div className="flex flex-wrap gap-6">
            {taskLabels.length > 0 && (
              <div className="">
                <div className="flex items-center gap-2 shrink-0 mb-3">
                  <IconTag size={18} className="text-gray-700" />
                  <h3 className="text-sm font-semibold text-gray-700">Nhãn</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {taskLabels.map((label) => (
                    <Badge
                      key={label.id}
                      color={label.color}
                      size="lg"
                      radius="sm"
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {taskMembers.length > 0 && (
              <div className="">
                <div className=" flex items-center gap-2 shrink-0 mb-3">
                  <IconUser size={18} className="text-gray-700" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Thành viên
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {taskMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                    >
                      <Avatar
                        src={resolveAvatarUrl(member.avatar)}
                        size="xs"
                        color="blue"
                      >
                        {!member.avatar && member.name?.charAt(0).toUpperCase()}
                      </Avatar>

                      <span className="text-sm font-medium text-gray-700">
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dueDate && (
              <div className=" ">
                <div className="flex items-center gap-2 shrink-0 mb-3">
                  <IconCalendar size={18} className="text-gray-700" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Ngày hết hạn
                  </h3>
                </div>
                <Badge
                  size="lg"
                  radius="sm"
                  color={isOverdue ? "red" : isDueToday ? "yellow" : "gray"}
                  variant="light"
                >
                  {dayjs(dueDate).format("DD/MM/YYYY")}
                  {isOverdue && " - Quá hạn"}
                  {isDueToday && " - Hôm nay"}
                </Badge>
              </div>
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
                  boardId={boardId}
                  labels={labels}
                  taskLabels={task.labelIds}
                  onToggleLabel={toggleLabel}
                />
              </Popover.Dropdown>
            </Popover>

            <Popover position="bottom-start" shadow="md">
              <Popover.Target>
                <Button leftSection={<IconUser size={16} />}>Thành viên</Button>
              </Popover.Target>

              <Popover.Dropdown>
                <MemberPicker
                  key={task.id}
                  boardId={boardId}
                  boardMembers={boardMembers}
                  taskMembers={task.members}
                  onToggleMember={toggleMember}
                />
              </Popover.Dropdown>
            </Popover>
            <Popover shadow="md" position="bottom-start">
              <Popover.Target>
                <Button leftSection={<IconCalendar size={16} />}>
                  {dueDate ? "Ngày hết hạn" : "Thêm ngày hết hạn"}
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <DuePicker
                  dueDate={dueDate}
                  onChange={(date) => {
                    setDueDate(date);
                    onSaveDueDate(task.id, date ? date.toISOString() : null);
                  }}
                />
              </Popover.Dropdown>
            </Popover>

            <FileButton onChange={(file) => file && handleFileUpload(file)} accept="*">
              {(props) => (
                <Button {...props} leftSection={<IconPaperclip size={16} />}>
                  Đính kèm
                </Button>
              )}
            </FileButton>
          </div>

          {taskAttachments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <IconPaperclip size={20} className="text-gray-700" />
                <h2 className="text-sm font-semibold text-gray-800">
                  Tệp đính kèm
                </h2>
              </div>
              <div className="space-y-2">
                {taskAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <IconPaperclip
                        size={18}
                        className="text-gray-500 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.fileName ||
                            attachment.fileUrl?.split("/").pop()}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>•</span>
                          <span>{dayjs(attachment.createdAt).fromNow()}</span>
                        </div>
                      </div>
                    </div>
                    <Popover
                      opened={editingAttachmentId === attachment.id}
                      onChange={(opened) => {
                        if (!opened) {
                          cancelEditingAttachment();
                        }
                      }}
                      position="bottom-end"
                      shadow="md"
                      width={280}
                      withinPortal
                      clickOutsideEvents={["mousedown", "touchstart"]}
                    >
                      <Popover.Target>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingAttachmentId === attachment.id) {
                              cancelEditingAttachment();
                            } else {
                              startEditingAttachment(attachment);
                            }
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Sửa tên"
                        >
                          <IconEdit size={16} />
                        </button>
                      </Popover.Target>

                      <Popover.Dropdown className="p-3 rounded-lg border border-gray-200 bg-white">
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-800">
                            Sửa tệp đính kèm
                          </h4>

                          <input
                            autoFocus
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingAttachmentName}
                            onChange={(e) =>
                              setEditingAttachmentName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateAttachment();
                              if (e.key === "Escape") cancelEditingAttachment();
                            }}
                          />

                          <div className="flex justify-end gap-2">
                            <Button
                              size="xs"
                              variant="subtle"
                              onClick={cancelEditingAttachment}
                            >
                              Hủy
                            </Button>
                            <Button
                              size="xs"
                              onClick={handleUpdateAttachment}
                              disabled={!editingAttachmentName.trim()}
                            >
                              Lưu
                            </Button>
                          </div>
                        </div>
                      </Popover.Dropdown>
                    </Popover>
                    <div className="flex items-center gap-1 ml-2">
                      <a
                        href={`${import.meta.env.VITE_URL_API}${
                          attachment.fileUrl
                        }`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Tải xuống"
                      >
                        <IconDownload size={16} />
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Xóa"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <IconAlignLeft size={20} className="text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-800">Mô tả</h2>
            </div>

            {isEditingDesc ? (
              <div className="space-y-3 ">
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
                      const oldDesc = (task.description ?? "").trim();

                      if (newDesc !== oldDesc) {
                        onSaveDescription(task.id, newDesc);
                      }

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
                className="rounded-lg p-4 text-gray-700 cursor-text hover:bg-gray-50 whitespace-pre-line border border-gray-300"
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

          <div className="space-y-4">
            <div className="flex gap-3">
              {user && (
                <Avatar
                  src={resolveAvatarUrl(user.avatarUrl)}
                  color="blue"
                  size="sm"
                >
                  {!user.avatarUrl && user.name?.charAt(0).toUpperCase()}
                </Avatar>
              )}

              <div className="flex-1">
                <Textarea
                  placeholder="Viết bình luận..."
                  minRows={2}
                  autosize
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      handleAddComment();
                    }
                  }}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="xs"
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {taskComments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có bình luận nào
                </p>
              ) : (
                taskComments.map((comment) => {
                  const isMyComment =
                    user &&
                    comment.user &&
                    (String(user.id) === String(comment.userId) ||
                      String(user.id) === String(comment.user.id));

                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar
                        src={resolveAvatarUrl(comment.user?.avatarUrl)}
                        color="blue"
                        size="sm"
                        className="shrink-0"
                      >
                        {!comment.user?.avatarUrl &&
                          comment.user?.name?.charAt(0).toUpperCase()}
                      </Avatar>

                      <div className="flex-1">
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2">
                            <Textarea
                              minRows={2}
                              autosize
                              value={editingCommentText}
                              onChange={(e) =>
                                setEditingCommentText(e.target.value)
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                size="xs"
                                onClick={() => handleUpdateComment(comment.id)}
                                disabled={!editingCommentText.trim()}
                                leftSection={<IconCheck size={14} />}
                              >
                                Lưu
                              </Button>
                              <Button
                                size="xs"
                                variant="subtle"
                                onClick={cancelEditing}
                                leftSection={<IconX size={14} />}
                              >
                                Hủy
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">
                                  {comment.user?.name || "Người dùng ẩn danh"}
                                </p>
                                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                  {comment.content}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {dayjs(comment.createdAt).fromNow()}
                                  {comment.updatedAt !== comment.createdAt &&
                                    " (đã chỉnh sửa)"}
                                </p>
                              </div>
                              {isMyComment && (
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={() => startEditing(comment)}
                                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Chỉnh sửa"
                                  >
                                    <IconEdit size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(comment.id)
                                    }
                                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Xóa"
                                  >
                                    <IconTrash size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
