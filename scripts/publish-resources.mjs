import { createHash } from 'node:crypto';
import { copyFileSync, createReadStream, existsSync, linkSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { root } from './lib.mjs';
import { resourceFilePath } from './resources.mjs';
import { incompleteResourceAssets, matchResourceAsset, resourceAssetName } from './resource-release.mjs';

const repository = 'fangdawei33/my_cs';
const tag = 'learning-resources-v1';
const catalogPath = join(root, 'resources', 'catalog.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const progressPath = join(root, '.tools', 'resource-upload-progress.json');
const staging = join(root, '.tools', 'release-assets');
mkdirSync(staging, { recursive: true });

function findCli(directory) {
  if (!existsSync(directory)) return null;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isFile() && ['gh.exe', 'gh'].includes(entry.name)) return path;
    if (entry.isDirectory()) {
      const found = findCli(path);
      if (found) return found;
    }
  }
  return null;
}

// gh 自行使用官方登录存储；本脚本不读取、传递或保存访问令牌。
const cli = process.env.MY_CS_GH ?? findCli(join(root, '.tools', 'gh')) ?? 'gh';
function command(args, { optional = false } = {}) {
  // 查询遇到短暂断连可重试；写操作由调用处核对服务器结果，避免重复创建。
  const readOnly = args[0] === 'api' && !args.includes('--method');
  for (let attempt = 1; attempt <= (readOnly ? 4 : 1); attempt++) {
    const result = spawnSync(cli, args, {
      cwd: root, encoding: 'utf8', windowsHide: true,
      maxBuffer: 8 * 1024 ** 2, timeout: readOnly ? 45000 : undefined
    });
    const message = result.error?.message ?? result.stderr?.trim() ?? '';
    const transient = /EOF|timeout|timed out|ETIMEDOUT|connection.*(?:reset|closed)|TLS handshake|HTTP 50[234]/i.test(message);
    if (readOnly && attempt < 4 && transient) {
      console.log(`GitHub 查询连接中断，重试 ${attempt}/3。`);
      continue;
    }
    if (result.error) throw result.error;
    if (result.status !== 0 && !optional) throw new Error(message || 'GitHub CLI 命令失败。');
    return result;
  }
}

function api(path) {
  return JSON.parse(command(['api', path]).stdout);
}

function apiPages(path) {
  return JSON.parse(command(['api', path, '--paginate', '--slurp']).stdout).flat();
}

const account = api('user');
if (account.login.toLowerCase() !== 'fangdawei33') throw new Error(`当前登录账号是 ${account.login}，请切换到 fangdawei33。`);
if (!api(`repos/${repository}`).permissions.push) throw new Error('当前登录无权上传此仓库的附件。');

// 按标签查询的接口不返回尚未发布的草稿，先从包含草稿的列表中找到发布编号。
let release = apiPages(`repos/${repository}/releases?per_page=100`).find((item) => item.tag_name === tag);
if (!release) {
  command(['release', 'create', tag, '--repo', repository, '--target', 'main', '--draft',
    '--title', '教材与学习资源（非商用，仅供自主学习）',
    '--notes-file', join(root, 'resources', 'NOTICE.md')]);
  release = apiPages(`repos/${repository}/releases?per_page=100`).find((item) => item.tag_name === tag);
}
if (!release) throw new Error('未找到资源发布草稿。');
const releaseId = release.id;

function getRelease() {
  const result = api(`repos/${repository}/releases/${releaseId}`);
  result.assets = apiPages(`repos/${repository}/releases/${releaseId}/assets?per_page=100`);
  return result;
}

release = getRelease();
if (release.immutable) throw new Error('此 Release 已不可变，请使用新的资源发布标签。');
const completed = new Set(catalog.items.filter((item) => matchResourceAsset(item, release.assets)).map((item) => item.id));
const failures = [];
let active = 0;
const startedAt = new Date().toISOString();

function saveProgress(message) {
  writeFileSync(progressPath, JSON.stringify({
    repository, tag, total: catalog.items.length, completed: completed.size,
    completedBytes: catalog.items.filter((item) => completed.has(item.id)).reduce((sum, item) => sum + item.size, 0),
    pid: process.pid, startedAt, active, failed: failures, message, updatedAt: new Date().toISOString()
  }, null, 2));
}

async function verifyFile(item, path) {
  if (!existsSync(path) || statSync(path).size !== item.size) throw new Error(`本地原件缺失或大小变化：${item.title}`);
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  if (hash.digest('hex') !== item.sha256) throw new Error(`本地 PDF 内容变化，请重新导入：${item.title}`);
}

function upload(alias, label) {
  return new Promise((resolveUpload, reject) => {
    const process = spawn(cli, ['release', 'upload', tag, `${alias}#${label}`, '--repo', repository], {
      cwd: root, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe']
    });
    let errors = '';
    process.stderr.on('data', (chunk) => { errors = (errors + chunk).slice(-8000); });
    process.on('error', reject);
    process.on('close', (code) => code === 0 ? resolveUpload() : reject(new Error(errors || '附件上传失败')));
  });
}

function clearIncomplete(item, assets) {
  for (const asset of incompleteResourceAssets(item, assets)) {
    const result = command(['api', `repos/${repository}/releases/assets/${asset.id}`, '--method', 'DELETE'], { optional: true });
    if (result.status !== 0 && !result.stderr.includes('HTTP 404')) throw new Error(result.stderr);
  }
}

const queue = catalog.items.filter((item) => !completed.has(item.id)).sort((a, b) => a.size - b.size);
let position = 0;
console.log(`资源 ${catalog.items.length} 份，已上传 ${completed.size} 份，待上传 ${queue.length} 份。`);
saveProgress('准备上传');

async function worker() {
  while (position < queue.length) {
    const item = queue[position++];
    const source = resourceFilePath(item.localPath);
    active++;
    try {
      await verifyFile(item, source);
      const alias = join(staging, resourceAssetName(item));
      if (!existsSync(alias)) {
        mkdirSync(dirname(alias), { recursive: true });
        try { linkSync(source, alias); }
        catch (error) {
          if (!['EXDEV', 'EPERM', 'ENOTSUP', 'EOPNOTSUPP'].includes(error.code)) throw error;
          copyFileSync(source, alias);
        }
      }
      console.log(`上传中：${item.title}（${(item.size / 1024 ** 2).toFixed(1)} MiB）`);
      saveProgress(`上传中：${item.title}`);
      clearIncomplete(item, release.assets);
      let lastError;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await upload(alias, item.title);
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
          // 服务器已接收但客户端未拿到响应时，避免重复上传同一个附件。
          const remote = getRelease();
          if (matchResourceAsset(item, remote.assets)) { lastError = null; break; }
          if (attempt < 3) {
            clearIncomplete(item, remote.assets);
            console.log(`准备重传 ${attempt}/2：${item.title}`);
            await new Promise((done) => setTimeout(done, attempt * 5000));
          }
        }
      }
      if (lastError) throw lastError;
      completed.add(item.id);
      console.log(`已完成 ${completed.size}/${catalog.items.length}：${item.title}`);
    } catch (error) {
      failures.push({ id: item.id, title: item.title, error: error.message });
      console.error(`未完成：${item.title}：${error.message}`);
    } finally {
      active--;
      saveProgress('上传进行中');
    }
  }
}

// 限制并发，减少网络抖动；失败后重新运行会跳过已完成的附件。
const workerCount = Number(process.env.MY_CS_UPLOAD_WORKERS ?? 4);
if (!Number.isInteger(workerCount) || workerCount < 1 || workerCount > 5) {
  throw new Error('MY_CS_UPLOAD_WORKERS 必须为 1–5。');
}
await Promise.all(Array.from({ length: workerCount }, () => worker()));
if (failures.length) {
  saveProgress('有附件未完成，保留草稿，可重新运行续传');
  throw new Error(`${failures.length} 份附件未完成，详情见 .tools/resource-upload-progress.json。`);
}

release = getRelease();
for (const item of catalog.items) {
  const asset = matchResourceAsset(item, release.assets);
  if (!asset) throw new Error(`远程附件校验失败：${item.title}`);
  if (asset.digest && asset.digest !== `sha256:${item.sha256}`) throw new Error(`远程附件哈希不一致：${item.title}`);
}
if (release.draft) command(['release', 'edit', tag, '--repo', repository, '--draft=false']);
release = getRelease();
for (const item of catalog.items) item.downloadUrl = matchResourceAsset(item, release.assets).browser_download_url;
writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
saveProgress('全部附件已发布，下载地址已写入资源目录');
console.log(`已发布 ${catalog.items.length} 份 PDF：${release.html_url}`);
