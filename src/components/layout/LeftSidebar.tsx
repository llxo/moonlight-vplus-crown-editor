/**
 * @file LeftSidebar.tsx
 * @description 编辑器左侧边栏：遵循 minimalist-ui 规范，采用 Bento-grid 风格预设卡片与极简浅色图层大纲
 */

import React from "react";
import {
  Layers,
  Component,
  Plus,
  Trash2,
  Copy,
  Sliders,
  Move,
  Disc,
  Compass,
  Activity,
  FolderOpen,
  PieChart,
  CircleDot,
  ToggleLeft,
} from "lucide-react";
import { useCrownStore } from "../../store/useCrownStore";
import { CrownChildVisibility, CrownElementType, CrownStickMoveMode, type CrownElement } from "../../crownSchema";

interface PresetItem {
  type: CrownElementType;
  name: string;
  category: "button" | "stick" | "wheel" | "widget";
  icon: React.ReactNode;
  desc: string;
  createDefault: (centralX: number, centralY: number) => CrownElement;
}

const PRESETS: PresetItem[] = [
  {
    type: CrownElementType.DIGITAL_COMMON_BUTTON,
    name: "普通按键",
    category: "button",
    icon: <CircleDot className="h-4 w-4 text-[#111111]" />,
    desc: "单次按压触发，映射键鼠与手柄按键",
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
    name: "自锁开关",
    category: "button",
    icon: <ToggleLeft className="h-4 w-4 text-[#346538]" />,
    desc: "点击后持续保持按下，再次点击解锁",
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
    name: "滑动视角按键",
    category: "button",
    icon: <Move className="h-4 w-4 text-[#1f6c9f]" />,
    desc: "按下时可直接划动控制视角或鼠标",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.DIGITAL_MOVABLE_BUTTON,
      element_text: "AIM",
      element_value: "m3", // 鼠标右键
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
    type: CrownElementType.DIGITAL_COMBINE_BUTTON,
    name: "组合快捷键",
    category: "button",
    icon: <Sliders className="h-4 w-4 text-[#5c3e75]" />,
    desc: "一键触发快捷键组合（如 Ctrl+C、Alt+Tab）",
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
    type: CrownElementType.GROUP_BUTTON,
    name: "抽屉组按键",
    category: "button",
    icon: <FolderOpen className="h-4 w-4 text-[#787774]" />,
    desc: "点击展开或收起关联的子按键组",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.GROUP_BUTTON,
      element_text: "MENU",
      element_value: "-1",
      element_width: 110,
      element_height: 110,
      element_central_x: cx,
      element_central_y: cy,
      element_radius: 55,
      element_thick: 3,
      element_layer: 50,
      element_color: 0xff787774,
      element_pressed_color: 0xff111111,
      element_background_color: 0x12000000,
      normalTextColor: 0xff111111,
      pressedTextColor: 0xff111111,
      textSizePercent: 22,
      element_sense: CrownChildVisibility.VISIBLE,
      element_flag1: 0,
      extra_attributes: JSON.stringify({
        movableInNormalMode: false,
        userHasManuallySet: true,
      }),
    }),
  },
  {
    type: CrownElementType.DIGITAL_PAD,
    name: "十字方向键 D-Pad",
    category: "stick",
    icon: <Compass className="h-4 w-4 text-[#956400]" />,
    desc: "上下左右经典四向连体方向键",
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
    type: CrownElementType.ANALOG_STICK,
    name: "模拟摇杆 (LS/RS)",
    category: "stick",
    icon: <Disc className="h-4 w-4 text-[#9f2f2d]" />,
    desc: "双轴线性摇杆，支持死区与动态跟随",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.ANALOG_STICK,
      element_value: "LS",
      element_middle_value: "g64", // L3
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
      element_sense: 30, // 30% 死区
      element_mode: CrownStickMoveMode.FIXED_ABSOLUTE,
    }),
  },
  {
    type: CrownElementType.WHEEL_PAD,
    name: "轮盘快捷菜单",
    category: "wheel",
    icon: <PieChart className="h-4 w-4 text-[#956400]" />,
    desc: "多扇区轮盘快捷键，支持居中弹出",
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
    name: "极简性能监视条",
    category: "widget",
    icon: <Activity className="h-4 w-4 text-[#346538]" />,
    desc: "悬浮状态栏：显示帧率、延迟与时间",
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

export const LeftSidebar: React.FC = () => {
  const {
    activeTabLeft,
    setActiveTabLeft,
    elements,
    selectedElementIds,
    selectElement,
    addElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    layoutBasis,
  } = useCrownStore();

  const handleAddPreset = (preset: PresetItem) => {
    const cx = Math.round(layoutBasis.widthPx / 2);
    const cy = Math.round(layoutBasis.heightPx / 2);
    const el = preset.createDefault(cx, cy);
    addElement(el);
  };

  const sortedElements = [...elements].sort((a, b) => b.element_layer - a.element_layer);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#eaeaea] bg-[#ffffff] text-xs select-none">
      {/* 选项卡切换头 */}
      <div className="flex border-b border-[#eaeaea] bg-[#fbfbfa]">
        <button
          onClick={() => setActiveTabLeft("palette")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 font-medium transition-colors ${
            activeTabLeft === "palette"
              ? "border-b-2 border-[#111111] bg-[#ffffff] text-[#111111]"
              : "text-[#787774] hover:text-[#111111]"
          }`}
        >
          <Component className="h-3.5 w-3.5" />
          <span>控件库 ({PRESETS.length})</span>
        </button>
        <button
          onClick={() => setActiveTabLeft("layers")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 font-medium transition-colors ${
            activeTabLeft === "layers"
              ? "border-b-2 border-[#111111] bg-[#ffffff] text-[#111111]"
              : "text-[#787774] hover:text-[#111111]"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>图层 ({elements.length})</span>
        </button>
      </div>

      {/* 选项卡内容区 */}
      <div className="flex-1 overflow-y-auto p-3.5">
        {activeTabLeft === "palette" ? (
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-[#374151] px-1 mb-0.5">
              点击添加预设到画布
            </div>
            {PRESETS.map((preset) => (
              <div
                key={preset.type}
                onClick={() => handleAddPreset(preset)}
                className="group flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#eaeaea] bg-[#ffffff] p-2.5 transition-all hover:border-[#111111] hover:bg-[#fbfbfa]"
              >
                <div className="mt-0.5 rounded-md bg-[#f7f6f3] p-1.5 border border-[#eaeaea] group-hover:border-[#111111]/30 transition-colors">
                  {preset.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#111111]">
                      {preset.name}
                    </span>
                    <Plus className="h-4 w-4 text-[#4b5563] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="mt-0.5 text-xs text-[#4b5563] line-clamp-1 leading-relaxed">
                    {preset.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1 text-xs text-[#4b5563]">
              <span className="font-semibold">按图层深度 (Layer) 排列</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={duplicateSelectedElements}
                  disabled={selectedElementIds.length === 0}
                  className="rounded p-1 hover:bg-[#f7f6f3] text-[#787774] hover:text-[#111111] disabled:opacity-30"
                  title="克隆选中控件"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={deleteSelectedElements}
                  disabled={selectedElementIds.length === 0}
                  className="rounded p-1 text-[#9f2f2d] hover:bg-[#fdebec] disabled:opacity-30"
                  title="删除选中控件"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {sortedElements.length === 0 ? (
              <div className="mt-8 text-center text-[#9b9a97] text-xs">
                暂无按键元素，请在控件库中添加
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
                        isSelected ? "bg-[#333333] text-[#ffffff]" : "bg-[#f7f6f3] text-[#787774]"
                      }`}>
                        L{el.element_layer}
                      </span>
                      <span className="truncate">{displayLabel}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${isSelected ? "text-slate-300" : "text-[#787774]"}`}>
                      {el.element_width}×{el.element_height}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
