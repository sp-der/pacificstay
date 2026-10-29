import fs from "node:fs";
const urls=[
 "https://pacficstayproperties.holidayfuture.com/",
 "https://pacficstayproperties.holidayfuture.com/listings/591608",
 "https://pacificstayproperties.holidayfuture.com/",
 "https://pacificstayproperties.holidayfuture.com/listings/591608",
];
for (const url of urls) {
 try{
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
   const r=await fetch(url,{redirect:"follow",signal:controller.signal,headers:{"User-Agent":"Mozilla/5.0 (compatible; PacificStaySiteHealth/1.0)"}});
   const body=(await r.text()).slice(0,60000);
   const title=body.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "(none)";
   console.log(JSON.stringify({url,status:r.status,finalUrl:r.url,title,bodyLength:body.length,mentionsBookingEngineNotFound:/no booking engine found|no booking website|not found/i.test(body)}));
  }finally{clearTimeout(timeout)}
 }catch(e){console.log(JSON.stringify({url,error:String(e).slice(0,240)}))}
}
const cfg=fs.readFileSync("lib/supabaseConfig.ts","utf8");
const host=cfg.match(/https:\/\/[a-z0-9-]+\.supabase\.co/)?.[0];
const apikey=cfg.match(/sb_publishable_[A-Za-z0-9_-]+/)?.[0];
if(!host || !apikey) {console.log("Public Supabase configuration unavailable");process.exit(0)}
for(const slug of ["casa-del-cactus","beach-baby-oceanfront-escape","chestnut-by-the-sea"]){
 try{
  const url=host+"/rest/v1/properties?select=slug,name,active,base_nightly_rate,weekend_nightly_rate,cleaning_fee,tax_rate,min_nights,max_nights&id=not.is.null&slug=eq."+encodeURIComponent(slug);
  const r=await fetch(url,{headers:{apikey}});
  const entries=r.ok?await r.json():[];
  console.log(JSON.stringify({property:slug,requestStatus:r.status,count:entries.length,publicConfig:entries.map(({slug,active,base_nightly_rate,weekend_nightly_rate,cleaning_fee,tax_rate,min_nights,max_nights})=>({slug,active,hasBaseRate:base_nightly_rate!==null,hasWeekendRate:weekend_nightly_rate!==null,hasCleaningFee:cleaning_fee!==null,hasTaxRate:tax_rate!==null,min_nights,max_nights}))}));
 }catch(e){console.log(JSON.stringify({property:slug,error:String(e).slice(0,180)}))}
}
