/**
 * @file CrownElementItem.tsx
 * @description 单个王冠虚拟按键画幅元素渲染器：严格 1:1 还原 Android 源码 onElementDraw 矢量几何图元
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React from "react";
import {
  CrownElementType,
  CrownColorUtils,
  type CrownElement,
} from "../../crownSchema";
import { getKeyHumanLabel } from "../../utils/keyMapping";

interface CrownElementItemProps {
  element: CrownElement;
  isSelected: boolean;
  isContextTarget?: boolean;
  isGroupChild?: boolean;
  isBeingDragged: boolean;
  onMouseDown: (e: React.MouseEvent, el: CrownElement) => void;
  onContextMenu: (e: React.MouseEvent, el: CrownElement) => void;
}

export const CrownElementItem: React.FC<CrownElementItemProps> = ({
  element: el,
  isSelected,
  isContextTarget = false,
  isGroupChild = false,
  isBeingDragged,
  onMouseDown,
  onContextMenu,
}) => {
  const left = el.element_central_x - el.element_width / 2;
  const top = el.element_central_y - el.element_height / 2;

  const borderColor = CrownColorUtils.intToRgbaHex(el.element_color);
  const bgColor = CrownColorUtils.intToRgbaHex(el.element_background_color);

  // 判断是否为完全由内部 SVG 矢量程序化绘制的控件 (十字键、摇杆类、轮盘)
  const isCustomSvgElement =
    el.element_type === CrownElementType.DIGITAL_PAD ||
    el.element_type === CrownElementType.ANALOG_STICK ||
    el.element_type === CrownElementType.INVISIBLE_ANALOG_STICK ||
    el.element_type === CrownElementType.DIGITAL_STICK ||
    el.element_type === CrownElementType.INVISIBLE_DIGITAL_STICK ||
    el.element_type === CrownElementType.WHEEL_PAD;

  // 几何圆角：正圆控件 9999px，十字键 0px，其余按键由 element_radius 决定
  const calculatedBorderRadius = isCustomSvgElement
    ? el.element_type === CrownElementType.DIGITAL_PAD
      ? "0px"
      : "9999px"
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
        // 自绘制 SVG 控件不在容器上添加 border 和 background，避免产生多余外框或双重描边
        borderWidth: isCustomSvgElement ? "0px" : `${Math.max(1, el.element_thick)}px`,
        borderColor: isCustomSvgElement ? "transparent" : borderColor,
        backgroundColor: isCustomSvgElement ? "transparent" : bgColor,
        zIndex: isBeingDragged ? 9999 : el.element_layer,
        willChange: isBeingDragged ? "left, top" : "auto",
      }}
      className={`group select-none flex items-center justify-center cursor-move transition-colors duration-100 ${
        isSelected
          ? "ring-2 ring-[#111111] ring-offset-2 ring-offset-[#fafaf9] shadow-xs"
          : isContextTarget
          ? "ring-2 ring-blue-500/80 ring-offset-2 ring-offset-[#fafaf9] shadow-xs"
          : isGroupChild
          ? "ring-2 ring-blue-500/80 ring-dashed ring-offset-2 ring-offset-[#fafaf9] shadow-xs"
          : "hover:ring-1 hover:ring-[#111111]/30"
      }`}
    >
      <CrownElementContent element={el} borderColor={borderColor} bgColor={bgColor} />

      {/* 选中、右键目标或所属组按键子项时的尺寸标注浮标 */}
      {(isSelected || isContextTarget || isGroupChild) && (
        <div
          className={`absolute -top-7 left-1/2 -translate-x-1/2 rounded px-2.5 py-0.5 text-xs font-mono font-semibold text-[#ffffff] pointer-events-none whitespace-nowrap shadow-sm flex items-center gap-1 ${
            isSelected
              ? "bg-[#111111]"
              : isContextTarget
              ? "bg-blue-600"
              : "bg-blue-600/90"
          }`}
        >
          {isGroupChild && !isSelected && !isContextTarget && <span>📁 组内子项 · </span>}
          <span>{el.element_width} × {el.element_height} (L{el.element_layer})</span>
        </div>
      )}
    </div>
  );
};

interface CrownElementContentProps {
  element: CrownElement;
  borderColor: string;
  bgColor: string;
}

/**
 * 内部视觉内容渲染器：严格 1:1 还原 Android 源码 onElementDraw，无任何自行脑补修饰
 */
const CrownElementContent: React.FC<CrownElementContentProps> = ({
  element: el,
  borderColor,
  bgColor,
}) => {
  switch (el.element_type) {
    /* ------------------------------------------------------------------------
     * 1. 十字键 (DigitalPad, Type 20): 严格 1:1 还原 DigitalPad.java 纯几何十字
     * 1 个多边形底色 + 4 个方向矩形臂 + 1 个中心矩形 + 4 条内角连接线，无方向箭头
     * ------------------------------------------------------------------------ */
    case CrownElementType.DIGITAL_PAD: {
      const size = el.element_width;
      const thick = Math.max(1, el.element_thick);
      const margin = thick;
      const correctedBorder = margin * 2;
      const p1 = 0.33 * size;
      const p2 = 0.66 * size;
      const endPos = size - correctedBorder;

      // 8 顶点十字形底色多边形点位
      const polygonPoints = `
        ${p1},${correctedBorder}
        ${p2},${correctedBorder}
        ${endPos},${p1}
        ${endPos},${p2}
        ${p2},${endPos}
        ${p1},${endPos}
        ${correctedBorder},${p2}
        ${correctedBorder},${p1}
      `.trim().replace(/\s+/g, " ");

      const centerStart = 0.36 * size;
      const centerSize = 0.28 * size;

      return (
        <svg
          className="h-full w-full pointer-events-none"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* 1. 十字底色多边形 */}
          <polygon points={polygonPoints} fill={bgColor} />

          {/* 2. 上方向矩形臂 */}
          <rect
            x={p1}
            y={correctedBorder}
            width={p2 - p1}
            height={p1 - correctedBorder}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />

          {/* 3. 下方向矩形臂 */}
          <rect
            x={p1}
            y={p2}
            width={p2 - p1}
            height={endPos - p2}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />

          {/* 4. 左方向矩形臂 */}
          <rect
            x={correctedBorder}
            y={p1}
            width={p1 - correctedBorder}
            height={p2 - p1}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />

          {/* 5. 右方向矩形臂 */}
          <rect
            x={p2}
            y={p1}
            width={endPos - p2}
            height={p2 - p1}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />

          {/* 6. 中心小矩形 */}
          <rect
            x={centerStart}
            y={centerStart}
            width={centerSize}
            height={centerSize}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />

          {/* 7. 四条内凹角封口连接线 */}
          <line
            x1={correctedBorder}
            y1={p1}
            x2={p1}
            y2={correctedBorder}
            stroke={borderColor}
            strokeWidth={thick}
          />
          <line
            x1={p2}
            y1={correctedBorder}
            x2={endPos}
            y2={p1}
            stroke={borderColor}
            strokeWidth={thick}
          />
          <line
            x1={endPos}
            y1={p2}
            x2={p2}
            y2={endPos}
            stroke={borderColor}
            strokeWidth={thick}
          />
          <line
            x1={p1}
            y1={endPos}
            x2={correctedBorder}
            y2={p2}
            stroke={borderColor}
            strokeWidth={thick}
          />
        </svg>
      );
    }

    /* ------------------------------------------------------------------------
     * 2. 模拟摇杆 (AnalogStick, Type 30 / 32): 严格 1:1 还原 AnalogStick.java
     * 纯 4 圆结构: 底色大圆 + 外圈描边圆 + 死区描边圆 + 摇杆帽圆，无任何文字，无虚线/渐变
     * ------------------------------------------------------------------------ */
    case CrownElementType.ANALOG_STICK:
    case CrownElementType.INVISIBLE_ANALOG_STICK: {
      const radius = el.element_width / 2;
      const thick = Math.max(1, el.element_thick);
      const radiusComplete = Math.max(1, radius - 2 * thick);
      const deadzoneRadius = radius * ((el.element_sense ?? 30) / 100);
      const stickCapRadius = radius * 0.2;
      const isInvisible = el.element_type === CrownElementType.INVISIBLE_ANALOG_STICK;

      return (
        <svg
          className="h-full w-full pointer-events-none"
          viewBox={`0 0 ${el.element_width} ${el.element_height}`}
        >
          {/* 1. 底色填充大圆 */}
          <circle cx={radius} cy={radius} r={radiusComplete} fill={bgColor} />

          {/* 2. 外圈描边圆 (若隐形则虚线标识) */}
          <circle
            cx={radius}
            cy={radius}
            r={radiusComplete}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
            strokeDasharray={isInvisible ? "6 4" : undefined}
          />

          {/* 3. 死区描边圆 (实线) */}
          <circle
            cx={radius}
            cy={radius}
            r={deadzoneRadius}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />

          {/* 4. 摇杆帽子描边圆 (实线) */}
          <circle
            cx={radius}
            cy={radius}
            r={stickCapRadius}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />

          {isInvisible && (
            <text
              x={radius}
              y={radius - radiusComplete + 18}
              textAnchor="middle"
              dominantBaseline="central"
              fill={borderColor}
              fontSize="12"
              fontFamily="system-ui, sans-serif"
              fontWeight="bold"
            >
              隐形模拟摇杆
            </text>
          )}
        </svg>
      );
    }

    /* ------------------------------------------------------------------------
     * 3. 数字摇杆 (DigitalStick, Type 31 / 33): 与模拟摇杆结构对齐的纯净线条
     * ------------------------------------------------------------------------ */
    case CrownElementType.DIGITAL_STICK:
    case CrownElementType.INVISIBLE_DIGITAL_STICK: {
      const radius = el.element_width / 2;
      const thick = Math.max(1, el.element_thick);
      const radiusComplete = Math.max(1, radius - 2 * thick);
      const deadzoneRadius = radius * ((el.element_sense ?? 30) / 100);
      const stickCapRadius = radius * 0.2;
      const isInvisible = el.element_type === CrownElementType.INVISIBLE_DIGITAL_STICK;

      return (
        <svg
          className="h-full w-full pointer-events-none"
          viewBox={`0 0 ${el.element_width} ${el.element_height}`}
        >
          {/* 1. 底色大圆 */}
          <circle cx={radius} cy={radius} r={radiusComplete} fill={bgColor} />

          {/* 2. 外圈描边大圆 */}
          <circle
            cx={radius}
            cy={radius}
            r={radiusComplete}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
            strokeDasharray={isInvisible ? "6 4" : undefined}
          />

          {/* 3. 死区描边圆 */}
          <circle
            cx={radius}
            cy={radius}
            r={deadzoneRadius}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />

          {/* 4. 中心下压帽 */}
          <circle
            cx={radius}
            cy={radius}
            r={stickCapRadius}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />

          {/* 四向微小纯净刻度文本 */}
          <text
            x={radius}
            y={radius - (radiusComplete + deadzoneRadius) / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={borderColor}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {el.element_up_value || "W"}
          </text>
          <text
            x={radius}
            y={radius + (radiusComplete + deadzoneRadius) / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={borderColor}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {el.element_down_value || "S"}
          </text>
          <text
            x={radius - (radiusComplete + deadzoneRadius) / 2}
            y={radius}
            textAnchor="middle"
            dominantBaseline="central"
            fill={borderColor}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {el.element_left_value || "A"}
          </text>
          <text
            x={radius + (radiusComplete + deadzoneRadius) / 2}
            y={radius}
            textAnchor="middle"
            dominantBaseline="central"
            fill={borderColor}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {el.element_right_value || "D"}
          </text>

          {isInvisible && (
            <text
              x={radius}
              y={radius - radiusComplete + 18}
              textAnchor="middle"
              dominantBaseline="central"
              fill={borderColor}
              fontSize="12"
              fontFamily="system-ui, sans-serif"
              fontWeight="bold"
            >
              隐形数字摇杆
            </text>
          )}
        </svg>
      );
    }

    /* ------------------------------------------------------------------------
     * 4. 技能轮盘 (WheelPad, Type 54): 严格 1:1 还原 WheelPad.java 源码数学模型
     * 1 号键居顶 (-90°), 辐射线从 innerRadius 到 outerRadius 不穿心, 无中心方块
     * ------------------------------------------------------------------------ */
    case CrownElementType.WHEEL_PAD: {
      const radius = el.element_width / 2;
      const thick = Math.max(1, el.element_thick);
      const fillOuterRadius = Math.max(1, radius - thick);
      const borderOuter = radius - thick / 2;

      const innerRatio = (el.element_sense ?? 30) / 100;
      const fillInnerRadius = fillOuterRadius * innerRatio;
      const borderInner = fillInnerRadius + thick / 2;

      const ringThickness = fillOuterRadius - fillInnerRadius;
      const textRadius = fillInnerRadius + ringThickness * 0.5;

      const numSegments = Math.max(2, el.element_mode || 8);
      const angleStep = (2 * Math.PI) / numSegments;

      // 解析各扇区名称 (支持 k51|W 格式或纯键码 k51 自动解析为友好键名)
      const segmentPairs = (el.element_value || "").split(",").map((s) => {
        const parts = s.split("|");
        if (parts[1] && parts[1].trim() !== "") {
          return parts[1].trim();
        }
        const key = parts[0]?.trim();
        if (key) {
          const info = getKeyHumanLabel(key);
          return info.label || key;
        }
        return "";
      });

      // 解析扩展属性 (normalTextColor, textSizePercent)
      let wheelExtra: any = {};
      try {
        if (el.extra_attributes) wheelExtra = JSON.parse(el.extra_attributes);
      } catch {
        // ignore
      }

      // 扇区文字颜色
      const textColor = wheelExtra.normalTextColor
        ? CrownColorUtils.intToRgbaHex(wheelExtra.normalTextColor)
        : "#FFFFFF";

      // 扇区字号：严格 1:1 还原 SVG 规格 (font-size: 32px 粗体)
      const fontSize = Math.max(14, Math.round(ringThickness * 0.31));

      // 居中模式：第 0 扇区中心正上方 12 点钟位置 (-90° = -Math.PI / 2)
      // 分割线偏置半个扇区角: -Math.PI / 2 - angleStep / 2 + i * angleStep
      const dividerLines: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      const textLabels: Array<{ x: number; y: number; text: string }> = [];

      for (let i = 0; i < numSegments; i++) {
        const divAngle = -Math.PI / 2 - angleStep / 2 + i * angleStep;
        const cosDiv = Math.cos(divAngle);
        const sinDiv = Math.sin(divAngle);

        dividerLines.push({
          x1: radius + fillInnerRadius * cosDiv,
          y1: radius + fillInnerRadius * sinDiv,
          x2: radius + fillOuterRadius * cosDiv,
          y2: radius + fillOuterRadius * sinDiv,
        });

        // 扇区文字位于扇区角正中
        const midAngle = -Math.PI / 2 + i * angleStep;
        const tx = radius + textRadius * Math.cos(midAngle);
        const ty = radius + textRadius * Math.sin(midAngle);
        const label = segmentPairs[i] || `${i + 1}`;
        textLabels.push({ x: tx, y: ty, text: label });
      }

      return (
        <svg
          className="h-full w-full pointer-events-none"
          viewBox={`0 0 ${el.element_width} ${el.element_height}`}
        >
          {/* 1. 外圈底色圆 */}
          <circle cx={radius} cy={radius} r={fillOuterRadius} fill={bgColor} />

          {/* 2. 径向分割线 (从内径到外径，绝不穿透中心) */}
          {dividerLines.map((line, idx) => (
            <line
              key={idx}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={borderColor}
              strokeWidth={thick}
              strokeLinecap="butt"
            />
          ))}

          {/* 3. 中心圆遮罩 (canvas.drawCircle with paintBackground: 0xFF000000) */}
          <circle cx={radius} cy={radius} r={fillInnerRadius} fill="#000000" fillOpacity={0.8} />

          {/* 4. 内外圈描边圆 (canvas.drawOval with paintBorder) */}
          <circle
            cx={radius}
            cy={radius}
            r={borderInner}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />
          <circle
            cx={radius}
            cy={radius}
            r={borderOuter}
            fill="none"
            stroke={borderColor}
            strokeWidth={thick}
          />

          {/* 5. 扇区文字 (水平居中纯净大字号粗体文字，无白底卡片) */}
          {textLabels.map((lbl, idx) => (
            <text
              key={idx}
              x={lbl.x}
              y={lbl.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={textColor}
              fontSize={fontSize}
              fontFamily="system-ui, -apple-system, 'Roboto', sans-serif"
              fontWeight="bold"
            >
              {lbl.text}
            </text>
          ))}

          {/* 6. 中心可选文字 */}
          {el.element_text && (
            <text
              x={radius}
              y={radius}
              textAnchor="middle"
              dominantBaseline="central"
              fill={textColor}
              fontSize={Math.max(12, Math.round(fillInnerRadius * 0.45))}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="bold"
            >
              {el.element_text}
            </text>
          )}
        </svg>
      );
    }

    /* ------------------------------------------------------------------------
     * 5. 极简性能条 (SimplifyPerformance, Type 50)
     * ------------------------------------------------------------------------ */
    case CrownElementType.SIMPLIFY_PERFORMANCE: {
      const perfFontSize = Math.max(12, Math.round(el.element_thick || 24));
      const textColor = CrownColorUtils.intToRgbaHex(el.element_color);
      return (
        <div
          style={{ fontSize: `${perfFontSize}px`, color: textColor }}
          className="px-4 text-center font-mono font-bold truncate leading-none pointer-events-none select-none"
        >
          {el.element_text || "FPS: 60 | 延迟: 12ms | 12:00:00"}
        </div>
      );
    }

    /* ------------------------------------------------------------------------
     * 6. 抽屉组按键 (GroupButton, Type 4)
     * ------------------------------------------------------------------------ */
    case CrownElementType.GROUP_BUTTON: {
      const childIds = (el.element_value || "").split(",").filter((id) => id && id !== "-1");
      const textSizePercent = el.textSizePercent ?? 24;
      const mainFontSize = Math.max(14, Math.round((el.element_height * textSizePercent) / 100));
      const textColor = el.normalTextColor
        ? CrownColorUtils.intToRgbaHex(el.normalTextColor)
        : "#111111";

      return (
        <div className="flex flex-col items-center justify-center pointer-events-none text-center px-1">
          <span
            style={{ fontSize: `${mainFontSize}px`, color: textColor }}
            className="font-bold tracking-tight leading-none"
          >
            {el.element_text || "GROUP"}
          </span>
          <span className="font-mono text-[10px] font-semibold text-blue-600 mt-1 bg-blue-50/80 px-1.5 py-0.5 rounded">
            {childIds.length > 0 ? `📁 ${childIds.length} 项` : "📁 组"}
          </span>
        </div>
      );
    }

    /* ------------------------------------------------------------------------
     * 7. 普通按键 / 自锁开关 / 滑动视角 / 组合键
     * 严格依据 docs/svg/button_common.svg: 大字号居中文本，纯净干脆，无多余按键码方块
     * ------------------------------------------------------------------------ */
    default: {
      const text = "element_text" in el && el.element_text ? el.element_text : "A";
      const textSizePercent = "textSizePercent" in el && el.textSizePercent ? el.textSizePercent : 42;
      const mainFontSize = Math.max(14, Math.round((el.element_height * textSizePercent) / 100));

      const textColor = "normalTextColor" in el && el.normalTextColor
        ? CrownColorUtils.intToRgbaHex(el.normalTextColor)
        : "#111111";

      return (
        <div className="flex items-center justify-center pointer-events-none text-center px-2 h-full w-full">
          <span
            style={{ fontSize: `${mainFontSize}px`, color: textColor }}
            className="font-bold tracking-tight leading-none select-none"
          >
            {text}
          </span>
        </div>
      );
    }
  }
};
