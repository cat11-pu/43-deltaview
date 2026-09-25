import fs from "node:fs";
import { blocks } from "./diff.js";
import { apply } from "./patch.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/delta.json", "utf8"));
const found = blocks(spec.old_lines, spec.new_lines);
const result = apply(spec.old_lines, found, spec.applied || []);
const view = render(spec);

emit("变更块 =", found.map((block) => [block.id, block.start, block.end]));
emit("变更块数 =", found.length);
emit("应用的块 =", result.applied);
emit("冲突的块 =", result.conflicts);
emit("应用后的文本 =", result.lines);
emit("重复应用是否幂等 =", view.idempotent);
emit("结果是否与目标一致 =", JSON.stringify(result.lines) === JSON.stringify(spec.new_lines));
emit("顺序冲突的错误码 =", spec.conflict_code);


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "变更块": [
    [
      "b0",
      2,
      4
    ]
  ],
  "变更块数": 1,
  "应用的块": [
    "b0"
  ],
  "冲突的块": [],
  "应用后的文本": [
    "header",
    "alpha",
    "beta",
    "gamma",
    "footer"
  ],
  "重复应用是否幂等": true,
  "结果是否与目标一致": false,
  "顺序冲突的错误码": "E_PATCH_CONFLICT"
};
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (JSON.stringify(got) === JSON.stringify(want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
