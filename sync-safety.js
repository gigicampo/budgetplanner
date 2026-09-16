/* Compare saved records with their last shared copy; never silently pick a conflict. */
(function(root){
 const tidy=v=>String(v??'').trim().toLowerCase();
 const keys={budgetRows:r=>[r.category,r.item,r.month,r.year].map(tidy).join('|'),expenses:r=>[r.date,r.year,r.paidFor,r.item,r.category,r.amount].map(tidy).join('|'),incomeRows:r=>[r.category,r.month,r.year].map(tidy).join('|')};
 const canonical=v=>v===undefined?'missing':JSON.stringify(v,(_,value)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(k=>[k,value[k]])):value);
 function merge(base,local,remote){
  const result={},conflicts=[];
  for(const [type,key] of Object.entries(keys)){
   const maps=[base,local,remote].map(data=>new Map((data?.[type]||[]).map(r=>[key(r),r]))),[b,l,r]=maps;result[type]=[];
   for(const id of new Set([...b.keys(),...l.keys(),...r.keys()])){
    const bv=b.get(id),lv=l.get(id),rv=r.get(id),bs=canonical(bv),ls=canonical(lv),rs=canonical(rv);let chosen;
    if(ls===rs)chosen=lv;
    else if(base&&ls===bs)chosen=rv;
    else if(base&&rs===bs)chosen=lv;
    else if(!base&&(!l.has(id)||!r.has(id)))chosen=lv||rv;
    else{conflicts.push({type,key:id});continue}
    if(chosen!==undefined)result[type].push(chosen);
   }
  }
  if(conflicts.length){const error=new Error('Sync paused: '+conflicts.length+' record(s) changed in both copies. Your saved local data and the Drive file were kept. Export the local copy, then review the Drive workbook with Import before reconnecting.');error.conflicts=conflicts;throw error}
  return result;
 }
 root.BudgetSync={merge,canonical};
})(typeof window==='undefined'?globalThis:window);
