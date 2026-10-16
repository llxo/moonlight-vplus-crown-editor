/**
 * @file StatusBar.tsx
 * @description 编辑器底部状态栏：遵循 minimalist-ui 规范，采用极简单行排版与 <kbd> 物理键帽快捷键指示
 */

import React from "react";
import { useCrownStore } from "../../store/useCrownStore";
import { Smartphone, MousePointer, Layers } from "lucide-react";

export const StatusBar: React.FC = () => {
  const { elements, selectedElementIds, layoutBasis, zoom } = useCrownStore();

  return (
    <footer className="flex h-7 w-full items-center justify-between border-t border-[#eaeaea] bg-[#fbfbfa] px-4 text-[11px] text-[#787774] select-none">
      {/* 左区：统计与当前状态 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3 w-3 text-[#787774]" />
          <span>控件: <strong className="text-[#111111] font-medium">{elements.length}</strong></span>
        </div>

        <div className="h-3 w-[1px] bg-[#eaeaea]" />

        <div className="flex items-center gap-1.5">
          <MousePointer className="h-3 w-3 text-[#787774]" />
          <span>
            选中:{" "}
            <strong className="text-[#111111] font-medium">
              {selectedElementIds.length > 0 ? `${selectedElementIds.length} 项` : "无"}
            </strong>
          </span>
        </div>

        <div className="h-3 w-[1px] bg-[#eaeaea]" />

        <div className="flex items-center gap-1.5">
          <Smartphone className="h-3 w-3 text-[#787774]" />
          <span>
            基准: <span className="font-mono text-[#111111]">{layoutBasis.widthPx} × {layoutBasis.heightPx}</span> ({layoutBasis.densityDpi} DPI)
          </span>
        </div>
      </div>

      {/* 右区：简约物理键帽快捷指示 */}
      <div className="hidden md:flex items-center gap-3 text-[#787774]">
        <div className="flex items-center gap-1">
          <kbd>Space</kbd> + 拖拽平移
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
      </div>
    </footer>
  );
};
