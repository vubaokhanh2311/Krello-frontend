import { create } from "zustand";
import { notifications } from "@mantine/notifications";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../api/commentService";
import type { Comment } from "../types/Comment";

interface CommentStore {
  comments: Record<string, Comment[]>;
  isLoading: boolean;

  fetchComments: (cardId: string) => Promise<void>;
  addComment: (cardId: string, content: string) => Promise<void>;
  updateComment: (
    cardId: string,
    commentId: string,
    content: string
  ) => Promise<void>;
  deleteComment: (cardId: string, commentId: string) => Promise<void>;

  getCommentsByCardId: (cardId: string) => Comment[];
  clearComments: () => void;
}

export const useCommentStore = create<CommentStore>((set, get) => ({
  comments: {},
  isLoading: false,

  fetchComments: async (cardId) => {
    try {
      set({ isLoading: true });
      const res = await getComments(cardId);
      const commentsData = Array.isArray(res) ? res : res.data || res;

      const sortedComments = commentsData.sort(
        (b, a) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      set((state) => ({
        comments: {
          ...state.comments,
          [cardId]: sortedComments,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      console.error("Error fetching comments:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể tải bình luận",
        color: "red",
      });
    }
  },

  addComment: async (cardId, content) => {
    if (!content.trim()) return;

    try {
      const res = await createComment(cardId, { content: content.trim() });
      const newComment = res.data || res;

      set((state) => {
        const currentComments = state.comments[cardId] || [];

        const updatedComments = [...currentComments, newComment].sort(
          (b, a) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return {
          comments: {
            ...state.comments,
            [cardId]: updatedComments,
          },
        };
      });

      notifications.show({
        title: "Thành công",
        message: "Đã thêm bình luận",
        color: "green",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể thêm bình luận",
        color: "red",
      });
      throw error;
    }
  },

  updateComment: async (cardId, commentId, content) => {
    if (!content.trim()) return;

    const trimmedContent = content.trim();
    const state = get();
    const currentComments = state.comments[cardId] || [];
    const commentToUpdate = currentComments.find((c) => c.id === commentId);

    if (commentToUpdate) {
      set((state) => ({
        comments: {
          ...state.comments,
          [cardId]: (state.comments[cardId] || []).map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  content: trimmedContent,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        },
      }));
    }

    try {
      const res = await updateComment(cardId, commentId, {
        content: trimmedContent,
      });
      const updatedComment = res.data || res;

      set((state) => ({
        comments: {
          ...state.comments,
          [cardId]: (state.comments[cardId] || []).map((c) =>
            c.id === commentId ? updatedComment : c
          ),
        },
      }));

      notifications.show({
        title: "Thành công",
        message: "Đã cập nhật bình luận",
        color: "green",
        autoClose: 2000,
      });
    } catch (error) {
      if (commentToUpdate) {
        set((state) => ({
          comments: {
            ...state.comments,
            [cardId]: (state.comments[cardId] || []).map((c) =>
              c.id === commentId ? commentToUpdate : c
            ),
          },
        }));
      }
      console.error("Error updating comment:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể cập nhật bình luận",
        color: "red",
      });
      throw error;
    }
  },

  deleteComment: async (cardId, commentId) => {
    const state = get();
    const currentComments = state.comments[cardId] || [];
    const commentToDelete = currentComments.find((c) => c.id === commentId);

    if (commentToDelete) {
      set((state) => ({
        comments: {
          ...state.comments,
          [cardId]: (state.comments[cardId] || []).filter(
            (c) => c.id !== commentId
          ),
        },
      }));
    }

    try {
      await deleteComment(cardId, commentId);

      notifications.show({
        title: "Thành công",
        message: "Đã xóa bình luận",
        color: "green",
        autoClose: 2000,
      });
    } catch (error) {
      if (commentToDelete) {
        set((state) => ({
          comments: {
            ...state.comments,
            [cardId]: [...(state.comments[cardId] || []), commentToDelete].sort(
              (b, a) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            ),
          },
        }));
      }
      console.error("Error deleting comment:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể xóa bình luận",
        color: "red",
      });
      throw error;
    }
  },

  getCommentsByCardId: (cardId) => {
    return get().comments[cardId] || [];
  },

  clearComments: () => set({ comments: {} }),
}));
