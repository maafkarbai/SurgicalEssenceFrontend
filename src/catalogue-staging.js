import {parse} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';
import {categories} from './catalogue.js';
import {IMPORT_FIELDS,IMPORT_LIMITS,parseImportCsv,normal,safeCsv,digest} from './cms/import-utils.js';

function invalid(message){throw new Error(message);}
function table(bytes,required,label){
 if(bytes.length>IMPORT_LIMITS.csvBytes)invalid(`${label} exceeds the CSV size limit.`);
 let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{invalid(`${label} must use valid UTF-8.`);}
 if(text.includes('\0'))invalid(`${label} contains NUL characters.`);
 let rows;try{rows=parse(text,{bom:true,skip_empty_lines:true,max_record_size:IMPORT_LIMITS.cell*64});}catch{invalid(`${label} is not a valid CSV.`);}
 const headers=rows.shift()||[];
 if(headers.length>64||new Set(headers).size!==headers.length||required.some(k=>!headers.includes(k)))invalid(`${label} has missing or duplicate headers.`);
 if(rows.length>10000||rows.some(row=>row.some(value=>value.length>IMPORT_LIMITS.cell)))invalid(`${label} exceeds row or field limits.`);
 return rows.map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]])));
}
const group=(rows,key)=>{const result=new Map();for(const row of rows){const k=key(row),bucket=result.get(k)||[];bucket.push(row);result.set(k,bucket);}return result;};
const pageKey=row=>`${row.catalog}:${Number(row.pdf_page)}`;
const validPage=(catalog,value)=>/^\d+$/.test(value||'')&&Number(value)>=1&&Number(value)<=catalog.pages;

/** Join existing extraction evidence only. This function grants no source approval. */
export function prepareCatalogue({products,sources,reviews,coverage,imageEntries}){
 const productTable=parseImportCsv(products),productRows=productTable.rows.map(row=>({row:row.row,product:Object.fromEntries(productTable.headers.map((h,i)=>[h,row.values[i]]))}));
 const sourceRows=table(sources,['sku','catalog','pdf_page','source_url','image_filename','image_type','image_source','extraction','review_notes','source_text','crop_box'],'product-sources.csv');
 const reviewRows=table(reviews,['catalog','pdf_page','sku','reason','source_text'],'review-needed.csv');
 const coverageRows=table(coverage,['catalog','pdf_page','detected_records','page_text_characters'],'page-coverage.csv');
 const catalogs=new Map(categories.map(c=>[c.pdf,c]));
 for(const review of reviewRows){const catalog=catalogs.get(review.catalog);if(!catalog||!validPage(catalog,review.pdf_page)||!review.reason?.trim())invalid('Review flags contain an unknown catalogue, invalid page or missing reason.');}
 const sourceBySku=group(sourceRows,r=>normal(r.sku)),productsBySku=group(productRows,r=>normal(r.product.sku)),coverageByPage=group(coverageRows,pageKey),images=group(imageEntries,r=>r.basename);
 const effectiveSlug=p=>p.slug?.trim()||String(p.sku||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const productsBySlug=group(productRows,r=>effectiveSlug(r.product));
 const flagsBySku=group(reviewRows.filter(r=>r.sku.trim()),r=>normal(r.sku)),flagsByPage=group(reviewRows.filter(r=>!r.sku.trim()),pageKey);
 const records=[],issues=[],drafts=[];
 for(const entry of productRows){
  const p=entry.product,sku=normal(p.sku),matches=sourceBySku.get(sku)||[],reasons=[],flags=[...(flagsBySku.get(sku)||[])];
  if(!p.sku||!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(p.sku))reasons.push('Invalid or missing product reference.');
  if(productsBySku.get(sku).length!==1)reasons.push('Duplicate product reference; all occurrences withheld.');
  if(productsBySlug.get(effectiveSlug(p)).length!==1)reasons.push('Duplicate effective URL slug; all occurrences withheld.');
  if(!p.name?.trim()||!p.category?.trim())reasons.push('Product name and category are required.');
  if(matches.length!==1)reasons.push(matches.length?'Ambiguous duplicate source records.':'Missing source record.');
  const s=matches.length===1?matches[0]:null,catalog=s?catalogs.get(s.catalog):null;
  if(s){
   if(!catalog)reasons.push('Unknown source catalogue.');
   else{
    if(!validPage(catalog,s.pdf_page))reasons.push('Source page is outside the documented catalogue range.');
    if(normal(p.category)!==normal(catalog.name))reasons.push('Product category does not match the source catalogue.');
   }
   flags.push(...(flagsByPage.get(pageKey(s))||[]));
   const pages=coverageByPage.get(pageKey(s))||[];
   if(pages.length!==1||!/^\d+$/.test(pages[0]?.detected_records||'')||Number(pages[0]?.detected_records)<1)reasons.push('Missing, duplicate or empty page coverage evidence.');
   if(!s.source_text?.trim()||!s.extraction?.trim())reasons.push('Missing extraction method or source text.');
   else if(!new RegExp('(?:^|[^a-z0-9._-])'+p.sku.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![a-z0-9._-])','i').test(s.source_text))reasons.push('Source text does not contain the exact product reference.');
   if(!s.image_type?.trim()||!s.image_source?.trim())reasons.push('Missing image source evidence.');
   if(p.image_filename!==s.image_filename)reasons.push('Product and source image references disagree.');
   if(p.additional_images?.trim())reasons.push('Additional images lack individual source evidence.');
   if(!s.image_filename||/[\\/\u0000-\u001f]/.test(s.image_filename)||s.image_filename==='..'||/^[a-z][a-z0-9+.-]*:/i.test(s.image_filename)||(images.get(s.image_filename)||[]).length!==1)reasons.push('Missing, unsafe or ambiguous image in the validated archive.');
  }
  for(const flag of flags)reasons.push(`Unresolved review flag (${flag.catalog}, page ${flag.pdf_page}): ${flag.reason}`);
  let prepared;
  if(s){
   const imageEvidence=[`UNREVIEWED ${s.image_type}`,s.image_source,s.crop_box?`Crop: ${s.crop_box}`:''].filter(Boolean).join('\n');
   const reviewNotes=[`UNREVIEWED extraction (${s.extraction}). Human source and image comparison required.`,s.review_notes,`Source URL (recorded only): ${s.source_url}`,`Source text: ${s.source_text}`].join('\n');
   const provenance={source_document:s.catalog,source_page:String(Number(s.pdf_page)),image_evidence:imageEvidence,review_notes:reviewNotes};
   for(const [field,max] of [['source_document',1000],['image_evidence',2000],['review_notes',4000]])if(provenance[field].length>max)reasons.push(`${field} exceeds the CMS field limit; evidence was not truncated.`);
   for(const [field,value] of Object.entries(provenance))if(p[field]&&p[field]!==value)reasons.push(`Existing ${field} differs from the extraction evidence.`);
   prepared={...Object.fromEntries(IMPORT_FIELDS.map(k=>[k,p[k]||''])),...provenance,status:'draft'};
   if(prepared.slug&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(prepared.slug))reasons.push('Invalid product URL slug.');
   if(prepared.featured&&!/^(true|false|yes|no|1|0)$/i.test(prepared.featured))reasons.push('Invalid featured value.');
   for(const [field,max] of [['sku',100],['name',200],['category',200],['short_description',1000],['description',50000],['material',20000],['size',20000],['variations',50000],['seo_title',200],['meta_description',500],['slug',160]])if(prepared[field].length>max)reasons.push(`${field} exceeds the CMS field limit.`);
  }
  const record={row:entry.row,product:p,sources:matches,flags,reasons,disposition:reasons.length?'withheld':'draft',image:s?(images.get(s.image_filename)||[])[0]||null:null};records.push(record);
  if(reasons.length)issues.push({row:entry.row,sku:p.sku,category:p.category,catalog:s?.catalog||'',source_page:s?.pdf_page||'',reasons});
  else drafts.push({catalog:catalog.id,product:prepared});
 }
 const files=splitDrafts(drafts);
 const report={schemaVersion:1,counts:{products:records.length,sources:sourceRows.length,flags:reviewRows.length,drafts:drafts.length,withheld:issues.length,orphanSources:sourceRows.filter(s=>!productsBySku.has(normal(s.sku))).length},issues,imports:files.map(f=>({path:f.path,rows:f.rows,bytes:Buffer.byteLength(f.content),sha256:digest(Buffer.from(f.content))}))};
 return {files,report,provenance:{schemaVersion:1,records,reviewRegister:reviewRows,coverage:coverageRows,orphanSources:sourceRows.filter(s=>!productsBySku.has(normal(s.sku)))},withheldCsv:safeCsv(issues.map(i=>({...i,reasons:i.reasons.join('\n')})),['row','sku','category','catalog','source_page','reasons'])};
}
function splitDrafts(drafts){
 const files=[],header='\ufeff'+stringify([],{header:true,columns:IMPORT_FIELDS,record_delimiter:'\r\n'});
 // Import files preserve source text exactly; reports use safeCsv for spreadsheet inspection.
 for(const [catalog,rows] of group(drafts,r=>r.catalog)){
  let content=header,count=0,part=1,bytes=Buffer.byteLength(header);
  const flush=()=>{if(count)files.push({path:`imports/${catalog}-${String(part++).padStart(3,'0')}.csv`,rows:count,content});content=header;count=0;bytes=Buffer.byteLength(header);};
  for(const row of rows){const line=stringify([row.product],{columns:IMPORT_FIELDS,record_delimiter:'\r\n',quoted_match:/[\r\n]/}),size=Buffer.byteLength(line);if(size+Buffer.byteLength(header)>IMPORT_LIMITS.csvBytes)invalid('A prepared product exceeds the CSV upload size limit.');if(bytes+size>IMPORT_LIMITS.csvBytes||count>=IMPORT_LIMITS.rows)flush();content+=line;bytes+=size;count++;}
  flush();
 }
 return files;
}
