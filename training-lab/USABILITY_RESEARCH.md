# Training Lab: registro y guía de entrenamiento (septiembre de 2026)

La plantilla y sus fases no se modifican. La aplicación utiliza los rangos de repeticiones, RIR, series y descanso del ejercicio. Para ejercicios libres ofrece 3 × 8–12, RIR 1–2 como punto de partida editable, no como prescripción universal.

## Fuentes y decisiones

- [ACSM, actualización 2026](https://acsm.org/resistance-training-guidelines-update-2026/): individualización, constancia y ausencia de necesidad general de llegar al fallo. Una serie fuera del rango sigue siendo trabajo realizado; no se obliga a repetirla ni se diagnostica como biológicamente ineficaz.
- [ACSM, progresión 2009](https://pubmed.ncbi.nlm.nih.gov/19204579/): incrementos orientativos del 2–10% al superar la carga de repeticiones objetivo. La app aplica una heurística conservadora de doble progresión: confirmar el techo del rango en dos sesiones comparables, conservar RIR y volver al extremo inferior al subir. El umbral concreto es una decisión de producto, no un algoritmo clínicamente validado.
- [Fitness Park, actividades](https://www.fitnesspark.es/actividades/): marcas Hammer Strength, Technogym, Eleiko, gym80 y Watson. La disponibilidad depende del club; no se inventa un inventario local.
- [Hammer Strength, fabricante](https://www.lifefitness.com/es-es/brands/hammer-strength): modelos de referencia del catálogo. Una máquina iso-lateral puede utilizarse simultáneamente o lado a lado: el usuario indica cómo la utiliza.
- [WebKit: diseño para iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/): viewport-fit y safe-area-inset para evitar recortes. Se añade margen a elementos fijos, cabecera y modales; fallback conservador en iOS instalado.

## Convenciones explícitas

- Mancuernas: peso de UNA mancuerna; dos brazos simultáneos no son dos series.
- Unilateral: kg, reps y RIR independientes para izquierda/derecha. Ambos lados cierran una pareja; cuenta una serie por lado, sin duplicar las series por músculo. Un lado incompleto se conserva, pero no cierra la pareja.
- Discos totales: suma de todos los discos + base opcional. Discos por lado: 2 × discos introducidos + base opcional. Selector: lectura de la torre, sin sumar el chasis.
- La carga calculada es nominal, no fuerza real en la articulación; poleas, ángulos y palancas impiden comparar máquinas por kg.
- Cada sesión conserva su configuración. Los registros antiguos sin convención confirmada quedan separados de las nuevas referencias.
- Los atajos copian peso/reps, nunca el esfuerzo subjetivo de una serie anterior. Las series completadas son de solo lectura.
- Recuperar un entrenamiento crea una sesión vinculada a su fecha de origen, en la fecha seleccionada, sin cambiar el plan. Los candidatos de los días anteriores de la semana seleccionada (lunes a domingo) se calculan sobre el plan actual: no reconstruyen versiones históricas desconocidas.
- El cronómetro usa marcas temporales, incluye descansos y excluye pausas explícitas. El reloj requiere iniciar/pausar por separado.

## Límites y siguientes pasos

La guía es determinista y orientativa; no observa técnica, dolor durante el movimiento, ni recuperación real. No aumenta automáticamente el volumen. Ante estancamiento y fatiga, propone revisar la recuperación y conservar o reducir carga; añadir series requiere revisar el programa y el volumen muscular global. Los modelos/base de máquinas no se rellenan con estimaciones de fabricante que puedan corresponder a otra variante.

La zona segura de Dynamic Island requiere además una comprobación final en iPhone físico, en Safari y como app instalada. Un navegador de escritorio no reproduce la isla ni su área segura real.

## Verificación reproducible

Pruebas con Node y jsdom 26: `NODE_PATH=/ruta/a/node_modules node training-lab/tests/usability.cjs`. Cubren cierre unilateral, persistencia de ambos lados, descanso y pausa, copia sin RIR, carga nominal, validación, recordatorio antes del cronómetro y recuperación de sesiones. No sustituyen pruebas en Safari/iPhone físico.
