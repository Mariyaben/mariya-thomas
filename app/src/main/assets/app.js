const $=id=>document.getElementById(id);
const initialPerson=new URLSearchParams(location.search).get('person')==='thomas'||/iPhone|iPad|iPod/.test(navigator.userAgent)?'thomas':'mariya';
const defaults={offset:0,person:initialPerson,hour24:false,logs:[],notes:[]};
let state;try{state={...defaults,...JSON.parse(localStorage.getItem('between-us-v1')||'{}')}}catch{state={...defaults}}
if(!ShipClock.valid(state.shipClock))state.shipClock=ShipClock.initial();
state.offset=ShipClock.offset(state.shipClock);
if(!['mariya','thomas'].includes(state.person))state.person='mariya';
if(!Array.isArray(state.logs))state.logs=[];if(!Array.isArray(state.notes))state.notes=[];
let pending=null,toastTimer;
function toast(t){$('toast').textContent=t;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').textContent='',4000)}
function persist(){state.offset=ShipClock.offset(state.shipClock);try{localStorage.setItem('between-us-v1',JSON.stringify(state))}catch{toast('Storage unavailable. Changes will last only while this page is open.')}if(window.Android)Android.updateClock(state.offset,state.person)}
function offsets(){const ship=ShipClock.offset(state.shipClock);return state.person==='mariya'?{mine:ShipClock.IST,theirs:ship,name:'Thomas'}:{mine:ship,theirs:ShipClock.IST,name:'Mariya'}}
function fmt(minutes){const h=Math.floor(minutes/60),m=minutes%60;return {time:String(state.hour24?h:(h%12||12)).padStart(2,'0')+':'+String(m).padStart(2,'0'),suffix:state.hour24?'':h<12?'AM':'PM'}}
function timeHTML(now,offset){const p=Clock.parts(now,offset),f=fmt(p.hour*60+p.minute);return f.time+'<small>'+f.suffix+'</small>'}
function date(now,offset){return Clock.at(now,offset).toLocaleDateString('en-IN',{timeZone:'UTC',weekday:'long',month:'short',day:'numeric'})}
function render(full=true){const now=Date.now(),o=offsets(),isM=state.person==='mariya';
 document.body.dataset.person=state.person;
 $('greeting').innerHTML='Hi, '+(isM?'Mariya':'Thomas')+' <span class="greeting-heart">♡</span>';
 document.querySelector('.intro .eyebrow').textContent=isM?'MARIYA’S SPACE':'THOMAS’S SPACE';
 $('intro-text').textContent=o.name+'’s time, right here.';
 document.querySelector('meta[name="theme-color"]').content=isM?'#fff5f9':'#f6f1ff';
 document.querySelectorAll('[data-person]').forEach(b=>b.classList.toggle('active',b.dataset.person===state.person));
 $('partner-label').textContent=o.name.toUpperCase()+"’S TIME";
 $('location-tag').textContent=isM?'⚓ At sea':'♡ IST · India';
 $('partner-clock').innerHTML=timeHTML(now,o.theirs);$('local-clock').innerHTML=timeHTML(now,o.mine);
 const myDay=Clock.parts(now,o.mine).day,theirDay=Clock.parts(now,o.theirs).day;
 $('partner-date').textContent=date(now,o.theirs)+(myDay===theirDay?'':theirDay<myDay?' · a day behind you':' · a day ahead of you');
 $('local-date').textContent=date(now,o.mine);$('local-label').textContent=isM?'YOUR TIME · IST (UTC +05:30)':'YOUR TIME · RELATIVE TO IST';$('local-icon').textContent=isM?'☀':'⚓';
 const diff=o.theirs-o.mine,abs=Math.abs(diff),gap=[Math.floor(abs/60)?Math.floor(abs/60)+'h':'',abs%60?abs%60+'m':''].filter(Boolean).join(' ');
 $('difference').textContent=diff===0?'Same time for both of you':o.name+' is '+gap+(diff<0?' behind you':' ahead of you');
 $('offset-label').textContent=ShipClock.describe(state.shipClock.delta);$('ship-sync-status').textContent=window.shipSyncStatus||'Pair your phones in Chat to sync clock changes.';$('planner-owner').textContent=isM?'your India':'your ship';$('planner-partner').textContent='FOR '+o.name.toUpperCase();
 $('hour24').checked=!!state.hour24;renderPlanner();if(full){renderNotes();renderLogs()}
}
function renderPlanner(){const o=offsets(),[h,m]=$('call-time').value.split(':').map(Number);if(!Number.isFinite(h)||!Number.isFinite(m))return;
 const c=Clock.convert(h*60+m,o.mine,o.theirs),f=fmt(c.minutes);$('call-result').textContent=f.time+' '+f.suffix;
 $('call-hint').textContent=(c.day===0?'Same day':c.day<0?'Previous day':'Next day')+' for '+o.name+' · '+(c.minutes>=480&&c.minutes<1320?'within waking hours':'outside usual waking hours');
 $('timeline').replaceChildren();for(let i=0;i<24;i++){const t=Clock.convert(i*60,o.mine,o.theirs).minutes;const el=document.createElement('i');if(i>=8&&i<22&&t>=480&&t<1320)el.className='good';el.title=String(i).padStart(2,'0')+':00 on your clock';$('timeline').append(el)}
}
function noteNode(note){const el=document.createElement('div');el.className='saved-note';const body=document.createElement('div');body.textContent=note.text;el.append(body);const caption=document.createElement('div');caption.className='tiny';caption.textContent='From '+note.person+' · '+new Date(note.at).toLocaleDateString('en-IN');el.append(caption);const share=document.createElement('button');share.className='text-button';share.textContent='Share note ↗';share.style.marginTop='10px';share.onclick=()=>shareText(note.text+'\n\nWith love, '+note.person+' ♡');el.append(share);return el}
function renderNotes(){const latest=$('latest-note');latest.replaceChildren();if(state.notes.length)latest.append(noteNode(state.notes[0]));const all=$('notes-list');all.replaceChildren();if(!state.notes.length)all.textContent='No saved notes yet.';state.notes.forEach(n=>all.append(noteNode(n)))}
function renderLogs(){const list=$('log-list');list.replaceChildren();if(!state.logs.length)list.textContent='Our starting point: Thomas is 5h 30m behind India. No ship changes recorded yet.';state.logs.forEach(log=>{const row=document.createElement('div');row.className='log-row';const left=document.createElement('div'),strong=document.createElement('strong'),sub=document.createElement('div');strong.textContent=log.label;sub.className='tiny';sub.textContent=new Date(log.at).toLocaleString('en-IN');left.append(strong,sub);const right=document.createElement('div');right.className='tiny';right.textContent=Clock.zone(log.offset);row.append(left,right);list.append(row)})}
function applyShipClock(record,label){if(!ShipClock.valid(record)||ShipClock.compare(record,state.shipClock)<=0)return false;state.shipClock=record;state.logs.unshift({offset:ShipClock.offset(record),label,at:Date.now()});persist();render();return true}
function confirmChange(delta,label){if(!Number.isInteger(delta)||delta < -1050||delta>510){toast('That difference is outside the supported ship clock range.');return}$('confirm-title').textContent=label;$('confirm-body').textContent='Mariya stays fixed to IST. Thomas will be '+ShipClock.describe(delta).toLowerCase()+'. Paired phones receive this change when open and connected.';pending={delta,label};$('confirm').showModal()}
$('accept').onclick=()=>{if(pending){const record=ShipClock.next(state.shipClock,pending.delta,state.person,crypto.randomUUID(),Date.now());applyShipClock(record,pending.label);window.dispatchEvent(new CustomEvent('ship-clock-changed',{detail:record}));toast(window.shipClockPaired?'Clock updated. Syncing with your paired phone…':'Clock saved. Pair your phones in Chat to sync.')}pending=null;$('confirm').close()};$('cancel').onclick=()=>{pending=null;$('confirm').close()};
$('plus').onclick=()=>confirmChange(state.shipClock.delta+60,'Ship clock advanced by 1 hour');$('minus').onclick=()=>confirmChange(state.shipClock.delta-60,'Ship clock moved back by 1 hour');
$('set-difference').onclick=()=>{const d=state.shipClock.delta;$('difference-hours').value=Math.floor(Math.abs(d)/60);$('difference-minutes').value=Math.abs(d)%60;$('difference-direction').value=d>0?'ahead':'behind';$('difference-dialog').showModal()};
$('cancel-difference').onclick=()=>$('difference-dialog').close();
$('save-difference').onclick=()=>{const hours=Number($('difference-hours').value),minutes=Number($('difference-minutes').value);if(!Number.isInteger(hours)||hours<0||hours>17||!Number.isInteger(minutes)||minutes<0||minutes>59){toast('Enter valid hours and minutes.');return}const delta=(hours*60+minutes)*($('difference-direction').value==='behind'?-1:1);if(delta < -1050||delta>510){toast('That difference is outside the supported ship clock range.');return}$('difference-dialog').close();confirmChange(delta,'Set Thomas’s difference from IST')};
document.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{state.person=b.dataset.person;persist();render()});
function page(name){document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==name);document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>page(b.dataset.page));$('view-log').onclick=()=>page('journal');
$('call-time').oninput=renderPlanner;$('hour24').onchange=()=>{state.hour24=$('hour24').checked;persist();render()};
$('save-note').onclick=()=>{const text=$('message').value.trim();if(!text){toast('Write a note first.');return}state.notes.unshift({text,person:state.person==='mariya'?'Mariya':'Thomas',at:Date.now()});persist();$('message').value='';renderNotes();toast('Note saved on this phone.')};
async function shareText(text){if(window.Android){Android.share(text);return}try{if(navigator.share)await navigator.share({text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast('Copied. Paste it into a message ♡')}else{window.prompt('Copy this to share',text)}}catch(e){if(e.name!=='AbortError')toast('Sharing unavailable. Please copy the text.')}}
$('share-clock').onclick=()=>shareText('Thomas’s ship clock\nBU1:'+state.offset+':'+Date.now()+'\nPaste the BU1 code into Settings to match Thomas’s ship time.');
$('import-clock').onclick=()=>{const match=$('clock-code').value.match(/(?:^|\s)BU1:(-?\d+):(\d+)(?=\s|$)/);if(!match){toast('Paste a complete clock code.');return}const offset=Number(match[1]),stamp=Number(match[2]);if(!Number.isInteger(offset)||offset < -720||offset>840||!Number.isFinite(stamp)||stamp<=0||stamp>Date.now()+86400000){toast('That clock code is invalid.');return}confirmChange(offset-ShipClock.IST,'Match shared ship clock · '+new Date(stamp).toLocaleDateString('en-IN'))};
function pin(){if(window.Android)Android.pinWidget();else toast('The home-screen banner is available in the Android app.')} $('pin').onclick=pin;$('pin-settings').onclick=pin;
persist();render();setInterval(()=>render(false),1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render(false)});
