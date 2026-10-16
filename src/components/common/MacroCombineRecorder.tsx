/**
 * @file MacroCombineRecorder.tsx
 * @description 组合快捷键 (HotKey / Shortcut) 专属录制组件：支持物理键盘多键同时按下自动识别（如 Ctrl+C、Alt+Tab）、实体键帽串联展示与底层槽位透明对齐
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Keyboard,
  Trash2,
  Check,
  RotateCcw,
  Plus,
  Radio,
  Command,
} from "lucide-react";
import {
  getKeyHumanLabel,
  WEB_CODE_TO_ANDROID_KEY,
  GAMEPAD_ITEMS,
} from "../../utils/keyMapping";

interface MacroCombineRecorderProps {
  value: string;
  upValue: string;
  downValue: string;
  leftValue: string;
  rightValue: string;
  currentText?: string;
  onChange: (slots: {
    element_value: string;
    element_up_value: string;
    element_down_value: string;
    element_left_value: string;
    element_right_value: string;
    element_text?: string;
  }) => void;
}

export const MacroCombineRecorder: React.FC<MacroCombineRecorderProps> = ({
  value,
  upValue,
  downValue,
  leftValue,
  rightValue,
  currentText,
  onChange,
}) => {
  // 当前已保存的有效键值（最多 5 个）
  const savedKeys = [value, upValue, downValue, leftValue, rightValue].filter(
    (k) => k && k !== "null" && k.trim() !== ""
  );

  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const pressedCodesRef = useRef<Set<string>>(new Set());
  const [showAddMenu, setShowAddMenu] = useState(false);

  const startRecording = () => {
    pressedCodesRef.current.clear();
    setRecordedKeys([]);
    setIsRecording(true);
  };

  const finishRecording = (keysToSave = recordedKeys) => {
    setIsRecording(false);
    pressedCodesRef.current.clear();

    const slots = [
      keysToSave[0] || "null",
      keysToSave[1] || "null",
      keysToSave[2] || "null",
      keysToSave[3] || "null",
      keysToSave[4] || "null",
    ];

    // 智能更新按钮表面的显示文本，例如 "Ctrl+C" 或 "Alt+Tab"
    let newText = currentText;
    if (keysToSave.length > 0 && (!currentText || currentText === "COMB" || currentText === "BTN")) {
      newText = keysToSave
        .map((k) => {
          const info = getKeyHumanLabel(k);
          return info.label.split(" ")[0]?.replace(/[()]/g, "") || k;
        })
        .join("+");
    }

    onChange({
      element_value: slots[0]!,
      element_up_value: slots[1]!,
      element_down_value: slots[2]!,
      element_left_value: slots[3]!,
      element_right_value: slots[4]!,
      element_text: newText,
    });
  };

  // 键盘多键组合监听（如按下 Ctrl + C 时同时捕获两个键）
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const androidCode = WEB_CODE_TO_ANDROID_KEY[e.code];
      if (androidCode) {
        pressedCodesRef.current.add(e.code);
        setRecordedKeys((prev) => {
          if (prev.includes(androidCode)) return prev;
          if (prev.length >= 5) return prev;
          return [...prev, androidCode];
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedCodesRef.current.delete(e.code);
      // 当所有物理按键松开，并且已捕获按键时
      if (pressedCodesRef.current.size === 0) {
        setRecordedKeys((current) => {
          if (current.length > 0) {
            setTimeout(() => finishRecording(current), 80);
          }
          return current;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
    };
  }, [isRecording]);

  const handleRemoveKey = (index: number) => {
    const next = [...savedKeys];
    next.splice(index, 1);
    finishRecording(next);
  };

  const handleAppendKey = (code: string) => {
    if (savedKeys.length >= 5) {
      alert("组合键最多支持 5 个按键");
      return;
    }
    const next = [...savedKeys, code];
    finishRecording(next);
    setShowAddMenu(false);
  };

  const handleClearAll = () => {
    onChange({
      element_value: "null",
      element_up_value: "null",
      element_down_value: "null",
      element_left_value: "null",
      element_right_value: "null",
      element_text: "HOTKEY",
    });
  };

  return (
    <div className="space-y-3">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Command className="h-3.5 w-3.5 text-[#111111]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
            组合键 (Combine / HotKey)
          </span>
        </div>
        {savedKeys.length > 0 && !isRecording && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 text-[10px] text-[#9f2f2d] hover:underline"
          >
            <Trash2 className="h-3 w-3" />
            <span>清空</span>
          </button>
        )}
      </div>

      {/* 录制触发框 */}
      <div className="space-y-2">
        {isRecording ? (
          <div className="rounded-lg border-2 border-[#111111] bg-[#fbf3db] p-3 space-y-2.5 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111]">
                <Radio className="h-4 w-4 text-[#956400] animate-bounce" />
                <span>请在键盘上按下组合键（例如 Ctrl + C）...</span>
              </div>
            </div>

            {/* 实时录入按键展示 */}
            <div className="min-h-10 rounded border border-[#eaeaea] bg-[#ffffff] p-2 flex items-center gap-1.5 flex-wrap">
              {recordedKeys.length === 0 ? (
                <span className="text-[11px] text-[#787774] italic">
                  等待键盘按键（可同时按下修饰键 + 字母键）...
                </span>
              ) : (
                recordedKeys.map((k, idx) => {
                  const info = getKeyHumanLabel(k);
                  return (
                    <React.Fragment key={k}>
                      {idx > 0 && <span className="font-bold text-[#111111]">+</span>}
                      <kbd className="bg-[#111111] text-[#ffffff] border-0 px-2 py-1 font-mono text-xs">
                        {info.label}
                      </kbd>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setRecordedKeys([])}
                className="flex items-center gap-1 rounded border border-[#eaeaea] bg-[#ffffff] px-2 py-1 text-[11px] text-[#2f3437] hover:bg-[#f7f6f3]"
              >
                <RotateCcw className="h-3 w-3" />
                <span>重按</span>
              </button>
              <button
                type="button"
                onClick={() => finishRecording()}
                disabled={recordedKeys.length === 0}
                className="flex items-center gap-1.5 rounded bg-[#111111] px-3 py-1 font-medium text-xs text-[#ffffff] hover:bg-[#2b2b2b] disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>完成录制</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#111111] bg-[#fbfbfa] py-2.5 text-xs font-semibold text-[#111111] transition-all hover:bg-[#111111] hover:text-[#ffffff] group"
          >
            <Keyboard className="h-4 w-4" />
            <span>点击录制组合键 (按下键盘组合键)</span>
          </button>
        )}
      </div>

      {/* 已生效的组合键 (单行键帽串联展示) */}
      {!isRecording && (
        <div className="space-y-1.5">
          {savedKeys.length === 0 ? (
            <div className="rounded border border-dashed border-[#eaeaea] bg-[#fbfbfa] py-2.5 text-center text-[11px] text-[#9b9a97]">
              暂未绑定组合键，点击上方按钮直接按下键盘组合键
            </div>
          ) : (
            <div className="rounded-lg border border-[#eaeaea] bg-[#ffffff] p-2.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {savedKeys.map((k, idx) => {
                  const info = getKeyHumanLabel(k);
                  return (
                    <React.Fragment key={`${k}-${idx}`}>
                      {idx > 0 && <span className="font-bold text-[#787774] text-xs">+</span>}
                      <div className="group flex items-center gap-1 bg-[#f7f6f3] border border-[#eaeaea] rounded px-2 py-1">
                        <span className="font-mono text-xs font-bold text-[#111111]">
                          {info.label.split(" ")[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKey(idx)}
                          className="text-[#9b9a97] hover:text-[#9f2f2d] ml-0.5"
                          title="删除该按键"
                        >
                          ×
                        </button>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={startRecording}
                className="text-[10px] font-medium text-[#111111] hover:underline whitespace-nowrap ml-2"
              >
                重新录制
              </button>
            </div>
          )}
        </div>
      )}

      {/* 备选：手柄组合键追加 */}
      {!isRecording && savedKeys.length < 5 && (
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 text-[10px] font-medium text-[#787774] hover:text-[#111111]"
          >
            <Plus className="h-3 w-3" />
            <span>追加手柄组合按键 (如 LB + A)</span>
          </button>

          {showAddMenu && (
            <div className="mt-2 rounded-lg border border-[#eaeaea] bg-[#ffffff] p-2 shadow-xs space-y-1.5">
              <div className="text-[10px] font-semibold text-[#787774]">
                点击手柄键追加至组合序列：
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {GAMEPAD_ITEMS.slice(0, 10).map((g) => (
                  <button
                    key={g.code}
                    type="button"
                    onClick={() => handleAppendKey(g.code)}
                    className="rounded border border-[#eaeaea] bg-[#f7f6f3] px-2 py-0.5 text-[10px] font-medium text-[#2f3437] hover:bg-[#111111] hover:text-[#ffffff] transition-colors"
                  >
                    {g.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
