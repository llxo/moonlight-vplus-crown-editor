/**
 * @file FormFields.tsx
 * @description 属性面板通用表单原子组件：遵循 minimalist-ui 规范，统一输入框容器、标签与聚焦样式
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React from "react";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  badge?: string;
  className?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  badge,
  className = "",
}) => {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium text-[#4b5563]">{label}</label>
        {badge && <span className="text-[10px] font-mono text-[#888888]">{badge}</span>}
      </div>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const num = Number(e.target.value);
          let clamped = num;
          if (min !== undefined) clamped = Math.max(min, clamped);
          if (max !== undefined) clamped = Math.min(max, clamped);
          onChange(clamped);
        }}
        className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
      />
    </div>
  );
};

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-xs font-semibold text-[#374151] block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-[#eaeaea] bg-[#fbfbfa] px-2.5 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
      />
    </div>
  );
};

interface RangeFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  displayValue?: string | number;
}

export const RangeField: React.FC<RangeFieldProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  displayValue,
}) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[#4b5563]">
        <span>{label}</span>
        <span className="font-mono text-[#111111] font-semibold">
          {displayValue ?? `${value}%`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#111111]"
      />
    </div>
  );
};
