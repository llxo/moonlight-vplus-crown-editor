/**
 * @file GroupButtonWidgetManager.tsx
 * @description 组按键 (GroupButton) 专属子控件绑定管理器：直观绑定/解绑画布控件，支持所见即所得悬停高亮与展开收纳行为控制
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  FolderKanban,
  X,
  Search,
  CheckSquare,
  Square,
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
  const { elements, setHoveredElement } = useCrownStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showRawIds, setShowRawIds] = useState(false);

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

  // 画布上的所有其他可选控件（排除自身和其它组按键）
  const candidateElements = useMemo(() => {
    return elements.filter(
      (el) =>
        el.element_id !== element.element_id &&
        el.element_type !== CrownElementType.GROUP_BUTTON
    );
  }, [elements, element.element_id]);

  // 检查某个控件是否被其它组按键包含
  const otherGroupsChildMap = useMemo(() => {
    const map = new Map<number, string>();
    elements.forEach((el) => {
      if (
        el.element_type === CrownElementType.GROUP_BUTTON &&
        el.element_id !== element.element_id &&
        "element_value" in el &&
        el.element_value &&
        el.element_value !== "-1"
      ) {
        const ids = el.element_value
          .split(",")
          .map((s: string) => Number(s.trim()))
          .filter((n: number) => !isNaN(n));
        const groupName = ("element_text" in el && el.element_text) || `组#${el.element_id}`;
        ids.forEach((id: number) => map.set(id, groupName));
      }
    });
    return map;
  }, [elements, element.element_id]);

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

  const toggleElementBinding = (id: number) => {
    if (boundIds.includes(id)) {
      updateBoundIds(boundIds.filter((x: number) => x !== id));
    } else {
      updateBoundIds([...boundIds, id]);
    }
  };

  const removeBinding = (id: number) => {
    updateBoundIds(boundIds.filter((x: number) => x !== id));
  };

  const removeOrphanIds = () => {
    updateBoundIds(boundIds.filter((id: number) => !orphanIds.includes(id)));
  };

  const selectAllCandidates = () => {
    updateBoundIds(candidateElements.map((el) => el.element_id));
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
        typeName = "普通按键";
        break;
      case CrownElementType.DIGITAL_SWITCH_BUTTON:
        typeName = "自锁开关";
        break;
      case CrownElementType.DIGITAL_MOVABLE_BUTTON:
        typeName = "滑动视角";
        break;
      case CrownElementType.DIGITAL_COMBINE_BUTTON:
        typeName = "组合键";
        break;
      case CrownElementType.DIGITAL_PAD:
        typeName = "十字方向键";
        break;
      case CrownElementType.ANALOG_STICK:
        typeName = "模拟摇杆";
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
        typeName = "轮盘菜单";
        break;
      case CrownElementType.SIMPLIFY_PERFORMANCE:
        typeName = "性能面板";
        break;
      default:
        typeName = `控件 #${el.element_type}`;
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
      mainTitle = getKeyHumanLabel(el.element_value).label;
    } else {
      mainTitle = typeName;
    }

    return {
      typeName,
      mainTitle,
      coords: `(${el.element_central_x}, ${el.element_central_y})`,
      size: `${el.element_width}×${el.element_height}`,
    };
  };

  // 过滤后的候选列表
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidateElements;
    const query = searchQuery.trim().toLowerCase();
    return candidateElements.filter((el) => {
      const info = getWidgetInfo(el);
      return (
        info.mainTitle.toLowerCase().includes(query) ||
        info.typeName.toLowerCase().includes(query) ||
        String(el.element_id).includes(query) ||
        ("element_value" in el && String(el.element_value).toLowerCase().includes(query))
      );
    });
  }, [candidateElements, searchQuery]);

  return (
    <div className="space-y-3.5 border-t border-[#eaeaea] pt-3.5 select-none">
      {/* 头部功能介绍 */}
      <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/70 p-3 border border-blue-100">
        <FolderKanban className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-semibold text-blue-950">
            组按键子控件绑定管理
          </div>
          <div className="text-blue-800/80 leading-relaxed mt-0.5">
            组按键自身为抽屉收纳容器，在下方勾选画布上的控件加入该组，点击组按键可展开/收起这些子控件。
          </div>
        </div>
      </div>

      {/* 1. 已绑定的子控件清单 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111111]">
            已绑定子控件 ({boundElements.length} 个)
          </span>
          {boundIds.length > 0 && (
            <button
              type="button"
              onClick={clearAllBindings}
              className="text-[11px] font-medium text-[#9f2f2d] hover:underline cursor-pointer"
            >
              清空全部
            </button>
          )}
        </div>

        {boundElements.length === 0 && orphanIds.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d4d4d0] bg-[#fafaf9] p-3.5 text-center text-xs text-[#888888]">
            暂未绑定任何子控件。请在下方列表中勾选画布上的控件。
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 rounded-lg border border-[#f0f0ee] bg-[#fafaf9]">
            {boundElements.map((child) => {
              const info = getWidgetInfo(child);
              return (
                <div
                  key={child.element_id}
                  onMouseEnter={() => setHoveredElement(child.element_id)}
                  onMouseLeave={() => setHoveredElement(null)}
                  className="group flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-[#ffffff] px-2.5 py-1 text-xs shadow-xs hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
                >
                  <span className="font-bold text-[#111111]">{info.mainTitle}</span>
                  <span className="text-[10px] text-[#6b7280]">({info.typeName})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBinding(child.element_id);
                    }}
                    className="rounded p-0.5 text-[#9ca3af] hover:bg-[#fee2e2] hover:text-[#dc2626] transition-colors cursor-pointer"
                    title="从该组移除"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}

            {/* 失效按键提示 */}
            {orphanIds.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>有 {orphanIds.length} 个已删除控件残留</span>
                <button
                  type="button"
                  onClick={removeOrphanIds}
                  className="text-[11px] font-bold text-amber-900 underline ml-1 cursor-pointer"
                >
                  一键清理
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. 画布控件选择器列表 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111111]">
            选择画布控件加入该组
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllCandidates}
              className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer"
            >
              全选
            </button>
          </div>
        </div>

        {/* 快捷搜索框 (控件大于4个时呈现) */}
        {candidateElements.length > 4 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#9ca3af]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索按键名称、键码或类型..."
              className="w-full rounded-lg border border-[#e5e7eb] bg-[#ffffff] pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder:text-[#9ca3af] outline-none focus:border-[#111111]"
            />
          </div>
        )}

        {candidateElements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d4d4d0] bg-[#fafaf9] p-4 text-center text-xs text-[#888888]">
            画布上暂无其他控件，请先通过底部工具栏添加按键或摇杆。
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl border border-[#e5e7eb] bg-[#ffffff] p-1.5 divide-y divide-[#f3f4f6]">
            {filteredCandidates.map((cand) => {
              const isBound = boundIds.includes(cand.element_id);
              const info = getWidgetInfo(cand);
              const otherGroup = otherGroupsChildMap.get(cand.element_id);

              return (
                <div
                  key={cand.element_id}
                  onClick={() => toggleElementBinding(cand.element_id)}
                  onMouseEnter={() => setHoveredElement(cand.element_id)}
                  onMouseLeave={() => setHoveredElement(null)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors pt-2.5 ${
                    isBound
                      ? "bg-blue-50/70 border-l-2 border-blue-600"
                      : "hover:bg-[#f9fafb]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="text-blue-600 shrink-0">
                      {isBound ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-[#9ca3af]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-[#111111] truncate">
                          {info.mainTitle}
                        </span>
                        <span className="rounded bg-[#f3f4f6] px-1.5 py-0.2 text-[10px] text-[#4b5563] shrink-0 font-medium">
                          {info.typeName}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#888888] font-mono leading-tight mt-0.5 truncate">
                        坐标 {info.coords} · {info.size}
                        {otherGroup && (
                          <span className="text-amber-700 ml-1 font-sans">
                            (已属于: {otherGroup})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold shrink-0 px-2 py-0.5 rounded ${
                      isBound
                        ? "bg-blue-600 text-[#ffffff]"
                        : "text-[#6b7280] group-hover:text-[#111111]"
                    }`}
                  >
                    {isBound ? "已加入" : "添加"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. 组展开与收纳行为设置 */}
      <div className="space-y-2.5 border-t border-[#eaeaea] pt-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
          抽屉展开与行为配置
        </div>

        <div>
          <label className="text-xs font-medium text-[#4b5563] block mb-1">
            子按键常态显示模式
          </label>
          <select
            value={element.element_sense ?? CrownChildVisibility.VISIBLE}
            onChange={(e) => onUpdate({ element_sense: Number(e.target.value) as CrownChildVisibility })}
            className="w-full rounded-lg border border-[#e5e7eb] bg-[#ffffff] px-2.5 py-1.5 text-xs text-[#111111] outline-none focus:border-[#111111]"
          >
            <option value={CrownChildVisibility.VISIBLE}>
              常态全部展开显示 (VISIBLE)
            </option>
            <option value={CrownChildVisibility.GONE}>
              常态隐藏收起不占位 (GONE - 推荐)
            </option>
            <option value={CrownChildVisibility.INVISIBLE}>
              常态不可见但保留占位 (INVISIBLE)
            </option>
          </select>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-medium text-[#111111]">
              普通模式下拖动整组
            </div>
            <div className="text-[11px] text-[#888888]">
              移动组按键时带动所有子控件同时平移
            </div>
          </div>
          <input
            type="checkbox"
            checked={parsedExtra.movableInNormalMode}
            onChange={(e) => updateExtra({ movableInNormalMode: e.target.checked })}
            className="h-4 w-4 rounded accent-[#111111] cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-medium text-[#111111]">
              隐藏组按钮自身
            </div>
            <div className="text-[11px] text-[#888888]">
              仅由 gb{element.element_id} 宏动作触发，自身不显示
            </div>
          </div>
          <input
            type="checkbox"
            checked={element.element_flag1 === 1}
            onChange={(e) => onUpdate({ element_flag1: e.target.checked ? 1 : 0 })}
            className="h-4 w-4 rounded accent-[#111111] cursor-pointer"
          />
        </div>
      </div>

      {/* 4. 底层原始 ID 列表查看（可折叠） */}
      <div className="border-t border-[#eaeaea] pt-2">
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
            <span className="text-[10px] text-[#9ca3af] block">
              对应 CROWN 协议 element_value 字段，手动修改会同步刷新上方勾选项。
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
