const DEFAULT_ORIGIN='https://juancpa99.github.io';

function cors(req,res){
  const allowedOrigin=String(process.env.MAREVO_ALLOWED_ORIGIN||DEFAULT_ORIGIN).trim()||DEFAULT_ORIGIN;
  res.setHeader('Access-Control-Allow-Origin',allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
  return allowedOrigin
}
function parseBody(req){
  if(req.body&&typeof req.body==='object')return req.body;
  try{return JSON.parse(req.body||'{}')}catch{return {}}
}
function nullableNumber(){return {anyOf:[{type:'number'},{type:'null'}]}}
function nutrientProperties(){
  return {
    energyKcal:nullableNumber(),
    protein:nullableNumber(),
    carbs:nullableNumber(),
    fat:nullableNumber(),
    saturatedFat:nullableNumber(),
    transFat:nullableNumber(),
    monounsaturatedFat:nullableNumber(),
    polyunsaturatedFat:nullableNumber(),
    sugars:nullableNumber(),
    addedSugars:nullableNumber(),
    fiber:nullableNumber(),
    salt:nullableNumber(),
    sodiumMg:nullableNumber()
  }
}
const nutrientKeys=Object.keys(nutrientProperties());
const labelSchema={
  type:'object',additionalProperties:false,
  required:['kind','name','brand','category','referenceBasis','unitName','unitWeight','unitWeightUnit','confidence','warnings',...nutrientKeys],
  properties:{
    kind:{type:'string',enum:['label']},
    name:{type:'string'},
    brand:{type:'string'},
    category:{type:'string',enum:['Carbohidrato','Proteína','Verdura','Fruta','Lácteo','Suplemento','Extra']},
    referenceBasis:{type:'string',enum:['100g','100ml','serving']},
    unitName:{type:'string'},
    unitWeight:nullableNumber(),
    unitWeightUnit:{type:'string',enum:['g','ml','']},
    confidence:{type:'number',minimum:0,maximum:1},
    warnings:{type:'array',items:{type:'string'}},
    ...nutrientProperties()
  }
};
const mealSchema={
  type:'object',additionalProperties:false,
  required:['kind','name','portionDescription','confidence','assumptions',...nutrientKeys],
  properties:{
    kind:{type:'string',enum:['meal']},
    name:{type:'string'},
    portionDescription:{type:'string'},
    confidence:{type:'number',minimum:0,maximum:1},
    assumptions:{type:'array',items:{type:'string'}},
    ...nutrientProperties()
  }
};
function outputText(data){
  if(typeof data?.output_text==='string'&&data.output_text.trim())return data.output_text;
  for(const item of data?.output||[]){
    for(const part of item?.content||[]){
      if(typeof part?.text==='string'&&part.text.trim())return part.text
    }
  }
  return ''
}
function labelPrompt(){
  return `Extract the nutrition facts visible in this product photo. Prefer values per 100 g or per 100 ml when shown. If only serving values are visible, use referenceBasis="serving". Do not infer missing nutrients as zero. Return null when saturated fat, trans fat, added sugars, fiber, salt, sodium, mono- or polyunsaturated fat are not explicitly declared. If a serving or unit such as a slice is shown with its weight, return unitName and unitWeight. If the unit is mentioned but its weight is not visible, return the unit name and null weight. Energy is secondary; preserve it when visible. For added sugars, only return a numeric value when explicitly quantified. Warnings should be short and only mention ambiguity or missing critical data. Respond in Spanish for names and warnings.`
}
function mealPrompt(){
  return `Estimate the nutrition of the entire food or drink visible in this photo as one consumed serving. This is a one-off diary estimate, not a reusable food label. Estimate protein, carbohydrates, fat and energy. Only estimate saturated fat, trans fat, sugars, added sugars, fiber, salt, sodium or unsaturated fats when visually defensible; otherwise return null. Be conservative and list the main portion-size assumptions. Do not claim exactness. Respond in Spanish.`
}

export default async function handler(req,res){
  const allowedOrigin=cors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  if(req.headers.origin!==allowedOrigin)return res.status(403).json({error:'origin_not_allowed'});
  const apiKey=String(process.env.OPENAI_API_KEY||'').trim();
  if(!apiKey)return res.status(503).json({error:'nutrition_scan_not_configured'});
  const body=parseBody(req),mode=body.mode==='meal'?'meal':'label',image=String(body.imageDataUrl||'');
  if(!/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(image)||image.length>3_800_000){
    return res.status(400).json({error:'invalid_image'})
  }
  const schema=mode==='meal'?mealSchema:labelSchema;
  const name=mode==='meal'?'marevo_meal_photo':'marevo_nutrition_label';
  const prompt=mode==='meal'?mealPrompt():labelPrompt();
  try{
    const response=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:String(process.env.OPENAI_NUTRITION_MODEL||'gpt-6-astra'),
        input:[{role:'user',content:[
          {type:'input_text',text:prompt},
          {type:'input_image',image_url:image,detail:'high'}
        ]}],
        text:{format:{type:'json_schema',name,strict:true,schema}},
        max_output_tokens:1600
      })
    });
    const data=await response.json();
    if(!response.ok){
      console.error('[MAREVO nutrition scan]',response.status,data?.error?.message||data);
      return res.status(502).json({error:'analysis_failed'})
    }
    const text=outputText(data);
    if(!text)return res.status(502).json({error:'empty_analysis'});
    return res.status(200).json(JSON.parse(text))
  }catch(error){
    console.error('[MAREVO nutrition scan]',error?.message||error);
    return res.status(502).json({error:'analysis_failed'})
  }
}
