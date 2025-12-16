import { create } from "zustand";
import { notifications } from "@mantine/notifications";
import {
  getAttachments,
  createAttachment,
  updateAttachment,
  deleteAttachment,
} from "../api/attachmentService";
import type { Attachment } from "../types/Attachments";

interface AttachmentStore {
  attachments: Record<string, Attachment[]>;
  isLoading: boolean;

  fetchAttachments: (cardId: string) => Promise<void>;
  addAttachment: (cardId: string, file: File, name?: string) => Promise<void>;
  updateAttachment: (
    cardId: string,
    attachmentId: string,
    name: string
  ) => Promise<void>;
  deleteAttachment: (cardId: string, attachmentId: string) => Promise<void>;

  getAttachmentsByCardId: (cardId: string) => Attachment[];
  clearAttachments: () => void;
}

export const useAttachmentStore = create<AttachmentStore>((set, get) => ({
  attachments: {},
  isLoading: false,

  fetchAttachments: async (cardId) => {
    try {
      set({ isLoading: true });
      const res = await getAttachments(cardId);
      const attachmentsData = Array.isArray(res) ? res : res.data || res;

      const sortedAttachments = attachmentsData.sort(
        (b, a) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      set((state) => ({
        attachments: {
          ...state.attachments,
          [cardId]: sortedAttachments,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      console.error("Error fetching attachments:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể tải tệp đính kèm",
        color: "red",
      });
    }
  },

  addAttachment: async (cardId, file, name) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (name) {
        formData.append("name", name.trim());
      }

      const res = await createAttachment(cardId, formData);
      const newAttachment = res.data || res;

      set((state) => {
        const currentAttachments = state.attachments[cardId] || [];

        const updatedAttachments = [...currentAttachments, newAttachment].sort(
          (b, a) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return {
          attachments: {
            ...state.attachments,
            [cardId]: updatedAttachments,
          },
        };
      });

      notifications.show({
        title: "Thành công",
        message: "Đã thêm tệp đính kèm",
        color: "green",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error adding attachment:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể thêm tệp đính kèm",
        color: "red",
      });
      throw error;
    }
  },

  updateAttachment: async (cardId, attachmentId, fileName) => {
    if (!fileName.trim()) return;

    const trimmedName = fileName.trim();
    const state = get();

    const currentAttachments = state.attachments[cardId] || [];
    const attachmentToUpdate = currentAttachments.find(
      (a) => a.id === attachmentId
    );

    if (attachmentToUpdate) {
      set((state) => ({
        attachments: {
          ...state.attachments,
          [cardId]: (state.attachments[cardId] || []).map((a) =>
            a.id === attachmentId
              ? {
                  ...a,
                  fileName: trimmedName,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        },
      }));
    }

    try {
      const res = await updateAttachment(cardId, attachmentId, trimmedName);
      const updatedAttachment = res.data ?? res;

      set((state) => ({
        attachments: {
          ...state.attachments,
          [cardId]: (state.attachments[cardId] || []).map((a) =>
            a.id === attachmentId ? updatedAttachment : a
          ),
        },
      }));

      notifications.show({
        title: "Thành công",
        message: "Đã cập nhật tên tệp đính kèm",
        color: "green",
        autoClose: 2000,
      });
    } catch (error) {
      if (attachmentToUpdate) {
        set((state) => ({
          attachments: {
            ...state.attachments,
            [cardId]: (state.attachments[cardId] || []).map((a) =>
              a.id === attachmentId ? attachmentToUpdate : a
            ),
          },
        }));
      }

      console.error("Error updating attachment:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể cập nhật tệp đính kèm",
        color: "red",
      });

      throw error;
    }
  },

  deleteAttachment: async (cardId, attachmentId) => {
    const state = get();
    const currentAttachments = state.attachments[cardId] || [];
    const attachmentToDelete = currentAttachments.find(
      (a) => a.id === attachmentId
    );

    if (attachmentToDelete) {
      set((state) => ({
        attachments: {
          ...state.attachments,
          [cardId]: (state.attachments[cardId] || []).filter(
            (a) => a.id !== attachmentId
          ),
        },
      }));
    }

    try {
      await deleteAttachment(cardId, attachmentId);

      notifications.show({
        title: "Thành công",
        message: "Đã xóa tệp đính kèm",
        color: "green",
        autoClose: 2000,
      });
    } catch (error) {
      if (attachmentToDelete) {
        set((state) => ({
          attachments: {
            ...state.attachments,
            [cardId]: [
              ...(state.attachments[cardId] || []),
              attachmentToDelete,
            ].sort(
              (b, a) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            ),
          },
        }));
      }
      console.error("Error deleting attachment:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể xóa tệp đính kèm",
        color: "red",
      });
      throw error;
    }
  },

  getAttachmentsByCardId: (cardId) => {
    return get().attachments[cardId] || [];
  },

  clearAttachments: () => set({ attachments: {} }),
}));
