import {resolve,join} from 'node:path';
import {mkdirSync,existsSync,readFileSync,cpSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import pg from 'pg';
import {openStore} from '../src/store.js';
import {createCmsStore} from '../src/cms/store.js';
import {hashPassword} from '../src/cms/auth.js';

const [command,email]=process.argv.slice(2),cloud=process.argv.includes('--postgres');
const dataDir=resolve(process.env.DATA_DIR||'data');
const commands=['backup','migrate','create-admin','reset-admin'];
if(!commands.includes(command))throw new Error('Usage: node --env-file-if-exists=.env scripts/cms.js backup | migrate | create-admin EMAIL | reset-admin EMAIL [--postgres] [--password-file PRIVATE_FILE]');
async function password(){
 const flag=process.argv.indexOf('--password-file');
 if(flag!==-1)return readFileSync(resolve(process.argv[flag+1]),'utf8').replace(/\r?\n$/,'');
 if(!process.stdin.isTTY)throw new Error('Use an interactive terminal or --password-file pointing to a private file.');
 process.stdout.write('Password (12–256 characters, hidden): ');
 process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding('utf8');
 return new Promise((resolvePassword,reject)=>{
  let value='';function finish(){process.stdin.setRawMode(false);process.stdin.pause();process.stdin.off('data',handle);process.stdout.write('\n');}
  function handle(text){for(const c of text){if(c==='\u0003'){finish();reject(new Error('Cancelled.'));return;}if(c==='\r'||c==='\n'){finish();resolvePassword(value);return;}if(c==='\u007f'||c==='\b')value=value.slice(0,-1);else if(c>=' '&&value.length<257)value+=c;}}
  process.stdin.on('data',handle);
 });
}
function localBackup(){
 const source=join(dataDir,'requests.sqlite');if(!existsSync(source))return;
 const dest=join(dataDir,'backups',new Date().toISOString().replace(/[:.]/g,'-'));mkdirSync(dest,{recursive:true,mode:0o700});
 const db=new DatabaseSync(source);try{db.prepare('VACUUM INTO ?').run(join(dest,'requests.sqlite'));}finally{db.close();}
 if(existsSync(join(dataDir,'media')))cpSync(join(dataDir,'media'),join(dest,'media'),{recursive:true});
 console.log(`Private backup created: ${dest}`);
}
if(cloud&&process.env.CMS_BACKUP_CONFIRMED!=='yes')throw new Error('Take and verify a PostgreSQL/provider backup first. Set CMS_BACKUP_CONFIRMED=yes only for this private setup command.');
if(command==='backup'){
 if(cloud)throw new Error('Use pg_dump --format=custom and the provider snapshot facility; back up Blob objects separately.');
 localBackup();
}else{
 if(!cloud)localBackup();
 const db=cloud?{pool:new pg.Pool({connectionString:process.env.DIRECT_URL||process.env.DATABASE_URL,max:1})}:openStore(dataDir);
 try{
  const repo=createCmsStore({db,cloud});await repo.ready();
  if(command==='create-admin'||command==='reset-admin'){
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email||''))throw new Error('Provide a valid administrator email address.');
   const hash=await hashPassword(await password());
   if(command==='create-admin'){
    if(await repo.adminCount())throw new Error('An admin already exists. Use Settings or the private reset-admin recovery command.');
    await repo.createAdmin({email:email.toLowerCase(),passwordHash:hash});
   }else{
    const admin=await repo.findAdmin(email.toLowerCase());if(!admin)throw new Error('Administrator not found.');
    await repo.updatePassword(admin.id,hash);await repo.deleteUserSessions(admin.id);
   }
   console.log('Administrator credentials saved. No password was logged.');
  }else console.log('CMS migration complete; existing product records were retained.');
 }finally{if(cloud)await db.pool.end();else db.close();}
}
