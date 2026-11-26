// Private maintenance command. Dry-run by default; never run through an HTTP endpoint.
import {readdir,stat,unlink} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import pg from 'pg';
import {openStore} from '../src/store.js';
import {createCmsStore} from '../src/cms/store.js';

const cloud=process.argv.includes('--postgres'),remove=process.argv.includes('--delete');
const dataDir=resolve(process.env.DATA_DIR||'data');
const db=cloud?{pool:new pg.Pool({connectionString:process.env.DIRECT_URL||process.env.DATABASE_URL,max:1})}:openStore(dataDir);
const filename=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-(original|800|400)\.webp$/;
try{
 const repo=createCmsStore({db,cloud});await repo.ready();
 const records=await repo.media(),known=new Set(records.flatMap(r=>[r.url,r.mediumUrl,r.smallUrl]));
 const cutoff=Date.now()-86400000;
 if(cloud){
  if(!process.env.BLOB_READ_WRITE_TOKEN||!/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(process.env.BLOB_PUBLIC_HOST||''))throw new Error('Configure the private Blob token and exact public store host.');
  const {list,del}=await import('@vercel/blob');let cursor;
  do{
   const page=await list({prefix:'media/',cursor,limit:1000,token:process.env.BLOB_READ_WRITE_TOKEN});
   for(const blob of page.blobs){const url=new URL(blob.url);if(url.host!==process.env.BLOB_PUBLIC_HOST||!filename.test(url.pathname.split('/').at(-1))||known.has(blob.url)||new Date(blob.uploadedAt).getTime()>cutoff)continue;
    console.log(`${remove?'Deleting':'Orphan candidate'}: ${blob.url}`);if(remove)await del(blob.url,{token:process.env.BLOB_READ_WRITE_TOKEN});
   }cursor=page.hasMore?page.cursor:undefined;
  }while(cursor);
 }else{
  const root=resolve(dataDir,'media');
  for(const file of await readdir(root).catch(e=>{if(e.code==='ENOENT')return [];throw e;})){
   if(!filename.test(file)||known.has('/media/'+file))continue;
   const target=resolve(root,file);if(!target.startsWith(root+'\\')&&!target.startsWith(root+'/'))throw new Error('Unsafe media path.');
   const info=await stat(target);if(!info.isFile()||info.mtimeMs>cutoff)continue;
   console.log(`${remove?'Deleting':'Orphan candidate'}: ${target}`);if(remove)await unlink(target);
  }
 }
 console.log(remove?'Orphan cleanup complete.':'Dry run complete. Use --delete only after reviewing the candidates and backup.');
}finally{if(cloud)await db.pool.end();else db.close();}
