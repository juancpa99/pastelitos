# MAREVO: entrenador adaptativo

Versión 1. Revisión bibliográfica y diseño: 9 de noviembre de 2026.

## Auditoría y arquitectura

La aplicación es una PWA estática, publicada con GitHub Pages. No requiere backend ni LLM. `app.js` contiene estado, registro y vistas; `usability.js` añade perfiles de equipo y lados independientes. Los módulos de septiembre, octubre y noviembre redefinen funciones globales. `training-calendar.js` evita fuerza en días de piscina; `swim-day-exceptions.js` permite recuperar un PPL pendiente sin duplicarlo. `nov26-flexible-extras.js` reparte complementos según trabajo registrado. `persistence.js` conserva snapshots en IndexedDB y recuperación adicional; exportación JSON conserva el objeto de estado completo. `progress-charts.js` representa cargas por ejercicio y equipo.

Problemas encontrados: caducidad del programa, consejos distintos entre módulos, volumen indirecto contado como directo, datos ausentes convertidos en cero en ciertas reglas antiguas y ausencia de trazabilidad de decisiones. La capa de usabilidad ya había corregido parcialmente la clasificación de series fuera del objetivo; el motor nuevo analiza directamente el registro, sin confiar en etiquetas antiguas.

Separación nueva:

- `coach-engine.js`: funciones puras de normalización analítica, validación, clasificación, comparabilidad, tendencias, recuperación, volumen, recomendaciones, planificación, propuestas y decisiones.
- `coach-planner.js`: único puente entre el calendario existente y el programa continuo. Reutiliza los PPL del último bloque, sin migrar sesiones históricas. Conserva las claves semanales para que festivos y sesiones adelantadas cuenten una sola vez.
- `coach-ui.js`: lectura del estado, presentación y acciones explícitas del usuario. Las decisiones se guardan en `state.coach`, dentro de la persistencia y exportación existentes.
- `coach.css`: interfaz compacta con colores semánticos y controles táctiles.

El calendario anterior al 30 de noviembre se conserva. Los registros nunca se convierten en objetivos ni se sobrescriben al consultar el entrenador. Una sesión realizada contiene su propia prescripción. Las propuestas de volumen caducan al terminar la semana asignada; no se acumulan por sesiones perdidas. El entrenador se calcula al abrir la aplicación o registrar datos; no ejecuta tareas cuando la PWA está cerrada.

## Evidencia verificada

1. Brad S. Currier y colaboradores. American College of Sports Medicine Position Stand. Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews. Medicine & Science in Sports & Exercise, 2026, 58(4), 851–872. https://pubmed.ncbi.nlm.nih.gov/41843416/
   Síntesis de 137 revisiones. El entrenamiento progresivo mejora fuerza y tamaño muscular. Un volumen mayor favorece hipertrofia en promedio; periodización y fallo no producen ventajas consistentes en todos los resultados. No implica que cada persona necesite un mínimo exacto ni incrementar indefinidamente.
2. Joshua C. Pelland, Jacob F. Remmert, Zac P. Robinson, Seth R. Hinson y Michael C. Zourdos. The Resistance Training Dose Response: Meta-Regressions Exploring the Effects of Weekly Volume and Frequency on Muscle Hypertrophy and Strength Gains. Sports Medicine, 2026, 56(2), 481–505; publicación electrónica 4 de diciembre de 2025. https://pubmed.ncbi.nlm.nih.gov/41343037/
   67 estudios: relación dosis-respuesta con rendimientos decrecientes. Distinguir estímulo directo e indirecto mejora el modelo. La frecuencia tiene efectos menos claros sobre hipertrofia que sobre fuerza. El peso fraccional 0,5 no es una equivalencia biológica exacta para cada ejercicio.
3. Daniel Plotkin y colaboradores. Progressive overload without progressing load? The effects of load or repetition progression on muscular adaptations. PeerJ, 2022. https://pubmed.ncbi.nlm.nih.gov/36199287/
   Ensayo de ocho semanas en personas entrenadas: progresar repeticiones o carga son opciones viables. No valida un algoritmo individual concreto.
4. Talisson Santos Chaves y colaboradores. Effects of Resistance Training Overload Progression Protocols on Strength and Muscle Mass. International Journal of Sports Medicine, 2024, 45(7), 504–510. https://pubmed.ncbi.nlm.nih.gov/38286426/
   Ensayo de diez semanas, 39 participantes sin experiencia: ambos protocolos mejoraron fuerza y área muscular, sin diferencias entre ellos. Generalización limitada a personas entrenadas y otros ejercicios.
5. Zijing Huang, Jian Sun, Duanying Li, Chao Chen y Dexin Wang. Autoregulated resistance training for maximal strength enhancement: A systematic review and network meta-analysis. Journal of Exercise Science & Fitness, 2025, 23(4), 360–369. https://pubmed.ncbi.nlm.nih.gov/40791980/
   Evalúa fuerza máxima, no hipertrofia. Apoya explorar autorregulación, pero las clasificaciones de intervenciones y comparaciones indirectas no demuestran que una regla de RIR garantice más músculo.
6. Integrating Deloading into Strength and Physique Sports Training Programmes: An International Delphi Consensus Approach. Sports Medicine - Open, 2023. https://pmc.ncbi.nlm.nih.gov/articles/PMC10511399/
   Consenso de expertos, no ensayo de eficacia. Respalda individualizar reducciones de estrés y tener en cuenta otros deportes y preferencias. No establece descargas obligatorias cada cuatro semanas.
7. Zac P. Robinson y colaboradores. Exploring the Dose-Response Relationship Between Estimated Resistance Training Proximity to Failure, Strength Gain, and Muscle Hypertrophy: A Series of Meta-Regressions. Sports Medicine, 2024, 54(9), 2209–2231. https://pubmed.ncbi.nlm.nih.gov/38970765/
   Asociación entre mayor proximidad al fallo e hipertrofia. RIR estimado y análisis exploratorio: el óptimo individual no queda establecido. No exige fallo en todas las series.
8. Moritz Schumann y colaboradores. Compatibility of Concurrent Aerobic and Strength Training for Skeletal Muscle Size and Function: An Updated Systematic Review and Meta-Analysis. Sports Medicine, 2022. https://pubmed.ncbi.nlm.nih.gov/34757594/
   No encontró compromiso global de hipertrofia o fuerza máxima; la potencia puede verse afectada, especialmente en la misma sesión. Predominan carrera y ciclismo: no atribuir automáticamente una caída individual a la natación.
9. Tommy R. Lundberg y colaboradores. The Effects of Concurrent Aerobic and Strength Training on Muscle Fiber Hypertrophy: A Systematic Review and Meta-Analysis. Sports Medicine, 2022. https://pubmed.ncbi.nlm.nih.gov/35476184/
   Posible pequeño efecto negativo a nivel de fibra; diferencias respecto a medidas de músculo completo y limitaciones de extrapolación. MAREVO mantiene días separados por preferencia del usuario y observa recuperación sin diagnosticar causalidad.

## Consenso práctico

Conservar ejercicios eficaces y técnica comparable; progresar repeticiones antes de saltos de carga excesivos; usar el RIR como información aproximada, no medición exacta; distinguir estabilidad de estancamiento; revisar recuperación y molestias antes de añadir estímulo. Fuerza y perímetros son indicadores distintos. No inferir hipertrofia a partir de tonelaje o kilos levantados.

## Heurísticas de ingeniería (no verdades científicas)

- Una exposición permite una referencia. Cuatro permiten estudiar una tendencia, siempre que coincidan ejercicio, equipo, modalidad, variante, número de series y esfuerzo suficientemente comparable. No son niveles de confianza estadísticos.
- Una repetición adicional por sesión como objetivo flexible; en unilateral se proponen ambos lados por separado. Subida de carga solo al completar todas las series del techo con RIR conocido y suficiente, usando el incremento configurado. Menos asistencia significa más dificultad.
- Una caída aislada mantiene el plan. Dos comparaciones consecutivas con menos repeticiones, carga constante y RIR conocido permiten revisar fatiga; cambios de carga o datos incompletos no se etiquetan como caídas.
- Fatiga ≥7/10, energía ≤3/10 o sueño medio <6 horas activan cautela. Dolor ≥4/10 bloquea aumentos. Son umbrales conservadores de producto, no diagnóstico médico.
- Para proponer una serie adicional: semana completa, tres PPL completados, cuatro exposiciones estables de los ejercicios asociados, tres registros de recuperación, volumen base realizado y volumen fraccional inferior a 16. Este límite prudente evita incrementos en una rutina ya abundante; no es un máximo fisiológico.
- No se proponen aumentos durante las cuatro semanas de calibración. Si falta configurar el incremento o ya corresponde subir carga, no se propone más volumen. Los ejercicios deben haberse registrado en la semana revisada. Una referencia de más de 28 días pide recalibración.
- Como máximo un músculo recibe propuesta por evaluación. Una serie extra, no incrementos generalizados. La aportación indirecta se muestra separada; el factor 0,5 solo se usa como freno conservador interno.
- Una reducción temporal afecta inicialmente a un ejercicio con caída repetida y mala recuperación. No se recorta todo el programa un 30–40% por una puntuación de cansancio.
- Los ajustes requieren aceptación, día disponible y entrenamiento solo; caducan en una semana. Si no se realiza la sesión no se recupera su volumen a la siguiente semana. Rechazar conserva la rutina original.
- Mesociclos iniciales de 4/6/6/6/4 semanas entre 30/11/2026 y 30/05/2027. Después, bloques de seis semanas generados por fecha. Las fases son marcos de revisión, nunca disparadores de carga, volumen o descarga.
- Las mediciones corporales requieren separación mínima de 28 días. Peso y perímetros no identifican por sí solos tejido muscular ganado.

## Diseño y privacidad

Referencias consultadas: Apple Human Interface Guidelines (https://developer.apple.com/design/human-interface-guidelines/) y documentación oficial de Hevy sobre rutinas y registros (https://www.hevyapp.com/features/gym-routines/). Se separa prescripción de resultado real; detalles progresivos, controles de 44 px, colores semánticos, tamaños compactos y fechas legibles. No se copian diseños.

Los datos permanecen en el dispositivo. No se añaden claves, telemetría ni llamadas de IA. La caché incluye motor, interfaz y documentación. Se conservan las copias existentes; una PWA no puede garantizar que iOS conserve almacenamiento si el usuario elimina todos los datos del sitio. Se mantiene la exportación y recuperación existentes.

## Comprobaciones

Consultar `tests/coach-engine.cjs`, `tests/coach-integration.cjs` y `docs/coach-qa.md` para casos ejecutados y límites de verificación. Los datos sintéticos solo se usan en entornos de prueba.

La capacidad para ajustes se confirma por el usuario. Como guardarraíl de ingeniería, no se añaden series a un domingo con 16 o más series ni a una sesión base con 27 o más. Estos límites no son máximos fisiológicos ni límites de duración; Legs conserva sus 26 series y duración flexible.
