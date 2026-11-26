import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {openStore} from '../src/store.js';
import {createCmsStore} from '../src/cms/store.js';
test('private admin CLI creates a hashed account, backs up before migration, and recovers a password',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'se-cms-cli-')),passwordFile=join(dir,'private-password');
 const run=(...args)=>spawnSync(process.execPath,['scripts/cms.js',...args],{env:{...process.env,DATA_DIR:dir},encoding:'utf8'});
 try{
  writeFileSync(passwordFile,'A temporary test password 12345',{mode:0o600});
  let result=run('create-admin','admin@example.com','--password-file',passwordFile);assert.equal(result.status,0,result.stderr);assert.ok(!result.stdout.includes('temporary test password'));
  result=run('migrate');assert.equal(result.status,0,result.stderr);assert.ok(readdirSync(join(dir,'backups')).length);
  result=run('reset-admin','admin@example.com','--password-file',passwordFile);assert.equal(result.status,0,result.stderr);
  const db=openStore(dir);try{const repo=createCmsStore({db});assert.equal(await repo.adminCount(),1);assert.match((await repo.findAdmin('admin@example.com')).passwordHash,/^scrypt\$/);assert.equal((await repo.products({all:true})).total,8);}finally{db.close();}
 }finally{rmSync(dir,{recursive:true,force:true});}
});
