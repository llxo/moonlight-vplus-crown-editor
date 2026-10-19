import * as fs from "fs";
import * as path from "path";
import { decodeCrownBundle, encodeCrownBundle, smartImportProfile } from "./crownCodec";

async function runVerification() {
  console.log("== 开始执行王冠协议编解码与哈希校验回归测试 ==");

  // 1. 测试 minimal-profile.crown.json
  const bundlePath = path.resolve(process.cwd(), "fixtures/minimal-profile.crown.json");
  const bundleContent = fs.readFileSync(bundlePath, "utf-8");

  const bundleResult = await decodeCrownBundle(bundleContent);
  console.log("1. minimal-profile.crown.json 解码校验结果:");
  console.log("   - SHA-256 校验:", bundleResult.isValidSha256 ? "✅ PASS" : "❌ FAIL");
  console.log("   - MD5 校验:", bundleResult.isValidMd5 ? "✅ PASS" : "❌ FAIL");
  console.log("   - 元素解析数量:", bundleResult.parsedProfile.elements.length);
  console.log("   - 配置名称:", bundleResult.bundle.name);

  if (!bundleResult.isValidSha256 || !bundleResult.isValidMd5) {
    throw new Error("minimal-profile.crown.json 校验未通过");
  }

  // 2. 测试 raw-payload.json
  const rawPath = path.resolve(process.cwd(), "fixtures/raw-payload.json");
  const rawContent = fs.readFileSync(rawPath, "utf-8");
  const rawResult = await smartImportProfile(rawContent);
  console.log("2. raw-payload.json 智能导入校验结果:");
  console.log("   - MD5 校验:", rawResult.isValidMd5 ? "✅ PASS" : "❌ FAIL");
  console.log("   - 元素解析数量:", rawResult.parsedProfile.elements.length);

  if (!rawResult.isValidMd5) {
    throw new Error("raw-payload.json MD5 校验未通过");
  }

  // 3. 测试从零重新打包并再次校验
  const reEncodedBundle = await encodeCrownBundle({
    name: "Roundtrip Test Profile",
    summary: "自动回归测试生成的分享包",
    settings: bundleResult.parsedProfile.settings,
    elements: bundleResult.parsedProfile.elements,
    layoutBasis: bundleResult.bundle.layoutBasis,
  });

  const reDecodeResult = await decodeCrownBundle(reEncodedBundle);
  console.log("3. 重新编码后二次解包校验结果:");
  console.log("   - 二次 SHA-256 校验:", reDecodeResult.isValidSha256 ? "✅ PASS" : "❌ FAIL");
  console.log("   - 二次 MD5 校验:", reDecodeResult.isValidMd5 ? "✅ PASS" : "❌ FAIL");

  if (!reDecodeResult.isValidSha256 || !reDecodeResult.isValidMd5) {
    throw new Error("二次打包回环测试未通过");
  }

  // 4. 测试 24小时直链服务 (api/share) 对导出 bundle 的接收与校验
  const { default: shareHandler } = await import(/* @vite-ignore */ "../api/share" as any);
  const shareReq = new Request("http://localhost:3000/api/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bundle: reEncodedBundle }),
  });
  const shareRes = await shareHandler(shareReq);
  const shareData = await shareRes.json();
  const shareSuccess = shareRes.status === 200 && Boolean(shareData.directUrl);
  console.log("4. api/share 直链生成校验结果:", shareSuccess ? "✅ PASS" : "❌ FAIL");
  if (!shareSuccess) {
    throw new Error(`api/share 直链生成失败: ${JSON.stringify(shareData)}`);
  }

  // 5. 测试左侧状态栏占位自动推断能力 (gal-1080p 与 通用低分辨率/红米K50)
  const galPath = path.resolve(process.cwd(), "public/profiles/galgame/gal-1080p-2be2d3fd.crown.json");
  if (fs.existsSync(galPath)) {
    const galContent = fs.readFileSync(galPath, "utf-8");
    const galResult = await smartImportProfile(galContent);
    console.log("5.1. gal-1080p 左侧状态栏占位推导测试:");
    console.log("   - 还原物理全屏画布:", `${galResult.layoutBasis.widthPx} × ${galResult.layoutBasis.heightPx}`);
    console.log("   - 左侧状态栏占位:", `${galResult.statusBarInset}px`);
    console.log("   - 状态栏避让标志:", galResult.isCutoutDetected ? "✅ DETECTED" : "❌ NONE");
    if (galResult.layoutBasis.widthPx !== 2340 || galResult.statusBarInset !== 90) {
      throw new Error(`gal-1080p 状态栏占位推导错误: 期望 2340 物理宽与 90px 占位，实际获得 ${galResult.layoutBasis.widthPx} 和 ${galResult.statusBarInset}`);
    }
  }

  const k50Path = path.resolve(process.cwd(), "public/profiles/crown-profile/crown-profile-66f61513.crown.json");
  if (fs.existsSync(k50Path)) {
    const k50Content = fs.readFileSync(k50Path, "utf-8");
    const k50Result = await smartImportProfile(k50Content);
    console.log("5.2. 通用低分辨率 (红米K50) 左侧状态栏占位推导测试:");
    console.log("   - 还原物理全屏画布:", `${k50Result.layoutBasis.widthPx} × ${k50Result.layoutBasis.heightPx}`);
    console.log("   - 左侧状态栏占位:", `${k50Result.statusBarInset}px`);
    console.log("   - 状态栏避让标志:", k50Result.isCutoutDetected ? "✅ DETECTED" : "❌ NONE");
    if (k50Result.layoutBasis.widthPx !== 2400 || k50Result.statusBarInset !== 78) {
      throw new Error(`通用低分辨率 状态栏占位推导错误: 期望 2400 物理宽与 78px 占位，实际获得 ${k50Result.layoutBasis.widthPx} 和 ${k50Result.statusBarInset}`);
    }
  }

  // 清理临时文件（若存在）
  const tempTestFile = path.resolve(process.cwd(), "test-share.ts");
  if (fs.existsSync(tempTestFile)) {
    fs.unlinkSync(tempTestFile);
  }

  console.log("🎉 所有编解码、哈希校验与直链服务回归测试全部通过！");
}

runVerification().catch((err) => {
  console.error("❌ 测试失败:", err);
  process.exit(1);
});
