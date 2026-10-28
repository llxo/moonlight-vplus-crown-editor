/**
 * @file StageContextMenu.tsx
 * @description 画布与控件右键快捷菜单：遵循 minimalist-ui 规范，升级为 14px 舒适字号与大方内边距，提供极简操作指令
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React from "react";
import { createPortal } from "react-dom";
import {
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
  AlignCenter,
  RotateCcw,
  CircleDot,
  Compass,
  MousePointerClick,
  SlidersHorizontal,
  SunMoon,
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
  hasSelectedElements: boolean;
  onClose: () => void;
  onDuplicate: (id?: number) => void;
  onBringToFront: (id: number) => void;
  onSendToBack: (id: number) => void;
  onCenterHorizontal: (id: number) => void;
  onCenterVertical: (id: number) => void;
  onDelete: (id?: number) => void;
  onSelectElement?: (id: number) => void;
  onAddButton: (cx: number, cy: number) => void;
  onAddStick: (cx: number, cy: number) => void;
  onResetViewport: () => void;
  onDeselect: () => void;
  onCycleCanvasBg?: () => void;
  canvasBgName?: string;
}

export const StageContextMenu: React.FC<StageContextMenuProps> = ({
  menu,
  hasSelectedElements,
  onClose,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onCenterHorizontal,
  onCenterVertical,
  onDelete,
  onSelectElement,
  onAddButton,
  onAddStick,
  onResetViewport,
  onDeselect,
  onCycleCanvasBg,
  canvasBgName,
}) => {
  if (!menu.isOpen) {
    return null;
  }

  const menuContent = (
    <div
      data-crown-context-menu="true"
      style={{
        left: `${menu.x}px`,
        top: `${menu.y}px`,
      }}
      className="fixed z-[9999] min-w-[220px] rounded-2xl border border-[#eaeaea] bg-[#ffffff]/98 p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)] backdrop-blur-md select-none animate-in fade-in zoom-in-95 duration-100 cursor-default"
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
        /* 针对右键指向的控件快捷菜单 */
        <div className="flex flex-col gap-0.5">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#888888]">
            按键快捷操作
          </div>

          {/* 编辑属性（可一键展开控制板） */}
          <button
            type="button"
            onClick={() => {
              if (onSelectElement && menu.targetElementId !== null) {
                onSelectElement(menu.targetElementId);
              }
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <SlidersHorizontal className="h-4 w-4 text-[#555555]" />
              <span>编辑属性 (打开控制板)</span>
            </div>
          </button>

          <div className="my-1 border-t border-[#f0f0ee]" />

          <button
            type="button"
            onClick={() => {
              onDuplicate(menu.targetElementId!);
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Copy className="h-4 w-4 text-[#555555]" />
              <span>克隆此按键</span>
            </div>
            <span className="text-xs font-mono font-semibold text-[#888888]">Ctrl+D</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onBringToFront(menu.targetElementId!);
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BringToFront className="h-4 w-4 text-[#555555]" />
              <span>置于顶层</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              onSendToBack(menu.targetElementId!);
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <SendToBack className="h-4 w-4 text-[#555555]" />
              <span>置于底层</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              onCenterHorizontal(menu.targetElementId!);
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <AlignCenter className="h-4 w-4 text-[#555555]" />
              <span>水平居中</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              onCenterVertical(menu.targetElementId!);
              onClose();
            }}
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
              onDelete(menu.targetElementId!);
              onClose();
            }}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#9f2f2d] hover:bg-[#fdebec] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="h-4 w-4 text-[#9f2f2d]" />
              <span>删除此按键</span>
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

          {onCycleCanvasBg && (
            <button
              type="button"
              onClick={() => {
                onCycleCanvasBg();
                onClose();
              }}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#111111] hover:bg-[#f7f6f3] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <SunMoon className="h-4 w-4 text-[#555555]" />
                <span>切换画布背景 {canvasBgName ? `(${canvasBgName})` : ""}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-[#888888]">B</span>
            </button>
          )}

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

  return createPortal(menuContent, document.body);
};
