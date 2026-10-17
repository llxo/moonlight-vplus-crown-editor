// Vercel Serverless Function: 24小时短效直链服务
// 兼容标准 Web Request & Response 规范

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 限制配置大小最大 512KB
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

interface MemoryStoreItem {
  data: string;
  expiresAt: number;
  name: string;
}
const memoryFallbackStore = new Map<string, MemoryStoreItem>();

function generateId(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function cleanId(raw: string): string {
  return raw.replace(/(\.crown)?\.json$/i, "").trim();
}

function parseShareIdFromUrl(url: URL): string | null {
  const queryId = url.searchParams.get("id");
  if (queryId) {
    return cleanId(queryId);
  }

  const pathname = url.pathname;
  const parts = pathname.split("/").filter(Boolean);
  const shareIndex = parts.lastIndexOf("share");
  if (shareIndex !== -1 && parts.length > shareIndex + 1) {
    const rawId = parts[shareIndex + 1];
    if (rawId) {
      return cleanId(rawId);
    }
  }

  return null;
}

// 检查是否存在 Vercel KV 环境变量 (基于 Upstash Redis REST API)
function getVercelKvConfig() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

async function kvSet(key: string, value: string, exSeconds: number): Promise<boolean> {
  const kv = getVercelKvConfig();
  if (!kv) return false;
  try {
    const res = await fetch(`${kv.url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?ex=${exSeconds}`, {
      headers: { Authorization: `Bearer ${kv.token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function kvGet(key: string): Promise<string | null> {
  const kv = getVercelKvConfig();
  if (!kv) return null;
  try {
    const res = await fetch(`${kv.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kv.token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result || null;
  } catch {
    return null;
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }

  const url = new URL(req.url);

  // 1. POST 创建直链
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
          { status: 413, headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" } }
        );
      }

      let body: any;
      try {
        body = JSON.parse(bodyText);
      } catch {
        return new Response(
          JSON.stringify({ error: "数据格式错误，必须为有效 JSON", code: "INVALID_JSON" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" } }
        );
      }

      const bundle = body.bundle || body;

      // 2. 格式初验
      if (!isValidCrownProfile(bundle)) {
        return new Response(
          JSON.stringify({
            error: "非合法的 Moonlight-vplus 王冠模式配置文件格式",
            code: "INVALID_CROWN_PROFILE",
          }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" } }
        );
      }

      const id = generateId();
      const rawName = bundle.name || body.name || "profile";
      const safeName = rawName.replace(/[\/\\:*?"<>|]/g, "_").trim() || "profile";
      const now = Date.now();
      const durationMs = 24 * 60 * 60 * 1000; // 24小时
      const expiresAt = now + durationMs;

      const record = {
        data: JSON.stringify(bundle, null, 2),
        name: safeName,
        expiresAt,
      };

      const recordStr = JSON.stringify(record);

      // 尝试存入 Vercel KV（24小时 = 86400秒）
      const kvSaved = await kvSet(`crown:${id}`, recordStr, 86400);
      if (!kvSaved) {
        // 未配 KV 时存入内存暂存
        memoryFallbackStore.set(id, {
          data: record.data,
          expiresAt,
          name: safeName,
        });
      }

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
          storageType: kvSaved ? "vercel-kv" : "memory-fallback",
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: `生成直链失败: ${err.message}`, code: "SERVER_ERROR" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" } }
      );
    }
  }

  // 2. GET 获取直链内容
  if (req.method === "GET") {
    const id = parseShareIdFromUrl(url);

    if (!id) {
      return new Response(
        JSON.stringify({
          message: "Moonlight-vplus Crown Editor 直链分享服务 (Vercel)",
          status: "online",
        }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    try {
      let data: string | null = null;
      let name = "profile";
      let expiresAt = 0;

      // 先查 Vercel KV
      const kvData = await kvGet(`crown:${id}`);
      if (kvData) {
        try {
          const parsed = JSON.parse(kvData);
          data = parsed.data;
          name = parsed.name || name;
          expiresAt = parsed.expiresAt || 0;
        } catch {
          data = kvData;
        }
      }

      // 未从 KV 拿到则查内存兜底
      if (!data && memoryFallbackStore.has(id)) {
        const memItem = memoryFallbackStore.get(id)!;
        data = memItem.data;
        name = memItem.name;
        expiresAt = memItem.expiresAt;
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: "分享直链不存在或已失效", code: "NOT_FOUND" }),
          { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" } }
        );
      }

      // 校验过期
      const now = Date.now();
      if (expiresAt > 0 && now > expiresAt) {
        memoryFallbackStore.delete(id);
        return new Response(
          JSON.stringify({ error: "该分享直链已过期（有效期为24小时）", code: "EXPIRED", expired: true }),
          { status: 410, headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" } }
        );
      }

      const fileName = `${name}.crown.json`;
      const encodedFilename = encodeURIComponent(fileName);

      return new Response(data, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: `读取直链失败: ${err.message}`, code: "FETCH_ERROR" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=utf-8" } }
      );
    }
  }

  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
