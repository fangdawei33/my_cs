// 教程中的 HTML 代码只是展示文字，不应按真实页面资源检查。
// 保留 script/style 的开始标签，以便继续检查外部脚本等实际引用。
export function htmlResourceLinks(html) {
  const markup = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/(<(script|style)\b[^>]*>)[\s\S]*?<\/\2\s*>/gi, '$1');

  return [...markup.matchAll(/<[a-z][^>]*>/gi)].flatMap(([tag]) =>
    [...tag.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1].replaceAll('&amp;', '&'))
  );
}
