/**
 * @file FloatingInspector.tsx
 * @description 右侧伴随悬浮属性卡片：仅在选中按键时轻量优雅浮现，提供极简几何微调、直接键位录制与颜色配置
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React from "react";
import {
  Palette,
  Trash2,
  Copy,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useCrownStore } from "../../store/useCrownStore";
import {
  CrownElementType,
  CrownStickMoveMode,
  type CrownElement,
} from "../../crownSchema";
import { KeyCodePicker } from "../common/KeyCodePicker";
import { MacroCombineRecorder } from "../common/MacroCombineRecorder";
import { CrownColorPicker } from "../common/CrownColorPicker";

export const FloatingInspector: React.FC = () => {
  const {
    selectedElementIds,
    elements,
    updateElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    selectElement,
  } = useCrownStore();

  // 若未选中任何按键，完全不渲染，释放整个屏幕视野
  if (selectedElementIds.length === 0) {
    return null;
  }

  const selectedElement =
    selectedElementIds.length === 1
      ? elements.find((el) => el.element_id === selectedElementIds[0])
      : null;

  if (!selectedElement) {
    return null;
  }

  const getTypeName = (type: CrownElementType) => {
    switch (type) {
      case CrownElementType.DIGITAL_COMMON_BUTTON: return "普通按键";
      case CrownElementType.DIGITAL_SWITCH_BUTTON: return "自锁开关";
      case CrownElementType.DIGITAL_MOVABLE_BUTTON: return "滑动视角";
      case CrownElementType.DIGITAL_COMBINE_BUTTON: return "组合快捷键";
      case CrownElementType.GROUP_BUTTON: return "抽屉组按键";
      case CrownElementType.DIGITAL_PAD: return "十字方向键";
      case CrownElementType.ANALOG_STICK: return "模拟摇杆";
      case CrownElementType.DIGITAL_STICK: return "数字摇杆";
      case CrownElementType.WHEEL_PAD: return "轮盘快捷菜单";
      case CrownElementType.SIMPLIFY_PERFORMANCE: return "极简性能条";
      default: return `控件 #${type}`;
    }
  };

  return (
    <div className="absolute top-5 right-5 z-20 w-80 max-h-[calc(100vh-90px)] overflow-y-auto rounded-2xl border border-[#eaeaea] bg-[#ffffff] p-4 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-right-4 select-none space-y-4">
      {/* 头部摘要与关闭 */}
      <div className="flex items-center justify-between border-b border-[#eaeaea] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#111111] text-[#ffffff]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-bold text-xs text-[#111111]">
              {getTypeName(selectedElement.element_type)}
            </span>
            <span className="block text-[10px] font-mono text-[#6b7280]">
              ID: {selectedElement.element_id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={duplicateSelectedElements}
            className="rounded p-1 text-[#4b5563] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors"
            title="克隆此按键"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={deleteSelectedElements}
            className="rounded p-1 text-[#9f2f2d] hover:bg-[#fdebec] transition-colors"
            title="删除此按键"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => selectElement(null)}
            className="rounded p-1 text-[#4b5563] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors ml-0.5"
            title="关闭浮窗"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 核心按键绑定 (单键或快捷键) */}
      {"element_value" in selectedElement &&
        selectedElement.element_type !== CrownElementType.WHEEL_PAD &&
        selectedElement.element_type !== CrownElementType.DIGITAL_COMBINE_BUTTON && (
          <div className="space-y-1">
            <KeyCodePicker
              label="按键绑定 (直接按下键盘按键录制)"
              value={selectedElement.element_value || ""}
              onChange={(newVal) => updateElement(selectedElement.element_id, { element_value: newVal } as any)}
            />
          </div>
        )}

      {/* 组合快捷键专属录制器 */}
      {selectedElement.element_type === CrownElementType.DIGITAL_COMBINE_BUTTON && (
        <MacroCombineRecorder
          value={selectedElement.element_value}
          upValue={selectedElement.element_up_value}
          downValue={selectedElement.element_down_value}
          leftValue={selectedElement.element_left_value}
          rightValue={selectedElement.element_right_value}
          currentText={selectedElement.element_text}
          onChange={(slots) => updateElement(selectedElement.element_id, slots as any)}
        />
      )}

      {/* 表面标签文本 */}
      {"element_text" in selectedElement &&
        selectedElement.element_type !== CrownElementType.SIMPLIFY_PERFORMANCE &&
        selectedElement.element_type !== CrownElementType.DIGITAL_COMBINE_BUTTON && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#374151] block">表面文字 (Text)</label>
            <input
              type="text"
              value={selectedElement.element_text || ""}
              onChange={(e) => updateElement(selectedElement.element_id, { element_text: e.target.value } as any)}
              className="w-full rounded-md border border-[#eaeaea] bg-[#fbfbfa] px-2.5 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
              placeholder="按键表面显示文字"
            />
          </div>
        )}

      {/* 几何尺寸与中心锚点 */}
      <div className="space-y-2 border-t border-[#eaeaea] pt-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
          几何位置与尺寸 (Px)
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-[#4b5563] block mb-1">中心点 X</label>
            <input
              type="number"
              value={selectedElement.element_central_x}
              onChange={(e) => updateElement(selectedElement.element_id, { element_central_x: Number(e.target.value) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#4b5563] block mb-1">中心点 Y</label>
            <input
              type="number"
              value={selectedElement.element_central_y}
              onChange={(e) => updateElement(selectedElement.element_id, { element_central_y: Number(e.target.value) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#4b5563] block mb-1">宽度 W</label>
            <input
              type="number"
              value={selectedElement.element_width}
              onChange={(e) => updateElement(selectedElement.element_id, { element_width: Math.max(20, Number(e.target.value)) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#4b5563] block mb-1">高度 H</label>
            <input
              type="number"
              value={selectedElement.element_height}
              onChange={(e) => updateElement(selectedElement.element_id, { element_height: Math.max(20, Number(e.target.value)) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#4b5563] block mb-1">图层 Layer</label>
            <input
              type="number"
              value={selectedElement.element_layer}
              onChange={(e) => updateElement(selectedElement.element_id, { element_layer: Number(e.target.value) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#4b5563] block mb-1">描边 Thick</label>
            <input
              type="number"
              value={selectedElement.element_thick}
              onChange={(e) => updateElement(selectedElement.element_id, { element_thick: Math.max(1, Number(e.target.value)) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
        </div>
      </div>

      {/* 颜色样式设置 (CrownColorPicker 替换原生丑陋直角弹窗) */}
      <div className="space-y-2.5 border-t border-[#eaeaea] pt-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#374151]">
          <Palette className="h-3.5 w-3.5 text-[#111111]" />
          <span>颜色与透明度</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CrownColorPicker
            label="描边颜色"
            intColor={selectedElement.element_color}
            onChange={(newInt) => updateElement(selectedElement.element_id, { element_color: newInt })}
          />
          <CrownColorPicker
            label="背景填充色"
            intColor={selectedElement.element_background_color}
            onChange={(newInt) => updateElement(selectedElement.element_id, { element_background_color: newInt })}
          />
        </div>
      </div>

      {/* 类型专属属性 (模拟摇杆、十字键等) */}
      {renderSpecialTypeFields(selectedElement, (patch) => updateElement(selectedElement.element_id, patch))}
    </div>
  );
};

function renderSpecialTypeFields(
  element: CrownElement,
  onUpdate: (patch: Partial<CrownElement>) => void
) {
  switch (element.element_type) {
    case CrownElementType.ANALOG_STICK: {
      return (
        <div className="space-y-3 border-t border-[#eaeaea] pt-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
            摇杆属性
          </div>
          <div>
            <div className="flex justify-between text-xs text-[#4b5563] mb-1">
              <span>死区半径比例</span>
              <span className="font-mono text-[#111111] font-semibold">{element.element_sense}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={element.element_sense}
              onChange={(e) => onUpdate({ element_sense: Number(e.target.value) } as any)}
              className="w-full accent-[#111111]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#4b5563] block mb-1">摇杆移动模式</label>
            <select
              value={element.element_mode}
              onChange={(e) => onUpdate({ element_mode: Number(e.target.value) } as any)}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none"
            >
              <option value={CrownStickMoveMode.FIXED_ABSOLUTE}>绝对固定位置</option>
              <option value={CrownStickMoveMode.FOLLOW_FINGER_RELATIVE}>随手指按下动态居中</option>
            </select>
          </div>
          <div>
            <KeyCodePicker
              label="摇杆下压键 (L3/R3)"
              value={element.element_middle_value || "g64"}
              onChange={(val) => onUpdate({ element_middle_value: val } as any)}
            />
          </div>
        </div>
      );
    }

    case CrownElementType.DIGITAL_PAD: {
      return (
        <div className="space-y-2.5 border-t border-[#eaeaea] pt-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
            十字键四向绑定
          </div>
          <div className="grid grid-cols-2 gap-2">
            <KeyCodePicker
              label="上 (UP)"
              value={element.element_up_value}
              onChange={(val) => onUpdate({ element_up_value: val } as any)}
            />
            <KeyCodePicker
              label="下 (DOWN)"
              value={element.element_down_value}
              onChange={(val) => onUpdate({ element_down_value: val } as any)}
            />
            <KeyCodePicker
              label="左 (LEFT)"
              value={element.element_left_value}
              onChange={(val) => onUpdate({ element_left_value: val } as any)}
            />
            <KeyCodePicker
              label="右 (RIGHT)"
              value={element.element_right_value}
              onChange={(val) => onUpdate({ element_right_value: val } as any)}
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
