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
 const panel=document.createElement('section');panel.id='cloudPanel';panel.setAttribute('aria-label','Cuenta y sincronización');
 const accountStyle=document.createElement('style');accountStyle.textContent=`
 #cloudPanel{position:fixed;inset:0;z-index:99999;overflow:auto;overscroll-behavior:contain;background:var(--bg,#f7fafd);color:var(--ink,#142c46);font:14px/1.6 'DM Sans',sans-serif;padding:clamp(20px,5vw,64px) max(16px,env(safe-area-inset-right)) max(28px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));-webkit-text-size-adjust:100%}
 #cloudPanel,#cloudPanel *{box-sizing:border-box}#cloudPanel [hidden]{display:none!important}
 #cloudPanel .cloud-wrap{max-width:1020px;margin:0 auto}#cloudPanel .cloud-brand{display:flex;align-items:center;gap:11px;margin-bottom:36px}#cloudPanel .cloud-logo{width:42px;height:42px;border-radius:15px;background:var(--navy,#0c2d4c);color:white;display:grid;place-items:center;font:800 24px Manrope,sans-serif}#cloudPanel .cloud-brand strong{display:block;font:800 15px Manrope,sans-serif;letter-spacing:.02em}#cloudPanel .cloud-brand small{display:block;font-size:10px;letter-spacing:.18em;color:var(--muted,#72859b)}
 #cloudPanel .cloud-eyebrow{font-size:10px;font-weight:800;letter-spacing:.16em;color:var(--muted,#72859b);text-transform:uppercase;margin:0 0 10px}#cloudPanel h1{font:800 clamp(27px,4vw,42px)/1.2 Manrope,sans-serif;letter-spacing:-.035em;margin:0 0 12px}#cloudPanel .cloud-intro{font-size:15px;color:var(--muted,#72859b);margin:0 0 26px;max-width:620px}#cloudPanel .cloud-status{display:flex;align-items:flex-start;gap:11px;border:1px solid #cfe2dc;background:#eaf4ef;border-radius:14px;padding:15px 18px;margin-bottom:24px}#cloudPanel .cloud-status-icon{flex:0 0 22px;color:#356c57;line-height:24px}#cloudPanel #cloudStatus{margin:0;overflow-wrap:anywhere;color:#28523f;font-size:13px;line-height:1.7}
 #cloudPanel .cloud-grid{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);gap:20px;align-items:start}#cloudPanel .cloud-card{min-width:0;background:var(--paper,#fff);border:1px solid var(--line,#dce7f1);border-radius:22px;padding:28px;box-shadow:var(--shadow,0 10px 36px #153d6010)}#cloudPanel .cloud-card h2{font:800 20px/1.3 Manrope,sans-serif;letter-spacing:-.02em;margin:0 0 10px}#cloudPanel .cloud-copy{color:var(--muted,#72859b);font-size:13px;margin:0 0 23px}#cloudPanel .cloud-fields{display:grid;gap:16px}#cloudPanel label{display:grid;gap:7px;font-size:12px;font-weight:700;color:var(--ink,#142c46)}#cloudPanel input{font:400 16px 'DM Sans',sans-serif;width:100%;max-width:100%;min-width:0;padding:13px 14px;border:1px solid var(--line,#dce7f1);border-radius:11px;background:var(--paper,#fff);color:var(--ink,#142c46)}#cloudPanel input:focus-visible{outline:3px solid #74b9da55;border-color:var(--blue,#16558b)}#cloudPanel button:focus-visible,#cloudPanel summary:focus-visible{outline:3px solid #74b9da88;outline-offset:3px}
 #cloudPanel .cloud-buttons{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}#cloudPanel .cloud-btn{border:1px solid var(--line,#dce7f1);border-radius:12px;background:var(--paper,#fff);color:var(--ink,#142c46);font:700 13px/1.4 'DM Sans',sans-serif;padding:13px 17px;min-height:46px;cursor:pointer;text-align:center;white-space:normal;overflow-wrap:anywhere;transition:background .15s,border-color .15s}#cloudPanel .cloud-btn:hover{background:var(--pale,#e9f4fa);border-color:#bcd3df}#cloudPanel .cloud-primary{background:var(--navy,#0c2d4c);border-color:var(--navy,#0c2d4c);color:white}#cloudPanel .cloud-primary:hover{background:var(--blue,#16558b);color:white}#cloudPanel .cloud-note{font-size:12px;color:var(--muted,#72859b);line-height:1.7;margin:18px 0 0}#cloudPanel .cloud-divider{border:0;border-top:1px solid var(--line,#dce7f1);margin:24px 0}#cloudPanel .cloud-stack{display:grid;gap:10px}#cloudPanel .cloud-stack .cloud-btn{text-align:left;width:100%}#cloudPanel details{border-top:1px solid var(--line,#dce7f1);margin-top:24px;padding-top:18px}#cloudPanel summary{cursor:pointer;font-size:13px;font-weight:700;min-height:32px;line-height:1.6;overflow-wrap:anywhere}#cloudPanel details .cloud-copy{margin:12px 0 16px}#cloudPanel .cloud-file{margin-top:14px}#cloudPanel input[type=file]{padding:9px;font-size:12px;line-height:1.5}#cloudPanel input::file-selector-button{border:0;border-radius:7px;padding:10px 12px;margin-right:9px;background:var(--pale,#e9f4fa);color:var(--ink,#142c46);font:700 12px 'DM Sans',sans-serif;cursor:pointer}#cloudPanel .cloud-footer{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin:22px 0}#cloudPanel .cloud-text-btn{border:0;background:transparent;color:var(--muted,#72859b);font:700 12px/1.5 'DM Sans',sans-serif;cursor:pointer;padding:10px 0;text-decoration:underline;text-underline-offset:4px;min-height:44px;text-align:left}#cloudPanel .cloud-footer p{color:var(--muted,#72859b);font-size:11px;margin:0}
 @media(max-width:700px){#cloudPanel .cloud-grid{grid-template-columns:1fr;gap:16px}#cloudPanel .cloud-card{padding:22px;border-radius:18px}#cloudPanel .cloud-brand{margin-bottom:28px}#cloudPanel .cloud-buttons{display:grid;grid-template-columns:1fr}#cloudPanel .cloud-btn{width:100%}#cloudPanel .cloud-status{padding:13px 14px}#cloudPanel .cloud-intro{font-size:14px}#cloudPanel .cloud-footer{display:block}#cloudPanel .cloud-footer p{margin-top:10px}}
 @media(prefers-reduced-motion:reduce){#cloudPanel .cloud-btn{transition:none}}
 `;document.head.append(accountStyle);
 panel.innerHTML=`<div class="cloud-wrap">
 <div class="cloud-brand"><span class="cloud-logo" aria-hidden="true">◎</span><div><strong>CHECHU / WORKSPACE</strong><small>CREATIVE DASHBOARD</small></div></div>
 <p class="cloud-eyebrow">Tu espacio conectado</p><h1>Cuenta y sincronización</h1><p class="cloud-intro">Tus ideas, proyectos y números, siempre a mano. Conectá tus dispositivos y cuidá tus datos desde un solo lugar.</p>
 <div class="cloud-status"><span class="cloud-status-icon" aria-hidden="true">☁</span><p id="cloudStatus" role="status" aria-live="polite">Comprobando conexión…</p></div>
 <div class="cloud-grid"><section class="cloud-card" aria-labelledby="cloudAccountTitle"><h2 id="cloudAccountTitle">Un mismo espacio, donde estés.</h2><p class="cloud-copy">Usá la misma cuenta en la computadora y el celular para mantener tus cambios conectados.</p>
 <form id="cloudLogin"><div class="cloud-fields"><label for="cloudEmail">Email<input id="cloudEmail" type="email" autocomplete="username" inputmode="email" placeholder="tu@email.com" required></label><label for="cloudPassword">Contraseña<input id="cloudPassword" type="password" autocomplete="current-password" placeholder="Tu contraseña" minlength="8" required></label></div><div class="cloud-buttons"><button class="cloud-btn cloud-primary" type="submit">Ingresar</button><button class="cloud-btn" type="button" id="cloudRegister">Crear cuenta</button></div></form>
 <div id="cloudActions" hidden><div class="cloud-stack"><button type="button" class="cloud-btn cloud-primary" id="cloudOpen">Abrir dashboard →</button><button type="button" class="cloud-btn" id="cloudPull">Descargar datos de la nube</button><button type="button" class="cloud-btn" id="cloudPush">Guardar cambios en nube</button></div><p class="cloud-note">Una vez conectado, los cambios guardados se sincronizan automáticamente mientras la app está abierta y tiene conexión.</p><details><summary>Primera migración desde la computadora</summary><p class="cloud-copy">Solo para la primera carga: hacelo desde la computadora principal, después de guardar un respaldo de los datos originales.</p><button type="button" class="cloud-btn" id="cloudMigrate">Migrar datos originales de esta computadora</button></details><hr class="cloud-divider"><button type="button" class="cloud-text-btn" id="cloudLogout">Cerrar sesión</button></div>
 </section><section class="cloud-card" aria-labelledby="cloudBackupTitle"><p class="cloud-eyebrow">Una copia, más tranquilidad</p><h2 id="cloudBackupTitle">Copias de seguridad</h2><p class="cloud-copy">Guardá una copia descargable de tu información. Los datos originales del navegador se mantienen.</p><div class="cloud-stack"><button type="button" class="cloud-btn" id="cloudCurrent">↓ Respaldar este dashboard</button><button type="button" class="cloud-btn" id="cloudBackup">↓ Descargar respaldo completo original</button></div><p class="cloud-note">Antes de la primera migración, descargá el respaldo original desde la computadora donde están tus datos.</p><details><summary>Restaurar un respaldo</summary><p class="cloud-copy">Usá un respaldo completo guardado anteriormente. Para restaurarlo, primero elegí el modo de datos locales originales.</p><label class="cloud-file" for="cloudRestore">Seleccionar archivo de respaldo<input id="cloudRestore" type="file" accept="application/json,.json"></label></details></section></div>
 <footer class="cloud-footer"><button type="button" class="cloud-text-btn" id="cloudLocal">Seguir con datos locales originales</button><p>Tu trabajo, tus caminos · CHECHU</p></footer></div>`;

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

