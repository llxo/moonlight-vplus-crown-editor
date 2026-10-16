/**
 * @file App.tsx
 * @description Moonlight-vplus 王冠模式虚拟按键可视化编辑器主应用页面
 */

import { useEffect } from "react";
import { HeaderBar } from "./components/layout/HeaderBar";
import { LeftSidebar } from "./components/layout/LeftSidebar";
import { StageViewport } from "./components/layout/StageViewport";
import { RightInspector } from "./components/layout/RightInspector";
import { StatusBar } from "./components/layout/StatusBar";
import { useCrownStore } from "./store/useCrownStore";
import defaultSampleProfile from "../fixtures/minimal-profile.crown.json";

export default function App() {
  const {
    elements,
    loadFromBundleOrPayload,
    deleteSelectedElements,
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
      // 如果焦点在输入框或文本域内，不触发全局快捷键
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedElements();
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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0e0f12] text-slate-100">
      {/* 顶部操作工具栏 */}
      <HeaderBar />

      {/* 工作区三栏主体 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏：控件预设库与图层树 */}
        <LeftSidebar />

        {/* 中央主视口：设备模拟画幅与按键排布 */}
        <StageViewport />

        {/* 右侧边栏：选中国件属性与全局配置 */}
        <RightInspector />
      </div>

      {/* 底部状态栏 */}
      <StatusBar />
    </div>
  );
}
