import nodemailer from 'nodemailer';
// Durable outbox: submissions are accepted on storage, never on presumed email delivery.
export function startNotifications(db) {
 if(!process.env.SMTP_HOST || !process.env.RFQ_FROM || !process.env.RFQ_TO) return ()=>{};
 const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',requireTLS:process.env.SMTP_SECURE!=='true',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}:undefined,connectionTimeout:10000,socketTimeout:15000});
 let active=false;
 async function flush(){
  if(active)return;active=true;
  try {
   const rows=db.prepare("SELECT id,payload FROM rfqs WHERE notification_status='pending' ORDER BY created_at LIMIT 10").all();
   for(const row of rows) {
    const p=JSON.parse(row.payload);
    try {
     await transport.sendMail({from:process.env.RFQ_FROM,to:process.env.RFQ_TO,replyTo:p.email,subject:`Surgical Essence quotation ${row.id}`,text:`Request ${row.id}\n\n${JSON.stringify(p,null,2)}`});
     db.prepare("UPDATE rfqs SET notification_status='sent' WHERE id=?").run(row.id);
    } catch {console.error(JSON.stringify({event:'rfq_notification_failed',reference:row.id}));break;}
   }
  } catch {console.error(JSON.stringify({event:'outbox_unavailable'}));} finally {active=false;}
 }
 void flush(); const timer=setInterval(flush,30000);timer.unref();return ()=>{clearInterval(timer);transport.close();};
}
