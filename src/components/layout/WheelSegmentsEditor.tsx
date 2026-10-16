/**
 * @file WheelSegmentsEditor.tsx
 * @description 轮盘菜单扇区结构化可视化编辑器：直观管理顺时针各扇区显示文本与按键绑定，彻底摆脱手写 k8|1,k9|2 协议编码
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState } from "react";
import { Code, List, HelpCircle } from "lucide-react";
import { KeyCodePicker } from "../common/KeyCodePicker";

interface WheelSegmentsEditorProps {
  mode: number;
  value: string;
  onChange: (newValue: string) => void;
}

interface SegmentItem {
  code: string;
  label: string;
}

export const WheelSegmentsEditor: React.FC<WheelSegmentsEditorProps> = ({
  mode,
  value,
  onChange,
}) => {
  const [isRawMode, setIsRawMode] = useState(false);

  const numSegments = Math.max(2, Math.min(16, mode || 8));

  // 解析当前原始字符串为扇区列表
  const rawParts = (value || "").split(",").map((p) => p.trim());
  const segments: SegmentItem[] = [];

  for (let i = 0; i < numSegments; i++) {
    const raw = rawParts[i] || "";
    const [c, l] = raw.split("|");
    const code = c || `k${8 + i}`;
    const label = l !== undefined ? l : `${i + 1}`;
    segments.push({ code, label });
  }

  const handleSegmentChange = (index: number, patch: Partial<SegmentItem>) => {
    const next = [...segments];
    next[index] = { ...next[index]!, ...patch };
    const serialized = next.map((s) => `${s.code || "null"}|${s.label}`).join(",");
    onChange(serialized);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-[#4b5563] block">
          顺时针扇区配置 ({numSegments} 扇区)
        </label>
        <button
          type="button"
          onClick={() => setIsRawMode(!isRawMode)}
          className="flex items-center gap-1 text-[10px] text-[#6b7280] hover:text-[#111111] transition-colors cursor-pointer"
        >
          {isRawMode ? (
            <>
              <List className="h-3 w-3" />
              <span>切换回可视化列表</span>
            </>
          ) : (
            <>
              <Code className="h-3 w-3" />
              <span>高级原始文本</span>
            </>
          )}
        </button>
      </div>

      {isRawMode ? (
        /* 高级原始文本直接编辑 */
        <div className="space-y-1">
          <textarea
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2 font-mono text-xs text-[#111111] outline-none focus:border-[#111111]"
            placeholder="k8|1,k9|2,k10|3,k11|4..."
          />
          <div className="flex items-center gap-1 text-[10px] text-[#888888]">
            <HelpCircle className="h-3 w-3" />
            <span>格式: 顺时针排列，以英文逗号分隔，每一项为 按键编码|表面名称</span>
          </div>
        </div>
      ) : (
        /* 结构化可视化列表 */
        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 rounded-lg border border-[#eaeaea] bg-[#ffffff] p-2 hover:border-[#111111]/30 transition-colors"
            >
              {/* 扇区序号 */}
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#f7f6f3] text-[10px] font-mono font-bold text-[#111111] border border-[#eaeaea]">
                {idx + 1}
              </div>

              {/* 扇区名称 */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={seg.label}
                  onChange={(e) => handleSegmentChange(idx, { label: e.target.value })}
                  placeholder={`扇区 ${idx + 1}`}
                  className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
                />
              </div>

              {/* 扇区按键绑定：复用 KeyCodePicker 弹窗 */}
              <div className="w-32 shrink-0">
                <KeyCodePicker
                  compact
                  value={seg.code}
                  onChange={(newCode) => handleSegmentChange(idx, { code: newCode })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
