/**
 * @file FloatingInspector.tsx
 * @description 右侧伴随悬浮属性卡片：仅在选中按键时轻量优雅浮现，提供几何微调、键位录制与颜色配置
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
  type CrownElement,
} from "../../crownSchema";
import { KeyCodePicker } from "../common/KeyCodePicker";
import { MacroCombineRecorder } from "../common/MacroCombineRecorder";
import { CrownColorPicker } from "../common/CrownColorPicker";
import { NumberField, TextField } from "../common/FormFields";
import { SpecialElementFields } from "./SpecialElementFields";

export const FloatingInspector: React.FC = () => {
  const {
    selectedElementIds,
    elements,
    updateElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    selectElement,
  } = useCrownStore();

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
      case CrownElementType.DIGITAL_COMBINE_BUTTON: return "组合键";
      case CrownElementType.GROUP_BUTTON: return "抽屉组按键";
      case CrownElementType.DIGITAL_PAD: return "十字方向键";
      case CrownElementType.ANALOG_STICK: return "模拟摇杆";
      case CrownElementType.DIGITAL_STICK: return "数字摇杆";
      case CrownElementType.WHEEL_PAD: return "轮盘快捷菜单";
      case CrownElementType.SIMPLIFY_PERFORMANCE: return "极简性能条";
      default: return `控件 #${type}`;
    }
  };

  const handleUpdate = (patch: Partial<CrownElement>) => {
    updateElement(selectedElement.element_id, patch);
  };

  return (
    <div className="absolute top-5 right-5 z-20 w-[320px] 2xl:w-[350px] max-h-[calc(100vh-90px)] overflow-y-auto rounded-2xl border border-[#eaeaea] bg-[#ffffff] p-4.5 2xl:p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-right-4 select-none space-y-4">
      {/* 头部摘要与操作 */}
      <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111111] text-[#ffffff]">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-[#111111]">
              {getTypeName(selectedElement.element_type)}
            </span>
            <span className="block text-xs font-mono text-[#888888]">
              ID: {selectedElement.element_id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={duplicateSelectedElements}
            className="rounded-lg p-1.5 text-[#4b5563] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors"
            title="克隆此按键"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={deleteSelectedElements}
            className="rounded-lg p-1.5 text-[#9f2f2d] hover:bg-[#fdebec] transition-colors"
            title="删除此按键"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => selectElement(null)}
            className="rounded-lg p-1.5 text-[#4b5563] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors ml-0.5"
            title="关闭浮窗"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* 核心按键绑定 */}
      {"element_value" in selectedElement &&
        selectedElement.element_type !== CrownElementType.WHEEL_PAD &&
        selectedElement.element_type !== CrownElementType.DIGITAL_COMBINE_BUTTON && (
          <div className="space-y-1">
            <KeyCodePicker
              label="按键绑定 (直接按下键盘按键录制)"
              value={selectedElement.element_value || ""}
              onChange={(newVal) => handleUpdate({ element_value: newVal } as any)}
            />
          </div>
        )}

      {/* 组合键专属录制器 */}
      {selectedElement.element_type === CrownElementType.DIGITAL_COMBINE_BUTTON && (
        <MacroCombineRecorder
          value={selectedElement.element_value}
          upValue={selectedElement.element_up_value}
          downValue={selectedElement.element_down_value}
          leftValue={selectedElement.element_left_value}
          rightValue={selectedElement.element_right_value}
          currentText={selectedElement.element_text}
          onChange={(slots) => handleUpdate(slots as any)}
        />
      )}

      {/* 表面标签文本 */}
      {"element_text" in selectedElement &&
        selectedElement.element_type !== CrownElementType.SIMPLIFY_PERFORMANCE &&
        selectedElement.element_type !== CrownElementType.DIGITAL_COMBINE_BUTTON && (
          <TextField
            label="表面文字 (Text)"
            value={selectedElement.element_text || ""}
            onChange={(val) => handleUpdate({ element_text: val } as any)}
            placeholder="按键表面显示文字"
          />
        )}

      {/* 几何尺寸与中心锚点 */}
      <div className="space-y-2 border-t border-[#eaeaea] pt-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
          {selectedElement.element_type === CrownElementType.WHEEL_PAD
            ? "轮盘几何与中心半径 (Px)"
            : selectedElement.element_type === CrownElementType.ANALOG_STICK ||
              selectedElement.element_type === CrownElementType.INVISIBLE_ANALOG_STICK ||
              selectedElement.element_type === CrownElementType.DIGITAL_STICK ||
              selectedElement.element_type === CrownElementType.INVISIBLE_DIGITAL_STICK
            ? "摇杆几何与死区半径 (Px)"
            : "按键尺寸与圆角 (Px)"}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="中心点 X"
            value={selectedElement.element_central_x}
            onChange={(val) => handleUpdate({ element_central_x: val })}
          />
          <NumberField
            label="中心点 Y"
            value={selectedElement.element_central_y}
            onChange={(val) => handleUpdate({ element_central_y: val })}
          />

          {selectedElement.element_type === CrownElementType.WHEEL_PAD ? (
            /* 轮盘 */
            <>
              <NumberField
                label="轮盘直径 (D)"
                min={60}
                value={selectedElement.element_width}
                onChange={(d) => handleUpdate({ element_width: d, element_height: d })}
              />
              <NumberField
                label="中心半径 (r)"
                min={5}
                max={Math.max(10, Math.round(selectedElement.element_width / 2 - 5))}
                badge={`${selectedElement.element_sense || 30}%`}
                value={Math.round((selectedElement.element_width / 2) * ((selectedElement.element_sense || 30) / 100))}
                onChange={(r) => {
                  const outerR = selectedElement.element_width / 2;
                  const newSense = Math.max(5, Math.min(85, Math.round((r / outerR) * 100)));
                  handleUpdate({ element_sense: newSense });
                }}
              />
            </>
          ) : selectedElement.element_type === CrownElementType.ANALOG_STICK ||
            selectedElement.element_type === CrownElementType.INVISIBLE_ANALOG_STICK ||
            selectedElement.element_type === CrownElementType.DIGITAL_STICK ||
            selectedElement.element_type === CrownElementType.INVISIBLE_DIGITAL_STICK ? (
            /* 摇杆 */
            <>
              <NumberField
                label="摇杆直径 (D)"
                min={80}
                value={selectedElement.element_width}
                onChange={(d) =>
                  handleUpdate({
                    element_width: d,
                    element_height: d,
                    element_radius: Math.round(d / 2),
                  } as any)
                }
              />
              <NumberField
                label="死区半径 (r)"
                min={0}
                max={Math.max(10, Math.round(selectedElement.element_width / 2 - 5))}
                badge={`${selectedElement.element_sense ?? 30}%`}
                value={Math.round((selectedElement.element_width / 2) * ((selectedElement.element_sense ?? 30) / 100))}
                onChange={(r) => {
                  const outerR = selectedElement.element_width / 2;
                  const newSense = Math.max(0, Math.min(80, Math.round((r / outerR) * 100)));
                  handleUpdate({ element_sense: newSense });
                }}
              />
            </>
          ) : (
            /* 普通矩形按键 */
            <>
              <NumberField
                label="宽度 W"
                min={20}
                value={selectedElement.element_width}
                onChange={(val) => handleUpdate({ element_width: val })}
              />
              <NumberField
                label="高度 H"
                min={20}
                value={selectedElement.element_height}
                onChange={(val) => handleUpdate({ element_height: val })}
              />

              {"element_radius" in selectedElement && (
                <>
                  <NumberField
                    className="col-span-2"
                    label="圆角 Radius (Px)"
                    min={0}
                    max={Math.round(Math.min(selectedElement.element_width, selectedElement.element_height) / 2)}
                    badge={
                      (selectedElement.element_radius ?? 16) === 0
                        ? "直角 (0px)"
                        : (selectedElement.element_radius ?? 16) >=
                          Math.round(Math.min(selectedElement.element_width, selectedElement.element_height) / 2)
                        ? "胶囊/全圆"
                        : `${selectedElement.element_radius ?? 16}px`
                    }
                    value={selectedElement.element_radius ?? 16}
                    onChange={(r) => handleUpdate({ element_radius: r } as any)}
                  />

                  {/* 快捷圆角预设 */}
                  <div className="col-span-2 flex items-center gap-1.5 pt-1 flex-wrap">
                    <span className="text-xs font-medium text-[#6b7280]">圆角:</span>
                    {[
                      { label: "直角 (0)", val: 0 },
                      { label: "微圆 (12)", val: 12 },
                      { label: "标准 (20)", val: 20 },
                      {
                        label: "全圆/胶囊",
                        val: Math.round(
                          Math.min(selectedElement.element_width, selectedElement.element_height) / 2
                        ),
                      },
                    ].map((preset) => {
                      const currentR = selectedElement.element_radius ?? 16;
                      const isActive = currentR === preset.val;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleUpdate({ element_radius: preset.val } as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono border transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#111111] text-white border-[#111111] shadow-2xs"
                              : "bg-[#fbfbfa] text-[#4b5563] border-[#eaeaea] hover:bg-[#f0f0ee] hover:text-[#111111]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          <NumberField
            label="图层 Layer"
            value={selectedElement.element_layer}
            onChange={(val) => handleUpdate({ element_layer: val })}
          />
          <NumberField
            label="描边 Thick"
            min={1}
            value={selectedElement.element_thick}
            onChange={(val) => handleUpdate({ element_thick: val })}
          />
        </div>
      </div>

      {/* 颜色样式设置 */}
      <div className="space-y-2.5 border-t border-[#eaeaea] pt-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#374151]">
          <Palette className="h-3.5 w-3.5 text-[#111111]" />
          <span>颜色与透明度</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CrownColorPicker
            label="描边颜色"
            intColor={selectedElement.element_color}
            onChange={(newInt) => handleUpdate({ element_color: newInt })}
          />
          <CrownColorPicker
            label="背景填充色"
            intColor={selectedElement.element_background_color}
            onChange={(newInt) => handleUpdate({ element_background_color: newInt })}
          />
        </div>
      </div>

      {/* 类型专属属性 (模拟摇杆、十字键、轮盘等) */}
      <SpecialElementFields element={selectedElement} onUpdate={handleUpdate} />
    </div>
  );
};
