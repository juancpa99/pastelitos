const DEFAULT_ORIGIN='https://juancpa99.github.io';
const MAX_HORIZON_MS=9*24*60*60*1000;
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
function qstashBase(){return String(process.env.QSTASH_URL||'https://qstash.upstash.io').replace(/\/$/,'');}

async function cancelMessage(id,token){
  try{await fetch(`${qstashBase()}/v2/messages/${encodeURIComponent(id)}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});}catch(error){}
}
async function publishReminder(reminder,subscription,token,deliveryUrl,deliveryKey){
  const response=await fetch(`${qstashBase()}/v2/publish/${encodeURIComponent(deliveryUrl)}`,{
    method:'POST',
    headers:{
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json',
      'Upstash-Not-Before':String(Math.floor(reminder.at/1000)),
      'Upstash-Retries':'1',
      'Upstash-Label':`marevo-${reminder.type}`,
      'Upstash-Forward-X-Marevo-Delivery-Key':deliveryKey,
      'Upstash-Redact-Fields':'body, headers'
    },
    body:JSON.stringify({subscription,reminder})
  });
  if(!response.ok)throw new Error(`QStash ${response.status}`);
  const data=await response.json();
  return data.messageId||null;
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

  const cancelIds=cleanMessageIds(body.cancelMessageIds);
  await Promise.all(cancelIds.map(id=>cancelMessage(id,token)));

  const now=Date.now();
  const reminders=(Array.isArray(body.reminders)?body.reminders:[]).slice(0,32).map(v=>cleanReminder(v,now)).filter(Boolean);
  const protocol=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();
  const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();
  const deliveryUrl=`${protocol}://${host}/api/deliver`;
  const messageIds=[];

  try{
    for(const reminder of reminders){
      const id=await publishReminder(reminder,body.subscription,token,deliveryUrl,deliveryKey);
      if(id)messageIds.push(id);
    }
  }catch(error){
    await Promise.all(messageIds.map(id=>cancelMessage(id,token)));
    return res.status(502).json({error:'scheduling_failed'});
  }
  return res.status(200).json({scheduled:messageIds.length,messageIds});
}
