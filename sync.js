/* Account partitions keep the original computer data untouched. */
(() => {
 'use strict';
 const keys=['chechu_creative_dashboard_v1','chechu_workspace_images_v1','chechu_armenia_finances_v1','chechu_armenia_tours_v1','joy_by_chechu_finances_v1','joy_by_chechu_prices_v1','joy_by_chechu_categories_v1','chechu_armenia_budgets_v1','chechu_armenia_budget_catalog_v1','chechu_armenia_places_notes_v1'];
 const owner=localStorage.getItem('chechu_active_account')||'', prefix=owner?'chechu_account:'+owner+':':'';
 window.dashboardRefreshers=[];
 window.dashboardStore={getItem:k=>localStorage.getItem(prefix+k),setItem:(k,v)=>localStorage.setItem(prefix+k,v),removeItem:k=>localStorage.removeItem(prefix+k)};
 const snapshot=(p=prefix)=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(p+k)]));
 function valid(s){return s&&Object.keys(s).length===keys.length&&keys.every(k=>Object.hasOwn(s,k)&&(s[k]===null||typeof s[k]==='string')&&(s[k]===null||(()=>{try{JSON.parse(s[k]);return true}catch{return false}})()))}
 function backup(s,label){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({format:'chechu-full-backup-v1',createdAt:new Date().toISOString(),data:s},null,2)],{type:'application/json'}));a.download='chechu-'+label+'-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
 document.addEventListener('DOMContentLoaded',async()=>{
 const panel=document.createElement('section');panel.id='cloudPanel';panel.style='position:fixed;inset:0;z-index:99999;background:#f4f7f1;color:#183328;overflow:auto;padding:24px;font:16px/1.5 system-ui';
 panel.innerHTML='<div style="max-width:650px;margin:auto"><h1>CHECHU · Cuenta y respaldo</h1><p id="cloudStatus" role="status">Comprobando conexión…</p><form id="cloudLogin"><label>Email <input id="cloudEmail" type="email" autocomplete="username" required></label><label>Contraseña <input id="cloudPassword" type="password" autocomplete="current-password" minlength="8" required></label><button>Ingresar</button><button type="button" id="cloudRegister">Crear cuenta</button></form><p>Usá la misma cuenta en la computadora y el celular. La primera migración se hace desde la computadora.</p><div id="cloudActions" hidden><button id="cloudOpen">Abrir dashboard</button> <button id="cloudPull">Descargar nube</button> <button id="cloudMigrate">Migrar datos originales de esta computadora</button> <button id="cloudPush">Guardar cambios en nube</button> <button id="cloudLogout">Cerrar sesión</button></div><hr><button id="cloudBackup">Descargar respaldo completo original</button> <button id="cloudCurrent">Respaldar este dashboard</button><p>Conservá el respaldo descargado antes de migrar. Los datos originales del navegador se mantienen.</p><label>Restaurar respaldo completo original <input id="cloudRestore" type="file" accept="application/json,.json"></label><button id="cloudLocal">Seguir con datos locales originales</button></div>';
 document.body.append(panel);
 document.addEventListener('click',e=>{if(e.target.closest('[data-cloud-open]'))panel.hidden=false});
 const announce=t=>{document.querySelectorAll('[data-cloud-open]').forEach(b=>{b.textContent=t;b.title=t})};
 const editing=()=>{const focused=document.activeElement;if(focused?.matches('input,textarea,select,[contenteditable="true"]'))return true;return [...document.querySelectorAll('.modalback,form:not(#cloudLogin),#budgetEditor,#budgetDbPanel,.finEntry.open,#joyCategoryPanel')].some(n=>n.getClientRects().length>0)};
 const $=id=>document.getElementById(id),status=t=>$('cloudStatus').textContent=t;
 $('cloudBackup').onclick=()=>backup(snapshot(''),'original');$('cloudCurrent').onclick=()=>backup(snapshot(),'actual');
 $('cloudLocal').onclick=()=>{sessionStorage.setItem('chechu_local_mode','1');if(owner){localStorage.removeItem('chechu_active_account');location.reload()}else panel.hidden=true};
 $('cloudRestore').onchange=async e=>{try{if(owner)throw Error('Para restaurar un respaldo, elegí primero los datos locales originales.');const f=e.target.files[0];if(!f)return;const b=JSON.parse(await f.text());if(b.format!=='chechu-full-backup-v1'||!valid(b.data))throw Error('Respaldo incompatible.');backup(snapshot(''),'antes-de-restaurar');if(!confirm('¿Restaurar este respaldo en los datos locales originales? No modifica la nube.'))return;for(const k of keys){if(b.data[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,b.data[k])}location.reload()}catch(e){status(e.message)}};
 let client,user,busy=false,baseline=null,lastSaved='',ready=false;
 const metaKey=()=>prefix+'cloud_baseline';
 async function read(){const {data,error}=await client.from('dashboard_data').select('data,updated_at').eq('user_id',user.id).maybeSingle();if(error)throw error;return data}
 function adopt(s){if(!valid(s))throw Error('Formato de nube incompatible. No se cambió ningún dato.');backup(snapshot(),'antes-de-descargar');for(const k of keys){if(s[k]===null)localStorage.removeItem(prefix+k);else localStorage.setItem(prefix+k,s[k])}}
 function autoReceive(row){
 if(document.hidden||editing())return false;
 const previous=snapshot(),oldMeta=localStorage.getItem(metaKey()),oldBaseline=baseline,oldSaved=lastSaved;
 // A durable recovery copy is saved before any working data is replaced.
 localStorage.setItem(prefix+'cloud_previous',JSON.stringify({createdAt:new Date().toISOString(),data:previous,baseline}));
 try{for(const k of keys){if(row.data.storage[k]===null)localStorage.removeItem(prefix+k);else localStorage.setItem(prefix+k,row.data.storage[k])}remember(row,row.data.storage);for(const refresh of window.dashboardRefreshers)refresh();}
 catch(e){baseline=oldBaseline;lastSaved=oldSaved;for(const k of keys){if(previous[k]===null)localStorage.removeItem(prefix+k);else localStorage.setItem(prefix+k,previous[k])}if(oldMeta===null)localStorage.removeItem(metaKey());else localStorage.setItem(metaKey(),oldMeta);for(const refresh of window.dashboardRefreshers)refresh();throw e}
 status('Sincronizado automáticamente · '+new Date().toLocaleTimeString());announce('☁ Cuenta');return true;
 }
 function conflict(){ready=false;status('Hay cambios pendientes en ambos dispositivos. Se conservaron las dos copias. Respaldá este dashboard antes de elegir qué versión usar.');announce('☁ Revisar cambios');panel.hidden=false;}
 function remember(row,s){localStorage.setItem(metaKey(),JSON.stringify({revision:row.updated_at,data:s}));baseline={revision:row.updated_at,data:s};lastSaved=JSON.stringify(s)}
 async function push(initial=false){if(!ready||!user||busy) return;busy=true;try{
 const s=snapshot();if(!valid(s))throw Error('Hay datos locales inválidos. Descargá un respaldo.');
 if(!initial&&(!baseline||JSON.stringify(s)===lastSaved))return;
 const {data,error}=await client.rpc('save_dashboard_checked',{payload:{format:'chechu-sync-v1',storage:s},expected_updated_at:initial?null:baseline.revision});
 if(error)throw error;if(!data){conflict();return;}
 remember({updated_at:data},s);status('Sincronizado · '+new Date().toLocaleTimeString());return true;
 }catch(e){if(initial)ready=false;status('No se pudo sincronizar. Tus cambios siguen guardados aquí. Se reintentará: '+e.message)}finally{busy=false}}
 try{
 const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.95.3');
 client=createClient('https://tualpjxsvnjrpesgfueq.supabase.co','sb_publishable_2-R03WSpHACWUX_Cuz937g_GdSRDBJY');
 if(sessionStorage.getItem('chechu_local_mode')==='1'){panel.hidden=true;status('Modo local original. Ingresá de nuevo para conectar la nube.')}
 const {data,error}=await client.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;user=data.user;
 async function authenticated(){if(!user||sessionStorage.getItem('chechu_local_mode')==='1')return; if(owner!==user.id){localStorage.setItem('chechu_active_account',user.id);location.reload();return}
 $('cloudLogin').hidden=true;$('cloudActions').hidden=false;
 try{baseline=JSON.parse(localStorage.getItem(metaKey()))}catch{}
 const row=await read();
 if(!row){status('Sesión: '+user.email+'. La nube todavía no tiene datos. Migrá explícitamente desde la computadora.');return}
 if(row.data?.format!=='chechu-sync-v1'||!valid(row.data.storage))throw Error('Datos de nube incompatibles; se conservaron sin cambios.');
 if(baseline&&valid(baseline.data)){lastSaved=JSON.stringify(baseline.data);ready=true;if(row.updated_at!==baseline.revision){if(JSON.stringify(snapshot())!==lastSaved)conflict();else autoReceive(row);}else status('Sesión: '+user.email+' · sincronización automática activa.');if(ready)panel.hidden=true;}
 else status('Sesión: '+user.email+' · hay una copia en nube. Descargala explícitamente para usarla en este dispositivo.');
 }
 $('cloudLogin').onsubmit=async e=>{e.preventDefault();try{const r=await client.auth.signInWithPassword({email:$('cloudEmail').value,password:$('cloudPassword').value});if(r.error)throw r.error;user=r.data.user;sessionStorage.removeItem('chechu_local_mode');await authenticated()}catch(e){status(e.message)}};
 $('cloudRegister').onclick=async()=>{if(!$('cloudLogin').reportValidity())return;const r=await client.auth.signUp({email:$('cloudEmail').value,password:$('cloudPassword').value});status(r.error?r.error.message:'Cuenta solicitada. Revisá el email de confirmación y después ingresá.');};
 $('cloudLogout').onclick=async()=>{ready=false;await client.auth.signOut();location.reload()};
 $('cloudOpen').onclick=()=>{if(ready)panel.hidden=true;else status('Primero descargá la nube o realizá la migración desde la computadora.')};
 $('cloudPull').onclick=async()=>{ready=false;try{const row=await read();if(!row||row.data?.format!=='chechu-sync-v1')throw Error('No hay copia compatible en nube.');if(!confirm('Se descargará un respaldo de este dispositivo y se reemplazará su copia de trabajo por la nube. ¿Continuar?'))return;adopt(row.data.storage);remember(row,row.data.storage);location.reload()}catch(e){status(e.message)}};
 $('cloudMigrate').onclick=async()=>{try{if(await read())throw Error('La nube ya tiene datos. No se permite sobrescribirla mediante migración.');const s=snapshot('');if(!s.chechu_creative_dashboard_v1)throw Error('No se encontraron datos originales. Realizá este paso en la computadora principal.');if(!valid(s))throw Error('El respaldo contiene datos inválidos.');backup(s,'migracion');if(!confirm('¿Confirmás que estos son los datos originales de la computadora principal y que guardaste el respaldo?'))return;for(const k of keys){if(s[k]===null)localStorage.removeItem(prefix+k);else localStorage.setItem(prefix+k,s[k])}ready=true;if(await push(true))location.reload()}catch(e){status(e.message)}};
 $('cloudPush').onclick=()=>push();await authenticated();if(!user)status('Ingresá para conectar la nube. Todavía no se migraron datos.');
 async function synchronize(){
 if(!ready||busy||document.hidden)return;
 if(JSON.stringify(snapshot())!==lastSaved){await push();return}
 busy=true;
 try{const row=await read();if(!row)throw Error('No se encontró la copia de nube.');
 if(row.data?.format!=='chechu-sync-v1'||!valid(row.data.storage))throw Error('Copia de nube incompatible.');
 if(!ready||document.hidden)return;
 if(row.updated_at!==baseline.revision){if(JSON.stringify(snapshot())!==lastSaved){conflict();return}if(!autoReceive(row))status('Hay una actualización disponible. Se aplicará cuando cierres el formulario.');}
 }catch(e){status('No se pudo actualizar. Los datos locales se conservan. Se reintentará: '+e.message)}finally{busy=false}
 }
 setInterval(synchronize,5000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)synchronize()});
 window.addEventListener('online',synchronize);
 window.addEventListener('pageshow',synchronize);
 }catch(e){status('No se pudo verificar Supabase: '+e.message+'. Podés respaldar y seguir con los datos locales.');}
 });
})();

