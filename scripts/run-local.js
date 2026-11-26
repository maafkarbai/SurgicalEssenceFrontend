import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawn,spawnSync} from 'node:child_process';
import net from 'node:net';

const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);
const args=process.argv.slice(2),check=args.includes('--check');
let requestedPort;
for(let i=0;i<args.length;i++){
 if(args[i]==='--check')continue;
 if(args[i]==='--port'){requestedPort=Number(args[++i]);if(!Number.isInteger(requestedPort)||requestedPort<1024||requestedPort>65535)throw new Error('Use --port with a number from 1024 to 65535.');}
 else throw new Error('Usage: run.cmd [--port 3002] [--check]');
}
const [major,minor]=process.versions.node.split('.').map(Number);
if(major<22||(major===22&&minor<14)||major>=25)throw new Error('This project requires Node.js 22.14 through 24.x.');
if(existsSync(join(root,'.env')))process.loadEnvFile(join(root,'.env'));
const environment={...process.env,NODE_ENV:'development',VERCEL:'',TRUST_PROXY_HOPS:'0',DATA_DIR:join(root,'data'),SMTP_HOST:''};
delete environment.VERCEL_URL;delete environment.VERCEL_PROJECT_PRODUCTION_URL;
const require=createRequire(new URL('../package.json',import.meta.url));
const manifest=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const lockHash=hash(join(root,'package-lock.json')),lockStamp=join(root,'node_modules','.se-run-lock');
const missing=Object.keys(manifest.dependencies).some(name=>{try{require.resolve(name);return false;}catch{return true;}});
const changed=existsSync(lockStamp)&&readFileSync(lockStamp,'utf8')!==lockHash;
if(missing||changed){
 if(check)throw new Error('Dependencies need installation. Run run.cmd without --check.');
 console.log('Installing project dependencies…');
 const result=process.platform==='win32'
  ?spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c','npm.cmd ci'],{cwd:root,env:environment,stdio:'inherit'})
  :spawnSync('npm',['ci'],{cwd:root,env:environment,stdio:'inherit'});
 if(result.error||result.status!==0)throw new Error('Dependency installation failed. Check your network and npm output.');
}
if(!check){mkdirSync(join(root,'node_modules'),{recursive:true});writeFileSync(lockStamp,lockHash);}
async function available(port){return new Promise(resolve=>{const server=net.createServer();server.once('error',()=>resolve(false));server.listen(port,'0.0.0.0',()=>server.close(()=>resolve(true)));});}
let port=requestedPort;
if(port){if(!await available(port))throw new Error(`Port ${port} is already in use. Choose another --port.`);}
else for(let candidate=3000;candidate<=3010;candidate++){if(await available(candidate)){port=candidate;break;}}
if(!port)throw new Error('Ports 3000–3010 are busy. Choose a port with --port.');
Object.assign(environment,{PORT:String(port),SITE_URL:`http://localhost:${port}`});
console.log(`Website: ${environment.SITE_URL}`);
console.log(`Admin:   ${environment.SITE_URL}/admin/`);
if(check){console.log('Startup checks passed. No server, migration or email worker was started.');process.exit(0);}
const schemaHash=hash(join(root,'src','cms','schema.sql')),schemaStamp=join(environment.DATA_DIR,'.se-run-schema');
if(!existsSync(schemaStamp)||readFileSync(schemaStamp,'utf8')!==schemaHash){
 console.log('Preparing the local database (an existing database is backed up first)…');
 const result=spawnSync(process.execPath,['scripts/cms.js','migrate'],{cwd:root,env:environment,stdio:'inherit'});
 if(result.error||result.status!==0)throw new Error('Local database preparation failed.');
 mkdirSync(environment.DATA_DIR,{recursive:true});writeFileSync(schemaStamp,schemaHash);
}
console.log('Press Ctrl+C to stop. Keep this window open.');
console.log('First admin setup: node scripts/cms.js create-admin your-email@example.com');
const child=spawn(process.execPath,['server.js'],{cwd:root,env:environment,stdio:'inherit'});
child.on('error',()=>{console.error('Could not start the local server.');process.exitCode=1;});
process.on('SIGINT',()=>{if(!child.killed)child.kill('SIGINT');});
process.on('SIGTERM',()=>{if(!child.killed)child.kill('SIGTERM');});
child.on('exit',code=>{process.exitCode=code??0;});
