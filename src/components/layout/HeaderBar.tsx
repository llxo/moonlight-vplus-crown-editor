/**
 * @file HeaderBar.tsx
 * @description 顶部全局操作栏：遵循 minimalist-ui 规范，采用纯净暖白背景、深炭黑排版与纯色高对比度按钮
 */

import React, { useRef } from "react";
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

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = PRESET_RESOLUTIONS.find((r) => `${r.width}x${r.height}` === e.target.value);
    if (found) {
      updateLayoutBasis({
        widthPx: found.width,
        heightPx: found.height,
        densityDpi: found.dpi,
        density: found.density,
      });
    }
  };

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-[#eaeaea] bg-[#ffffff] px-5 text-xs select-none">
      {/* 左区：应用 Logo & 配置名称编辑 */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#111111] text-[#ffffff]">
            <Crown className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-xs tracking-tight text-[#111111]">
              Crown Editor
            </span>
            <span className="text-[10px] text-[#787774] -mt-0.5">王冠模式按键排布</span>
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
        <div className="hidden lg:flex items-center gap-1 rounded-full bg-[#edf3ec] px-2 py-0.5 text-[11px] font-medium text-[#346538]">
          <Check className="h-3 w-3" />
          <span>V+ 协议就绪</span>
        </div>
      </div>

      {/* 中区：设备基准分辨率、视口控制、吸附辅助 */}
      <div className="flex items-center gap-2">
        {/* 设备基准选择 */}
        <div className="flex items-center gap-1.5 rounded-md border border-[#eaeaea] bg-[#fbfbfa] px-2.5 py-1 text-[#2f3437]">
          <Smartphone className="h-3.5 w-3.5 text-[#787774]" />
          <select
            value={`${layoutBasis.widthPx}x${layoutBasis.heightPx}`}
            onChange={handleResolutionChange}
            className="bg-transparent text-xs font-medium text-[#111111] outline-none cursor-pointer"
          >
            {PRESET_RESOLUTIONS.map((res) => (
              <option key={`${res.width}x${res.height}`} value={`${res.width}x${res.height}`} className="bg-[#ffffff]">
                {res.label}
              </option>
            ))}
          </select>
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
          <span className="w-11 text-center font-mono text-[11px] text-[#111111]">
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
            className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-all ${
              snapToGrid ? "bg-[#111111] text-[#ffffff]" : "text-[#787774] hover:text-[#111111] hover:bg-[#f7f6f3]"
            }`}
            title="网格吸附 (20px)"
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden md:inline">网格吸附</span>
          </button>
          <button
            onClick={toggleSafeArea}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-all ${
              showSafeArea ? "bg-[#111111] text-[#ffffff]" : "text-[#787774] hover:text-[#111111] hover:bg-[#f7f6f3]"
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
