const DEFAULT_ORIGIN='https://juancpa99.github.io';
const FIELDS=[
  'code','product_name','brands','serving_size','serving_quantity',
  'nutrition_data_per','nutriments','categories_tags','ingredients_text'
].join(',');

function cors(req,res){
  const allowedOrigin=String(process.env.MAREVO_ALLOWED_ORIGIN||DEFAULT_ORIGIN).trim()||DEFAULT_ORIGIN;
  res.setHeader('Access-Control-Allow-Origin',allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','public, max-age=3600');
  return allowedOrigin
}
function cleanCode(value){
  const code=String(value||'').replace(/\D/g,'');
  return code.length>=8&&code.length<=14?code:''
}

export default async function handler(req,res){
  const allowedOrigin=cors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({error:'method_not_allowed'});
  if(req.headers.origin&&req.headers.origin!==allowedOrigin)return res.status(403).json({error:'origin_not_allowed'});
  const code=cleanCode(req.query?.code);
  if(!code)return res.status(400).json({error:'invalid_barcode'});
  const url='https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'.json?fields='+encodeURIComponent(FIELDS)+'&lc=es&cc=es';
  try{
    const response=await fetch(url,{
      headers:{
        'Accept':'application/json',
        'User-Agent':'MAREVO/6.65 (https://juancpa99.github.io/pastelitos/training-lab/)'
      }
    });
    const data=await response.json();
    if(!response.ok)return res.status(response.status).json({error:'open_food_facts_error'});
    return res.status(200).json(data)
  }catch(error){
    console.error('[MAREVO Open Food Facts]',error?.message||error);
    return res.status(502).json({error:'open_food_facts_unavailable'})
  }
}
