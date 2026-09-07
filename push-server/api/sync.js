import { Client } from '@upstash/qstash';

const DEFAULT_ORIGIN='https://juancpa99.github.io';
const MAX_HORIZON_MS=7*24*60*60*1000-60*1000;
const ALLOWED_TYPES=new Set(['rest','workout','checkin','body','monthly','breakfast','lunch','snack','dinner','post-workout','general']);

function cors(req,res){
  const allowedOrigin=process.env.MAREVO_ALLOWED_ORIGIN||DEFAULT_ORIGIN;
  res.setHeader('Access-Control-Allow-Origin',allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
}
function parseBody(req){
  if(req.body&&typeof req.body==='object')return req.body;
  try{return JSON.parse(req.body||'{}');}catch(error){return {};}
}
function validSubscription(s){
  return !!(s&&typeof s.endpoint==='string'&&s.endpoint.startsWith('https://')&&s.keys&&typeof s.keys.p256dh==='string'&&typeof s.keys.auth==='string');
}
function cleanText(value,max){return String(value||'').trim().slice(0,max);}
function cleanReminder(value,now){
  if(!value||typeof value!=='object')return null;
  const at=Number(value.at);
  if(!Number.isFinite(at)||at<now+500||at>now+MAX_HORIZON_MS)return null;
  const type=ALLOWED_TYPES.has(String(value.type))?String(value.type):'general';
  const id=cleanText(value.id,120),title=cleanText(value.title,90);
  if(!id||!title)return null;
  return {id,type,at,title,body:cleanText(value.body,220),tag:cleanText(value.tag,80)||`marevo-${type}`,url:cleanText(value.url,240)||'./'};
}
function cleanMessageIds(values){
  if(!Array.isArray(values))return [];
  return [...new Set(values.map(v=>cleanText(v,160)).filter(v=>v.startsWith('msg_'))) ].slice(0,64);
}
function qstashClient(token){return new Client({token});}
async function cancelMessages(client,ids){
  if(!ids.length)return;
  await Promise.allSettled(ids.map(id=>client.messages.cancel(id)));
}
async function publishReminder(client,reminder,subscription,deliveryUrl,deliveryKey){
  const delaySeconds=Math.max(1,Math.ceil((reminder.at-Date.now())/1000));
  const result=await client.publishJSON({
    url:deliveryUrl,
    body:{subscription,reminder},
    headers:{'X-Marevo-Delivery-Key':deliveryKey},
    delay:delaySeconds,
    retries:1,
    label:`marevo-${reminder.type}`
  });
  return result?.messageId||null;
}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  const allowedOrigin=process.env.MAREVO_ALLOWED_ORIGIN||DEFAULT_ORIGIN;
  if(req.headers.origin!==allowedOrigin)return res.status(403).json({error:'origin_not_allowed'});

  const token=process.env.QSTASH_TOKEN,deliveryKey=process.env.MAREVO_DELIVERY_KEY;
  if(!token||!deliveryKey)return res.status(503).json({error:'push_not_configured'});

  const body=parseBody(req);
  if(!validSubscription(body.subscription))return res.status(400).json({error:'invalid_subscription'});

  const client=qstashClient(token);
  const cancelIds=cleanMessageIds(body.cancelMessageIds);
  await cancelMessages(client,cancelIds);

  const now=Date.now();
  const rawReminders=(Array.isArray(body.reminders)?body.reminders:[]).slice(0,32);
  const reminders=rawReminders.map(v=>cleanReminder(v,now)).filter(Boolean);
  const skipped=Math.max(0,rawReminders.length-reminders.length);
  const protocol=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();
  const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();
  const deliveryUrl=`${protocol}://${host}/api/deliver`;
  const messageIds=[];
  const failures=[];

  for(const reminder of reminders){
    try{
      const id=await publishReminder(client,reminder,body.subscription,deliveryUrl,deliveryKey);
      if(id)messageIds.push(id);
      else failures.push({id:reminder.id,error:'missing_message_id'});
    }catch(error){
      const detail=cleanText(error?.message||'unknown_error',180);
      console.error('[MAREVO push] QStash reminder failed',reminder.id,detail);
      failures.push({id:reminder.id,error:detail});
    }
  }

  if(reminders.length&&messageIds.length===0){
    return res.status(502).json({
      error:'scheduling_failed',
      detail:failures[0]?.error||'no_message_scheduled',
      failed:failures.length,
      skipped
    });
  }

  return res.status(200).json({
    scheduled:messageIds.length,
    messageIds,
    failed:failures.length,
    skipped
  });
}
