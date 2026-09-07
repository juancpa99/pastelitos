(function(){
  'use strict';

  const STATUS_KEY='marevo_push_status_v1';

  function readStatus(){
    try{return JSON.parse(localStorage.getItem(STATUS_KEY)||'{}');}
    catch(error){return {};}
  }

  function formatStatus(){
    const status=readStatus();
    if(status.lastError)return `Error: ${status.lastError}`;
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

  if(typeof window.renderSettings==='function'){
    const previousRenderSettings=window.renderSettings;
    window.renderSettings=function marevoRenderSettingsWithPushDiagnostics(){
      previousRenderSettings();
      const root=document.getElementById('viewSettings');
      if(!root||root.querySelector('.marevo-push-diagnostics'))return;
      root.insertAdjacentHTML('beforeend',`
        <h2 class="section">Diagnóstico de notificaciones</h2>
        <div class="card marevo-push-diagnostics">
          <strong>Push remoto</strong>
          <p id="marevoPushDiagnosticStatus" class="subtitle">${esc(formatStatus())}</p>
          <div class="actions">
            <button id="marevoPushDiagnosticButton" type="button" class="btn secondary" onclick="marevoRunPushSelfTest()">Probar push en 15 s</button>
          </div>
          <p class="subtitle">Puedes cerrar MAREVO justo después de programarlo. Si llega, las notificaciones remotas funcionan aunque la app esté cerrada.</p>
        </div>`);
    };
  }

  window.addEventListener('marevo-push-status',updateStatusText);
})();
