/**
 * @file StageViewport.tsx
 * @description 中央工作区画布视口：负责全局指针调度、视口平移缩放、rAF 高刷物理贴手拖拽与画幅装配
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useCrownStore } from "../../store/useCrownStore";
import {
  CrownElementType,
  createDefaultCrownElement,
  type CrownElement,
} from "../../crownSchema";
import { CrownElementItem } from "./CrownElementItem";
import { StageContextMenu, type ContextMenuState } from "./StageContextMenu";

export const StageViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 视口平移状态 Ref（避免闭包滞后）
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const panHasMovedRef = useRef(false);

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
    statusBarInset,
    zoom,
    panOffset,
    elements,
    selectedElementIds,
    selectElement,
    updateElement,
    updateElementTransient,
    pushHistorySnapshot,
    duplicateElement,
    deleteElement,
    duplicateSelectedElements,
    deleteSelectedElements,
    reorderLayer,
    addElement,
    resetViewport,
    setZoom,
    setPanOffset,
  } = useCrownStore();

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    targetElementId: null,
    canvasX: 0,
    canvasY: 0,
  });

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  // 计算视口屏幕像素坐标对应的画布物理坐标
  const calculateCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) {
        return {
          x: Math.round(layoutBasis.widthPx / 2),
          y: Math.round(layoutBasis.heightPx / 2),
        };
      }
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 + panOffsetRef.current.x;
      const centerY = rect.top + rect.height / 2 + panOffsetRef.current.y;

      const rawX = (clientX - centerX) / zoom + layoutBasis.widthPx / 2;
      const rawY = (clientY - centerY) / zoom + layoutBasis.heightPx / 2;

      let clampedX = Math.round(rawX);
      let clampedY = Math.round(rawY);

      clampedX = Math.max(50, Math.min(layoutBasis.widthPx - 50, clampedX));
      clampedY = Math.max(50, Math.min(layoutBasis.heightPx - 50, clampedY));

      return { x: clampedX, y: clampedY };
    },
    [layoutBasis, zoom]
  );

  const openContextMenu = useCallback(
    (clientX: number, clientY: number, targetId: number | null = null) => {
      const { x: cx, y: cy } = calculateCanvasCoords(clientX, clientY);

      const MENU_WIDTH = 220;
      const MENU_HEIGHT = targetId !== null ? 310 : 230;

      let adjustedX = clientX;
      if (clientX + MENU_WIDTH > window.innerWidth - 12) {
        adjustedX = clientX - MENU_WIDTH;
      }
      adjustedX = Math.max(12, adjustedX);

      let adjustedY = clientY;
      if (clientY + MENU_HEIGHT > window.innerHeight - 12) {
        adjustedY = clientY - MENU_HEIGHT;
      }
      adjustedY = Math.max(12, adjustedY);

      setContextMenu({
        isOpen: true,
        x: adjustedX,
        y: adjustedY,
        targetElementId: targetId,
        canvasX: cx,
        canvasY: cy,
      });
    },
    [calculateCanvasCoords]
  );

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

  // 计算当前选中的组按键所绑定的子控件集合，以便在画布上直观显示关联虚线框与指示标签
  const activeGroupChildIds = useMemo(() => {
    if (selectedElementIds.length !== 1) return new Set<number>();
    const selectedEl = elements.find((el) => el.element_id === selectedElementIds[0]);
    if (!selectedEl || selectedEl.element_type !== CrownElementType.GROUP_BUTTON) {
      return new Set<number>();
    }
    const ids = (selectedEl.element_value || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && s !== "-1" && s !== String(selectedEl.element_id))
      .map(Number)
      .filter((n) => !isNaN(n));
    return new Set<number>(ids);
  }, [selectedElementIds, elements]);

  // 全局指针移动处理函数（零延迟，使用 rAF 保持与显示器刷新率 1:1 同步）
  const handleGlobalPointerMove = useCallback(
    (e: PointerEvent) => {
      // 1. 画布视口平移
      if (isPanningRef.current) {
        panHasMovedRef.current = true;
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

          // 贴合屏幕物理边界
          newX = Math.max(10, Math.min(layoutBasis.widthPx - 10, newX));
          newY = Math.max(10, Math.min(layoutBasis.heightPx - 10, newY));

          updateElementTransient(elementId, {
            element_central_x: newX,
            element_central_y: newY,
          });
        });
      }
    },
    [zoom, layoutBasis, updateElementTransient, setPanOffset]
  );

  // 全局指针释放
  const handleGlobalPointerUp = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (isPanningRef.current) {
      if (!panHasMovedRef.current) {
        selectElement(null);
      }
      isPanningRef.current = false;
      document.body.style.cursor = "";
    }

    if (isDraggingElementRef.current && dragInfoRef.current?.hasMoved) {
      document.body.style.cursor = "";
    }

    isDraggingElementRef.current = false;
    dragInfoRef.current = null;
    setActiveDragElementId(null);
  }, [selectElement]);

  // 初次进入视口或布局基准改变时，智能计算自适应视口比例（避免大屏下画布缩微与大片空洞）
  useEffect(() => {
    const handleFitViewport = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth <= 0 || clientHeight <= 0) return;

      const fitZoomX = (clientWidth * 0.80) / layoutBasis.widthPx;
      const fitZoomY = (clientHeight * 0.76) / layoutBasis.heightPx;
      const bestZoom = Math.max(0.3, Math.min(1.8, Number(Math.min(fitZoomX, fitZoomY).toFixed(2))));
      setZoom(bestZoom);
      setPanOffset({ x: 0, y: 0 });
    };

    const timer = setTimeout(handleFitViewport, 50);
    return () => clearTimeout(timer);
  }, [layoutBasis.widthPx, layoutBasis.heightPx, setZoom, setPanOffset]);

  // 挂载全局事件监听器
  useEffect(() => {
    window.addEventListener("pointermove", handleGlobalPointerMove, { passive: true });
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpaceDownRef.current = true;
      if (e.key === "Escape") closeContextMenu();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpaceDownRef.current = false;
    };

    const handleOutsidePointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-crown-context-menu]")) {
        return;
      }
      closeContextMenu();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("pointerdown", handleOutsidePointerDown);

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("pointerdown", handleOutsidePointerDown);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleGlobalPointerMove, handleGlobalPointerUp, closeContextMenu]);

  // 快捷菜单具体操作分发
  const handleBringToFront = (id: number) => {
    const maxLayer = elements.reduce((max, el) => Math.max(max, el.element_layer), 50);
    reorderLayer(id, maxLayer + 1);
    closeContextMenu();
  };

  const handleSendToBack = (id: number) => {
    const minLayer = elements.reduce((min, el) => Math.min(min, el.element_layer), 10);
    reorderLayer(id, Math.max(1, minLayer - 1));
    closeContextMenu();
  };

  const handleCenterHorizontal = (id: number) => {
    updateElement(id, { element_central_x: Math.round(layoutBasis.widthPx / 2) });
    closeContextMenu();
  };

  const handleCenterVertical = (id: number) => {
    updateElement(id, { element_central_y: Math.round(layoutBasis.heightPx / 2) });
    closeContextMenu();
  };

  const handleDeleteItem = (id?: number) => {
    if (typeof id === "number") {
      deleteElement(id);
    } else {
      deleteSelectedElements();
    }
    closeContextMenu();
  };

  const handleDuplicateItem = (id?: number) => {
    if (typeof id === "number") {
      duplicateElement(id);
    } else {
      duplicateSelectedElements();
    }
    closeContextMenu();
  };

  const handleAddButtonAt = (cx: number, cy: number) => {
    const newEl = createDefaultCrownElement(CrownElementType.DIGITAL_COMMON_BUTTON, cx, cy);
    addElement(newEl);
    selectElement(newEl.element_id);
    closeContextMenu();
  };

  const handleAddStickAt = (cx: number, cy: number) => {
    const newEl = createDefaultCrownElement(CrownElementType.ANALOG_STICK, cx, cy);
    addElement(newEl);
    selectElement(newEl.element_id);
    closeContextMenu();
  };

  // 画布背景按下
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-crown-context-menu]")) {
      return;
    }
    closeContextMenu();

    if ((e.target as HTMLElement).closest("[data-crown-element]")) {
      return;
    }

    if (e.button === 0 || e.button === 1 || e.button === 2 || isSpaceDownRef.current) {
      isPanningRef.current = true;
      panHasMovedRef.current = false;
      panStartRef.current = {
        x: e.clientX - panOffsetRef.current.x,
        y: e.clientY - panOffsetRef.current.y,
      };
      if (e.button === 0 || e.button === 1 || isSpaceDownRef.current) {
        document.body.style.cursor = "grabbing";
      }
      if (e.button !== 2) {
        e.preventDefault();
      }
    }
  };

  // 画布空白处右键菜单
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).closest("[data-crown-element]")) {
      return;
    }
    if (panHasMovedRef.current) {
      return;
    }
    openContextMenu(e.clientX, e.clientY, null);
  };

  // 单个按键按下
  const handleElementMouseDown = (e: React.MouseEvent, el: CrownElement) => {
    e.stopPropagation();

    // 右键由 onContextMenu 统一处理，此处不触发选中，避免强行呼出属性控制板
    if (e.button === 2) {
      return;
    }

    if (e.button !== 0) return;

    closeContextMenu();
    e.preventDefault();

    selectElement(el.element_id, e.shiftKey || e.ctrlKey);
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

  // 按键右键菜单：仅弹出快捷菜单，不触发 selectElement，不抢先呼出属性控制板
  const handleElementContextMenu = (e: React.MouseEvent, el: CrownElement) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(e.clientX, e.clientY, el.element_id);
  };

  return (
    <main
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onContextMenu={handleCanvasContextMenu}
      className="relative flex-1 overflow-hidden bg-[#f7f6f3] cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: "radial-gradient(#d5d4d0 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* 居中渲染的真实设备屏幕画幅 */}
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
        {/* 屏幕几何中心十字准星 */}
        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/[0.04] z-0" />
        <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-[1px] bg-black/[0.04] z-0" />

        {/* 状态栏辅助遮罩提示 */}
        {statusBarInset > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${statusBarInset}px`,
            }}
            className="pointer-events-none border-r-2 border-dashed border-amber-400/80 bg-amber-500/[0.04] flex items-center justify-center overflow-hidden z-0"
            title={`状态栏区域占位: ${statusBarInset}px`}
          >
            <div className="flex items-center gap-2 -rotate-90 whitespace-nowrap rounded-full border border-amber-400/80 bg-amber-100/90 px-5 py-2 shadow-sm backdrop-blur-xs select-none">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="font-mono text-[20px] font-bold tracking-wide text-amber-950">
                状态栏占位 {statusBarInset}px
              </span>
            </div>
          </div>
        )}

        {/* 渲染所有按键元素 */}
        {elements.map((el) => (
          <CrownElementItem
            key={el.element_id}
            element={el}
            isSelected={selectedElementIds.includes(el.element_id)}
            isContextTarget={contextMenu.isOpen && contextMenu.targetElementId === el.element_id}
            isGroupChild={activeGroupChildIds.has(el.element_id)}
            isBeingDragged={activeDragElementId === el.element_id}
            onMouseDown={handleElementMouseDown}
            onContextMenu={handleElementContextMenu}
          />
        ))}
      </div>

      {/* 视口浮动状态标签 */}
      <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-md border border-[#d4d4d0] bg-[#ffffff] px-3 py-1.5 text-xs text-[#374151] shadow-xs">
        <span>画布基准: <strong className="text-[#111111] font-mono font-semibold">{layoutBasis.widthPx} × {layoutBasis.heightPx}</strong></span>
        {statusBarInset > 0 && (
          <>
            <span>•</span>
            <span className="text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded font-mono font-medium">
              状态栏(自动补全): {statusBarInset}px
            </span>
          </>
        )}
        <span>•</span>
        <span>缩放: <strong className="text-[#111111] font-mono font-semibold">{Math.round(zoom * 100)}%</strong></span>
        <span>•</span>
        <span>右键呼出菜单</span>
      </div>

      {/* 极简右键快捷菜单 */}
      <StageContextMenu
        menu={contextMenu}
        hasSelectedElements={selectedElementIds.length > 0}
        onClose={closeContextMenu}
        onDuplicate={handleDuplicateItem}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onCenterHorizontal={handleCenterHorizontal}
        onCenterVertical={handleCenterVertical}
        onDelete={handleDeleteItem}
        onSelectElement={(id) => selectElement(id)}
        onAddButton={handleAddButtonAt}
        onAddStick={handleAddStickAt}
        onResetViewport={resetViewport}
        onDeselect={() => selectElement(null)}
      />
    </main>
  );
};
