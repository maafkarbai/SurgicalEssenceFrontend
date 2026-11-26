import {parse} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';
import yauzl from 'yauzl';
import {createHash} from 'node:crypto';
import {basename} from 'node:path';
export const IMPORT_FIELDS=['sku','name','category','short_description','description','material','size','variations','image_filename','additional_images','seo_title','meta_description','slug','status','featured','source_document','source_page','image_evidence','review_notes'];
const bounded=(key,fallback,max)=>{const value=Number(process.env[key]);return Number.isSafeInteger(value)&&value>0?Math.min(value,max):fallback;};
export const IMPORT_LIMITS={csvBytes:bounded('CMS_IMPORT_MAX_CSV_BYTES',4*1024*1024,4*1024*1024),rows:bounded('CMS_IMPORT_MAX_ROWS',10000,10000),columns:64,cell:50000,zipBytes:bounded('CMS_IMPORT_MAX_ZIP_BYTES',64*1024*1024,64*1024*1024),chunkBytes:512*1024,entryBytes:4*1024*1024,totalBytes:256*1024*1024,entries:5000};
export const invalid=(message,status=400)=>Object.assign(new Error(message),{status});
export const normal=value=>String(value??'').trim().replace(/\s+/g,' ').toLowerCase();
const aliases={sku:['sku','product code','item number','reference no','reference number','code','product sku'],name:['name','product name','item name'],category:['category','product category'],description:['description','details','full description'],image_filename:['image filename','image','main image'],additional_images:['additional images','gallery'],short_description:['short description','summary'],material:['material'],size:['size','dimensions','length'],variations:['variations','variants'],seo_title:['seo title'],meta_description:['meta description'],slug:['slug','url slug'],status:['status'],featured:['featured'],source_document:['source document'],source_page:['source page'],image_evidence:['image evidence'],review_notes:['review notes']};
export function parseImportCsv(bytes){
 const buffer=Buffer.from(bytes);if(!buffer.length||buffer.length>IMPORT_LIMITS.csvBytes)throw invalid('CSV is empty or exceeds the configured upload limit (maximum 4 MiB).',413);
 let input;try{input=new TextDecoder('utf-8',{fatal:true}).decode(buffer);}catch{throw invalid('CSV must use valid UTF-8 encoding. Save it as CSV UTF-8.');}
 if(input.includes('\0'))throw invalid('CSV cannot contain NUL characters.');
 let records;try{records=parse(input,{bom:true,info:true,raw:true,skip_empty_lines:true,max_record_size:IMPORT_LIMITS.cell*IMPORT_LIMITS.columns,relax_column_count:false});}catch(error){throw invalid(`Malformed CSV${error.lines?` near line ${error.lines}`:''}: check quoted fields and column counts.`);}
 if(records.length<2)throw invalid('CSV needs a header and at least one product row.');
 const headers=records.shift().record.map(v=>v.trim());if(headers.length>64||headers.some(h=>!h)||new Set(headers).size!==headers.length)throw invalid('Use 1–64 unique, non-empty column headers.');
 if(records.length>IMPORT_LIMITS.rows)throw invalid(`CSV supports at most ${IMPORT_LIMITS.rows} product rows.`,413);
 const starts=[];let line=1,start=1,quoted=false,recordStart=0;input=input.replace(/^\ufeff/,'');for(let i=0;i<input.length;i++){const char=input[i];if(char==='"'){if(quoted&&input[i+1]==='"')i++;else quoted=!quoted;}if(char==='\r'||char==='\n'){const length=char==='\r'&&input[i+1]==='\n'?2:1;if(!quoted){if(i>recordStart)starts.push(start);recordStart=i+length;start=line+1;}line++;if(length===2)i++;}}if(recordStart<input.length)starts.push(start);starts.shift();
 const rows=records.map((item,index)=>{if(item.record.some(v=>v.length>50000))throw invalid(`Row ${index+2} contains a cell longer than 50,000 characters.`);const lineBreaks=(item.raw.match(/\r\n|\n|\r/g)||[]).length;const ending=/[\r\n]$/.test(item.raw)?1:0;return {index,row:starts[index],values:item.record};});
 const mapping={},ambiguities={};for(const field of IMPORT_FIELDS){const matches=headers.filter(h=>aliases[field].includes(normal(h).replace(/_/g,' ')));if(matches.length===1)mapping[field]=matches[0];else if(matches.length>1)ambiguities[field]=matches;}
 return {headers,rows,mapping,ambiguities};
}
export function resolveMapping(headers,mapping){const result={},used=new Set();for(const [field,source] of Object.entries(mapping||{})){if(!IMPORT_FIELDS.includes(field)||source===''||source==null)continue;const index=typeof source==='number'?source:headers.indexOf(source);if(!Number.isInteger(index)||index<0||index>=headers.length)throw invalid(`Choose a valid CSV column for ${field}.`);if(used.has(index))throw invalid('Each CSV column may map to only one product field.');used.add(index);result[field]=index;}for(const field of ['sku','name','category'])if(result[field]===undefined)throw invalid(`Map the required ${field} column.`);return result;}
export function safeCsv(records,columns){return '\ufeff'+stringify(records.map(row=>Array.isArray(row)?row.map(safeCell):Object.fromEntries(Object.entries(row).map(([k,v])=>[k,safeCell(v)]))),{header:Boolean(columns),columns,record_delimiter:'\r\n',quoted_match:/[\r\n]/});}
function safeCell(value){const text=String(value??'');return /^[\s\u0000-\u001f]*[=+@-]/.test(text)||/^[\t\r\n]/.test(text)?`'${text}`:text;}
export function templateCsv(){return safeCsv([{sku:'DEMO-001',name:'Fictional demonstration instrument',category:'Demonstration category',short_description:'Fictional example only',description:'Fictional example, replace with verified product information.\nNo technical specifications are supplied.',status:'draft',featured:'false'},{sku:'DEMO-002',name:'Another fictional example',category:'Demonstration category',status:'draft',featured:'false'}],IMPORT_FIELDS);}
export function imageFile(buffer,name){const ext=/\.([a-z]+)$/i.exec(name)?.[1]?.toLowerCase();return {buffer,originalname:name,mimetype:{jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'}[ext]};}
export const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function openZip(bytes){return new Promise((resolve,reject)=>yauzl.fromBuffer(bytes,{lazyEntries:true,decodeStrings:true,validateEntrySizes:true,strictFileNames:true},(error,zip)=>error?reject(invalid('Invalid ZIP archive.')):resolve(zip)));}
export async function scanZip(bytes,{target,onEntry}={}){
 if(bytes.length>IMPORT_LIMITS.zipBytes)throw invalid('ZIP must be at most 64 MiB.',413);
 const zip=await openZip(bytes);return new Promise((resolve,reject)=>{let count=0,total=0,finished=false;const entries=[];const fail=error=>{if(finished)return;finished=true;zip.close();reject(error.status?error:invalid('ZIP could not be read safely.'));};zip.on('error',fail);zip.on('end',()=>{if(!finished){finished=true;resolve(entries);}});zip.on('entry',entry=>{(async()=>{
 const name=entry.fileName;count++;total+=entry.uncompressedSize;const mode=(entry.externalFileAttributes>>>16)&0xf000;
 if(count>5000||total>IMPORT_LIMITS.totalBytes||entry.uncompressedSize>IMPORT_LIMITS.entryBytes||entry.uncompressedSize>entry.compressedSize*100)throw invalid('ZIP exceeds safe entry, size or compression limits.');
 if(!name||/^[\/\\]|^[a-z]:/i.test(name)||name.includes('\\')||name.split('/').includes('..')||/[\u0000-\u001f\u007f]/.test(name)||mode===0xa000||(mode&&mode!==0x8000&&mode!==0x4000)||(entry.generalPurposeBitFlag&0x41))throw invalid('ZIP contains an unsafe, encrypted or symbolic-link entry.');
 if(name.endsWith('/')){zip.readEntry();return;}if(!/\.(?:jpe?g|png|webp)$/i.test(name))throw invalid('ZIP may contain only JPEG, PNG and WebP images; nested archives are not accepted.');
 const item={name,basename:basename(name),size:entry.uncompressedSize};entries.push(item);
 if(onEntry&&(!target||target===name)){const buffer=await new Promise((res,rej)=>zip.openReadStream(entry,(error,stream)=>{if(error)return rej(error);const chunks=[];let length=0;stream.on('data',chunk=>{length+=chunk.length;if(length>IMPORT_LIMITS.entryBytes){stream.destroy();rej(invalid('ZIP image is too large.'));}else chunks.push(chunk);});stream.on('error',rej);stream.on('end',()=>res(Buffer.concat(chunks)));}));await onEntry(item,buffer);}
 zip.readEntry();})().catch(fail);});zip.readEntry();});
}
