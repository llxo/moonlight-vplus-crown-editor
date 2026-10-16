/**
 * @file GlobalSettingsModal.tsx
 * @description 全局配置轻弹窗：替代原先常驻右侧的全局设置面板，按需通过顶部按钮唤出，支持元数据与全局触控参数配置
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React from "react";
import { Settings, X } from "lucide-react";
import { useCrownStore } from "../../store/useCrownStore";

export const GlobalSettingsModal: React.FC = () => {
  const {
    isGlobalSettingsOpen,
    setGlobalSettingsOpen,
    settings,
    updateSettings,
    meta,
    updateMeta,
  } = useCrownStore();

  if (!isGlobalSettingsOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-[500px] max-w-[95vw] rounded-2xl border border-[#eaeaea] bg-[#ffffff] p-6 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.2)] space-y-5 animate-in zoom-in-95 duration-150">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-[#eaeaea] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111111] text-[#ffffff]">
              <Settings className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-bold text-base text-[#111111]">全局配置与元数据</h3>
          </div>
          <button
            type="button"
            onClick={() => setGlobalSettingsOpen(false)}
            className="rounded-lg p-1.5 text-[#6b7280] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 内容滚动区 */}
        <div className="max-h-[70vh] overflow-y-auto space-y-5 pr-1 text-sm">
          {/* Profile 社区分享包元数据 */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#374151]">
              配置元数据
            </div>
            <div>
              <label className="text-sm font-medium text-[#374151] block mb-1.5">配置名称</label>
              <input
                type="text"
                value={meta.name}
                onChange={(e) => updateMeta({ name: e.target.value })}
                className="w-full rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3.5 py-2 text-sm text-[#111111] outline-none focus:border-[#111111] focus:bg-[#ffffff] transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#374151] block mb-1.5">作者名称</label>
                <input
                  type="text"
                  value={meta.authorName || ""}
                  onChange={(e) => updateMeta({ authorName: e.target.value })}
                  className="w-full rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3.5 py-2 text-sm text-[#111111] outline-none focus:border-[#111111] focus:bg-[#ffffff] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151] block mb-1.5">适配游戏</label>
                <input
                  type="text"
                  value={meta.gameName || ""}
                  onChange={(e) => updateMeta({ gameName: e.target.value })}
                  className="w-full rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3.5 py-2 text-sm text-[#111111] outline-none focus:border-[#111111] focus:bg-[#ffffff] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#374151] block mb-1.5">配置简介说明</label>
              <textarea
                rows={2}
                value={meta.summary || ""}
                onChange={(e) => updateMeta({ summary: e.target.value })}
                className="w-full rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3.5 py-2 text-sm text-[#111111] outline-none focus:border-[#111111] focus:bg-[#ffffff] transition-colors"
              />
            </div>
          </div>

          {/* 全局触控参数 */}
          <div className="space-y-3 border-t border-[#eaeaea] pt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#374151]">
              触控与手柄设置
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-medium text-[#111111]">触控模式</span>
              <select
                value={settings.touch_mode}
                onChange={(e) => updateSettings({ touch_mode: e.target.value as "true" | "false" })}
                className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3 py-1.5 text-sm font-medium text-[#111111] outline-none focus:border-[#111111]"
              >
                <option value="true">触控板模式 (Trackpad)</option>
                <option value="false">多点/经典模式 (Classic)</option>
              </select>
            </div>
            <div className="space-y-1.5 py-1">
              <div className="flex justify-between text-sm text-[#374151]">
                <span>滑动灵敏度</span>
                <span className="font-mono font-bold text-[#111111]">{settings.touch_sense}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={settings.touch_sense}
                onChange={(e) => updateSettings({ touch_sense: Number(e.target.value) })}
                className="w-full accent-[#111111] h-2 bg-[#eaeaea] rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm font-medium text-[#111111]">手柄马达震动回馈</span>
              <input
                type="checkbox"
                checked={settings.game_vibrator === "true"}
                onChange={(e) => updateSettings({ game_vibrator: e.target.checked ? "true" : "false" })}
                className="accent-[#111111] h-4.5 w-4.5 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm font-medium text-[#111111]">虚拟按键触觉反馈</span>
              <input
                type="checkbox"
                checked={settings.button_vibrator === "true"}
                onChange={(e) => updateSettings({ button_vibrator: e.target.checked ? "true" : "false" })}
                className="accent-[#111111] h-4.5 w-4.5 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 底部确认 */}
        <div className="border-t border-[#eaeaea] pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setGlobalSettingsOpen(false)}
            className="rounded-lg bg-[#111111] px-6 py-2.5 font-semibold text-sm text-[#ffffff] hover:bg-[#2b2b2b] transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
