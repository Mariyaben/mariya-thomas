const assert=require('node:assert/strict');
globalThis.crypto=require('node:crypto').webcrypto;
const C=require('../app/src/main/assets/chat-crypto.js');
(async()=>{
 const code=C.createCode(),a=await C.open(code),b=await C.open(code),other=await C.open(C.createCode());
 assert.equal(a.topic,b.topic);assert.notEqual(a.topic,other.topic);assert.ok(!a.topic.includes(code.slice(4)));
 const event={id:crypto.randomUUID(),type:'text',sender:'mariya',at:Date.now(),offset:0,text:'Synthetic relay test ♡ മലയാളം'};
 const wire=await C.encrypt(a,event);
 assert.ok(!wire.includes(event.text));assert.deepEqual(await C.decrypt(b,wire),event);
 assert.notEqual(wire,await C.encrypt(a,event));
 await assert.rejects(C.decrypt(other,wire));await assert.rejects(C.open('MT1-short'));
 const tampered=JSON.parse(wire);tampered.data=(tampered.data[0]==='A'?'B':'A')+tampered.data.slice(1);await assert.rejects(C.decrypt(b,JSON.stringify(tampered)));
 assert.ok(new TextEncoder().encode(await C.encrypt(a,{...event,text:'🌸'.repeat(250)})).length<4096);
 console.log('Chat encryption passed: pairing, unique nonces, Unicode, wrong-key rejection, tamper detection, payload size.');
 if(process.argv.includes('--live')){
  const sent=await fetch('https://ntfy.sh/'+a.topic,{method:'POST',body:wire,signal:AbortSignal.timeout(20000)});assert.equal(sent.status,200,'relay publish');
  const received=await fetch('https://ntfy.sh/'+a.topic+'/json?poll=1&since=all',{signal:AbortSignal.timeout(20000)});assert.equal(received.status,200,'relay retrieval');
  const events=(await received.text()).trim().split('\n').filter(Boolean).map(s=>JSON.parse(s)).filter(e=>e.event==='message');
  assert.ok(events.length>0);const decoded=await C.decrypt(b,events.find(e=>e.message===wire).message);assert.deepEqual(decoded,event);
  console.log('Live hosted relay passed: encrypted publish, replay, decryption from independently opened pairing code. No real user messages sent.');
 }
})().catch(e=>{console.error(e);process.exitCode=1});
