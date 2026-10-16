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
  Grid,
  ShieldAlert,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Crown,
  Settings,
  ChevronDown,
  HelpCircle,
  Link2,
} from "lucide-react";
import { useCrownStore } from "../../store/useCrownStore";

const PRESET_RESOLUTIONS = [
  { label: "2400 × 1080 (20:9 常见旗舰)", width: 2400, height: 1080, dpi: 400, density: 2.5 },
  { label: "1920 × 1080 (16:9 标准高清)", width: 1920, height: 1080, dpi: 320, density: 2.0 },
  { label: "2560 × 1440 (16:9 2K 游戏屏)", width: 2560, height: 1440, dpi: 480, density: 3.0 },
  { label: "2560 × 1600 (16:10 平板设备)", width: 2560, height: 1600, dpi: 360, density: 2.25 },
  { label: "2880 × 1800 (16:10 高刷掌机)", width: 2880, height: 1800, dpi: 400, density: 2.5 },
];

export const HeaderBar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isResDropdownOpen, setIsResDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    meta,
    layoutBasis,
    zoom,
    snapToGrid,
    showSafeArea,
    updateMeta,
    updateLayoutBasis,
    setZoom,
    resetViewport,
    toggleSnapToGrid,
    toggleSafeArea,
    undo,
    redo,
    canUndo,
    canRedo,
    loadFromBundleOrPayload,
    exportBundle,
    toggleGlobalSettings,
    toggleWelcomeModal,
    toggleShareModal,
  } = useCrownStore();

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

  const handleExport = async () => {
    try {
      const bundle = await exportBundle();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${bundle.name || "profile"}.crown.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`导出分享包失败: ${err.message}`);
    }
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsResDropdownOpen(false);
      }
    };
    if (isResDropdownOpen) {
      window.addEventListener("mousedown", handleOutsideClick);
    }
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [isResDropdownOpen]);

  const currentPreset = PRESET_RESOLUTIONS.find(
    (r) => r.width === layoutBasis.widthPx && r.height === layoutBasis.heightPx
  );
  const currentResLabel = currentPreset
    ? currentPreset.label
    : `${layoutBasis.widthPx} × ${layoutBasis.heightPx} (自定义)`;

  return (
    <header className="flex h-15 w-full items-center justify-between border-b border-[#eaeaea] bg-[#ffffff] px-6 text-sm select-none">
      {/* 左区：应用品牌 Logo & 内联工程标题轻量编辑 */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111111] text-[#ffffff] shadow-2xs">
            <Crown className="h-4.5 w-4.5" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#111111]">
            Moonlight-vplus
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#e5e5e5]" />

        {/* 内联轻量重命名标题 (Figma 风格，平常干净，悬停聚焦微提示) */}
        <input
          type="text"
          value={meta.name}
          onChange={(e) => updateMeta({ name: e.target.value })}
          className="w-48 rounded-md px-2.5 py-1 text-sm font-semibold text-[#111111] hover:bg-[#f7f6f3] focus:bg-[#fbfbfa] focus:ring-1 focus:ring-[#111111] focus:outline-none transition-all placeholder:text-[#999999]"
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
            className="flex items-center gap-1.5 rounded-lg border border-[#eaeaea] bg-[#ffffff] px-3 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#fbfbfa] hover:border-[#d4d4d0] transition-all shadow-2xs"
          >
            <Smartphone className="h-4 w-4 text-[#6b7280]" />
            <span>{currentResLabel}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-[#888888] transition-transform duration-150 ${isResDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isResDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 z-40 w-64 rounded-xl border border-[#eaeaea] bg-[#ffffff] p-1.5 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] animate-in fade-in space-y-0.5 select-none">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">
                选择设备基准分辨率
              </div>
              {PRESET_RESOLUTIONS.map((res) => {
                const isSelected = layoutBasis.widthPx === res.width && layoutBasis.heightPx === res.height;
                return (
                  <button
                    key={`${res.width}x${res.height}`}
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
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
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
          )}
        </div>

        {/* 视口缩放控制胶囊组合 */}
        <div className="flex items-center rounded-lg border border-[#eaeaea] bg-[#ffffff] p-0.5 shadow-2xs">
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
            className="rounded p-1 text-[#6b7280] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors"
            title="缩小画布"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-mono text-xs font-semibold text-[#111111]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
            className="rounded p-1 text-[#6b7280] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors"
            title="放大画布"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="h-3.5 w-[1px] bg-[#eaeaea] mx-0.5" />
          <button
            onClick={resetViewport}
            className="rounded p-1 text-[#6b7280] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors"
            title="画幅自适应居中"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 辅助开关：网格吸附与安全区 (激活采用微灰强调，不抢主按钮焦点) */}
        <div className="flex items-center rounded-lg border border-[#eaeaea] bg-[#ffffff] p-0.5 shadow-2xs">
          <button
            onClick={toggleSnapToGrid}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-all ${
              snapToGrid
                ? "bg-[#111111]/10 text-[#111111] font-semibold"
                : "text-[#6b7280] hover:text-[#111111] hover:bg-[#f7f6f3]"
            }`}
            title="网格吸附 (20px)"
          >
            <Grid className="h-3.5 w-3.5" />
            <span>网格</span>
          </button>
          <button
            onClick={toggleSafeArea}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-all ${
              showSafeArea
                ? "bg-[#111111]/10 text-[#111111] font-semibold"
                : "text-[#6b7280] hover:text-[#111111] hover:bg-[#f7f6f3]"
            }`}
            title="安全区参考线"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>安全区</span>
          </button>
        </div>

        {/* 撤销 / 重做 */}
        <div className="flex items-center rounded-lg border border-[#eaeaea] bg-[#ffffff] p-0.5 shadow-2xs">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="rounded p-1 text-[#6b7280] hover:text-[#111111] hover:bg-[#f7f6f3] disabled:opacity-25 transition-colors"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="rounded p-1 text-[#6b7280] hover:text-[#111111] hover:bg-[#f7f6f3] disabled:opacity-25 transition-colors"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 右区：功能分层清晰的辅助设置与导入导出操作 */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json,.crown.json"
          className="hidden"
        />

        {/* 轻量辅助按钮 */}
        <button
          onClick={toggleWelcomeModal}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#4b5563] hover:text-[#111111] hover:bg-[#f7f6f3] transition-colors"
          title="指南与模版中心"
        >
          <HelpCircle className="h-4 w-4" />
          <span>模版</span>
        </button>

        <button
          onClick={toggleGlobalSettings}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#4b5563] hover:text-[#111111] hover:bg-[#f7f6f3] transition-colors"
          title="全局触控与按键参数设置"
        >
          <Settings className="h-4 w-4" />
          <span>设置</span>
        </button>

        <div className="h-4 w-[1px] bg-[#e5e5e5] mx-1" />

        {/* 核心业务操作组 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-[#eaeaea] bg-[#ffffff] px-3 py-1.5 font-medium text-sm text-[#374151] hover:bg-[#f7f6f3] hover:border-[#d4d4d0] transition-all shadow-2xs"
          title="导入 .crown.json 或 raw-payload.json"
        >
          <Upload className="h-4 w-4 text-[#6b7280]" />
          <span>导入</span>
        </button>

        <button
          onClick={toggleShareModal}
          className="flex items-center gap-1.5 rounded-lg border border-[#eaeaea] bg-[#ffffff] px-3.5 py-1.5 font-medium text-sm text-[#111111] hover:bg-[#f7f6f3] hover:border-[#111111]/40 transition-all active:scale-[0.98] shadow-2xs"
          title="生成 24 小时短效直链 (供手机直接下载导入)"
        >
          <Link2 className="h-4 w-4 text-[#111111]" />
          <span>分享直链</span>
        </button>

        {/* 规范主 CTA 按钮: 纯黑实体背景 #111111, 白字, 8px 圆角, 唯此全黑主焦点 */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-lg bg-[#111111] px-4 py-1.5 font-semibold text-sm text-[#ffffff] hover:bg-[#2b2b2b] active:scale-[0.98] transition-all shadow-xs"
          title="打包导出为 Moonlight-vplus 标准分享包 (.crown.json)"
        >
          <Download className="h-4 w-4 text-[#ffffff]" />
          <span>导出分享包</span>
        </button>
      </div>
    </header>
  );
};
