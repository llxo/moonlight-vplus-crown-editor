/**
 * @file ShareLinkModal.tsx
 * @description 24小时短效直链分享轻弹窗：支持一键生成 JSON 直链、一键复制、24小时倒计时提示与手机扫码下载二维码
 * 遵循 minimalist-ui 规范：纯净黑白灰、清晰排印、无花哨渐变与厚重阴影
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Link2,
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import QRCode from "qrcode";
import { useCrownStore } from "../../store/useCrownStore";

interface ShareResult {
  id: string;
  name: string;
  expiresAt: number;
  durationHours: number;
  directUrl: string;
  shortUrl: string;
  storageType?: string;
}

export const ShareLinkModal: React.FC = () => {
  const { isShareModalOpen, setShareModalOpen, exportBundle } = useCrownStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<ShareResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // 打开弹窗且无数据时自动生成
  useEffect(() => {
    if (isShareModalOpen && !shareData && !loading) {
      handleGenerate();
    }
    if (!isShareModalOpen) {
      setCopied(false);
    }
  }, [isShareModalOpen]);

  // 生成二维码
  useEffect(() => {
    if (shareData?.directUrl) {
      QRCode.toDataURL(shareData.directUrl, {
        width: 160,
        margin: 1,
        color: {
          dark: "#111111",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("生成二维码失败:", err));
    } else {
      setQrDataUrl(null);
    }
  }, [shareData?.directUrl]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const bundle = await exportBundle();
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle }),
      });

      if (!res.ok) {
        let errMessage = `HTTP 错误: ${res.status}`;
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch {
          // ignore
        }
        throw new Error(errMessage);
      }

      const data: ShareResult = await res.json();
      setShareData(data);
    } catch (err: any) {
      setError(err.message || "生成直链失败，请确认服务已启动或部署");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareData?.directUrl) return;
    try {
      await navigator.clipboard.writeText(shareData.directUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // 兼容不支持 clipboard 接口的浏览器
      const input = document.createElement("input");
      input.value = shareData.directUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 格式化过期时间
  const formatExpireTime = (timestamp: number) => {
    if (!timestamp) return "24小时后";
    const date = new Date(timestamp);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  if (!isShareModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs select-none animate-in fade-in">
      <div className="w-[460px] max-w-[95vw] rounded-2xl border border-[#eaeaea] bg-[#ffffff] p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] space-y-4">
        {/* 头部导航 */}
        <div className="flex items-center justify-between border-b border-[#eaeaea] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111111] text-[#ffffff]">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#111111]">24小时短效直链</h3>
              <span className="text-xs text-[#6b7280]">
                生成可供外部直接 GET 下载的 JSON 文件链接
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShareModalOpen(false)}
            className="rounded-md p-1.5 text-[#6b7280] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 主内容区域 */}
        <div className="space-y-4 text-xs">
          {/* 加载中状态 */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <RefreshCw className="h-6 w-6 animate-spin text-[#111111]" />
              <div className="font-medium text-[#374151]">正在打包配置并生成 24 小时直链...</div>
              <div className="text-[11px] text-[#6b7280]">
                纯前端计算 SHA-256 / MD5 校验和并分发存储
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-red-700 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>生成直链失败</span>
              </div>
              <p className="text-red-600 text-[11px] leading-relaxed break-all">
                {error}
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="rounded-md bg-red-600 px-3 py-1 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  重试
                </button>
              </div>
            </div>
          )}

          {/* 成功状态 */}
          {!loading && shareData && (
            <div className="space-y-3.5">
              {/* 直链 URL 复制卡片 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#374151] flex items-center justify-between">
                  <span>文件直链 (Direct Download URL)</span>
                  <span className="text-[11px] text-[#6b7280] font-normal">
                    格式: .crown.json
                  </span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={shareData.directUrl}
                    className="flex-1 rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3 py-2 text-xs font-mono text-[#111111] select-all outline-none focus:border-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`flex items-center gap-1 shrink-0 rounded-lg px-3 py-2 font-medium transition-all ${
                      copied
                        ? "bg-[#2e7d32] text-white"
                        : "bg-[#111111] text-white hover:bg-[#2b2b2b] active:scale-[0.98]"
                    }`}
                    title="复制完整直链"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 扫码与操作横向便当盒 (Bento Grid) */}
              <div className="grid grid-cols-5 gap-2.5 rounded-xl border border-[#eaeaea] bg-[#fafaf9] p-3">
                {/* 左列：二维码 */}
                <div className="col-span-2 flex flex-col items-center justify-center border-r border-[#eaeaea] pr-2.5">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="手机扫码下载二维码"
                      className="h-28 w-28 rounded-md border border-[#e5e5e5] bg-white p-1 shadow-2xs"
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-md bg-[#f0f0f0] animate-pulse" />
                  )}
                  <span className="mt-1.5 text-[11px] text-[#6b7280] font-medium flex items-center gap-1">
                    <QrCode className="h-3 w-3" />
                    手机扫码直接下载
                  </span>
                </div>

                {/* 右列：信息与快捷操作 */}
                <div className="col-span-3 flex flex-col justify-between pl-1 space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#2e7d32] font-semibold text-xs">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>有效期：24 小时</span>
                    </div>
                    <p className="text-[11px] text-[#6b7280] leading-relaxed">
                      将于 <strong className="text-[#374151]">{formatExpireTime(shareData.expiresAt)}</strong> 自动失效并物理销毁，保护隐私，无冗余残留。
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <a
                      href={shareData.directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[#d4d4d0] bg-[#ffffff] px-2.5 py-1.5 text-[11px] font-medium text-[#2f3437] transition-all hover:bg-[#f7f6f3]"
                    >
                      <ExternalLink className="h-3 w-3 text-[#6b7280]" />
                      <span>在浏览器测试直链下载</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[#eaeaea] bg-[#ffffff] px-2.5 py-1 text-[11px] text-[#6b7280] hover:text-[#111111] hover:bg-[#f7f6f3] transition-colors"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>重新生成直链</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 导入贴士 */}
              <div className="rounded-lg bg-[#f0f4f8] px-3 py-2 text-[11px] text-[#334e68] leading-relaxed">
                💡 <strong>使用方法</strong>：将复制的链接发至手机，或手机相机扫描二维码即可直接下载 <code className="font-mono bg-white/70 px-1 py-0.5 rounded">.crown.json</code>，随后在 Moonlight-vplus 王冠模式中选择导入即可生效。
              </div>
            </div>
          )}
        </div>

        {/* 底部关闭 */}
        <div className="flex items-center justify-end border-t border-[#eaeaea] pt-3">
          <button
            type="button"
            onClick={() => setShareModalOpen(false)}
            className="rounded-md border border-[#eaeaea] bg-[#ffffff] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#f7f6f3] transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
