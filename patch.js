// patch.js：按基准行号从后往前应用变更块；越界记冲突；重复应用幂等。
export const PATCH_CONFLICT = "E_PATCH_CONFLICT";

export function apply(oldLines, blocks, applied) {
  const already = new Set(applied);
  const conflicts = [];

  // 已应用的块先跳过：它们不再作用于当前文本，其遗留基准坐标也不构成越界；
  // 同一块在同一批里重复出现时，第二次起直接跳过，文件不会被打坏。
  const pending = [];
  for (const block of blocks) {
    if (already.has(block.id)) {
      continue;
    }
    // 越界判定针对原始基准区间；全部非法块都要报出来，不得静默跳过。
    if (
      !Number.isInteger(block.start) ||
      !Number.isInteger(block.end) ||
      block.start < 0 ||
      block.end < block.start ||
      block.end > oldLines.length
    ) {
      conflicts.push({ id: block.id, code: PATCH_CONFLICT });
    } else {
      pending.push(block);
    }
  }

  // 从后往前应用：先改靠后的区间，靠前块的基准行号不会失效，
  // 因而调用方以任意顺序给块（顺序错了）都能正确应用。
  const ordered = pending.slice().sort((a, b) => b.start - a.start);
  const lines = oldLines.slice();
  const newlyApplied = [];
  for (const block of ordered) {
    if (already.has(block.id)) {
      continue;
    }
    lines.splice(block.start, block.end - block.start, ...block.lines);
    already.add(block.id);
    newlyApplied.push(block);
  }

  // applied 保留既有顺序，新应用的块按基准行号从前到后追加，保证确定性。
  const appliedResult = applied.slice();
  newlyApplied.sort((a, b) => a.start - b.start);
  for (const block of newlyApplied) {
    appliedResult.push(block.id);
  }

  return { lines, applied: appliedResult, conflicts };
}
