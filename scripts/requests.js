// Run on the private application host; never expose this command through HTTP.
import {DatabaseSync} from 'node:sqlite';
import {resolve,join} from 'node:path';
const [command='list',reference,confirmation]=process.argv.slice(2);
const db=new DatabaseSync(join(resolve(process.env.DATA_DIR||'./data'),'requests.sqlite'),{readOnly:command!=='delete'});
try{
 if(command==='list')console.table(db.prepare('SELECT id, datetime(created_at/1000, \'unixepoch\') AS received_utc, notification_status FROM rfqs ORDER BY created_at DESC LIMIT 100').all());
 else if(command==='show'&&/^SE-(?:[A-F0-9]{8}|[A-F0-9]{24})$/.test(reference||'')){
  const row=db.prepare('SELECT * FROM rfqs WHERE id=?').get(reference);
  if(!row)throw new Error('Reference not found.');
  console.log(JSON.stringify({reference:row.id,receivedAt:new Date(row.created_at).toISOString(),notificationStatus:row.notification_status,enquiry:JSON.parse(row.payload)},null,2));
 }else if(command==='delete'&&/^SE-(?:[A-F0-9]{8}|[A-F0-9]{24})$/.test(reference||'')&&confirmation==='--confirm'){
  console.log(`Deleted ${db.prepare('DELETE FROM rfqs WHERE id=?').run(reference).changes} enquiry record(s). Remove corresponding mail and backups according to the retention policy.`);
 }else throw new Error('Usage: node --env-file-if-exists=.env scripts/requests.js list | show SE-XXXXXXXX | delete SE-XXXXXXXX --confirm');
}finally{db.close();}
