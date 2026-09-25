// patch.js：按基准行号从后往前应用变更块；已应用的跳过；越界记 E_PATCH_CONFLICT
export const PATCH_CONFLICT_CODE = "E_PATCH_CONFLICT";

function isValidInterval(block, length) {
  return Number.isInteger(block.start) &&
    Number.isInteger(block.end) &&
    block.start >= 0 &&
    block.start <= block.end &&
    block.end <= length;
}

export function apply(oldLines, blockList, applied) {
  const lines = oldLines.slice();
  const appliedIds = applied.slice();
  const done = new Set(appliedIds);
  const conflicts = [];

  // 已在 applied 里的块直接跳过：同一批块重复打不能把文件打坏
  const pending = [];
  for (const block of blockList) {
    if (!done.has(block.id)) pending.push(block);
  }

  // 所有块的基准区间都相对原始文本，先统一验界，不静默跳过
  for (const block of pending) {
    if (!isValidInterval(block, lines.length)) {
      conflicts.push({
        id: block.id,
        code: PATCH_CONFLICT_CODE,
        message: "block " + block.id + " base interval [" + block.start + "," +
          block.end + ") is out of range for " + lines.length + " lines",
      });
    }
  }

  // 合法块按基准行号从后往前应用，先动后面的区间不会挪动前面块的行号
  const valid = pending
    .filter((block) => isValidInterval(block, lines.length))
    .sort((a, b) => (b.start - a.start) || (b.end - a.end));

  for (const block of valid) {
    lines.splice(block.start, block.end - block.start, ...block.lines);
    appliedIds.push(block.id);
    done.add(block.id);
  }

  return { lines, applied: appliedIds, conflicts };
}
