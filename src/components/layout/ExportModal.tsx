/**
 * @file ExportModal.tsx
 * @description 一体化导出与配置核对中心：告别无脑导出，导出前确认元数据与触控基准，支持本地 .crown.json 下载与 24 小时直链扫码双轨交付
 * 遵循 minimalist-ui 规范：清晰排印、大方字号、高质感黑白灰
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState } from "react";
import {
  Download,
  Link2,
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Clock,
  RefreshCw,
  AlertCircle,
  FileBox,
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
}

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    setExportModalOpen,
    meta,
    updateMeta,
    settings,
    updateSettings,
    exportBundle,
    layoutBasis,
    elements,
  } = useCrownStore();

  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareData, setShareData] = useState<ShareResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isExportModalOpen) {
    return null;
  }

  // 1. 本地落盘下载 .crown.json
  const handleDownloadFile = async () => {
    try {
      const bundle = await exportBundle();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${bundle.name || "profile"}.crown.json`;
      link.click();
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      alert(`导出文件失败: ${err.message}`);
    }
  };

  // 2. 生成 24 小时短效直链
  const handleGenerateShareLink = async () => {
    setShareLoading(true);
    setShareError(null);
    setCopied(false);

    try {
      const bundle = await exportBundle();
      const payloadStr = JSON.stringify({ bundle });

      if (payloadStr.length > 512 * 1024) {
        throw new Error("当前配置文件体积超出上限 (最大 512KB)");
      }

      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadStr,
      });

      if (!res.ok) {
        let errMsg = `HTTP 错误: ${res.status}`;
        try {
          const json = await res.json();
          if (json.error) errMsg = json.error;
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }

      const data: ShareResult = await res.json();
      setShareData(data);

      // 本地离线渲染高清二维码
      const qrUrl = await QRCode.toDataURL(data.directUrl, {
        width: 150,
        margin: 1,
        color: { dark: "#111111", light: "#ffffff" },
      });
      setQrDataUrl(qrUrl);
    } catch (err: any) {
      setShareError(err.message || "生成直链失败");
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareData?.directUrl) return;
    try {
      await navigator.clipboard.writeText(shareData.directUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
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

  const formatExpireTime = (timestamp: number) => {
    if (!timestamp) return "24小时后";
    const date = new Date(timestamp);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${mm}-${dd} ${hh}:${min}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) setExportModalOpen(false);
      }}
    >
      <div
        className="flex flex-col w-full max-w-[540px] max-h-[92vh] rounded-2xl border border-[#eaeaea] bg-[#ffffff] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-[#eaeaea] px-6 py-4 bg-[#ffffff]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111111] text-[#ffffff] shadow-xs">
              <FileBox className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#111111]">导出配置</h3>
              <span className="text-xs text-[#6b7280]">
                {elements.length} 个控件 · 基准 {layoutBasis.widthPx}×{layoutBasis.heightPx}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExportModalOpen(false)}
            className="rounded-lg p-1.5 text-[#6b7280] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 表单滚动内容区 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#fafaf9] text-sm">
          {/* 模块 1：配置名片与元数据 */}
          <div className="rounded-xl border border-[#eaeaea] bg-[#ffffff] p-4 space-y-3 shadow-2xs">
            <div className="text-xs font-bold uppercase tracking-wider text-[#374151]">
              配置名片信息
            </div>
            <div>
              <label className="text-sm font-medium text-[#374151] block mb-1.5">配置名称</label>
              <input
                type="text"
                autoFocus
                value={meta.name}
                onChange={(e) => updateMeta({ name: e.target.value })}
                className="w-full rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3.5 py-2 text-sm text-[#111111] font-semibold outline-none focus:border-[#111111] focus:bg-[#ffffff] transition-colors"
                placeholder="给你的配置起个名字"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[#374151] block mb-1.5">作者署名</label>
                <input
                  type="text"
                  value={meta.authorName || ""}
                  onChange={(e) => updateMeta({ authorName: e.target.value })}
                  className="w-full rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3.5 py-2 text-sm text-[#111111] outline-none focus:border-[#111111] focus:bg-[#ffffff] transition-colors"
                  placeholder="作者昵称"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#374151] block mb-1.5">适配游戏</label>
                <input
                  type="text"
                  value={meta.gameName || ""}
                  onChange={(e) => updateMeta({ gameName: e.target.value })}
                  className="w-full rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3.5 py-2 text-sm text-[#111111] outline-none focus:border-[#111111] focus:bg-[#ffffff] transition-colors"
                  placeholder="如: Apex / 原神 / 黑神话"
                />
              </div>
            </div>
          </div>

          {/* 模块 2：全局触控基石参数 */}
          <div className="rounded-xl border border-[#eaeaea] bg-[#ffffff] p-4 space-y-3.5 shadow-2xs">
            <div className="text-xs font-bold uppercase tracking-wider text-[#374151]">
              全局触控与手柄设置
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#111111]">触控模式</span>
              <select
                value={settings.touch_mode}
                onChange={(e) => updateSettings({ touch_mode: e.target.value as "true" | "false" })}
                className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3 py-1.5 text-sm font-medium text-[#111111] outline-none focus:border-[#111111]"
              >
                <option value="true">触控板模式 (Trackpad)</option>
                <option value="false">多点/经典模式 (Classic)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-[#374151]">
                <span>滑动灵敏度</span>
                <span className="font-mono font-bold text-[#111111]">{settings.touch_sense}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={settings.touch_sense}
                onChange={(e) => updateSettings({ touch_sense: Number(e.target.value) })}
                className="w-full accent-[#111111] h-2 bg-[#eaeaea] rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#374151]">
                <input
                  type="checkbox"
                  checked={settings.game_vibrator === "true"}
                  onChange={(e) => updateSettings({ game_vibrator: e.target.checked ? "true" : "false" })}
                  className="accent-[#111111] h-4 w-4 rounded cursor-pointer"
                />
                <span>手柄马达震动回馈</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#374151]">
                <input
                  type="checkbox"
                  checked={settings.button_vibrator === "true"}
                  onChange={(e) => updateSettings({ button_vibrator: e.target.checked ? "true" : "false" })}
                  className="accent-[#111111] h-4 w-4 rounded cursor-pointer"
                />
                <span>按键触觉反馈</span>
              </label>
            </div>
          </div>

          {/* 模块 3：24小时直链生成展开区 (当用户点击生成直链后展开呈现) */}
          {shareLoading && (
            <div className="rounded-xl border border-[#eaeaea] bg-[#ffffff] p-4 flex items-center justify-center gap-2 text-sm font-medium text-[#374151]">
              <RefreshCw className="h-4 w-4 animate-spin text-[#111111]" />
              <span>正在生成 24 小时直链...</span>
            </div>
          )}

          {shareError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{shareError}</span>
            </div>
          )}

          {shareData && !shareLoading && (
            <div className="rounded-xl border border-[#eaeaea] bg-[#ffffff] p-4 space-y-3 animate-in fade-in shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#374151]">
                <span>24 小时短效直链</span>
                <span className="text-[#2e7d32] font-semibold flex items-center gap-1 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  有效至 {formatExpireTime(shareData.expiresAt)}
                </span>
              </div>

              {/* 直链输入框与复制 */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={shareData.directUrl}
                  className="flex-1 rounded-lg border border-[#eaeaea] bg-[#fbfbfa] px-3 py-1.5 text-xs font-mono text-[#111111] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`flex items-center gap-1 shrink-0 rounded-lg px-3 py-1.5 font-semibold text-xs transition-all ${
                    copied
                      ? "bg-[#2e7d32] text-white"
                      : "bg-[#111111] text-white hover:bg-[#2b2b2b]"
                  }`}
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

              {/* 二维码与浏览器测试 */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="手机扫码二维码"
                      className="h-20 w-20 rounded-lg border border-[#eaeaea] p-0.5"
                    />
                  )}
                  <div className="flex flex-col text-xs text-[#6b7280]">
                    <span className="font-semibold text-[#111111] flex items-center gap-1">
                      <QrCode className="h-3.5 w-3.5 text-[#111111]" />
                      手机扫码直接下载
                    </span>
                    <span className="mt-0.5">扫码后在手机端导入即可</span>
                  </div>
                </div>

                <a
                  href={shareData.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-[#eaeaea] px-2.5 py-1.5 text-xs font-medium text-[#4b5563] hover:text-[#111111] hover:bg-[#f7f6f3] transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>浏览器直接打开</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 底部双轨行动操作区 */}
        <div className="flex items-center justify-between border-t border-[#eaeaea] px-6 py-4 bg-[#ffffff]">
          <button
            type="button"
            onClick={handleGenerateShareLink}
            disabled={shareLoading}
            className="flex items-center gap-2 rounded-xl border border-[#d4d4d0] bg-[#ffffff] px-4 py-2.5 text-sm font-semibold text-[#111111] hover:bg-[#f7f6f3] hover:border-[#111111] transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
          >
            <Link2 className="h-4 w-4" />
            <span>生成 24h 直链</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadFile}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-xs ${
              downloadSuccess
                ? "bg-[#2e7d32] text-white"
                : "bg-[#111111] text-white hover:bg-[#2b2b2b]"
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="h-4.5 w-4.5" />
                <span>已保存到本地</span>
              </>
            ) : (
              <>
                <Download className="h-4.5 w-4.5" />
                <span>下载配置</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
