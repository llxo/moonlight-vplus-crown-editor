/**
 * @file WelcomeModal.tsx
 * @description 欢迎引导与快速起步中心：遵循 minimalist-ui 规范，采用 Bento-grid 便当盒排版、官方模版快速载入、文件拖拽导入与微键帽快捷键速查
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Crown,
  X,
  Upload,
  FilePlus,
  Compass,
  Gamepad2,
  PieChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useCrownStore } from "../../store/useCrownStore";
import { PRESET_TEMPLATES, type PresetTemplate } from "../../constants/templates";

export const WelcomeModal: React.FC = () => {
  const {
    isWelcomeModalOpen,
    setWelcomeModalOpen,
    loadBlankProfile,
    loadFromBundleOrPayload,
    pushHistorySnapshot,
  } = useCrownStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDontShowAgain(localStorage.getItem("moonlight_crown_welcome_dismissed") === "true");
    }
  }, [isWelcomeModalOpen]);

  // ESC 键关闭
  useEffect(() => {
    if (!isWelcomeModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWelcomeModalOpen, dontShowAgain]);

  if (!isWelcomeModalOpen) {
    return null;
  }

  const handleClose = () => {
    if (typeof window !== "undefined") {
      if (dontShowAgain) {
        localStorage.setItem("moonlight_crown_welcome_dismissed", "true");
      } else {
        localStorage.removeItem("moonlight_crown_welcome_dismissed");
      }
    }
    setWelcomeModalOpen(false);
  };

  const handleApplyTemplate = (tpl: PresetTemplate) => {
    pushHistorySnapshot();
    useCrownStore.setState({
      elements: tpl.elements,
      selectedElementIds: [],
      isDirty: true,
      meta: {
        ...useCrownStore.getState().meta,
        ...tpl.meta,
      },
      settings: {
        ...useCrownStore.getState().settings,
        ...tpl.settings,
      },
    });
    handleClose();
  };

  const handleCreateBlank = () => {
    loadBlankProfile();
    handleClose();
  };

  const handleFileProcess = async (file: File) => {
    try {
      const text = await file.text();
      await loadFromBundleOrPayload(text);
      handleClose();
    } catch (err: any) {
      alert(`导入配置文件失败: ${err.message || "格式不合法"}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const getTemplateIcon = (id: string) => {
    switch (id) {
      case "fps-tactical":
        return <Compass className="h-4 w-4 text-[#1f6c9f]" />;
      case "gamepad-classic":
        return <Gamepad2 className="h-4 w-4 text-[#956400]" />;
      case "rpg-wheel":
        return <PieChart className="h-4 w-4 text-[#5c3e75]" />;
      default:
        return <Sparkles className="h-4 w-4 text-[#111111]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 sm:p-6 select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-[#eaeaea] bg-[#ffffff] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.18)] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between border-b border-[#eaeaea] px-6 py-4 bg-[#ffffff]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111111] text-[#ffffff] shadow-xs">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#111111] tracking-tight">
                  Moonlight-vplus Crown Editor
                </h2>
                <span className="rounded-full bg-[#fbf3db] text-[#956400] text-[10px] font-mono px-2 py-0.5 border border-[#eaeaea]">
                  v1.2.0
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-[#787774] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors cursor-pointer"
            title="关闭引导"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 主体 Bento 便当盒滚动区 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#fafaf9]">
          {/* Bento Grid 布局 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 左区 2 列：官方推荐模版快速开始 */}
            <div className="md:col-span-2 rounded-xl border border-[#eaeaea] bg-[#ffffff] p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#374151]">
                  推荐模版
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {PRESET_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                    className="group flex items-start justify-between rounded-lg border border-[#eaeaea] p-3 hover:border-[#111111] hover:bg-[#fbfbfa] transition-all cursor-pointer relative"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7f6f3] border border-[#eaeaea] group-hover:bg-[#111111] group-hover:text-[#ffffff] transition-colors shrink-0">
                        {getTemplateIcon(tpl.id)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#111111]">
                          {tpl.title}
                        </span>
                        <span className="rounded bg-[#f7f6f3] text-[#4b5563] text-[10px] px-1.5 py-0.5 font-medium border border-[#eaeaea]">
                          {tpl.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity pl-2 self-center shrink-0">
                      <span className="text-[11px] font-medium">载入</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 右区 1 列：导入与空白起步 */}
            <div className="flex flex-col gap-4">
              {/* 导入本地配置 */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all cursor-pointer ${
                  isDraggingFile
                    ? "border-[#111111] bg-[#fbf3db]"
                    : "border-[#dcdbd8] bg-[#ffffff] hover:border-[#111111] hover:bg-[#fbfbfa]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileProcess(file);
                    e.target.value = "";
                  }}
                  accept=".json,.crown.json"
                  className="hidden"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f6f3] border border-[#eaeaea] mb-2">
                  <Upload className="h-5 w-5 text-[#4b5563]" />
                </div>
                <span className="font-bold text-xs text-[#111111]">
                  导入已有配置
                </span>
              </div>

              {/* 从空白画布开始 */}
              <div
                onClick={handleCreateBlank}
                className="group rounded-xl border border-[#eaeaea] bg-[#ffffff] p-3.5 hover:border-[#111111] hover:bg-[#fbfbfa] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7f6f3] border border-[#eaeaea]">
                    <FilePlus className="h-4 w-4 text-[#111111]" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-[#111111] block">
                      纯净空白画布
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#787774] group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* 下方全宽卡片：快捷操作与效率微指南 (微键帽风格) */}
            <div className="md:col-span-3 rounded-xl border border-[#eaeaea] bg-[#ffffff] p-4 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#374151] block">
                工作台交互快捷速查
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
                <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2 space-y-1">
                  <div className="text-[10px] text-[#787774]">画布平移</div>
                  <div className="font-mono text-xs font-semibold text-[#111111]">
                    <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">Space</kbd> + 拖拽
                  </div>
                </div>

                <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2 space-y-1">
                  <div className="text-[10px] text-[#787774]">视口缩放</div>
                  <div className="font-mono text-xs font-semibold text-[#111111]">
                    <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">鼠标滚轮</kbd>
                  </div>
                </div>

                <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2 space-y-1">
                  <div className="text-[10px] text-[#787774]">瞬间克隆控件</div>
                  <div className="font-mono text-xs font-semibold text-[#111111]">
                    <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">D</kbd>
                  </div>
                </div>

                <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2 space-y-1">
                  <div className="text-[10px] text-[#787774]">撤销操作</div>
                  <div className="font-mono text-xs font-semibold text-[#111111]">
                    <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">Ctrl</kbd> + <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">Z</kbd>
                  </div>
                </div>

                <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2 space-y-1">
                  <div className="text-[10px] text-[#787774]">删除控件</div>
                  <div className="font-mono text-xs font-semibold text-[#111111]">
                    <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">Del</kbd> / <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">Backspace</kbd>
                  </div>
                </div>

                <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2 space-y-1">
                  <div className="text-[10px] text-[#787774]">快捷操作菜单</div>
                  <div className="font-mono text-xs font-semibold text-[#111111]">
                    <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">鼠标右键</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 Footer */}
        <div className="flex items-center justify-between border-t border-[#eaeaea] px-6 py-3.5 bg-[#ffffff]">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#787774] hover:text-[#111111] transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-[#dcdbd8] accent-[#111111] cursor-pointer"
            />
            <span>下次启动不再自动弹出</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-[#111111] px-5 py-2 text-xs font-semibold text-[#ffffff] hover:bg-[#2b2b2b] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            进入工作台
          </button>
        </div>
      </div>
    </div>
  );
};
