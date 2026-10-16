/**
 * @file crownSchema.ts
 * @description Moonlight-vplus 王冠模式 (Crown Mode) 虚拟按键数据协议、类型系统与坐标换算引擎
 * @author Moonlight-vplus Architect
 * @version 1.0.0
 * @license Apache-2.0
 */

// ============================================================================
// 1. 常量与枚举定义 (Enums & Constants)
// ============================================================================

/**
 * 虚拟控制器支持的底层数据库协议版本号
 */
export const CROWN_DATABASE_VERSION = 9 as const;

/**
 * 社区分享包协议版本号
 */
export const CROWN_BUNDLE_SCHEMA_VERSION = 1 as const;

/**
 * 社区分享包 Kind 标识
 */
export const CROWN_BUNDLE_KIND = "crown-profile-bundle" as const;

/**
 * 虚拟控件元素类型枚举 (ElementType)
 */
export enum CrownElementType {
  /** 普通数字按键 */
  DIGITAL_COMMON_BUTTON = 0,
  /** 开关锁定型按键 */
  DIGITAL_SWITCH_BUTTON = 1,
  /** 可移动/带滑动视角的按键 */
  DIGITAL_MOVABLE_BUTTON = 2,
  /** 组合键 / 宏按键 (最多 5 个按键组合) */
  DIGITAL_COMBINE_BUTTON = 3,
  /** 组按键 / 抽屉收纳按键 */
  GROUP_BUTTON = 4,
  /** 十字方向键 D-Pad */
  DIGITAL_PAD = 20,
  /** 模拟双轴摇杆 (Analog Stick) */
  ANALOG_STICK = 30,
  /** 数字方向摇杆 (Digital Stick) */
  DIGITAL_STICK = 31,
  /** 隐形/全屏幕模拟摇杆 */
  INVISIBLE_ANALOG_STICK = 32,
  /** 隐形/全屏幕数字摇杆 */
  INVISIBLE_DIGITAL_STICK = 33,
  /** 极简性能与状态指示浮窗 */
  SIMPLIFY_PERFORMANCE = 50,
  /** 多功能轮盘快捷键 (Wheel Pad) */
  WHEEL_PAD = 54,
}

/**
 * 摇杆移动行为模式 (AnalogStick moveMode)
 */
export enum CrownStickMoveMode {
  /** 绝对位置固定 */
  FIXED_ABSOLUTE = 0,
  /** 随手指按下位置相对移动 */
  FOLLOW_FINGER_RELATIVE = 1,
}

/**
 * 组按键子元素在默认状态下的可见性 (View.Visibility)
 */
export enum CrownChildVisibility {
  /** 可见 */
  VISIBLE = 0,
  /** 不可见但占位 */
  INVISIBLE = 4,
  /** 隐藏且不占位 */
  GONE = 8,
}

/**
 * 轮盘菜单扇区对齐方式
 */
export enum CrownWheelSegmentAlignment {
  /** 扇区中心对齐垂直顶部 */
  CENTER = "center",
  /** 扇区边缘对齐垂直顶部 (偏置半个扇区角) */
  EDGE = "edge",
}

/**
 * 手柄按键掩码编码映射表 (XInput Controller Bitmask)
 */
export const CrownGamepadMask = {
  DPAD_UP: "g1",
  DPAD_DOWN: "g2",
  DPAD_LEFT: "g4",
  DPAD_RIGHT: "g8",
  START: "g16",
  BACK: "g32",
  LEFT_STICK_CLICK: "g64",
  RIGHT_STICK_CLICK: "g128",
  LB: "g256",
  RB: "g512",
  GUIDE: "g1024",
  A: "g4096",
  B: "g8192",
  X: "g16384",
  Y: "g32768",
  // 模拟输入
  LEFT_TRIGGER: "lt",
  RIGHT_TRIGGER: "rt",
  LEFT_STICK_AXIS: "LS",
  RIGHT_STICK_AXIS: "RS",
} as const;

/**
 * 鼠标输入编码映射表
 */
export const CrownMouseCode = {
  LEFT_BUTTON: "m1",
  MIDDLE_BUTTON: "m2",
  RIGHT_BUTTON: "m3",
  X1_BUTTON: "m4",
  X2_BUTTON: "m5",
  SCROLL_UP: "SU",
  SCROLL_DOWN: "SD",
} as const;

/**
 * 运行时功能与特殊操作命令编码
 */
export const CrownSpecialAction = {
  /** 未绑定任何按键 */
  NULL: "null",
  /** 切换鼠标模式 (循环切换: 经典鼠标 -> 多点触控 -> 触控板) */
  MOUSE_MODE_SWITCH: "MMS",
  /** 直切经典鼠标模式 */
  CLASSIC_MOUSE_SWITCH: "CMS",
  /** 直切触控板模式 */
  TRACKPAD_MODE: "TPM",
  /** 直切多点触控模式 */
  MULTI_TOUCH_MODE: "MTM",
  /** 触控使能总开关 */
  MOUSE_ENABLE_SWITCH: "MES",
  /** 呼出/隐藏 PC 虚拟键盘 */
  PC_KEYBOARD_SWITCH: "PKS",
  /** 呼出/隐藏 Android 软键盘 */
  ANDROID_KEYBOARD_SWITCH: "AKS",
  /** 弹出配置列表切换选择框 */
  CONFIG_SWITCH_DIALOG: "CSW",
  /** 双指平移缩放模式切换 */
  PAN_ZOOM_MODE: "PZM",
  /** 呼出游戏菜单 (Game Menu) */
  OPEN_GAME_MENU: "OGM",
  /** 进入按键编辑排布模式 */
  EDIT_MODE_SWITCH: "EMS",
  /** 仅鼠标移动模式开关 */
  MOUSE_MOVE_ONLY: "MMO",
} as const;

/**
 * Android KeyEvent 常用键值常量映射 (仅列出最常用项，协议支持任意 k<number>)
 */
export const CrownAndroidKeyCode = {
  A: "k29",
  B: "k30",
  C: "k31",
  D: "k32",
  E: "k33",
  F: "k34",
  G: "k35",
  H: "k36",
  I: "k37",
  J: "k38",
  K: "k39",
  L: "k40",
  M: "k41",
  N: "k42",
  O: "k43",
  P: "k44",
  Q: "k45",
  R: "k46",
  S: "k47",
  T: "k48",
  U: "k49",
  V: "k50",
  W: "k51",
  X: "k52",
  Y: "k53",
  Z: "k54",
  ENTER: "k66",
  SPACE: "k62",
  TAB: "k61",
  ESCAPE: "k111",
  BACKSPACE: "k67",
  CTRL_LEFT: "k113",
  CTRL_RIGHT: "k114",
  SHIFT_LEFT: "k59",
  SHIFT_RIGHT: "k60",
  ALT_LEFT: "k57",
  ALT_RIGHT: "k58",
  CAPS_LOCK: "k115",
  UP: "k19",
  DOWN: "k20",
  LEFT: "k21",
  RIGHT: "k22",
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
} as const;


// ============================================================================
// 2. 元素基础接口与可辨识联合类型 (Discriminated Unions)
// ============================================================================

/**
 * 所有按键元素通用的物理与样式基础属性
 */
export interface CrownBaseElement {
  /** 控件唯一标识符 (毫秒时间戳) */
  element_id: number;
  /** 所属配置 Profile 的 ID */
  config_id: number;
  /** 控件图层深度 (Layer，数值越小越靠下) */
  element_layer: number;
  /** 控件中心点 X 坐标 (绝对屏幕物理像素) */
  element_central_x: number;
  /** 控件中心点 Y 坐标 (绝对屏幕物理像素) */
  element_central_y: number;
  /** 控件宽度 (绝对屏幕物理像素) */
  element_width: number;
  /** 控件高度 (绝对屏幕物理像素) */
  element_height: number;
  /** 描边线宽 (绝对物理像素) */
  element_thick: number;
  /** 边框/常态颜色 (32-bit ARGB 有符号整数) */
  element_color: number;
  /** 按下时的高亮颜色 (32-bit ARGB 有符号整数) */
  element_pressed_color: number;
  /** 填充背景颜色 (32-bit ARGB 有符号整数) */
  element_background_color: number;
  /** 预留/历史标志位 1 */
  element_flag1?: number;
}

/**
 * 具有按钮形态的元素通用文字样式属性
 */
export interface CrownTextStylingAttributes {
  /** 按钮表面显示的标签文本 */
  element_text: string;
  /** 常态文字颜色 (32-bit ARGB 有符号整数，默认 -1 即 0xFFFFFFFF) */
  normalTextColor: number;
  /** 按下时文字颜色 (32-bit ARGB 有符号整数) */
  pressedTextColor: number;
  /** 文字相对于按键高度的百分比 (例如 25 代表 25%) */
  textSizePercent: number;
  /** 圆角半径 (绝对物理像素) */
  element_radius: number;
}

/** 0: 普通按键 */
export interface CrownDigitalCommonButtonElement extends CrownBaseElement, CrownTextStylingAttributes {
  element_type: CrownElementType.DIGITAL_COMMON_BUTTON;
  /** 绑定的按键编码 (如 "k29", "m1", "g4096") */
  element_value: string;
}

/** 1: 自锁型开关按键 */
export interface CrownDigitalSwitchButtonElement extends CrownBaseElement, CrownTextStylingAttributes {
  element_type: CrownElementType.DIGITAL_SWITCH_BUTTON;
  /** 绑定的按键编码 */
  element_value: string;
}

/** 2: 可滑动/移动按键 (附加额外属性结构) */
export interface CrownDigitalMovableExtraAttributes {
  /** 是否启用触控板滑动模式 */
  isTrackpadMode: boolean;
}

export interface CrownDigitalMovableButtonElement extends CrownBaseElement, CrownTextStylingAttributes {
  element_type: CrownElementType.DIGITAL_MOVABLE_BUTTON;
  /** 绑定的按键编码 (若 isTrackpadMode=true 则内部强制指向 m1) */
  element_value: string;
  /** 是否开启摇杆视角模式 (0 关, 1 开) */
  element_mode: number;
  /** 视角移动灵敏度 (默认 100) */
  element_sense: number;
  /** 序列化的扩展属性 JSON 字符串 */
  extra_attributes: string;
}

/** 3: 组合键 (宏按键) */
export interface CrownDigitalCombineButtonElement extends CrownBaseElement, CrownTextStylingAttributes {
  element_type: CrownElementType.DIGITAL_COMBINE_BUTTON;
  /** 宏槽位 1 键值 */
  element_value: string;
  /** 宏槽位 2 键值 ("null" 代表未设置) */
  element_up_value: string;
  /** 宏槽位 3 键值 ("null" 代表未设置) */
  element_down_value: string;
  /** 宏槽位 4 键值 ("null" 代表未设置) */
  element_left_value: string;
  /** 宏槽位 5 键值 ("null" 代表未设置) */
  element_right_value: string;
}

/** 4: 按键组 (抽屉式收纳按键) */
export interface CrownGroupButtonExtraAttributes {
  /** 是否允许在普通游戏运行模式下拖动整个组 */
  movableInNormalMode: boolean;
  /** 用户是否手动配置过该标志 */
  userHasManuallySet: boolean;
  /** 是否永久独立 */
  isPermanentlyIndependent?: boolean;
}

export interface CrownGroupButtonElement extends CrownBaseElement, CrownTextStylingAttributes {
  element_type: CrownElementType.GROUP_BUTTON;
  /** 逗号分隔的子元素 element_id 列表，初始为 "-1" */
  element_value: string;
  /** 子元素常态可见性 (复用 element_sense: 0=VISIBLE, 4=INVISIBLE, 8=GONE) */
  element_sense: CrownChildVisibility;
  /** 展开按钮自身是否隐藏 (复用 element_flag1: 1 隐藏, 0 显示) */
  element_flag1: number;
  /** 序列化的扩展属性 JSON 字符串 */
  extra_attributes: string;
}

/** 20: 十字方向键 D-Pad */
export interface CrownDigitalPadElement extends CrownBaseElement {
  element_type: CrownElementType.DIGITAL_PAD;
  /** 上方向键值 (如 "k51") */
  element_up_value: string;
  /** 下方向键值 (如 "k47") */
  element_down_value: string;
  /** 左方向键值 (如 "k29") */
  element_left_value: string;
  /** 右方向键值 (如 "k32") */
  element_right_value: string;
}

/** 30: 模拟摇杆 */
export interface CrownAnalogStickElement extends CrownBaseElement {
  element_type: CrownElementType.ANALOG_STICK;
  /** 模拟摇杆标识 ("LS" 或 "RS") */
  element_value: "LS" | "RS" | string;
  /** 摇杆中心按下键值 (如 "g64" 即 L3 / "g128" 即 R3) */
  element_middle_value: string;
  /** 死区半径百分比 (复用 element_sense，0 ~ 100，默认 30) */
  element_sense: number;
  /** 摇杆外圈半径 (绝对物理像素，此时 width = height = radius * 2) */
  element_radius: number;
  /** 移动模式 (0: 绝对固定, 1: 随手动态居中) */
  element_mode: CrownStickMoveMode;
}

/** 31: 数字方向摇杆 */
export interface CrownDigitalStickElement extends CrownBaseElement {
  element_type: CrownElementType.DIGITAL_STICK;
  /** 上方向键值 */
  element_up_value: string;
  /** 下方向键值 */
  element_down_value: string;
  /** 左方向键值 */
  element_left_value: string;
  /** 右方向键值 */
  element_right_value: string;
  /** 摇杆下压键值 */
  element_middle_value: string;
  /** 死区半径百分比 (复用 element_sense) */
  element_sense: number;
  /** 摇杆外圈半径 */
  element_radius: number;
}

/** 32: 隐形全区模拟摇杆 */
export interface CrownInvisibleAnalogStickElement extends CrownBaseElement {
  element_type: CrownElementType.INVISIBLE_ANALOG_STICK;
  /** 模拟摇杆标识 ("LS" 或 "RS") */
  element_value: string;
  /** 摇杆下压按键 */
  element_middle_value: string;
  /** 死区百分比 */
  element_sense: number;
  /** 内部感应圆圈半径 */
  element_radius: number;
}

/** 33: 隐形全区数字摇杆 */
export interface CrownInvisibleDigitalStickElement extends CrownBaseElement {
  element_type: CrownElementType.INVISIBLE_DIGITAL_STICK;
  element_up_value: string;
  element_down_value: string;
  element_left_value: string;
  element_right_value: string;
  element_middle_value: string;
  element_sense: number;
  element_radius: number;
}

/** 50: 极简性能面板 (悬浮状态栏) */
export interface CrownSimplifyPerformanceElement extends CrownBaseElement {
  element_type: CrownElementType.SIMPLIFY_PERFORMANCE;
  /** 模板字符串，支持 ##帧率##, ##网络延时##, ##解码时间##, HH:MM:SS 等占位符 */
  element_text: string;
  /** 字体大小 (复用 element_thick，默认 30) */
  element_thick: number;
  /** 字体颜色 (复用 element_color) */
  element_color: number;
  /** 圆角半径 */
  element_radius: number;
}

/** 54: 轮盘菜单 (Wheel Pad) 扩展属性 */
export interface CrownWheelPadExtraAttributes {
  /** 扇区常态文本颜色 (32-bit ARGB) */
  normalTextColor: number;
  /** 扇区按下文本颜色 (32-bit ARGB) */
  pressedTextColor: number;
  /** 轮盘中心预览文本颜色 (32-bit ARGB) */
  centerTextColor: number;
  /** 扇区文字大小百分比 */
  textSizePercent: number;
  /** 中心文字大小百分比 */
  centerTextSizePercent: number;
  /** 悬停触发文字大小百分比 */
  triggerTextSizePercent: number;
  /** 是否在悬停组按键时预览其子按键 */
  previewGroupChildren: boolean;
  /** 扇区对齐方式 ("center" 或 "edge") */
  segmentAlignment: CrownWheelSegmentAlignment | string;
}

export interface CrownWheelPadElement extends CrownBaseElement {
  element_type: CrownElementType.WHEEL_PAD;
  /**
   * 扇区绑定列表编码字符串。
   * 格式: 各扇区以逗号分隔，每个扇区格式为 "keyCode|DisplayName" 或单纯 "keyCode"。
   * 例如: "k51|前,k32|右,k47|后,k29|左"
   */
  element_value: string;
  /** 轮盘中心常态显示文本 (非空表示为居中弹窗触发式轮盘) */
  element_text: string;
  /** 扇区总数 (存储在 element_mode，如 8) */
  element_mode: number;
  /** 内圈空心半径比例百分比 (存储在 element_sense，如 30 代表 30%) */
  element_sense: number;
  /** 是否在屏幕正中央弹出 (复用 element_flag1: 1 是, 0 否) */
  element_flag1: number;
  /** 序列化的 WheelPadExtraAttributes JSON 字符串 */
  extra_attributes: string;
}

/**
 * 虚拟控制器元素的完全可辨识联合类型 (Discriminated Union)
 */
export type CrownElement =
  | CrownDigitalCommonButtonElement
  | CrownDigitalSwitchButtonElement
  | CrownDigitalMovableButtonElement
  | CrownDigitalCombineButtonElement
  | CrownGroupButtonElement
  | CrownDigitalPadElement
  | CrownAnalogStickElement
  | CrownDigitalStickElement
  | CrownInvisibleAnalogStickElement
  | CrownInvisibleDigitalStickElement
  | CrownSimplifyPerformanceElement
  | CrownWheelPadElement;


// ============================================================================
// 3. 全局设置与顶层配置文件结构 (Global Settings & Payload)
// ============================================================================

/**
 * 屏幕视口基准参考 (用于解决跨不同屏幕分辨率与比例导出时的适配)
 */
export interface CrownLayoutBasis {
  /** 制作该配置时的设备物理像素宽 (如 2400) */
  widthPx: number;
  /** 制作该配置时的设备物理像素高 (如 1080) */
  heightPx: number;
  /** 设备屏幕密度 DPI (如 400) */
  densityDpi: number;
  /** 设备像素比例缩放因子 (如 2.5) */
  density: number;
  /** 屏幕方向 ("landscape" | "portrait") */
  orientation: "landscape" | "portrait" | string;
}

/**
 * 全局配置实体 (对应 SQLite config 表)
 * 注意：布尔值字段在底层数据库与 JSON 中使用字符串 "true" | "false" 序列化
 */
export interface CrownGlobalSettings {
  /** 配置 ID (时间戳) */
  config_id: number;
  /** 配置显示名称 */
  config_name: string;
  /** 触控输入总使能 ("true" | "false") */
  touch_enable: "true" | "false";
  /** 触控板模式 ("true" 为触控板, "false" 为经典鼠标/多点触控) */
  touch_mode: "true" | "false";
  /** 触控手势滑动灵敏度 (默认 100) */
  touch_sense: number;
  /** 游戏手柄马达震动回馈使能 ("true" | "false") */
  game_vibrator: "true" | "false";
  /** 虚拟按键点击触觉反馈使能 ("true" | "false") */
  button_vibrator: "true" | "false";
  /** 鼠标滚轮转动步进速度 (默认 20) */
  mouse_wheel_speed: number;
  /** 多点触控模式使能 ("true" | "false") */
  enhanced_touch: "true" | "false";
  /** 快速动作列表 ID (可选) */
  quick_action_ids?: string;
}

/**
 * 底层配置导出的核心 Payload 数据实体 (ExportFile / Raw Payload)
 * settings 与 elements 在此处必须严格为二级序列化的 JSON 字符串
 */
export interface CrownRawPayload {
  /** 数据库协议版本 (固定为 9) */
  version: number;
  /** CrownGlobalSettings 对象的序列化 JSON 字符串 */
  settings: string;
  /** CrownElement[] 数组对象的序列化 JSON 字符串 */
  elements: string;
  /** 校验和: MD5(`${version}${settings}${elements}`) */
  md5: string;
}

/**
 * 解析后的完整配置结构 (内存中已反序列化 settings 与 elements)
 */
export interface CrownParsedProfile {
  version: number;
  settings: CrownGlobalSettings;
  elements: CrownElement[];
  md5: string;
}

/**
 * 社区分享包 (.crown.json) 顶层完整协议结构
 */
export interface CrownProfileShareBundle {
  /** 类型固定为 "crown-profile-bundle" */
  kind: typeof CROWN_BUNDLE_KIND;
  /** 协议架构版本 (目前为 1) */
  schemaVersion: number;
  /** 唯一标识符 */
  bundleId: string;
  /** 配置名称 */
  name: string;
  /** 配置描述与使用说明 */
  summary: string;
  /** 兼容性限制元数据 */
  compatibility: {
    minAppVersionCode: number;
    profilePayloadVersion: number;
  };
  /** 配置载荷包装体 */
  profile: {
    profileId: string;
    name: string;
    /** 二次序列化后的 CrownRawPayload 完整字符串 */
    payload: string;
    /** 对 payload 字符串进行 SHA-256 散列得到的 Hex */
    payloadSha256: string;
  };
  /** ISO 8601 创建时间 (如 "2024-04-01T12:00:00Z") */
  createdAt: string;
  /** ISO 8601 更新时间 */
  updatedAt: string;
  /** 导出应用包名 (如 "com.limelight") */
  packageName: string;
  /** 屏幕基准分辨率元数据 (供编辑器精确缩放) */
  layoutBasis?: CrownLayoutBasis;
  /** 作者信息 */
  author?: {
    name: string;
  };
  /** 适配游戏信息 */
  game?: {
    name: string;
  };
  /** 标签类别 */
  tags?: string[];
  /** 应用版本名称 */
  appVersionName?: string;
}


// ============================================================================
// 4. 坐标系换算纯函数 (Canvas <-> Config Coordinate Engine)
// ============================================================================

/**
 * 前端 Canvas 渲染矩形包围盒接口
 */
export interface CanvasRect {
  /** 矩形左上角 X 轴绝对像素坐标 */
  left: number;
  /** 矩形左上角 Y 轴绝对像素坐标 */
  top: number;
  /** 矩形实际渲染宽度 */
  width: number;
  /** 矩形实际渲染高度 */
  height: number;
}

/**
 * 视口尺寸规格
 */
export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * 纯函数：将 Moonlight-vplus 配置中的元素坐标转换为前端 Canvas 的矩形位置
 * 
 * 转换逻辑：
 * 1. 还原中心点锚点：Android View 的左上角 leftMargin = centralX - width / 2。
 * 2. 分辨率等比缩放：若提供了 layoutBasis 与当前 canvasViewport，则按照对应轴向进行无损等比缩放。
 * 
 * @param element 配置实体中的按键元素 (包含 centralX, centralY, width, height)
 * @param canvasViewport 当前前端 Canvas 视口的实际显示像素尺寸
 * @param layoutBasis 配置文件中记录的原生设备基准视口规格 (缺省时按 1:1 无缩放处理)
 * @returns Canvas 渲染用的左上角矩形包围盒 (left, top, width, height)
 */
export function configToCanvas(
  element: Pick<CrownBaseElement, "element_central_x" | "element_central_y" | "element_width" | "element_height">,
  canvasViewport?: ViewportSize,
  layoutBasis?: CrownLayoutBasis
): CanvasRect {
  const scaleX = (canvasViewport && layoutBasis && layoutBasis.widthPx > 0)
    ? canvasViewport.width / layoutBasis.widthPx
    : 1.0;

  const scaleY = (canvasViewport && layoutBasis && layoutBasis.heightPx > 0)
    ? canvasViewport.height / layoutBasis.heightPx
    : 1.0;

  // 1. 在基准坐标系下还原出基于左上角的原始像素
  const rawLeft = element.element_central_x - element.element_width / 2.0;
  const rawTop = element.element_central_y - element.element_height / 2.0;

  // 2. 映射至 Canvas 视口缩放空间
  return {
    left: rawLeft * scaleX,
    top: rawTop * scaleY,
    width: element.element_width * scaleX,
    height: element.element_height * scaleY,
  };
}

/**
 * 纯函数：将前端 Canvas 中用户编辑排布后的矩形位置换算回 Moonlight-vplus 配置数据
 * 
 * 换算逻辑：
 * 1. 视口反向缩放：将当前视口坐标反算回 layoutBasis 设定的基准物理设备坐标。
 * 2. 锚点转置：计算出矩形的几何中心点 centralX = left + width / 2，四舍五入为整型。
 * 
 * @param canvasRect 用户在 Canvas 上排布的矩形包围盒
 * @param canvasViewport 当前前端 Canvas 视口的实际显示像素尺寸
 * @param layoutBasis 配置文件中记录的原生设备基准视口规格 (缺省时按 1:1 无缩放处理)
 * @returns 符合 V+ 协议的坐标与尺寸整数属性 (element_central_x, element_central_y, element_width, element_height)
 */
export function canvasToConfig(
  canvasRect: CanvasRect,
  canvasViewport?: ViewportSize,
  layoutBasis?: CrownLayoutBasis
): Pick<CrownBaseElement, "element_central_x" | "element_central_y" | "element_width" | "element_height"> {
  const scaleX = (canvasViewport && layoutBasis && layoutBasis.widthPx > 0)
    ? canvasViewport.width / layoutBasis.widthPx
    : 1.0;

  const scaleY = (canvasViewport && layoutBasis && layoutBasis.heightPx > 0)
    ? canvasViewport.height / layoutBasis.heightPx
    : 1.0;

  // 1. 反算回原始基准分辨率
  const unscaledWidth = canvasRect.width / scaleX;
  const unscaledHeight = canvasRect.height / scaleY;
  const unscaledLeft = canvasRect.left / scaleX;
  const unscaledTop = canvasRect.top / scaleY;

  // 2. 将左上角转换回中心锚点，并执行精确整型舍入
  const centralX = Math.round(unscaledLeft + unscaledWidth / 2.0);
  const centralY = Math.round(unscaledTop + unscaledHeight / 2.0);
  const finalWidth = Math.round(unscaledWidth);
  const finalHeight = Math.round(unscaledHeight);

  return {
    element_central_x: centralX,
    element_central_y: centralY,
    element_width: finalWidth,
    element_height: finalHeight,
  };
}

/**
 * 辅助纯函数：将 Android ARGB 32 位有符号整数与前端十六进制颜色字符串进行互转
 */
export const CrownColorUtils = {
  /**
   * 将 32-bit ARGB 有符号整数转换为 #RRGGBBAA
   * @param intColor 有符号 32 位整数 (如 -1 或 -259495768)
   * @returns 8 位 HEX 字符串，格式为 "#RRGGBBAA"
   */
  intToRgbaHex(intColor: number): string {
    const uint32 = intColor >>> 0;
    const a = ((uint32 >> 24) & 0xff).toString(16).padStart(2, "0");
    const r = ((uint32 >> 16) & 0xff).toString(16).padStart(2, "0");
    const g = ((uint32 >> 8) & 0xff).toString(16).padStart(2, "0");
    const b = (uint32 & 0xff).toString(16).padStart(2, "0");
    return `#${r}${g}${b}${a}`;
  },

  /**
   * 将 #RRGGBBAA 十六进制颜色转换为 Android 接受的 32-bit ARGB 有符号整数
   */
  rgbaHexToInt(hex: string): number {
    const cleanHex = hex.replace("#", "");
    let r = 255, g = 255, b = 255, a = 255;
    if (cleanHex.length === 8) {
      r = parseInt(cleanHex.slice(0, 2), 16);
      g = parseInt(cleanHex.slice(2, 4), 16);
      b = parseInt(cleanHex.slice(4, 6), 16);
      a = parseInt(cleanHex.slice(6, 8), 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.slice(0, 2), 16);
      g = parseInt(cleanHex.slice(2, 4), 16);
      b = parseInt(cleanHex.slice(4, 6), 16);
    }
    const uint32 = ((a & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
    return uint32 | 0; // 转回 Signed 32-bit Integer
  },
};

// ============================================================================
// 5. 虚拟控件默认预设工厂 (Default Preset Factory)
// ============================================================================

/**
 * 创建王冠模式各类虚拟控件的默认标准实例（单一真实数据源，避免各处重复硬编码）
 */
export function createDefaultCrownElement(
  type: CrownElementType,
  centralX: number,
  centralY: number
): CrownElement {
  const base = {
    element_id: Date.now(),
    config_id: 1710000000000,
    element_central_x: centralX,
    element_central_y: centralY,
    element_thick: 3,
    element_layer: 50,
  };

  switch (type) {
    case CrownElementType.DIGITAL_COMMON_BUTTON:
      return {
        ...base,
        element_type: CrownElementType.DIGITAL_COMMON_BUTTON,
        element_text: "A",
        element_value: "k29",
        element_width: 120,
        element_height: 120,
        element_radius: 16,
        element_color: 0xff333333,
        element_pressed_color: 0xff000000,
        element_background_color: 0x15000000,
        normalTextColor: 0xff111111,
        pressedTextColor: 0xff000000,
        textSizePercent: 26,
      };

    case CrownElementType.DIGITAL_SWITCH_BUTTON:
      return {
        ...base,
        element_type: CrownElementType.DIGITAL_SWITCH_BUTTON,
        element_text: "LOCK",
        element_value: "k62", // Space
        element_width: 120,
        element_height: 120,
        element_radius: 16,
        element_color: 0xff346538,
        element_pressed_color: 0xff1e3d22,
        element_background_color: 0x15346538,
        normalTextColor: 0xff111111,
        pressedTextColor: 0xff111111,
        textSizePercent: 22,
      };

    case CrownElementType.DIGITAL_MOVABLE_BUTTON:
      return {
        ...base,
        element_type: CrownElementType.DIGITAL_MOVABLE_BUTTON,
        element_text: "AIM",
        element_value: "m3",
        element_width: 140,
        element_height: 140,
        element_radius: 70,
        element_color: 0xff1f6c9f,
        element_pressed_color: 0xff0f3650,
        element_background_color: 0x151f6c9f,
        normalTextColor: 0xff111111,
        pressedTextColor: 0xff111111,
        textSizePercent: 24,
        element_mode: 0,
        element_sense: 100,
        extra_attributes: JSON.stringify({ isTrackpadMode: false }),
      };

    case CrownElementType.ANALOG_STICK:
      return {
        ...base,
        element_type: CrownElementType.ANALOG_STICK,
        element_value: "LS",
        element_middle_value: "g64",
        element_width: 360,
        element_height: 360,
        element_radius: 180,
        element_layer: 46,
        element_color: 0xff444444,
        element_pressed_color: 0xff111111,
        element_background_color: 0x15000000,
        element_sense: 30,
        element_mode: CrownStickMoveMode.FIXED_ABSOLUTE,
      };

    case CrownElementType.DIGITAL_PAD:
      return {
        ...base,
        element_type: CrownElementType.DIGITAL_PAD,
        element_up_value: "k51", // W
        element_down_value: "k47", // S
        element_left_value: "k29", // A
        element_right_value: "k32", // D
        element_width: 320,
        element_height: 320,
        element_layer: 48,
        element_color: 0xff444444,
        element_pressed_color: 0xff111111,
        element_background_color: 0x18000000,
      };

    case CrownElementType.DIGITAL_COMBINE_BUTTON:
      return {
        ...base,
        element_type: CrownElementType.DIGITAL_COMBINE_BUTTON,
        element_text: "Ctrl+C",
        element_value: "k113", // Ctrl
        element_up_value: "k31", // C
        element_down_value: "null",
        element_left_value: "null",
        element_right_value: "null",
        element_width: 120,
        element_height: 120,
        element_radius: 16,
        element_color: 0xff5c3e75,
        element_pressed_color: 0xff352343,
        element_background_color: 0x155c3e75,
        normalTextColor: 0xff111111,
        pressedTextColor: 0xff111111,
        textSizePercent: 22,
      };

    case CrownElementType.WHEEL_PAD:
      return {
        ...base,
        element_type: CrownElementType.WHEEL_PAD,
        element_text: "RADIAL",
        element_value: "k8|1,k9|2,k10|3,k11|4,k12|5,k13|6,k14|7,k15|8",
        element_width: 440,
        element_height: 440,
        element_thick: 4,
        element_layer: 42,
        element_color: 0xff444444,
        element_pressed_color: 0xff111111,
        element_background_color: 0x18000000,
        element_mode: 8,
        element_sense: 30,
        element_flag1: 1,
        extra_attributes: JSON.stringify({
          normalTextColor: 0xff111111,
          pressedTextColor: 0xff111111,
          centerTextColor: 0xff111111,
          textSizePercent: 35,
          centerTextSizePercent: 60,
          triggerTextSizePercent: 40,
          previewGroupChildren: true,
          segmentAlignment: "center",
        }),
      };

    case CrownElementType.SIMPLIFY_PERFORMANCE:
      return {
        ...base,
        element_type: CrownElementType.SIMPLIFY_PERFORMANCE,
        element_text: "FPS: ##帧率## | 延迟: ##网络延时##ms | HH:MM",
        element_width: 380,
        element_height: 52,
        element_radius: 8,
        element_thick: 18,
        element_layer: 55,
        element_color: 0xff111111,
        element_pressed_color: 0xff111111,
        element_background_color: 0xe6ffffff,
      };

    default:
      // 缺省兜底按键
      return {
        ...base,
        element_type: CrownElementType.DIGITAL_COMMON_BUTTON,
        element_text: "BTN",
        element_value: "k29",
        element_width: 120,
        element_height: 120,
        element_radius: 16,
        element_color: 0xff333333,
        element_pressed_color: 0xff000000,
        element_background_color: 0x15000000,
        normalTextColor: 0xff111111,
        pressedTextColor: 0xff000000,
        textSizePercent: 26,
      };
  }
}

