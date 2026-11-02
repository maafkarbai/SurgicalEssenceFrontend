import {createApp} from './src/app.js';
import {startNotifications} from './src/notifications.js';
const {app,db}=createApp();
const stopNotifications=startNotifications(db);
const server=app.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log(`Surgical Essence is running at http://localhost:${process.env.PORT||3000}`));
function close(){stopNotifications();server.close(()=>{db.close();process.exit(0);});}
process.on('SIGINT',close);process.on('SIGTERM',close);
