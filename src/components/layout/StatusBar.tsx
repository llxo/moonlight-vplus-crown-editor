/**
 * @file StatusBar.tsx
 * @description 编辑器底部状态栏：遵循 minimalist-ui 规范，采用极简单行排版与 <kbd> 物理键帽快捷键指示
 */

import React from "react";
import { useCrownStore } from "../../store/useCrownStore";
import { Smartphone, MousePointer, Layers } from "lucide-react";

export const StatusBar: React.FC = () => {
  const { elements, selectedElementIds, layoutBasis, zoom, cycleCanvasBg } = useCrownStore();

  return (
    <footer className="flex h-9 w-full items-center justify-between border-t border-[#eaeaea] bg-[#fbfbfa] px-6 text-xs text-[#4b5563] select-none">
      {/* 左区：统计与当前状态 */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-[#6b7280]" />
          <span>控件总数: <strong className="text-[#111111] font-semibold">{elements.length}</strong></span>
        </div>

        <div className="h-4 w-[1px] bg-[#eaeaea]" />

        <div className="flex items-center gap-1.5">
          <MousePointer className="h-4 w-4 text-[#6b7280]" />
          <span>
            选中项:{" "}
            <strong className="text-[#111111] font-semibold">
              {selectedElementIds.length > 0 ? `${selectedElementIds.length} 项` : "无"}
            </strong>
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#eaeaea]" />

        <div className="flex items-center gap-1.5">
          <Smartphone className="h-4 w-4 text-[#6b7280]" />
          <span>
            分辨率基准: <span className="font-mono font-semibold text-[#111111]">{layoutBasis.widthPx} × {layoutBasis.heightPx}</span> ({layoutBasis.densityDpi} DPI)
          </span>
        </div>
      </div>

      {/* 右区：简约物理键帽快捷指示 */}
      <div className="hidden md:flex items-center gap-3 text-xs text-[#4b5563]">
        <div className="flex items-center gap-1">
          鼠标左键/右键拖动画布
        </div>
        <span>•</span>
        <div>
          滚轮缩放 (<span className="font-mono text-[#111111]">{Math.round(zoom * 100)}%</span>)
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <kbd>Del</kbd> 删除
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <kbd>Ctrl+Z</kbd> 撤销
        </div>
        <span>•</span>
        <button
          type="button"
          onClick={cycleCanvasBg}
          className="flex items-center gap-1 hover:text-[#111111] transition-colors cursor-pointer"
          title="点击快速切换画布背景色 (快捷键 B)"
        >
          <kbd>B</kbd> 切换背景
        </button>
      </div>
    </footer>
  );
};
