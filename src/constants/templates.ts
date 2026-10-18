/**
 * @file templates.ts
 * @description 官方社区配置库接口与本站静态资源加载器
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

export interface CommunityProfileItem {
  bundleId: string;
  name: string;
  summary: string;
  author: string;
  game: string;
  tags: string[];
  updatedAt: string;
  url: string; // 官方格式: "../profiles/2400-1080/crown-profile-3dc63735.crown.json"
  layoutBasis: {
    widthPx: number;
    heightPx: number;
    densityDpi: number;
    density: number;
    orientation?: string;
  } | null;
}

export type PresetTemplate = CommunityProfileItem;

// 内存缓存索引列表与单个 profile 文本
let cachedIndex: CommunityProfileItem[] | null = null;
const profileTextCache = new Map<string, string>();

/**
 * 获取官方社区配置清单（直接读取本站同源静态文件 /profiles/index.json）
 */
export async function fetchCommunityProfileIndex(): Promise<CommunityProfileItem[]> {
  if (cachedIndex && cachedIndex.length > 0) {
    return cachedIndex;
  }

  const res = await fetch("/profiles/index.json");
  if (!res.ok) {
    throw new Error(`加载社区模版索引失败 (HTTP ${res.status})`);
  }

  const data = await res.json();
  if (data && Array.isArray(data.profiles)) {
    cachedIndex = data.profiles;
    return cachedIndex!;
  }
  return [];
}

/**
 * 直接从本站静态资源目录读取指定的社区配置 .crown.json 内容
 * 100% 同源本地化静态文件，不依赖任何外部第三方 CDN
 */
export async function fetchCommunityProfileJson(relativeUrl: string): Promise<string> {
  const cleanPath = (relativeUrl || "").replace(/^\.\.\//, "").trim();
  if (!cleanPath) {
    throw new Error("无效的配置文件路径");
  }

  if (profileTextCache.has(cleanPath)) {
    return profileTextCache.get(cleanPath)!;
  }

  // 直接请求本站托管的静态文件 (如 "/profiles/cod/cod-dae9004b.crown.json")
  const url = `/${cleanPath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`读取模版配置失败 (${res.status})`);
  }

  const text = await res.text();
  profileTextCache.set(cleanPath, text);
  return text;
}
