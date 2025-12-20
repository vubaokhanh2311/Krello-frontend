import { create } from "zustand";
import {
  getLabel,
  createLabel,
  updateLabel,
  deleteLabel,
} from "../api/labelService";

import type { Label } from "../types/BoardDetail";

export interface CreateLabelDto {
  name: string;
  color: string | null;
}

export interface UpdateLabelDto {
  name: string;
  color: string | null;
}

interface ApiResponse<T> {
  data: T;
}

interface LabelStore {
  labels: Label[];
  isLoading: boolean;

  fetchLabels: (boardId: string) => Promise<void>;
  createLabelAction: (boardId: string, dto: CreateLabelDto) => Promise<Label>;
  updateLabelAction: (
    boardId: string,
    labelId: string,
    dto: UpdateLabelDto
  ) => Promise<Label>;
  deleteLabelAction: (boardId: string, labelId: string) => Promise<void>;
}

// --- Zustand Store ---
export const useLabelStore = create<LabelStore>((set, get) => ({
  labels: [],
  isLoading: false,

  fetchLabels: async (boardId) => {
    set({ isLoading: true });
    try {
      const res = (await getLabel(boardId)) as ApiResponse<Label[]>;
      set({ labels: res.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createLabelAction: async (boardId, dto) => {
    const createDto = {
      name: dto.name,
      color: dto.color || "#808080", // Default color if null
    };
    const res = (await createLabel(boardId, createDto)) as ApiResponse<Label>;
    const newLabel = res.data;

    set({
      labels: [...get().labels, newLabel],
    });

    return newLabel;
  },

  updateLabelAction: async (boardId, labelId, dto) => {
    const updateDto = {
      name: dto.name,
      color: dto.color || "#808080",
    };
    const res = (await updateLabel(
      boardId,
      labelId,
      updateDto
    )) as ApiResponse<Label>;
    const updated = res.data;

    set({
      labels: get().labels.map((l) => (l.id === labelId ? updated : l)),
    });

    return updated;
  },

  deleteLabelAction: async (boardId, labelId) => {
    await deleteLabel(boardId, labelId);

    set({
      labels: get().labels.filter((l) => l.id !== labelId),
    });
  },
}));
