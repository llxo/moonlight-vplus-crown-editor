/**
 * @file StageViewport.tsx
 * @description 中央工作区画布视口：采用零延迟全局指针监听 (Window Pointer Events)、零历史序列化开销、rAF高刷同步与物理即时贴手渲染
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useCrownStore } from "../../store/useCrownStore";
import {
  CrownElementType,
  CrownColorUtils,
  type CrownElement,
} from "../../crownSchema";

export const StageViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 视口平移状态 Ref（避免闭包滞后）
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });

  // 控件拖拽状态 Ref
  const isDraggingElementRef = useRef(false);
  const dragInfoRef = useRef<{
    elementId: number;
    initialCentralX: number;
    initialCentralY: number;
    startX: number;
    startY: number;
    hasMoved: boolean;
  } | null>(null);

  const [activeDragElementId, setActiveDragElementId] = useState<number | null>(null);
  const isSpaceDownRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const {
    layoutBasis,
    zoom,
    panOffset,
    elements,
    selectedElementIds,
    snapToGrid,
    gridSize,
    showSafeArea,
    selectElement,
    updateElementTransient,
    pushHistorySnapshot,
    setZoom,
    setPanOffset,
  } = useCrownStore();

  // 同步 panOffsetRef 与最新状态
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  // 滚轮即时缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    setZoom((prev) => Math.max(0.15, Math.min(2.5, Number((prev + delta).toFixed(2)))));
  };

  // 全局指针移动处理函数（零延迟，使用 rAF 保持与显示器刷新率 1:1 同步）
  const handleGlobalPointerMove = useCallback(
    (e: PointerEvent) => {
      // 1. 画布视口平移
      if (isPanningRef.current) {
        const deltaX = e.clientX - panStartRef.current.x;
        const deltaY = e.clientY - panStartRef.current.y;
        setPanOffset({ x: deltaX, y: deltaY });
        return;
      }

      // 2. 控件物理拖拽
      if (isDraggingElementRef.current && dragInfoRef.current) {
        const { elementId, initialCentralX, initialCentralY, startX, startY } = dragInfoRef.current;
        dragInfoRef.current.hasMoved = true;

        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }

        rafIdRef.current = requestAnimationFrame(() => {
          const deltaX = (e.clientX - startX) / zoom;
          const deltaY = (e.clientY - startY) / zoom;

          let newX = Math.round(initialCentralX + deltaX);
          let newY = Math.round(initialCentralY + deltaY);

          if (snapToGrid) {
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }

          // 贴合屏幕物理边界
          newX = Math.max(10, Math.min(layoutBasis.widthPx - 10, newX));
          newY = Math.max(10, Math.min(layoutBasis.heightPx - 10, newY));

          // 核心优化：高频拖拽调用零开销瞬态更新，绝不触发深度快照与 GC
          updateElementTransient(elementId, {
            element_central_x: newX,
            element_central_y: newY,
          });
        });
      }
    },
    [zoom, snapToGrid, gridSize, layoutBasis, updateElementTransient, setPanOffset]
  );

  // 全局指针释放
  const handleGlobalPointerUp = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (isDraggingElementRef.current && dragInfoRef.current?.hasMoved) {
      // 拖拽结束时恢复鼠标光标
      document.body.style.cursor = "";
    }

    isPanningRef.current = false;
    isDraggingElementRef.current = false;
    dragInfoRef.current = null;
    setActiveDragElementId(null);
  }, []);

  // 挂载全局顶级事件监听器（确保鼠标无论移动多快、划出窗口任何地方都不丢帧）
  useEffect(() => {
    window.addEventListener("pointermove", handleGlobalPointerMove, { passive: true });
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpaceDownRef.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpaceDownRef.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleGlobalPointerMove, handleGlobalPointerUp]);

  // 画布背景按下（平移视口）
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || isSpaceDownRef.current || (e.button === 0 && e.target === containerRef.current)) {
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX - panOffsetRef.current.x,
        y: e.clientY - panOffsetRef.current.y,
      };
      e.preventDefault();
    } else if (e.target === containerRef.current) {
      selectElement(null);
    }
  };

  // 单个按键按下（开启拖拽）
  const handleElementMouseDown = (e: React.MouseEvent, el: CrownElement) => {
    e.stopPropagation();
    e.preventDefault();

    // 选中该元素
    selectElement(el.element_id, e.shiftKey || e.ctrlKey);

    // 关键优化：在拖拽动作开始前，仅记录一次历史快照，拖拽过程中零开销
    pushHistorySnapshot();

    isDraggingElementRef.current = true;
    setActiveDragElementId(el.element_id);

    dragInfoRef.current = {
      elementId: el.element_id,
      initialCentralX: el.element_central_x,
      initialCentralY: el.element_central_y,
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
    };
  };

  const renderElement = (el: CrownElement) => {
    const isSelected = selectedElementIds.includes(el.element_id);
    const isBeingDragged = activeDragElementId === el.element_id;
    const left = el.element_central_x - el.element_width / 2;
    const top = el.element_central_y - el.element_height / 2;

    const borderColor = CrownColorUtils.intToRgbaHex(el.element_color);
    const bgColor = CrownColorUtils.intToRgbaHex(el.element_background_color);

    return (
      <div
        key={el.element_id}
        onMouseDown={(e) => handleElementMouseDown(e, el)}
        style={{
          position: "absolute",
          left: `${left}px`,
          top: `${top}px`,
          width: `${el.element_width}px`,
          height: `${el.element_height}px`,
          borderRadius: "element_radius" in el && el.element_radius ? `${el.element_radius}px` : "12px",
          borderWidth: `${Math.max(2, el.element_thick)}px`,
          borderColor: borderColor,
          backgroundColor: bgColor,
          zIndex: isBeingDragged ? 9999 : el.element_layer,
          willChange: isBeingDragged ? "left, top" : "auto",
        }}
        /* 关键修复：彻底移除 transition-all 与位移动画，保证物理贴手无延迟 */
        className={`group select-none flex items-center justify-center cursor-move transition-colors duration-100 ${
          isSelected
            ? "ring-2 ring-[#111111] ring-offset-2 ring-offset-[#fafaf9] shadow-xs"
            : "hover:ring-1 hover:ring-[#111111]/30"
        }`}
      >
        {renderElementContent(el)}

        {/* 选中时的尺寸标注小浮标 */}
        {isSelected && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-[#111111] px-2 py-0.5 text-[10px] font-mono font-medium text-[#ffffff] pointer-events-none whitespace-nowrap shadow-xs">
            {el.element_width} × {el.element_height} (L{el.element_layer})
          </div>
        )}
      </div>
    );
  };

  const renderElementContent = (el: CrownElement) => {
    switch (el.element_type) {
      case CrownElementType.DIGITAL_PAD: {
        return (
          <div className="relative h-full w-full pointer-events-none flex items-center justify-center">
            <div className="absolute top-2 text-xs font-mono font-bold text-[#111111] bg-white/80 px-1 rounded">
              {el.element_up_value || "UP"}
            </div>
            <div className="absolute bottom-2 text-xs font-mono font-bold text-[#111111] bg-white/80 px-1 rounded">
              {el.element_down_value || "DOWN"}
            </div>
            <div className="absolute left-2 text-xs font-mono font-bold text-[#111111] bg-white/80 px-1 rounded">
              {el.element_left_value || "LEFT"}
            </div>
            <div className="absolute right-2 text-xs font-mono font-bold text-[#111111] bg-white/80 px-1 rounded">
              {el.element_right_value || "RIGHT"}
            </div>
            <div className="h-10 w-10 rounded-full border border-dashed border-[#111111]/20" />
          </div>
        );
      }

      case CrownElementType.ANALOG_STICK:
      case CrownElementType.INVISIBLE_ANALOG_STICK: {
        const deadzoneRatio = (el.element_sense || 30) / 100;
        return (
          <div className="relative h-full w-full pointer-events-none flex items-center justify-center">
            <div
              style={{
                width: `${el.element_width * deadzoneRatio}px`,
                height: `${el.element_height * deadzoneRatio}px`,
              }}
              className="rounded-full border border-dashed border-[#9f2f2d]/40 bg-[#fdebec]/20"
            />
            <div className="absolute flex h-14 w-14 items-center justify-center rounded-full border border-[#eaeaea] bg-[#ffffff] shadow-xs">
              <span className="font-mono text-xs font-bold text-[#111111]">
                {"element_value" in el ? el.element_value : "STICK"}
              </span>
            </div>
          </div>
        );
      }

      case CrownElementType.WHEEL_PAD: {
        const numSegments = el.element_mode || 8;
        const innerRatio = (el.element_sense || 30) / 100;
        return (
          <div className="relative h-full w-full pointer-events-none flex items-center justify-center">
            <div
              style={{
                width: `${el.element_width * innerRatio}px`,
                height: `${el.element_height * innerRatio}px`,
              }}
              className="rounded-full border border-[#eaeaea] bg-[#ffffff] flex items-center justify-center shadow-xs"
            >
              <span className="text-[11px] font-semibold text-[#111111]">
                {el.element_text || "WHEEL"}
              </span>
            </div>
            <div className="absolute bottom-2 text-[10px] font-mono text-[#787774]">
              {numSegments} 扇区
            </div>
          </div>
        );
      }

      case CrownElementType.SIMPLIFY_PERFORMANCE: {
        return (
          <div className="px-3 text-center text-xs font-mono font-medium text-[#111111] truncate">
            {el.element_text || "PERFORMANCE STATUS"}
          </div>
        );
      }

      default: {
        const text = "element_text" in el && el.element_text ? el.element_text : "BTN";
        const val = "element_value" in el && el.element_value ? el.element_value : "";
        return (
          <div className="flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="font-semibold text-xs tracking-tight text-[#111111]">{text}</span>
            {val && (
              <span className="text-[10px] font-mono text-[#787774] mt-0.5">{val}</span>
            )}
          </div>
        );
      }
    }
  };

  return (
    <main
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      className="relative flex-1 overflow-hidden bg-[#f7f6f3] cursor-default"
      style={{
        backgroundImage: "radial-gradient(#d5d4d0 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* 居中渲染的真实设备屏幕画幅 (彻底移除 transition-transform，拖动 0 延迟即时呈现) */}
      <div
        style={{
          position: "absolute",
          left: `calc(50% + ${panOffset.x}px)`,
          top: `calc(50% + ${panOffset.y}px)`,
          width: `${layoutBasis.widthPx}px`,
          height: `${layoutBasis.heightPx}px`,
          transform: `translate(-50%, -50%) scale(${zoom})`,
          transformOrigin: "center center",
          willChange: isPanningRef.current ? "left, top" : "auto",
        }}
        className="rounded-[36px] border-[8px] border-[#ffffff] bg-[#fafaf9] shadow-[0_16px_50px_-10px_rgba(0,0,0,0.07),0_0_0_1px_rgba(0,0,0,0.06)] select-none"
      >
        {/* 安全区与摄像头模拟 */}
        {showSafeArea && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 border-r border-dashed border-[#eaeaea] bg-black/[0.015] z-0" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 border-l border-dashed border-[#eaeaea] bg-black/[0.015] z-0" />
            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 h-4 w-4 rounded-full bg-[#111111] z-10" />
          </>
        )}

        {/* 屏幕几何中心轻十字准星 */}
        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/[0.04] z-0" />
        <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-[1px] bg-black/[0.04] z-0" />

        {/* 渲染所有按键元素 */}
        {elements.map(renderElement)}
      </div>

      {/* 视口浮动状态标签 */}
      <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-md border border-[#d4d4d0] bg-[#ffffff] px-3 py-1.5 text-xs text-[#374151] shadow-xs">
        <span>画布基准: <strong className="text-[#111111] font-mono font-semibold">{layoutBasis.widthPx} × {layoutBasis.heightPx}</strong></span>
        <span>•</span>
        <span>缩放: <strong className="text-[#111111] font-mono font-semibold">{Math.round(zoom * 100)}%</strong></span>
        <span>•</span>
        <span>按住 <kbd>Space</kbd> 拖动画布</span>
      </div>
    </main>
  );
};
