import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname);

async function main() {
  try {
    console.log("📦 Starting postinstall script...");

    let chromiumDir: string;
    try {
      const chromiumMainPath = require.resolve("@sparticuz/chromium");
      chromiumDir = dirname(chromiumMainPath);
      while (!existsSync(join(chromiumDir, "bin")) && chromiumDir !== "/") {
        chromiumDir = dirname(chromiumDir);
      }
    } catch {
      const nodeModulesPath = join(projectRoot, "node_modules", "@sparticuz", "chromium");
      chromiumDir = nodeModulesPath;
    }
    
    const binDir = join(chromiumDir, "bin");

    if (!existsSync(binDir)) {
      console.log(
        "⚠️  Chromium bin directory not found, skipping archive creation"
      );
      return;
    }

    const publicDir = join(projectRoot, "public");
    const outputPath = join(publicDir, "chromium-pack.tar");

    console.log("📦 Creating chromium tar archive...");
    console.log("   Source:", binDir);
    console.log("   Output:", outputPath);

    execSync(`mkdir -p ${publicDir} && tar -cf "${outputPath}" -C "${binDir}" .`, {
      stdio: "inherit",
      cwd: projectRoot,
    });

    console.log("✅ Chromium archive created successfully!");
  } catch (error) {
    console.error("❌ Failed to create chromium archive:", error instanceof Error ? error.message : String(error));
    console.log("⚠️  This is not critical for local development");
    process.exit(0);
  }
}

main();
