export default async function handler(req,res){
  const allowedOrigin=process.env.MAREVO_ALLOWED_ORIGIN||'https://juancpa99.github.io';
  res.setHeader('Access-Control-Allow-Origin',allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({error:'method_not_allowed'});
  if(!process.env.VAPID_PUBLIC_KEY)return res.status(503).json({error:'push_not_configured'});
  return res.status(200).json({publicKey:process.env.VAPID_PUBLIC_KEY});
}
