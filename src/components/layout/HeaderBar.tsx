/**
 * @file HeaderBar.tsx
 * @description 编辑器顶部全局操作栏：包含分辨率基准、视口缩放、网格吸附、撤销重做、导入导出
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
  CheckCircle2,
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
        alert(`成功导入配置: ${file.name}`);
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
    <header className="flex h-14 w-full items-center justify-between border-b border-[#242730] bg-[#14161b] px-4 text-xs select-none">
      {/* 左区：应用 Logo & 配置名称快速编辑 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold tracking-wider">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/20">
            <Crown className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline text-sm font-semibold text-slate-100">
            CROWN <span className="text-amber-400">EDITOR</span>
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#2a2e3a]" />

        {/* 配置名称快速输入框 */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={meta.name}
            onChange={(e) => updateMeta({ name: e.target.value })}
            className="w-40 rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-xs text-slate-100 transition-colors focus:border-amber-500/60 focus:outline-none"
            placeholder="配置名称"
            title="配置显示名称"
          />
        </div>

        {/* 校验徽章 */}
        <div className="hidden lg:flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>V+ 协议兼容</span>
        </div>
      </div>

      {/* 中区：设备基准分辨率、缩放控制器、辅助工具 */}
      <div className="flex items-center gap-2">
        {/* 设备基准选择 */}
        <div className="flex items-center gap-1.5 rounded bg-[#1a1d24] border border-[#2a2e3a] px-2 py-1">
          <Smartphone className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={`${layoutBasis.widthPx}x${layoutBasis.heightPx}`}
            onChange={handleResolutionChange}
            className="bg-transparent text-slate-200 outline-none cursor-pointer"
          >
            {PRESET_RESOLUTIONS.map((res) => (
              <option key={`${res.width}x${res.height}`} value={`${res.width}x${res.height}`} className="bg-[#1a1d24]">
                {res.label}
              </option>
            ))}
          </select>
        </div>

        {/* 视口缩放控制器 */}
        <div className="flex items-center rounded border border-[#2a2e3a] bg-[#1a1d24] text-slate-300">
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
            className="px-2 py-1 hover:bg-[#252a35] hover:text-white transition-colors"
            title="缩小视口"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="w-12 text-center text-[11px] font-mono text-slate-200">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
            className="px-2 py-1 hover:bg-[#252a35] hover:text-white transition-colors"
            title="放大视口"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={resetViewport}
            className="border-l border-[#2a2e3a] px-2 py-1 hover:bg-[#252a35] hover:text-white transition-colors"
            title="重置缩放与位置"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 辅助开关：吸附网格 & 安全区 */}
        <div className="flex items-center rounded border border-[#2a2e3a] bg-[#1a1d24]">
          <button
            onClick={toggleSnapToGrid}
            className={`flex items-center gap-1 px-2.5 py-1 transition-colors ${
              snapToGrid ? "bg-amber-500/20 text-amber-400 font-medium" : "text-slate-400 hover:text-white"
            }`}
            title="网格吸附开关 (20px)"
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden md:inline">吸附</span>
          </button>
          <button
            onClick={toggleSafeArea}
            className={`flex items-center gap-1 border-l border-[#2a2e3a] px-2.5 py-1 transition-colors ${
              showSafeArea ? "bg-amber-500/20 text-amber-400 font-medium" : "text-slate-400 hover:text-white"
            }`}
            title="安全区与圆角指示开关"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="hidden md:inline">安全区</span>
          </button>
        </div>

        {/* 撤销 / 重做 */}
        <div className="flex items-center rounded border border-[#2a2e3a] bg-[#1a1d24]">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="px-2 py-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="border-l border-[#2a2e3a] px-2 py-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 右区：导入 / 导出 */}
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
          className="flex items-center gap-1.5 rounded border border-[#2a2e3a] bg-[#1a1d24] px-2.5 py-1 text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
          title="导入 .crown.json 或 raw-payload.json"
        >
          <Upload className="h-3.5 w-3.5 text-slate-400" />
          <span>导入</span>
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded bg-amber-500 px-3 py-1 font-semibold text-slate-950 shadow-sm shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95"
          title="打包导出为 Moonlight-vplus 标准分享包 (.crown.json)"
        >
          <Download className="h-3.5 w-3.5 text-slate-950" />
          <span>导出分享包</span>
        </button>
      </div>
    </header>
  );
};
