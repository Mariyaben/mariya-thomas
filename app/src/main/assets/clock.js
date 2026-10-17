(function(root){
 const INDIA=330;
 function at(now,offset){return new Date(now+offset*60000)}
 function parts(now,offset){const d=at(now,offset);return {hour:d.getUTCHours(),minute:d.getUTCMinutes(),day:d.toISOString().slice(0,10)}}
 function convert(minutes,from,to){const raw=minutes+to-from;return {minutes:((raw%1440)+1440)%1440,day:Math.floor(raw/1440)}}
 function zone(offset){return 'UTC '+(offset<0?'−':'+')+String(Math.floor(Math.abs(offset)/60)).padStart(2,'0')+':'+String(Math.abs(offset)%60).padStart(2,'0')}
 const api={INDIA,at,parts,convert,zone};root.Clock=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
