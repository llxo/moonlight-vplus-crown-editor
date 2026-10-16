/**
 * @file FormFields.tsx
 * @description 属性面板通用表单原子组件：遵循 minimalist-ui 规范，统一现代圆角输入框容器、加粗大字号与聚焦微光环
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
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-[#374151]">{label}</label>
        {badge && <span className="text-xs font-mono font-medium text-[#6b7280]">{badge}</span>}
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
        className="w-full rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3 py-2 text-sm font-mono font-semibold text-[#111111] outline-none hover:border-[#d4d4d0] focus:border-[#111111] focus:bg-[#ffffff] focus:ring-1 focus:ring-[#111111]/10 transition-all"
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
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-semibold text-[#374151] block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3 py-2 text-sm font-semibold text-[#111111] outline-none hover:border-[#d4d4d0] focus:border-[#111111] focus:bg-[#ffffff] focus:ring-1 focus:ring-[#111111]/10 transition-all"
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
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-semibold text-[#374151]">
        <span>{label}</span>
        <span className="font-mono font-bold text-[#111111]">
          {displayValue !== undefined ? displayValue : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#111111] h-2 bg-[#eaeaea] rounded-lg cursor-pointer"
      />
    </div>
  );
};
