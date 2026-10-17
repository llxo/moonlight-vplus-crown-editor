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
import { WelcomeModal } from "./components/layout/WelcomeModal";
import { ShareLinkModal } from "./components/layout/ShareLinkModal";
import { ExportModal } from "./components/layout/ExportModal";
import { StatusBar } from "./components/layout/StatusBar";
import { useCrownStore } from "./store/useCrownStore";

export default function App() {
  const {
    deleteSelectedElements,
    duplicateSelectedElements,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCrownStore();

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

      {/* 全局设置弹层 (通过底部 Dock 全局入口随时呼出) */}
      <GlobalSettingsModal />

      {/* 一体化导出与配置核对中心 (带元数据核对、本地下载与24h直链扫码) */}
      <ExportModal />

      {/* 24小时短效直链独立弹窗 */}
      <ShareLinkModal />

      {/* 欢迎引导与快速起步中心 */}
      <WelcomeModal />

      {/* 底部极简状态栏 */}
      <StatusBar />
    </div>
  );
}
