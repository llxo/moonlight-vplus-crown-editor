/**
 * @file WelcomeModal.tsx
 * @description 欢迎引导与快速起步中心：遵循 minimalist-ui 规范，采用对称 Bento-grid 便当盒排版、官方模版快速载入、文件拖拽导入与快捷键速查
 * @author Moonlight-vplus Architect
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Crown,
  X,
  Upload,
  FilePlus,
  Gamepad2,
  ArrowRight,
  Monitor,
  Copy,
  Check,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useCrownStore } from "../../store/useCrownStore";
import {
  fetchCommunityProfileIndex,
  fetchCommunityProfileJson,
  type CommunityProfileItem,
} from "../../constants/templates";

export const WelcomeModal: React.FC = () => {
  const {
    isWelcomeModalOpen,
    setWelcomeModalOpen,
    loadBlankProfile,
    loadFromBundleOrPayload,
  } = useCrownStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isMobileUser, setIsMobileUser] = useState(false);
  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loadingProfilePath, setLoadingProfilePath] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<CommunityProfileItem[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);

  useEffect(() => {
    if (!isWelcomeModalOpen) return;
    setIsLoadingIndex(true);
    fetchCommunityProfileIndex()
      .then((list) => setProfiles(list))
      .catch((err) => console.error("加载模版清单失败:", err))
      .finally(() => setIsLoadingIndex(false));
  }, [isWelcomeModalOpen]);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
        navigator.userAgent || ""
      );
      setIsMobileUser(isMobile);
    }
  }, []);

  const handleCopyCurrentUrl = async () => {
    if (typeof window === "undefined") return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        const input = document.createElement("input");
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setHasCopiedUrl(true);
      setTimeout(() => setHasCopiedUrl(false), 2000);
    } catch {
      // 容错处理
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDontShowAgain(localStorage.getItem("moonlight_crown_welcome_dismissed") === "true");
    }
  }, [isWelcomeModalOpen]);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      if (dontShowAgain) {
        localStorage.setItem("moonlight_crown_welcome_dismissed", "true");
      } else {
        localStorage.removeItem("moonlight_crown_welcome_dismissed");
      }
    }
    setWelcomeModalOpen(false);
  };

  // ESC 键关闭
  useEffect(() => {
    if (!isWelcomeModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWelcomeModalOpen, dontShowAgain]);

  const filteredProfiles = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return profiles;
    return profiles.filter((p) => {
      return (
        p.name.toLowerCase().includes(kw) ||
        p.game.toLowerCase().includes(kw) ||
        p.author.toLowerCase().includes(kw) ||
        p.summary.toLowerCase().includes(kw) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(kw)))
      );
    });
  }, [searchKeyword, profiles]);

  const handleApplyCommunityProfile = async (tpl: CommunityProfileItem) => {
    try {
      const targetUrl = tpl.url;
      setLoadingProfilePath(targetUrl);
      const jsonText = await fetchCommunityProfileJson(targetUrl);
      await loadFromBundleOrPayload(jsonText);
      handleClose();
    } catch (err: any) {
      alert(`载入配置失败: ${err.message || "网络异常，请重试"}`);
    } finally {
      setLoadingProfilePath(null);
    }
  };

  const handleCreateBlank = () => {
    loadBlankProfile();
    handleClose();
  };

  const handleFileProcess = async (file: File) => {
    try {
      const text = await file.text();
      await loadFromBundleOrPayload(text);
      handleClose();
    } catch (err: any) {
      alert(`导入配置文件失败: ${err.message || "格式不合法"}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  if (!isWelcomeModalOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4 sm:p-6 select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl border border-[#eaeaea] bg-[#ffffff] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between border-b border-[#eaeaea] px-6 py-4 bg-[#ffffff]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111111] text-[#ffffff] shadow-xs">
              <Crown className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-bold text-lg text-[#111111] tracking-tight">
                Moonlight-vplus Crown Editor
              </h2>
              <span className="rounded-full bg-[#fbf3db] text-[#956400] text-xs font-mono font-medium px-2 py-0.5 border border-[#eaeaea]">
                v1.2.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href="https://github.com/llxo/moonlight-vplus-crown-editor/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-[#787774] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors"
              title="GitHub 仓库"
              aria-label="GitHub 仓库"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-2 text-[#787774] hover:bg-[#f7f6f3] hover:text-[#111111] transition-colors cursor-pointer"
              title="关闭引导"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 主体 Bento 便当盒区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fafaf9]">
          {/* 手机 UA 移动端访问提醒卡片 */}
          {isMobileUser && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-xl border border-[#edd99d] bg-[#fbf3db] p-4 text-[#956400] animate-in fade-in duration-150">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffffff] border border-[#edd99d]/60 text-[#956400] shadow-2xs">
                  <Monitor className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#734c00]">
                      请在电脑浏览器使用
                    </span>
                  </div>
                  <p className="text-xs text-[#956400]/90 leading-relaxed">
                    移动端未做适配，建议在电脑浏览器中打开使用。
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCurrentUrl}
                className="shrink-0 flex items-center gap-1.5 rounded-lg border border-[#edd99d] bg-[#ffffff] px-3 py-1.5 text-xs font-semibold text-[#734c00] hover:bg-[#fef9ee] active:scale-95 transition-all shadow-2xs cursor-pointer"
                title="复制当前网址发送给电脑"
              >
                {hasCopiedUrl ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#346538]" />
                    <span className="text-[#346538]">已复制网址</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#956400]" />
                    <span>复制网页链接</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 1. 官方社区模版库 */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/qiin2333/crown-profiles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#374151] hover:text-[#111111] transition-colors group/link cursor-pointer"
                  title="访问官方社区配置仓库 (qiin2333/crown-profiles)"
                >
                  <span className="group-hover/link:underline underline-offset-2">官方社区模版库</span>
                  <ExternalLink className="h-3 w-3 text-[#999999] group-hover/link:text-[#111111] transition-colors" />
                </a>
                <span className="rounded-full bg-[#f0f0ee] text-[#6b7280] text-[11px] font-mono px-2 py-0.5 border border-[#eaeaea]">
                  {isLoadingIndex ? "加载中..." : `已收录 ${profiles.length} 套配置`}
                </span>
              </div>

              {/* 即时搜索框 */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#999999]" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索游戏、配置或作者..."
                  className="w-full rounded-lg border border-[#eaeaea] bg-[#ffffff] pl-8 pr-7 py-1 text-xs text-[#111111] placeholder:text-[#999999] outline-none focus:border-[#111111] transition-all"
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={() => setSearchKeyword("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#111111]"
                    title="清空搜索"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 卡片网格列表 */}
            {isLoadingIndex ? (
              <div className="flex items-center justify-center p-12 text-xs text-[#787774] gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#111111]" />
                <span>正在加载社区模版列表...</span>
              </div>
            ) : filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[330px] overflow-y-auto pr-1">
                {filteredProfiles.map((tpl) => {
                  const isLoading = loadingProfilePath === tpl.url;
                  return (
                    <div
                      key={tpl.bundleId || tpl.url}
                      onClick={() => !isLoading && handleApplyCommunityProfile(tpl)}
                      className="group flex flex-col justify-between rounded-xl border border-[#eaeaea] bg-[#ffffff] p-3.5 hover:border-[#111111] hover:shadow-xs hover:bg-[#fbfbfa] transition-all cursor-pointer relative"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f7f6f3] border border-[#eaeaea] group-hover:bg-[#111111] group-hover:text-[#ffffff] transition-colors">
                            <Gamepad2 className="h-3.5 w-3.5" />
                          </div>
                          <span className="rounded bg-[#f7f6f3] text-[#4b5563] text-[11px] px-2 py-0.5 font-medium border border-[#eaeaea] truncate max-w-[130px]">
                            {tpl.game || "通用"}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-[#111111] truncate" title={tpl.name}>
                            {tpl.name}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-[#6b7280] mt-1">
                            <span className="truncate max-w-[100px]">@{tpl.author || "社区"}</span>
                            {tpl.layoutBasis && (
                              <span className="font-mono text-[11px] text-[#888888]">
                                {tpl.layoutBasis.widthPx < tpl.layoutBasis.heightPx
                                  ? `${tpl.layoutBasis.heightPx}×${tpl.layoutBasis.widthPx}`
                                  : `${tpl.layoutBasis.widthPx}×${tpl.layoutBasis.heightPx}`}
                              </span>
                            )}
                          </div>
                          {tpl.summary && (
                            <p className="text-[11px] text-[#787774] line-clamp-1 mt-1" title={tpl.summary}>
                              {tpl.summary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#111111]">
                        <span className="font-medium text-[#4b5563] group-hover:text-[#111111]">
                          {isLoading ? "载入中..." : "载入配置"}
                        </span>
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#111111]" />
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5 text-[#787774] group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-[#ffffff] p-8 text-center text-xs text-[#787774]">
                <span>未找到与 "{searchKeyword}" 相关的社区配置</span>
                <button
                  type="button"
                  onClick={() => setSearchKeyword("")}
                  className="mt-2 font-medium text-[#111111] underline underline-offset-2 cursor-pointer"
                >
                  清除搜索条件
                </button>
              </div>
            )}
          </div>

          {/* 2. 快捷通道：导入已有配置 & 空白起步 (双列并排，完美对称) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* 导入本地配置 */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex items-center gap-3.5 rounded-xl border-2 border-dashed p-4 transition-all cursor-pointer ${
                isDraggingFile
                  ? "border-[#111111] bg-[#fbf3db]"
                  : "border-[#dcdbd8] bg-[#ffffff] hover:border-[#111111] hover:bg-[#fbfbfa]"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileProcess(file);
                  e.target.value = "";
                }}
                accept=".json,.crown.json"
                className="hidden"
              />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f6f3] border border-[#eaeaea] group-hover:border-[#111111]/30 transition-colors">
                <Upload className="h-5 w-5 text-[#374151]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[#111111]">
                  导入已有配置
                </span>
                <span className="text-xs text-[#6b7280] mt-0.5">
                  支持点击或拖拽 .crown.json 文件
                </span>
              </div>
            </div>

            {/* 从空白画布开始 */}
            <div
              onClick={handleCreateBlank}
              className="group flex items-center justify-between rounded-xl border border-[#eaeaea] bg-[#ffffff] p-4 hover:border-[#111111] hover:bg-[#fbfbfa] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f6f3] border border-[#eaeaea] group-hover:border-[#111111]/30 transition-colors">
                  <FilePlus className="h-5 w-5 text-[#111111]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-[#111111]">
                    纯净空白画布
                  </span>
                  <span className="text-xs text-[#6b7280] mt-0.5">
                    清空画布从零自由编排
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#787774] group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all mr-1" />
            </div>
          </div>

          {/* 3. 工作台交互快捷速查 */}
          <div className="rounded-xl border border-[#eaeaea] bg-[#ffffff] p-4 space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#374151] block">
              常用快捷键速查
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
              <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2.5 space-y-1">
                <div className="text-xs text-[#6b7280]">视口缩放</div>
                <div className="font-mono text-xs font-semibold text-[#111111]">
                  <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">滚轮</kbd>
                </div>
              </div>

              <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2.5 space-y-1">
                <div className="text-xs text-[#6b7280]">克隆控件</div>
                <div className="font-mono text-xs font-semibold text-[#111111]">
                  <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">Ctrl</kbd>+<kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">D</kbd>
                </div>
              </div>

              <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2.5 space-y-1">
                <div className="text-xs text-[#6b7280]">撤销操作</div>
                <div className="font-mono text-xs font-semibold text-[#111111]">
                  <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">Ctrl</kbd>+<kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">Z</kbd>
                </div>
              </div>

              <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2.5 space-y-1">
                <div className="text-xs text-[#6b7280]">删除控件</div>
                <div className="font-mono text-xs font-semibold text-[#111111]">
                  <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">Del</kbd>
                </div>
              </div>

              <div className="rounded-lg border border-[#eaeaea] bg-[#fbfbfa] p-2.5 space-y-1">
                <div className="text-xs text-[#6b7280]">右键菜单</div>
                <div className="font-mono text-xs font-semibold text-[#111111]">
                  <kbd className="rounded border border-[#dcdbd8] bg-[#ffffff] px-1.5 py-0.5">鼠标右键</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作 Footer */}
        <div className="flex items-center justify-between border-t border-[#eaeaea] px-6 py-4 bg-[#ffffff]">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#4b5563] hover:text-[#111111] transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 rounded border-[#dcdbd8] accent-[#111111] cursor-pointer"
            />
            <span>下次启动不再自动弹出</span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-[#111111] px-6 py-2.5 text-sm font-semibold text-[#ffffff] hover:bg-[#2b2b2b] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            进入工作台
          </button>
        </div>
      </div>
    </div>
  );
};
