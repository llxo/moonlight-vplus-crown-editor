/**
 * @file StatusBar.tsx
 * @description 编辑器底部状态栏：显示控件统计、选中状态、当前分辨率与操作指引
 */

import React from "react";
import { useCrownStore } from "../../store/useCrownStore";
import { Smartphone, MousePointer, Layers, Keyboard } from "lucide-react";

export const StatusBar: React.FC = () => {
  const { elements, selectedElementIds, layoutBasis, zoom } = useCrownStore();

  return (
    <footer className="flex h-7 w-full items-center justify-between border-t border-[#242730] bg-[#111216] px-4 text-[11px] text-slate-400 select-none">
      {/* 左区：统计与当前状态 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3 w-3 text-slate-400" />
          <span>控件总数: <strong className="text-slate-200">{elements.length}</strong></span>
        </div>

        <div className="h-3 w-[1px] bg-[#242730]" />

        <div className="flex items-center gap-1.5">
          <MousePointer className="h-3 w-3 text-slate-400" />
          <span>
            已选择:{" "}
            <strong className="text-amber-400">
              {selectedElementIds.length > 0 ? `${selectedElementIds.length} 个控件` : "无"}
            </strong>
          </span>
        </div>

        <div className="h-3 w-[1px] bg-[#242730]" />

        <div className="flex items-center gap-1.5">
          <Smartphone className="h-3 w-3 text-slate-400" />
          <span>
            设备基准: <span className="font-mono text-slate-200">{layoutBasis.widthPx} × {layoutBasis.heightPx}</span> ({layoutBasis.densityDpi} DPI)
          </span>
        </div>
      </div>

      {/* 右区：快捷操作指引 */}
      <div className="hidden md:flex items-center gap-3 text-slate-400">
        <div className="flex items-center gap-1">
          <Keyboard className="h-3 w-3" />
          <span>空格+拖拽: 平移视口</span>
        </div>
        <span>•</span>
        <span>滚轮: 缩放 ({Math.round(zoom * 100)}%)</span>
        <span>•</span>
        <span>Delete: 删除选中</span>
        <span>•</span>
        <span>Ctrl+Z / Y: 撤销 / 重做</span>
      </div>
    </footer>
  );
};
