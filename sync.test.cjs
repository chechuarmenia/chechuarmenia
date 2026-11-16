const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/sync.js','utf8').replace("await import('https://esm.sh/@supabase/supabase-js@2.95.3')",'mockSdk');
async function device({owner='a',session='a',row=null,localMode=false}={}) {
 const values=new Map(owner?[['chechu_active_account',owner]]:[]),sessionValues=new Map(localMode?[['chechu_local_mode','1']]:[]),elements=new Map();
 const storage=m=>({getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)});
 let boot,tick,reloads=0,writes=0,remote=row;
 const element=()=>({style:'',hidden:false,value:'',click(){},reportValidity(){return true},set innerHTML(v){for(const m of v.matchAll(/id="([^"]+)"/g))elements.set(m[1],element())}});
 const client={auth:{getUser:async()=>({data:{user:session?{id:session,email:'test@example.invalid'}:null}}),signInWithPassword:async()=>({data:{user:{id:session,email:'test@example.invalid'}}}),signOut:async()=>({})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:remote})})})}),rpc:async(_,args)=>{writes++;if((remote?.updated_at??null)!==args.expected_updated_at)return {data:null};remote={data:args.payload,updated_at:'revision-'+writes};return {data:remote.updated_at}}};
 const ctx={localStorage:storage(values),sessionStorage:storage(sessionValues),window:{},document:{hidden:false,body:{append(){}},createElement:element,getElementById:id=>elements.get(id),addEventListener:(_,fn)=>boot=fn},Blob,URL:{createObjectURL:()=>'',revokeObjectURL(){}},setTimeout(){},setInterval:fn=>tick=fn,confirm:()=>true,location:{reload:()=>reloads++},mockSdk:{createClient:()=>client}};
 vm.runInNewContext(source,ctx);await boot();
 return {values,elements,ctx,tick:()=>tick?.(),writes:()=>writes,remote:()=>remote,changeRemote:r=>remote=r,reloads:()=>reloads};
}
(async()=>{
 const mobile=await device();await mobile.tick();assert.equal(mobile.writes(),0,'An empty mobile must never upload automatically');
 await mobile.elements.get('cloudMigrate').onclick();assert.equal(mobile.writes(),0,'Missing computer originals must block migration');
 const pc=await device();const original=JSON.stringify({tasks:[{title:'Original task'}],goals:[]});pc.values.set('chechu_creative_dashboard_v1',original);
 await pc.elements.get('cloudMigrate').onclick();assert.equal(pc.writes(),1);assert.equal(pc.values.get('chechu_creative_dashboard_v1'),original,'Migration must preserve original storage');assert.equal(pc.remote().data.storage.chechu_creative_dashboard_v1,original);assert.equal(Object.keys(pc.remote().data.storage).length,10);
 const existing=await device({row:pc.remote()});existing.values.set('chechu_creative_dashboard_v1',original);await existing.elements.get('cloudMigrate').onclick();assert.equal(existing.writes(),0,'An existing cloud record must block migration');
 const resumed=await device();resumed.values.set('chechu_creative_dashboard_v1',original);await resumed.elements.get('cloudMigrate').onclick();resumed.ctx.window.dashboardStore.setItem('chechu_armenia_finances_v1','[{"amount":100}]');resumed.changeRemote({...resumed.remote(),updated_at:'other-device'});await resumed.tick();assert.equal(resumed.remote().updated_at,'other-device','Concurrent cloud version must survive');assert.match(resumed.elements.get('cloudStatus').textContent,/detenida/);
 const local=await device({owner:'',localMode:true});assert.equal(local.reloads(),0,'Local mode must not loop back into the signed-in account');
 console.log('PASS: empty mobile, explicit migration, full snapshot, original preservation, existing-cloud protection, concurrent conflict, local mode');
})().catch(e=>{console.error(e);process.exitCode=1});

