/**
 * @file StageViewport.tsx
 * @description 中央工作区画布视口：遵循 minimalist-ui 规范，采用温润骨白点阵底色、极简白色机身画幅与高清晰度按键排布
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

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((prev) => Math.max(0.15, Math.min(2.5, prev + delta)));
  };

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

  const renderElement = (el: CrownElement) => {
    const isSelected = selectedElementIds.includes(el.element_id);
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
          zIndex: el.element_layer,
        }}
        className={`group cursor-move transition-all select-none flex items-center justify-center ${
          isSelected
            ? "ring-2 ring-[#111111] ring-offset-2 ring-offset-[#fafaf9] shadow-sm"
            : "hover:ring-1 hover:ring-[#111111]/30"
        }`}
      >
        {renderElementContent(el)}

        {/* 选中时的尺寸标注小浮标 (纯黑底白字极简风格) */}
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
            <div className="absolute top-2.5 text-[11px] font-mono font-bold text-[#111111]">
              {el.element_up_value || "UP"}
            </div>
            <div className="absolute bottom-2.5 text-[11px] font-mono font-bold text-[#111111]">
              {el.element_down_value || "DOWN"}
            </div>
            <div className="absolute left-2.5 text-[11px] font-mono font-bold text-[#111111]">
              {el.element_left_value || "LEFT"}
            </div>
            <div className="absolute right-2.5 text-[11px] font-mono font-bold text-[#111111]">
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
            {/* 死区参考环 */}
            <div
              style={{
                width: `${el.element_width * deadzoneRatio}px`,
                height: `${el.element_height * deadzoneRatio}px`,
              }}
              className="rounded-full border border-dashed border-[#9f2f2d]/40 bg-[#fdebec]/20"
            />
            {/* 摇杆中心帽 */}
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
            {/* 轮盘内圈空心圆 */}
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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative flex-1 overflow-hidden bg-[#f7f6f3] cursor-default"
      style={{
        backgroundImage: "radial-gradient(#d5d4d0 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* 居中渲染的真实设备屏幕画幅 (Minimalist Device Frame) */}
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
        className="rounded-[36px] border-[8px] border-[#ffffff] bg-[#fafaf9] shadow-[0_16px_50px_-10px_rgba(0,0,0,0.07),0_0_0_1px_rgba(0,0,0,0.06)] transition-transform duration-75 ease-out select-none"
      >
        {/* 安全区与摄像头模拟 */}
        {showSafeArea && (
          <>
            {/* 左右防误触握持区 */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 border-r border-dashed border-[#eaeaea] bg-black/[0.015] z-0" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 border-l border-dashed border-[#eaeaea] bg-black/[0.015] z-0" />
            {/* 顶部中央微摄像头打孔 */}
            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 h-4 w-4 rounded-full bg-[#111111] z-10" />
          </>
        )}

        {/* 屏幕几何中心轻十字准星 */}
        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/[0.04] z-0" />
        <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-[1px] bg-black/[0.04] z-0" />

        {/* 渲染所有按键元素 */}
        {elements.map(renderElement)}
      </div>

      {/* 视口浮动状态标签 (左下角，轻薄白底纯净卡片) */}
      <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-md border border-[#eaeaea] bg-[#ffffff]/90 px-3 py-1.5 text-[11px] text-[#787774] backdrop-blur-sm shadow-xs">
        <span>画布基准: <strong className="text-[#111111] font-mono font-medium">{layoutBasis.widthPx} × {layoutBasis.heightPx}</strong></span>
        <span>•</span>
        <span>缩放: <strong className="text-[#111111] font-mono font-medium">{Math.round(zoom * 100)}%</strong></span>
        <span>•</span>
        <span>按住 <kbd>Space</kbd> 拖动画布</span>
      </div>
    </main>
  );
};
