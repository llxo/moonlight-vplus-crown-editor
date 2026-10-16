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
}

/**
 * 智能导入函数：自动识别输入是 .crown.json (Bundle) 还是 Raw Payload / ExportFile
 */
export async function smartImportProfile(jsonContent: string): Promise<SmartImportResult> {
  const parsed = JSON.parse(jsonContent);

  // 1. 社区分享包 (.crown.json)
  if (parsed.kind === CROWN_BUNDLE_KIND) {
    const result = await decodeCrownBundle(parsed as CrownProfileShareBundle);
    return {
      sourceType: "bundle",
      parsedProfile: result.parsedProfile,
      layoutBasis: result.bundle.layoutBasis || {
        widthPx: 2400,
        heightPx: 1080,
        densityDpi: 400,
        density: 2.5,
        orientation: "landscape",
      },
      metadata: {
        name: result.bundle.name,
        summary: result.bundle.summary,
        authorName: result.bundle.author?.name,
        gameName: result.bundle.game?.name,
        tags: result.bundle.tags,
      },
      isValidSha256: result.isValidSha256,
      isValidMd5: result.isValidMd5,
    };
  }

  // 2. 原始字符串态 RawPayload (含有 string 类型的 settings 与 elements)
  if (typeof parsed.settings === "string" && typeof parsed.elements === "string" && typeof parsed.md5 === "string") {
    const decoded = decodeRawPayload(parsed as CrownRawPayload);
    return {
      sourceType: "raw-payload",
      parsedProfile: decoded.profile,
      layoutBasis: {
        widthPx: 2400,
        heightPx: 1080,
        densityDpi: 400,
        density: 2.5,
        orientation: "landscape",
      },
      metadata: {
        name: decoded.profile.settings.config_name || "Imported Raw Profile",
      },
      isValidMd5: decoded.isValidMd5,
    };
  }

  // 3. 已经对象化的 RawPayload (如 fixtures/raw-payload.json)
  if (typeof parsed.settings === "object" && Array.isArray(parsed.elements)) {
    const settingsJson = JSON.stringify(parsed.settings);
    const elementsJson = JSON.stringify(parsed.elements);
    const computedMd5 = computeRawPayloadMD5(parsed.version || CROWN_DATABASE_VERSION, settingsJson, elementsJson);
    const isValidMd5 = !parsed.md5 || parsed.md5.toLowerCase() === computedMd5.toLowerCase();

    return {
      sourceType: "parsed-payload",
      parsedProfile: {
        version: parsed.version || CROWN_DATABASE_VERSION,
        settings: parsed.settings as CrownGlobalSettings,
        elements: parsed.elements as CrownElement[],
        md5: parsed.md5 || computedMd5,
      },
      layoutBasis: {
        widthPx: 2400,
        heightPx: 1080,
        densityDpi: 400,
        density: 2.5,
        orientation: "landscape",
      },
      metadata: {
        name: parsed.settings.config_name || "Imported Profile",
      },
      isValidMd5,
    };
  }

  throw new Error("无法识别的 Profile 数据格式：缺少必要的 settings 或 elements 属性");
}
