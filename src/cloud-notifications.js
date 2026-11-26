import {createHash,timingSafeEqual} from 'node:crypto';
import {createNotificationTransport} from './notifications.js';
import net from 'node:net';

const mailbox=/^[^\s@<>;,"\\]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const unavailable=()=>Object.assign(new Error('Notification worker unavailable.'),{status:503});
const hash=value=>createHash('sha256').update(value).digest();
// Retain the socket so a serverless deadline can actually abort an in-flight SMTP send.
// Nodemailer's non-pooled close() alone does not close its active SMTPConnection.
export function createCloudNotificationTransport(env,options={}){
 let socket,connectionTimer,closed=false;
 const transport=createNotificationTransport(env,{dnsTimeout:2000,greetingTimeout:3000,connectionTimeout:5000,socketTimeout:8000,...options,getSocket(options,callback){
  if(closed)return callback(new Error('Transport closed.'));
  socket=net.createConnection({host:options.host,port:options.port});
  // Hand over a plain connected socket; Nodemailer still performs and validates TLS.
  const failed=error=>{clearTimeout(connectionTimer);callback(error);};
  socket.once('error',failed);
  connectionTimer=setTimeout(()=>socket.destroy(new Error('SMTP connection timeout.')),5000);
  socket.once('connect',()=>{clearTimeout(connectionTimer);socket.removeListener('error',failed);callback(null,{connection:socket});});
  socket.on('error',()=>{});
 }});
 const close=transport.close.bind(transport);
 transport.close=()=>{closed=true;clearTimeout(connectionTimer);socket?.destroy();close();};
 return transport;
}
export function createCloudNotificationHandler({store,env=process.env,transportFactory=createCloudNotificationTransport,sendTimeoutMs=12000}){
 return async(req,res)=>{
  res.set({'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});
  const secret=env.CRON_SECRET;
  if(typeof secret!=='string'||secret.length<32)return res.status(503).json({ok:false,message:'Notification worker unavailable.'});
  const authorization=req.get('Authorization')||'';
  if(authorization.length>512||!timingSafeEqual(hash(authorization),hash('Bearer '+secret)))return res.status(401).json({ok:false,message:'Unauthorized.'});
  if(!['GET','POST'].includes(req.method))return res.set('Allow','GET, POST').status(405).json({ok:false,message:'Method not allowed.'});
  let transport,timer;
  try{
   const port=Number(env.SMTP_PORT||587);
   if(env.RFQ_NOTIFICATIONS_ENABLED!=='true'||!env.SMTP_HOST||!mailbox.test(env.RFQ_FROM||'')||!mailbox.test(env.RFQ_TO||'')||!Number.isInteger(port)||port<1||port>65535||!store.claimNotification||!store.finishNotification)throw unavailable();
   // Configuration is checked before a durable claim. Each request sends at most one email.
   const claim=await store.claimNotification();
   if(!claim)return res.json({ok:true,processed:0,sent:0,retry:0});
   let outcome='sent';
   try{
    if(!claim.payload||!mailbox.test(claim.payload.email||''))throw Object.assign(new Error('Invalid stored payload.'),{code:'INVALID_PAYLOAD'});
    transport=transportFactory(env);
    const message={from:env.RFQ_FROM,to:env.RFQ_TO,replyTo:claim.payload.email,subject:`Surgical Essence quotation ${claim.reference}`,messageId:`<${claim.reference}@${env.RFQ_FROM.split('@')[1]}>`,text:`Request ${claim.reference}\n\n${JSON.stringify(claim.payload,null,2)}`,disableFileAccess:true,disableUrlAccess:true};
    const result=await Promise.race([transport.sendMail(message),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error('SMTP timeout.'),{code:'SMTP_TIMEOUT'})),sendTimeoutMs);})]);
    if(!result?.accepted?.length||result.rejected?.length)throw Object.assign(new Error('SMTP rejected recipient.'),{code:'SMTP_REJECTED'});
   }catch(error){outcome=['INVALID_PAYLOAD','SMTP_TIMEOUT','SMTP_REJECTED'].includes(error.code)?error.code:'SMTP_UNAVAILABLE';}
   finally{clearTimeout(timer);transport?.close();}
   const acknowledged=await store.finishNotification(claim.reference,claim.token,outcome);
   if(!acknowledged)throw unavailable();
   if(outcome!=='sent')console.error(JSON.stringify({event:'rfq_notification_retry',reference:claim.reference,code:outcome}));
   return res.json({ok:true,processed:1,sent:outcome==='sent'?1:0,retry:outcome==='sent'?0:1});
  }catch{
   console.error(JSON.stringify({event:'cloud_outbox_unavailable'}));
   return res.status(503).json({ok:false,message:'Notification worker unavailable.'});
  }finally{clearTimeout(timer);}
 };
}
