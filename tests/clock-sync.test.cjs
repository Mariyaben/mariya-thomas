const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
globalThis.crypto=require('node:crypto').webcrypto;
const ShipClock=require('../app/src/main/assets/ship-clock.js');
const Clock=require('../app/src/main/assets/clock.js');
const ChatCrypto=require('../app/src/main/assets/chat-crypto.js');
const code=ChatCrypto.createCode(),sockets=new Set(),cache=[];
class Socket {
 constructor(){this.readyState=0;sockets.add(this);setTimeout(()=>{this.readyState=1;this.onopen?.();for(const message of cache)this.onmessage?.({data:JSON.stringify({event:'message',message})})},0)}
 close(){this.readyState=3;sockets.delete(this);this.onclose?.()}
}
function element(){return {value:'',hidden:true,textContent:'',style:{},classList:{add(){}},scrollHeight:0,scrollTop:0,clientHeight:0,replaceChildren(){},append(){},setAttribute(){},addEventListener(){},showModal(){},close(){}}}
function client(person,storage=new Map()){
 const elements=new Map(),listeners=new Map();const $=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)};
 const state={person,offset:0,shipClock:ShipClock.initial(),hour24:false};
 const context={console,crypto,ShipClock,Clock,ChatCrypto,state,$,setTimeout,clearTimeout,AbortController,
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
 document:{hidden:false,createElement:element,querySelectorAll:()=>[],querySelector:()=>element(),addEventListener:(n,f)=>listeners.set('document:'+n,f)},
 addEventListener:(n,f)=>listeners.set(n,f),WebSocket:Socket,
 fetch:async(url,{body})=>{cache.push(body);for(const socket of sockets)if(socket.readyState===1)setTimeout(()=>socket.onmessage?.({data:JSON.stringify({event:'message',message:body})}),0);return {ok:true}},
 persist:()=>{state.offset=ShipClock.offset(state.shipClock)},render(){},toast(){},shareText(){},fmt:()=>({time:'00:00',suffix:''}),date:()=>''};
 context.window=context;
 context.applyShipClock=(r)=>{if(ShipClock.compare(r,state.shipClock)<=0)return false;state.shipClock=r;context.persist();return true};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../app/src/main/assets/chat.js'),'utf8'),context);
 return {context,state,storage,async pair(){await vm.runInContext('useCode('+JSON.stringify(code)+')',context)},change(delta){const r=ShipClock.next(state.shipClock,delta,person,crypto.randomUUID(),Date.now());context.applyShipClock(r);listeners.get('ship-clock-changed')({detail:r})},offline(){context.document.hidden=true;listeners.get('document:visibilitychange')()},online(){context.document.hidden=false;listeners.get('document:visibilitychange')()}};
}
async function until(condition){for(let i=0;i<300;i++){if(condition())return;await new Promise(r=>setTimeout(r,10))}throw Error('Clock sync timed out')}
(async()=>{
 const mariya=client('mariya'),thomas=client('thomas');
 try{
  await mariya.pair();await thomas.pair();await until(()=>sockets.size===2&&[...sockets].every(s=>s.readyState===1));
  assert.equal(mariya.state.shipClock.delta,-330);assert.equal(thomas.state.shipClock.delta,-330);
  thomas.change(-270);await until(()=>mariya.state.shipClock.delta===-270);
  assert.equal(mariya.state.offset,60);assert.equal(ShipClock.IST,330);
  const old=mariya.state.shipClock;mariya.change(-330);await until(()=>thomas.state.shipClock.delta===-330);
  await vm.runInContext('receive('+JSON.stringify(await ChatCrypto.encrypt(await ChatCrypto.open(code),{id:crypto.randomUUID(),type:'clock',sender:'thomas',at:Date.now(),offset:60,clock:old}))+')',mariya.context);
  assert.equal(mariya.state.shipClock.delta,-330,'stale replay must not override a correction');
  mariya.offline();thomas.change(-210);await until(()=>vm.runInContext('chat.outbox.length',thomas.context)===0);
  cache.length=0; // Simulate a relay whose retention window expired.
  mariya.online();await until(()=>mariya.state.shipClock.delta===-210);
  const stored=JSON.parse(mariya.storage.get('mt-chat-v1'));assert.equal(stored.shipClock.delta,-210);
  assert.ok(cache.every(body=>!body.includes('"delta"')),'clock data must be encrypted on the wire');
  console.log('Two-client clock sync passed: both directions, fixed IST, stale replay rejection, reconnect after expired cache, persisted snapshot, encrypted transport.');
 }finally{mariya.offline();thomas.offline()}
})().catch(e=>{console.error(e);process.exitCode=1});
