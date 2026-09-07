import {
  MAX_REMINDERS,
  deliverySecret,
  deliveryUrl,
  originAllowed,
  parseBody,
  qstashHeaders,
  qstashUrl,
  sanitizeReminder,
  setCors,
  shortLabel,
  subscriptionFingerprint,
  validSubscription
} from './_marevo-push.js';

async function cancelMessage(messageId){
  const response=await fetch(`${qstashUrl()}/v2/messages/${encodeURIComponent(messageId)}`,{
    method:'DELETE',
    headers:qstashHeaders()
  });
  if(response.ok||response.status===404)return true;
  throw new Error(`Unable to cancel QStash message ${messageId}: ${response.status}`);
}

async function scheduleMessage(req,subscription,reminder){
  const destination=deliveryUrl(req);
  const secret=deliverySecret();
  const response=await fetch(`${qstashUrl()}/v2/publish/${encodeURIComponent(destination)}`,{
    method:'POST',
    headers:qstashHeaders({
      'Content-Type':'application/json',
      'Upstash-Method':'POST',
      'Upstash-Retries':'2',
      'Upstash-Not-Before':String(Math.floor(reminder.at/1000)),
      'Upstash-Forward-Authorization':`Bearer ${secret}`,
      'Upstash-Redact-Fields':'body',
      'Upstash-Label':shortLabel(`marevo-${reminder.type}`)
    }),
    body:JSON.stringify({subscription,reminder})
  });
  if(!response.ok){
    const detail=await response.text().catch(()=>"");
    throw new Error(`QStash publish failed (${response.status}): ${detail.slice(0,200)}`);
  }
  const payload=await response.json();
  if(!payload?.messageId)throw new Error('QStash did not return a messageId');
  return payload.messageId;
}

export default async function handler(req,res){
  setCors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!originAllowed(req))return res.status(403).json({error:'Origin not allowed'});

  const body=parseBody(req);
  if(!body||!validSubscription(body.subscription))return res.status(400).json({error:'Invalid push subscription'});

  const cancelMessageIds=Array.isArray(body.cancelMessageIds)
    ? [...new Set(body.cancelMessageIds.map(String).filter(Boolean))].slice(0,64)
    : [];
  const inputReminders=Array.isArray(body.reminders)?body.reminders.slice(0,MAX_REMINDERS):[];
  const now=Date.now();
  const reminders=inputReminders.map(item=>sanitizeReminder(item,now)).filter(Boolean);

  try{
    await Promise.allSettled(cancelMessageIds.map(cancelMessage));
    const messageIds=await Promise.all(reminders.map(item=>scheduleMessage(req,body.subscription,item)));
    return res.status(200).json({
      ok:true,
      scheduled:messageIds.length,
      messageIds,
      subscription:subscriptionFingerprint(body.subscription)
    });
  }catch(error){
    console.error('[MAREVO push] sync failed',error);
    return res.status(502).json({error:'Unable to schedule push reminders'});
  }
}
