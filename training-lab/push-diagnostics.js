(function(){
  'use strict';

  const STATUS_KEY='marevo_push_status_v1';

  function readStatus(){
    try{return JSON.parse(localStorage.getItem(STATUS_KEY)||'{}');}
    catch(error){return {};}
  }

  function formatStatus(){
    const status=readStatus();
    if(status.lastError){
      const message=String(status.lastError);
      if(/invalid token|unable to authenticate/i.test(message)){
        return 'QStash no acepta la clave del backend. Hay que actualizar QSTASH_TOKEN en Vercel.';
      }
      return `Error: ${message}`;
    }
    if(status.lastOkAt){
      const time=new Date(status.lastOkAt).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      return `Última sincronización correcta: ${time} · ${Number(status.scheduled)||0} programadas`;
    }
    return 'Todavía no se ha confirmado una sincronización remota.';
  }

  function updateStatusText(){
    const node=document.getElementById('marevoPushDiagnosticStatus');
    if(node)node.textContent=formatStatus();
  }

  window.marevoRunPushSelfTest=async function(){
    const button=document.getElementById('marevoPushDiagnosticButton');
    if(button)button.disabled=true;
    try{
      if(typeof window.marevoSchedulePushTest!=='function')throw new Error('Cliente push no disponible');
      const result=await window.marevoSchedulePushTest(15);
      toast(`Push remoto programado · ${result.scheduled} aviso${result.scheduled===1?'':'s'}`);
    }catch(error){
      toast('No se pudo programar el push remoto');
    }finally{
      if(button)button.disabled=false;
      updateStatusText();
    }
  };

  function notificationCard(root){
    const heading=[...root.querySelectorAll('.section')].find(node=>node.textContent.trim()==='Notificaciones');
    const card=heading?.nextElementSibling;
    return card?.classList?.contains('card')?card:null;
  }

  function updateNotificationCopy(card){
    const title=card.querySelector('.notif-status strong');
    if(title)title.textContent='MAREVO en el móvil';
    const statusCopy=card.querySelector('.notif-status small');
    if(statusCopy)statusCopy.textContent=appIsStandalone()
      ? 'App instalada en el dispositivo.'
      : 'En iPhone, añade MAREVO a la pantalla de inicio para usar notificaciones.';
    card.querySelectorAll('.notif-row small').forEach(node=>{
      node.textContent=node.textContent.replace(/Training Lab/g,'MAREVO');
    });
  }

  function insertDiagnostics(card){
    if(card.querySelector('.marevo-push-diagnostics'))return;
    const compatibility=[...card.children].find(node=>node.classList?.contains('callout'))||null;
    const html=`
      <div class="marevo-push-diagnostics" style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.12)">
        <strong>Push remoto</strong>
        <p id="marevoPushDiagnosticStatus" class="subtitle">${esc(formatStatus())}</p>
        <div class="actions">
          <button id="marevoPushDiagnosticButton" type="button" class="btn secondary" onclick="marevoRunPushSelfTest()">Probar push en 15 s</button>
        </div>
        <p class="subtitle">Esta prueba comprueba si MAREVO puede avisarte incluso con la app cerrada.</p>
      </div>`;
    if(compatibility)compatibility.insertAdjacentHTML('beforebegin',html);
    else card.insertAdjacentHTML('beforeend',html);
    if(compatibility){
      compatibility.innerHTML='<strong>Compatibilidad:</strong> en iPhone, MAREVO debe estar instalada en la pantalla de inicio y tener permiso de notificaciones. El estado de «Push remoto» de arriba confirma si los avisos con la app cerrada están operativos.';
    }
  }

  if(typeof window.renderSettings==='function'){
    const previousRenderSettings=window.renderSettings;
    window.renderSettings=function marevoRenderSettingsWithPushDiagnostics(){
      previousRenderSettings();
      const root=document.getElementById('viewSettings');
      if(!root)return;
      const card=notificationCard(root);
      if(!card)return;
      updateNotificationCopy(card);
      insertDiagnostics(card);
    };
  }

  window.addEventListener('marevo-push-status',updateStatusText);
})();
