'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../../index.html'), 'utf8');
let writes = [], persisted, fail = false;
const ctx = {
  settings: {doseIn:18, doseOut:36}, prefs:{guideSrc:'profile',profileYields:{}},
  YIELD_MIN:10, YIELD_MAX:150, curProfileObj:null, chartReviewing:false,
  state:{shotRunning:false}, pouring:()=>false, brewLocked:()=>false,
  savePrefs(){ persisted=JSON.stringify(ctx.prefs); },
  syncRecipe(){}, chartBackToEspresso:()=>false, toast(){}, t:x=>x,
  refreshCarouselMark(){}, stopSync(){}, setTimeout:()=>1, clearTimeout(){},
  adjust(){}, api(m,p,b){ writes.push(b); return fail?Promise.reject():Promise.resolve({}); },
  brewProfileForMachine(){ return {...ctx.curProfileObj.profile,target_weight:ctx.settings.doseOut}; }
};
vm.createContext(ctx);
function load(start,end){ vm.runInContext(html.slice(html.indexOf(start),html.indexOf(end,html.indexOf(start))),ctx); }
load('function profileYieldKey(p){','function setDoseIn(v){');
load('var RECIPE_RETRY_MS=','function syncRecipe(){');
load('function selectProfile(p,keepGuideSrc){','// A profile that is not in the strip');
(async()=>{
  const a={id:'a',profile:{title:'Same title',target_weight:40}}, b={id:'b',profile:{title:'Same title',target_weight:100}};
  ctx.selectProfile(a);
  assert.equal(ctx.settings.doseOut,40);
  assert.equal(ctx.laneHolds(ctx.recipeLane,0),true,'old reads held during selection');
  await Promise.resolve();
  assert.equal(writes.at(-1).context.targetYield,40);
  assert.equal(writes.at(-1).profile.target_weight,40);
  ctx.settings.doseOut=75.1; ctx.rememberProfileYield();
  ctx.selectProfile(b); assert.equal(ctx.settings.doseOut,100);
  ctx.settings.doseOut=120; ctx.rememberProfileYield();
  ctx.selectProfile(a); assert.equal(ctx.settings.doseOut,75.1);
  assert.equal(a.profile.target_weight,40,'saved profile untouched');
  ctx.prefs=JSON.parse(persisted);
  ctx.selectProfile(b); assert.equal(ctx.settings.doseOut,120,'memory survives reload');
  ctx.selectProfile(a); assert.equal(ctx.settings.doseOut,75.1,'same titles do not collide');
  await Promise.resolve();
  assert.equal(ctx.laneUnsaved(ctx.recipeLane),false);
  fail=true; ctx.selectProfile(b); await Promise.resolve();
  assert.equal(ctx.laneUnsaved(ctx.recipeLane),true,'failed selection remains pending for retry');
  assert.equal(ctx.laneHolds(ctx.recipeLane,999),true);
  assert.ok(html.includes('if(w.profile&&!laneHolds(recipeLane,readSeq))'),'stale reads cannot replace selected profile');
  console.log('PASS: profile defaults, independent memory, restart persistence, outgoing targets, stale-read guards and failed-write retry.');
})().catch(e=>{console.error(e);process.exitCode=1;});
