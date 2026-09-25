// diff.js：用公共前后缀夹逼切变更块（单次线性扫描）
export function blocks(oldLines, newLines) {
  const oldCount = oldLines.length;
  const newCount = newLines.length;

  let prefix = 0;
  const sharedHead = Math.min(oldCount, newCount);
  while (prefix < sharedHead && oldLines[prefix] === newLines[prefix]) {
    prefix += 1;
  }

  let suffix = 0;
  while (
    suffix < oldCount - prefix &&
    suffix < newCount - prefix &&
    oldLines[oldCount - 1 - suffix] === newLines[newCount - 1 - suffix]
  ) {
    suffix += 1;
  }

  // 两份逐行相同：无变更块。
  if (prefix + suffix >= oldCount && prefix + suffix >= newCount) {
    return [];
  }

  const start = prefix;
  const end = oldCount - suffix;
  return [{ id: "b0", start, end, lines: newLines.slice(start, newCount - suffix) }];
}
