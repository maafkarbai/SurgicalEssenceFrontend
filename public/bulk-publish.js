(() => {
 'use strict';
 const toolbar=document.getElementById('bulk-toolbar');if(!toolbar)return;
 const $=id=>document.getElementById(id),pageBox=$('select-page'),form=$('product-filters');
 let rows=[...document.querySelectorAll('[data-product-select]')];
 const initialFilters=Object.fromEntries(['q','category','status'].map(key=>[key,form.elements[key].value]));
 let total=Number(toolbar.dataset.total);
 const csrf=document.querySelector('meta[name=csrf-token]').content;
 let all=false,busy=false,processing=false,job=null,preview=null,resultPage=1,issuesOnly=false;
 const dialog=$('bulk-confirm-dialog');toolbar.hidden=false;
 function error(message){$('bulk-error').textContent=message;$('bulk-error').hidden=!message;}
 async function api(path,body){
  const response=await fetch('/admin/products/bulk-publish'+path,{method:body===undefined?'GET':'POST',headers:{'Accept':'application/json',...(body===undefined?{}:{'Content-Type':'application/json','x-csrf-token':csrf})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const data=await response.json().catch(()=>({error:'Your session may have expired. Reload the page and sign in again.'}));
  if(!response.ok||response.redirected)throw new Error(data.error||'Publishing is unavailable. Reload the page and try again.');return data;
 }
 function selection(){return rows.filter(r=>r.checked).map(r=>({id:r.dataset.productId,revision:Number(r.dataset.revision)}));}
 function drawSelection(){
  const selected=rows.filter(r=>r.checked).length;
  $('bulk-selected-count').textContent=all?`${total} selected across all pages`:`${selected} selected`;
  pageBox.checked=rows.length>0&&selected===rows.length;pageBox.indeterminate=selected>0&&selected<rows.length;
  pageBox.disabled=busy||!rows.length;rows.forEach(r=>{r.disabled=busy;});
  $('bulk-clear').disabled=busy||!selected;$('bulk-publish').disabled=busy||!selected||Boolean(job&&job.status==='running');
  $('bulk-select-all').hidden=all||!rows.length||selected!==rows.length||total<=rows.length;$('bulk-select-all').disabled=busy;
 }
 function resetSelection(){all=false;rows.forEach(r=>{r.checked=false;});drawSelection();}
 function bindRows(){rows.forEach(row=>row.addEventListener('change',()=>{all=false;drawSelection();}));}
 bindRows();
 pageBox.addEventListener('change',()=>{all=false;rows.forEach(r=>{r.checked=pageBox.checked;});drawSelection();});
 $('bulk-select-all').addEventListener('click',()=>{all=true;drawSelection();});$('bulk-clear').addEventListener('click',resetSelection);
 form.addEventListener('input',resetSelection);form.addEventListener('change',resetSelection);
 form.addEventListener('submit',event=>{if(processing){event.preventDefault();error('Pause publishing before changing filters.');}});
 function refreshUrl(){const url=new URL(location.href);if(job?.status==='running')url.searchParams.set('publishJob',job.id);else url.searchParams.delete('publishJob');return url.pathname+url.search;}
 function showPreview(data){
  preview=data;
  $('bulk-confirm-summary').textContent=`${data.total} products selected. ${data.eligible} eligible draft products will be published. ${data.total-data.eligible} other selected products will be checked and reported as skipped or failed.`;
  $('bulk-confirm-error').hidden=true;$('bulk-confirm').disabled=false;$('bulk-cancel-confirm').disabled=false;
  dialog.showModal();$('bulk-cancel-confirm').focus();
 }
 function drawJob(data){
  job=data;$('bulk-job').hidden=false;$('bulk-job-status').textContent=data.status==='complete'?'Complete':processing?'Publishing…':'Paused';
  $('bulk-progress').max=Math.max(1,data.total);$('bulk-progress').value=data.processed;
  $('bulk-job-summary').textContent=`${data.processed} of ${data.total} processed · ${data.published} published · ${data.skipped} skipped · ${data.failed} failed`;
  $('bulk-pause').hidden=!processing||data.status==='complete';$('bulk-resume').hidden=processing||data.status!=='running';
  $('bulk-refresh').hidden=processing;$('bulk-refresh').href=refreshUrl();
  $('bulk-results').replaceChildren(...data.items.map(item=>{const li=document.createElement('li');const name=document.createElement('strong');name.textContent=`${item.sku||'Unavailable product'} — ${item.name}`;li.append(name,document.createTextNode(`: ${item.status}${item.reason?' — '+item.reason:''}`));return li;}));
  resultPage=data.page;$('bulk-results-page').textContent=`Page ${data.page} of ${data.pages}`;
  $('bulk-results-prev').disabled=processing||data.page<=1;$('bulk-results-next').disabled=processing||data.page>=data.pages;$('bulk-issues-only').disabled=processing;
  drawSelection();
 }
 async function loadResults(){if(!job)return;try{drawJob(await api(`/${encodeURIComponent(job.id)}?page=${resultPage}${issuesOnly?'&issues=1':''}`));}catch(e){error(e.message);}}
 async function refreshTable(){
  const response=await fetch(refreshUrl(),{headers:{Accept:'text/html'}});
  if(!response.ok||response.redirected)throw new Error('Publishing finished. Reload the products page to refresh the table.');
  const fresh=new DOMParser().parseFromString(await response.text(),'text/html');
  const body=fresh.querySelector('table[aria-label="Products"] tbody'),freshToolbar=fresh.getElementById('bulk-toolbar');
  if(!body||!freshToolbar)throw new Error('Publishing finished. Reload the products page to refresh the table.');
  document.querySelector('table[aria-label="Products"] tbody').replaceWith(body);
  document.querySelector('.pagination').replaceWith(fresh.querySelector('.pagination'));
  document.querySelector('.toolbar > p').textContent=fresh.querySelector('.toolbar > p').textContent;
  $('bulk-active-jobs').replaceWith(fresh.getElementById('bulk-active-jobs'));
  total=Number(freshToolbar.dataset.total);toolbar.dataset.total=String(total);
  $('bulk-select-all').textContent=`Select all ${total} products matching these filters`;
  rows=[...document.querySelectorAll('[data-product-select]')];bindRows();resetSelection();
 }
 $('bulk-results-prev').addEventListener('click',()=>{resultPage--;loadResults();});$('bulk-results-next').addEventListener('click',()=>{resultPage++;loadResults();});
 $('bulk-issues-only').addEventListener('change',()=>{issuesOnly=$('bulk-issues-only').checked;resultPage=1;loadResults();});
 async function run(){
  if(busy||processing||!job||job.status!=='running')return;processing=true;busy=true;error('');$('bulk-pause').disabled=false;drawJob(job);
  try{
   while(processing&&job.status==='running'){
    const next=await api(`/${encodeURIComponent(job.id)}/advance`,{});
    if(next.status==='complete')job=next;else drawJob(next);
   }
   if(job.status==='complete')await refreshTable();
  }
  catch(e){error(e.message);}
  finally{processing=false;busy=false;if(job)drawJob(job);}
 }
 $('bulk-resume').addEventListener('click',run);
 $('bulk-pause').addEventListener('click',()=>{processing=false;$('bulk-pause').disabled=true;});
 window.addEventListener('beforeunload',event=>{if(processing){event.preventDefault();event.returnValue='';}});
 async function cancelPreview(){
  if(busy)return;const previous=preview;preview=null;dialog.close();
  if(previous)try{await api(`/${encodeURIComponent(previous.id)}/cancel`,{});const url=new URL(location.href);if(url.searchParams.get('publishJob')===previous.id){url.searchParams.delete('publishJob');history.replaceState(null,'',url);}}catch(e){error(e.message);}
  drawSelection();$('bulk-publish').focus();
 }
 $('bulk-cancel-confirm').addEventListener('click',cancelPreview);dialog.addEventListener('cancel',event=>{event.preventDefault();cancelPreview();});
 $('bulk-publish').addEventListener('click',async()=>{
  if(busy)return;
  if(Object.keys(initialFilters).some(key=>form.elements[key].value!==initialFilters[key])){error('Apply your changed filters before selecting products.');return;}
  busy=true;error('');drawSelection();
  try{
   showPreview(await api('/prepare',{mode:all?'all':'selected',selection:all?undefined:selection(),filters:initialFilters}));
  }catch(e){error(e.message);}finally{busy=false;drawSelection();}
 });
 $('bulk-confirm').addEventListener('click',async()=>{
  if(busy||!preview)return;busy=true;$('bulk-confirm').disabled=true;$('bulk-cancel-confirm').disabled=true;
  try{
   const url=new URL(location.href);url.searchParams.set('publishJob',preview.id);history.replaceState(null,'',url);
   job=await api(`/${encodeURIComponent(preview.id)}/confirm`,{});preview=null;
   dialog.close();resetSelection();busy=false;drawJob(job);$('bulk-job-title').tabIndex=-1;$('bulk-job-title').focus();await run();
  }catch(e){
   // A lost response may follow a successful confirmation. Recover its state
   // without repeating publication or losing the resumable job.
   let recovered;try{if(preview)recovered=await api('/'+encodeURIComponent(preview.id));}catch{}
   if(recovered&&['running','complete'].includes(recovered.status)){preview=null;dialog.close();drawJob(recovered);error('Confirmation was saved. Check progress and resume publishing if needed.');}
   else{$('bulk-confirm-error').textContent=e.message;$('bulk-confirm-error').hidden=false;}
  }
  finally{busy=false;$('bulk-confirm').disabled=false;$('bulk-cancel-confirm').disabled=false;drawSelection();}
 });
 drawSelection();
 const savedJob=new URL(location.href).searchParams.get('publishJob');
 if(savedJob){busy=true;drawSelection();api('/'+encodeURIComponent(savedJob)).then(data=>{if(data.status==='preview')showPreview(data);else if(data.status!=='cancelled')drawJob(data);}).catch(e=>error(e.message)).finally(()=>{busy=false;drawSelection();});}
})();
