import crypto from 'node:crypto';

export const DEFAULT_QSTASH_URL='https://qstash-eu-central-1.upstash.io';
export const MAX_REMINDERS=32;
export const MAX_HORIZON_MS=10*24*60*60*1000;

const ALLOWED_ORIGINS=new Set([
  'https://juancpa99.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);

export function setCors(req,res){
  const origin=String(req.headers.origin||'');
  if(ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
}

export function originAllowed(req){
  const origin=String(req.headers.origin||'');
  return !origin||ALLOWED_ORIGINS.has(origin);
}

export function parseBody(req){
  if(req.body&&typeof req.body==='object')return req.body;
  if(typeof req.body==='string'){
    try{return JSON.parse(req.body);}catch(error){return null;}
  }
  return null;
}

export function validSubscription(subscription){
  if(!subscription||typeof subscription!=='object')return false;
  if(typeof subscription.endpoint!=='string'||subscription.endpoint.length<20||subscription.endpoint.length>4096)return false;
  const keys=subscription.keys;
  return !!(keys&&typeof keys.p256dh==='string'&&typeof keys.auth==='string'&&keys.p256dh.length>10&&keys.auth.length>5);
}

export function canonicalTag(type){
  const raw=String(type||'').toLowerCase();
  if(raw==='rest')return 'marevo-rest';
  if(raw==='workout')return 'marevo-workout';
  if(raw==='checkin')return 'marevo-checkin';
  if(raw==='body')return 'marevo-body';
  if(raw==='monthly')return 'marevo-monthly';
  if(raw==='breakfast')return 'marevo-breakfast';
  if(raw==='lunch')return 'marevo-lunch';
  if(raw==='snack')return 'marevo-snack';
  if(raw==='dinner')return 'marevo-dinner';
  if(raw==='post-workout')return 'marevo-post-workout';
  return 'marevo-general';
}

export function sanitizeReminder(item,now=Date.now()){
  if(!item||typeof item!=='object')return null;
  const at=Number(item.at);
  if(!Number.isFinite(at)||at<now+500||at>now+MAX_HORIZON_MS)return null;
  const type=String(item.type||'general').slice(0,32);
  const id=String(item.id||'').slice(0,120);
  const title=String(item.title||'MAREVO').slice(0,80);
  const body=String(item.body||'Tienes una tarea pendiente.').slice(0,220);
  const url=String(item.url||'./').slice(0,200);
  if(!id)return null;
  return {id,type,at,title,body,url,tag:canonicalTag(type)};
}

export function qstashUrl(){
  return String(process.env.QSTASH_URL||DEFAULT_QSTASH_URL).replace(/\/$/,'');
}

export function qstashHeaders(extra={}){
  const token=process.env.QSTASH_TOKEN;
  if(!token)throw new Error('QSTASH_TOKEN is not configured');
  return {Authorization:`Bearer ${token}`,...extra};
}

export function deliverySecret(){
  const value=process.env.DELIVERY_SECRET;
  if(!value)throw new Error('DELIVERY_SECRET is not configured');
  return value;
}

export function deliveryUrl(req){
  const host=String(req.headers['x-forwarded-host']||req.headers.host||'').trim();
  if(!host)throw new Error('Unable to determine deployment host');
  return `https://${host}/api/deliver`;
}

export function shortLabel(value){
  return String(value||'marevo').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,64);
}

export function subscriptionFingerprint(subscription){
  return crypto.createHash('sha256').update(String(subscription.endpoint||'')).digest('hex').slice(0,16);
}
