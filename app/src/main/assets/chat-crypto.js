(function(root){
 const encoder=new TextEncoder(),decoder=new TextDecoder();
 function encode(bytes){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
 function decode(s){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))}
 function createCode(){return 'MT1-'+encode(crypto.getRandomValues(new Uint8Array(32)))}
 async function open(code){if(!/^MT1-[A-Za-z0-9_-]{43}$/.test(code))throw Error('Invalid pairing code');const raw=decode(code.slice(4));if(raw.length!==32||encode(raw)!==code.slice(4))throw Error('Invalid pairing code');const hash=await crypto.subtle.digest('SHA-256',encoder.encode('mariya-thomas-topic-v1:'+code));const topic='mt-'+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('').slice(0,48);const key=await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);return {topic,key}}
 async function encrypt(room,event){const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(room.topic)},room.key,encoder.encode(JSON.stringify(event)));return JSON.stringify({v:1,iv:encode(iv),data:encode(new Uint8Array(encrypted))})}
 async function decrypt(room,body){const wire=JSON.parse(body);if(wire.v!==1||typeof wire.iv!=='string'||typeof wire.data!=='string'||wire.data.length>3800)throw Error('Invalid message');const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(wire.iv),additionalData:encoder.encode(room.topic)},room.key,decode(wire.data));return JSON.parse(decoder.decode(clear))}
 root.ChatCrypto={createCode,open,encrypt,decrypt};if(typeof module!=='undefined')module.exports=root.ChatCrypto;
})(typeof window!=='undefined'?window:globalThis);
