/**
 * @file CrownElementItem.tsx
 * @description 单个王冠虚拟按键画幅元素渲染器：负责计算几何边框、物理位置、即时拖拽视觉态与各类按键内部形态
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React from "react";
import {
  CrownElementType,
  CrownColorUtils,
  type CrownElement,
} from "../../crownSchema";

interface CrownElementItemProps {
  element: CrownElement;
  isSelected: boolean;
  isBeingDragged: boolean;
  onMouseDown: (e: React.MouseEvent, el: CrownElement) => void;
  onContextMenu: (e: React.MouseEvent, el: CrownElement) => void;
}

export const CrownElementItem: React.FC<CrownElementItemProps> = ({
  element: el,
  isSelected,
  isBeingDragged,
  onMouseDown,
  onContextMenu,
}) => {
  const left = el.element_central_x - el.element_width / 2;
  const top = el.element_central_y - el.element_height / 2;

  const borderColor = CrownColorUtils.intToRgbaHex(el.element_color);
  const bgColor = CrownColorUtils.intToRgbaHex(el.element_background_color);

  // 计算几何圆角：摇杆与轮盘菜单强制正圆；普通按键与组合键由 element_radius 决定
  const isStrictRound =
    el.element_type === CrownElementType.ANALOG_STICK ||
    el.element_type === CrownElementType.INVISIBLE_ANALOG_STICK ||
    el.element_type === CrownElementType.WHEEL_PAD;

  const calculatedBorderRadius = isStrictRound
    ? "9999px"
    : "element_radius" in el && typeof el.element_radius === "number"
    ? `${Math.max(0, el.element_radius)}px`
    : "16px";

  return (
    <div
      data-crown-element="true"
      onMouseDown={(e) => onMouseDown(e, el)}
      onContextMenu={(e) => onContextMenu(e, el)}
      style={{
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        width: `${el.element_width}px`,
        height: `${el.element_height}px`,
        borderRadius: calculatedBorderRadius,
        borderWidth: `${Math.max(2, el.element_thick)}px`,
        borderColor: borderColor,
        backgroundColor: bgColor,
        zIndex: isBeingDragged ? 9999 : el.element_layer,
        willChange: isBeingDragged ? "left, top" : "auto",
      }}
      className={`group select-none flex items-center justify-center cursor-move transition-colors duration-100 ${
        isSelected
          ? "ring-2 ring-[#111111] ring-offset-2 ring-offset-[#fafaf9] shadow-xs"
          : "hover:ring-1 hover:ring-[#111111]/30"
      }`}
    >
      <CrownElementContent element={el} />

      {/* 选中时的尺寸标注小浮标 */}
      {isSelected && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-[#111111] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#ffffff] pointer-events-none whitespace-nowrap shadow-sm">
          {el.element_width} × {el.element_height} (L{el.element_layer})
        </div>
      )}
    </div>
  );
};

/**
 * 内部视觉内容渲染器
 */
const CrownElementContent: React.FC<{ element: CrownElement }> = ({ element: el }) => {
  switch (el.element_type) {
    case CrownElementType.DIGITAL_PAD: {
      const arrowFontSize = Math.max(16, Math.round(el.element_height * 0.1));
      return (
        <div className="relative h-full w-full pointer-events-none flex items-center justify-center">
          <div
            style={{ fontSize: `${arrowFontSize}px` }}
            className="absolute top-4 font-mono font-bold text-[#111111] bg-white/80 px-2 py-0.5 rounded shadow-xs"
          >
            {el.element_up_value || "UP"}
          </div>
          <div
            style={{ fontSize: `${arrowFontSize}px` }}
            className="absolute bottom-4 font-mono font-bold text-[#111111] bg-white/80 px-2 py-0.5 rounded shadow-xs"
          >
            {el.element_down_value || "DOWN"}
          </div>
          <div
            style={{ fontSize: `${arrowFontSize}px` }}
            className="absolute left-4 font-mono font-bold text-[#111111] bg-white/80 px-2 py-0.5 rounded shadow-xs"
          >
            {el.element_left_value || "LEFT"}
          </div>
          <div
            style={{ fontSize: `${arrowFontSize}px` }}
            className="absolute right-4 font-mono font-bold text-[#111111] bg-white/80 px-2 py-0.5 rounded shadow-xs"
          >
            {el.element_right_value || "RIGHT"}
          </div>
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#111111]/30" />
        </div>
      );
    }

    case CrownElementType.ANALOG_STICK:
    case CrownElementType.INVISIBLE_ANALOG_STICK: {
      const deadzoneRatio = (el.element_sense || 30) / 100;
      const stickCapSize = Math.max(48, Math.round(el.element_width * 0.38));
      const stickFontSize = Math.max(16, Math.round(stickCapSize * 0.32));
      return (
        <div className="relative h-full w-full pointer-events-none flex items-center justify-center">
          <div
            style={{
              width: `${el.element_width * deadzoneRatio}px`,
              height: `${el.element_height * deadzoneRatio}px`,
            }}
            className="rounded-full border-2 border-dashed border-[#9f2f2d]/50 bg-[#fdebec]/25"
          />
          <div
            style={{
              width: `${stickCapSize}px`,
              height: `${stickCapSize}px`,
              fontSize: `${stickFontSize}px`,
            }}
            className="absolute flex items-center justify-center rounded-full border-2 border-[#d4d4d0] bg-[#ffffff] shadow-sm font-mono font-bold text-[#111111]"
          >
            {"element_value" in el ? el.element_value : "STICK"}
          </div>
        </div>
      );
    }

    case CrownElementType.WHEEL_PAD: {
      const numSegments = Math.max(2, el.element_mode || 8);
      const innerRatio = (el.element_sense || 30) / 100;
      const radius = el.element_width / 2;
      const centerSize = Math.max(16, Math.round(el.element_width * innerRatio));
      const centerFontSize = Math.max(14, Math.round(centerSize * 0.28));

      // 解析各扇区名称
      const segmentPairs = (el.element_value || "").split(",").map((s) => {
        const parts = s.split("|");
        return parts[1] || parts[0] || "";
      });

      // 构造扇区分割线角度 (0度在顶部 -90deg)
      const angleStep = (2 * Math.PI) / numSegments;
      const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      const labelPositions: Array<{ x: number; y: number; text: string }> = [];

      const labelRadius = radius * (innerRatio + (1 - innerRatio) * 0.55);

      for (let i = 0; i < numSegments; i++) {
        const angle = -Math.PI / 2 + i * angleStep;
        const x2 = radius + radius * Math.cos(angle);
        const y2 = radius + radius * Math.sin(angle);
        lines.push({ x1: radius, y1: radius, x2, y2 });

        const midAngle = angle + angleStep / 2;
        const lx = radius + labelRadius * Math.cos(midAngle);
        const ly = radius + labelRadius * Math.sin(midAngle);
        const text = segmentPairs[i] || `${i + 1}`;
        labelPositions.push({ x: lx, y: ly, text });
      }

      return (
        <div className="relative h-full w-full pointer-events-none flex items-center justify-center overflow-hidden rounded-full">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${el.element_width} ${el.element_height}`}
          >
            {lines.map((l, idx) => (
              <line
                key={idx}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            ))}
          </svg>

          {labelPositions.map((pos, idx) => (
            <div
              key={idx}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute font-bold text-sm text-[#111111] bg-white/70 px-1.5 py-0.5 rounded shadow-xs"
            >
              {pos.text}
            </div>
          ))}

          <div
            style={{
              width: `${centerSize}px`,
              height: `${centerSize}px`,
              fontSize: `${centerFontSize}px`,
            }}
            className="relative z-10 rounded-full border-2 border-[#d4d4d0] bg-[#ffffff] flex items-center justify-center shadow-sm font-extrabold text-[#111111]"
          >
            {el.element_text || "WHEEL"}
          </div>
        </div>
      );
    }

    case CrownElementType.SIMPLIFY_PERFORMANCE: {
      const perfFontSize = Math.max(16, Math.round(el.element_thick || 24));
      return (
        <div
          style={{ fontSize: `${perfFontSize}px` }}
          className="px-4 text-center font-mono font-bold text-[#111111] truncate"
        >
          {el.element_text || "PERFORMANCE STATUS"}
        </div>
      );
    }

    default: {
      const text = "element_text" in el && el.element_text ? el.element_text : "BTN";
      const val = "element_value" in el && el.element_value ? el.element_value : "";

      const textSizePercent = "textSizePercent" in el && el.textSizePercent ? el.textSizePercent : 35;
      const mainFontSize = Math.max(20, Math.round((el.element_height * textSizePercent) / 100));
      const subFontSize = Math.max(12, Math.round(mainFontSize * 0.42));

      return (
        <div className="flex flex-col items-center justify-center pointer-events-none text-center px-1">
          <span
            style={{ fontSize: `${mainFontSize}px` }}
            className="font-bold tracking-tight text-[#111111] leading-none"
          >
            {text}
          </span>
          {val && (
            <span
              style={{ fontSize: `${subFontSize}px` }}
              className="font-mono font-bold text-[#374151] mt-1.5 bg-black/5 px-2 py-0.5 rounded"
            >
              {val}
            </span>
          )}
        </div>
      );
    }
  }
};
