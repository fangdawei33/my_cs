// 附件名保留书名，并带上内容 ID，避免同名教材冲突；长度兼容 Windows 与 GitHub。
export function resourceAssetName(item) {
  if (!/^[a-f0-9]{16}$/.test(item.id)) throw new Error('资源 ID 格式不正确。');
  const cleaned = item.title.normalize('NFKC')
    .replace(/[^\p{L}\p{N}._-]+/gu, '_')
    .replace(/^[_\.]+|[_\.]+$/g, '');
  let title = '';
  for (const character of cleaned) {
    if (Buffer.byteLength(title + character, 'utf8') > 160) break;
    title += character;
  }
  return `${item.id}-${title || '教材'}.pdf`;
}

export function matchResourceAsset(item, assets) {
  return assets.find((asset) => asset.name.startsWith(item.id + '-') &&
    asset.name.endsWith('.pdf') && asset.size === item.size && asset.state === 'uploaded');
}

// 只清理本份资料上传中断后留下的占位附件，不触碰已完成的文件。
export function incompleteResourceAssets(item, assets) {
  return assets.filter((asset) => asset.name.startsWith(item.id + '-') &&
    asset.name.endsWith('.pdf') && asset.state === 'starter');
}
