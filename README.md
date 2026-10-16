# Moonlight Crown Editor (王冠模式按键编辑器)

`moonlight-crown-editor` 是为 **Moonlight-vplus** 深度定制的虚拟按键 / 王冠模式（Crown Mode）可视化排布编辑器项目与数据协议库。

本项目通过对 Android 端核心源码（`advance_setting`、`virtual_controller`、SQLite 存储与分享协议）的静态逆向分析，提取并建立了严格的 TypeScript 类型系统与坐标转换引擎，确保与 Moonlight-vplus 客户端 100% 格式无缝兼容。

---

## 目录结构

```text
moonlight-crown-editor/
├── docs/
│   └── CROWN_PROTOCOL_SPEC.md     # 详尽的底层数据协议规范、字段映射与算法手册
├── fixtures/
│   ├── minimal-profile.crown.json # 测试用合法的 Crown Profile Bundle 示例数据
│   └── raw-payload.json           # 测试用解包后 Raw Payload 示例数据
├── src/
│   ├── crownSchema.ts             # 核心 Schema、类型联合、枚举与坐标引擎
│   └── index.ts                   # 主入口文件
├── package.json
├── tsconfig.json
└── README.md
```

---

## 核心特性

1. **零 `any` 的强类型约束**：
   - 使用可辨识联合类型（Discriminated Unions）按 `element_type` 精准区分 12 种虚拟控件及其独占属性。
   - 包含完整的 `CrownGamepadMask`、`CrownMouseCode`、`CrownSpecialAction`、`CrownAndroidKeyCode` 编码表。
2. **纯函数坐标引擎**：
   - `configToCanvas()`：将 V+ 存储的中心点物理像素锚点换算为 Canvas 渲染包围盒，并支持依据 `layoutBasis` 的等比视口缩放。
   - `canvasToConfig()`：将用户在 Canvas 上拖拽排布的包围盒精准反算为 V+ 规范的中心点绝对像素坐标。
3. **颜色转换系统**：
   - `CrownColorUtils`：实现前端 `#RRGGBBAA` 十六进制色值与 Android 32 位有符号 ARGB 整数（Signed 32-bit Integer）的精准互转。
4. **完整打包与校验标准**：
   - 严格实现了 `CrownProfileShareBundle` 与 `RawPayload` 的双层结构与 MD5 / SHA-256 校验和规范。

---

## 快速上手

```bash
npm install
npm run typecheck
```

引入 Schema 与坐标引擎：

```typescript
import {
  CrownElementType,
  configToCanvas,
  canvasToConfig,
  CrownColorUtils,
  type CrownElement,
} from "./src/index.js";

// 将配置数据转换为 Canvas 包围盒
const rect = configToCanvas(element, { width: 1920, height: 1080 }, layoutBasis);
```
