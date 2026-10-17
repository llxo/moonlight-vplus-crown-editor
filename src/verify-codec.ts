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
