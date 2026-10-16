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

      const webCode = e.code;
      pressedCodesRef.current.add(webCode);

      // 将当前同时按下的物理键转换为 Android Keycode
      const currentAndroidKeys: string[] = [];
      pressedCodesRef.current.forEach((code) => {
        const androidCode = WEB_CODE_TO_ANDROID_KEY[code];
        if (androidCode && !currentAndroidKeys.includes(androidCode)) {
          currentAndroidKeys.push(androidCode);
        }
      });

      if (currentAndroidKeys.length > 0) {
        setRecordedKeys(currentAndroidKeys.slice(0, 5));
      }
    };

    const handleKeyUp = () => {
      // 只要有一把按键抬起，且已经录制到了有效按键，立即自动完成当前组合识别
      if (pressedCodesRef.current.size > 0 && recordedKeys.length > 0) {
        finishRecording(recordedKeys);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
    };
  }, [isRecording, recordedKeys]);

  // 手动移除单项按键
  const handleRemoveKey = (indexToRemove: number) => {
    const nextKeys = savedKeys.filter((_, idx) => idx !== indexToRemove);
    finishRecording(nextKeys);
  };

  // 手动追加手柄按键
  const handleAppendKey = (gamepadKey: string) => {
    if (savedKeys.length >= 5) {
      alert("组合键最多支持绑定 5 个按键");
      return;
    }
    const nextKeys = [...savedKeys, gamepadKey];
    finishRecording(nextKeys);
    setShowAddMenu(false);
  };

  // 清空全部组合键
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
        <div className="flex items-center gap-2">
          <Command className="h-4 w-4 text-[#111111]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#374151]">
            组合键配置
          </span>
        </div>
        {savedKeys.length > 0 && !isRecording && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs font-medium text-[#9f2f2d] hover:underline cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>清空</span>
          </button>
        )}
      </div>

      {/* 录制触发框 */}
      <div className="space-y-2">
        {isRecording ? (
          <div className="rounded-xl border-2 border-[#111111] bg-[#fbf3db] p-3.5 space-y-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
                <Radio className="h-4.5 w-4.5 text-[#956400] animate-bounce" />
                <span>请在键盘上按下组合键（如 Ctrl + C）...</span>
              </div>
            </div>

            {/* 实时录入按键展示 */}
            <div className="min-h-12 rounded-lg border border-[#eaeaea] bg-[#ffffff] p-2.5 flex items-center gap-2 flex-wrap">
              {recordedKeys.length === 0 ? (
                <span className="text-xs text-[#787774] italic">
                  等待键盘按键（可同时按下修饰键 + 字母键）...
                </span>
              ) : (
                recordedKeys.map((k, idx) => {
                  const info = getKeyHumanLabel(k);
                  return (
                    <React.Fragment key={k}>
                      {idx > 0 && <span className="font-bold text-[#111111] text-sm">+</span>}
                      <kbd className="bg-[#111111] text-[#ffffff] rounded-md px-2.5 py-1 font-mono text-sm font-bold">
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
                className="flex items-center gap-1 rounded-lg border border-[#eaeaea] bg-[#ffffff] px-2.5 py-1 text-xs text-[#2f3437] hover:bg-[#f7f6f3]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>重按</span>
              </button>
              <button
                type="button"
                onClick={() => finishRecording()}
                disabled={recordedKeys.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-[#111111] px-3.5 py-1.5 font-semibold text-xs text-[#ffffff] hover:bg-[#2b2b2b] disabled:opacity-40"
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
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-[#111111] bg-[#fbfbfa] py-3 text-sm font-semibold text-[#111111] transition-all hover:bg-[#111111] hover:text-[#ffffff] group cursor-pointer shadow-2xs"
          >
            <Keyboard className="h-4.5 w-4.5" />
            <span>点击录制键盘组合键</span>
          </button>
        )}
      </div>

      {/* 已生效的组合键 (单行键帽串联展示) */}
      {!isRecording && (
        <div className="space-y-1.5">
          {savedKeys.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#eaeaea] bg-[#fbfbfa] py-3 text-center text-xs text-[#9b9a97]">
              暂未绑定组合键，点击上方录制
            </div>
          ) : (
            <div className="rounded-xl border border-[#eaeaea] bg-[#ffffff] p-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 flex-wrap">
                {savedKeys.map((k, idx) => {
                  const info = getKeyHumanLabel(k);
                  return (
                    <React.Fragment key={`${k}-${idx}`}>
                      {idx > 0 && <span className="font-bold text-[#787774] text-sm">+</span>}
                      <div className="group flex items-center gap-1.5 bg-[#fbfbfa] border border-[#dcdbd8] rounded-lg px-2.5 py-1.5 shadow-2xs">
                        <span className="font-mono text-sm font-bold text-[#111111]">
                          {info.label.split(" ")[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKey(idx)}
                          className="text-[#999999] hover:text-[#9f2f2d] text-base leading-none font-bold cursor-pointer"
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
                className="text-xs font-semibold text-[#111111] hover:underline whitespace-nowrap ml-3 cursor-pointer"
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
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4b5563] hover:text-[#111111] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>追加手柄按键 (如 LB + A)</span>
          </button>

          {showAddMenu && (
            <div className="mt-2 rounded-xl border border-[#eaeaea] bg-[#ffffff] p-3 shadow-2xs space-y-2">
              <div className="text-xs font-semibold text-[#6b7280]">
                点击手柄键追加至组合序列：
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {GAMEPAD_ITEMS.slice(0, 10).map((g) => (
                  <button
                    key={g.code}
                    type="button"
                    onClick={() => handleAppendKey(g.code)}
                    className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-2.5 py-1 text-xs font-semibold text-[#111111] hover:bg-[#111111] hover:text-[#ffffff] transition-colors cursor-pointer"
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
