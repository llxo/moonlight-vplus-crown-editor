/**
 * @file RightInspector.tsx
 * @description 编辑器右侧属性检查器：遵循 minimalist-ui 规范，采用纯净浅色界面、便当盒排版与精细参数微调
 */

import React from "react";
import {
  Settings,
  SlidersHorizontal,
  Palette,
  Crosshair,
  Trash2,
  Copy,
} from "lucide-react";
import { useCrownStore } from "../../store/useCrownStore";
import {
  CrownColorUtils,
  CrownElementType,
  CrownStickMoveMode,
  type CrownElement,
} from "../../crownSchema";
import { KeyCodePicker } from "../common/KeyCodePicker";

export const RightInspector: React.FC = () => {
  const {
    activeTabRight,
    setActiveTabRight,
    selectedElementIds,
    elements,
    updateElement,
    deleteSelectedElements,
    duplicateSelectedElements,
    settings,
    updateSettings,
    meta,
    updateMeta,
  } = useCrownStore();

  const selectedElement =
    selectedElementIds.length === 1
      ? elements.find((el) => el.element_id === selectedElementIds[0])
      : null;

  return (
    <aside className="flex h-full w-80 flex-col border-l border-[#eaeaea] bg-[#ffffff] text-xs select-none">
      {/* 选项卡 */}
      <div className="flex border-b border-[#eaeaea] bg-[#fbfbfa]">
        <button
          onClick={() => setActiveTabRight("element")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 font-medium transition-colors ${
            activeTabRight === "element"
              ? "border-b-2 border-[#111111] bg-[#ffffff] text-[#111111]"
              : "text-[#787774] hover:text-[#111111]"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>属性 {selectedElement ? "" : "(未选中)"}</span>
        </button>
        <button
          onClick={() => setActiveTabRight("settings")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 font-medium transition-colors ${
            activeTabRight === "settings"
              ? "border-b-2 border-[#111111] bg-[#ffffff] text-[#111111]"
              : "text-[#787774] hover:text-[#111111]"
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          <span>全局配置</span>
        </button>
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeTabRight === "element" ? (
          selectedElement ? (
            <ElementPropertyForm
              element={selectedElement}
              onUpdate={(patch) => updateElement(selectedElement.element_id, patch)}
              onDuplicate={duplicateSelectedElements}
              onDelete={deleteSelectedElements}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-[#787774]">
              <div className="rounded-full bg-[#f7f6f3] p-3 mb-2 border border-[#eaeaea]">
                <Crosshair className="h-6 w-6 text-[#787774]" />
              </div>
              <span className="font-medium text-xs text-[#111111]">请在画布中点击选择控件</span>
              <span className="text-[11px] text-[#9b9a97] mt-1 max-w-[200px] leading-relaxed">
                可实时调整中心锚点坐标、尺寸、ARGB 颜色与键位绑定
              </span>
            </div>
          )
        ) : (
          <GlobalSettingsForm
            settings={settings}
            updateSettings={updateSettings}
            meta={meta}
            updateMeta={updateMeta}
          />
        )}
      </div>
    </aside>
  );
};

// ----------------------------------------------------------------------------
// 控件专属属性表单组件
// ----------------------------------------------------------------------------

interface ElementPropertyFormProps {
  element: CrownElement;
  onUpdate: (patch: Partial<CrownElement>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const ElementPropertyForm: React.FC<ElementPropertyFormProps> = ({
  element,
  onUpdate,
  onDuplicate,
  onDelete,
}) => {
  const hexBorderColor = CrownColorUtils.intToRgbaHex(element.element_color).slice(0, 7);
  const hexBgColor = CrownColorUtils.intToRgbaHex(element.element_background_color).slice(0, 7);

  return (
    <div className="space-y-4">
      {/* 头部元数据与操作 */}
      <div className="flex items-center justify-between border-b border-[#eaeaea] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#f7f6f3] px-2 py-0.5 text-[10px] font-mono text-[#2f3437] border border-[#eaeaea]">
            ID: {element.element_id}
          </span>
          <span className="text-[11px] font-mono text-[#787774]">
            Type: {element.element_type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            className="rounded p-1 hover:bg-[#f7f6f3] text-[#787774] hover:text-[#111111]"
            title="克隆此按键"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 hover:bg-[#fdebec] text-[#9f2f2d]"
            title="删除此按键"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 基础几何变换与锚点 */}
      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
          几何尺寸与中心锚点 (物理像素)
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">中心点 X (Px)</label>
            <input
              type="number"
              value={element.element_central_x}
              onChange={(e) => onUpdate({ element_central_x: Number(e.target.value) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">中心点 Y (Px)</label>
            <input
              type="number"
              value={element.element_central_y}
              onChange={(e) => onUpdate({ element_central_y: Number(e.target.value) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">宽度 W (Px)</label>
            <input
              type="number"
              value={element.element_width}
              onChange={(e) => onUpdate({ element_width: Math.max(20, Number(e.target.value)) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">高度 H (Px)</label>
            <input
              type="number"
              value={element.element_height}
              onChange={(e) => onUpdate({ element_height: Math.max(20, Number(e.target.value)) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">图层深度 Layer</label>
            <input
              type="number"
              value={element.element_layer}
              onChange={(e) => onUpdate({ element_layer: Number(e.target.value) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">描边厚度 Thick</label>
            <input
              type="number"
              value={element.element_thick}
              onChange={(e) => onUpdate({ element_thick: Math.max(1, Number(e.target.value)) })}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            />
          </div>
        </div>
      </div>

      {/* 按键标签文本 */}
      {"element_text" in element && element.element_type !== CrownElementType.SIMPLIFY_PERFORMANCE && (
        <div className="space-y-1.5 border-t border-[#eaeaea] pt-3">
          <label className="text-[10px] text-[#787774] block font-medium">显示标签文本 (Text)</label>
          <input
            type="text"
            value={element.element_text || ""}
            onChange={(e) => onUpdate({ element_text: e.target.value } as any)}
            className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
            placeholder="按键表面显示文字，如 A, W, 射击"
          />
        </div>
      )}

      {/* 核心按键绑定选择器 */}
      {"element_value" in element && element.element_type !== CrownElementType.WHEEL_PAD && (
        <div className="space-y-1.5 border-t border-[#eaeaea] pt-3">
          <KeyCodePicker
            label="绑定按键 (支持键盘敲击录制 / 手柄 / 鼠标)"
            value={element.element_value || ""}
            onChange={(newVal) => onUpdate({ element_value: newVal } as any)}
          />
        </div>
      )}

      {/* 颜色样式设置 (ARGB 32位整数互转) */}
      <div className="space-y-2 border-t border-[#eaeaea] pt-3">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
          <Palette className="h-3.5 w-3.5 text-[#111111]" />
          <span>颜色配置 (ARGB 整数双向映射)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">描边颜色</label>
            <div className="flex items-center gap-1.5 rounded border border-[#eaeaea] bg-[#fbfbfa] p-1">
              <input
                type="color"
                value={hexBorderColor}
                onChange={(e) =>
                  onUpdate({ element_color: CrownColorUtils.rgbaHexToInt(e.target.value) })
                }
                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-[10px] text-[#2f3437]">{hexBorderColor}</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">背景填充色</label>
            <div className="flex items-center gap-1.5 rounded border border-[#eaeaea] bg-[#fbfbfa] p-1">
              <input
                type="color"
                value={hexBgColor}
                onChange={(e) =>
                  onUpdate({ element_background_color: CrownColorUtils.rgbaHexToInt(e.target.value) })
                }
                className="h-5 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-[10px] text-[#2f3437]">{hexBgColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 控件专属特有高级属性 */}
      {renderSpecialAttributes(element, onUpdate)}
    </div>
  );
};

function renderSpecialAttributes(
  element: CrownElement,
  onUpdate: (patch: Partial<CrownElement>) => void
) {
  switch (element.element_type) {
    case CrownElementType.ANALOG_STICK: {
      return (
        <div className="space-y-3 border-t border-[#eaeaea] pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
            模拟摇杆专属属性
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-[#787774] mb-1">
              <span>死区半径比例</span>
              <span className="font-mono text-[#111111]">{element.element_sense}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={element.element_sense}
              onChange={(e) => onUpdate({ element_sense: Number(e.target.value) } as any)}
              className="w-full accent-[#111111]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">摇杆移动模式</label>
            <select
              value={element.element_mode}
              onChange={(e) => onUpdate({ element_mode: Number(e.target.value) } as any)}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none"
            >
              <option value={CrownStickMoveMode.FIXED_ABSOLUTE}>0: 绝对固定位置</option>
              <option value={CrownStickMoveMode.FOLLOW_FINGER_RELATIVE}>1: 随手指按下动态居中</option>
            </select>
          </div>
          <div>
            <KeyCodePicker
              label="摇杆下压键值 (Middle Value，通常为 L3 或 R3)"
              value={element.element_middle_value || "g64"}
              onChange={(val) => onUpdate({ element_middle_value: val } as any)}
            />
          </div>
        </div>
      );
    }

    case CrownElementType.DIGITAL_PAD: {
      return (
        <div className="space-y-3 border-t border-[#eaeaea] pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
            十字键四向键值绑定 (支持键盘敲击录制)
          </div>
          <div className="space-y-2">
            <KeyCodePicker
              label="上方向 (UP)"
              value={element.element_up_value}
              onChange={(val) => onUpdate({ element_up_value: val } as any)}
            />
            <KeyCodePicker
              label="下方向 (DOWN)"
              value={element.element_down_value}
              onChange={(val) => onUpdate({ element_down_value: val } as any)}
            />
            <KeyCodePicker
              label="左方向 (LEFT)"
              value={element.element_left_value}
              onChange={(val) => onUpdate({ element_left_value: val } as any)}
            />
            <KeyCodePicker
              label="右方向 (RIGHT)"
              value={element.element_right_value}
              onChange={(val) => onUpdate({ element_right_value: val } as any)}
            />
          </div>
        </div>
      );
    }

    case CrownElementType.DIGITAL_COMBINE_BUTTON: {
      return (
        <div className="space-y-3 border-t border-[#eaeaea] pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
            组合宏按键 (最多 5 个键同时触发)
          </div>
          <div className="space-y-2">
            <KeyCodePicker
              label="宏槽位 1 (主键)"
              value={element.element_value}
              onChange={(val) => onUpdate({ element_value: val } as any)}
            />
            <KeyCodePicker
              label="宏槽位 2"
              value={element.element_up_value}
              onChange={(val) => onUpdate({ element_up_value: val } as any)}
            />
            <KeyCodePicker
              label="宏槽位 3"
              value={element.element_down_value}
              onChange={(val) => onUpdate({ element_down_value: val } as any)}
            />
            <KeyCodePicker
              label="宏槽位 4"
              value={element.element_left_value}
              onChange={(val) => onUpdate({ element_left_value: val } as any)}
            />
            <KeyCodePicker
              label="宏槽位 5"
              value={element.element_right_value}
              onChange={(val) => onUpdate({ element_right_value: val } as any)}
            />
          </div>
        </div>
      );
    }

    case CrownElementType.WHEEL_PAD: {
      return (
        <div className="space-y-2 border-t border-[#eaeaea] pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
            轮盘快捷菜单专属属性
          </div>
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">扇区数量 (Mode)</label>
            <input
              type="number"
              value={element.element_mode}
              onChange={(e) => onUpdate({ element_mode: Number(e.target.value) } as any)}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">空心内圈比例 ({element.element_sense}%)</label>
            <input
              type="range"
              min="10"
              max="70"
              value={element.element_sense}
              onChange={(e) => onUpdate({ element_sense: Number(e.target.value) } as any)}
              className="w-full accent-[#111111]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#787774] block mb-1">扇区配置串 (key|name,...)</label>
            <textarea
              rows={3}
              value={element.element_value}
              onChange={(e) => onUpdate({ element_value: e.target.value } as any)}
              className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 font-mono text-[11px] text-[#111111] outline-none"
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

// ----------------------------------------------------------------------------
// 全局配置与元数据表单组件
// ----------------------------------------------------------------------------

interface GlobalSettingsFormProps {
  settings: any;
  updateSettings: (patch: any) => void;
  meta: any;
  updateMeta: (patch: any) => void;
}

const GlobalSettingsForm: React.FC<GlobalSettingsFormProps> = ({
  settings,
  updateSettings,
  meta,
  updateMeta,
}) => {
  return (
    <div className="space-y-4">
      {/* Profile 元数据 */}
      <div className="space-y-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
          Profile 社区分享包元数据
        </div>
        <div>
          <label className="text-[10px] text-[#787774] block mb-1">配置名称</label>
          <input
            type="text"
            value={meta.name}
            onChange={(e) => updateMeta({ name: e.target.value })}
            className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#787774] block mb-1">作者 (Author)</label>
          <input
            type="text"
            value={meta.authorName || ""}
            onChange={(e) => updateMeta({ authorName: e.target.value })}
            className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#787774] block mb-1">关联游戏 (Game Name)</label>
          <input
            type="text"
            value={meta.gameName || ""}
            onChange={(e) => updateMeta({ gameName: e.target.value })}
            className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#787774] block mb-1">配置简介描述</label>
          <textarea
            rows={2}
            value={meta.summary || ""}
            onChange={(e) => updateMeta({ summary: e.target.value })}
            className="w-full rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none focus:border-[#111111]"
          />
        </div>
      </div>

      {/* 全局触控参数 (SQLite config 表) */}
      <div className="space-y-2 border-t border-[#eaeaea] pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#787774]">
          客户端全局触控设置 (Settings)
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-[#2f3437] text-xs">触控模式 (Touch Mode)</span>
          <select
            value={settings.touch_mode}
            onChange={(e) => updateSettings({ touch_mode: e.target.value })}
            className="rounded border border-[#eaeaea] bg-[#fbfbfa] px-2 py-1 text-xs text-[#111111] outline-none"
          >
            <option value="true">触控板模式 (Trackpad)</option>
            <option value="false">多点/经典模式 (Classic)</option>
          </select>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-[#787774] mb-1">
            <span>触控灵敏度</span>
            <span className="font-mono text-[#111111]">{settings.touch_sense}</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            value={settings.touch_sense}
            onChange={(e) => updateSettings({ touch_sense: Number(e.target.value) })}
            className="w-full accent-[#111111]"
          />
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-[#2f3437] text-xs">游戏手柄震动</span>
          <input
            type="checkbox"
            checked={settings.game_vibrator === "true"}
            onChange={(e) => updateSettings({ game_vibrator: e.target.checked ? "true" : "false" })}
            className="accent-[#111111] h-4 w-4 rounded"
          />
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-[#2f3437] text-xs">按键触觉反馈</span>
          <input
            type="checkbox"
            checked={settings.button_vibrator === "true"}
            onChange={(e) => updateSettings({ button_vibrator: e.target.checked ? "true" : "false" })}
            className="accent-[#111111] h-4 w-4 rounded"
          />
        </div>
      </div>
    </div>
  );
};
