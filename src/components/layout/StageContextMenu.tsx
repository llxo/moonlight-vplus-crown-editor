/**
 * @file StageContextMenu.tsx
 * @description 画布与控件右键快捷菜单：遵循 minimalist-ui 规范，升级为 14px 舒适字号与大方内边距，提供极简操作指令
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React from "react";
import {
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
  AlignCenter,
  RotateCcw,
  CircleDot,
  Compass,
  Grid,
  ShieldAlert,
  MousePointerClick,
} from "lucide-react";

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetElementId: number | null;
  canvasX: number;
  canvasY: number;
}

interface StageContextMenuProps {
  menu: ContextMenuState;
  snapToGrid: boolean;
  showSafeArea: boolean;
  hasSelectedElements: boolean;
  onClose: () => void;
  onDuplicate: () => void;
  onBringToFront: (id: number) => void;
  onSendToBack: (id: number) => void;
  onCenterHorizontal: (id: number) => void;
  onCenterVertical: (id: number) => void;
  onDelete: () => void;
  onAddButton: (cx: number, cy: number) => void;
  onAddStick: (cx: number, cy: number) => void;
  onResetViewport: () => void;
  onToggleSnapToGrid: () => void;
  onToggleSafeArea: () => void;
  onDeselect: () => void;
}

export const StageContextMenu: React.FC<StageContextMenuProps> = ({
  menu,
  snapToGrid,
  showSafeArea,
  hasSelectedElements,
  onClose,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onCenterHorizontal,
  onCenterVertical,
  onDelete,
  onAddButton,
  onAddStick,
  onResetViewport,
  onToggleSnapToGrid,
  onToggleSafeArea,
  onDeselect,
}) => {
  if (!menu.isOpen) {
    return null;
  }

  return (
    <div
      data-crown-context-menu="true"
      style={{
        left: `${menu.x}px`,
        top: `${menu.y}px`,
      }}
      className="fixed z-50 min-w-[220px] rounded-2xl border border-[#eaeaea] bg-[#ffffff]/98 p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)] backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-100 cursor-default"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {menu.targetElementId !== null ? (
        /* 针对选中的控件右键菜单 */
        <div className="flex flex-col gap-0.5">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">
            控件操作
          </div>
          <button
            type="button"
            onClick={() => {
              onDuplicate();
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Copy className="h-4 w-4 text-[#555555]" />
              <span>克隆控件</span>
            </div>
            <span className="text-xs font-mono font-semibold text-[#888888]">Ctrl+D</span>
          </button>
          <button
            type="button"
            onClick={() => onBringToFront(menu.targetElementId!)}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BringToFront className="h-4 w-4 text-[#555555]" />
              <span>置于顶层</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onSendToBack(menu.targetElementId!)}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <SendToBack className="h-4 w-4 text-[#555555]" />
              <span>置于底层</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onCenterHorizontal(menu.targetElementId!)}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <AlignCenter className="h-4 w-4 text-[#555555]" />
              <span>水平居中</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onCenterVertical(menu.targetElementId!)}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <AlignCenter className="h-4 w-4 rotate-90 text-[#555555]" />
              <span>垂直居中</span>
            </div>
          </button>

          <div className="my-1 border-t border-[#f0f0ee]" />

          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#9f2f2d] hover:bg-[#fdebec] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="h-4 w-4 text-[#9f2f2d]" />
              <span>删除控件</span>
            </div>
            <span className="text-xs font-mono font-semibold text-[#9f2f2d]/70">Del</span>
          </button>
        </div>
      ) : (
        /* 画布空白处右键菜单 */
        <div className="flex flex-col gap-0.5">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">
            画布操作
          </div>
          <button
            type="button"
            onClick={() => onAddButton(menu.canvasX, menu.canvasY)}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <CircleDot className="h-4 w-4 text-[#111111]" />
              <span>在此添加按键</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onAddStick(menu.canvasX, menu.canvasY)}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="h-4 w-4 text-[#111111]" />
              <span>在此添加摇杆</span>
            </div>
          </button>

          <div className="my-1 border-t border-[#f0f0ee]" />

          <button
            type="button"
            onClick={() => {
              onResetViewport();
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 text-[#555555]" />
              <span>重置视口居中</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleSnapToGrid();
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Grid className="h-4 w-4 text-[#555555]" />
              <span>网格吸附</span>
            </div>
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                snapToGrid ? "bg-[#111111] text-white" : "bg-[#f0f0ee] text-[#777777]"
              }`}
            >
              {snapToGrid ? "开" : "关"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleSafeArea();
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-[#555555]" />
              <span>边缘安全区参考线</span>
            </div>
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                showSafeArea ? "bg-[#111111] text-white" : "bg-[#f0f0ee] text-[#777777]"
              }`}
            >
              {showSafeArea ? "开" : "关"}
            </span>
          </button>

          {hasSelectedElements && (
            <>
              <div className="my-1 border-t border-[#f0f0ee]" />
              <button
                type="button"
                onClick={() => {
                  onDeselect();
                  onClose();
                }}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#555555] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MousePointerClick className="h-4 w-4 text-[#555555]" />
                  <span>取消选中所有</span>
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
