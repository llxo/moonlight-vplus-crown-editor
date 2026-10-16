/**
 * @file StageViewport.tsx
 * @description 中央工作区画布视口：依据 layoutBasis 等比呈现真实设备画幅，支持无限缩放、平移与控件交互排布
 */

import React, { useRef, useState, useEffect } from "react";
import { useCrownStore } from "../../store/useCrownStore";
import {
  CrownElementType,
  CrownColorUtils,
  type CrownElement,
} from "../../crownSchema";

export const StageViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingViewportRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const isSpaceDownRef = useRef(false);

  const [activeDragElementId, setActiveDragElementId] = useState<number | null>(null);
  const dragElementStartRef = useRef<{
    elementId: number;
    initialCentralX: number;
    initialCentralY: number;
    startX: number;
    startY: number;
  } | null>(null);

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
    updateElement,
    setZoom,
    setPanOffset,
  } = useCrownStore();

  // 滚轮缩放处理
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((prev) => Math.max(0.15, Math.min(2.5, prev + delta)));
  };

  // 画布平移处理（按住空格或中键拖拽，或空白区右键/左键平移）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || isSpaceDownRef.current || (e.button === 0 && e.target === containerRef.current)) {
      isDraggingViewportRef.current = true;
      dragStartPosRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
      e.preventDefault();
    } else if (e.target === containerRef.current) {
      selectElement(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingViewportRef.current) {
      setPanOffset({
        x: e.clientX - dragStartPosRef.current.x,
        y: e.clientY - dragStartPosRef.current.y,
      });
      return;
    }

    if (dragElementStartRef.current && activeDragElementId !== null) {
      const { initialCentralX, initialCentralY, startX, startY } = dragElementStartRef.current;
      const deltaX = (e.clientX - startX) / zoom;
      const deltaY = (e.clientY - startY) / zoom;

      let newX = Math.round(initialCentralX + deltaX);
      let newY = Math.round(initialCentralY + deltaY);

      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // 限制在屏幕范围内
      newX = Math.max(10, Math.min(layoutBasis.widthPx - 10, newX));
      newY = Math.max(10, Math.min(layoutBasis.heightPx - 10, newY));

      updateElement(activeDragElementId, {
        element_central_x: newX,
        element_central_y: newY,
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingViewportRef.current = false;
    dragElementStartRef.current = null;
    setActiveDragElementId(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingViewportRef.current = false;
      dragElementStartRef.current = null;
      setActiveDragElementId(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpaceDownRef.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpaceDownRef.current = false;
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleElementMouseDown = (e: React.MouseEvent, el: CrownElement) => {
    e.stopPropagation();
    selectElement(el.element_id, e.shiftKey || e.ctrlKey);

    setActiveDragElementId(el.element_id);
    dragElementStartRef.current = {
      elementId: el.element_id,
      initialCentralX: el.element_central_x,
      initialCentralY: el.element_central_y,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  // 渲染单个王冠控件实体
  const renderElement = (el: CrownElement) => {
    const isSelected = selectedElementIds.includes(el.element_id);
    const left = el.element_central_x - el.element_width / 2;
    const top = el.element_central_y - el.element_height / 2;

    const borderColor = CrownColorUtils.intToRgbaHex(el.element_color);
    const bgColor = CrownColorUtils.intToRgbaHex(el.element_background_color);

    // 通用样式与外框
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
          zIndex: el.element_layer,
        }}
        className={`group cursor-move transition-shadow select-none flex items-center justify-center ${
          isSelected
            ? "ring-4 ring-amber-400 ring-offset-2 ring-offset-transparent shadow-lg shadow-amber-500/30"
            : "hover:ring-2 hover:ring-amber-400/50"
        }`}
      >
        {/* 内部根据控件类型定制渲染 */}
        {renderElementContent(el)}

        {/* 选中时的尺寸标注小浮标 */}
        {isSelected && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-950 pointer-events-none whitespace-nowrap shadow-sm">
            {el.element_width} × {el.element_height} (L{el.element_layer})
          </div>
        )}
      </div>
    );
  };

  // 各类型控件专属视觉呈现
  const renderElementContent = (el: CrownElement) => {
    switch (el.element_type) {
      case CrownElementType.DIGITAL_PAD: {
        return (
          <div className="relative h-full w-full pointer-events-none flex items-center justify-center">
            {/* 十字准星与四向按键标注 */}
            <div className="absolute top-2 text-[12px] font-bold text-slate-200">
              {el.element_up_value || "UP"}
            </div>
            <div className="absolute bottom-2 text-[12px] font-bold text-slate-200">
              {el.element_down_value || "DOWN"}
            </div>
            <div className="absolute left-2 text-[12px] font-bold text-slate-200">
              {el.element_left_value || "LEFT"}
            </div>
            <div className="absolute right-2 text-[12px] font-bold text-slate-200">
              {el.element_right_value || "RIGHT"}
            </div>
            <div className="h-10 w-10 rounded-full border border-dashed border-slate-400/40" />
          </div>
        );
      }

      case CrownElementType.ANALOG_STICK:
      case CrownElementType.INVISIBLE_ANALOG_STICK: {
        const deadzoneRatio = (el.element_sense || 30) / 100;
        return (
          <div className="relative h-full w-full pointer-events-none flex items-center justify-center">
            {/* 死区参考环 */}
            <div
              style={{
                width: `${el.element_width * deadzoneRatio}px`,
                height: `${el.element_height * deadzoneRatio}px`,
              }}
              className="rounded-full border border-dashed border-rose-400/60 bg-rose-500/10"
            />
            {/* 摇杆中心帽 */}
            <div className="absolute flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-800 shadow-md">
              <span className="font-mono text-xs font-bold text-amber-400">
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
            {/* 轮盘内圈空心圆 */}
            <div
              style={{
                width: `${el.element_width * innerRatio}px`,
                height: `${el.element_height * innerRatio}px`,
              }}
              className="rounded-full border-2 border-amber-400/60 bg-amber-500/10 flex items-center justify-center"
            >
              <span className="text-[11px] font-bold text-amber-300">
                {el.element_text || "WHEEL"}
              </span>
            </div>
            {/* 扇区分割提示 */}
            <div className="absolute bottom-2 text-[11px] font-mono text-slate-300">
              {numSegments} 扇区
            </div>
          </div>
        );
      }

      case CrownElementType.SIMPLIFY_PERFORMANCE: {
        return (
          <div className="px-4 text-center text-xs font-mono font-medium text-emerald-400 truncate">
            {el.element_text || "PERFORMANCE STATUS"}
          </div>
        );
      }

      default: {
        // 普通按键、开关、视角按键、组合按键、组按键
        const text = "element_text" in el && el.element_text ? el.element_text : "BTN";
        const val = "element_value" in el && el.element_value ? el.element_value : "";
        return (
          <div className="flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="font-bold text-slate-100 text-sm tracking-wide">{text}</span>
            {val && (
              <span className="text-[10px] font-mono text-amber-400/90 mt-0.5">{val}</span>
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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative flex-1 overflow-hidden bg-[#0c0d10] cursor-default"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(30, 34, 45, 0.4) 0%, rgba(12, 13, 16, 1) 100%),
          linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 40px 40px, 40px 40px",
      }}
    >
      {/* 居中渲染的实际设备屏幕画幅 (Device Frame) */}
      <div
        style={{
          position: "absolute",
          left: `calc(50% + ${panOffset.x}px)`,
          top: `calc(50% + ${panOffset.y}px)`,
          width: `${layoutBasis.widthPx}px`,
          height: `${layoutBasis.heightPx}px`,
          transform: `translate(-50%, -50%) scale(${zoom})`,
          transformOrigin: "center center",
        }}
        className="rounded-[32px] border-[6px] border-[#22252e] bg-[#101217] shadow-2xl shadow-black/80 transition-transform duration-75 ease-out select-none"
      >
        {/* 设备状态参考：屏幕边框打孔与安全区 (Safe Area) */}
        {showSafeArea && (
          <>
            {/* 屏幕左/右握持防误触半透明区域 (80px) */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 border-r border-dashed border-red-500/20 bg-red-500/5 z-0" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 border-l border-dashed border-red-500/20 bg-red-500/5 z-0" />
            {/* 顶部中央前置打孔摄像头模拟 */}
            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 h-5 w-5 rounded-full bg-[#08090b] border border-[#22252e] z-10" />
          </>
        )}

        {/* 画布中心十字准星 */}
        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-700/20 z-0" />
        <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-[1px] bg-slate-700/20 z-0" />

        {/* 渲染所有王冠虚拟按键元素 */}
        {elements.map(renderElement)}
      </div>

      {/* 视口浮动信息提示小窗 */}
      <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-[#242730] bg-[#14161be6] px-3 py-1.5 text-[11px] text-slate-400 backdrop-blur-md">
        <span>画布物理基准: <strong className="text-slate-200">{layoutBasis.widthPx} × {layoutBasis.heightPx}</strong></span>
        <span>•</span>
        <span>缩放: <strong className="text-amber-400">{Math.round(zoom * 100)}%</strong></span>
        <span>•</span>
        <span className="text-slate-500">按住空格或滚轮可平移视口</span>
      </div>
    </main>
  );
};
