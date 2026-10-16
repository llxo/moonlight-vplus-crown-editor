# Moonlight-vplus 王冠模式 (Crown Mode) 虚拟按键数据协议与规范手册

> **版本**: 1.0.0  
> **数据库协议版本 (DATABASE_VERSION)**: 9  
> **分享包架构版本 (SCHEMA_VERSION)**: 1  
> **适用目标**: 独立前端虚拟按键可视化编辑器 (Web Canvas / React / Vue)

---

## 1. 架构总览与文件包装体系

Moonlight-vplus 的按键配置在存储与分发上分为**外层分发包 (Crown Profile Bundle)** 与 **内层核心载荷 (Raw Payload)**。

### 1.1 社区分享包结构 (`.crown.json`)

由 `CrownProfileShareManager.kt` 负责打包与解析：

```json
{
  "kind": "crown-profile-bundle",
  "schemaVersion": 1,
  "bundleId": "crown.{suggestedFileStem}.{sha256[0..7]}",
  "name": "配置名称",
  "summary": "配置说明文字",
  "compatibility": {
    "minAppVersionCode": 100,
    "profilePayloadVersion": 9
  },
  "profile": {
    "profileId": "public-payload-{sha256}",
    "name": "配置名称",
    "payload": "{\"version\":9,\"settings\":\"...\",\"elements\":\"...\",\"md5\":\"...\"}",
    "payloadSha256": "64位SHA-256散列"
  },
  "createdAt": "2025-04-01T00:00:00Z",
  "updatedAt": "2025-04-01T00:00:00Z",
  "packageName": "com.limelight",
  "layoutBasis": {
    "widthPx": 2400,
    "heightPx": 1080,
    "densityDpi": 400,
    "density": 2.5,
    "orientation": "landscape"
  },
  "author": { "name": "作者名" },
  "game": { "name": "关联游戏名称" },
  "tags": ["FPS", "Custom"],
  "appVersionName": "1.2.0"
}
```

- **`payload` 字段特别机制**：
  `profile.payload` 是一个**二次序列化 (Stringified JSON)** 的字符串。
- **校验算法**：
  `payloadSha256 = SHA256(profile.payload)`（UTF-8 字符流小写十六进制）。

---

### 1.2 内层核心载荷结构 (Raw Payload)

对应 SQLite 数据库的 `ExportFile`：

```json
{
  "version": 9,
  "settings": "{\"config_id\":1710000000000,\"config_name\":\"default\",...}",
  "elements": "[{\"element_id\":1710000000001,\"config_id\":1710000000000,...},...]",
  "md5": "32位小写MD5散列"
}
```

- **序列化规则**：
  `settings` 为包含 `config` 表字段的 JSON 字符串；`elements` 为包含 `element` 表所有记录数组的 JSON 字符串。
- **MD5 校验和算法**（`MathUtils.computeMD5`）：
  $$\text{md5} = \text{MD5}(\text{version}.\text{toString}() + \text{settings} + \text{elements})$$
  必须严格按照此顺序拼接后进行 UTF-8 MD5 计算。

---

## 2. 全局配置字段表 (`settings` / `config` 表)

| 字段名称 | 真实类型 | 存储类型 | 默认值 | 详细说明 |
| :--- | :--- | :--- | :--- | :--- |
| `config_id` | `Long` | `INTEGER` | 时间戳 | 配置 Profile 唯一标识 |
| `config_name` | `String` | `TEXT` | `"default"` | 配置显示名称 (1~10 字符) |
| `touch_enable` | `Boolean` | `TEXT` | `"true"` | 触控输入使能 (`"true"` / `"false"`) |
| `touch_mode` | `Boolean` | `TEXT` | `"true"` | 触控板模式 (`"true"` 触控板, `"false"` 经典/多点) |
| `touch_sense` | `Int` | `INTEGER` | `100` | 触控滑动灵敏度 (1~200) |
| `game_vibrator` | `Boolean` | `TEXT` | `"false"` | 游戏手柄马达震动使能 |
| `button_vibrator`| `Boolean` | `TEXT` | `"false"` | 虚拟按键按压触觉反馈使能 |
| `mouse_wheel_speed` | `Int` | `INTEGER` | `20` | 滚轮滚动速度，实际间隔为 `120 - mouse_wheel_speed` ms |
| `enhanced_touch` | `Boolean` | `TEXT` | `"false"` | 多点触控模式使能 |
| `quick_action_ids`| `String` | `TEXT` | `""` | 快捷菜单按键 ID 关联串 |

---

## 3. 坐标系与锚点计算公式 (Coordinate Engine)

### 3.1 基础定义
1. **数值单位**：屏幕绝对物理像素整数（Int），非 `0.0 ~ 1.0` 浮点数。
2. **坐标原点**：屏幕左上角 $(0, 0)$，向右为 $+X$，向下为 $+Y$。
3. **数据锚点 (Anchor)**：存储于配置数据库中的 `element_central_x` 与 `element_central_y` 严格为**控件几何中心点**。

### 3.2 读取与渲染公式 (Config $\to$ Canvas / View)
Android View 的包围盒使用左边距 `leftMargin` 与顶边距 `topMargin` 布局：
$$\text{leftMargin} = \text{element\_central\_x} - \lfloor \frac{\text{element\_width}}{2} \rfloor$$
$$\text{topMargin} = \text{element\_central\_y} - \lfloor \frac{\text{element\_height}}{2} \rfloor$$

若前端 Canvas 具有视口缩放（基于 `layoutBasis`）：
$$S_x = \frac{\text{CanvasWidth}}{\text{layoutBasis.widthPx}}, \quad S_y = \frac{\text{CanvasHeight}}{\text{layoutBasis.heightPx}}$$
$$\text{canvas.left} = (\text{element\_central\_x} - \frac{\text{element\_width}}{2}) \times S_x$$
$$\text{canvas.top} = (\text{element\_central\_y} - \frac{\text{element\_height}}{2}) \times S_y$$
$$\text{canvas.width} = \text{element\_width} \times S_x$$
$$\text{canvas.height} = \text{element\_height} \times S_y$$

### 3.3 逆向保存公式 (Canvas / View $\to$ Config)
从用户排布好的矩形反算中心点：
$$\text{element\_central\_x} = \text{round}\left( \frac{\text{canvas.left}}{S_x} + \frac{\text{canvas.width}}{2 \times S_x} \right)$$
$$\text{element\_central\_y} = \text{round}\left( \frac{\text{canvas.top}}{S_y} + \frac{\text{canvas.height}}{2 \times S_y} \right)$$
$$\text{element\_width} = \text{round}\left( \frac{\text{canvas.width}}{S_x} \right)$$
$$\text{element\_height} = \text{round}\left( \frac{\text{canvas.height}}{S_y} \right)$$

---

## 4. 控件类型 (Element Types) 与特有属性映射

### 基础通用字段
- `element_id`: Long，唯一 ID。
- `config_id`: Long，所属配置 ID。
- `element_type`: Int，控件类型码。
- `element_width`, `element_height`: Int，绝对宽高。
- `element_central_x`, `element_central_y`: Int，中心点坐标。
- `element_layer`: Int，层级（默认 50，数值小在底层）。
- `element_thick`: Int，描边厚度。
- `element_color`, `element_pressed_color`, `element_background_color`: Signed 32-bit Int (ARGB)。

### 各类型专属字段分配表

| 控件类型 | Type | 字段复用映射与特有配置 |
| :--- | :---: | :--- |
| **普通按键 (DigitalCommonButton)** | `0` | `element_value`: 按键编码<br>`element_text`: 显示文本<br>`element_radius`: 圆角半径<br>`normalTextColor`, `pressedTextColor`, `textSizePercent` |
| **自锁开关 (DigitalSwitchButton)** | `1` | 同普通按键，具备点击自锁/解锁状态转换 |
| **滑动视角按键 (DigitalMovableButton)** | `2` | `element_mode`: 是否开启摇杆视角 (0/1)<br>`element_sense`: 视角灵敏度 (默认 100)<br>`extra_attributes`: JSON 包含 `{"isTrackpadMode": boolean}` (触控板模式下绑定 m1) |
| **组合按键 (DigitalCombineButton)** | `3` | **复用 5 列存储按键序列**：<br>`element_value`: 槽位 1<br>`element_up_value`: 槽位 2<br>`element_down_value`: 槽位 3<br>`element_left_value`: 槽位 4<br>`element_right_value`: 槽位 5 (未用填 `"null"`) |
| **组按键 (GroupButton)** | `4` | `element_value`: 逗号分隔的子元素 ID 列表 (如 `"101,102"`)<br>`element_sense`: 子按键默认可见性 (`0` VISIBLE, `4` INVISIBLE, `8` GONE)<br>`element_flag1`: 按钮自身是否隐藏 (1 是, 0 否)<br>`extra_attributes`: JSON 包含 `movableInNormalMode`, `userHasManuallySet`, `isPermanentlyIndependent` |
| **十字键 (DigitalPad)** | `20` | `element_up_value`: 上方向键值<br>`element_down_value`: 下方向键值<br>`element_left_value`: 左方向键值<br>`element_right_value`: 右方向键值 |
| **模拟摇杆 (AnalogStick)** | `30` | `element_value`: `"LS"` (左摇杆) 或 `"RS"` (右摇杆)<br>`element_middle_value`: 摇杆下压 (默认 `"g64"` 即 L3)<br>`element_sense`: 死区百分比 (默认 30)<br>`element_mode`: `0` 绝对固定, `1` 随手动态中心<br>`element_radius`: 半径 ($\text{width} = \text{height} = 2 \times \text{radius}$) |
| **数字摇杆 (DigitalStick)** | `31` | `element_up_value`, `element_down_value`, `element_left_value`, `element_right_value`<br>`element_middle_value`: 下压按键<br>`element_sense`: 死区百分比 |
| **隐形模拟摇杆 (InvisibleAnalogStick)** | `32` | 默认 Layer 45，尺寸 400x400，radius 100，其余逻辑同 AnalogStick |
| **隐形数字摇杆 (InvisibleDigitalStick)** | `33` | 默认 Layer 45，尺寸 400x400，radius 100，其余逻辑同 DigitalStick |
| **极简性能面板 (SimplifyPerformance)** | `50` | `element_text`: 模板占位符 (如 `"带宽: ##带宽## 帧率: ##帧率## 延时: ##主机延时## 时间:HH:MM:SS"`)<br>`element_thick`: 字体大小 (默认 30)<br>`element_color`: 字体颜色<br>`element_radius`: 面板圆角 |
| **轮盘快捷键 (WheelPad)** | `54` | `element_mode`: 扇区数量 (如 8)<br>`element_sense`: 空心内圈半径比例 (如 30%)<br>`element_flag1`: 是否居中弹出 (1/0)<br>`element_text`: 悬浮触发文本 (非空表示为弹出模式)<br>`element_value`: 扇区绑定列表，格式为 `key|name,key|name`<br>`extra_attributes`: JSON 包含 `normalTextColor`, `pressedTextColor`, `centerTextColor`, `textSizePercent`, `centerTextSizePercent`, `triggerTextSizePercent`, `previewGroupChildren`, `segmentAlignment` (`"center"`/`"edge"`) |

---

## 5. 键值编码规范 (KeyCodes Mapping)

- **键盘 (`k<int>`)**：Android 原生 `android.view.KeyEvent.KEYCODE_*` 枚举整型值（如 `k29`=A, `k51`=W, `k47`=S, `k32`=D, `k66`=Enter, `k62`=Space, `k113`=Ctrl, `k59`=Shift, `k61`=Tab）。
- **鼠标 (`m<int>`)**：`m1`=左键, `m2`=中键, `m3`=右键, `m4`=侧键X1, `m5`=侧键X2。
- **滚轮**：`SU`=向上滚动, `SD`=向下滚动。
- **手柄掩码 (`g<maskBit>`)**：
  - `g1`: D-Pad UP
  - `g2`: D-Pad DOWN
  - `g4`: D-Pad LEFT
  - `g8`: D-Pad RIGHT
  - `g16`: START
  - `g32`: BACK
  - `g64`: LS / L3
  - `g128`: RS / R3
  - `g256`: LB
  - `g512`: RB
  - `g1024`: GUIDE
  - `g4096`: A
  - `g8192`: B
  - `g16384`: X
  - `g32768`: Y
- **手柄模拟量**：`lt` (左扳机), `rt` (右扳机), `LS` (左摇杆), `RS` (右摇杆)。
- **特殊功能与快捷动作**：
  - `null`: 空按键
  - `MMS`: 鼠标模式循环轮换
  - `CMS` / `TPM` / `MTM`: 直切经典鼠标 / 触控板 / 多点触控
  - `MES`: 触控使能总开关
  - `PKS`: PC 虚拟键盘开关
  - `AKS`: Android 软键盘开关
  - `CSW`: 弹出配置切换选择器
  - `DCS:<configId>`: 直切特定目标配置 (Direct Config Switch)
  - `PZM`: 平移与缩放模式切换
  - `OGM`: 打开游戏悬浮菜单
  - `EMS`: 进入编辑排布模式
  - `MMO`: 仅鼠标移动模式开关
  - `gb<elementId>`: 触发指定组按键的展开/收起
