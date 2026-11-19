import { mkdirSync, existsSync, chmodSync } from 'node:fs';
import { writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { root, version } from './lib.mjs';

// 只安装到当前项目的 .tools，不修改 PATH 或系统目录。
const tools = join(root, '.tools');
mkdirSync(tools, { recursive: true });
const binary = join(tools, process.platform === 'win32' ? 'mdbook.exe' : 'mdbook');
if (existsSync(binary) && spawnSync(binary, ['--version'], { encoding: 'utf8' }).stdout?.trim() === `mdbook v${version}`) {
  console.log(`mdbook ${version} 已就绪：${binary}`);
  process.exit(0);
}
const targets = {
  'win32-x64': 'x86_64-pc-windows-msvc.zip',
  'linux-x64': 'x86_64-unknown-linux-gnu.tar.gz',
  'darwin-arm64': 'aarch64-apple-darwin.tar.gz',
  'darwin-x64': 'x86_64-apple-darwin.tar.gz'
};
const target = targets[`${process.platform}-${process.arch}`];
if (!target) throw new Error('此平台请手动安装 mdbook 0.4.52：https://rust-lang.github.io/mdBook/guide/installation.html');
const url = `https://github.com/rust-lang/mdBook/releases/download/v${version}/mdbook-v${version}-${target}`;
console.log(`下载官方 mdBook ${version}…`);
const response = await fetch(url);
if (!response.ok) throw new Error(`下载失败：HTTP ${response.status}，请检查到 GitHub 的连接。`);
const archive = join(tools, target.endsWith('.zip') ? 'mdbook.zip' : 'mdbook.tar.gz');
await writeFile(archive, Buffer.from(await response.arrayBuffer()));
const unpack = process.platform === 'win32'
  ? spawnSync('powershell.exe', ['-NoProfile', '-Command', 'Expand-Archive -LiteralPath $env:MY_CS_ARCHIVE -DestinationPath $env:MY_CS_TOOLS -Force'], {
    stdio: 'inherit', env: { ...process.env, MY_CS_ARCHIVE: archive, MY_CS_TOOLS: tools }
  })
  : spawnSync('tar', ['-xzf', archive, '-C', tools], { stdio: 'inherit' });
if (unpack.status !== 0) throw new Error('解压失败，请手动下载官方 mdBook 安装包。');
if (process.platform !== 'win32') chmodSync(binary, 0o755);
const verify = spawnSync(binary, ['--version'], { encoding: 'utf8' });
if (verify.status !== 0 || !verify.stdout.includes(`v${version}`)) throw new Error('mdBook 安装校验失败。');
await rm(archive);
console.log(`已安装 ${verify.stdout.trim()}。现在可运行 npm run dev。`);
