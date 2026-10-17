import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

// 跨域公共响应头
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 限制配置大小最大 512KB (正常配置通常为 5KB~30KB)
const MAX_PAYLOAD_BYTES = 512 * 1024;

// 格式初验：必须是王冠模式社区分享包或原生 payload 格式
function isValidCrownProfile(bundle: any): boolean {
  if (!bundle || typeof bundle !== "object") return false;

  // 1. 标准社区分享包 (.crown.json)
  if (
    bundle.kind === "crown-profile-bundle" ||
    bundle.kind === "moonlight-vplus-crown-profile-bundle"
  ) {
    if (bundle.profile) {
      if (typeof bundle.profile.payload === "string" && bundle.profile.payload.trim()) {
        try {
          const inner = JSON.parse(bundle.profile.payload);
          if (inner && typeof inner === "object") {
            return Boolean(inner.elements !== undefined || inner.settings !== undefined);
          }
        } catch {
          return false;
        }
      }
      if (typeof bundle.profile.payload === "object" && bundle.profile.payload !== null) {
        return Boolean(bundle.profile.payload.elements !== undefined || bundle.profile.payload.settings !== undefined);
      }
    }
    if (bundle.elements !== undefined) {
      return Array.isArray(bundle.elements) || typeof bundle.elements === "string";
    }
    return false;
  }

  // 2. 原始 payload 或导出配置（直接包含 elements 数组或序列化字符串）
  if (bundle.elements !== undefined) {
    return Array.isArray(bundle.elements) || typeof bundle.elements === "string";
  }

  // 3. 包含 profile 对象（兼容无显式 kind 的载荷）
  if (bundle.profile && typeof bundle.profile === "object") {
    if (typeof bundle.profile.payload === "string") {
      try {
        const inner = JSON.parse(bundle.profile.payload);
        return Boolean(inner && (inner.elements !== undefined || inner.settings !== undefined));
      } catch {
        return false;
      }
    }
    if (typeof bundle.profile.payload === "object" && bundle.profile.payload !== null) {
      return Boolean(bundle.profile.payload.elements !== undefined || bundle.profile.payload.settings !== undefined);
    }
  }

  return false;
}

// 内存暂存兜底（用于本地测试或临时会话）
interface MemoryStoreItem {
  data: string;
  expiresAt: number;
  name: string;
}
const memoryFallbackStore = new Map<string, MemoryStoreItem>();

function generateId(): string {
  // 生成8位紧凑短ID
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function parseShareIdFromUrl(url: URL): string | null {
  // 1. 尝试从 query parameter 获取
  const queryId = url.searchParams.get("id");
  if (queryId) {
    return cleanId(queryId);
  }

  // 2. 从 pathname 提取: /api/share/:id 或 /.netlify/functions/share/:id 或 /api/share/:id/:filename
  const pathname = url.pathname;
  const parts = pathname.split("/").filter(Boolean);
  
  // 查找 "share" 后的下一个段
  const shareIndex = parts.lastIndexOf("share");
  if (shareIndex !== -1 && parts.length > shareIndex + 1) {
    const rawId = parts[shareIndex + 1];
    if (rawId) {
      return cleanId(rawId);
    }
  }

  return null;
}

function cleanId(raw: string): string {
  // 剔除可能存在的扩展名，例如 abc12345.crown.json -> abc12345
  return raw.replace(/(\.crown)?\.json$/i, "").trim();
}

export default async (req: Request, context: Context): Promise<Response> => {
  // 处理预检请求 (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const url = new URL(req.url);

  // ==========================================
  // 1. POST 请求：创建 24 小时短效直链
  // ==========================================
  if (req.method === "POST") {
    try {
      // 1. 体积前置防御：限制请求体最大 512KB
      const bodyText = await req.text();
      if (bodyText.length > MAX_PAYLOAD_BYTES) {
        return new Response(
          JSON.stringify({
            error: "配置文件体积超出限制，最大允许 512KB",
            code: "PAYLOAD_TOO_LARGE",
          }),
          {
            status: 413,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
          }
        );
      }

      let body: any;
      try {
        body = JSON.parse(bodyText);
      } catch {
        return new Response(
          JSON.stringify({ error: "数据格式错误，必须为有效 JSON", code: "INVALID_JSON" }),
          {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
          }
        );
      }

      const bundle = body.bundle || body;

      // 2. 格式初验：确保为 Moonlight-vplus 王冠模式合法配置
      if (!isValidCrownProfile(bundle)) {
        return new Response(
          JSON.stringify({
            error: "非合法的 Moonlight-vplus 王冠模式配置文件格式",
            code: "INVALID_CROWN_PROFILE",
          }),
          {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
          }
        );
      }

      const id = generateId();
      const rawName = bundle.name || body.name || "profile";
      // 过滤特殊字符，确保文件名合法
      const safeName = rawName.replace(/[\/\\:*?"<>|]/g, "_").trim() || "profile";
      const now = Date.now();
      const durationMs = 24 * 60 * 60 * 1000; // 24小时
      const expiresAt = now + durationMs;

      const payloadStr = JSON.stringify(bundle, null, 2);

      // 尝试存入 Netlify Blobs
      let storedInNetlify = false;
      try {
        const store = getStore("crown-shares");
        await store.set(id, payloadStr, {
          metadata: {
            name: safeName,
            expiresAt,
            createdAt: now,
          },
        });
        storedInNetlify = true;
      } catch (storeErr: any) {
        console.warn("[Netlify Blobs] 无法连接到 Blobs 存储，使用内存兜底:", storeErr.message);
        // 本地调试或未配置时走内存兜底
        memoryFallbackStore.set(id, {
          data: payloadStr,
          expiresAt,
          name: safeName,
        });
      }

      // 构造直链 URL (包含真实 .crown.json 文件后缀，方便直接下载与客户端导入)
      const origin = url.origin;
      const directUrl = `${origin}/api/share/${id}/${encodeURIComponent(safeName)}.crown.json`;
      const shortUrl = `${origin}/api/share/${id}`;

      return new Response(
        JSON.stringify({
          success: true,
          id,
          name: safeName,
          expiresAt,
          durationHours: 24,
          directUrl,
          shortUrl,
          storageType: storedInNetlify ? "netlify-blobs" : "memory-fallback",
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
        }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: `生成直链失败: ${err.message}`, code: "SERVER_ERROR" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }
  }

  // ==========================================
  // 2. GET 请求：获取直链 JSON 文件内容
  // ==========================================
  if (req.method === "GET") {
    const id = parseShareIdFromUrl(url);

    if (!id) {
      return new Response(
        JSON.stringify({
          message: "Moonlight-vplus Crown Editor 直链分享服务",
          status: "online",
          version: "1.0",
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    try {
      let data: string | null = null;
      let metadata: Record<string, any> | undefined = undefined;

      // 首先尝试从 Netlify Blobs 获取
      try {
        const store = getStore("crown-shares");
        const item = await store.getWithMetadata(id);
        if (item && item.data) {
          data = item.data;
          metadata = item.metadata as Record<string, any>;
        }
      } catch (storeErr: any) {
        // Blobs 不可用时检查内存兜底
      }

      // 如果 Blobs 没找到，检查内存兜底
      if (!data && memoryFallbackStore.has(id)) {
        const memItem = memoryFallbackStore.get(id)!;
        data = memItem.data;
        metadata = {
          expiresAt: memItem.expiresAt,
          name: memItem.name,
        };
      }

      // 不存在
      if (!data) {
        return new Response(
          JSON.stringify({
            error: "分享直链不存在或已失效",
            code: "NOT_FOUND",
          }),
          {
            status: 404,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
          }
        );
      }

      // 检查 24 小时是否已过期
      const now = Date.now();
      if (metadata?.expiresAt && now > Number(metadata.expiresAt)) {
        // 尝试异步清理过期数据
        try {
          const store = getStore("crown-shares");
          await store.delete(id);
        } catch {
          // ignore
        }
        memoryFallbackStore.delete(id);

        return new Response(
          JSON.stringify({
            error: "该分享直链已过期（有效期为24小时）",
            code: "EXPIRED",
            expired: true,
          }),
          {
            status: 410, // 410 Gone
            headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
          }
        );
      }

      const fileName = metadata?.name ? `${metadata.name}.crown.json` : "profile.crown.json";
      const encodedFilename = encodeURIComponent(fileName);

      // 返回真正的 application/json 直链内容
      return new Response(data, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json; charset=utf-8",
          // 设置 attachment 与文件名，手机浏览器或下载器请求时自动保存为对应文件名
          "Content-Disposition": `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: `读取直链失败: ${err.message}`, code: "FETCH_ERROR" }),
        {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }
  }

  // 其他不支持的 HTTP 方法
  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
};

export const config: Config = {
  path: ["/api/share", "/api/share/*"],
};
