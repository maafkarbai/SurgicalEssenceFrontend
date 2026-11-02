(() => {
 'use strict';
 const key='surgical-essence-quote-v1',notice=document.querySelector('#announcement');
 let timer,memory=[],storageAvailable=true;
 function announce(message){notice.textContent=message;clearTimeout(timer);timer=setTimeout(()=>{notice.textContent='';},5000);}
 function read(){if(!storageAvailable)return memory;try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(p=>p&&typeof p.code==='string'&&/^[0-9-]{8,20}$/.test(p.code)&&typeof p.name==='string'&&p.name.length<=120&&(p.quantity===null||(Number.isInteger(p.quantity)&&p.quantity>=1&&p.quantity<=1000000))).slice(0,50):[];}catch{return memory;}}
 function write(list){memory=list;try{localStorage.setItem(key,JSON.stringify(list));}catch{storageAvailable=false;announce('Browser storage is unavailable. Your list will only last on this page.');}updateCount();}
 function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
 function updateCount(){const list=read();document.querySelectorAll('[data-quote-count]').forEach(n=>n.textContent=list.length);document.querySelectorAll('[data-add]').forEach(b=>{const added=list.some(p=>p.code===b.dataset.add);b.setAttribute('aria-pressed',String(added));b.textContent=added?'Added ✓':b.classList.contains('add-button')?'+ Quote list':'Add to quote list +';});}
 const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
 menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');menu.focus();}});
 document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>{const list=read();if(list.some(p=>p.code===button.dataset.add)){announce('This instrument is already in your quote list.');return;}if(list.length>=50){announce('Your quote list can contain up to 50 instruments. Add other references in your enquiry.');return;}list.push({code:button.dataset.add,name:button.dataset.name,quantity:null});write(list);announce(`${button.dataset.name} added to your quote list.`);}));
 function renderList(){
  const container=document.querySelector('#quote-list');if(!container)return;
  const list=read();document.querySelector('#quote-footer').hidden=!list.length;
  if(!list.length){if(container.dataset.rendered){container.replaceChildren();const empty=el('div',undefined,'empty-state');empty.append(el('h2','No instruments selected yet.'),el('p','Browse the online range or send your requirements directly.'));const a=el('a','Explore instruments','button');a.href='/products';empty.append(a);container.append(empty);}return;}
  container.dataset.rendered='true';container.replaceChildren();
  list.forEach((p,index)=>{const row=el('div',undefined,'quote-row'),img=el('img');img.src=`/images/optimized/${encodeURIComponent(p.code)}.webp`;img.alt=`Catalogue illustration of ${p.name}`;img.width=70;img.height=100;
   const identity=el('div'),a=el('a');a.href=`/products/${encodeURIComponent(p.code)}`;a.append(el('h2',p.name));identity.append(a,el('code',p.code));
   const qty=el('div'),label=el('label','Estimated quantity'),input=el('input');label.htmlFor=`qty-${index}`;input.id=label.htmlFor;input.type='number';input.min='1';input.max='1000000';input.step='1';input.placeholder='TBC';input.value=p.quantity??'';input.setAttribute('aria-label',`Estimated quantity for ${p.name}, ${p.code}`);
   input.addEventListener('change',()=>{if(input.value!==''&&!input.checkValidity()){input.reportValidity();return;}const current=read(),entry=current.find(x=>x.code===p.code);if(entry){entry.quantity=input.value===''?null:Number(input.value);write(current);}});qty.append(label,input);
   const remove=el('button','Remove');remove.type='button';remove.setAttribute('aria-label',`Remove ${p.name}, ${p.code}`);remove.addEventListener('click',()=>{write(read().filter(x=>x.code!==p.code));renderList();document.querySelector('.quote-row button, #quote-list a')?.focus();announce('Instrument removed from quote list.');});row.append(img,identity,qty,remove);container.append(row);
  });
 }
 function fillQuote(){
  const summary=document.querySelector('#rfq-quote-summary');if(!summary)return;
  const list=read(),input=document.querySelector('#quote-items');input.value=JSON.stringify(list.map(({code,quantity})=>({code,quantity})));summary.replaceChildren();if(!list.length)return;
  const box=el('div',undefined,'quote-summary');box.append(el('strong',`${list.length} selected instrument${list.length===1?'':'s'}`));list.forEach(p=>box.append(el('p',`${p.name} · ${p.code} · ${p.quantity===null?'Quantity to confirm':p.quantity+' units'}`)));const edit=el('a','Edit your quote list');edit.href='/quote-list';box.append(edit);summary.append(box);
 }
 const form=document.querySelector('#rfq-form');
 function showErrors(errors,message){
  const box=document.querySelector('#form-errors');box.replaceChildren(el('h2',message||'Please review your enquiry.'));const ul=el('ul');
  form.querySelectorAll('.field-error').forEach(n=>n.textContent='');form.querySelectorAll('[aria-invalid]').forEach(n=>n.removeAttribute('aria-invalid'));
  for(const [field,text] of Object.entries(errors||{})){const li=el('li'),target=form.elements.namedItem(field);if(target&&target.type!=='hidden'){const a=el('a',text);a.href=`#${field}`;li.append(a);target.setAttribute('aria-invalid','true');const inline=document.getElementById(`${field}-error`);if(inline){inline.textContent=text;target.setAttribute('aria-describedby',`${field}-error`);}}else li.textContent=text;ul.append(li);}box.append(ul);box.hidden=false;box.focus();
 }
 form?.addEventListener('submit',async event=>{
  event.preventDefault();const button=form.querySelector('[type=submit]');if(button.disabled)return;
  fillQuote();const data=Object.fromEntries(new FormData(form)),errors={};
  for(const [field,label] of [['name','your full name'],['company','your company name'],['country','your country']])if(data[field].trim().length<2)errors[field]=`Enter ${label}.`;
  if(!form.elements.email.validity.valid||!data.email.trim())errors.email='Enter a valid business email.';
  if(!data.buyerType)errors.buyerType='Select your buyer type.';
  if(!data.products.trim()&&!read().length)errors.products='Enter product names or reference numbers, or add an instrument to your quote list.';
  if(Object.keys(errors).length){showErrors(errors);return;}
  const status=document.querySelector('#submit-status');button.disabled=true;status.textContent='Sending your enquiry…';document.querySelector('#form-errors').hidden=true;
  try{
   const response=await fetch('/request-quote',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});
   let result;try{result=await response.json();}catch{throw new Error('The server could not process this request. Please wait a moment and try again.');}
   if(!response.ok||!result.ok){showErrors(result.errors,result.message||'Your request could not be saved. Please try again.');return;}
   write([]);const section=el('section',undefined,'container status-page'),icon=el('span','✓','status-icon');icon.setAttribute('aria-hidden','true');const heading=el('h1','Your enquiry has been received.');heading.tabIndex=-1;
   section.append(icon,heading,el('p','Your quotation request has been saved for our team to review.','lead'),el('p',`Your reference: ${result.reference}`,'reference'),el('p','Keep this reference if you contact us. This is not an order confirmation or confirmation of email delivery.'));
   const links=el('div',undefined,'actions'),a=el('a','Explore instruments','button'),b=el('a','Start another enquiry','button outline');a.href='/products';b.href='/request-quote';links.append(a,b);section.append(links);document.querySelector('#main').replaceChildren(section);heading.focus();document.title='Enquiry Received | Surgical Essence';window.scrollTo(0,0);
  }catch(error){showErrors({},error.message||'Connection interrupted. Please try again; the same request will not be stored twice.');}
  finally{button.disabled=false;status.textContent='';}
 });
 document.querySelector('#quote-footer a[href="/request-quote"]')?.addEventListener('click',event=>{const invalid=document.querySelector('#quote-list input:invalid');if(invalid){event.preventDefault();invalid.reportValidity();invalid.focus();}});
 window.addEventListener('storage',()=>{updateCount();renderList();fillQuote();});
 document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const fallback=el('span','Image unavailable','small-note');img.replaceWith(fallback);},{once:true}));
 updateCount();renderList();fillQuote();
 if(form&&document.querySelector('#form-errors:not([hidden])'))document.querySelector('#form-errors').focus();
})();
