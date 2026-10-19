/**
 * @file crownCodec.ts
 * @description Moonlight-vplus 王冠模式 (Crown Mode) 数据序列化、反序列化、校验和计算与分享包封装
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import SparkMD5 from "spark-md5";
import {
  CROWN_BUNDLE_KIND,
  CROWN_BUNDLE_SCHEMA_VERSION,
  CROWN_DATABASE_VERSION,
  type CrownElement,
  type CrownGlobalSettings,
  type CrownLayoutBasis,
  type CrownParsedProfile,
  type CrownProfileShareBundle,
  type CrownRawPayload,
} from "./crownSchema";

// ============================================================================
// 1. 哈希校验纯函数
// ============================================================================

/**
 * 计算字符串的 UTF-8 MD5 散列（小写十六进制 32 位）
 */
export function computeMD5(content: string): string {
  return SparkMD5.hash(content);
}

/**
 * 计算字符串的 UTF-8 SHA-256 散列（小写十六进制 64 位）
 * 优先采用浏览器原生 Web Crypto API，若在非浏览器环境则优雅降级
 */
export async function computeSHA256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  // 1. 优先使用标准 Web Crypto API (浏览器与现代化 Node 环境)
  if (typeof globalThis.crypto?.subtle?.digest === "function") {
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // 2. 备选方案：Node.js 运行时 crypto 模块
  try {
    const nodeCrypto = await import(/* @vite-ignore */ "crypto");
    return nodeCrypto.createHash("sha256").update(content).digest("hex");
  } catch {
    throw new Error("SHA-256 计算环境不可用：当前环境既缺少 Web Crypto API 也缺少 node:crypto");
  }
}

/**
 * 计算 Raw Payload 的 MD5 校验和
 * 规范公式：MD5(version.toString() + settings + elements)
 */
export function computeRawPayloadMD5(version: number, settingsJson: string, elementsJson: string): string {
  return computeMD5(`${version}${settingsJson}${elementsJson}`);
}

// ============================================================================
// 2. 内层 Raw Payload 编解码
// ============================================================================

/**
 * 将解析态的 settings 和 elements 打包为 RawPayload 实体（严格包含二级 JSON 字符串与 MD5）
 */
export function encodeRawPayload(
  settings: CrownGlobalSettings,
  elements: CrownElement[],
  version: number = CROWN_DATABASE_VERSION
): CrownRawPayload {
  const settingsJson = JSON.stringify(settings);
  const elementsJson = JSON.stringify(elements);
  const md5 = computeRawPayloadMD5(version, settingsJson, elementsJson);

  return {
    version,
    settings: settingsJson,
    elements: elementsJson,
    md5,
  };
}

/**
 * 解包 RawPayload 或 ExportFile 为前端易操作的内存对象 CrownParsedProfile
 */
export function decodeRawPayload(rawPayload: CrownRawPayload): {
  profile: CrownParsedProfile;
  isValidMd5: boolean;
  computedMd5: string;
} {
  const computedMd5 = computeRawPayloadMD5(rawPayload.version, rawPayload.settings, rawPayload.elements);
  const isValidMd5 = computedMd5.toLowerCase() === rawPayload.md5.toLowerCase();

  const settings = JSON.parse(rawPayload.settings) as CrownGlobalSettings;
  const elements = JSON.parse(rawPayload.elements) as CrownElement[];

  return {
    profile: {
      version: rawPayload.version,
      settings,
      elements,
      md5: rawPayload.md5,
    },
    isValidMd5,
    computedMd5,
  };
}

// ============================================================================
// 3. 社区分享包 (.crown.json) 编解码
// ============================================================================

export interface CrownBundleDecodeResult {
  bundle: CrownProfileShareBundle;
  parsedProfile: CrownParsedProfile;
  isValidSha256: boolean;
  isValidMd5: boolean;
  computedSha256: string;
  computedMd5: string;
}

/**
 * 完整解包 .crown.json 格式的社区分享包，并对双层哈希进行严谨校验
 */
export async function decodeCrownBundle(
  input: string | CrownProfileShareBundle
): Promise<CrownBundleDecodeResult> {
  const bundle: CrownProfileShareBundle = typeof input === "string" ? JSON.parse(input) : input;

  if (bundle.kind !== CROWN_BUNDLE_KIND) {
    throw new Error(`无效的分享包类型: 期望 "${CROWN_BUNDLE_KIND}", 实际收到 "${bundle.kind}"`);
  }

  // 1. 校验 profile.payload 的 SHA-256
  const payloadString = bundle.profile.payload;
  const computedSha256 = await computeSHA256(payloadString);
  const isValidSha256 = computedSha256.toLowerCase() === bundle.profile.payloadSha256.toLowerCase();

  // 2. 解析内层 Raw Payload
  const rawPayload = JSON.parse(payloadString) as CrownRawPayload;
  const { profile: parsedProfile, isValidMd5, computedMd5 } = decodeRawPayload(rawPayload);

  return {
    bundle,
    parsedProfile,
    isValidSha256,
    isValidMd5,
    computedSha256,
    computedMd5,
  };
}

export interface EncodeBundleOptions {
  name: string;
  summary?: string;
  settings: CrownGlobalSettings;
  elements: CrownElement[];
  layoutBasis?: CrownLayoutBasis;
  authorName?: string;
  gameName?: string;
  tags?: string[];
  appVersionName?: string;
  suggestedFileStem?: string;
}

/**
 * 将当前编辑的所有状态打包生成 100% 兼容 Moonlight-vplus 的社区分享包对象
 */
export async function encodeCrownBundle(options: EncodeBundleOptions): Promise<CrownProfileShareBundle> {
  const {
    name,
    summary = "",
    settings,
    elements,
    layoutBasis = {
      widthPx: 2400,
      heightPx: 1080,
      densityDpi: 400,
      density: 2.5,
      orientation: "landscape",
    },
    authorName = "Crown Editor",
    gameName = "Game",
    tags = ["Crown", "Custom"],
    appVersionName = "1.2.0",
    suggestedFileStem = "custom-profile",
  } = options;

  // 1. 生成 Raw Payload
  const rawPayload = encodeRawPayload(settings, elements);
  const payloadString = JSON.stringify(rawPayload);

  // 2. 计算 SHA-256
  const payloadSha256 = await computeSHA256(payloadString);
  const shortSha = payloadSha256.slice(0, 8);

  // 3. 构造分享包实体
  const nowIso = new Date().toISOString();
  const bundle: CrownProfileShareBundle = {
    kind: CROWN_BUNDLE_KIND,
    schemaVersion: CROWN_BUNDLE_SCHEMA_VERSION,
    bundleId: `crown.${suggestedFileStem}.${shortSha}`,
    name,
    summary,
    compatibility: {
      minAppVersionCode: 100,
      profilePayloadVersion: CROWN_DATABASE_VERSION,
    },
    profile: {
      profileId: `public-payload-${shortSha}`,
      name,
      payload: payloadString,
      payloadSha256,
    },
    createdAt: nowIso,
    updatedAt: nowIso,
    packageName: "com.limelight",
    layoutBasis,
    author: {
      name: authorName,
    },
    game: {
      name: gameName,
    },
    tags,
    appVersionName,
  };

  return bundle;
}

// ============================================================================
// 4. 智能文件导入适配器 (Smart Importer)
// ============================================================================

export interface SmartImportResult {
  sourceType: "bundle" | "raw-payload" | "parsed-payload";
  parsedProfile: CrownParsedProfile;
  layoutBasis: CrownLayoutBasis;
  metadata: {
    name: string;
    summary?: string;
    authorName?: string;
    gameName?: string;
    tags?: string[];
  };
  isValidSha256?: boolean;
  isValidMd5: boolean;
  statusBarInset?: number;
  isCutoutDetected?: boolean;
}

/**
 * 移动设备主流工业标准全屏面板规格 (短边高度与长边宽度)
 */
export const STANDARD_INDUSTRIAL_PROFILES: Array<{
  width: number;
  height: number;
  dpi: number;
  density: number;
  name: string;
}> = [
  // 1080P 系列
  { width: 1920, height: 1080, dpi: 360, density: 2.25, name: "16:9 标准高清" },
  { width: 2160, height: 1080, dpi: 400, density: 2.5, name: "18:9 全面屏" },
  { width: 2280, height: 1080, dpi: 440, density: 2.75, name: "19:9 水滴屏" },
  { width: 2340, height: 1080, dpi: 440, density: 2.75, name: "19.5:9 水滴/挖孔屏" },
  { width: 2400, height: 1080, dpi: 400, density: 2.5, name: "20:9 常见旗舰" },
  { width: 2520, height: 1080, dpi: 440, density: 2.75, name: "21:9 带鱼屏" },

  // 1.5K 系列
  { width: 2640, height: 1216, dpi: 440, density: 2.75, name: "20:9 1.5K" },
  { width: 2712, height: 1220, dpi: 446, density: 2.7875, name: "20:9 1.5K (K60/K70)" },
  { width: 2772, height: 1240, dpi: 450, density: 2.8125, name: "20:9 1.5K" },
  { width: 2800, height: 1260, dpi: 450, density: 2.8125, name: "20:9 1.5K" },

  // 2K 系列
  { width: 2560, height: 1440, dpi: 480, density: 3.0, name: "16:9 2K" },
  { width: 3040, height: 1440, dpi: 500, density: 3.125, name: "19:9 2K" },
  { width: 3120, height: 1440, dpi: 520, density: 3.25, name: "19.5:9 2K" },
  { width: 3168, height: 1440, dpi: 510, density: 3.1875, name: "22:10 2K" },
  { width: 3200, height: 1440, dpi: 520, density: 3.25, name: "20:9 2K" },

  // 平板系列
  { width: 2560, height: 1600, dpi: 360, density: 2.25, name: "16:10 平板" },
  { width: 2880, height: 1800, dpi: 400, density: 2.5, name: "16:10 2.8K 平板" },
  { width: 2880, height: 1920, dpi: 400, density: 2.5, name: "3:2 平板" },
];

export interface InferredLayoutResult {
  layoutBasis: CrownLayoutBasis;
  statusBarInset: number;
  isCutoutDetected: boolean;
  inferenceReason?: string;
}

/**
 * 基于横屏左侧状态栏习惯与工业标准面板的双重推导：
 * 自动识别由于 Android 系统左侧状态栏/挖孔占位或竖屏换算导致的画布非标缩水，
 * 还原出真实的物理全屏尺寸与左侧状态栏占位值。
 */
export function inferPhysicalCanvasAndStatusBar(
  rawBasis: CrownLayoutBasis | undefined,
  elements: CrownElement[]
): InferredLayoutResult {
  const fallbackBasis: CrownLayoutBasis = {
    widthPx: 2400,
    heightPx: 1080,
    densityDpi: 400,
    density: 2.5,
    orientation: "landscape",
  };

  const basis = rawBasis || fallbackBasis;
  const rawWidth = basis.widthPx || 2400;
  const rawHeight = basis.heightPx || 1080;

  // 物理短边 (高度) 与报告的长边 (宽度) 归一化为横屏视图
  const h = Math.min(rawWidth, rawHeight);
  const wRep = Math.max(rawWidth, rawHeight);

  // 候选匹配：寻找短边与 h 相同（或相近 ±20px）的工业标准面板
  const candidateProfiles = STANDARD_INDUSTRIAL_PROFILES.filter((p) => Math.abs(p.height - h) <= 20);
  const isExactStandard = candidateProfiles.some((p) => p.width === wRep);

  // 过滤超大隐形手势区 (如 Type 32/33 隐形手柄，或宽度 > 500px 的全屏触控区)，提取真实实体控件
  const solidElements = (elements || []).filter((e) => {
    if (e.element_type === 32 || e.element_type === 33) return false;
    if ((e.element_width || 0) > 500 || (e.element_height || 0) > 500) return false;
    return true;
  });

  const targetElements = solidElements.length > 0 ? solidElements : elements;

  const centerXs = (targetElements || []).map((e) => e.element_central_x).filter((x) => typeof x === "number");
  const rightBounds = (targetElements || []).map((e) => (e.element_central_x || 0) + Math.round((e.element_width || 0) / 2));

  const maxX = centerXs.length > 0 ? Math.max(...centerXs) : wRep;
  const maxRightBound = rightBounds.length > 0 ? Math.max(...rightBounds) : wRep;
  const effectiveBound = Math.max(maxX, maxRightBound);

  // 若当前尺寸非标准全屏，或者实体按键右边界溢出了当前视口
  if (!isExactStandard || effectiveBound > wRep) {
    // 寻找大于 wRep 且差值处于常见状态栏区间 (20px ~ 150px) 的候选标准屏幕
    const possibleStds = candidateProfiles.filter((p) => p.width > wRep && p.width - wRep <= 150);

    if (possibleStds.length > 0) {
      // 优先选择能够完整覆盖实体按键物理范围的最小标准全屏；若均未覆盖则取最大候选
      const matched =
        possibleStds.find((p) => p.width >= effectiveBound) ||
        possibleStds[possibleStds.length - 1];

      if (matched) {
        const inset = matched.width - wRep;
        return {
          layoutBasis: {
            ...basis,
            widthPx: matched.width,
            heightPx: matched.height,
            densityDpi: basis.densityDpi < matched.dpi ? matched.dpi : basis.densityDpi,
            density: basis.density < matched.density ? matched.density : basis.density,
            orientation: "landscape",
          },
          statusBarInset: inset,
          isCutoutDetected: true,
          inferenceReason: `左侧状态栏占位推断: 视口 ${wRep}px 补全至标准物理屏 ${matched.width}×${matched.height} (状态栏: ${inset}px)`,
        };
      }
    }
  }

  // 常规横屏 (本身已是标准物理全屏，且无越界)
  return {
    layoutBasis: {
      ...basis,
      widthPx: wRep,
      heightPx: h,
      orientation: "landscape",
    },
    statusBarInset: 0,
    isCutoutDetected: false,
  };
}

/**
 * 智能导入函数：自动识别输入是 .crown.json (Bundle) 还是 Raw Payload / ExportFile
 */
export async function smartImportProfile(jsonContent: string): Promise<SmartImportResult> {
  const parsed = JSON.parse(jsonContent);

  // 1. 社区分享包 (.crown.json)
  if (parsed.kind === CROWN_BUNDLE_KIND) {
    const result = await decodeCrownBundle(parsed as CrownProfileShareBundle);
    const inferred = inferPhysicalCanvasAndStatusBar(
      result.bundle.layoutBasis,
      result.parsedProfile.elements
    );

    return {
      sourceType: "bundle",
      parsedProfile: result.parsedProfile,
      layoutBasis: inferred.layoutBasis,
      metadata: {
        name: result.bundle.name,
        summary: result.bundle.summary,
        authorName: result.bundle.author?.name,
        gameName: result.bundle.game?.name,
        tags: result.bundle.tags,
      },
      isValidSha256: result.isValidSha256,
      isValidMd5: result.isValidMd5,
      statusBarInset: inferred.statusBarInset,
      isCutoutDetected: inferred.isCutoutDetected,
    };
  }

  // 2. 原始字符串态 RawPayload (含有 string 类型的 settings 与 elements)
  if (typeof parsed.settings === "string" && typeof parsed.elements === "string" && typeof parsed.md5 === "string") {
    const decoded = decodeRawPayload(parsed as CrownRawPayload);
    const inferred = inferPhysicalCanvasAndStatusBar(undefined, decoded.profile.elements);

    return {
      sourceType: "raw-payload",
      parsedProfile: decoded.profile,
      layoutBasis: inferred.layoutBasis,
      metadata: {
        name: decoded.profile.settings.config_name || "Imported Raw Profile",
      },
      isValidMd5: decoded.isValidMd5,
      statusBarInset: inferred.statusBarInset,
      isCutoutDetected: inferred.isCutoutDetected,
    };
  }

  // 3. 已经对象化的 RawPayload (如 fixtures/raw-payload.json)
  if (typeof parsed.settings === "object" && Array.isArray(parsed.elements)) {
    const settingsJson = JSON.stringify(parsed.settings);
    const elementsJson = JSON.stringify(parsed.elements);
    const computedMd5 = computeRawPayloadMD5(parsed.version || CROWN_DATABASE_VERSION, settingsJson, elementsJson);
    const isValidMd5 = !parsed.md5 || parsed.md5.toLowerCase() === computedMd5.toLowerCase();
    const inferred = inferPhysicalCanvasAndStatusBar(undefined, parsed.elements as CrownElement[]);

    return {
      sourceType: "parsed-payload",
      parsedProfile: {
        version: parsed.version || CROWN_DATABASE_VERSION,
        settings: parsed.settings as CrownGlobalSettings,
        elements: parsed.elements as CrownElement[],
        md5: parsed.md5 || computedMd5,
      },
      layoutBasis: inferred.layoutBasis,
      metadata: {
        name: parsed.settings.config_name || "Imported Profile",
      },
      isValidMd5,
      statusBarInset: inferred.statusBarInset,
      isCutoutDetected: inferred.isCutoutDetected,
    };
  }

  throw new Error("无法识别的 Profile 数据格式：缺少必要的 settings 或 elements 属性");
}
