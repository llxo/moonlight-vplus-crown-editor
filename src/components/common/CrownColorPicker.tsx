/**
 * @file CrownColorPicker.tsx
 * @description 轻量精致颜色选择器：遵循 minimalist-ui 规范，提供预设高质感手柄色盘、透明度调节与自定义Hex输入，消除原生丑陋直角弹窗遮挡
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { CrownColorUtils } from "../../crownSchema";

interface CrownColorPickerProps {
  label: string;
  intColor: number;
  onChange: (newIntColor: number) => void;
}

// 常用手柄与虚拟按键高质感预设配色
const COLOR_PRESETS = [
  { name: "王冠紫", hex: "#8868a8" },
  { name: "战术绿", hex: "#44a444" },
  { name: "极客蓝", hex: "#1f6c9f" },
  { name: "警示红", hex: "#d9534f" },
  { name: "暖金黄", hex: "#d48806" },
  { name: "曜石黑", hex: "#111111" },
  { name: "白瓷", hex: "#ffffff" },
  { name: "半透黑 (20%)", hex: "#00000033" },
  { name: "半透白 (30%)", hex: "#ffffff4d" },
  { name: "全透明", hex: "#00000000" },
];

export const CrownColorPicker: React.FC<CrownColorPickerProps> = ({
  label,
  intColor,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取标准的 8 位 Hex: #RRGGBBAA
  const currentRgbaHex = CrownColorUtils.intToRgbaHex(intColor);
  const currentRgbHex = currentRgbaHex.slice(0, 7);

  // 解析透明度 (0 ~ 100)
  const currentAlphaInt = (intColor >>> 24) & 0xff;
  const currentAlphaPercent = Math.round((currentAlphaInt / 255) * 100);

  const [hexInput, setHexInput] = useState(currentRgbHex);

  useEffect(() => {
    setHexInput(currentRgbHex);
  }, [currentRgbHex]);

  // 点击外部关闭弹层
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("mousedown", handleOutsideClick);
    }
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // 更新 RGB 颜色，保留当前 Alpha
  const handleRgbChange = (newHex6: string) => {
    const clean = newHex6.replace("#", "");
    if (clean.length === 6) {
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      const newInt = ((currentAlphaInt & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
      onChange(newInt | 0);
    }
  };

  // 调节透明度
  const handleAlphaChange = (alphaPercent: number) => {
    const newAlphaInt = Math.round((alphaPercent / 100) * 255);
    const uint32 = intColor >>> 0;
    const r = (uint32 >> 16) & 0xff;
    const g = (uint32 >> 8) & 0xff;
    const b = uint32 & 0xff;
    const newInt = ((newAlphaInt & 0xff) << 24) | (r << 16) | (g << 8) | b;
    onChange(newInt | 0);
  };

  // 点选预设
  const handleSelectPreset = (presetHex: string) => {
    onChange(CrownColorUtils.rgbaHexToInt(presetHex));
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative space-y-1">
      <label className="text-xs font-medium text-[#4b5563] block">{label}</label>

      {/* 紧凑触发框 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between rounded-md border border-[#eaeaea] bg-[#ffffff] p-1.5 transition-all hover:border-[#111111]/40 hover:bg-[#fbfbfa]"
      >
        <div className="flex items-center gap-2">
          {/* 实体色块展示 */}
          <div
            style={{ backgroundColor: currentRgbaHex }}
            className="h-5 w-7 rounded border border-[#d4d4d0] shadow-2xs"
          />
          <span className="font-mono text-xs font-semibold text-[#111111]">
            {currentRgbHex}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#6b7280] bg-[#f7f6f3] px-1.5 py-0.5 rounded border border-[#eaeaea]">
          {currentAlphaPercent}%
        </span>
      </div>

      {/* 精致微型调色弹窗 (替代丑陋的原生直角 color picker) */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-64 rounded-xl border border-[#eaeaea] bg-[#ffffff] p-3 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] animate-in fade-in space-y-3 select-none">
          {/* 头部标题与关闭 */}
          <div className="flex items-center justify-between border-b border-[#eaeaea] pb-2">
            <span className="text-xs font-bold text-[#111111]">色彩与透明度</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-[#6b7280] hover:bg-[#f7f6f3] hover:text-[#111111]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 常用高质感预设色盘 */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#6b7280]">预设配色</span>
            <div className="grid grid-cols-5 gap-1.5">
              {COLOR_PRESETS.map((p) => {
                const isSelected = p.hex.toLowerCase() === currentRgbaHex.toLowerCase() || p.hex.toLowerCase() === currentRgbHex.toLowerCase();
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p.hex)}
                    style={{ backgroundColor: p.hex }}
                    className={`h-7 rounded border transition-transform hover:scale-110 flex items-center justify-center relative ${
                      isSelected ? "border-[#111111] ring-2 ring-[#111111]/30" : "border-[#d4d4d0]"
                    }`}
                    title={`${p.name} (${p.hex})`}
                  >
                    {isSelected && (
                      <Check className={`h-3 w-3 ${p.hex === "#ffffff" ? "text-[#111111]" : "text-[#ffffff]"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hex 自定义与拾色器小按钮 */}
          <div className="space-y-1.5 border-t border-[#eaeaea] pt-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#6b7280]">
              <span>自定义颜色</span>
              <span className="font-mono text-[#111111]">{currentRgbaHex}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentRgbHex}
                onChange={(e) => handleRgbChange(e.target.value)}
                className="h-7 w-8 cursor-pointer rounded border border-[#d4d4d0] bg-transparent p-0"
                title="选择颜色"
              />
              <input
                type="text"
                value={hexInput}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  if (e.target.value.startsWith("#") && e.target.value.length === 7) {
                    handleRgbChange(e.target.value);
                  }
                }}
                className="flex-1 rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 font-mono text-xs font-semibold text-[#111111] outline-none focus:border-[#111111]"
                placeholder="#8868A8"
              />
            </div>
          </div>

          {/* 不透明度调节滑动条 */}
          <div className="space-y-1 border-t border-[#eaeaea] pt-2">
            <div className="flex justify-between text-[11px] font-semibold text-[#6b7280]">
              <span>不透明度</span>
              <span className="font-mono text-[#111111]">{currentAlphaPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentAlphaPercent}
              onChange={(e) => handleAlphaChange(Number(e.target.value))}
              className="w-full accent-[#111111]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
