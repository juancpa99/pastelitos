# MAREVO · revisión de UX (24 septiembre 2026)

## Jerarquía

- Hoy: próxima sesión, otras tareas disponibles, alimentación y enlace semanal. Las comidas no se repiten como tareas; el check-in aparece a su hora. El calendario respeta las sesiones dobles, natación y fechas anteriores.
- Entreno: sesión antes de planificación. Al iniciar, el primer ejercicio pendiente se abre y el resto queda desplegable. Las selecciones abiertas se conservan al registrar. Temporizador, pausa y Finalizar siguen accesibles; el descanso permite +30 s y opciones secundarias.
- Series: referencia anterior junto a las entradas; equipo, técnica, sustitución y ajuste de series bajo opciones. Copiar historial distingue series efectivas de aproximación.
- Comidas: resumen diario, acción Añadir y diario. Copiar ayer, objetivos y balance energético quedan accesibles en niveles secundarios.
- Progreso: cargas comparables, últimas mediciones y sesiones primero. Fuerza, cuerpo, natación, volumen, nutrición e historial se despliegan. Informes al final. Más kg se etiqueta como tal, sin afirmarlo como una mejora automática de fuerza.
- Ajustes: Entrenamiento, Nutrición, Notificaciones, Datos y copias e Instalación. Los accesos directos abren su categoría.

## Implementación

`app.js` compone las pantallas; `view-helpers.js` contiene piezas de presentación sin cambiar claves de almacenamiento. Los módulos de fase aportan datos y contenido. Se eliminan los dos scripts de reordenación y las cadenas de wrappers de renderizado Home/Workout/Progress. Persistencia y metabolismo proporcionan contenido a destinos explícitos. El diagnóstico push conserva su integración.

El esquema de datos, planes, registros, exportaciones y claves existentes se mantienen. El service worker v6-35 precarga todos los recursos de la nueva interfaz. Las pruebas usan datos ficticios en JSDOM; nunca acceden a los registros de un dispositivo real.

## Verificación reproducible

Con Node y jsdom 26 instalados:

```
node training-lab/tests/usability.cjs
node training-lab/tests/ui-stability.cjs
node training-lab/tests/ux-hierarchy.cjs
node training-lab/tests/push-notifications.cjs
```

La prueba nueva recorre cinco pantallas y nueve fechas, incluida la doble sesión, piscina, descanso, domingo y fechas anteriores al bloque. Comprueba foco, conservación de entradas, disclosure, atajos a ajustes, referencias por tipo de serie, copia, almacenamiento y lectura de sesiones completadas. La prueba histórica se adapta a la composición explícita en vez de exigir la existencia de un wrapper eliminado.

La inspección visual de la web y la prueba física Safari/PWA tienen alcances distintos: el navegador remoto no reproduce la isla dinámica, el teclado ni el comportamiento de reinstalación del iPhone.
