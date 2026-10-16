/**
 * @file useCrownStore.ts
 * @description Moonlight-vplus 王冠模式编辑器全局状态树与操作 Action
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import { create } from "zustand";
import {
  type CrownElement,
  type CrownGlobalSettings,
  type CrownLayoutBasis,
  type CrownProfileShareBundle,
} from "../crownSchema";
import {
  encodeCrownBundle,
  smartImportProfile,
  type SmartImportResult,
} from "../crownCodec";

export interface BundleMetadata {
  name: string;
  summary: string;
  bundleId?: string;
  packageName?: string;
  authorName?: string;
  gameName?: string;
  tags?: string[];
  appVersionName?: string;
}

export interface HistorySnapshot {
  elements: CrownElement[];
  settings: CrownGlobalSettings;
  layoutBasis: CrownLayoutBasis;
}

export interface CrownState {
  // 数据核心层
  meta: BundleMetadata;
  layoutBasis: CrownLayoutBasis;
  settings: CrownGlobalSettings;
  elements: CrownElement[];

  // 视口与交互层
  selectedElementIds: number[];
  hoveredElementId: number | null;
  zoom: number;
  panOffset: { x: number; y: number };
  snapToGrid: boolean;
  gridSize: number;
  showSafeArea: boolean;
  isLayersOpen: boolean;
  isGlobalSettingsOpen: boolean;
  isDirty: boolean;
  validationStatus: {
    isValidSha256: boolean;
    isValidMd5: boolean;
  };

  // 历史快照
  historyPast: HistorySnapshot[];
  historyFuture: HistorySnapshot[];

  // Actions
  selectElement: (id: number | null, multi?: boolean) => void;
  setHoveredElement: (id: number | null) => void;
  updateElement: (id: number, patch: Partial<CrownElement>) => void;
  updateElementTransient: (id: number, patch: Partial<CrownElement>) => void;
  updateElementsBatch: (patches: Array<{ id: number; patch: Partial<CrownElement> }>) => void;
  addElement: (element: CrownElement) => void;
  deleteSelectedElements: () => void;
  duplicateSelectedElements: () => void;
  reorderLayer: (id: number, targetLayer: number) => void;
  updateSettings: (patch: Partial<CrownGlobalSettings>) => void;
  updateMeta: (patch: Partial<BundleMetadata>) => void;
  updateLayoutBasis: (patch: Partial<CrownLayoutBasis>) => void;

  // 视口控制
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  resetViewport: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  toggleSafeArea: () => void;
  toggleLayers: () => void;
  setLayersOpen: (open: boolean) => void;
  toggleGlobalSettings: () => void;
  setGlobalSettingsOpen: (open: boolean) => void;

  // 历史控制
  pushHistorySnapshot: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // 导入与导出
  loadFromBundleOrPayload: (jsonText: string) => Promise<SmartImportResult>;
  exportBundle: () => Promise<CrownProfileShareBundle>;
}

const DEFAULT_LAYOUT_BASIS: CrownLayoutBasis = {
  widthPx: 2400,
  heightPx: 1080,
  densityDpi: 400,
  density: 2.5,
  orientation: "landscape",
};

const DEFAULT_SETTINGS: CrownGlobalSettings = {
  config_id: Date.now(),
  config_name: "FPS-Default",
  touch_enable: "true",
  touch_mode: "true",
  touch_sense: 100,
  game_vibrator: "false",
  button_vibrator: "false",
  mouse_wheel_speed: 20,
  enhanced_touch: "false",
};

export const useCrownStore = create<CrownState>((set, get) => ({
  meta: {
    name: "FPS-Default",
    summary: "王冠模式触控按键排布",
    authorName: "Crown Designer",
    gameName: "General PC Game",
    tags: ["FPS", "Crown"],
    appVersionName: "1.2.0",
  },
  layoutBasis: { ...DEFAULT_LAYOUT_BASIS },
  settings: { ...DEFAULT_SETTINGS },
  elements: [],

  selectedElementIds: [],
  hoveredElementId: null,
  zoom: 0.65,
  panOffset: { x: 0, y: 0 },
  snapToGrid: true,
  gridSize: 20,
  showSafeArea: true,
  isLayersOpen: false,
  isGlobalSettingsOpen: false,
  isDirty: false,
  validationStatus: {
    isValidSha256: true,
    isValidMd5: true,
  },

  historyPast: [],
  historyFuture: [],

  selectElement: (id, multi = false) => {
    if (id === null) {
      set({ selectedElementIds: [] });
      return;
    }
    const current = get().selectedElementIds;
    if (multi) {
      const exists = current.includes(id);
      set({
        selectedElementIds: exists ? current.filter((x) => x !== id) : [...current, id],
      });
    } else {
      set({
        selectedElementIds: [id],
      });
    }
  },

  setHoveredElement: (id) => set({ hoveredElementId: id }),

  pushHistorySnapshot: () => {
    const { elements, settings, layoutBasis, historyPast } = get();
    // 原生结构化深克隆保存快照，上限 30 步
    const snapshot: HistorySnapshot = {
      elements: structuredClone(elements),
      settings: { ...settings },
      layoutBasis: { ...layoutBasis },
    };
    const newPast = [...historyPast.slice(-29), snapshot];
    set({ historyPast: newPast, historyFuture: [], isDirty: true });
  },

  undo: () => {
    const { historyPast, historyFuture, elements, settings, layoutBasis } = get();
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1]!;
    const newPast = historyPast.slice(0, -1);
    const currentSnapshot: HistorySnapshot = {
      elements: structuredClone(elements),
      settings: { ...settings },
      layoutBasis: { ...layoutBasis },
    };

    set({
      elements: previous.elements,
      settings: previous.settings,
      layoutBasis: previous.layoutBasis,
      historyPast: newPast,
      historyFuture: [currentSnapshot, ...historyFuture],
      isDirty: true,
    });
  },

  redo: () => {
    const { historyPast, historyFuture, elements, settings, layoutBasis } = get();
    if (historyFuture.length === 0) return;
    const next = historyFuture[0]!;
    const newFuture = historyFuture.slice(1);
    const currentSnapshot: HistorySnapshot = {
      elements: structuredClone(elements),
      settings: { ...settings },
      layoutBasis: { ...layoutBasis },
    };

    set({
      elements: next.elements,
      settings: next.settings,
      layoutBasis: next.layoutBasis,
      historyPast: [...historyPast, currentSnapshot],
      historyFuture: newFuture,
      isDirty: true,
    });
  },

  canUndo: () => get().historyPast.length > 0,
  canRedo: () => get().historyFuture.length > 0,

  updateElement: (id, patch) => {
    get().pushHistorySnapshot();
    get().updateElementTransient(id, patch);
  },

  updateElementTransient: (id, patch) => {
    const updated = get().elements.map((el) => {
      if (el.element_id === id) {
        return { ...el, ...patch } as CrownElement;
      }
      return el;
    });
    set({ elements: updated, isDirty: true });
  },

  updateElementsBatch: (patches) => {
    get().pushHistorySnapshot();
    const patchMap = new Map<number, Partial<CrownElement>>();
    for (const p of patches) {
      patchMap.set(p.id, p.patch);
    }

    const updated = get().elements.map((el) => {
      const p = patchMap.get(el.element_id);
      if (p) {
        return { ...el, ...p } as CrownElement;
      }
      return el;
    });
    set({ elements: updated, isDirty: true });
  },

  addElement: (element) => {
    get().pushHistorySnapshot();
    set((state) => ({
      elements: [...state.elements, element],
      selectedElementIds: [element.element_id],
      isDirty: true,
    }));
  },

  deleteSelectedElements: () => {
    const ids = get().selectedElementIds;
    if (ids.length === 0) return;
    get().pushHistorySnapshot();
    set((state) => ({
      elements: state.elements.filter((el) => !ids.includes(el.element_id)),
      selectedElementIds: [],
      isDirty: true,
    }));
  },

  duplicateSelectedElements: () => {
    const ids = get().selectedElementIds;
    if (ids.length === 0) return;
    get().pushHistorySnapshot();

    const selectedElements = get().elements.filter((el) => ids.includes(el.element_id));
    const now = Date.now();
    const cloned = selectedElements.map((el, index) => {
      const newId = now + index + 1;
      return {
        ...el,
        element_id: newId,
        element_central_x: el.element_central_x + 40,
        element_central_y: el.element_central_y + 40,
      } as CrownElement;
    });

    set((state) => ({
      elements: [...state.elements, ...cloned],
      selectedElementIds: cloned.map((c) => c.element_id),
      isDirty: true,
    }));
  },

  reorderLayer: (id, targetLayer) => {
    get().pushHistorySnapshot();
    set((state) => ({
      elements: state.elements.map((el) =>
        el.element_id === id ? { ...el, element_layer: targetLayer } : el
      ),
      isDirty: true,
    }));
  },

  updateSettings: (patch) => {
    get().pushHistorySnapshot();
    set((state) => ({
      settings: { ...state.settings, ...patch },
      isDirty: true,
    }));
  },

  updateMeta: (patch) => {
    set((state) => ({
      meta: { ...state.meta, ...patch },
      isDirty: true,
    }));
  },

  updateLayoutBasis: (patch) => {
    get().pushHistorySnapshot();
    set((state) => ({
      layoutBasis: { ...state.layoutBasis, ...patch },
      isDirty: true,
    }));
  },

  setZoom: (zoomOrUpdater) => {
    const current = get().zoom;
    const nextZoom = typeof zoomOrUpdater === "function" ? zoomOrUpdater(current) : zoomOrUpdater;
    const clamped = Math.max(0.1, Math.min(3.0, Number(nextZoom.toFixed(2))));
    set({ zoom: clamped });
  },

  setPanOffset: (offset) => set({ panOffset: offset }),

  resetViewport: () => set({ zoom: 0.65, panOffset: { x: 0, y: 0 } }),

  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  setGridSize: (size) => set({ gridSize: size }),
  toggleSafeArea: () => set((s) => ({ showSafeArea: !s.showSafeArea })),
  toggleLayers: () => set((s) => ({ isLayersOpen: !s.isLayersOpen })),
  setLayersOpen: (open) => set({ isLayersOpen: open }),
  toggleGlobalSettings: () => set((s) => ({ isGlobalSettingsOpen: !s.isGlobalSettingsOpen })),
  setGlobalSettingsOpen: (open) => set({ isGlobalSettingsOpen: open }),

  loadFromBundleOrPayload: async (jsonText: string) => {
    const result = await smartImportProfile(jsonText);
    set({
      meta: {
        name: result.metadata.name,
        summary: result.metadata.summary || "",
        authorName: result.metadata.authorName || "Unknown",
        gameName: result.metadata.gameName || "Unknown",
        tags: result.metadata.tags || ["Crown"],
      },
      layoutBasis: result.layoutBasis,
      settings: result.parsedProfile.settings,
      elements: result.parsedProfile.elements,
      selectedElementIds: [],
      historyPast: [],
      historyFuture: [],
      isDirty: false,
      validationStatus: {
        isValidSha256: result.isValidSha256 ?? true,
        isValidMd5: result.isValidMd5,
      },
    });
    return result;
  },

  exportBundle: async () => {
    const { meta, layoutBasis, settings, elements } = get();
    return await encodeCrownBundle({
      name: meta.name,
      summary: meta.summary,
      settings,
      elements,
      layoutBasis,
      authorName: meta.authorName,
      gameName: meta.gameName,
      tags: meta.tags,
      appVersionName: meta.appVersionName,
      suggestedFileStem: meta.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    });
  },
}));
