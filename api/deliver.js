import webpush from 'web-push';
import {deliverySecret,parseBody,validSubscription} from './_marevo-push.js';

function vapidReady(){
  return !!(process.env.VAPID_PUBLIC_KEY&&process.env.VAPID_PRIVATE_KEY);
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});

  let secret;
  try{secret=deliverySecret();}catch(error){return res.status(503).json({error:'Delivery is not configured'});}
  if(req.headers.authorization!==`Bearer ${secret}`)return res.status(401).json({error:'Unauthorized'});
  if(!vapidReady())return res.status(503).json({error:'VAPID is not configured'});

  const body=parseBody(req);
  const subscription=body?.subscription;
  const reminder=body?.reminder;
  if(!validSubscription(subscription)||!reminder||typeof reminder!=='object')return res.status(400).json({error:'Invalid payload'});

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT||'mailto:marevo@users.noreply.github.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const payload=JSON.stringify({
    id:String(reminder.id||''),
    type:String(reminder.type||'general'),
    title:String(reminder.title||'MAREVO'),
    body:String(reminder.body||'Tienes una tarea pendiente.'),
    tag:String(reminder.tag||'marevo-general'),
    url:String(reminder.url||'./')
  });

  try{
    const result=await webpush.sendNotification(subscription,payload,{
      TTL:Math.max(60,Number(reminder.type==='rest'?900:21600)),
      urgency:reminder.type==='rest'?'high':'normal'
    });
    return res.status(200).json({ok:true,statusCode:result.statusCode});
  }catch(error){
    const status=Number(error?.statusCode||0);
    if(status===404||status===410){
      console.info('[MAREVO push] subscription expired');
      return res.status(200).json({ok:true,expired:true});
    }
    console.error('[MAREVO push] delivery failed',error);
    return res.status(502).json({error:'Push delivery failed'});
  }
}
