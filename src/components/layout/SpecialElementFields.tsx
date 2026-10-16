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
import { RangeField, NumberField } from "../common/FormFields";

interface SpecialElementFieldsProps {
  element: CrownElement;
  onUpdate: (patch: Partial<CrownElement>) => void;
}

export const SpecialElementFields: React.FC<SpecialElementFieldsProps> = ({
  element,
  onUpdate,
}) => {
  switch (element.element_type) {
    case CrownElementType.ANALOG_STICK: {
      return (
        <div className="space-y-3 border-t border-[#eaeaea] pt-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
            摇杆属性
          </div>
          <RangeField
            label="死区半径比例"
            value={element.element_sense}
            min={0}
            max={80}
            onChange={(val) => onUpdate({ element_sense: val } as any)}
          />
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
          <KeyCodePicker
            label="摇杆下压键 (L3/R3)"
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
          <div>
            <label className="text-xs font-medium text-[#4b5563] block mb-1">
              扇区键位与名称 (按顺时针，逗号分隔)
            </label>
            <textarea
              rows={2}
              value={element.element_value || ""}
              onChange={(e) => onUpdate({ element_value: e.target.value } as any)}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 font-mono text-xs text-[#111111] outline-none"
              placeholder="k8|1,k9|2,k10|3,k11|4"
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
