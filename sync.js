/* Account partitions keep the original computer data untouched. */
(() => {
 'use strict';
 const keys=['chechu_creative_dashboard_v1','chechu_workspace_images_v1','chechu_armenia_finances_v1','chechu_armenia_tours_v1','joy_by_chechu_finances_v1','joy_by_chechu_prices_v1','joy_by_chechu_categories_v1','chechu_armenia_budgets_v1','chechu_armenia_budget_catalog_v1','chechu_armenia_places_notes_v1'];
 const canonical=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
 const equal=(a,b)=>canonical(a)===canonical(b);
 function mergeValue(base,local,remote,path,issues,prefer){
 if(equal(local,remote))return local;
 if(equal(local,base))return remote;
 if(equal(remote,base))return local;
 const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 if(object(local)&&object(remote)&&(object(base)||base===undefined)){
 return Object.fromEntries([...new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(remote)])].map(k=>[k,mergeValue(base?.[k],local[k],remote[k],path.concat(k),issues,prefer)]).filter(([,v])=>v!==undefined));
 }
 if(base===undefined&&Array.isArray(local)&&Array.isArray(remote))base=[];
 if(Array.isArray(base)&&Array.isArray(local)&&Array.isArray(remote)&&[...base,...local,...remote].every(x=>object(x)&&typeof x.id==='string')&&[base,local,remote].every(a=>new Set(a.map(x=>x.id)).size===a.length)){
 const bm=new Map(base.map(x=>[x.id,x])),lm=new Map(local.map(x=>[x.id,x])),rm=new Map(remote.map(x=>[x.id,x]));
 const common=base.map(x=>x.id).filter(id=>lm.has(id)&&rm.has(id)),order=a=>a.map(x=>x.id).filter(id=>common.includes(id));
 let first=remote,second=local;
 if(!equal(order(local),common)){if(!equal(order(remote),common)&&!equal(order(local),order(remote))){issues.push(path.concat('orden').join(' / '));if(prefer==='local'){first=local;second=remote}}else {first=local;second=remote}}
 const ids=[...new Set([...first,...second,...base].map(x=>x.id))];
 return ids.map(id=>mergeValue(bm.get(id),lm.get(id),rm.get(id),path.concat((lm.get(id)||rm.get(id)||bm.get(id)).title||(lm.get(id)||rm.get(id)||bm.get(id)).name||(lm.get(id)||rm.get(id)||bm.get(id)).concept||id),issues,prefer)).filter(x=>x!==undefined);
 }
 if(path.length===1&&['chechu_armenia_tours_v1','joy_by_chechu_categories_v1'].includes(path[0])&&[base,local,remote].every(a=>Array.isArray(a)&&a.every(x=>typeof x==='string'))){return [...new Set([...remote,...local])].filter(x=>{const b=base.includes(x),l=local.includes(x),r=remote.includes(x);return l===r?l:l===b?r:l})}
 issues.push(path.join(' / '));issues.details?.push({path,local,remote});return prefer==='remote'?remote:local;
 }
 function mergeSnapshots(base,local,remote,prefer){
 const issues=[],storage={};issues.details=[];
 for(const k of keys){
 const decode=s=>s===null?undefined:JSON.parse(s);
 const value=mergeValue(decode(base[k]),decode(local[k]),decode(remote[k]),[k],issues,prefer);
 storage[k]=value===undefined?null:JSON.stringify(value);
 }
 return {storage,issues,details:issues.details};
 }
 const sameSnapshot=(a,b)=>keys.every(k=>equal(a[k]===null?undefined:JSON.parse(a[k]),b[k]===null?undefined:JSON.parse(b[k])));

 const owner=localStorage.getItem('chechu_active_account')||'', prefix=owner?'chechu_account:'+owner+':':'';
 window.dashboardRefreshers=[];
 window.dashboardStore={getItem:k=>localStorage.getItem(prefix+k),setItem:(k,v)=>localStorage.setItem(prefix+k,v),removeItem:k=>localStorage.removeItem(prefix+k)};
 const snapshot=(p=prefix)=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(p+k)]));
 function valid(s){return s&&Object.keys(s).length===keys.length&&keys.every(k=>Object.hasOwn(s,k)&&(s[k]===null||typeof s[k]==='string')&&(s[k]===null||(()=>{try{JSON.parse(s[k]);return true}catch{return false}})()))}
 function backup(s,label){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({format:'chechu-full-backup-v1',createdAt:new Date().toISOString(),data:s},null,2)],{type:'application/json'}));a.download='chechu-'+label+'-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
 document.addEventListener('DOMContentLoaded',async()=>{
 const panel=document.createElement('section');panel.id='cloudPanel';panel.setAttribute('aria-label','Iniciar sesión');
 const style=document.createElement('style');style.textContent=`
 html:has(#cloudPanel:not([hidden])),body:has(#cloudPanel:not([hidden])){overflow:hidden!important}
 #cloudPanel{position:fixed;inset:0;z-index:99999;background:var(--bg,#f7fafd);overflow:auto;padding:clamp(24px,8vh,80px) 20px;color:var(--ink,#142c46);font:14px/1.6 'DM Sans',sans-serif}
 #cloudPanel .login-wrap{max-width:420px;margin:auto}#cloudPanel .login-brand{display:flex;align-items:center;gap:12px;margin-bottom:32px;font:800 15px Manrope,sans-serif}#cloudPanel .login-logo{width:42px;height:42px;border-radius:15px;background:var(--navy,#0c2d4c);color:#fff;display:grid;place-items:center;font-size:24px}
 #cloudPanel .login-card{background:var(--paper,#fff);border:1px solid var(--line,#dce7f1);border-radius:22px;padding:clamp(22px,5vw,32px);box-shadow:var(--shadow)}#cloudPanel h1{font:800 clamp(25px,4vw,32px)/1.2 Manrope,sans-serif;letter-spacing:-.03em;margin:0 0 12px}#cloudPanel p{color:var(--muted,#72859b);margin:0 0 24px}#cloudPanel label{display:grid;gap:7px;margin:16px 0;color:var(--ink,#142c46);font-weight:700;font-size:12px}#cloudPanel input{width:100%;min-width:0;box-sizing:border-box;border:1px solid var(--line,#dce7f1);border-radius:11px;padding:13px 14px;background:var(--paper,#fff);color:var(--ink,#142c46);font:400 16px 'DM Sans',sans-serif}#cloudPanel input:focus-visible{outline:3px solid #74b9da55}#cloudPanel .btn{width:100%;min-height:46px;margin-top:8px;white-space:normal}#cloudPanel #cloudStatus{font-size:12px;overflow-wrap:anywhere;margin:20px 0 0}#cloudPanel [hidden],#cloudTools[hidden]{display:none!important}
 .sync-settings h3{font:800 18px Manrope,sans-serif;margin-top:0}.sync-settings p{line-height:1.7;overflow-wrap:anywhere}.sync-settings .btn{min-height:44px;white-space:normal}.sync-settings details{margin-top:24px;border-top:1px solid var(--line);padding-top:16px}.sync-settings summary{cursor:pointer;font-weight:700;padding:8px 0}.sync-settings input[type=file]{width:100%;max-width:100%;font:inherit;margin-top:12px}.sync-settings .row{gap:10px}.sync-settings [hidden],.sync-review[hidden]{display:none!important}.sync-settings .sync-conflicts{padding:16px;background:#fff6e8;border-radius:12px;overflow-wrap:anywhere}.sync-review{position:relative;z-index:40;margin:0 auto;padding:12px 20px;background:#fff6e8;color:#694515;font:13px/1.6 'DM Sans',sans-serif}.sync-review button{margin-left:12px}.sync-settings .sync-conflicts ul{padding-left:20px}.sync-settings .sync-conflicts li{margin:10px 0}.sync-settings code{overflow-wrap:anywhere}
 @media(max-width:600px){.sync-settings .row{display:grid;grid-template-columns:1fr}.sync-settings .row .btn{width:100%}.sync-review button{display:block;margin:8px 0 0}}
 `;document.head.append(style);
 panel.innerHTML=`<div class="login-wrap"><div class="login-brand"><span class="login-logo" aria-hidden="true">◎</span>CHECHU / WORKSPACE</div><div class="login-card"><h1>Bienvenida a CHECHU</h1><p>Ingresá para continuar. Tus cambios se actualizan automáticamente.</p><form id="cloudLogin"><label for="cloudEmail">Email<input id="cloudEmail" type="email" autocomplete="username" inputmode="email" placeholder="tu@email.com" required></label><label for="cloudPassword">Contraseña<input id="cloudPassword" type="password" autocomplete="current-password" placeholder="Tu contraseña" minlength="8" required></label><button class="btn primary" type="submit">Ingresar</button><button class="btn" type="button" id="cloudRegister">Crear cuenta</button></form><p id="cloudStatus" role="status" aria-live="polite">Comprobando sesión…</p><button class="btn" type="button" id="cloudContinue" hidden>Seguir trabajando</button></div></div>`;
 const tools=document.createElement('section');tools.id='cloudTools';tools.className='panel sync-settings';tools.hidden=true;
 tools.innerHTML=`<h3>Tu cuenta</h3><button id="cloudSignIn" class="btn" type="button" data-cloud-login>Ingresar a mi cuenta</button><p data-sync-account class="muted"></p><p data-sync-status role="status" aria-live="polite">Comprobando conexión…</p><div id="cloudActions" hidden><button class="btn small" type="button" id="cloudLogout">Cerrar sesión</button></div><hr style="border:0;border-top:1px solid var(--line);margin:24px 0"><h3>Copia de seguridad</h3><p class="muted">Descargá una copia completa de tus tareas, finanzas, presupuestos, notas e imágenes cuando quieras.</p><button class="btn primary" type="button" id="cloudCurrent">↓ Descargar copia de seguridad</button><section id="cloudConflict" class="sync-conflicts" hidden><h3>Un cambio necesita tu atención</h3><p>El mismo dato se editó de dos maneras. Elegí cuál conservar. El resto de los cambios se combina automáticamente.</p><ul id="cloudConflictList"></ul><div class="row"><button class="btn" type="button" id="cloudChooseLocal">Usar lo de este dispositivo</button><button class="btn" type="button" id="cloudChooseRemote">Usar lo del otro dispositivo</button></div></section><details><summary>Recuperar datos anteriores</summary><p class="muted">Estas opciones son para recuperar información o realizar una primera migración.</p><div class="row"><button class="btn" type="button" id="cloudRecovery">Descargar copia de recuperación</button><button class="btn" type="button" id="cloudBackup">Descargar originales de esta computadora</button></div><p class="muted">Restaurar un respaldo completo en los datos originales de este navegador:</p><label for="cloudRestore">Seleccionar respaldo<input id="cloudRestore" type="file" accept="application/json,.json"></label><div class="row" style="margin-top:16px"><button class="btn" type="button" id="cloudMigrate">Importar originales de esta computadora</button><button class="btn" type="button" id="cloudLocal">Usar datos originales sin conexión</button></div></details><button id="cloudOpen" type="button" hidden>Abrir dashboard</button><button id="cloudPull" type="button" hidden>Descargar nube</button><button id="cloudPush" type="button" hidden>Guardar cambios</button>`;
 const notice=document.createElement('div');notice.className='sync-review';notice.hidden=true;notice.innerHTML=`Hay un cambio para revisar. Tus datos están conservados.<button type="button" class="btn small" data-page="settings">Revisar en Settings</button>`;
 document.body.append(panel,tools);document.body.prepend(notice);
 window.dashboardMountAccountSettings=()=>{const slot=document.getElementById('accountSettingsSlot');if(slot){slot.replaceChildren(tools);tools.hidden=false}};
 document.addEventListener('click',e=>{if(e.target.closest('[data-cloud-login]')){panel.hidden=false;$('cloudLogin').hidden=false}});
 const announce=()=>{};

 const editing=()=>{const focused=document.activeElement;if(focused?.matches('input,textarea,select,[contenteditable="true"]'))return true;return [...document.querySelectorAll('.modalback,form:not(#cloudLogin),#budgetEditor,#budgetDbPanel,.finEntry.open,#joyCategoryPanel')].some(n=>n.getClientRects().length>0)};
 const nodes=Object.fromEntries(['cloudSignIn','cloudLogin','cloudEmail','cloudPassword','cloudStatus','cloudContinue','cloudActions','cloudLogout','cloudCurrent','cloudConflict','cloudConflictList','cloudChooseLocal','cloudChooseRemote','cloudRecovery','cloudBackup','cloudRestore','cloudMigrate','cloudLocal','cloudOpen','cloudPull','cloudPush','cloudRegister'].map(id=>[id,document.getElementById(id)]));
 const $=id=>document.getElementById(id)||nodes[id];
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let statusText='Comprobando conexión…';
 const status=t=>{statusText=t;$('cloudStatus').textContent=t;document.querySelectorAll('[data-sync-status]').forEach(n=>n.textContent=t)};
 window.dashboardMountAccountSettings=()=>{const slot=document.getElementById('accountSettingsSlot');if(slot){slot.replaceChildren(tools);tools.hidden=false;document.querySelectorAll('[data-sync-status]').forEach(n=>n.textContent=statusText);document.querySelectorAll('[data-sync-account]').forEach(n=>n.textContent=user?.email||'Sin sesión iniciada')}};
 $('cloudContinue').onclick=()=>panel.hidden=true;
 
 $('cloudBackup').onclick=()=>backup(snapshot(''),'original');$('cloudCurrent').onclick=()=>backup(snapshot(),'actual');
 $('cloudLocal').onclick=()=>{sessionStorage.setItem('chechu_local_mode','1');if(owner){localStorage.removeItem('chechu_active_account');location.reload()}else panel.hidden=true};
 $('cloudRestore').onchange=async e=>{try{if(owner)throw Error('Para restaurar un respaldo, elegí primero los datos locales originales.');const f=e.target.files[0];if(!f)return;const b=JSON.parse(await f.text());if(b.format!=='chechu-full-backup-v1'||!valid(b.data))throw Error('Respaldo incompatible.');backup(snapshot(''),'antes-de-restaurar');if(!confirm('¿Restaurar este respaldo en los datos locales originales? No modifica la nube.'))return;for(const k of keys){if(b.data[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,b.data[k])}location.reload()}catch(e){status(e.message)}};
 let client,user,busy=false,baseline=null,lastSaved='',ready=false,pendingConflict=null;
 panel.hidden=!!owner||sessionStorage.getItem('chechu_local_mode')==='1';
 const dirty=()=>baseline&&(!valid(snapshot())||!sameSnapshot(snapshot(),baseline.data));
 const metaKey=()=>prefix+'cloud_baseline';
 async function read(){const {data,error}=await client.from('dashboard_data').select('data,updated_at').eq('user_id',user.id).maybeSingle();if(error)throw error;return data}
 function adopt(s){if(!valid(s))throw Error('Formato de nube incompatible. No se cambió ningún dato.');backup(snapshot(),'antes-de-descargar');for(const k of keys){if(s[k]===null)localStorage.removeItem(prefix+k);else localStorage.setItem(prefix+k,s[k])}}
 function autoReceive(row,force=false){
 if(!force&&(document.hidden||editing()))return false;
 const previous=snapshot(),oldMeta=localStorage.getItem(metaKey()),oldBaseline=baseline,oldSaved=lastSaved;
 // A durable recovery copy is saved before any working data is replaced.
 if(!force)localStorage.setItem(prefix+'cloud_previous',JSON.stringify({createdAt:new Date().toISOString(),data:previous,revision:baseline?.revision}));
 try{for(const k of keys){if(row.data.storage[k]===null)localStorage.removeItem(prefix+k);else localStorage.setItem(prefix+k,row.data.storage[k])}remember(row,row.data.storage);for(const refresh of window.dashboardRefreshers)refresh();}
 catch(e){baseline=oldBaseline;lastSaved=oldSaved;for(const k of keys){if(previous[k]===null)localStorage.removeItem(prefix+k);else localStorage.setItem(prefix+k,previous[k])}if(oldMeta===null)localStorage.removeItem(metaKey());else localStorage.setItem(metaKey(),oldMeta);for(const refresh of window.dashboardRefreshers)refresh();throw e}
 status('Sincronizado automáticamente · '+new Date().toLocaleTimeString());announce('☁ Cuenta');return true;
 }
 function showConflict(row){
 pendingConflict=row;ready=false;panel.hidden=true;notice.hidden=false;
 $('cloudConflict').hidden=false;
 const result=mergeSnapshots(baseline.data,snapshot(),row.data.storage);
 const labels={chechu_creative_dashboard_v1:'Tareas y objetivos',chechu_workspace_images_v1:'Imágenes',chechu_armenia_finances_v1:'Finanzas Armenia',chechu_armenia_tours_v1:'Tours',joy_by_chechu_finances_v1:'Finanzas JOY',joy_by_chechu_prices_v1:'Precios JOY',joy_by_chechu_categories_v1:'Categorías JOY',chechu_armenia_budgets_v1:'Presupuestos',chechu_armenia_budget_catalog_v1:'Catálogo de presupuestos',chechu_armenia_places_notes_v1:'Notas de lugares'};
 const fields={amount:'importe',rate:'cotización',title:'título',status:'estado',date:'fecha',name:'nombre',notes:'notas',people:'pasajeros',days:'días',tasks:'tareas',goals:'objetivos',data:'datos'};
 const describe=p=>p.map((v,i)=>i===0?(labels[v]||v):(fields[v]||v)).join(' · ');
 const value=v=>v===undefined?'Eliminado':typeof v==='string'?v:JSON.stringify(v);
 $('cloudConflictList').innerHTML=result.details.map(d=>'<li><strong>'+escape(describe(d.path))+'</strong><br>Este dispositivo: '+escape(value(d.local))+'<br>Otro dispositivo: '+escape(value(d.remote))+'</li>').join('')||result.issues.map(p=>'<li>'+escape(describe(p.split(' / ')))+'</li>').join('');
 status('Hay un cambio para revisar en Settings. Los demás datos están conservados.');
 }
 async function recoveryStorage(value){
 const key=owner||'original';
 if(typeof indexedDB==='undefined'){if(value)localStorage.setItem(prefix+'cloud_recovery',JSON.stringify(value));return JSON.parse(localStorage.getItem(prefix+'cloud_recovery')||'null')}
 const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('chechu-recovery',1);request.onupgradeneeded=()=>request.result.createObjectStore('copies');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
 try{return await new Promise((resolve,reject)=>{const tx=db.transaction('copies',value?'readwrite':'readonly'),store=tx.objectStore('copies');const request=value?store.put(value,key):store.get(key);let result;request.onsuccess=()=>result=request.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('No se pudo guardar la copia de recuperación.'))})}finally{db.close()}
 }
 async function preserve(local,remote){await recoveryStorage({createdAt:new Date().toISOString(),local,remote:remote.data.storage,revision:remote.updated_at})}
 async function reconcile(row,prefer){
 if(document.hidden||editing())return false;
 if(!baseline){autoReceive(row,true);return true}
 const current=snapshot(),result=mergeSnapshots(baseline.data,current,row.data.storage,prefer);
 if(result.issues.length&&!prefer){showConflict(row);return false}
 await preserve(current,row);
 if(sameSnapshot(result.storage,row.data.storage)){autoReceive(row,true);pendingConflict=null;notice.hidden=true;$('cloudConflict').hidden=true;ready=true;return true}
 const {data,error}=await client.rpc('save_dashboard_checked',{payload:{format:'chechu-sync-v1',storage:result.storage},expected_updated_at:row.updated_at});
 if(error)throw error;
 if(!data){status('Actualizando…');ready=true;return false}
 // An edit during the request is merged against the snapshot that was sent on the next check.
 if(!sameSnapshot(snapshot(),current)){ready=true;return false}
 autoReceive({data:{format:'chechu-sync-v1',storage:result.storage},updated_at:data},true);
 pendingConflict=null;notice.hidden=true;$('cloudConflict').hidden=true;ready=true;return true;
 }
 $('cloudChooseLocal').onclick=()=>resolveChoice('local');$('cloudChooseRemote').onclick=()=>resolveChoice('remote');
 async function resolveChoice(prefer){if(busy||!pendingConflict)return;busy=true;try{const row=await read();if(!row||row.updated_at!==pendingConflict.updated_at){if(row)showConflict(row);status('Hubo otro cambio. Revisá las opciones de nuevo.');return}await reconcile(row,prefer)}catch(e){status('No se pudo actualizar. Tus datos se conservan: '+e.message)}finally{busy=false}}
 $('cloudRecovery').onclick=async()=>{try{const r=await recoveryStorage()||JSON.parse(localStorage.getItem(prefix+'cloud_recovery')||localStorage.getItem(prefix+'cloud_previous')||'null');if(!r){status('Todavía no hay una copia anterior para recuperar.');return}backup(r.local||r.data,'recuperacion-este-dispositivo');if(r.remote)backup(r.remote,'recuperacion-otro-dispositivo')}catch(e){status(e.message)}};
  function remember(row,s){localStorage.setItem(metaKey(),JSON.stringify({revision:row.updated_at,data:s}));baseline={revision:row.updated_at,data:s};lastSaved=JSON.stringify(s)}
 async function push(initial=false){if(!ready||!user||busy) return;busy=true;try{
 const s=snapshot();if(!valid(s))throw Error('Hay datos locales inválidos. Descargá un respaldo.');
 if(!initial&&(!baseline||!dirty()))return;
 const {data,error}=await client.rpc('save_dashboard_checked',{payload:{format:'chechu-sync-v1',storage:s},expected_updated_at:initial?null:baseline.revision});
 if(error)throw error;if(!data){const row=await read();if(row)await reconcile(row);return;}
 remember({updated_at:data},s);status('Sincronizado · '+new Date().toLocaleTimeString());return true;
 }catch(e){if(initial)ready=false;status('No se pudo sincronizar. Tus cambios siguen guardados aquí. Se reintentará: '+e.message)}finally{busy=false}}
 try{
 const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.95.3');
 client=createClient('https://tualpjxsvnjrpesgfueq.supabase.co','sb_publishable_2-R03WSpHACWUX_Cuz937g_GdSRDBJY');
 if(sessionStorage.getItem('chechu_local_mode')==='1'){panel.hidden=true;status('Modo local original. Ingresá de nuevo para conectar la nube.')}
 const {data,error}=await client.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;user=data.user;
 async function authenticated(){if(!user||sessionStorage.getItem('chechu_local_mode')==='1')return; if(owner!==user.id){localStorage.setItem('chechu_active_account',user.id);location.reload();return}
 $('cloudLogin').hidden=true;$('cloudActions').hidden=false;$('cloudSignIn').hidden=true;
 try{baseline=JSON.parse(localStorage.getItem(metaKey()))}catch{}
 const row=await read();
 if(!row){panel.hidden=true;status('Todavía no hay datos compartidos. Importá los originales desde Settings en la computadora principal.');notice.hidden=false;notice.innerHTML='La primera carga se realiza desde la computadora principal.<button type="button" class="btn small" data-page="settings">Abrir Settings</button>';return}
 if(row.data?.format!=='chechu-sync-v1'||!valid(row.data.storage))throw Error('Datos de nube incompatibles; se conservaron sin cambios.');
 if(baseline&&valid(baseline.data)){lastSaved=JSON.stringify(baseline.data);ready=true;if(row.updated_at!==baseline.revision)await reconcile(row);else status('Todo actualizado.');panel.hidden=true;}
 else {await preserve(snapshot(),row);autoReceive(row,true);ready=true;panel.hidden=true;status('Todo actualizado.');}
 
 }
 $('cloudLogin').onsubmit=async e=>{e.preventDefault();try{const r=await client.auth.signInWithPassword({email:$('cloudEmail').value,password:$('cloudPassword').value});if(r.error)throw r.error;user=r.data.user;sessionStorage.removeItem('chechu_local_mode');await authenticated()}catch(e){status(e.message)}};
 $('cloudRegister').onclick=async()=>{if(!$('cloudLogin').reportValidity())return;const r=await client.auth.signUp({email:$('cloudEmail').value,password:$('cloudPassword').value});status(r.error?r.error.message:'Cuenta solicitada. Revisá el email de confirmación y después ingresá.');};
 $('cloudLogout').onclick=async()=>{ready=false;await client.auth.signOut();location.reload()};
 $('cloudOpen').onclick=()=>{if(ready)panel.hidden=true;else status('Primero descargá la nube o realizá la migración desde la computadora.')};
 $('cloudPull').onclick=async()=>{ready=false;try{const row=await read();if(!row||row.data?.format!=='chechu-sync-v1')throw Error('No hay copia compatible en nube.');if(!confirm('Se descargará un respaldo de este dispositivo y se reemplazará su copia de trabajo por la nube. ¿Continuar?'))return;adopt(row.data.storage);remember(row,row.data.storage);location.reload()}catch(e){status(e.message)}};
 $('cloudMigrate').onclick=async()=>{try{if(await read())throw Error('La nube ya tiene datos. No se permite sobrescribirla mediante migración.');const s=snapshot('');if(!s.chechu_creative_dashboard_v1)throw Error('No se encontraron datos originales. Realizá este paso en la computadora principal.');if(!valid(s))throw Error('El respaldo contiene datos inválidos.');backup(s,'migracion');if(!confirm('¿Confirmás que estos son los datos originales de la computadora principal y que guardaste el respaldo?'))return;for(const k of keys){if(s[k]===null)localStorage.removeItem(prefix+k);else localStorage.setItem(prefix+k,s[k])}ready=true;if(await push(true))location.reload()}catch(e){status(e.message)}};
 $('cloudPush').onclick=()=>push();await authenticated();if(!user){panel.hidden=sessionStorage.getItem('chechu_local_mode')==='1';status('Usá la misma cuenta en todos tus dispositivos.');}
 async function synchronize(){
 if(!ready||busy||document.hidden)return;
 if(dirty()){await push();return}
 busy=true;
 try{const row=await read();if(!row)throw Error('No se encontró la copia de nube.');
 if(row.data?.format!=='chechu-sync-v1'||!valid(row.data.storage))throw Error('Copia de nube incompatible.');
 if(!ready||document.hidden)return;
 if(row.updated_at!==baseline.revision){if(!await reconcile(row)&&ready)status('La actualización se aplicará al cerrar el formulario.');}
 }catch(e){status('No se pudo actualizar. Los datos locales se conservan. Se reintentará: '+e.message)}finally{busy=false}
 }
 setInterval(synchronize,5000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)synchronize()});
 window.addEventListener('online',synchronize);
 window.addEventListener('pageshow',synchronize);
 }catch(e){status('No se pudo conectar. Tus datos se conservan en este dispositivo.');$('cloudContinue').hidden=false;if(owner)panel.hidden=true;window.addEventListener('online',()=>{if(!editing())location.reload()});}
 });
})();

