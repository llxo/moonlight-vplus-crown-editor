/**
 * @file keyMapping.ts
 * @description Web 键盘事件到 Android KeyCode 映射转换引擎与多设备按键人类友好词典
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import { CrownGamepadMask, CrownMouseCode, CrownSpecialAction } from "../crownSchema";

// ============================================================================
// 1. Web KeyboardEvent.code -> Android KeyCode (k<number>)
// ============================================================================

export const WEB_CODE_TO_ANDROID_KEY: Record<string, string> = {
  // 字母键 A-Z (Android 29 ~ 54)
  KeyA: "k29",
  KeyB: "k30",
  KeyC: "k31",
  KeyD: "k32",
  KeyE: "k33",
  KeyF: "k34",
  KeyG: "k35",
  KeyH: "k36",
  KeyI: "k37",
  KeyJ: "k38",
  KeyK: "k39",
  KeyL: "k40",
  KeyM: "k41",
  KeyN: "k42",
  KeyO: "k43",
  KeyP: "k44",
  KeyQ: "k45",
  KeyR: "k46",
  KeyS: "k47",
  KeyT: "k48",
  KeyU: "k49",
  KeyV: "k50",
  KeyW: "k51",
  KeyX: "k52",
  KeyY: "k53",
  KeyZ: "k54",

  // 主键盘数字键 0-9 (Android 7 ~ 16)
  Digit0: "k7",
  Digit1: "k8",
  Digit2: "k9",
  Digit3: "k10",
  Digit4: "k11",
  Digit5: "k12",
  Digit6: "k13",
  Digit7: "k14",
  Digit8: "k15",
  Digit9: "k16",

  // 小键盘数字键 (Numpad)
  Numpad0: "k144",
  Numpad1: "k145",
  Numpad2: "k146",
  Numpad3: "k147",
  Numpad4: "k148",
  Numpad5: "k149",
  Numpad6: "k150",
  Numpad7: "k151",
  Numpad8: "k152",
  Numpad9: "k153",
  NumpadDivide: "k154",
  NumpadMultiply: "k155",
  NumpadSubtract: "k156",
  NumpadAdd: "k157",
  NumpadDecimal: "k158",
  NumpadEnter: "k66",

  // 功能键 F1-F12 (Android 131 ~ 142)
  F1: "k131",
  F2: "k132",
  F3: "k133",
  F4: "k134",
  F5: "k135",
  F6: "k136",
  F7: "k137",
  F8: "k138",
  F9: "k139",
  F10: "k140",
  F11: "k141",
  F12: "k142",

  // 控制与编辑键
  Space: "k62",
  Enter: "k66",
  Escape: "k111",
  Tab: "k61",
  Backspace: "k67",
  Insert: "k124",
  Delete: "k112",
  Home: "k122",
  End: "k123",
  PageUp: "k92",
  PageDown: "k93",
  CapsLock: "k115",
  ScrollLock: "k116",
  Pause: "k121",

  // 修饰键
  ControlLeft: "k113",
  ControlRight: "k114",
  ShiftLeft: "k59",
  ShiftRight: "k60",
  AltLeft: "k57",
  AltRight: "k58",

  // 方向导航键
  ArrowUp: "k19",
  ArrowDown: "k20",
  ArrowLeft: "k21",
  ArrowRight: "k22",

  // 标点符号与特殊字符
  Backquote: "k68", // `
  Minus: "k69", // -
  Equal: "k70", // =
  BracketLeft: "k71", // [
  BracketRight: "k72", // ]
  Backslash: "k73", // \
  Semicolon: "k74", // ;
  Quote: "k75", // '
  Comma: "k55", // ,
  Period: "k56", // .
  Slash: "k76", // /
};

// ============================================================================
// 2. 按键编码的人类可读标签字典
// ============================================================================

export const KEYBOARD_LABEL_MAP: Record<string, string> = {
  k29: "A",
  k30: "B",
  k31: "C",
  k32: "D",
  k33: "E",
  k34: "F",
  k35: "G",
  k36: "H",
  k37: "I",
  k38: "J",
  k39: "K",
  k40: "L",
  k41: "M",
  k42: "N",
  k43: "O",
  k44: "P",
  k45: "Q",
  k46: "R",
  k47: "S",
  k48: "T",
  k49: "U",
  k50: "V",
  k51: "W",
  k52: "X",
  k53: "Y",
  k54: "Z",
  k7: "0",
  k8: "1",
  k9: "2",
  k10: "3",
  k11: "4",
  k12: "5",
  k13: "6",
  k14: "7",
  k15: "8",
  k16: "9",
  k62: "空格 (Space)",
  k66: "回车 (Enter)",
  k111: "ESC (Escape)",
  k61: "Tab",
  k67: "退格 (Backspace)",
  k112: "Delete",
  k124: "Insert",
  k115: "Caps Lock",
  k113: "Ctrl (左)",
  k114: "Ctrl (右)",
  k59: "Shift (左)",
  k60: "Shift (右)",
  k57: "Alt (左)",
  k58: "Alt (右)",
  k19: "方向键 ↑ (上)",
  k20: "方向键 ↓ (下)",
  k21: "方向键 ← (左)",
  k22: "方向键 → (右)",
  k131: "F1",
  k132: "F2",
  k133: "F3",
  k134: "F4",
  k135: "F5",
  k136: "F6",
  k137: "F7",
  k138: "F8",
  k139: "F9",
  k140: "F10",
  k141: "F11",
  k142: "F12",
  k68: "` (波浪号)",
  k69: "- (减号)",
  k70: "= (等号)",
  k71: "[ (左方括号)",
  k72: "] (右方括号)",
  k73: "\\ (反斜杠)",
  k74: "; (分号)",
  k75: "' (单引号)",
  k55: ", (逗号)",
  k56: ". (句号)",
  k76: "/ (斜杠)",
};

export const GAMEPAD_ITEMS = [
  { code: CrownGamepadMask.A, label: "手柄 A 键", group: "动作键" },
  { code: CrownGamepadMask.B, label: "手柄 B 键", group: "动作键" },
  { code: CrownGamepadMask.X, label: "手柄 X 键", group: "动作键" },
  { code: CrownGamepadMask.Y, label: "手柄 Y 键", group: "动作键" },
  { code: CrownGamepadMask.LB, label: "LB (左肩键)", group: "肩键与扳机" },
  { code: CrownGamepadMask.RB, label: "RB (右肩键)", group: "肩键与扳机" },
  { code: CrownGamepadMask.LEFT_TRIGGER, label: "LT (左扳机)", group: "肩键与扳机" },
  { code: CrownGamepadMask.RIGHT_TRIGGER, label: "RT (右扳机)", group: "肩键与扳机" },
  { code: CrownGamepadMask.LEFT_STICK_CLICK, label: "LS / L3 (左摇杆下压)", group: "摇杆按键" },
  { code: CrownGamepadMask.RIGHT_STICK_CLICK, label: "RS / R3 (右摇杆下压)", group: "摇杆按键" },
  { code: CrownGamepadMask.DPAD_UP, label: "十字键 ↑ (上)", group: "方向十字键" },
  { code: CrownGamepadMask.DPAD_DOWN, label: "十字键 ↓ (下)", group: "方向十字键" },
  { code: CrownGamepadMask.DPAD_LEFT, label: "十字键 ← (左)", group: "方向十字键" },
  { code: CrownGamepadMask.DPAD_RIGHT, label: "十字键 → (右)", group: "方向十字键" },
  { code: CrownGamepadMask.START, label: "START (菜单/暂停)", group: "系统功能键" },
  { code: CrownGamepadMask.BACK, label: "BACK / SELECT (返回)", group: "系统功能键" },
  { code: CrownGamepadMask.GUIDE, label: "GUIDE (主页/西瓜键)", group: "系统功能键" },
];

export const MOUSE_ITEMS = [
  { code: CrownMouseCode.LEFT_BUTTON, label: "鼠标左键 (Left Click)", desc: "常规点击/开火" },
  { code: CrownMouseCode.RIGHT_BUTTON, label: "鼠标右键 (Right Click)", desc: "瞄准/重击/菜单" },
  { code: CrownMouseCode.MIDDLE_BUTTON, label: "鼠标中键 (Middle Click)", desc: "滚轮下压点击" },
  { code: CrownMouseCode.X1_BUTTON, label: "鼠标侧键 1 (X1 / 后退)", desc: "拇指后侧键" },
  { code: CrownMouseCode.X2_BUTTON, label: "鼠标侧键 2 (X2 / 前进)", desc: "拇指前侧键" },
  { code: CrownMouseCode.SCROLL_UP, label: "滚轮向上滚动 (Scroll Up)", desc: "切枪/缩放视野" },
  { code: CrownMouseCode.SCROLL_DOWN, label: "滚轮向下滚动 (Scroll Down)", desc: "切枪/缩放视野" },
];

export const SPECIAL_ACTION_ITEMS = [
  { code: CrownSpecialAction.NULL, label: "未绑定 (null)", desc: "清空按键" },
  { code: CrownSpecialAction.MOUSE_MODE_SWITCH, label: "MMS (鼠标模式轮换)", desc: "经典 -> 触控板 -> 多点" },
  { code: CrownSpecialAction.CLASSIC_MOUSE_SWITCH, label: "CMS (直切经典鼠标)", desc: "直接开启传统鼠标" },
  { code: CrownSpecialAction.TRACKPAD_MODE, label: "TPM (直切触控板模式)", desc: "笔记本触控板手势" },
  { code: CrownSpecialAction.MULTI_TOUCH_MODE, label: "MTM (直切多点触控)", desc: "原生多点触控模式" },
  { code: CrownSpecialAction.MOUSE_ENABLE_SWITCH, label: "MES (触控输入总开关)", desc: "开启或关闭全局触控" },
  { code: CrownSpecialAction.PC_KEYBOARD_SWITCH, label: "PKS (PC 虚拟键盘开关)", desc: "呼出/隐藏 PC 键盘" },
  { code: CrownSpecialAction.ANDROID_KEYBOARD_SWITCH, label: "AKS (Android 软键盘开关)", desc: "呼出系统软键盘" },
  { code: CrownSpecialAction.CONFIG_SWITCH_DIALOG, label: "CSW (弹出配置切换器)", desc: "呼出按键配置列表" },
  { code: CrownSpecialAction.PAN_ZOOM_MODE, label: "PZM (双指平移缩放开关)", desc: "双指拖动缩放画面" },
  { code: CrownSpecialAction.OPEN_GAME_MENU, label: "OGM (呼出游戏悬浮菜单)", desc: "Moonlight 侧滑菜单" },
  { code: CrownSpecialAction.EDIT_MODE_SWITCH, label: "EMS (进入排布编辑模式)", desc: "进入按键自定义" },
  { code: CrownSpecialAction.MOUSE_MOVE_ONLY, label: "MMO (仅鼠标移动模式)", desc: "滑动仅移动光标" },
];

export type KeyCategory = "keyboard" | "gamepad" | "mouse" | "special" | "unknown";

/**
 * 根据按键编码解析设备分类与可读友好名称
 */
export function getKeyHumanLabel(keyCode: string | undefined): {
  label: string;
  category: KeyCategory;
  rawCode: string;
} {
  const code = (keyCode || "").trim();
  if (!code || code === "null") {
    return { label: "未绑定 (null)", category: "special", rawCode: "null" };
  }

  // 1. 键盘 (k<int>)
  if (code.startsWith("k")) {
    const name = KEYBOARD_LABEL_MAP[code];
    return {
      label: name ? `${name} (${code})` : `键盘 [${code}]`,
      category: "keyboard",
      rawCode: code,
    };
  }

  // 2. 鼠标 (m<int> 或 SU/SD)
  const mouseFound = MOUSE_ITEMS.find((m) => m.code === code);
  if (mouseFound) {
    return {
      label: `${mouseFound.label} (${code})`,
      category: "mouse",
      rawCode: code,
    };
  }

  // 3. 手柄 (g<maskBit> 或 lt/rt/LS/RS)
  const gamepadFound = GAMEPAD_ITEMS.find((g) => g.code === code);
  if (gamepadFound) {
    return {
      label: `${gamepadFound.label} (${code})`,
      category: "gamepad",
      rawCode: code,
    };
  }

  // 4. 特殊动作
  const specialFound = SPECIAL_ACTION_ITEMS.find((s) => s.code === code);
  if (specialFound) {
    return {
      label: `${specialFound.label}`,
      category: "special",
      rawCode: code,
    };
  }

  // 动态组按键展开: gb<id>
  if (code.startsWith("gb")) {
    return {
      label: `展开组按键 (#${code.slice(2)})`,
      category: "special",
      rawCode: code,
    };
  }

  return {
    label: `自定义编码 (${code})`,
    category: "unknown",
    rawCode: code,
  };
}
