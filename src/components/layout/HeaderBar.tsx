/**
 * @file HeaderBar.tsx
 * @description 顶部全局操作栏：遵循 minimalist-ui 规范，采用纯净暖白背景、深炭黑排版与严谨的功能层级划分
 */

import React, { useRef, useState, useEffect } from "react";
import {
  Download,
  Upload,
  Undo2,
  Redo2,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Crown,
  ChevronDown,
  HelpCircle,
  Palette,
} from "lucide-react";
import { useCrownStore } from "../../store/useCrownStore";

const PRESET_RESOLUTIONS = [
  { label: "2400 × 1080 (20:9 常见旗舰 400 DPI)", width: 2400, height: 1080, dpi: 400, density: 2.5 },
  { label: "2340 × 1080 (19.5:9 水滴屏 440 DPI)", width: 2340, height: 1080, dpi: 440, density: 2.75 },
  { label: "1920 × 1080 (16:9 掌机/大屏 360 DPI)", width: 1920, height: 1080, dpi: 360, density: 2.25 },
  { label: "1920 × 1080 (16:9 标准高清 320 DPI)", width: 1920, height: 1080, dpi: 320, density: 2.0 },
  { label: "2560 × 1440 (16:9 2K 游戏屏 480 DPI)", width: 2560, height: 1440, dpi: 480, density: 3.0 },
  { label: "2560 × 1600 (16:10 平板设备 360 DPI)", width: 2560, height: 1600, dpi: 360, density: 2.25 },
];

export const HeaderBar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isResDropdownOpen, setIsResDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);

  const {
    meta,
    layoutBasis,
    zoom,
    updateMeta,
    updateLayoutBasis,
    applyAutoColor,
    setZoom,
    resetViewport,
    undo,
    redo,
    canUndo,
    canRedo,
    loadFromBundleOrPayload,
    toggleWelcomeModal,
    toggleExportModal,
  } = useCrownStore();

  const [customWidth, setCustomWidth] = useState(layoutBasis.widthPx);
  const [customHeight, setCustomHeight] = useState(layoutBasis.heightPx);
  const [customDpi, setCustomDpi] = useState(layoutBasis.densityDpi);

  useEffect(() => {
    setCustomWidth(layoutBasis.widthPx);
    setCustomHeight(layoutBasis.heightPx);
    setCustomDpi(layoutBasis.densityDpi);
  }, [layoutBasis.widthPx, layoutBasis.heightPx, layoutBasis.densityDpi]);

  const handleApplyCustomRes = () => {
    const w = Math.max(640, Math.min(7680, Number(customWidth) || 1920));
    const h = Math.max(360, Math.min(4320, Number(customHeight) || 1080));
    const dpi = Math.max(100, Math.min(1000, Number(customDpi) || 360));
    const density = Number((dpi / 160).toFixed(2));
    updateLayoutBasis({
      widthPx: w,
      heightPx: h,
      densityDpi: dpi,
      density,
    });
    setIsResDropdownOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        await loadFromBundleOrPayload(text);
      } catch (err: any) {
        alert(`导入失败: ${err.message || "文件格式错误"}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsResDropdownOpen(false);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(e.target as Node)) {
        setIsColorDropdownOpen(false);
      }
    };
    if (isResDropdownOpen || isColorDropdownOpen) {
      window.addEventListener("mousedown", handleOutsideClick);
    }
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [isResDropdownOpen, isColorDropdownOpen]);

  const currentPreset = PRESET_RESOLUTIONS.find(
    (r) =>
      r.width === layoutBasis.widthPx &&
      r.height === layoutBasis.heightPx &&
      r.dpi === layoutBasis.densityDpi
  );
  const currentResLabel = currentPreset
    ? currentPreset.label
    : `${layoutBasis.widthPx} × ${layoutBasis.heightPx} (${layoutBasis.densityDpi} DPI)`;

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-[#eaeaea] bg-[#ffffff] px-6 text-sm select-none">
      {/* 左区：应用品牌 Logo & 内联工程标题轻量编辑 */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-[#111111] text-[#ffffff] shadow-2xs">
            <Crown className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#111111] whitespace-nowrap">
            Moonlight-vplus Crown Editor
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#e5e5e5]" />

        {/* 内联轻量重命名标题 (Figma 风格，平常干净，悬停聚焦微提示) */}
        <input
          type="text"
          value={meta.name}
          onChange={(e) => updateMeta({ name: e.target.value })}
          className="h-9 w-48 rounded-lg px-2.5 text-sm font-semibold text-[#111111] hover:bg-[#f7f6f3] focus:bg-[#fbfbfa] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all placeholder:text-[#999999]"
          placeholder="未命名配置"
          title="点击编辑配置名称"
        />
      </div>

      {/* 中区：设备基准选择、视口缩放与画布辅助工具 */}
      <div className="flex items-center gap-2.5">
        {/* 设备基准分辨率选择器 */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsResDropdownOpen(!isResDropdownOpen)}
            className="h-9 flex items-center gap-2 rounded-lg border border-[#eaeaea] bg-[#ffffff] px-3.5 text-xs font-semibold text-[#111111] hover:bg-[#fbfbfa] hover:border-[#d4d4d0] transition-all shadow-2xs cursor-pointer"
          >
            <Smartphone className="h-4 w-4 text-[#6b7280]" />
            <span>{currentResLabel}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-[#888888] transition-transform duration-150 ${isResDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isResDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 z-40 w-[320px] rounded-2xl border border-[#eaeaea] bg-[#ffffff] p-3 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] animate-in fade-in space-y-2.5 select-none">
              <div>
                <div className="px-2 pb-1.5 text-xs font-bold text-[#6b7280] uppercase tracking-wider">
                  推荐预设
                </div>
                <div className="space-y-0.5">
                  {PRESET_RESOLUTIONS.map((res) => {
                    const isSelected =
                      layoutBasis.widthPx === res.width &&
                      layoutBasis.heightPx === res.height &&
                      layoutBasis.densityDpi === res.dpi;
                    return (
                      <button
                        key={`${res.width}x${res.height}_${res.dpi}`}
                        type="button"
                        onClick={() => {
                          updateLayoutBasis({
                            widthPx: res.width,
                            heightPx: res.height,
                            densityDpi: res.dpi,
                            density: res.density,
                          });
                          setIsResDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#111111] text-[#ffffff] font-semibold"
                            : "text-[#2f3437] hover:bg-[#f7f6f3] hover:text-[#111111]"
                        }`}
                      >
                        <span>{res.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-[#ffffff]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 分隔线与自定义输入区域 */}
              <div className="border-t border-[#eaeaea] pt-2.5 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#374151]">
                    自定义画幅与 DPI
                  </span>
                  <span className="text-[11px] font-mono text-[#6b7280]">
                    比例: {Number(((Number(customDpi) || 360) / 160).toFixed(2))}x
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="text-[11px] font-medium text-[#6b7280] block mb-0.5">宽 (Px)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Number(e.target.value))}
                      className="w-full rounded-md border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 font-mono text-xs font-semibold text-[#111111] outline-none focus:border-[#111111]"
                      placeholder="1920"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#6b7280] block mb-0.5">高 (Px)</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(Number(e.target.value))}
                      className="w-full rounded-md border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 font-mono text-xs font-semibold text-[#111111] outline-none focus:border-[#111111]"
                      placeholder="1080"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#6b7280] block mb-0.5">DPI</label>
                    <input
                      type="number"
                      value={customDpi}
                      onChange={(e) => setCustomDpi(Number(e.target.value))}
                      className="w-full rounded-md border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 font-mono text-xs font-semibold text-[#111111] outline-none focus:border-[#111111]"
                      placeholder="360"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyCustomRes}
                  className="w-full rounded-lg bg-[#111111] py-1.5 font-semibold text-xs text-[#ffffff] hover:bg-[#2b2b2b] transition-colors cursor-pointer shadow-2xs"
                >
                  应用自定义分辨率
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 视口缩放控制胶囊组合 */}
        <div className="h-9 flex items-center rounded-lg border border-[#eaeaea] bg-[#ffffff] px-1 shadow-2xs">
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
            className="rounded p-1.5 text-[#6b7280] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors cursor-pointer"
            title="缩小画布"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-mono text-xs font-semibold text-[#111111]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
            className="rounded p-1.5 text-[#6b7280] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors cursor-pointer"
            title="放大画布"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="h-4 w-[1px] bg-[#eaeaea] mx-1" />
          <button
            onClick={resetViewport}
            className="rounded p-1.5 text-[#6b7280] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors cursor-pointer"
            title="画幅自适应居中"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 撤销 / 重做 */}
        <div className="h-9 flex items-center rounded-lg border border-[#eaeaea] bg-[#ffffff] px-1 shadow-2xs">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="rounded p-1.5 text-[#6b7280] hover:text-[#111111] hover:bg-[#f7f6f3] disabled:opacity-25 transition-colors cursor-pointer"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="rounded p-1.5 text-[#6b7280] hover:text-[#111111] hover:bg-[#f7f6f3] disabled:opacity-25 transition-colors cursor-pointer"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* 一键智能自动配色面板 */}
        <div className="relative" ref={colorDropdownRef}>
          <button
            type="button"
            onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
            className="h-9 flex items-center gap-1.5 rounded-lg border border-[#eaeaea] bg-[#ffffff] px-3 text-xs font-semibold text-[#111111] hover:bg-[#fbfbfa] hover:border-[#d4d4d0] transition-all shadow-2xs cursor-pointer"
            title="一键全局配色 (基于主色 HSV 自适应推导)"
          >
            <Palette className="h-4 w-4 text-[#6b7280]" />
            <span>配色</span>
            <ChevronDown className={`h-3.5 w-3.5 text-[#888888] transition-transform duration-150 ${isColorDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isColorDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 z-40 w-64 rounded-2xl border border-[#eaeaea] bg-[#ffffff] p-3.5 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] animate-in fade-in space-y-3 select-none">
              <div className="text-xs font-bold text-[#374151] flex items-center justify-between">
                <span>一键智能主题配色</span>
                <span className="text-[10px] text-[#6b7280] font-normal">基于 HSV 推导</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "极简纯黑", color: "#111111" },
                  { name: "王冠琥珀", color: "#d97706" },
                  { name: "电竞深蓝", color: "#2563eb" },
                  { name: "赛博翠绿", color: "#16a34a" },
                  { name: "机甲绯红", color: "#dc2626" },
                  { name: "幻影暗紫", color: "#7c3aed" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      applyAutoColor(preset.color);
                      setIsColorDropdownOpen(false);
                    }}
                    className="flex flex-col items-center gap-1 rounded-lg border border-[#eaeaea] p-1.5 hover:border-[#111111]/40 hover:bg-[#fbfbfa] transition-all cursor-pointer"
                  >
                    <div
                      className="h-5 w-5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-[11px] font-medium text-[#4b5563] truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[#eaeaea] pt-2 flex items-center justify-between">
                <span className="text-xs text-[#6b7280]">自定义基准主色:</span>
                <input
                  type="color"
                  defaultValue="#2563eb"
                  onChange={(e) => applyAutoColor(e.target.value)}
                  className="h-7 w-12 cursor-pointer rounded border border-[#eaeaea] p-0.5 bg-[#fbfbfa]"
                  title="选取任意颜色实时应用到所有按键"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右区：精简核心业务操作 */}
      <div className="flex items-center gap-2.5">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json,.crown.json"
          className="hidden"
        />

        <button
          onClick={toggleWelcomeModal}
          className="h-9 flex items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-[#4b5563] hover:text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          title="指南与模版中心"
        >
          <HelpCircle className="h-4 w-4" />
          <span>模版</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="h-9 flex items-center gap-1.5 rounded-lg border border-[#eaeaea] bg-[#ffffff] px-3.5 text-xs font-semibold text-[#374151] hover:bg-[#f7f6f3] hover:border-[#d4d4d0] transition-all shadow-2xs cursor-pointer"
          title="导入 .crown.json 或 raw-payload.json"
        >
          <Upload className="h-4 w-4 text-[#6b7280]" />
          <span>导入配置</span>
        </button>

        {/* 规范主 CTA 按钮: 纯黑实体背景 #111111 */}
        <button
          onClick={toggleExportModal}
          className="h-9 flex items-center gap-1.5 rounded-lg bg-[#111111] px-4 text-xs font-semibold text-[#ffffff] hover:bg-[#2b2b2b] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          title="核对配置与元数据，支持下载文件与 24h 直链扫码"
        >
          <Download className="h-4 w-4 text-[#ffffff]" />
          <span>导出配置</span>
        </button>

        <div className="h-4 w-[1px] bg-[#eaeaea]" />

        {/* GitHub 仓库直达链接 */}
        <a
          href="https://github.com/llxo/moonlight-vplus-crown-editor/"
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 w-9 flex items-center justify-center rounded-lg text-[#4b5563] hover:text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          title="GitHub 仓库 (llxo/moonlight-vplus-crown-editor)"
          aria-label="GitHub 仓库"
        >
          <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>
      </div>
    </header>
  );
};
