/**
 * @file KeyCodePicker.tsx
 * @description 多设备按键选择器：遵循 minimalist-ui 规范，采用纯净浅色界面、实体按键质感与柔彩分类系统
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Keyboard,
  Gamepad2,
  Mouse,
  Zap,
  Edit3,
  Check,
} from "lucide-react";
import {
  getKeyHumanLabel,
  WEB_CODE_TO_ANDROID_KEY,
  GAMEPAD_ITEMS,
  MOUSE_ITEMS,
  SPECIAL_ACTION_ITEMS,
  KEYBOARD_LABEL_MAP,
  type KeyCategory,
} from "../../utils/keyMapping";

interface KeyCodePickerProps {
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
}

export const KeyCodePicker: React.FC<KeyCodePickerProps> = ({
  value,
  onChange,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = getKeyHumanLabel(value);
  const [activeTab, setActiveTab] = useState<KeyCategory>(
    info.category === "unknown" ? "keyboard" : info.category
  );
  const [isRecordingKeyboard, setIsRecordingKeyboard] = useState(false);
  const recordingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      const currentInfo = getKeyHumanLabel(value);
      if (currentInfo.category !== "unknown") {
        setActiveTab(currentInfo.category);
      }
    }
  }, [value, isOpen]);

  // 键盘物理输入录制监听
  useEffect(() => {
    if (!isRecordingKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const androidCode = WEB_CODE_TO_ANDROID_KEY[e.code];
      if (androidCode) {
        onChange(androidCode);
        setIsRecordingKeyboard(false);
      } else {
        if (e.key.length === 1 && e.key >= "a" && e.key <= "z") {
          const upper = `Key${e.key.toUpperCase()}`;
          const fallback = WEB_CODE_TO_ANDROID_KEY[upper];
          if (fallback) {
            onChange(fallback);
            setIsRecordingKeyboard(false);
            return;
          }
        }
        alert(`未识别的按键 [${e.code || e.key}]，请在下方按键网格中手动选择`);
        setIsRecordingKeyboard(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isRecordingKeyboard, onChange]);

  const getCategoryIcon = (category: KeyCategory) => {
    switch (category) {
      case "keyboard":
        return <Keyboard className="h-3.5 w-3.5 text-[#1f6c9f]" />;
      case "gamepad":
        return <Gamepad2 className="h-3.5 w-3.5 text-[#956400]" />;
      case "mouse":
        return <Mouse className="h-3.5 w-3.5 text-[#346538]" />;
      case "special":
        return <Zap className="h-3.5 w-3.5 text-[#5c3e75]" />;
      default:
        return <Edit3 className="h-3.5 w-3.5 text-[#787774]" />;
    }
  };

  return (
    <div className="space-y-1">
      {label && <label className="text-[10px] text-[#787774] block font-medium">{label}</label>}

      {/* 键值预览与修改触发框 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex cursor-pointer items-center justify-between rounded-md border px-2.5 py-1.5 transition-all ${
          isOpen
            ? "border-[#111111] bg-[#ffffff] ring-1 ring-[#111111]/20"
            : "border-[#eaeaea] bg-[#ffffff] hover:border-[#111111]/40 hover:bg-[#fbfbfa]"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <div className="rounded bg-[#f7f6f3] p-1 border border-[#eaeaea]">
            {getCategoryIcon(info.category)}
          </div>
          <span className="font-medium text-xs text-[#111111] truncate">
            {info.label}
          </span>
        </div>
        <kbd className="font-mono text-[10px] bg-[#f7f6f3] text-[#2f3437] px-1.5 py-0.5 rounded border border-[#eaeaea]">
          {value || "null"}
        </kbd>
      </div>

      {/* 展开的分类配置弹层面板 */}
      {isOpen && (
        <div className="mt-2 rounded-lg border border-[#eaeaea] bg-[#ffffff] p-3 shadow-lg shadow-black/[0.04] space-y-3">
          {/* 四大分类选项卡 */}
          <div className="grid grid-cols-4 gap-1 rounded-md bg-[#f7f6f3] p-1 border border-[#eaeaea]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("keyboard");
                setIsRecordingKeyboard(false);
              }}
              className={`flex items-center justify-center gap-1 rounded py-1 text-[11px] font-medium transition-colors ${
                activeTab === "keyboard"
                  ? "bg-[#ffffff] text-[#111111] font-semibold shadow-xs"
                  : "text-[#787774] hover:text-[#111111]"
              }`}
            >
              <Keyboard className="h-3 w-3 text-[#1f6c9f]" />
              <span>键盘</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("gamepad");
                setIsRecordingKeyboard(false);
              }}
              className={`flex items-center justify-center gap-1 rounded py-1 text-[11px] font-medium transition-colors ${
                activeTab === "gamepad"
                  ? "bg-[#ffffff] text-[#111111] font-semibold shadow-xs"
                  : "text-[#787774] hover:text-[#111111]"
              }`}
            >
              <Gamepad2 className="h-3 w-3 text-[#956400]" />
              <span>手柄</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("mouse");
                setIsRecordingKeyboard(false);
              }}
              className={`flex items-center justify-center gap-1 rounded py-1 text-[11px] font-medium transition-colors ${
                activeTab === "mouse"
                  ? "bg-[#ffffff] text-[#111111] font-semibold shadow-xs"
                  : "text-[#787774] hover:text-[#111111]"
              }`}
            >
              <Mouse className="h-3 w-3 text-[#346538]" />
              <span>鼠标</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("special");
                setIsRecordingKeyboard(false);
              }}
              className={`flex items-center justify-center gap-1 rounded py-1 text-[11px] font-medium transition-colors ${
                activeTab === "special"
                  ? "bg-[#ffffff] text-[#111111] font-semibold shadow-xs"
                  : "text-[#787774] hover:text-[#111111]"
              }`}
            >
              <Zap className="h-3 w-3 text-[#5c3e75]" />
              <span>动作</span>
            </button>
          </div>

          {/* 1. 键盘分类面板 */}
          {activeTab === "keyboard" && (
            <div className="space-y-2.5">
              {/* 核心录制框 */}
              <div
                ref={recordingRef}
                onClick={() => setIsRecordingKeyboard(true)}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 text-center transition-all ${
                  isRecordingKeyboard
                    ? "border-[#111111] bg-[#fbf3db] text-[#111111] ring-2 ring-[#111111]/10"
                    : "border-[#dcdbd8] bg-[#fbfbfa] text-[#2f3437] hover:border-[#111111] hover:bg-[#ffffff]"
                }`}
              >
                <Keyboard className={`h-5 w-5 mb-1 ${isRecordingKeyboard ? "text-[#111111]" : "text-[#787774]"}`} />
                <span className="font-semibold text-xs text-[#111111]">
                  {isRecordingKeyboard
                    ? "【正在监听】请直接按下物理键盘上的任意按键..."
                    : "点击此处，然后按下键盘按键录制"}
                </span>
                <span className="text-[10px] text-[#787774] mt-0.5">
                  支持 A~Z、空格、回车、Shift、Ctrl、Alt、F1~F12 等
                </span>
              </div>

              {/* 常用按键点选 */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-[#787774]">
                  或从常用按键中点选：
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {["k51", "k47", "k29", "k32", "k62", "k66", "k61", "k111", "k59", "k113"].map((code) => {
                    const label = KEYBOARD_LABEL_MAP[code];
                    const isCur = value === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          onChange(code);
                          setIsRecordingKeyboard(false);
                        }}
                        className={`rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                          isCur
                            ? "bg-[#111111] text-[#ffffff] font-bold"
                            : "bg-[#f7f6f3] text-[#2f3437] hover:bg-[#eaeaea] border border-[#eaeaea]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* 字母全集网格 */}
                <div className="max-h-28 overflow-y-auto rounded border border-[#eaeaea] bg-[#fbfbfa] p-1.5 grid grid-cols-6 gap-1">
                  {Object.entries(KEYBOARD_LABEL_MAP).map(([code, name]) => {
                    const isCur = value === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          onChange(code);
                          setIsRecordingKeyboard(false);
                        }}
                        className={`rounded px-1.5 py-1 text-[10px] font-mono truncate transition-colors ${
                          isCur
                            ? "bg-[#111111] text-[#ffffff] font-bold"
                            : "bg-[#ffffff] text-[#2f3437] hover:border-[#111111] border border-[#eaeaea]"
                        }`}
                        title={`${name} (${code})`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. 手柄分类面板 */}
          {activeTab === "gamepad" && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-[#787774]">
                标准手柄按键与模拟量：
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {GAMEPAD_ITEMS.map((item) => {
                  const isCur = value === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => onChange(item.code)}
                      className={`flex items-center justify-between rounded border px-2 py-1.5 text-left transition-colors ${
                        isCur
                          ? "border-[#111111] bg-[#111111] text-[#ffffff] font-semibold"
                          : "border-[#eaeaea] bg-[#ffffff] text-[#2f3437] hover:border-[#111111] hover:bg-[#fbfbfa]"
                      }`}
                    >
                      <span className="truncate text-[11px]">{item.label}</span>
                      <span className={`font-mono text-[9px] ml-1 ${isCur ? "text-slate-300" : "text-[#787774]"}`}>
                        {item.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. 鼠标分类面板 */}
          {activeTab === "mouse" && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-[#787774]">
                鼠标按键与滚轮动作：
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {MOUSE_ITEMS.map((item) => {
                  const isCur = value === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => onChange(item.code)}
                      className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-left transition-colors ${
                        isCur
                          ? "border-[#111111] bg-[#111111] text-[#ffffff] font-semibold"
                          : "border-[#eaeaea] bg-[#ffffff] text-[#2f3437] hover:border-[#111111] hover:bg-[#fbfbfa]"
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-medium">{item.label}</div>
                        <div className={`text-[10px] ${isCur ? "text-slate-300" : "text-[#787774]"}`}>
                          {item.desc}
                        </div>
                      </div>
                      <span className={`font-mono text-[10px] ${isCur ? "text-slate-200" : "text-[#346538]"}`}>
                        {item.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. 特殊动作面板 */}
          {activeTab === "special" && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-[#787774]">
                Moonlight-vplus 专用系统快捷命令：
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                {SPECIAL_ACTION_ITEMS.map((item) => {
                  const isCur = value === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => onChange(item.code)}
                      className={`w-full flex items-center justify-between rounded border px-2 py-1 text-left transition-colors ${
                        isCur
                          ? "border-[#111111] bg-[#111111] text-[#ffffff] font-semibold"
                          : "border-[#eaeaea] bg-[#ffffff] text-[#2f3437] hover:border-[#111111] hover:bg-[#fbfbfa]"
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-[11px] font-medium truncate">{item.label}</div>
                        <div className={`text-[9px] truncate ${isCur ? "text-slate-300" : "text-[#787774]"}`}>
                          {item.desc}
                        </div>
                      </div>
                      <span className={`font-mono text-[10px] ml-2 ${isCur ? "text-slate-200" : "text-[#5c3e75]"}`}>
                        {item.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 底部原生输入与收起 */}
          <div className="flex items-center justify-between border-t border-[#eaeaea] pt-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-[#787774]">
              <span>手动键值:</span>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-20 rounded border border-[#eaeaea] bg-[#f7f6f3] px-1.5 py-0.5 font-mono text-[#111111] text-[10px] outline-none focus:border-[#111111]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsRecordingKeyboard(false);
              }}
              className="flex items-center gap-1 rounded bg-[#111111] px-2.5 py-1 text-[#ffffff] hover:bg-[#333333]"
            >
              <Check className="h-3 w-3 text-[#ffffff]" />
              <span>完成</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
