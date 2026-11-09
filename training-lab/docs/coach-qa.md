# Entrenador adaptativo: verificación

## Automatización

`cd training-lab && npm ci --ignore-scripts && npm test`

- 28 pruebas unitarias: historial vacío, una referencia, progresión doble, techo, cargas variables por serie, RIR ausente/inválido, RPE, calentamiento, trabajo fuera de rango, incompletas, identidad de máquina/variante/modalidad/base, mancuernas, peso corporal, lastre, asistencia, lados independientes, estabilidad, progreso lento, caída aislada/persistente, fatiga, dolor, datos antiguos, calibración, volumen, aceptación/rechazo, domingo y disponibilidad, límites de fechas, revisión corporal, pureza y resumen longitudinal.
- 1 prueba del service worker: instalación de cada recurso real, navegación y motor con red fallida, actualización de caché sin borrar el registro de notificaciones. Es una prueba de integración del manejador con CacheStorage simulado; no equivale a desconectar un iPhone físico.
- 10 escenarios de integración JSDOM: todas las vistas; cambios de año y final del ciclo; sábado Legs; natación; festivo con PPL adelantado; solo/acompañado; complementos y domingo sin duplicar core; aplicar una sola vez; rechazo; persistencia/exportación del estado; assets y resultado posterior sin alterar series.
- Regresiones existentes de calendario y registro compacto: guardar con coma decimal, descanso, repetir serie, desplegables, selector de ejercicios, historial y sesiones anteriores.
- Workflow GitHub Actions añade estos controles en PR y main con Node 22.

## Inspección visual real

Navegador Chromium, renderizado de la aplicación dentro de un viewport de revisión de 320, 390 y 430 px. Revisados análisis semanal, volumen muscular desplegado, línea temporal de mesociclos, navegación y sesión Push de diciembre en modo acompañado. Se verificó que el selector ofrece tres PPL y el entrenamiento muestra Antes → Ahora junto al ejercicio.

La paleta oscura se inspeccionó aplicando en el entorno de revisión los mismos tokens de color de la hoja de estilos. La preferencia automática del sistema se conserva en la media query existente. No se ha ejecutado una prueba física de Safari/iOS, Dynamic Island, teclado virtual ni reinstalación de una PWA en un iPhone real.

Captura: `marevo-coach-mobile.png` (sesión local de revisión, sin datos reales del usuario). El contenedor gris y los botones de tamaños pertenecen al entorno de QA y no se publican con la aplicación.

## Seguridad y datos

No migración destructiva. No borrado de localStorage, IndexedDB o backups. Se mantiene la clave de almacenamiento existente. El estado del entrenador es aditivo; los cálculos son de solo lectura. Los cambios de volumen se aplican en sesiones nuevas y requieren aceptación y modalidad solo. El registro y el evento aplicado se guardan juntos. Una propuesta rechazada o caducada no cambia las series.

No se añadieron dependencias en producción, API, secretos ni llamadas de telemetría. JSDOM solo es dependencia de desarrollo. Todo el motor funciona en el cliente y está incluido en la caché PWA.

## Publicación

El estado final de PR, integración y despliegue se informa con la respuesta de GitHub y la comparación de los recursos servidos en producción, no a partir de la vista local de QA.
