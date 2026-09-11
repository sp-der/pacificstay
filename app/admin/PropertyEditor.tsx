'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { getProperty } from '../properties/propertyData';
import { getPhotoTour } from '../properties/photoTourData';
import { ManagedProperty, propertySelect } from '../../lib/propertyContent';
import { SUPABASE_URL, supabaseHeaders } from '../../lib/supabaseConfig';
import styles from './admin.module.css';
const textFields = {location:'Location',area:'Area',tag:'Short headline',propertyType:'Property type',summary:'Short description',checkIn:'Check-in time',checkOut:'Checkout time',parking:'Parking',wifi:'Internet',access:'Check-in method (public information only)',locationCopy:'About the neighborhood',cancellationPolicy:'Cancellation policy'} as const;
const listFields = {description:'Full description (one paragraph per line)',highlights:'Highlights (one per line)',houseRules:'House rules (one per line)',safety:'Safety information (one per line)'} as const;
export default function PropertyEditor({token}:{token:string}) {
 const loaded = useRef(false);
 const [rows,setRows]=useState<ManagedProperty[]>([]),[draft,setDraft]=useState<ManagedProperty|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[dirty,setDirty]=useState(false);
 useEffect(()=>{if(loaded.current)return;let cancelled=false;fetch(`${SUPABASE_URL}/rest/v1/properties?select=${propertySelect}&order=name`,{headers:supabaseHeaders(token)}).then(async r=>{if(!r.ok)throw Error('Property editor unavailable. Please contact your website manager.');return r.json();}).then(data=>{if(!cancelled){loaded.current=true;setRows(data);if(data[0])select(data[0]);}}).catch(e=>{if(!cancelled)setMessage(e.message);});return()=>{cancelled=true;};},[token]);
 useEffect(()=>{if(!dirty)return;const prevent=(e:BeforeUnloadEvent)=>e.preventDefault();window.addEventListener('beforeunload',prevent);return()=>window.removeEventListener('beforeunload',prevent);},[dirty]);
 function select(row:ManagedProperty){const base=getProperty(row.slug);setDraft({...row,content:{...base,photoTour:getPhotoTour(row.slug)??[],...row.content}});setDirty(false);}
 function content(key:string,value:unknown){setDraft(d=>d?{...d,content:{...d.content,[key]:value}}:d);setDirty(true);}
 async function save(e:FormEvent){e.preventDefault();if(!draft)return;setBusy(true);setMessage('');try{
  const {id,slug,...values}=draft;void slug;
  const r=await fetch(`${SUPABASE_URL}/rest/v1/properties?id=eq.${id}&select=${propertySelect}`,{method:'PATCH',headers:{...supabaseHeaders(token),'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(values)});
  const data=await r.json();if(!r.ok||data.length!==1)throw Error('Could not save. Check your values and sign in again if your session expired.');
  setRows(rows.map(row=>row.id===id?data[0]:row));setDirty(false);setMessage('Saved. Your public listing and new booking estimates now use these changes.');
 }catch(e){setMessage(e instanceof Error?e.message:'Save failed.');}finally{setBusy(false);}}
 async function upload(file:File,sectionIndex:number){if(!draft)return;setBusy(true);setMessage('');try{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('Choose a JPG, PNG or WebP photo under 10 MB.');
  const path=`${draft.id}/${crypto.randomUUID()}.${file.type==='image/jpeg'?'jpg':file.type.split('/')[1]}`;
  const r=await fetch(`${SUPABASE_URL}/storage/v1/object/property-photos/${path}`,{method:'POST',headers:{...supabaseHeaders(token),'Content-Type':file.type},body:file});
  if(!r.ok)throw Error('Photo upload failed. Please try again.');
  const url=`${SUPABASE_URL}/storage/v1/object/public/property-photos/${path}`;
  const sections=[...(draft.content.photoTour??[])];sections[sectionIndex]={...sections[sectionIndex],images:[...sections[sectionIndex].images,url]};content('photoTour',sections);setMessage('Photo uploaded. Select Save changes to publish it.');
 }catch(e){setMessage(e instanceof Error?e.message:'Upload failed.');}finally{setBusy(false);}}
 if(!draft)return <section className={styles.panel}><h2>Property editor</h2><p role="status">{message||'Loading properties…'}</p></section>;
 return <form className={styles.panel} onSubmit={save}>
  <h2>Your property</h2><p>Edit the details below, then save. Existing approved reservation prices stay unchanged.</p>
  <label>Choose property<select disabled={busy} value={draft.id} onChange={e=>{if(dirty&&!window.confirm('Discard unsaved property changes?'))return;select(rows.find(r=>r.id===e.target.value)!);}}>{rows.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
  <fieldset disabled={busy} className={styles.editorFields}>
  <details open><summary>Property information & descriptions</summary>
  <label>Property name<input required minLength={2} maxLength={120} value={draft.name} onChange={e=>{setDraft({...draft,name:e.target.value});setDirty(true);}}/></label>
  {Object.entries(textFields).map(([key,label])=><label key={key}>{label}<textarea maxLength={6000} rows={key==='summary'||key==='cancellationPolicy'?3:2} value={String(draft.content[key as keyof typeof textFields]??'')} onChange={e=>content(key,e.target.value)}/></label>)}
  {Object.entries(listFields).map(([key,label])=><label key={key}>{label}<textarea rows={4} maxLength={20000} value={(draft.content[key as keyof typeof listFields]??[]).join('\n')} onChange={e=>content(key,e.target.value.split('\n'))}/></label>)}
  <div className={styles.formRow}>{(['bedrooms','beds','baths'] as const).map(key=><label key={key}>{key}<input type="number" min={0} max={30} step={key==='baths'?0.5:1} value={draft.content[key]??0} onChange={e=>content(key,Number(e.target.value))}/></label>)}</div>
  </details>
  <details><summary>Rates & booking limits</summary><p>USD. Nightly overrides below take priority. Confirm tax rates with your tax adviser before changing them.</p>
  {Object.entries({base_nightly_rate:'Default nightly rate ($)',weekend_nightly_rate:'Friday / Saturday nightly rate ($)',cleaning_fee:'Cleaning fee ($)',min_nights:'Minimum nights',max_nights:'Maximum nights',max_guests:'Maximum guests'}).map(([key,label])=><label key={key}>{label}<input required type="number" min={key.includes('nights')||key==='max_guests'?1:0} step={key.includes('rate')||key==='cleaning_fee'?'0.01':1} max={key==='max_guests'?30:key.includes('nights')?365:999999} value={draft[key as keyof ManagedProperty] as number??''} onChange={e=>{setDraft({...draft,[key]:Number(e.target.value)});setDirty(true);}}/></label>)}
  <label>Lodging tax & assessment (%)<input type="number" required min={0} max={100} step="0.001" value={Number(((draft.tax_rate??0)*100).toFixed(3))} onChange={e=>{setDraft({...draft,tax_rate:Number(e.target.value)/100});setDirty(true);}}/></label>
  </details>
  <details><summary>Amenities & sleeping arrangements</summary>
  {(draft.content.amenities??[]).map((g,i)=><div key={i}><label>Amenity group<input value={g.title} onChange={e=>content('amenities',draft.content.amenities!.map((v,j)=>j===i?{...v,title:e.target.value}:v))}/></label><label>Amenities (one per line)<textarea rows={4} value={g.items.join('\n')} onChange={e=>content('amenities',draft.content.amenities!.map((v,j)=>j===i?{...v,items:e.target.value.split('\n')}:v))}/></label></div>)}
  <button type="button" onClick={()=>content('amenities',[...(draft.content.amenities??[]),{title:'New group',items:[]}])}>Add amenity group</button>
  {(draft.content.sleeping??[]).map((room,i)=><div key={i}>{(['room','bed','note'] as const).map(key=><label key={key}>{key}<input value={room[key]} onChange={e=>content('sleeping',draft.content.sleeping!.map((v,j)=>j===i?{...v,[key]:e.target.value}:v))}/></label>)}</div>)}
  </details>
  <details><summary>Property photos</summary><p>Add photos to a room, choose the cover and up to three preview photos. Removing a photo here removes it from the tour when you save.</p>
  <img className={styles.coverPreview} src={draft.content.heroImage} alt="Current cover"/>
  {(draft.content.photoTour??[]).map((section,i)=><section key={section.id}><h3>{section.label}</h3><label>Add photo to {section.label}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f,i);e.target.value='';}}/></label>
   <div className={styles.photoGrid}>{section.images.map((url,j)=><div key={url}><img src={url} alt={`${section.label} ${j+1}`}/><button type="button" onClick={()=>content('heroImage',url)}>Use as cover</button><button type="button" onClick={()=>content('gallery',[...(draft.content.gallery??[]).filter(v=>v!==url),url].slice(-3))}>Use in preview</button><button type="button" disabled={j===0} onClick={()=>{const images=[...section.images];[images[j-1],images[j]]=[images[j],images[j-1]];content('photoTour',draft.content.photoTour!.map((v,k)=>k===i?{...v,images,thumbnail:images[0]}:v));}}>Move earlier</button><button type="button" disabled={url===draft.content.heroImage} onClick={()=>{const images=section.images.filter(v=>v!==url);setDraft({...draft,content:{...draft.content,gallery:draft.content.gallery?.filter(v=>v!==url),photoTour:draft.content.photoTour!.map((v,k)=>k===i?{...v,images,thumbnail:images[0]??''}:v)}});setDirty(true);}}>Remove from listing</button></div>)}</div>
  </section>)}
  </details>
  </fieldset>
  <div className={styles.editorSave}><button className={styles.primaryButton} disabled={busy||!dirty}>{busy?'Working…':'Save changes'}</button><a href={`/properties/${draft.slug}`} target="_blank" rel="noreferrer">View public listing ↗</a><span role="status">{message|| (dirty?'Unsaved changes':'')}</span></div>
 </form>;
}
