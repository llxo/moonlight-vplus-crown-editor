/**
 * @file FloatingDock.tsx
 * @description 底部悬浮按键工具坞：彻底摆脱生硬的左侧大边栏，以极简胶囊坞呈现核心虚拟控件工厂
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState } from "react";
import {
  CircleDot,
  ToggleLeft,
  Move,
  Disc,
  Compass,
  Command,
  PieChart,
  Activity,
  Layers,
  Trash2,
  Copy,
  X,
} from "lucide-react";
import { useCrownStore } from "../../store/useCrownStore";
import {
  CrownElementType,
  CrownStickMoveMode,
  type CrownElement,
} from "../../crownSchema";

interface DockPreset {
  type: CrownElementType;
  name: string;
  icon: React.ReactNode;
  hint: string;
  createDefault: (cx: number, cy: number) => CrownElement;
}

const DOCK_PRESETS: DockPreset[] = [
  {
    type: CrownElementType.DIGITAL_COMMON_BUTTON,
    name: "按键",
    icon: <CircleDot className="h-4 w-4 text-[#111111]" />,
    hint: "普通按键 (单次按压触发)",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.DIGITAL_COMMON_BUTTON,
      element_text: "A",
      element_value: "k29",
      element_width: 120,
      element_height: 120,
      element_central_x: cx,
      element_central_y: cy,
      element_radius: 60,
      element_thick: 3,
      element_layer: 50,
      element_color: 0xff333333,
      element_pressed_color: 0xff000000,
      element_background_color: 0x15000000,
      normalTextColor: 0xff111111,
      pressedTextColor: 0xff000000,
      textSizePercent: 26,
    }),
  },
  {
    type: CrownElementType.DIGITAL_SWITCH_BUTTON,
    name: "开关",
    icon: <ToggleLeft className="h-4 w-4 text-[#346538]" />,
    hint: "自锁开关 (点击自锁保持)",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.DIGITAL_SWITCH_BUTTON,
      element_text: "LOCK",
      element_value: "k62", // Space
      element_width: 120,
      element_height: 120,
      element_central_x: cx,
      element_central_y: cy,
      element_radius: 16,
      element_thick: 3,
      element_layer: 50,
      element_color: 0xff346538,
      element_pressed_color: 0xff1e3d22,
      element_background_color: 0x15346538,
      normalTextColor: 0xff111111,
      pressedTextColor: 0xff111111,
      textSizePercent: 22,
    }),
  },
  {
    type: CrownElementType.DIGITAL_MOVABLE_BUTTON,
    name: "视角",
    icon: <Move className="h-4 w-4 text-[#1f6c9f]" />,
    hint: "滑动视角按键 (按住滑动准星)",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.DIGITAL_MOVABLE_BUTTON,
      element_text: "AIM",
      element_value: "m3",
      element_width: 140,
      element_height: 140,
      element_central_x: cx,
      element_central_y: cy,
      element_radius: 70,
      element_thick: 3,
      element_layer: 50,
      element_color: 0xff1f6c9f,
      element_pressed_color: 0xff0f3650,
      element_background_color: 0x151f6c9f,
      normalTextColor: 0xff111111,
      pressedTextColor: 0xff111111,
      textSizePercent: 24,
      element_mode: 0,
      element_sense: 100,
      extra_attributes: JSON.stringify({ isTrackpadMode: false }),
    }),
  },
  {
    type: CrownElementType.ANALOG_STICK,
    name: "摇杆",
    icon: <Disc className="h-4 w-4 text-[#9f2f2d]" />,
    hint: "模拟摇杆 (双轴线性与死区)",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.ANALOG_STICK,
      element_value: "LS",
      element_middle_value: "g64",
      element_width: 360,
      element_height: 360,
      element_central_x: cx,
      element_central_y: cy,
      element_radius: 180,
      element_thick: 3,
      element_layer: 46,
      element_color: 0xff444444,
      element_pressed_color: 0xff111111,
      element_background_color: 0x15000000,
      element_sense: 30,
      element_mode: CrownStickMoveMode.FIXED_ABSOLUTE,
    }),
  },
  {
    type: CrownElementType.DIGITAL_PAD,
    name: "十字键",
    icon: <Compass className="h-4 w-4 text-[#956400]" />,
    hint: "十字方向键 D-Pad (四向移动)",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.DIGITAL_PAD,
      element_up_value: "k51", // W
      element_down_value: "k47", // S
      element_left_value: "k29", // A
      element_right_value: "k32", // D
      element_width: 320,
      element_height: 320,
      element_central_x: cx,
      element_central_y: cy,
      element_thick: 3,
      element_layer: 48,
      element_color: 0xff444444,
      element_pressed_color: 0xff111111,
      element_background_color: 0x18000000,
    }),
  },
  {
    type: CrownElementType.DIGITAL_COMBINE_BUTTON,
    name: "组合键",
    icon: <Command className="h-4 w-4 text-[#5c3e75]" />,
    hint: "组合按键 (如 Ctrl+C、Alt+Tab)",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.DIGITAL_COMBINE_BUTTON,
      element_text: "Ctrl+C",
      element_value: "k113", // Ctrl
      element_up_value: "k31", // C
      element_down_value: "null",
      element_left_value: "null",
      element_right_value: "null",
      element_width: 130,
      element_height: 130,
      element_central_x: cx,
      element_central_y: cy,
      element_radius: 18,
      element_thick: 3,
      element_layer: 50,
      element_color: 0xff5c3e75,
      element_pressed_color: 0xff352343,
      element_background_color: 0x155c3e75,
      normalTextColor: 0xff111111,
      pressedTextColor: 0xff111111,
      textSizePercent: 22,
    }),
  },
  {
    type: CrownElementType.WHEEL_PAD,
    name: "轮盘",
    icon: <PieChart className="h-4 w-4 text-[#956400]" />,
    hint: "轮盘快捷菜单 (多扇区快捷选枪/技能)",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.WHEEL_PAD,
      element_text: "RADIAL",
      element_value: "k8|1,k9|2,k10|3,k11|4,k12|5,k13|6,k14|7,k15|8",
      element_width: 440,
      element_height: 440,
      element_central_x: cx,
      element_central_y: cy,
      element_thick: 4,
      element_layer: 42,
      element_color: 0xff444444,
      element_pressed_color: 0xff111111,
      element_background_color: 0x18000000,
      element_mode: 8,
      element_sense: 30,
      element_flag1: 1,
      extra_attributes: JSON.stringify({
        normalTextColor: 0xff111111,
        pressedTextColor: 0xff111111,
        centerTextColor: 0xff111111,
        textSizePercent: 35,
        centerTextSizePercent: 60,
        triggerTextSizePercent: 40,
        previewGroupChildren: true,
        segmentAlignment: "center",
      }),
    }),
  },
  {
    type: CrownElementType.SIMPLIFY_PERFORMANCE,
    name: "状态条",
    icon: <Activity className="h-4 w-4 text-[#346538]" />,
    hint: "极简性能监视条 (帧率/延时/时间)",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.SIMPLIFY_PERFORMANCE,
      element_text: "FPS: ##帧率## | 延迟: ##网络延时##ms | HH:MM",
      element_width: 380,
      element_height: 52,
      element_central_x: cx,
      element_central_y: cy,
      element_radius: 8,
      element_thick: 18,
      element_layer: 55,
      element_color: 0xff111111,
      element_pressed_color: 0xff111111,
      element_background_color: 0xe6ffffff,
    }),
  },
];

export const FloatingDock: React.FC = () => {
  const {
    addElement,
    layoutBasis,
    elements,
    selectedElementIds,
    selectElement,
    duplicateSelectedElements,
    deleteSelectedElements,
    isLayersOpen,
    toggleLayers,
  } = useCrownStore();

  const [hoveredHint, setHoveredHint] = useState<string | null>(null);

  const handleAdd = (preset: DockPreset) => {
    const cx = Math.round(layoutBasis.widthPx / 2);
    const cy = Math.round(layoutBasis.heightPx / 2);
    const el = preset.createDefault(cx, cy);
    addElement(el);
  };

  const sortedElements = [...elements].sort((a, b) => b.element_layer - a.element_layer);

  return (
    <>
      {/* 底部居中悬浮工具坞 (Dock) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center select-none">
        {/* 悬停微型提示气泡 */}
        {hoveredHint && (
          <div className="mb-2 rounded-md bg-[#111111] px-2.5 py-1 text-xs font-medium text-[#ffffff] shadow-sm animate-fade-in pointer-events-none">
            {hoveredHint}
          </div>
        )}

        <div className="flex items-center gap-1 rounded-full border border-[#eaeaea] bg-[#ffffff]/95 px-3 py-1.5 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] backdrop-blur-md">
          {DOCK_PRESETS.map((preset) => (
            <button
              key={preset.type}
              type="button"
              onClick={() => handleAdd(preset)}
              onMouseEnter={() => setHoveredHint(`添加 ${preset.name} · ${preset.hint}`)}
              onMouseLeave={() => setHoveredHint(null)}
              className="group flex flex-col items-center justify-center rounded-full p-2 text-[#374151] hover:bg-[#f7f6f3] hover:text-[#111111] transition-all hover:scale-105 active:scale-95"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fbfbfa] border border-[#eaeaea] group-hover:border-[#111111]/30 transition-colors">
                {preset.icon}
              </div>
              <span className="text-[11px] font-semibold mt-0.5">{preset.name}</span>
            </button>
          ))}

          <div className="mx-1.5 h-6 w-[1px] bg-[#eaeaea]" />

          {/* 轻量图层小抽屉开关 */}
          <button
            type="button"
            onClick={toggleLayers}
            onMouseEnter={() => setHoveredHint(`图层列表 (${elements.length} 个控件)`)}
            onMouseLeave={() => setHoveredHint(null)}
            className={`flex flex-col items-center justify-center rounded-full p-2 transition-all hover:scale-105 active:scale-95 ${
              isLayersOpen ? "bg-[#111111] text-[#ffffff]" : "text-[#374151] hover:bg-[#f7f6f3] hover:text-[#111111]"
            }`}
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${
              isLayersOpen ? "bg-[#222222] border-[#333333] text-[#ffffff]" : "bg-[#fbfbfa] border-[#eaeaea]"
            }`}>
              <Layers className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold mt-0.5">
              图层 ({elements.length})
            </span>
          </button>
        </div>
      </div>

      {/* 轻量图层抽屉 (点击展开，浮在左下角，不占整栏) */}
      {isLayersOpen && (
        <div className="absolute bottom-24 left-6 z-30 w-72 rounded-xl border border-[#eaeaea] bg-[#ffffff] p-3.5 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-2 select-none">
          <div className="flex items-center justify-between border-b border-[#eaeaea] pb-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
              <Layers className="h-4 w-4" />
              <span>图层大纲 ({elements.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={duplicateSelectedElements}
                disabled={selectedElementIds.length === 0}
                className="rounded p-1 hover:bg-[#f7f6f3] text-[#4b5563] disabled:opacity-30"
                title="克隆选中控件"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={deleteSelectedElements}
                disabled={selectedElementIds.length === 0}
                className="rounded p-1 text-[#9f2f2d] hover:bg-[#fdebec] disabled:opacity-30"
                title="删除选中控件"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleLayers}
                className="rounded p-1 hover:bg-[#f7f6f3] text-[#4b5563]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2.5 max-h-72 overflow-y-auto space-y-1 pr-1">
            {sortedElements.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#9b9a97]">
                暂无按键控件，请点击下方工具坞添加
              </div>
            ) : (
              sortedElements.map((el) => {
                const isSelected = selectedElementIds.includes(el.element_id);
                const displayLabel =
                  "element_text" in el && el.element_text
                    ? el.element_text
                    : "element_value" in el && el.element_value
                    ? el.element_value
                    : `Type ${el.element_type}`;

                return (
                  <div
                    key={el.element_id}
                    onClick={() => selectElement(el.element_id)}
                    className={`flex cursor-pointer items-center justify-between rounded-md border px-2.5 py-1.5 transition-colors ${
                      isSelected
                        ? "border-[#111111] bg-[#111111] text-[#ffffff] font-medium"
                        : "border-[#eaeaea] bg-[#ffffff] text-[#2f3437] hover:border-[#111111]/40 hover:bg-[#fbfbfa]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                        isSelected ? "bg-[#333333] text-[#ffffff]" : "bg-[#f7f6f3] text-[#4b5563]"
                      }`}>
                        L{el.element_layer}
                      </span>
                      <span className="truncate text-xs">{displayLabel}</span>
                    </div>
                    <span className={`text-xs font-mono ${isSelected ? "text-slate-300" : "text-[#6b7280]"}`}>
                      {el.element_width}×{el.element_height}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
};
