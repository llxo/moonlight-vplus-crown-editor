/**
 * @file KeyCodePicker.tsx
 * @description 多设备按键选择器：支持键盘物理按键实时监听录制、手柄全键位拾取、鼠标动作拾取与特殊功能绑定
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

  // 当外部 value 改变时，同步分类
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
        // 如果未命中 code 表，尝试字母键
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

  // 类别图标映射
  const getCategoryIcon = (category: KeyCategory) => {
    switch (category) {
      case "keyboard":
        return <Keyboard className="h-3.5 w-3.5 text-cyan-400" />;
      case "gamepad":
        return <Gamepad2 className="h-3.5 w-3.5 text-amber-400" />;
      case "mouse":
        return <Mouse className="h-3.5 w-3.5 text-emerald-400" />;
      case "special":
        return <Zap className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Edit3 className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="text-[10px] text-slate-500 block">{label}</label>}

      {/* 键值预览与修改触发按钮 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex cursor-pointer items-center justify-between rounded-lg border px-2.5 py-1.5 transition-all ${
          isOpen
            ? "border-amber-500 bg-[#1c1f28] ring-1 ring-amber-500/40"
            : "border-[#2a2e3a] bg-[#1a1d24] hover:border-slate-500 hover:bg-[#1e222b]"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <div className="rounded bg-[#121418] p-1 border border-[#2b2f3c]">
            {getCategoryIcon(info.category)}
          </div>
          <span className="font-medium text-slate-100 truncate">
            {info.label}
          </span>
        </div>
        <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          {value || "null"}
        </span>
      </div>

      {/* 展开的分类配置弹层面板 */}
      {isOpen && (
        <div className="mt-2 rounded-lg border border-[#2c303d] bg-[#171920] p-3 shadow-xl space-y-3">
          {/* 四大分类选项卡 */}
          <div className="grid grid-cols-4 gap-1 rounded bg-[#101217] p-1 border border-[#242834]">
            <button
              type="button"
              onClick={() => {
                setActiveTab("keyboard");
                setIsRecordingKeyboard(false);
              }}
              className={`flex items-center justify-center gap-1 rounded py-1.5 text-[11px] font-medium transition-colors ${
                activeTab === "keyboard"
                  ? "bg-cyan-500/20 text-cyan-300 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Keyboard className="h-3 w-3" />
              <span>键盘</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("gamepad");
                setIsRecordingKeyboard(false);
              }}
              className={`flex items-center justify-center gap-1 rounded py-1.5 text-[11px] font-medium transition-colors ${
                activeTab === "gamepad"
                  ? "bg-amber-500/20 text-amber-300 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Gamepad2 className="h-3 w-3" />
              <span>手柄</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("mouse");
                setIsRecordingKeyboard(false);
              }}
              className={`flex items-center justify-center gap-1 rounded py-1.5 text-[11px] font-medium transition-colors ${
                activeTab === "mouse"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Mouse className="h-3 w-3" />
              <span>鼠标</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("special");
                setIsRecordingKeyboard(false);
              }}
              className={`flex items-center justify-center gap-1 rounded py-1.5 text-[11px] font-medium transition-colors ${
                activeTab === "special"
                  ? "bg-purple-500/20 text-purple-300 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>动作</span>
            </button>
          </div>

          {/* 1. 键盘分类面板：支持从物理键盘直接输入录制 + 常用按键网格 */}
          {activeTab === "keyboard" && (
            <div className="space-y-2.5">
              {/* 核心功能：键盘直接输入捕获框 */}
              <div
                ref={recordingRef}
                onClick={() => setIsRecordingKeyboard(true)}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 text-center transition-all ${
                  isRecordingKeyboard
                    ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 ring-2 ring-cyan-400/30 animate-pulse"
                    : "border-cyan-500/40 bg-[#12161f] text-slate-300 hover:border-cyan-400 hover:bg-[#151c2a]"
                }`}
              >
                <Keyboard className={`h-5 w-5 mb-1 ${isRecordingKeyboard ? "text-cyan-300 animate-bounce" : "text-cyan-400"}`} />
                <span className="font-semibold text-xs">
                  {isRecordingKeyboard
                    ? "【正在监听】请直接按下物理键盘上的任意按键..."
                    : "点击此处，然后按下键盘按键录制"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  支持 A~Z、空格、回车、Shift、Ctrl、Alt、F1~F12、方向键等
                </span>
              </div>

              {/* 键盘常用快捷按键点选网格 */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-slate-400">
                  或从常用键盘按键中点选：
                </div>
                {/* 移动常用键 */}
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
                        className={`rounded px-2 py-1 text-[11px] font-mono font-medium transition-colors ${
                          isCur
                            ? "bg-cyan-500 text-slate-950 font-bold"
                            : "bg-[#1c202a] text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 border border-[#2b3140]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* 字母 A-Z 网格 */}
                <div className="max-h-28 overflow-y-auto rounded border border-[#232733] bg-[#12141a] p-1.5 grid grid-cols-6 gap-1">
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
                            ? "bg-cyan-500 text-slate-950 font-bold"
                            : "bg-[#1a1d26] text-slate-300 hover:bg-[#252a38] border border-[#2a2f3e]"
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
              <div className="text-[10px] font-semibold text-slate-400">
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
                          ? "border-amber-500 bg-amber-500/20 text-amber-300 font-semibold"
                          : "border-[#282d3b] bg-[#1c202a] text-slate-300 hover:border-amber-500/40 hover:bg-[#232835]"
                      }`}
                    >
                      <span className="truncate text-[11px]">{item.label}</span>
                      <span className="font-mono text-[9px] text-slate-400 ml-1">{item.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. 鼠标分类面板 */}
          {activeTab === "mouse" && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-slate-400">
                鼠标点击与滚轮动作：
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
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold"
                          : "border-[#282d3b] bg-[#1c202a] text-slate-300 hover:border-emerald-500/40 hover:bg-[#232835]"
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-medium">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400">{item.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. 特殊系统功能面板 */}
          {activeTab === "special" && (
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-slate-400">
                Moonlight-vplus 专用快捷指令：
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
                          ? "border-purple-500 bg-purple-500/20 text-purple-300 font-semibold"
                          : "border-[#282d3b] bg-[#1c202a] text-slate-300 hover:border-purple-500/40 hover:bg-[#232835]"
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-[11px] font-medium truncate">{item.label}</div>
                        <div className="text-[9px] text-slate-400 truncate">{item.desc}</div>
                      </div>
                      <span className="font-mono text-[10px] text-purple-400 ml-2">{item.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 底部原生输入与完成按钮 */}
          <div className="flex items-center justify-between border-t border-[#272b38] pt-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>原始编码:</span>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-20 rounded border border-[#2b3040] bg-[#111318] px-1.5 py-0.5 font-mono text-amber-400 text-[10px] outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsRecordingKeyboard(false);
              }}
              className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-slate-200 hover:bg-slate-700"
            >
              <Check className="h-3 w-3 text-emerald-400" />
              <span>收起</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
