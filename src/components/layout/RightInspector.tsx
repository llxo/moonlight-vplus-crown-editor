/**
 * @file RightInspector.tsx
 * @description 编辑器右侧属性检查器：选中国件属性配置、颜色ARGB转换器、全局触控设置与Profile元数据
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
    <aside className="flex h-full w-80 flex-col border-l border-[#242730] bg-[#14161b] text-xs select-none">
      {/* 选项卡 */}
      <div className="flex border-b border-[#242730] bg-[#111216]">
        <button
          onClick={() => setActiveTabRight("element")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 font-medium transition-colors ${
            activeTabRight === "element"
              ? "border-b-2 border-amber-500 bg-[#16181f] text-amber-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>控件属性 {selectedElement ? "" : "(未选中)"}</span>
        </button>
        <button
          onClick={() => setActiveTabRight("settings")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 font-medium transition-colors ${
            activeTabRight === "settings"
              ? "border-b-2 border-amber-500 bg-[#16181f] text-amber-400"
              : "text-slate-400 hover:text-slate-200"
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
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
              <Crosshair className="h-8 w-8 text-slate-600 mb-2" />
              <span>请在画布中点击选择一个按键控件</span>
              <span className="text-[11px] text-slate-600 mt-1">
                支持直接修改中心点坐标、尺寸、ARGB 颜色与键位绑定
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
      {/* 头部摘要与快捷操作 */}
      <div className="flex items-center justify-between border-b border-[#242730] pb-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono text-amber-400 border border-amber-500/20">
            ID: {element.element_id}
          </span>
          <span className="text-[11px] text-slate-400">
            Type: {element.element_type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            className="rounded p-1 hover:bg-[#20232c] text-slate-300"
            title="克隆此按键"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 hover:bg-[#20232c] text-rose-400"
            title="删除此按键"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 基础几何变换与锚点 */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
          几何尺寸与中心锚点 (物理像素)
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">中心点 X (Px)</label>
            <input
              type="number"
              value={element.element_central_x}
              onChange={(e) => onUpdate({ element_central_x: Number(e.target.value) })}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">中心点 Y (Px)</label>
            <input
              type="number"
              value={element.element_central_y}
              onChange={(e) => onUpdate({ element_central_y: Number(e.target.value) })}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">宽度 W (Px)</label>
            <input
              type="number"
              value={element.element_width}
              onChange={(e) => onUpdate({ element_width: Math.max(20, Number(e.target.value)) })}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">高度 H (Px)</label>
            <input
              type="number"
              value={element.element_height}
              onChange={(e) => onUpdate({ element_height: Math.max(20, Number(e.target.value)) })}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">图层深度 Layer</label>
            <input
              type="number"
              value={element.element_layer}
              onChange={(e) => onUpdate({ element_layer: Number(e.target.value) })}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">描边厚度 Thick</label>
            <input
              type="number"
              value={element.element_thick}
              onChange={(e) => onUpdate({ element_thick: Math.max(1, Number(e.target.value)) })}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* 键值与文字标签 */}
      <div className="space-y-2 border-t border-[#242730] pt-3">
        <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
          按键编码与表面文字
        </div>
        {"element_text" in element && (
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">显示标签 (Text)</label>
            <input
              type="text"
              value={element.element_text || ""}
              onChange={(e) => onUpdate({ element_text: e.target.value } as any)}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none focus:border-amber-500/50"
            />
          </div>
        )}
        {"element_value" in element && (
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">
              按键编码 (KeyCode: k=键盘, m=鼠标, g=手柄)
            </label>
            <input
              type="text"
              value={element.element_value || ""}
              onChange={(e) => onUpdate({ element_value: e.target.value } as any)}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 font-mono text-amber-400 outline-none focus:border-amber-500/50"
              placeholder="如 k29 (A), m1 (左键), g4096 (A)"
            />
          </div>
        )}
      </div>

      {/* 颜色样式设置 (ARGB 32位整数互转) */}
      <div className="space-y-2 border-t border-[#242730] pt-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 tracking-wider">
          <Palette className="h-3.5 w-3.5 text-amber-400" />
          <span>颜色配置 (自动同步 ARGB 整数)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">描边颜色</label>
            <div className="flex items-center gap-1.5 rounded border border-[#2a2e3a] bg-[#1a1d24] p-1">
              <input
                type="color"
                value={hexBorderColor}
                onChange={(e) =>
                  onUpdate({ element_color: CrownColorUtils.rgbaHexToInt(e.target.value) })
                }
                className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-[10px] text-slate-300">{hexBorderColor}</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">背景填充色</label>
            <div className="flex items-center gap-1.5 rounded border border-[#2a2e3a] bg-[#1a1d24] p-1">
              <input
                type="color"
                value={hexBgColor}
                onChange={(e) =>
                  onUpdate({ element_background_color: CrownColorUtils.rgbaHexToInt(e.target.value) })
                }
                className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-[10px] text-slate-300">{hexBgColor}</span>
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
        <div className="space-y-2 border-t border-[#242730] pt-3">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
            模拟摇杆专属属性
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">死区半径比例 ({element.element_sense}%)</label>
            <input
              type="range"
              min="0"
              max="80"
              value={element.element_sense}
              onChange={(e) => onUpdate({ element_sense: Number(e.target.value) } as any)}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">摇杆移动模式</label>
            <select
              value={element.element_mode}
              onChange={(e) => onUpdate({ element_mode: Number(e.target.value) } as any)}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none"
            >
              <option value={CrownStickMoveMode.FIXED_ABSOLUTE}>0: 绝对固定位置</option>
              <option value={CrownStickMoveMode.FOLLOW_FINGER_RELATIVE}>1: 随手指按下动态居中</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">下压键值 (Middle Value)</label>
            <input
              type="text"
              value={element.element_middle_value || "g64"}
              onChange={(e) => onUpdate({ element_middle_value: e.target.value } as any)}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 font-mono text-amber-400 outline-none"
            />
          </div>
        </div>
      );
    }

    case CrownElementType.DIGITAL_PAD: {
      return (
        <div className="space-y-2 border-t border-[#242730] pt-3">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
            十字键四向键值绑定
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">上 (UP)</label>
              <input
                type="text"
                value={element.element_up_value}
                onChange={(e) => onUpdate({ element_up_value: e.target.value } as any)}
                className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 font-mono text-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">下 (DOWN)</label>
              <input
                type="text"
                value={element.element_down_value}
                onChange={(e) => onUpdate({ element_down_value: e.target.value } as any)}
                className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 font-mono text-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">左 (LEFT)</label>
              <input
                type="text"
                value={element.element_left_value}
                onChange={(e) => onUpdate({ element_left_value: e.target.value } as any)}
                className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 font-mono text-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">右 (RIGHT)</label>
              <input
                type="text"
                value={element.element_right_value}
                onChange={(e) => onUpdate({ element_right_value: e.target.value } as any)}
                className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 font-mono text-amber-400 outline-none"
              />
            </div>
          </div>
        </div>
      );
    }

    case CrownElementType.WHEEL_PAD: {
      return (
        <div className="space-y-2 border-t border-[#242730] pt-3">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
            轮盘快捷菜单专属属性
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">扇区数量 (Mode)</label>
            <input
              type="number"
              value={element.element_mode}
              onChange={(e) => onUpdate({ element_mode: Number(e.target.value) } as any)}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">空心内圈比例 ({element.element_sense}%)</label>
            <input
              type="range"
              min="10"
              max="70"
              value={element.element_sense}
              onChange={(e) => onUpdate({ element_sense: Number(e.target.value) } as any)}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">扇区配置串 (key|name,...)</label>
            <textarea
              rows={3}
              value={element.element_value}
              onChange={(e) => onUpdate({ element_value: e.target.value } as any)}
              className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 font-mono text-[11px] text-slate-200 outline-none"
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
        <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
          Profile 社区分享包元数据
        </div>
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">配置名称</label>
          <input
            type="text"
            value={meta.name}
            onChange={(e) => updateMeta({ name: e.target.value })}
            className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">作者 (Author)</label>
          <input
            type="text"
            value={meta.authorName || ""}
            onChange={(e) => updateMeta({ authorName: e.target.value })}
            className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">关联游戏 (Game Name)</label>
          <input
            type="text"
            value={meta.gameName || ""}
            onChange={(e) => updateMeta({ gameName: e.target.value })}
            className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">配置简介描述</label>
          <textarea
            rows={2}
            value={meta.summary || ""}
            onChange={(e) => updateMeta({ summary: e.target.value })}
            className="w-full rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none"
          />
        </div>
      </div>

      {/* 全局触控参数 (SQLite config 表) */}
      <div className="space-y-2 border-t border-[#242730] pt-3">
        <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
          客户端全局触控设置 (Settings)
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-slate-300">触控模式 (Touch Mode)</span>
          <select
            value={settings.touch_mode}
            onChange={(e) => updateSettings({ touch_mode: e.target.value })}
            className="rounded border border-[#2a2e3a] bg-[#1a1d24] px-2 py-1 text-slate-200 outline-none"
          >
            <option value="true">触控板模式 (Trackpad)</option>
            <option value="false">多点/经典模式 (Classic)</option>
          </select>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>触控灵敏度</span>
            <span>{settings.touch_sense}</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            value={settings.touch_sense}
            onChange={(e) => updateSettings({ touch_sense: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-slate-300">游戏手柄震动</span>
          <input
            type="checkbox"
            checked={settings.game_vibrator === "true"}
            onChange={(e) => updateSettings({ game_vibrator: e.target.checked ? "true" : "false" })}
            className="accent-amber-500 h-4 w-4"
          />
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-slate-300">按键触觉反馈</span>
          <input
            type="checkbox"
            checked={settings.button_vibrator === "true"}
            onChange={(e) => updateSettings({ button_vibrator: e.target.checked ? "true" : "false" })}
            className="accent-amber-500 h-4 w-4"
          />
        </div>
      </div>
    </div>
  );
};
