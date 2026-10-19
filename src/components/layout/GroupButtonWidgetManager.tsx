/**
 * @file GroupButtonWidgetManager.tsx
 * @description 组按键 (GroupButton) 专属子控件绑定管理器：极简画布直选拾取模式，占用极小空间，支持所见即所得实时绑定与展开收纳行为控制
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Crosshair,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  CrownElementType,
  CrownChildVisibility,
  type CrownElement,
  type CrownGroupButtonElement,
} from "../../crownSchema";
import { useCrownStore } from "../../store/useCrownStore";
import { getKeyHumanLabel } from "../../utils/keyMapping";

interface GroupButtonWidgetManagerProps {
  element: CrownGroupButtonElement;
  onUpdate: (patch: Partial<CrownGroupButtonElement>) => void;
}

export const GroupButtonWidgetManager: React.FC<GroupButtonWidgetManagerProps> = ({
  element,
  onUpdate,
}) => {
  const {
    elements,
    setHoveredElement,
    pickingGroupId,
    setPickingGroupId,
  } = useCrownStore();

  const [showRawIds, setShowRawIds] = useState(false);
  const isPicking = pickingGroupId === element.element_id;

  // 解析当前组按键已绑定的子控件 ID 列表
  const boundIds = useMemo(() => {
    if (!element.element_value || element.element_value === "-1") return [];
    return element.element_value
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s && s !== "-1" && s !== String(element.element_id))
      .map((s: string) => Number(s))
      .filter((n: number) => !isNaN(n));
  }, [element.element_value, element.element_id]);

  // 已绑定的具体控件对象及失效 ID 识别
  const { boundElements, orphanIds } = useMemo(() => {
    const list: CrownElement[] = [];
    const orphans: number[] = [];
    boundIds.forEach((id: number) => {
      const found = elements.find((el) => el.element_id === id);
      if (found) {
        list.push(found);
      } else {
        orphans.push(id);
      }
    });
    return { boundElements: list, orphanIds: orphans };
  }, [boundIds, elements]);

  // 更新绑定 ID 列表
  const updateBoundIds = (newIds: number[]) => {
    const cleanIds = Array.from(new Set(newIds)).filter((id: number) => id !== element.element_id);
    const valueStr = cleanIds.length > 0 ? cleanIds.join(",") : "-1";
    onUpdate({ element_value: valueStr });
  };

  const removeBinding = (id: number) => {
    updateBoundIds(boundIds.filter((x: number) => x !== id));
  };

  const removeOrphanIds = () => {
    updateBoundIds(boundIds.filter((id: number) => !orphanIds.includes(id)));
  };

  const clearAllBindings = () => {
    updateBoundIds([]);
  };

  // 扩展属性解析与更新
  let parsedExtra = {
    movableInNormalMode: true,
    userHasManuallySet: true,
    isPermanentlyIndependent: false,
  };
  try {
    if (element.extra_attributes) {
      parsedExtra = { ...parsedExtra, ...JSON.parse(element.extra_attributes) };
    }
  } catch {
    // ignore
  }

  const updateExtra = (patch: Partial<typeof parsedExtra>) => {
    const next = { ...parsedExtra, ...patch };
    onUpdate({ extra_attributes: JSON.stringify(next) });
  };

  // 获取控件的直观名称与描述
  const getWidgetInfo = (el: CrownElement) => {
    let typeName = "按键";
    switch (el.element_type) {
      case CrownElementType.DIGITAL_COMMON_BUTTON:
        typeName = "普通键";
        break;
      case CrownElementType.DIGITAL_SWITCH_BUTTON:
        typeName = "开关";
        break;
      case CrownElementType.DIGITAL_MOVABLE_BUTTON:
        typeName = "视角";
        break;
      case CrownElementType.DIGITAL_COMBINE_BUTTON:
        typeName = "组合键";
        break;
      case CrownElementType.DIGITAL_PAD:
        typeName = "十字键";
        break;
      case CrownElementType.ANALOG_STICK:
        typeName = "摇杆";
        break;
      case CrownElementType.DIGITAL_STICK:
        typeName = "数字摇杆";
        break;
      case CrownElementType.INVISIBLE_ANALOG_STICK:
        typeName = "隐形摇杆";
        break;
      case CrownElementType.INVISIBLE_DIGITAL_STICK:
        typeName = "隐形数字摇杆";
        break;
      case CrownElementType.WHEEL_PAD:
        typeName = "轮盘";
        break;
      case CrownElementType.SIMPLIFY_PERFORMANCE:
        typeName = "性能条";
        break;
      default:
        typeName = `#${el.element_type}`;
    }

    let mainTitle = "";
    if ("element_text" in el && el.element_text) {
      mainTitle = el.element_text;
    } else if (
      "element_value" in el &&
      el.element_value &&
      el.element_value !== "-1" &&
      el.element_value !== "null"
    ) {
      mainTitle = getKeyHumanLabel(el.element_value).label.split(" ")[0] || el.element_value;
    } else {
      mainTitle = typeName;
    }

    return { typeName, mainTitle };
  };

  return (
    <div className="space-y-3 border-t border-[#eaeaea] pt-3 select-none">
      {/* 1. 画布直接点选启动按钮 (所见即所得拾取模式) */}
      <div>
        {isPicking ? (
          <button
            type="button"
            onClick={() => setPickingGroupId(null)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-all cursor-pointer animate-pulse"
          >
            <Check className="h-4 w-4" />
            <span>正在点选画布控件... (点击完成)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setPickingGroupId(element.element_id)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2a2a2a] transition-all cursor-pointer group"
          >
            <Crosshair className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>🎯 在画布上直接点选子控件</span>
          </button>
        )}
        <div className="text-[11px] text-[#888888] text-center mt-1">
          点击后在画布上直接点击任意控件即可加入或移出
        </div>
      </div>

      {/* 2. 已绑定子控件轻量胶囊流 (高度紧凑，仅占用极小空间) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111111]">
            已收纳控件 ({boundElements.length} 项)
          </span>
          {boundIds.length > 0 && (
            <button
              type="button"
              onClick={clearAllBindings}
              className="text-[11px] font-medium text-[#9f2f2d] hover:underline cursor-pointer"
            >
              清空
            </button>
          )}
        </div>

        {boundElements.length === 0 && orphanIds.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#d4d4d0] bg-[#fafaf9] p-2 text-center text-xs text-[#888888]">
            暂无子控件，点击上方按钮直接点选
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 rounded-lg border border-[#f0f0ee] bg-[#fafaf9]">
            {boundElements.map((child) => {
              const info = getWidgetInfo(child);
              return (
                <div
                  key={child.element_id}
                  onMouseEnter={() => setHoveredElement(child.element_id)}
                  onMouseLeave={() => setHoveredElement(null)}
                  className="group flex items-center gap-1 rounded-md border border-[#e5e7eb] bg-[#ffffff] px-2 py-0.5 text-xs shadow-2xs hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
                >
                  <span className="font-semibold text-[#111111]">{info.mainTitle}</span>
                  <span className="text-[10px] text-[#6b7280]">({info.typeName})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBinding(child.element_id);
                    }}
                    className="rounded p-0.5 text-[#9ca3af] hover:text-[#dc2626] transition-colors cursor-pointer"
                    title="移除"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}

            {orphanIds.length > 0 && (
              <div className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-800">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{orphanIds.length} 项已失效</span>
                <button
                  type="button"
                  onClick={removeOrphanIds}
                  className="font-bold underline ml-0.5 cursor-pointer"
                >
                  清理
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. 抽屉行为与常态可见性配置 */}
      <div className="space-y-2 border-t border-[#eaeaea] pt-2.5">
        <div>
          <label className="text-xs font-medium text-[#4b5563] block mb-1">
            子按键常态显示模式
          </label>
          <select
            value={element.element_sense ?? CrownChildVisibility.VISIBLE}
            onChange={(e) =>
              onUpdate({
                element_sense: Number(e.target.value) as CrownChildVisibility,
              })
            }
            className="w-full rounded-lg border border-[#e5e7eb] bg-[#ffffff] px-2 py-1.5 text-xs text-[#111111] outline-none focus:border-[#111111]"
          >
            <option value={CrownChildVisibility.VISIBLE}>
              常态全部展开显示 (VISIBLE)
            </option>
            <option value={CrownChildVisibility.GONE}>
              常态隐藏收起 (GONE - 推荐)
            </option>
            <option value={CrownChildVisibility.INVISIBLE}>
              常态占位但不渲染 (INVISIBLE)
            </option>
          </select>
        </div>

        <div className="flex items-center justify-between py-0.5">
          <span className="text-xs font-medium text-[#111111]">
            移动组按键时带动子控件平移
          </span>
          <input
            type="checkbox"
            checked={parsedExtra.movableInNormalMode}
            onChange={(e) => updateExtra({ movableInNormalMode: e.target.checked })}
            className="h-4 w-4 rounded accent-[#111111] cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between py-0.5">
          <span className="text-xs font-medium text-[#111111]">
            隐藏组按键自身 (仅由宏触发)
          </span>
          <input
            type="checkbox"
            checked={element.element_flag1 === 1}
            onChange={(e) => onUpdate({ element_flag1: e.target.checked ? 1 : 0 })}
            className="h-4 w-4 rounded accent-[#111111] cursor-pointer"
          />
        </div>
      </div>

      {/* 4. 底层原始 ID 列表查看（可折叠） */}
      <div className="border-t border-[#eaeaea] pt-1">
        <button
          type="button"
          onClick={() => setShowRawIds((prev) => !prev)}
          className="flex items-center justify-between w-full text-[11px] text-[#888888] hover:text-[#111111] transition-colors cursor-pointer py-1"
        >
          <span>底层协议 ID 列表 (高级)</span>
          {showRawIds ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {showRawIds && (
          <div className="mt-1 space-y-1">
            <input
              type="text"
              value={element.element_value || "-1"}
              onChange={(e) => onUpdate({ element_value: e.target.value.trim() || "-1" })}
              className="w-full font-mono text-[11px] rounded border border-[#e5e7eb] bg-[#f9fafb] px-2 py-1 text-[#374151] outline-none"
              placeholder="逗号分隔的 ID 列表"
            />
          </div>
        )}
      </div>
    </div>
  );
};
