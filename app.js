// app.js：渲染结果
import { blocks } from "./diff.js";
import { apply } from "./patch.js";

export function render(spec) {
  const found = blocks(spec.old_lines, spec.new_lines);
  const initialApplied = spec.applied || [];
  const result = apply(spec.old_lines, found, initialApplied);

  // 幂等判定：拿着第一次应用后的文本与 applied 状态，再打同一批块，
  // 块全部已应用应被跳过，文本、清单、冲突都不应再变化。
  const again = apply(result.lines, found, result.applied);
  const idempotent =
    JSON.stringify(again.lines) === JSON.stringify(result.lines) &&
    JSON.stringify(again.applied) === JSON.stringify(result.applied) &&
    JSON.stringify(again.conflicts) === JSON.stringify(result.conflicts);

  return { blocks: found.map((block) => [block.id, block.start, block.end, block.lines]),
           count: found.length, applied: result.applied, conflicts: result.conflicts,
           lines: result.lines, idempotent };
}
