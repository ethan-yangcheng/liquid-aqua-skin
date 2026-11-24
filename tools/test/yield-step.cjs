// Run without a gateway: node tools/test/yield-step.cjs
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../../index.html'), 'utf8');
let rendered = 0, pushed = [];
const ctx = {
  settings: { doseIn: 18, doseOut: 36 },
  recipeRatio() { return ctx.settings.doseOut / ctx.settings.doseIn; },
  syncRecipe() { rendered++; },
  pushRecipe() { pushed.push({ ...ctx.settings }); },
  closeModal() {},
  KP: { field: 'doseOut', str: '74.6' },
  YIELD_MIN: 10,
  YIELD_MAX: 150,
  KP_CFG: { doseOut: { min: 10, max: 150 } }
};
vm.createContext(ctx);
vm.runInContext(html.slice(html.indexOf('function setDoseIn(v){'), html.indexOf('// A DE1 profile has no single brew temperature:')), ctx);
vm.runInContext(html.slice(html.indexOf('function kpConfirm(){'), html.indexOf('// ── Preferences & settings')), ctx);
const cases = [
  [74.6, 0.5, 75], [75.1, -0.5, 75], [74.6, -0.5, 74.5],
  [75.1, 0.5, 75.5], [75, 0.5, 75.5], [75, -0.5, 74.5],
  [74.5, 0.5, 75], [75.5, -0.5, 75],
  [74.99, 0.5, 75], [75.01, -0.5, 75],
  [75.00000000000001, -0.5, 74.5], [74.99999999999999, 0.5, 75.5],
  [10, -0.5, 10], [150, 0.5, 150], [149.9, 0.5, 150], [10.1, -0.5, 10]
];
for (const [start, delta, want] of cases) {
  ctx.settings.doseOut = start;
  const before = rendered;
  ctx.adjust('doseOut', delta);
  assert.equal(ctx.settings.doseOut, want, `${start} ${delta > 0 ? '+' : '-'} button`);
  assert.equal(rendered, before + 1, 'render updated value');
  assert.equal(pushed.at(-1).doseOut, want, 'push updated target');
  assert.equal(ctx.settings.doseIn, 18, 'yield buttons preserve dose');
}
// Sweep all one-decimal values: direction and grid alignment hold everywhere.
for (let tenth = 100; tenth <= 1500; tenth++) {
  for (const delta of [-0.5, 0.5]) {
    const start = tenth / 10;
    ctx.settings.doseOut = start;
    ctx.adjust('doseOut', delta);
    const end = ctx.settings.doseOut;
    assert.ok(end >= 10 && end <= 150);
    assert.ok(Number.isInteger(end * 2));
    if (start > 10 && start < 150) assert.ok((end - start) * delta > 0);
    assert.ok(Math.abs(end - start) <= 0.500000001);
  }
}
// Direct entry keeps fine precision, and the first button press snaps it.
ctx.KP.str = '74.6'; ctx.kpConfirm();
assert.equal(ctx.settings.doseOut, 74.6);
ctx.adjust('doseOut', 0.5);
assert.equal(ctx.settings.doseOut, 75);
ctx.KP.str = '75'; ctx.kpConfirm();
assert.equal(ctx.settings.doseOut, 75);
ctx.KP.str = '200'; ctx.kpConfirm();
assert.equal(ctx.settings.doseOut, 150, 'keypad clamps to the long-shot ceiling');
ctx.settings.doseOut = 149.6;
ctx.adjust('doseOut', 0.5);
assert.equal(ctx.settings.doseOut, 150, 'button reaches the long-shot ceiling');
// Dose changes still preserve the ratio, rather than snapping derived yield.
ctx.settings = { doseIn: 18, doseOut: 36 };
ctx.adjust('doseIn', 0.1);
assert.equal(ctx.settings.doseIn, 18.1);
assert.equal(ctx.settings.doseOut, 36.2);
// Both main screen and workflow continue to use the tested shared function.
assert.ok(html.includes('onclick="adjust(\'doseOut\',0.5)"'));
assert.ok(html.includes("'adjust(\\'doseOut\\',0.5);renderWf()'"));
console.log('PASS: 16 edge cases, 2,802 direction/grid checks, target propagation, keypad precision, dose/ratio behavior and shared controls.');
