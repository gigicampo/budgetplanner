/* Populate the authored Excel template without changing its formulas or charts. */
async function createAnalyticsWorkbook(budgetRows, expenseRows, incomeRows, settings) {
 const incomeData=[];
 incomeRows.forEach(r=>(r.deductions.length?r.deductions:[{item:'',amount:0}]).forEach(d=>incomeData.push([r.frequency,r.category,r.month,r.year,r.amount,d.item,d.item?(Number(d.amount)||0):''])));
 const categories=[...new Set([...budgetRows.map(r=>r.category),...expenseRows.map(r=>r.category),...incomeRows.map(r=>r.category)])];
 if(Math.max(budgetRows.length,expenseRows.length,incomeData.length)>1000||categories.length>30)throw new Error('The Analytics workbook supports 1,000 rows per data sheet and 30 categories. Export fewer records or extend the workbook template.');
 const response=await fetch('analytics-template.xlsx');if(!response.ok)throw new Error('The Analytics workbook template could not be loaded. Reopen the app online once.');
 const zip=await JSZip.loadAsync(await response.arrayBuffer()),ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
 const xml=parseBudgetWorkbookXml,serialize=doc=>new XMLSerializer().serializeToString(doc);
 const read=async path=>{const entry=zip.file(path);if(!entry)throw new Error('The Analytics template is incomplete ('+path+'). Please update all app files and reopen the app online.');return entry.async('string')};
 const wb=xml(await read('xl/workbook.xml')),rels=xml(await read('xl/_rels/workbook.xml.rels')),paths=resolveBudgetWorksheetPaths(wb,rels,zip);
 let calc=wb.getElementsByTagNameNS('*','calcPr')[0];if(!calc){calc=wb.createElementNS(ns,'calcPr');wb.documentElement.appendChild(calc)}calc.setAttribute('calcMode','auto');calc.setAttribute('fullCalcOnLoad','1');calc.setAttribute('forceFullCalc','1');zip.file('xl/workbook.xml',serialize(wb));
 const cellMaps=new WeakMap();
 function cell(doc,ref){let map=cellMaps.get(doc);if(!map){map=new Map([...doc.getElementsByTagNameNS('*','c')].map(c=>[c.getAttribute('r'),c]));cellMaps.set(doc,map)}let c=map.get(ref);if(!c){const n=ref.match(/\d+/)[0];let row=[...doc.getElementsByTagNameNS('*','row')].find(x=>x.getAttribute('r')===n);if(!row){row=doc.createElementNS(ns,'row');row.setAttribute('r',n);doc.getElementsByTagNameNS('*','sheetData')[0].appendChild(row)}c=doc.createElementNS(ns,'c');c.setAttribute('r',ref);row.appendChild(c);map.set(ref,c)}return c}
 function set(doc,ref,value,keepFormula=false){const c=cell(doc,ref),f=keepFormula?c.getElementsByTagNameNS('*','f')[0]?.cloneNode(true):null;c.replaceChildren();c.removeAttribute('t');if(f)c.appendChild(f);if(value===''||value==null)return;if(typeof value==='number'){const v=doc.createElementNS(ns,'v');v.textContent=String(value);c.appendChild(v)}else if(f){c.setAttribute('t','str');const v=doc.createElementNS(ns,'v');v.textContent=value;c.appendChild(v)}else{c.setAttribute('t','inlineStr');const is=doc.createElementNS(ns,'is'),t=doc.createElementNS(ns,'t');t.textContent=String(value);is.appendChild(t);c.appendChild(is)}}
 const serial=date=>(Date.parse(date+'T00:00:00Z')-Date.UTC(1899,11,30))/86400000;
 const data={MyBudget:budgetRows.map(r=>[r.frequency,r.category,r.item,r.month,r.year,r.amount]),MyExpenses:expenseRows.map(r=>[serial(r.date),r.year,r.paidFor,r.item,r.category,r.amount]),'My Income':incomeData};
 for(const [name,rows] of Object.entries(data)){const doc=xml(await zip.file(paths[name]).async('string'));for(const c of [...doc.getElementsByTagNameNS('*','c')]){const ref=c.getAttribute('r');if(Number(ref.match(/\d+/)[0])>1){if(name==='My Income'&&ref.startsWith('H')){set(doc,ref,'',true)}else{c.replaceChildren();c.removeAttribute('t')}}}rows.forEach((row,r)=>row.forEach((v,col)=>set(doc,String.fromCharCode(65+col)+(r+2),v)));if(name==='My Income'){const seen=new Set();rows.forEach((row,j)=>{const key=JSON.stringify(row.slice(1,4));const amount=seen.has(key)?0:row[4]-rows.filter(x=>JSON.stringify(x.slice(1,4))===key).reduce((sum,x)=>sum+x[6],0);seen.add(key);set(doc,'H'+(j+2),amount,true)})}zip.file(paths[name],serialize(doc));}
 const a=xml(await zip.file(paths.Analytics).async('string'));set(a,'C8',settings.name||'Friend');set(a,'F8',settings.currency);set(a,'I8',settings.year);set(a,'C9',settings.month||'All Months');set(a,'F9',settings.view);set(a,'B7',settings.quote);set(a,'B6',settings.greeting,true);
 const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
 function totals(month,category){const filter=r=>r.year===settings.year&&(!month||r.month===month)&&(!category||r.category===category);const bs=budgetRows.filter(filter),es=expenseRows.map(r=>({...r,month:months[Number(r.date.slice(5,7))-1]})).filter(filter),ins=incomeRows.filter(filter);const sum=(rows,k)=>rows.reduce((s,r)=>s+Number(r[k]||0),0),bv=sum(bs,'amount'),ev=sum(es,'amount'),iv=sum(ins,'netIncome');return [bv,ev,iv,Math.max(0,ev-bv),ev>bv?'Over budget':'Within budget']}
 const monthRows=months.map(m=>[m,...(settings.month&&m!==settings.month?[0,0,0,0,'Within budget']:totals(m))]);const catRows=Array.from({length:30},(_,j)=>categories[j]?[categories[j],...totals(settings.month,categories[j])]:['',0,0,0,0,'']);
 monthRows.forEach((r,j)=>r.forEach((v,k)=>set(a,String.fromCharCode(65+k)+(39+j),v,k>0)));catRows.forEach((r,j)=>r.forEach((v,k)=>set(a,String.fromCharCode(72+k)+(39+j),v,k>0)));
 const chartRows=settings.view==='By Month'?monthRows:catRows;for(let j=0;j<30;j++)for(let k=0;k<5;k++)set(a,String.fromCharCode(79+k)+(39+j),chartRows[j]?.[k]??(k===0?'':0),true);
 const [bv,ev,iv]=totals(settings.month);for(const [ref,v] of [['B13',bv],['E13',iv],['H13',ev],['K13',iv-ev]])set(a,ref,v,true);set(a,'B15',(ev>bv?'Over budget by ':'Budget remaining: ')+settings.currency+' '+Math.abs(bv-ev).toFixed(2),true);set(a,'B16','Amounts in '+settings.currency+'. Red Over Budget bars show the amount above the plan.',true);zip.file(paths.Analytics,serialize(a));
 const guide=xml(await zip.file(paths['Start Here']).async('string'));set(guide,'B7','This workbook contains your exported records. Edit the data sheets to keep planning independently.');zip.file(paths['Start Here'],serialize(guide));
 // Supply current chart caches as well as live formulas, including for previewers.
 for(const path of Object.keys(zip.files).filter(p=>/\/charts\/chart\d+\.xml$/.test(p))){const doc=xml(await zip.file(path).async('string')),cn='http://schemas.openxmlformats.org/drawingml/2006/chart';
  for(const ref of [...doc.getElementsByTagNameNS(cn,'strRef'),...doc.getElementsByTagNameNS(cn,'numRef')]){
   const f=ref.getElementsByTagNameNS(cn,'f')[0]?.textContent||'',match=f.match(/\$([O-S])\$39/);if(!match)continue;
   const col=match[1].charCodeAt(0)-79,isText=col===0;for(const old of [...ref.children].filter(n=>/Cache$/.test(n.localName)))old.remove();
   const cache=doc.createElementNS(cn,'c:'+(isText?'strCache':'numCache')),count=doc.createElementNS(cn,'c:ptCount');count.setAttribute('val',30);cache.appendChild(count);
   for(let j=0;j<30;j++){const pt=doc.createElementNS(cn,'c:pt'),v=doc.createElementNS(cn,'c:v');pt.setAttribute('idx',j);v.textContent=String(chartRows[j]?.[col]??(isText?'':0));pt.appendChild(v);cache.appendChild(pt)}ref.appendChild(cache);
  }zip.file(path,serialize(doc));}
 return zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',compression:'DEFLATE'});
}

function parseBudgetWorkbookXml(text){
 // ZIP XML parts can contain a UTF-8 BOM. Strip it before DOMParser sees the declaration.
 const doc=new DOMParser().parseFromString(String(text).replace(/^\uFEFF/,'').trimStart(),'application/xml');
 if(doc.getElementsByTagNameNS('*','parsererror').length)throw new Error('The workbook contains invalid XML. No financial records were changed. Please use a valid Budget File or reinstall the complete app package.');
 return doc;
}
function resolveBudgetWorksheetPaths(workbook,relationships,zip){
 const paths={},rels=[...relationships.getElementsByTagNameNS('*','Relationship')];
 for(const sheet of workbook.getElementsByTagNameNS('*','sheet')){
  const name=sheet.getAttribute('name'),id=sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||sheet.getAttribute('r:id')||[...sheet.attributes].find(a=>a.localName==='id')?.value;
  const relationship=rels.find(r=>r.getAttribute('Id')===id),target=relationship?.getAttribute('Target');
  if(!id||!target||relationship.getAttribute('TargetMode')==='External')throw new Error('The Analytics template has a missing worksheet link for '+(name||'an unnamed sheet')+'. Please update the complete app package; your saved records are unchanged.');
  const path=target.startsWith('/')?target.slice(1):target.startsWith('xl/')?target:'xl/'+target.replace(/^\.\//,'');
  if(!zip.file(path))throw new Error('The Analytics template is missing the '+name+' worksheet. Please update the complete app package.');
  paths[name]=path;
 }
 for(const name of ['Analytics','MyBudget','MyExpenses','My Income','Start Here'])if(!paths[name])throw new Error('The Analytics template is missing the '+name+' worksheet. Please update the complete app package.');
 return paths;
}
