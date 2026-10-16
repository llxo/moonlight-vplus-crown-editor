/**
 * @file LeftSidebar.tsx
 * @description 编辑器左侧边栏：控件预设库 (Palette) 与 图层大纲树 (Layers)
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
    icon: <CircleDot className="h-4 w-4 text-amber-400" />,
    desc: "单次按压触发，支持键鼠/手柄映射",
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
      element_thick: 4,
      element_layer: 50,
      element_color: -259495768,
      element_pressed_color: -268435201,
      element_background_color: 16777215,
      normalTextColor: -1,
      pressedTextColor: -3355444,
      textSizePercent: 25,
    }),
  },
  {
    type: CrownElementType.DIGITAL_SWITCH_BUTTON,
    name: "自锁开关",
    category: "button",
    icon: <ToggleLeft className="h-4 w-4 text-emerald-400" />,
    desc: "点击自锁保持，再次点击解锁",
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
      element_radius: 20,
      element_thick: 4,
      element_layer: 50,
      element_color: -16711936,
      element_pressed_color: -268435201,
      element_background_color: 0x3300ff00,
      normalTextColor: -1,
      pressedTextColor: -1,
      textSizePercent: 22,
    }),
  },
  {
    type: CrownElementType.DIGITAL_MOVABLE_BUTTON,
    name: "滑动视角按键",
    category: "button",
    icon: <Move className="h-4 w-4 text-cyan-400" />,
    desc: "按下时可划动控制鼠标/右摇杆视角",
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
      element_thick: 4,
      element_layer: 50,
      element_color: -16728065,
      element_pressed_color: -268435201,
      element_background_color: 0x2200ffff,
      normalTextColor: -1,
      pressedTextColor: -1,
      textSizePercent: 24,
      element_mode: 0,
      element_sense: 100,
      extra_attributes: JSON.stringify({ isTrackpadMode: false }),
    }),
  },
  {
    type: CrownElementType.DIGITAL_COMBINE_BUTTON,
    name: "宏组合键",
    category: "button",
    icon: <Sliders className="h-4 w-4 text-purple-400" />,
    desc: "最多同时触发 5 个按键的组合宏",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.DIGITAL_COMBINE_BUTTON,
      element_text: "COMB",
      element_value: "k113", // Ctrl
      element_up_value: "k29", // A
      element_down_value: "null",
      element_left_value: "null",
      element_right_value: "null",
      element_width: 130,
      element_height: 130,
      element_central_x: cx,
      element_central_y: cy,
      element_radius: 24,
      element_thick: 4,
      element_layer: 50,
      element_color: -65281,
      element_pressed_color: -268435201,
      element_background_color: 0x22ff00ff,
      normalTextColor: -1,
      pressedTextColor: -1,
      textSizePercent: 22,
    }),
  },
  {
    type: CrownElementType.GROUP_BUTTON,
    name: "抽屉组按键",
    category: "button",
    icon: <FolderOpen className="h-4 w-4 text-blue-400" />,
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
      element_thick: 4,
      element_layer: 50,
      element_color: -16744193,
      element_pressed_color: -268435201,
      element_background_color: 0x220088ff,
      normalTextColor: -1,
      pressedTextColor: -1,
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
    icon: <Compass className="h-4 w-4 text-yellow-400" />,
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
      element_thick: 4,
      element_layer: 48,
      element_color: -259495768,
      element_pressed_color: -268435201,
      element_background_color: -1438342076,
    }),
  },
  {
    type: CrownElementType.ANALOG_STICK,
    name: "模拟摇杆 (LS/RS)",
    category: "stick",
    icon: <Disc className="h-4 w-4 text-rose-400" />,
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
      element_thick: 4,
      element_layer: 46,
      element_color: -259495768,
      element_pressed_color: -268435201,
      element_background_color: -1438342076,
      element_sense: 30, // 30% 死区
      element_mode: CrownStickMoveMode.FIXED_ABSOLUTE,
    }),
  },
  {
    type: CrownElementType.WHEEL_PAD,
    name: "轮盘快捷菜单",
    category: "wheel",
    icon: <PieChart className="h-4 w-4 text-amber-500" />,
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
      element_thick: 5,
      element_layer: 42,
      element_color: -259495768,
      element_pressed_color: -268435201,
      element_background_color: -1438342076,
      element_mode: 8,
      element_sense: 30,
      element_flag1: 1,
      extra_attributes: JSON.stringify({
        normalTextColor: -1,
        pressedTextColor: -1,
        centerTextColor: -1,
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
    icon: <Activity className="h-4 w-4 text-emerald-400" />,
    desc: "悬浮状态栏：显示帧率、延迟与时间",
    createDefault: (cx, cy) => ({
      element_id: Date.now(),
      config_id: 1710000000000,
      element_type: CrownElementType.SIMPLIFY_PERFORMANCE,
      element_text: "FPS: ##帧率## | 延迟: ##网络延时##ms | HH:MM",
      element_width: 380,
      element_height: 60,
      element_central_x: cx,
      element_central_y: cy,
      element_radius: 12,
      element_thick: 20, // 字体大小
      element_layer: 55,
      element_color: -1, // 字体颜色白色
      element_pressed_color: -1,
      element_background_color: -1610612736, // 半透明深黑
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
    // 默认在画布几何中心生成
    const cx = Math.round(layoutBasis.widthPx / 2);
    const cy = Math.round(layoutBasis.heightPx / 2);
    const el = preset.createDefault(cx, cy);
    addElement(el);
  };

  const sortedElements = [...elements].sort((a, b) => b.element_layer - a.element_layer);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#242730] bg-[#14161b] text-xs select-none">
      {/* 选项卡切换头 */}
      <div className="flex border-b border-[#242730] bg-[#111216]">
        <button
          onClick={() => setActiveTabLeft("palette")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 font-medium transition-colors ${
            activeTabLeft === "palette"
              ? "border-b-2 border-amber-500 bg-[#16181f] text-amber-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Component className="h-3.5 w-3.5" />
          <span>控件库 ({PRESETS.length})</span>
        </button>
        <button
          onClick={() => setActiveTabLeft("layers")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 font-medium transition-colors ${
            activeTabLeft === "layers"
              ? "border-b-2 border-amber-500 bg-[#16181f] text-amber-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>图层 ({elements.length})</span>
        </button>
      </div>

      {/* 选项卡内容区 */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTabLeft === "palette" ? (
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-semibold tracking-wider text-slate-400 px-1">
              点击快速添加控件到画布
            </div>
            {PRESETS.map((preset) => (
              <div
                key={preset.type}
                onClick={() => handleAddPreset(preset)}
                className="group flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#242730] bg-[#1a1d24] p-2.5 transition-all hover:border-amber-500/50 hover:bg-[#20232c]"
              >
                <div className="mt-0.5 rounded bg-[#13151a] p-1.5 border border-[#2c303c] group-hover:border-amber-500/30">
                  {preset.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                      {preset.name}
                    </span>
                    <Plus className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">
                    {preset.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
              <span>按图层深度 (Layer) 排列</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={duplicateSelectedElements}
                  disabled={selectedElementIds.length === 0}
                  className="rounded p-1 hover:bg-[#252a35] disabled:opacity-30"
                  title="克隆选中控件"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={deleteSelectedElements}
                  disabled={selectedElementIds.length === 0}
                  className="rounded p-1 text-rose-400 hover:bg-[#252a35] disabled:opacity-30"
                  title="删除选中控件"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {sortedElements.length === 0 ? (
              <div className="mt-8 text-center text-slate-500">
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
                    className={`flex cursor-pointer items-center justify-between rounded border px-2.5 py-1.5 transition-colors ${
                      isSelected
                        ? "border-amber-500/80 bg-amber-500/10 text-amber-300 font-medium"
                        : "border-[#242730] bg-[#1a1d24] text-slate-300 hover:border-[#383d4c] hover:bg-[#20232c]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="rounded bg-[#121418] px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                        L{el.element_layer}
                      </span>
                      <span className="truncate">{displayLabel}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
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
