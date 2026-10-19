/**
 * @file SpecialElementFields.tsx
 * @description 控件专属属性配置面板：包括模拟摇杆死区与模式、十字方向键四向绑定、轮盘菜单扇区配置
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React from "react";
import {
  CrownElementType,
  CrownStickMoveMode,
  type CrownElement,
} from "../../crownSchema";
import { KeyCodePicker } from "../common/KeyCodePicker";
import { RangeField, NumberField, TextField } from "../common/FormFields";
import { WheelSegmentsEditor } from "./WheelSegmentsEditor";

interface SpecialElementFieldsProps {
  element: CrownElement;
  onUpdate: (patch: Partial<CrownElement>) => void;
}

export const SpecialElementFields: React.FC<SpecialElementFieldsProps> = ({
  element,
  onUpdate,
}) => {
  switch (element.element_type) {
    case CrownElementType.DIGITAL_MOVABLE_BUTTON: {
      return (
        <div className="space-y-3 border-t border-[#eaeaea] pt-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
            滑动视角属性
          </div>
          <RangeField
            label="视角滑动灵敏度"
            value={element.element_sense ?? 100}
            min={0}
            max={500}
            step={1}
            displayValue={element.element_sense ?? 100}
            onChange={(val) => onUpdate({ element_sense: val } as any)}
          />
        </div>
      );
    }

    case CrownElementType.ANALOG_STICK:
    case CrownElementType.INVISIBLE_ANALOG_STICK: {
      const isInvisible = element.element_type === CrownElementType.INVISIBLE_ANALOG_STICK;
      return (
        <div className="space-y-3 border-t border-[#eaeaea] pt-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#374151] flex items-center justify-between">
            <span>{isInvisible ? "隐形模拟摇杆属性" : "模拟摇杆属性"}</span>
            <span className="text-[10px] font-mono text-[#6b7280]">
              {isInvisible ? "Type 32" : "Type 30"}
            </span>
          </div>

          {/* 隐形摇杆模式开关 (勾选即为隐形版) */}
          <div className="flex items-center justify-between rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2.5">
            <div>
              <span className="text-xs font-semibold text-[#111111] block">全区隐形摇杆模式</span>
              <span className="text-[10px] text-[#6b7280] block">常态隐藏，适合全屏滑动</span>
            </div>
            <input
              type="checkbox"
              checked={isInvisible}
              onChange={(e) => {
                const checked = e.target.checked;
                onUpdate({
                  element_type: checked
                    ? CrownElementType.INVISIBLE_ANALOG_STICK
                    : CrownElementType.ANALOG_STICK,
                  element_layer: checked ? 45 : 46,
                } as any);
              }}
              className="h-4 w-4 rounded accent-[#111111] cursor-pointer"
            />
          </div>

          {/* 左/右摇杆标识切换 */}
          <div>
            <label className="text-xs font-medium text-[#4b5563] block mb-1">摇杆标识</label>
            <div className="grid grid-cols-2 gap-2">
              {["LS", "RS"].map((id) => {
                const isCur = ("element_value" in element && element.element_value === id) || (!("element_value" in element) && id === "LS");
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onUpdate({ element_value: id, element_middle_value: id === "LS" ? "g64" : "g128" } as any)}
                    className={`py-1 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                      isCur
                        ? "bg-[#111111] text-[#ffffff] border-[#111111] shadow-2xs"
                        : "bg-[#fbfbfa] text-[#4b5563] border-[#eaeaea] hover:bg-[#f0f0ee]"
                    }`}
                  >
                    {id === "LS" ? "左摇杆 (LS)" : "右摇杆 (RS)"}
                  </button>
                );
              })}
            </div>
          </div>

          <RangeField
            label="死区半径比例"
            value={element.element_sense}
            min={0}
            max={80}
            onChange={(val) => onUpdate({ element_sense: val } as any)}
          />

          {"element_mode" in element && typeof element.element_mode === "number" && (
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
          )}

          <KeyCodePicker
            label="摇杆下压键 (L3/R3)"
            value={element.element_middle_value || "g64"}
            onChange={(val) => onUpdate({ element_middle_value: val } as any)}
          />
        </div>
      );
    }

    case CrownElementType.DIGITAL_STICK:
    case CrownElementType.INVISIBLE_DIGITAL_STICK: {
      const isInvisible = element.element_type === CrownElementType.INVISIBLE_DIGITAL_STICK;
      return (
        <div className="space-y-3 border-t border-[#eaeaea] pt-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#374151] flex items-center justify-between">
            <span>{isInvisible ? "隐形数字摇杆属性" : "数字摇杆属性"}</span>
            <span className="text-[10px] font-mono text-[#6b7280]">
              {isInvisible ? "Type 33" : "Type 31"}
            </span>
          </div>

          {/* 隐形数字摇杆模式开关 (勾选即为隐形版) */}
          <div className="flex items-center justify-between rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2.5">
            <div>
              <span className="text-xs font-semibold text-[#111111] block">全区隐形数字摇杆模式</span>
              <span className="text-[10px] text-[#6b7280] block">常态隐藏，适合全屏滑动四向离散</span>
            </div>
            <input
              type="checkbox"
              checked={isInvisible}
              onChange={(e) => {
                const checked = e.target.checked;
                onUpdate({
                  element_type: checked
                    ? CrownElementType.INVISIBLE_DIGITAL_STICK
                    : CrownElementType.DIGITAL_STICK,
                  element_layer: checked ? 45 : 46,
                } as any);
              }}
              className="h-4 w-4 rounded accent-[#111111] cursor-pointer"
            />
          </div>

          <RangeField
            label="死区半径比例"
            value={element.element_sense}
            min={0}
            max={80}
            onChange={(val) => onUpdate({ element_sense: val } as any)}
          />
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
          <KeyCodePicker
            label="中心下压键"
            value={element.element_middle_value || "g64"}
            onChange={(val) => onUpdate({ element_middle_value: val } as any)}
          />
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

    case CrownElementType.GROUP_BUTTON:
      // 组按键子控件绑定及抽屉展开行为已由 FloatingInspector 核心区域的 GroupButtonWidgetManager 统一管理
      return null;

    case CrownElementType.SIMPLIFY_PERFORMANCE: {
      const templatePresets = [
        { label: "帧率", val: "##帧率##" },
        { label: "网络延时", val: "##网络延时##ms" },
        { label: "主机延时", val: "##主机延时##ms" },
        { label: "丢帧率", val: "##丢帧率##" },
        { label: "带宽", val: "##带宽##" },
        { label: "时间", val: "HH:MM:SS" },
      ];

      const appendToken = (token: string) => {
        const cur = element.element_text || "";
        const next = cur ? `${cur} | ${token}` : token;
        onUpdate({ element_text: next } as any);
      };

      return (
        <div className="space-y-3 border-t border-[#eaeaea] pt-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
            性能监控参数配置
          </div>
          <RangeField
            label="字号大小 (Thick)"
            value={element.element_thick || 24}
            min={12}
            max={60}
            step={1}
            displayValue={`${element.element_thick || 24}px`}
            onChange={(val) => onUpdate({ element_thick: val } as any)}
          />
          <TextField
            label="监控模板格式文本"
            value={element.element_text || ""}
            onChange={(val) => onUpdate({ element_text: val } as any)}
            placeholder="FPS: ##帧率## | 延迟: ##网络延时##ms"
          />
          <div>
            <span className="text-[11px] font-medium text-[#6b7280] block mb-1">
              点击快速插入占位符变量:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {templatePresets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => appendToken(p.val)}
                  className="rounded-md border border-[#eaeaea] bg-[#fbfbfa] px-2 py-0.5 text-xs font-mono text-[#374151] hover:bg-[#f0f0ee] hover:text-[#111111] transition-colors"
                >
                  +{p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case CrownElementType.WHEEL_PAD: {
      return (
        <div className="space-y-3 border-t border-[#eaeaea] pt-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
            轮盘扇区配置
          </div>
          <NumberField
            label="扇区数量 (Mode)"
            value={element.element_mode || 8}
            min={2}
            max={16}
            badge={`${element.element_mode || 8} 扇区`}
            onChange={(val) => onUpdate({ element_mode: val } as any)}
          />
          <WheelSegmentsEditor
            mode={element.element_mode || 8}
            value={element.element_value || ""}
            onChange={(newVal) => onUpdate({ element_value: newVal } as any)}
          />
        </div>
      );
    }

    default:
      return null;
  }
};
