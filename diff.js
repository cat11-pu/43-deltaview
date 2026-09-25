// diff.js：公共前后缀夹逼切变更块（单次线性比对，O(n)，不按块重扫全文）
export function blocks(oldLines, newLines) {
  const oldLen = oldLines.length;
  const newLen = newLines.length;
  const bound = oldLen < newLen ? oldLen : newLen;

  let prefix = 0;
  while (prefix < bound && oldLines[prefix] === newLines[prefix]) prefix += 1;

  // 公共前缀已覆盖两份文本：逐行相同，没有变更块
  if (prefix === oldLen && prefix === newLen) return [];

  let suffix = 0;
  const suffixBound = bound - prefix;
  while (suffix < suffixBound &&
         oldLines[oldLen - 1 - suffix] === newLines[newLen - 1 - suffix]) {
    suffix += 1;
  }

  return [{
    id: "b0",
    start: prefix,
    end: oldLen - suffix,
    lines: newLines.slice(prefix, newLen - suffix),
  }];
}
