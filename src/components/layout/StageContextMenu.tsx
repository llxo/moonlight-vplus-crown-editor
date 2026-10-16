/**
 * @file StageContextMenu.tsx
 * @description 画布与控件右键快捷菜单：提供极简操作指令（复制、居中、层级、重置视口、辅助开关等）
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
      className="fixed z-50 min-w-[190px] rounded-xl border border-[#eaeaea] bg-[#ffffff]/98 p-1.5 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04)] backdrop-blur-sm select-none animate-in fade-in zoom-in-95 duration-100 cursor-default"
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
          <div className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#888888]">
            控件操作
          </div>
          <button
            type="button"
            onClick={() => {
              onDuplicate();
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Copy className="h-3.5 w-3.5 text-[#555555]" />
              <span>复制 / 克隆</span>
            </div>
            <span className="text-[10px] font-mono text-[#888888]">Ctrl+D</span>
          </button>
          <button
            type="button"
            onClick={() => onBringToFront(menu.targetElementId!)}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BringToFront className="h-3.5 w-3.5 text-[#555555]" />
              <span>置于顶层</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onSendToBack(menu.targetElementId!)}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <SendToBack className="h-3.5 w-3.5 text-[#555555]" />
              <span>置于底层</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onCenterHorizontal(menu.targetElementId!)}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AlignCenter className="h-3.5 w-3.5 text-[#555555]" />
              <span>水平居中</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onCenterVertical(menu.targetElementId!)}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AlignCenter className="h-3.5 w-3.5 rotate-90 text-[#555555]" />
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
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#9f2f2d] hover:bg-[#fdebec] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-3.5 w-3.5 text-[#9f2f2d]" />
              <span>删除控件</span>
            </div>
            <span className="text-[10px] font-mono text-[#9f2f2d]/70">Del</span>
          </button>
        </div>
      ) : (
        /* 画布空白处右键菜单 */
        <div className="flex flex-col gap-0.5">
          <div className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#888888]">
            画布快捷操作
          </div>
          <button
            type="button"
            onClick={() => onAddButton(menu.canvasX, menu.canvasY)}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CircleDot className="h-3.5 w-3.5 text-[#111111]" />
              <span>在此添加按键</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onAddStick(menu.canvasX, menu.canvasY)}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Compass className="h-3.5 w-3.5 text-[#111111]" />
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
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-[#555555]" />
              <span>重置视口居中</span>
            </div>
            <span className="text-[10px] font-mono text-[#888888]">100%</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleSnapToGrid();
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Grid className="h-3.5 w-3.5 text-[#555555]" />
              <span>网格吸附对齐</span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
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
            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-[#555555]" />
              <span>模拟边缘安全区</span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
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
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#555555] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MousePointerClick className="h-3.5 w-3.5 text-[#555555]" />
                  <span>取消选中</span>
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
