/**
 * @file App.tsx
 * @description Moonlight-vplus 王冠模式虚拟按键可视化编辑器：沉浸式悬浮工作台架构
 */

import { useEffect } from "react";
import { HeaderBar } from "./components/layout/HeaderBar";
import { StageViewport } from "./components/layout/StageViewport";
import { FloatingDock } from "./components/layout/FloatingDock";
import { FloatingInspector } from "./components/layout/FloatingInspector";
import { GlobalSettingsModal } from "./components/layout/GlobalSettingsModal";
import { StatusBar } from "./components/layout/StatusBar";
import { useCrownStore } from "./store/useCrownStore";
import defaultSampleProfile from "../fixtures/minimal-profile.crown.json";

export default function App() {
  const {
    elements,
    loadFromBundleOrPayload,
    deleteSelectedElements,
    duplicateSelectedElements,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCrownStore();

  // 初次启动加载默认示例
  useEffect(() => {
    if (elements.length === 0) {
      loadFromBundleOrPayload(JSON.stringify(defaultSampleProfile)).catch(console.error);
    }
  }, []);

  // 全局键盘快捷键响应 (Delete, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedElements();
      } else if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelectedElements();
      } else if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo()) redo();
        } else {
          if (canUndo()) undo();
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedElements, undo, redo, canUndo, canRedo]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f7f6f3] text-[#111111] relative">
      {/* 顶部操作工具栏 */}
      <HeaderBar />

      {/* 沉浸式工作台主视口 (全屏宽幅设备画框 + 伴随悬浮卡片 + 底部工具坞) */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* 中央画幅 */}
        <StageViewport />

        {/* 底部悬浮按键胶囊坞 (包含核心预设与图层抽屉) */}
        <FloatingDock />

        {/* 右侧按需伴随悬浮属性卡片 (选中时轻量浮现) */}
        <FloatingInspector />
      </div>

      {/* 全局设置弹层 */}
      <GlobalSettingsModal />

      {/* 底部极简状态栏 */}
      <StatusBar />
    </div>
  );
}
