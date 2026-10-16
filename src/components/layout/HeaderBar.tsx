/**
 * @file HeaderBar.tsx
 * @description 顶部全局操作栏：遵循 minimalist-ui 规范，采用纯净暖白背景、深炭黑排版与纯色高对比度按钮
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
    <header className="flex h-14 w-full items-center justify-between border-b border-[#eaeaea] bg-[#ffffff] px-5 text-xs select-none">
      {/* 左区：应用 Logo & 配置名称编辑 */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#111111] text-[#ffffff]">
            <Crown className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-[#111111]">
              Crown Editor
            </span>
            <span className="text-xs text-[#4b5563] -mt-0.5">王冠按键编辑器</span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#eaeaea]" />

        {/* 配置名称快速输入 */}
        <div className="flex items-center">
          <input
            type="text"
            value={meta.name}
            onChange={(e) => updateMeta({ name: e.target.value })}
            className="w-44 rounded-md border border-[#eaeaea] bg-[#fbfbfa] px-2.5 py-1 text-xs font-medium text-[#111111] transition-colors focus:border-[#111111] focus:bg-[#ffffff] focus:outline-none"
            placeholder="未命名配置"
            title="配置显示名称"
          />
        </div>

        {/* 协议兼容微型胶囊徽章 (Muted Pastel Green) */}
        <div className="hidden lg:flex items-center gap-1 rounded-full bg-[#edf3ec] px-2.5 py-0.5 text-xs font-semibold text-[#346538]">
          <Check className="h-3 w-3" />
          <span>V+ 协议就绪</span>
        </div>
      </div>

      {/* 中区：设备基准分辨率、视口控制、吸附辅助 */}
      <div className="flex items-center gap-2">
        {/* 自定义精致设备基准下拉选择器 */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsResDropdownOpen(!isResDropdownOpen)}
            className="flex items-center gap-1.5 rounded-md border border-[#eaeaea] bg-[#ffffff] px-2.5 py-1 text-xs font-semibold text-[#111111] hover:border-[#111111]/40 hover:bg-[#fbfbfa] transition-all"
          >
            <Smartphone className="h-3.5 w-3.5 text-[#4b5563]" />
            <span>{currentResLabel}</span>
            <ChevronDown className={`h-3 w-3 text-[#6b7280] transition-transform duration-150 ${isResDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isResDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 z-40 w-64 rounded-xl border border-[#eaeaea] bg-[#ffffff] p-1.5 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] animate-in fade-in space-y-0.5 select-none">
              <div className="px-2 py-1 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">
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
                    className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-colors ${
                      isSelected
                        ? "bg-[#111111] text-[#ffffff] font-semibold"
                        : "text-[#2f3437] hover:bg-[#f7f6f3] hover:text-[#111111]"
                    }`}
                  >
                    <span>{res.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#ffffff]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 视口缩放控制组合 */}
        <div className="flex items-center rounded-md border border-[#eaeaea] bg-[#ffffff] text-[#2f3437]">
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
            className="px-2 py-1 hover:bg-[#f7f6f3] text-[#787774] hover:text-[#111111] transition-colors"
            title="缩小"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="w-12 text-center font-mono text-xs font-semibold text-[#111111]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
            className="px-2 py-1 hover:bg-[#f7f6f3] text-[#787774] hover:text-[#111111] transition-colors"
            title="放大"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={resetViewport}
            className="border-l border-[#eaeaea] px-2 py-1 hover:bg-[#f7f6f3] text-[#787774] hover:text-[#111111] transition-colors"
            title="自适应居中"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>

        {/* 辅助开关：网格吸附与安全区 */}
        <div className="flex items-center rounded-md border border-[#eaeaea] bg-[#ffffff] p-0.5">
          <button
            onClick={toggleSnapToGrid}
            className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              snapToGrid ? "bg-[#111111] text-[#ffffff]" : "text-[#4b5563] hover:text-[#111111] hover:bg-[#f7f6f3]"
            }`}
            title="网格吸附 (20px)"
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden md:inline">网格吸附</span>
          </button>
          <button
            onClick={toggleSafeArea}
            className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all ${
              showSafeArea ? "bg-[#111111] text-[#ffffff]" : "text-[#4b5563] hover:text-[#111111] hover:bg-[#f7f6f3]"
            }`}
            title="安全区参考线"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="hidden md:inline">安全区</span>
          </button>
        </div>

        {/* 撤销 / 重做 */}
        <div className="flex items-center rounded-md border border-[#eaeaea] bg-[#ffffff]">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="px-2 py-1 text-[#787774] hover:text-[#111111] hover:bg-[#f7f6f3] disabled:opacity-30 transition-colors"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="border-l border-[#eaeaea] px-2 py-1 text-[#787774] hover:text-[#111111] hover:bg-[#f7f6f3] disabled:opacity-30 transition-colors"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 右区：导入与导出 */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json,.crown.json"
          className="hidden"
        />

        <button
          onClick={toggleWelcomeModal}
          className="flex items-center gap-1.5 rounded-md border border-[#eaeaea] bg-[#ffffff] px-2.5 py-1.5 font-medium text-[#2f3437] transition-all hover:bg-[#f7f6f3] hover:border-[#dcdbd8]"
          title="打开新手指南与精选模版中心"
        >
          <HelpCircle className="h-3.5 w-3.5 text-[#4b5563]" />
          <span>指南与模版</span>
        </button>

        <button
          onClick={toggleGlobalSettings}
          className="flex items-center gap-1.5 rounded-md border border-[#eaeaea] bg-[#ffffff] px-2.5 py-1.5 font-medium text-[#2f3437] transition-all hover:bg-[#f7f6f3] hover:border-[#dcdbd8]"
          title="配置全局触控与游戏信息"
        >
          <Settings className="h-3.5 w-3.5 text-[#4b5563]" />
          <span>全局设置</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-[#eaeaea] bg-[#ffffff] px-3 py-1.5 font-medium text-[#2f3437] transition-all hover:bg-[#f7f6f3] hover:border-[#dcdbd8]"
          title="导入 .crown.json 或 raw-payload.json"
        >
          <Upload className="h-3.5 w-3.5 text-[#787774]" />
          <span>导入配置</span>
        </button>

        {/* 规范 CTA 主按钮: 纯黑实体背景 #111111, 白字, 6px 圆角, active 微缩放 */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-md bg-[#111111] px-3.5 py-1.5 font-medium text-[#ffffff] transition-all hover:bg-[#2b2b2b] active:scale-[0.98]"
          title="打包导出为 Moonlight-vplus 标准分享包 (.crown.json)"
        >
          <Download className="h-3.5 w-3.5 text-[#ffffff]" />
          <span>导出分享包</span>
        </button>
      </div>
    </header>
  );
};
