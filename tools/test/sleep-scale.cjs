'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../../index.html'),'utf8');
function section(a,b){const start=html.indexOf(a); assert.ok(start>=0,a); const end=html.indexOf(b,start);assert.ok(end>start,b);return html.slice(start,end);}
function sleepContext(){
 let now=1000, next=0; const timers=new Map(), storage={}, calls=[], notices=[];
 const c={state:{machine:{state:'idle'},machineSeen:true},prefs:{sleepExit:true},_asleep:false,_fwRunning:false,
 Date:{now:()=>now},document:{hidden:false,addEventListener(){}},window:{__DECENT_HOST__:true,decentApp:{exitApp(){c.exits++;return true;}}},exits:0,
 setTimeout(fn,ms){timers.set(++next,{at:now+ms,fn});return next;},clearTimeout(id){timers.delete(id);},
 api(...args){calls.push(args);return c.respond(...args);},respond:()=>Promise.resolve(),
 lsGet:k=>storage[k]??null,lsSet:(k,v)=>{storage[k]=v;},fwHoldsAwake:()=>c._fwRunning,
 enterSleepLocalOnly(){c._asleep=true;c.shown++;},wakeLocalOnly(){c._asleep=false;},endSleepUI(){c._asleep=false;},shown:0,
 t:x=>x,toast:x=>notices.push(x),savePrefs(){},
 advance(ms){now+=ms;for(const [id,t] of [...timers])if(t.at<=now){timers.delete(id);t.fn();}},calls,notices};
 vm.createContext(c);vm.runInContext(section('// Sleep commands follow Streamline:','// The confirmed sleep screen'),c);
 vm.runInContext(section('function enterSleep(){','// Eight offsets'),c);return c;
}
async function sleepTests(){
 let c=sleepContext(),resolve;
 c.respond=()=>new Promise(r=>resolve=r);
 let pending=c.doSleep();assert.equal(c.calls.length,1);assert.equal(c._asleep,false,'no optimistic saver/dimming');
 c.syncSleepScreen('idle');assert.equal(c.shown,0);await c.doSleep();assert.equal(c.calls.length,1,'double press ignored');
 resolve();await pending;assert.equal(c.shown,0,'HTTP success alone does not confirm sleep');
 c.state.machine.state='sleeping';c.syncSleepScreen('sleeping');assert.equal(c.shown,1);
 c.respond=()=>Promise.resolve();await c.wakeFromSleep();assert.equal(c._asleep,false);
 c.syncSleepScreen('sleeping');assert.equal(c._asleep,false,'stale sleeping frame suppressed');
 c.advance(3001);assert.equal(c._asleep,true,'lost wake restores saver without further snapshots');
 await c.wakeFromSleep();c.state.machine.state='heating';c.syncSleepScreen('heating');c.advance(4000);assert.equal(c._asleep,false);
 c=sleepContext();c.respond=()=>Promise.reject(Error('offline'));await c.sleepHold();
 assert.equal(c.exits,0,'failed sleep cannot exit');assert.equal(c.shown,0);assert.equal(c.notices[0],'tSleepFailed');
 c=sleepContext();c.state.machine.state='sleeping';c._asleep=true;c.respond=()=>Promise.reject(Error('offline'));
 await c.wakeFromSleep();assert.equal(c._asleep,true,'failed wake restores saver immediately');
 c=sleepContext();c.prefs.sleepExit=false;await c.sleepHold();assert.equal(c.exits,0);
 c=sleepContext();c.window.__DECENT_HOST__=false;await c.sleepHold();assert.equal(c.exits,0);
 c=sleepContext();await c.sleepHold();assert.equal(c.exits,1);assert.ok(c.lsGet(c.SLEEP_EXIT_KEY));
 c.document.hidden=true;c.advance(4000);c.document.hidden=false;c.state.machine.state='sleeping';
 await c.handleSleepExitReturn();assert.equal(c.calls.at(-1)[1],'/api/v1/machine/state/idle');
 assert.equal(c.lsGet(c.SLEEP_EXIT_KEY),null);const n=c.calls.length;await c.handleSleepExitReturn();assert.equal(c.calls.length,n);
 c=sleepContext();c.lsSet(c.SLEEP_EXIT_KEY,1);c.state.machine.state='espresso';await c.handleSleepExitReturn();assert.equal(c.calls.length,0);
 c=sleepContext();c.lsSet(c.SLEEP_EXIT_KEY,1);c.state.machineSeen=false;await c.handleSleepExitReturn();assert.equal(c.calls.length,0,'reload waits for actual machine snapshot');
 c=sleepContext();await c.sleepHold();c.advance(3001);assert.equal(c.lsGet(c.SLEEP_EXIT_KEY),null,'host that did not leave clears marker');
 c=sleepContext();c._fwRunning=true;await c.doSleep();assert.equal(c.calls.length,0);
 // Real gesture handler with simulated pointer events and clock.
 c=sleepContext();vm.runInContext(section('function bindHold(','function bindActionLongPress'),c);
 const handlers={},el={classList:{add(){},remove(){}},addEventListener(k,fn){handlers[k]=fn;}};
 let taps=0,holds=0;c.bindHold(el,()=>taps++,()=>holds++,{duration:800,contextMenuHolds:false});
 handlers.pointerdown({button:0,clientX:0,clientY:0});c.advance(550);assert.equal(holds,0);
 handlers.contextmenu({preventDefault(){}});c.advance(250);assert.equal(holds,1);
 handlers.pointerup();handlers.click({preventDefault(){},stopPropagation(){}});assert.equal(taps,0);
 handlers.pointerdown({button:0,clientX:0,clientY:0});c.advance(100);handlers.pointerup();handlers.click({});assert.equal(taps,1);
}
function scaleContext(){
 let now=1000;const calls=[];
 const target={id:'bookoo-mini',type:'scale',state:'disconnected'};
 const c={prefs:{brewReconnect:true},gwSettings:{preferredScaleId:target.id},document:{hidden:false},_asleep:false,
 state:{connected:true,machine:{state:'idle'},scaleConnected:false,devices:[]},_dosingScanning:false,_connBusy:'',
 dosingId:()=>'',fwHoldsAwake:()=>false,connOpen:()=>false,Date:{now:()=>now},savePrefs(){},loadDevices(){},
 api(...args){calls.push(args);return c.respond(...args);},respond(method,url){
 if(url==='/api/v1/settings')return Promise.resolve({...c.gwSettings});
 if(url.includes('/scan?'))return Promise.resolve([target]);
 return Promise.resolve([]);},calls,advance(ms){now+=ms;}};
 vm.createContext(c);vm.runInContext(section('// Bounded, idle-only discovery','function setBrewScale(id){'),c);return c;
}
async function runScale(c){await c.reconnectBrewScale();c.advance(10001);await c.reconnectBrewScale();}
async function scaleTests(){
 let c=scaleContext();await runScale(c);assert.equal(c.calls.filter(x=>x[0]==='PUT').length,1);
 assert.equal(c.calls.at(-1)[2].deviceId,'bookoo-mini');assert.equal(c.calls.at(-1)[2].connectionRole,'primary');
 const n=c.calls.length;await c.reconnectBrewScale();assert.equal(c.calls.length,n,'retry rate limited');
 for(const alter of [c=>c._asleep=true,c=>c.document.hidden=true,c=>c.state.machine.state='espresso',c=>c.state.scaleConnected=true,c=>c.state.connected=false,c=>c._dosingScanning=true,c=>c._connBusy='manual',c=>c.state.deviceBusy=true,c=>c.gwSettings.preferredScaleId=null,c=>c.prefs.brewReconnect=false,c=>c.gwSettings.preferredScaleId='usb-hds:any',c=>c.dosingId=()=> 'bookoo-mini',c=>c.connOpen=()=>true]){
 c=scaleContext();alter(c);await runScale(c);assert.equal(c.calls.length,0,'unsafe/unwanted reconnect blocked');}
 c=scaleContext();const respond=c.respond;c.respond=(m,u)=>u.includes('/scan?')?Promise.resolve([{id:'other-scale',type:'scale'}]):respond(m,u);
 await runScale(c);assert.ok(!c.calls.some(x=>x[0]==='PUT'),'never connects a different scale');
 c=scaleContext();c.respond=(m,u)=>{if(u==='/api/v1/settings')return Promise.resolve(c.gwSettings);if(u.includes('/scan?')){c.state.machine.state='espresso';return Promise.resolve([{id:'bookoo-mini',type:'scale'}]);}return Promise.resolve([]);};
 await runScale(c);assert.ok(!c.calls.some(x=>x[0]==='PUT'),'shot starting during scan blocks connect');
 c=scaleContext();let scanResolve;const base=c.respond;
 c.respond=(m,u)=>u.includes('/scan?')?new Promise(r=>scanResolve=r):base(m,u);
 await c.reconnectBrewScale();c.advance(10001);const scanning=c.reconnectBrewScale();
 for(let i=0;i<8;i++)await Promise.resolve();assert.equal(typeof scanResolve,'function');
 const before=c.calls.length;await c.reconnectBrewScale();assert.equal(c.calls.length,before,'one discovery at a time');
 c._asleep=true;scanResolve([{id:'bookoo-mini',type:'scale'}]);await scanning;
 assert.ok(!c.calls.some(x=>x[0]==='PUT'),'sleep during scan prevents connect');
 c=scaleContext();c.respond=()=>Promise.reject(Error('offline'));await runScale(c);assert.equal(c._brewReconnectBusy,false);
 c=scaleContext();c.respond=(m,u)=>u==='/api/v1/settings'?Promise.resolve({preferredScaleId:'different'}):Promise.resolve([]);
 await runScale(c);assert.equal(c.calls.length,1,'honor preferences changed in another skin');
 c=scaleContext();c.respond=(m,u)=>u==='/api/v1/settings'?Promise.resolve(c.gwSettings):Promise.resolve([{id:'another',type:'scale',state:'connected',connectionRole:'primary'}]);
 await runScale(c);assert.ok(!c.calls.some(x=>x[1].includes('/scan?')),'live primary scale prevents scan');
}
(async()=>{await sleepTests();await scaleTests();console.log('PASS: confirmed sleep, wake grace/expiry/failure, duplicate presses, long-press/return/firmware guards, and preferred-scale discovery/retry/race safeguards.');})().catch(e=>{console.error(e);process.exitCode=1;});
