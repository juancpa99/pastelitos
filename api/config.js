import {originAllowed,setCors} from './_marevo-push.js';

export default function handler(req,res){
  setCors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  if(!originAllowed(req))return res.status(403).json({error:'Origin not allowed'});
  const publicKey=process.env.VAPID_PUBLIC_KEY;
  if(!publicKey)return res.status(503).json({error:'Push is not configured'});
  return res.status(200).json({publicKey});
}
