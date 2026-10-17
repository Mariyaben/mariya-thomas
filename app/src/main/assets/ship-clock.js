(function(root){
 const IST=330;
 function initial(){return {delta:-330,revision:0,id:'initial',by:'thomas',at:0}}
 function valid(r){return !!r&&Number.isInteger(r.delta)&&r.delta>=-1050&&r.delta<=510&&Number.isSafeInteger(r.revision)&&r.revision>=0&&typeof r.id==='string'&&r.id.length>0&&r.id.length<=80&&['mariya','thomas'].includes(r.by)&&Number.isFinite(r.at)&&r.at>=0}
 function compare(a,b){if(!valid(a))return -1;if(!valid(b))return 1;return a.revision-b.revision||a.id.localeCompare(b.id)}
 function next(current,delta,by,id,at){const record={delta,revision:current.revision+1,by,id,at};if(!valid(record))throw Error('Invalid ship clock');return record}
 function offset(r){return IST+r.delta}
 function describe(delta){const a=Math.abs(delta),parts=[Math.floor(a/60)?Math.floor(a/60)+'h':'',a%60?a%60+'m':''].filter(Boolean).join(' ');return delta===0?'Same as IST':parts+(delta<0?' behind IST':' ahead of IST')}
 const api={IST,initial,valid,compare,next,offset,describe};root.ShipClock=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
