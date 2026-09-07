import webpush from 'web-push';

function parseBody(req){
  if(req.body&&typeof req.body==='object')return req.body;
  try{return JSON.parse(req.body||'{}');}catch(error){return {};}
}
function validSubscription(s){
  return !!(s&&typeof s.endpoint==='string'&&s.endpoint.startsWith('https://')&&s.keys&&typeof s.keys.p256dh==='string'&&typeof s.keys.auth==='string');
}
function pushTopic(reminder){
  return String(reminder?.tag||`marevo-${reminder?.type||'general'}`).replace(/[^A-Za-z0-9_-]/g,'-').slice(0,32)||'marevo-general';
}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  const deliveryKey=process.env.MAREVO_DELIVERY_KEY;
  if(!deliveryKey||req.headers['x-marevo-delivery-key']!==deliveryKey)return res.status(401).json({error:'unauthorized'});

  const publicKey=process.env.VAPID_PUBLIC_KEY;
  const privateKey=process.env.VAPID_PRIVATE_KEY;
  const subject=process.env.VAPID_SUBJECT;
  if(!publicKey||!privateKey||!subject)return res.status(503).json({error:'push_not_configured'});

  const body=parseBody(req);
  if(!validSubscription(body.subscription)||!body.reminder)return res.status(400).json({error:'invalid_payload'});

  const reminder=body.reminder;
  webpush.setVapidDetails(subject,publicKey,privateKey);
  try{
    await webpush.sendNotification(body.subscription,JSON.stringify({
      id:reminder.id,
      type:reminder.type,
      title:reminder.title,
      body:reminder.body,
      tag:reminder.tag,
      url:reminder.url||'./'
    }),{
      TTL:reminder.type==='rest'?300:21600,
      urgency:reminder.type==='rest'?'high':'normal',
      topic:pushTopic(reminder)
    });
    return res.status(200).json({ok:true});
  }catch(error){
    const status=Number(error?.statusCode)||500;
    if(status===404||status===410)return res.status(200).json({ok:false,expired:true});
    return res.status(502).json({error:'push_delivery_failed'});
  }
}
