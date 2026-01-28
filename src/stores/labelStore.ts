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

interface LabelStore {
  labels: Label[];
  isLoading: boolean;

  fetchLabels: (boardId: string) => Promise<void>;
  createLabelAction: (boardId: string, dto: CreateLabelDto) => Promise<Label>;
  updateLabelAction: (
    boardId: string,
    labelId: string,
    dto: UpdateLabelDto,
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
      const res = (await getLabel(boardId)) as { data: Label[] };
      set({ labels: res.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createLabelAction: async (boardId, dto) => {
    const res = await createLabel(boardId, {
      name: dto.name,
      color: dto.color || "#e5e7eb",
    });
    const newLabel = (res as { data: Label }).data;

    set({
      labels: [...get().labels, newLabel],
    });

    return newLabel;
  },

  updateLabelAction: async (boardId, labelId, dto) => {
    const res = await updateLabel(boardId, labelId, {
      name: dto.name,
      color: dto.color || "#e5e7eb",
    });
    const updated = (res as { data: Label }).data;

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
