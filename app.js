// app.js：渲染结果（返回结构固定为 blocks/count/applied/conflicts/lines/idempotent）
import { blocks } from "./diff.js";
import { apply } from "./patch.js";

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function render(spec) {
  const oldLines = spec.old_lines;
  const found = blocks(oldLines, spec.new_lines);
  const result = apply(oldLines, found, spec.applied || []);

  // 幂等判定：同一批块对已打补丁的文本再打一次，文件不得再发生任何变化。
  const replay = apply(result.lines, found, result.applied);
  const idempotent =
    sameValue(result.lines, replay.lines) &&
    sameValue(result.applied, replay.applied) &&
    sameValue(result.conflicts, replay.conflicts);

  return {
    blocks: found.map((block) => [block.id, block.start, block.end, block.lines]),
    count: found.length,
    applied: result.applied,
    conflicts: result.conflicts,
    lines: result.lines,
    idempotent,
  };
}
