import { createHash } from 'node:crypto';
import { closeSync, copyFileSync, createReadStream, existsSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { root } from './lib.mjs';

async function hashFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

function safeName(value) {
  const name = value.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/[. ]+$/, '').slice(0, 140);
  if (!name || /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(name)) throw new Error('资源名称不适合作为文件名。');
  return name;
}

export async function importResources(entries) {
  const directory = join(root, 'resources');
  const catalogPath = join(directory, 'catalog.json');
  mkdirSync(directory, { recursive: true });
  const catalog = existsSync(catalogPath)
    ? JSON.parse(readFileSync(catalogPath, 'utf8'))
    : { title: '教材与学习资料', items: [] };
  const byHash = new Map(catalog.items.map((item) => [item.sha256, item]));
  let added = 0;

  for (const entry of entries) {
    const source = resolve(entry.source);
    if (extname(source).toLowerCase() !== '.pdf') throw new Error(`仅导入 PDF：${source}`);
    const size = statSync(source).size;
    const descriptor = openSync(source, 'r');
    try {
      const header = Buffer.alloc(1024);
      readSync(descriptor, header, 0, header.length, 0);
      if (!header.includes(Buffer.from('%PDF-'))) throw new Error(`文件缺少 PDF 标识：${basename(source)}`);
    } finally { closeSync(descriptor); }

    const sha256 = entry.sha256 ?? await hashFile(source);
    if (byHash.has(sha256)) {
      const existing = byHash.get(sha256);
      existing.courses = [...new Set([...existing.courses, ...(entry.courses ?? [])])];
      existing.collections = [...new Set([...(existing.collections ?? []), ...(entry.collections ?? [])])];
      continue;
    }

    const category = entry.category;
    const title = entry.title ?? basename(source, extname(source));
    const folder = safeName(category);
    let filename = safeName(title) + '.pdf';
    let destination = join(directory, 'files', folder, filename);
    if (existsSync(destination) && await hashFile(destination) !== sha256) {
      filename = `${safeName(title)}-${sha256.slice(0, 8)}.pdf`;
      destination = join(directory, 'files', folder, filename);
    }
    mkdirSync(join(directory, 'files', folder), { recursive: true });
    if (!existsSync(destination)) copyFileSync(source, destination);
    if (statSync(destination).size !== size || await hashFile(destination) !== sha256) {
      throw new Error(`复制内容校验失败：${title}`);
    }

    const item = {
      id: sha256.slice(0, 16), title, category,
      courses: entry.courses ?? [], collections: entry.collections ?? [],
      size, sha256, localPath: `files/${folder}/${filename}`, downloadUrl: ''
    };
    byHash.set(sha256, item);
    added++;
    if (added % 10 === 0) console.log(`已归档并校验 ${added} 份 PDF。`);
  }

  catalog.items = [...byHash.values()];
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`资源整理完成：新增 ${added} 份，共 ${catalog.items.length} 份。`);
  return catalog;
}

// 示例：npm run resources:import -- --category 数据库 --course 数据库 "C:\教材.pdf"
if (process.argv[1] && resolve(process.argv[1]) === join(root, 'scripts', 'import-pdfs.mjs')) {
  const args = process.argv.slice(2);
  let category;
  let course;
  const paths = [];
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--category') category = args[++index];
    else if (args[index] === '--course') course = args[++index];
    else paths.push(args[index]);
  }
  if (!category || !paths.length) throw new Error('请提供 --category 分类 和 PDF 文件或文件夹路径。');
  const files = [];
  function visit(path) {
    const info = statSync(path);
    if (info.isDirectory()) {
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        if (!entry.isSymbolicLink()) visit(join(path, entry.name));
      }
    } else if (extname(path).toLowerCase() === '.pdf') files.push(path);
  }
  paths.forEach(visit);
  await importResources(files.map((source) => ({ source, category, courses: course ? [course] : [] })));
}
