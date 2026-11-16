/* Account partitions keep the original computer data untouched. */
(() => {
 'use strict';
 const keys=['chechu_creative_dashboard_v1','chechu_workspace_images_v1','chechu_armenia_finances_v1','chechu_armenia_tours_v1','joy_by_chechu_finances_v1','joy_by_chechu_prices_v1','joy_by_chechu_categories_v1','chechu_armenia_budgets_v1','chechu_armenia_budget_catalog_v1','chechu_armenia_places_notes_v1'];
 const owner=localStorage.getItem('chechu_active_account')||'', prefix=owner?'chechu_account:'+owner+':':'';
 window.dashboardStore={getItem:k=>localStorage.getItem(prefix+k),setItem:(k,v)=>localStorage.setItem(prefix+k,v),removeItem:k=>localStorage.removeItem(prefix+k)};
 const snapshot=(p=prefix)=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(p+k)]));
 function valid(s){return s&&Object.keys(s).length===keys.length&&keys.every(k=>Object.hasOwn(s,k)&&(s[k]===null||typeof s[k]==='string')&&(s[k]===null||(()=>{try{JSON.parse(s[k]);return true}catch{return false}})()))}
 function backup(s,label){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({format:'chechu-full-backup-v1',createdAt:new Date().toISOString(),data:s},null,2)],{type:'application/json'}));a.download='chechu-'+label+'-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
 document.addEventListener('DOMContentLoaded',async()=>{
 const panel=document.createElement('section');panel.id='cloudPanel';panel.style='position:fixed;inset:0;z-index:99999;background:#f4f7f1;color:#183328;overflow:auto;padding:24px;font:16px/1.5 system-ui';
 panel.innerHTML='<div style="max-width:650px;margin:auto"><h1>CHECHU · Cuenta y respaldo</h1><p id="cloudStatus" role="status">Comprobando conexión…</p><form id="cloudLogin"><label>Email <input id="cloudEmail" type="email" autocomplete="username" required></label><label>Contraseña <input id="cloudPassword" type="password" autocomplete="current-password" minlength="8" required></label><button>Ingresar</button><button type="button" id="cloudRegister">Crear cuenta</button></form><p>Usá la misma cuenta en la computadora y el celular. La primera migración se hace desde la computadora.</p><div id="cloudActions" hidden><button id="cloudOpen">Abrir dashboard</button> <button id="cloudPull">Descargar nube</button> <button id="cloudMigrate">Migrar datos originales de esta computadora</button> <button id="cloudPush">Guardar cambios en nube</button> <button id="cloudLogout">Cerrar sesión</button></div><hr><button id="cloudBackup">Descargar respaldo completo original</button> <button id="cloudCurrent">Respaldar este dashboard</button><p>Conservá el respaldo descargado antes de migrar. Los datos originales del navegador se mantienen.</p><label>Restaurar respaldo completo original <input id="cloudRestore" type="file" accept="application/json,.json"></label><button id="cloudLocal">Seguir con datos locales originales</button></div>';
 document.body.append(panel);
 const launcher=document.createElement('button');launcher.textContent='☁ Cuenta y sincronización';launcher.style='position:fixed;bottom:12px;right:12px;z-index:99998';launcher.onclick=()=>panel.hidden=false;document.body.append(launcher);
 const $=id=>document.getElementById(id),status=t=>$('cloudStatus').textContent=t;
 $('cloudBackup').onclick=()=>backup(snapshot(''),'original');$('cloudCurrent').onclick=()=>backup(snapshot(),'actual');
 $('cloudLocal').onclick=()=>{if(owner){localStorage.removeItem('chechu_active_account');location.reload()}else panel.hidden=true};
 $('cloudRestore').onchange=async e=>{try{if(owner)throw Error('Para restaurar un respaldo, elegí primero los datos locales originales.');const f=e.target.files[0];if(!f)return;const b=JSON.parse(await f.text());if(b.format!=='chechu-full-backup-v1'||!valid(b.data))throw Error('Respaldo incompatible.');backup(snapshot(''),'antes-de-restaurar');if(!confirm('¿Restaurar este respaldo en los datos locales originales? No modifica la nube.'))return;for(const k of keys){if(b.data[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,b.data[k])}location.reload()}catch(e){status(e.message)}};
 let client,user,busy=false,baseline=null,lastSaved='',ready=false;
 const metaKey=()=>prefix+'cloud_baseline';
 async function read(){const {data,error}=await client.from('dashboard_data').select('data,updated_at').eq('user_id',user.id).maybeSingle();if(error)throw error;return data}
 function adopt(s){if(!valid(s))throw Error('Formato de nube incompatible. No se cambió ningún dato.');backup(snapshot(),'antes-de-descargar');for(const k of keys){if(s[k]===null)localStorage.removeItem(prefix+k);else localStorage.setItem(prefix+k,s[k])}}
 function remember(row,s){localStorage.setItem(metaKey(),JSON.stringify({revision:row.updated_at,data:s}));baseline={revision:row.updated_at,data:s};lastSaved=JSON.stringify(s)}
 async function push(initial=false){if(!ready||!user||busy) return;busy=true;try{
 const s=snapshot();if(!valid(s))throw Error('Hay datos locales inválidos. Descargá un respaldo.');
 if(!initial&&(!baseline||JSON.stringify(s)===lastSaved))return;
 const {data,error}=await client.rpc('save_dashboard_checked',{payload:{format:'chechu-sync-v1',storage:s},expected_updated_at:initial?null:baseline.revision});
 if(error)throw error;if(!data)throw Error('La nube cambió en otro dispositivo. Respaldá los cambios y descargá la nube antes de continuar.');
 remember({updated_at:data},s);status('Sincronizado · '+new Date().toLocaleTimeString());
 }catch(e){ready=false;status('Sincronización detenida: '+e.message)}finally{busy=false}}
 try{
 const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.95.3');
 client=createClient('https://tualpjxsvnjrpesgfueq.supabase.co','sb_publishable_2-R03WSpHACWUX_Cuz937g_GdSRDBJY');
 const {data,error}=await client.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;user=data.user;
 async function authenticated(){if(!user)return; if(owner!==user.id){localStorage.setItem('chechu_active_account',user.id);location.reload();return}
 $('cloudLogin').hidden=true;$('cloudActions').hidden=false;
 try{baseline=JSON.parse(localStorage.getItem(metaKey()))}catch{}
 const row=await read();
 if(!row){status('Sesión: '+user.email+'. La nube todavía no tiene datos. Migrá explícitamente desde la computadora.');return}
 if(row.data?.format!=='chechu-sync-v1'||!valid(row.data.storage))throw Error('Datos de nube incompatibles; se conservaron sin cambios.');
 if(baseline&&row.updated_at===baseline.revision){lastSaved=JSON.stringify(baseline.data);ready=true;status('Sesión: '+user.email+' · sincronización activa.');}
 else status('Sesión: '+user.email+' · hay una copia en nube. Descargala explícitamente para usarla en este dispositivo.');
 }
 $('cloudLogin').onsubmit=async e=>{e.preventDefault();try{const r=await client.auth.signInWithPassword({email:$('cloudEmail').value,password:$('cloudPassword').value});if(r.error)throw r.error;user=r.data.user;await authenticated()}catch(e){status(e.message)}};
 $('cloudRegister').onclick=async()=>{if(!$('cloudLogin').reportValidity())return;const r=await client.auth.signUp({email:$('cloudEmail').value,password:$('cloudPassword').value});status(r.error?r.error.message:'Cuenta solicitada. Revisá el email de confirmación y después ingresá.');};
 $('cloudLogout').onclick=async()=>{ready=false;await client.auth.signOut();location.reload()};
 $('cloudOpen').onclick=()=>{if(ready)panel.hidden=true;else status('Primero descargá la nube o realizá la migración desde la computadora.')};
 $('cloudPull').onclick=async()=>{ready=false;try{const row=await read();if(!row||row.data?.format!=='chechu-sync-v1')throw Error('No hay copia compatible en nube.');if(!confirm('Se descargará un respaldo de este dispositivo y se reemplazará su copia de trabajo por la nube. ¿Continuar?'))return;adopt(row.data.storage);remember(row,row.data.storage);location.reload()}catch(e){status(e.message)}};
 $('cloudMigrate').onclick=async()=>{try{if(await read())throw Error('La nube ya tiene datos. No se permite sobrescribirla mediante migración.');const s=snapshot('');if(!s.chechu_creative_dashboard_v1)throw Error('No se encontraron datos originales. Realizá este paso en la computadora principal.');if(!valid(s))throw Error('El respaldo contiene datos inválidos.');backup(s,'migracion');if(!confirm('¿Confirmás que estos son los datos originales de la computadora principal y que guardaste el respaldo?'))return;for(const k of keys){if(s[k]===null)localStorage.removeItem(prefix+k);else localStorage.setItem(prefix+k,s[k])}ready=true;await push(true);if(ready)location.reload()}catch(e){status(e.message)}};
 $('cloudPush').onclick=()=>push();await authenticated();if(!user)status('Ingresá para conectar la nube. Todavía no se migraron datos.');
 setInterval(async()=>{if(!ready||busy||document.hidden)return;if(JSON.stringify(snapshot())!==lastSaved){await push();return}try{const row=await read();if(!row||row.updated_at!==baseline.revision){ready=false;status('Hay cambios en otro dispositivo. Abrí Cuenta y sincronización para descargar la nube.');launcher.textContent='☁ Cambios disponibles';}}catch(e){status('Sin conexión. Los cambios se conservan localmente.')}},5000);
 }catch(e){status('No se pudo verificar Supabase: '+e.message+'. Podés respaldar y seguir con los datos locales.');}
 });
})();

