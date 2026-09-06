// Numeric guard for report summaries: missing values must stay missing, not become zero.
sep26SafeNumber=function(value){
  if(value===null||value===undefined||value==="")return null;
  const n=+value;
  return Number.isFinite(n)?n:null;
};
renderAll();
