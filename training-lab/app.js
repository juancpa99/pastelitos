
const STORAGE_KEY="training_lab_v4";
const LEGACY_KEYS=["training_lab_v3","camilo_training_lab_v2"];
const MEMORY_STORE={};
function storageGet(k){try{return window.localStorage.getItem(k)}catch(e){return MEMORY_STORE[k]??null}}
function storageSet(k,v){try{window.localStorage.setItem(k,v)}catch(e){MEMORY_STORE[k]=String(v)}}
const DEFAULT_PLANS={"summer": {"0": {"key": "rest", "title": "Descanso", "type": "rest", "subtitle": "Recuperación", "exercises": []}, "1": {"key": "lowerA", "title": "Lower A", "type": "gym", "subtitle": "Cuádriceps y glúteo", "exercises": [{"key": "hack_squat", "name": "Hack squat", "type": "strength", "sets": 3, "min": 6, "max": 8, "rir": "1–2", "rest": "3 min", "muscle": "Cuádriceps + glúteo", "note": "ROM profundo y estable."}, {"key": "leg_press", "name": "Prensa", "type": "strength", "sets": 3, "min": 8, "max": 10, "rir": "1–2", "rest": "3 min", "muscle": "Cuádriceps + glúteo", "note": "Controla la pelvis."}, {"key": "leg_extension", "name": "Extensión de cuádriceps", "type": "strength", "sets": 2, "min": 10, "max": 15, "rir": "1", "rest": "90–120 s", "muscle": "Cuádriceps", "note": "Controlado."}, {"key": "seated_leg_curl", "name": "Curl femoral sentado", "type": "strength", "sets": 2, "min": 8, "max": 12, "rir": "1–2", "rest": "2 min", "muscle": "Isquios", "note": "Pausa breve en flexión."}, {"key": "hip_abduction", "name": "Abducción de cadera", "type": "strength", "sets": 2, "min": 12, "max": 20, "rir": "1", "rest": "90 s", "muscle": "Glúteo medio", "note": "Sin impulso."}, {"key": "standing_calf", "name": "Gemelo de pie", "type": "strength", "sets": 3, "min": 8, "max": 12, "rir": "1–2", "rest": "90–120 s", "muscle": "Gemelos", "note": "ROM completo."}, {"key": "cable_crunch", "name": "Crunch en polea", "type": "strength", "sets": 3, "min": 10, "max": 15, "rir": "1–2", "rest": "90 s", "muscle": "Core", "note": "Controlado."}]}, "2": {"key": "upperA", "title": "Upper A", "type": "gym", "subtitle": "Pectoral y espalda", "exercises": [{"key": "incline_db_press", "name": "Press inclinado con mancuernas", "type": "strength", "sets": 3, "min": 6, "max": 8, "rir": "1–2", "rest": "2–3 min", "muscle": "Pectoral superior", "note": "Prioritario."}, {"key": "chest_supported_row", "name": "Remo con pecho apoyado", "type": "strength", "sets": 3, "min": 6, "max": 10, "rir": "1–2", "rest": "2–3 min", "muscle": "Espalda", "note": "Evita compensar con lumbar."}, {"key": "machine_chest_press", "name": "Press de pecho en máquina", "type": "strength", "sets": 2, "min": 8, "max": 10, "rir": "1–2", "rest": "2 min", "muscle": "Pectoral", "note": "Trayectoria cómoda para hombro."}, {"key": "lat_pulldown", "name": "Jalón al pecho", "type": "strength", "sets": 3, "min": 8, "max": 10, "rir": "1–2", "rest": "2 min", "muscle": "Dorsal", "note": "Codo hacia la cadera."}, {"key": "cable_lateral_raise", "name": "Elevación lateral en polea", "type": "strength", "sets": 3, "min": 12, "max": 20, "rir": "1", "rest": "90 s", "muscle": "Deltoide lateral", "note": "Controlado."}, {"key": "triceps_pushdown", "name": "Extensión de tríceps en polea", "type": "strength", "sets": 2, "min": 10, "max": 15, "rir": "1", "rest": "90 s", "muscle": "Tríceps", "note": "Codos estables."}, {"key": "cable_curl", "name": "Curl de bíceps en polea/barra", "type": "strength", "sets": 2, "min": 8, "max": 12, "rir": "1", "rest": "90 s", "muscle": "Bíceps", "note": "Sin balanceo."}]}, "3": {"key": "cardioMob", "title": "Cardio + movilidad", "type": "cardio", "subtitle": "Base aeróbica y movilidad", "exercises": []}, "4": {"key": "lowerB", "title": "Lower B", "type": "gym", "subtitle": "Glúteo, isquios y cuádriceps", "exercises": [{"key": "hip_thrust", "name": "Hip thrust", "type": "strength", "sets": 3, "min": 6, "max": 8, "rir": "1–2", "rest": "2–3 min", "muscle": "Glúteo", "note": "Prioritario."}, {"key": "rdl", "name": "Peso muerto rumano", "type": "strength", "sets": 3, "min": 6, "max": 8, "rir": "1–2", "rest": "3 min", "muscle": "Glúteo + isquios", "note": "Cadera atrás; barra cerca."}, {"key": "unilateral_leg_press", "name": "Prensa unilateral", "type": "strength", "sets": 3, "min": 8, "max": 10, "rir": "1–2", "rest": "2–3 min", "muscle": "Cuádriceps + glúteo", "note": "Mismo ROM en ambos lados."}, {"key": "leg_curl", "name": "Curl femoral", "type": "strength", "sets": 3, "min": 10, "max": 12, "rir": "1–2", "rest": "2 min", "muscle": "Isquios", "note": "Control excéntrico."}, {"key": "leg_extension", "name": "Extensión de cuádriceps", "type": "strength", "sets": 2, "min": 12, "max": 15, "rir": "1", "rest": "90 s", "muscle": "Cuádriceps", "note": "Baja fatiga sistémica."}, {"key": "hip_abduction", "name": "Abducción de cadera", "type": "strength", "sets": 2, "min": 12, "max": 20, "rir": "1", "rest": "90 s", "muscle": "Glúteo medio", "note": "Pausa en apertura."}, {"key": "calf_raise", "name": "Gemelo sentado/de pie", "type": "strength", "sets": 3, "min": 10, "max": 15, "rir": "1–2", "rest": "90 s", "muscle": "Gemelos", "note": "ROM completo."}, {"key": "pallof_press", "name": "Pallof press", "type": "strength", "sets": 2, "min": 10, "max": 12, "rir": "1–2", "rest": "60–90 s", "muscle": "Core", "note": "Por lado."}]}, "5": {"key": "upperB", "title": "Upper B", "type": "gym", "subtitle": "Dorsal, pectoral y hombro", "exercises": [{"key": "pull_up", "name": "Dominadas", "type": "strength", "sets": 3, "min": 6, "max": 10, "rir": "1–2", "rest": "2–3 min", "muscle": "Dorsal", "note": "10 limpias en todas las series → lastre."}, {"key": "incline_smith_press", "name": "Press inclinado en Smith", "type": "strength", "sets": 3, "min": 8, "max": 10, "rir": "1–2", "rest": "2–3 min", "muscle": "Pectoral", "note": "Progresión estable."}, {"key": "seated_cable_row", "name": "Remo sentado en polea", "type": "strength", "sets": 3, "min": 8, "max": 12, "rir": "1–2", "rest": "2 min", "muscle": "Espalda", "note": "Control escapular."}, {"key": "pec_deck", "name": "Pec-deck", "type": "strength", "sets": 2, "min": 10, "max": 15, "rir": "1", "rest": "90 s", "muscle": "Pectoral", "note": "No fuerces el hombro."}, {"key": "lateral_raise", "name": "Elevación lateral", "type": "strength", "sets": 3, "min": 12, "max": 20, "rir": "1", "rest": "90 s", "muscle": "Deltoide lateral", "note": "Controlado."}, {"key": "reverse_pec_deck", "name": "Reverse pec-deck", "type": "strength", "sets": 2, "min": 12, "max": 20, "rir": "1", "rest": "90 s", "muscle": "Deltoide posterior", "note": "Controlado."}, {"key": "overhead_triceps", "name": "Tríceps por encima de la cabeza", "type": "strength", "sets": 2, "min": 10, "max": 15, "rir": "1", "rest": "90 s", "muscle": "Tríceps", "note": "ROM cómodo."}, {"key": "biceps_curl", "name": "Curl de bíceps", "type": "strength", "sets": 2, "min": 10, "max": 15, "rir": "1", "rest": "90 s", "muscle": "Bíceps", "note": "Técnica estricta."}]}, "6": {"key": "accessory", "title": "Accesorios", "type": "gym", "subtitle": "Hombro, brazos, glúteo y core", "exercises": [{"key": "lateral_raise", "name": "Elevación lateral en polea/máquina", "type": "strength", "sets": 3, "min": 12, "max": 20, "rir": "1", "rest": "90 s", "muscle": "Deltoide lateral", "note": "Controlado."}, {"key": "reverse_pec_deck", "name": "Reverse pec-deck", "type": "strength", "sets": 3, "min": 12, "max": 20, "rir": "1", "rest": "90 s", "muscle": "Deltoide posterior", "note": "Controlado."}, {"key": "biceps_curl", "name": "Curl inclinado o polea", "type": "strength", "sets": 3, "min": 10, "max": 15, "rir": "1", "rest": "90 s", "muscle": "Bíceps", "note": "Mantén la variante varias semanas."}, {"key": "triceps_extension", "name": "Extensión de tríceps", "type": "strength", "sets": 3, "min": 10, "max": 15, "rir": "1", "rest": "90 s", "muscle": "Tríceps", "note": "Variante estable."}, {"key": "hip_abduction", "name": "Abducción de cadera", "type": "strength", "sets": 3, "min": 12, "max": 20, "rir": "1", "rest": "90 s", "muscle": "Glúteo medio", "note": "Baja fatiga."}, {"key": "calf_raise", "name": "Gemelo", "type": "strength", "sets": 3, "min": 10, "max": 15, "rir": "1", "rest": "90 s", "muscle": "Gemelos", "note": "Pausa abajo y arriba."}, {"key": "cable_crunch", "name": "Crunch en polea / elevación de rodillas", "type": "strength", "sets": 3, "min": 10, "max": 15, "rir": "1", "rest": "90 s", "muscle": "Core", "note": "Controlado."}]}}, "season": {"0": {"key": "rest", "title": "Descanso", "type": "rest", "subtitle": "Recuperación", "exercises": []}, "1": {"key": "swimMon", "title": "Natación", "type": "swim", "subtitle": "Sesión del entrenador", "exercises": []}, "2": {"key": "seasonA", "title": "Gym A", "type": "gym", "subtitle": "Full body", "exercises": [{"key": "hack_squat", "name": "Hack squat", "type": "strength", "sets": 3, "min": 6, "max": 8, "rir": "2", "rest": "3 min", "muscle": "Cuádriceps + glúteo", "note": "Prioridad tren inferior."}, {"key": "incline_db_press", "name": "Press inclinado con mancuernas", "type": "strength", "sets": 3, "min": 6, "max": 8, "rir": "2", "rest": "2–3 min", "muscle": "Pectoral superior", "note": "Prioritario."}, {"key": "chest_supported_row", "name": "Remo con pecho apoyado", "type": "strength", "sets": 3, "min": 6, "max": 10, "rir": "2", "rest": "2–3 min", "muscle": "Espalda", "note": "Control lumbar."}, {"key": "seated_leg_curl", "name": "Curl femoral sentado", "type": "strength", "sets": 2, "min": 8, "max": 12, "rir": "2", "rest": "2 min", "muscle": "Isquios", "note": "Controlado."}, {"key": "cable_lateral_raise", "name": "Elevación lateral en polea", "type": "strength", "sets": 3, "min": 12, "max": 20, "rir": "1–2", "rest": "90 s", "muscle": "Deltoide lateral", "note": "Controlado."}, {"key": "triceps_pushdown", "name": "Extensión de tríceps", "type": "strength", "sets": 2, "min": 10, "max": 15, "rir": "1–2", "rest": "90 s", "muscle": "Tríceps", "note": "Codos estables."}, {"key": "cable_crunch", "name": "Crunch en polea", "type": "strength", "sets": 3, "min": 10, "max": 15, "rir": "1–2", "rest": "90 s", "muscle": "Core", "note": "Controlado."}]}, "3": {"key": "swimWed", "title": "Natación", "type": "swim", "subtitle": "Sesión del entrenador", "exercises": []}, "4": {"key": "seasonB", "title": "Gym B", "type": "gym", "subtitle": "Full body", "exercises": [{"key": "rdl", "name": "Peso muerto rumano", "type": "strength", "sets": 3, "min": 6, "max": 8, "rir": "2", "rest": "3 min", "muscle": "Glúteo + isquios", "note": "No llegar al fallo."}, {"key": "pull_or_pulldown", "name": "Dominadas o jalón", "type": "strength", "sets": 3, "min": 6, "max": 10, "rir": "2", "rest": "2–3 min", "muscle": "Dorsal", "note": "Técnica limpia."}, {"key": "leg_press", "name": "Prensa", "type": "strength", "sets": 3, "min": 8, "max": 12, "rir": "2", "rest": "3 min", "muscle": "Cuádriceps + glúteo", "note": "ROM controlado."}, {"key": "machine_chest_press", "name": "Press de pecho en máquina", "type": "strength", "sets": 2, "min": 8, "max": 12, "rir": "2", "rest": "2 min", "muscle": "Pectoral", "note": "Trayectoria cómoda."}, {"key": "reverse_pec_deck", "name": "Reverse pec-deck", "type": "strength", "sets": 2, "min": 12, "max": 20, "rir": "1–2", "rest": "90 s", "muscle": "Deltoide posterior", "note": "Control escapular."}, {"key": "biceps_curl", "name": "Curl de bíceps", "type": "strength", "sets": 2, "min": 8, "max": 12, "rir": "1–2", "rest": "90 s", "muscle": "Bíceps", "note": "Sin impulso."}, {"key": "standing_calf", "name": "Gemelo de pie", "type": "strength", "sets": 3, "min": 8, "max": 12, "rir": "1–2", "rest": "90 s", "muscle": "Gemelos", "note": "ROM completo."}]}, "5": {"key": "swimFri", "title": "Natación", "type": "swim", "subtitle": "Sesión del entrenador", "exercises": []}, "6": {"key": "seasonC", "title": "Gym C", "type": "gym", "subtitle": "Full body con accesorios", "exercises": [{"key": "hip_thrust", "name": "Hip thrust", "type": "strength", "sets": 3, "min": 6, "max": 10, "rir": "1–2", "rest": "2–3 min", "muscle": "Glúteo", "note": "Prioritario."}, {"key": "incline_smith_press", "name": "Press inclinado en Smith", "type": "strength", "sets": 3, "min": 8, "max": 10, "rir": "1–2", "rest": "2–3 min", "muscle": "Pectoral", "note": "Prioritario."}, {"key": "seated_cable_row", "name": "Remo sentado en polea", "type": "strength", "sets": 3, "min": 8, "max": 12, "rir": "1–2", "rest": "2 min", "muscle": "Espalda", "note": "Control escapular."}, {"key": "leg_extension", "name": "Extensión de cuádriceps", "type": "strength", "sets": 2, "min": 10, "max": 15, "rir": "1–2", "rest": "90 s", "muscle": "Cuádriceps", "note": "Volumen adicional."}, {"key": "leg_curl", "name": "Curl femoral", "type": "strength", "sets": 2, "min": 10, "max": 15, "rir": "1–2", "rest": "90 s", "muscle": "Isquios", "note": "Controlado."}, {"key": "lateral_raise", "name": "Elevación lateral", "type": "strength", "sets": 3, "min": 12, "max": 20, "rir": "1", "rest": "90 s", "muscle": "Deltoide lateral", "note": "Controlado."}, {"key": "biceps_curl", "name": "Curl de bíceps", "type": "strength", "sets": 2, "min": 10, "max": 15, "rir": "1–2", "rest": "90 s", "muscle": "Bíceps", "note": "Técnica estricta."}, {"key": "overhead_triceps", "name": "Tríceps por encima de la cabeza", "type": "strength", "sets": 2, "min": 10, "max": 15, "rir": "1–2", "rest": "90 s", "muscle": "Tríceps", "note": "ROM cómodo."}, {"key": "hanging_knee_raise", "name": "Elevación de rodillas / crunch inverso", "type": "strength", "sets": 3, "min": 8, "max": 15, "rir": "1–2", "rest": "90 s", "muscle": "Core", "note": "Control pélvico."}]}}};
const EXERCISE_LIBRARY=[{"key":"back_squat","name":"Sentadilla trasera con barra","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":5,"max":8,"rir":"1–2","rest":"3 min","muscle":"Cuádriceps + glúteo","note":"Profundidad y técnica estables."},{"key":"front_squat","name":"Sentadilla frontal","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":5,"max":8,"rir":"1–2","rest":"3 min","muscle":"Cuádriceps + glúteo","note":"Torso estable."},{"key":"hack_squat","name":"Hack squat","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":6,"max":10,"rir":"1–2","rest":"3 min","muscle":"Cuádriceps + glúteo","note":"ROM controlado."},{"key":"leg_press","name":"Prensa","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":8,"max":12,"rir":"1–2","rest":"3 min","muscle":"Cuádriceps + glúteo","note":"Control pélvico."},{"key":"unilateral_leg_press","name":"Prensa unilateral","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2–3 min","muscle":"Cuádriceps + glúteo","note":"Mismo ROM por lado."},{"key":"bulgarian_split_squat","name":"Sentadilla búlgara","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2–3 min","muscle":"Cuádriceps + glúteo","note":"Estabilidad y rango cómodo."},{"key":"walking_lunge","name":"Zancadas caminando","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Cuádriceps + glúteo","note":"Reps por pierna."},{"key":"rdl","name":"Peso muerto rumano","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":6,"max":10,"rir":"1–2","rest":"3 min","muscle":"Glúteo + isquios","note":"Cadera atrás; barra cerca."},{"key":"deadlift","name":"Peso muerto convencional","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":4,"max":6,"rir":"2","rest":"3 min","muscle":"Cadena posterior","note":"Técnica estricta; no necesario para hipertrofia si genera demasiada fatiga."},{"key":"hip_thrust","name":"Hip thrust","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Glúteo","note":"Pelvis neutra al final."},{"key":"leg_extension","name":"Extensión de cuádriceps","type":"strength","pattern":"Aislamiento","group":"Pierna","sets":2,"min":10,"max":15,"rir":"1","rest":"90 s","muscle":"Cuádriceps","note":"Controlado."},{"key":"leg_curl","name":"Curl femoral tumbado","type":"strength","pattern":"Aislamiento","group":"Pierna","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Isquios","note":"Excéntrica controlada."},{"key":"seated_leg_curl","name":"Curl femoral sentado","type":"strength","pattern":"Aislamiento","group":"Pierna","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Isquios","note":"Pausa breve en flexión."},{"key":"hip_abduction","name":"Abducción de cadera","type":"strength","pattern":"Aislamiento","group":"Pierna","sets":2,"min":12,"max":20,"rir":"1","rest":"90 s","muscle":"Glúteo medio","note":"Sin impulso."},{"key":"standing_calf","name":"Gemelo de pie","type":"strength","pattern":"Aislamiento","group":"Pierna","sets":3,"min":8,"max":15,"rir":"1–2","rest":"90 s","muscle":"Gemelos","note":"ROM completo."},{"key":"seated_calf","name":"Gemelo sentado","type":"strength","pattern":"Aislamiento","group":"Pierna","sets":3,"min":10,"max":15,"rir":"1–2","rest":"90 s","muscle":"Sóleo","note":"ROM completo."},{"key":"bench_press","name":"Press banca con barra","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":5,"max":8,"rir":"1–2","rest":"3 min","muscle":"Pectoral + tríceps","note":"Escápulas estables."},{"key":"incline_barbell_press","name":"Press inclinado con barra","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Pectoral superior","note":"Ángulo moderado."},{"key":"incline_db_press","name":"Press inclinado con mancuernas","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Pectoral superior","note":"ROM cómodo."},{"key":"incline_smith_press","name":"Press inclinado en Smith","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Pectoral superior","note":"Trayectoria estable."},{"key":"machine_chest_press","name":"Press de pecho en máquina","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Pectoral","note":"Trayectoria cómoda."},{"key":"dips","name":"Fondos en paralelas","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Pectoral + tríceps","note":"Solo si hombro cómodo."},{"key":"pec_deck","name":"Pec-deck","type":"strength","pattern":"Aislamiento","group":"Torso","sets":2,"min":10,"max":15,"rir":"1","rest":"90 s","muscle":"Pectoral","note":"No forzar el estiramiento."},{"key":"pull_up","name":"Dominadas pronas","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Dorsal + bíceps","note":"Añade lastre cuando proceda."},{"key":"chin_up","name":"Dominadas supinas","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Dorsal + bíceps","note":"Controladas."},{"key":"lat_pulldown","name":"Jalón al pecho","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Dorsal","note":"Codo hacia la cadera."},{"key":"chest_supported_row","name":"Remo con pecho apoyado","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Espalda","note":"Sin compensar con lumbar."},{"key":"seated_cable_row","name":"Remo sentado en polea","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Espalda","note":"Control escapular."},{"key":"barbell_row","name":"Remo con barra","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Espalda","note":"Torso estable."},{"key":"one_arm_db_row","name":"Remo unilateral con mancuerna","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Dorsal + espalda","note":"Por lado."},{"key":"overhead_press","name":"Press militar","type":"strength","pattern":"Compuesto","group":"Hombro","sets":2,"min":6,"max":10,"rir":"2","rest":"2–3 min","muscle":"Deltoides + tríceps","note":"Opcional; no imprescindible si ya hay mucho press y natación."},{"key":"lateral_raise","name":"Elevación lateral","type":"strength","pattern":"Aislamiento","group":"Hombro","sets":3,"min":12,"max":20,"rir":"1","rest":"90 s","muscle":"Deltoide lateral","note":"Controlado."},{"key":"cable_lateral_raise","name":"Elevación lateral en polea","type":"strength","pattern":"Aislamiento","group":"Hombro","sets":3,"min":12,"max":20,"rir":"1","rest":"90 s","muscle":"Deltoide lateral","note":"Controlado."},{"key":"reverse_pec_deck","name":"Reverse pec-deck","type":"strength","pattern":"Aislamiento","group":"Hombro","sets":2,"min":12,"max":20,"rir":"1","rest":"90 s","muscle":"Deltoide posterior","note":"No encoger trapecio."},{"key":"barbell_curl","name":"Curl con barra","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":2,"min":8,"max":12,"rir":"1","rest":"90 s","muscle":"Bíceps","note":"Técnica estricta."},{"key":"db_curl","name":"Curl con mancuernas","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":2,"min":10,"max":15,"rir":"1","rest":"90 s","muscle":"Bíceps","note":"Sin balanceo."},{"key":"cable_curl","name":"Curl en polea","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":2,"min":10,"max":15,"rir":"1","rest":"90 s","muscle":"Bíceps","note":"Tensión continua."},{"key":"triceps_pushdown","name":"Extensión de tríceps en polea","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":2,"min":10,"max":15,"rir":"1","rest":"90 s","muscle":"Tríceps","note":"Codos estables."},{"key":"overhead_triceps","name":"Tríceps por encima de la cabeza","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":2,"min":10,"max":15,"rir":"1","rest":"90 s","muscle":"Tríceps","note":"ROM cómodo."},{"key":"cable_crunch","name":"Crunch en polea","type":"strength","pattern":"Aislamiento","group":"Core","sets":3,"min":10,"max":15,"rir":"1–2","rest":"90 s","muscle":"Recto abdominal","note":"Flexión controlada."},{"key":"hanging_knee_raise","name":"Elevación de rodillas colgado","type":"strength","pattern":"Aislamiento","group":"Core","sets":3,"min":8,"max":15,"rir":"1–2","rest":"90 s","muscle":"Core","note":"Control pélvico."},{"key":"pallof_press","name":"Pallof press","type":"strength","pattern":"Aislamiento","group":"Core","sets":2,"min":10,"max":12,"rir":"2","rest":"60–90 s","muscle":"Core","note":"Por lado."},{"key":"plank","name":"Plancha","type":"strength","pattern":"Aislamiento","group":"Core","sets":3,"min":30,"max":60,"rir":"2","rest":"60 s","muscle":"Core","note":"Reps = segundos."},{"key":"knee_to_wall","name":"Knee-to-wall","type":"mobility","pattern":"Movilidad","group":"Tobillo","dose":"2 × 10/lado + 30 s","note":"Talón apoyado."},{"key":"deep_squat_hold","name":"Sentadilla profunda asistida","type":"mobility","pattern":"Movilidad","group":"Cadera/tobillo","dose":"2 × 45 s","note":"Respira y mantén control."},{"key":"hip_90_90","name":"90/90 hip switches","type":"mobility","pattern":"Movilidad","group":"Cadera","dose":"2 × 8/lado","note":"Sin impulso."},{"key":"couch_stretch","name":"Couch stretch","type":"mobility","pattern":"Movilidad","group":"Cadera","dose":"2 × 45 s/lado","note":"Pelvis neutra."},{"key":"adductor_rockback","name":"Adductor rock-back","type":"mobility","pattern":"Movilidad","group":"Cadera","dose":"2 × 10/lado","note":"Espalda neutra."},{"key":"open_book","name":"Open book","type":"mobility","pattern":"Movilidad","group":"Torácica","dose":"2 × 8/lado","note":"Rodillas juntas."},{"key":"lat_bench_stretch","name":"Lat stretch en banco","type":"mobility","pattern":"Movilidad","group":"Torácica/hombro","dose":"2 × 45 s","note":"No arquear lumbar."},{"key":"wall_slide","name":"Wall slides","type":"mobility","pattern":"Movilidad","group":"Hombro/escápula","dose":"2 × 10","note":"Costillas abajo."},{"key":"pec_doorway","name":"Pectoral en marco de puerta","type":"mobility","pattern":"Movilidad","group":"Hombro/pectoral","dose":"2 × 30–45 s/lado","note":"No forzar rotación externa."},{"key":"smith_squat","name":"Sentadilla en Smith","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":6,"max":10,"rir":"1–2","rest":"3 min","muscle":"Cuádriceps + glúteo","note":"Pies colocados para mantener una trayectoria cómoda."},{"key":"goblet_squat","name":"Sentadilla goblet","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Cuádriceps + glúteo","note":"Mancuerna o kettlebell frente al pecho."},{"key":"pendulum_squat","name":"Sentadilla péndulo","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":6,"max":10,"rir":"1–2","rest":"3 min","muscle":"Cuádriceps + glúteo","note":"ROM cómodo y pelvis estable."},{"key":"db_rdl","name":"Peso muerto rumano con mancuernas","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2–3 min","muscle":"Glúteo + isquios","note":"Bisagra de cadera, espalda neutra."},{"key":"glute_bridge","name":"Puente de glúteo","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Glúteo","note":"Pausa breve arriba."},{"key":"smith_hip_thrust","name":"Hip thrust en Smith","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Glúteo","note":"Extensión completa sin hiperextender la espalda."},{"key":"cable_pull_through","name":"Pull-through en polea","type":"strength","pattern":"Compuesto","group":"Pierna","sets":3,"min":10,"max":15,"rir":"1–2","rest":"90–120 s","muscle":"Glúteo + isquios","note":"Bisagra de cadera con cable bajo."},{"key":"cable_kickback","name":"Patada de glúteo en polea","type":"strength","pattern":"Aislamiento","group":"Pierna","sets":3,"min":10,"max":15,"rir":"1–2","rest":"60–90 s","muscle":"Glúteo","note":"Pelvis estable."},{"key":"hip_adduction","name":"Aducción de cadera en máquina","type":"strength","pattern":"Aislamiento","group":"Pierna","sets":3,"min":10,"max":15,"rir":"1–2","rest":"60–90 s","muscle":"Aductores","note":"Controla el cierre y la apertura."},{"key":"cable_abduction","name":"Abducción de cadera en polea","type":"strength","pattern":"Aislamiento","group":"Pierna","sets":3,"min":12,"max":20,"rir":"1–2","rest":"60–90 s","muscle":"Glúteo medio","note":"Sin balanceo del tronco."},{"key":"single_leg_extension","name":"Extensión de cuádriceps unilateral","type":"strength","pattern":"Aislamiento","group":"Pierna","sets":2,"min":10,"max":15,"rir":"1–2","rest":"60–90 s","muscle":"Cuádriceps","note":"Una pierna cada vez."},{"key":"flat_db_press","name":"Press banca con mancuernas","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Pectoral + tríceps","note":"Escápulas estables."},{"key":"plate_chest_press","name":"Press de pecho convergente en máquina","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Pectoral","note":"Recorrido cómodo y controlado."},{"key":"incline_machine_press","name":"Press inclinado en máquina","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Pectoral superior","note":"Evita elevar los hombros."},{"key":"push_up","name":"Flexiones","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":20,"rir":"1–2","rest":"90 s","muscle":"Pectoral + tríceps","note":"Cuerpo alineado."},{"key":"cable_fly","name":"Aperturas en polea","type":"strength","pattern":"Aislamiento","group":"Torso","sets":3,"min":10,"max":15,"rir":"1–2","rest":"60–90 s","muscle":"Pectoral","note":"Mantén ligera flexión de codo."},{"key":"cable_fly_low_high","name":"Aperturas en polea de abajo hacia arriba","type":"strength","pattern":"Aislamiento","group":"Torso","sets":3,"min":10,"max":15,"rir":"1–2","rest":"60–90 s","muscle":"Pectoral superior","note":"Recorrido ascendente controlado."},{"key":"tbar_row","name":"Remo T-bar","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2–3 min","muscle":"Espalda","note":"Evita tirar con impulso."},{"key":"machine_row","name":"Remo en máquina","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Espalda","note":"Pausa breve al final."},{"key":"high_row_machine","name":"Remo alto en máquina","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Dorsal + espalda","note":"Tira hacia la zona alta del torso."},{"key":"one_arm_lat_pulldown","name":"Jalón unilateral en polea","type":"strength","pattern":"Compuesto","group":"Torso","sets":3,"min":8,"max":12,"rir":"1–2","rest":"90–120 s","muscle":"Dorsal","note":"Un brazo cada vez."},{"key":"straight_arm_pulldown","name":"Pullover con brazos rectos en polea","type":"strength","pattern":"Aislamiento","group":"Torso","sets":3,"min":10,"max":15,"rir":"1–2","rest":"60–90 s","muscle":"Dorsal","note":"Brazos casi extendidos y tronco estable."},{"key":"machine_pullover","name":"Pullover en máquina","type":"strength","pattern":"Aislamiento","group":"Torso","sets":3,"min":10,"max":15,"rir":"1–2","rest":"90 s","muscle":"Dorsal","note":"Mantén el torso apoyado."},{"key":"seated_db_shoulder_press","name":"Press de hombro con mancuernas sentado","type":"strength","pattern":"Compuesto","group":"Hombro","sets":3,"min":6,"max":10,"rir":"1–2","rest":"2 min","muscle":"Deltoides + tríceps","note":"No fuerces el rango si molesta el hombro."},{"key":"machine_shoulder_press","name":"Press de hombro en máquina","type":"strength","pattern":"Compuesto","group":"Hombro","sets":3,"min":8,"max":12,"rir":"1–2","rest":"2 min","muscle":"Deltoides + tríceps","note":"Ajusta el asiento para una trayectoria cómoda."},{"key":"machine_lateral_raise","name":"Elevación lateral en máquina","type":"strength","pattern":"Aislamiento","group":"Hombro","sets":3,"min":12,"max":20,"rir":"1–2","rest":"60–90 s","muscle":"Deltoide lateral","note":"Controla la bajada."},{"key":"cable_rear_delt_fly","name":"Apertura posterior en polea","type":"strength","pattern":"Aislamiento","group":"Hombro","sets":3,"min":12,"max":20,"rir":"1–2","rest":"60–90 s","muscle":"Deltoide posterior","note":"Sin encoger los hombros."},{"key":"face_pull","name":"Face pull en polea","type":"strength","pattern":"Aislamiento","group":"Hombro","sets":3,"min":12,"max":20,"rir":"1–2","rest":"60–90 s","muscle":"Deltoide posterior + espalda alta","note":"Tira hacia la cara con control."},{"key":"hammer_curl","name":"Curl martillo","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":3,"min":8,"max":12,"rir":"1–2","rest":"60–90 s","muscle":"Bíceps + braquial","note":"Agarre neutro."},{"key":"preacher_curl","name":"Curl predicador","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":3,"min":8,"max":12,"rir":"1–2","rest":"60–90 s","muscle":"Bíceps","note":"Evita despegar el brazo del apoyo."},{"key":"incline_db_curl","name":"Curl inclinado con mancuernas","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":3,"min":8,"max":12,"rir":"1–2","rest":"60–90 s","muscle":"Bíceps","note":"Brazos detrás del torso."},{"key":"rope_pushdown","name":"Extensión de tríceps con cuerda","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":3,"min":10,"max":15,"rir":"1–2","rest":"60–90 s","muscle":"Tríceps","note":"Codos fijos."},{"key":"cable_overhead_triceps","name":"Extensión de tríceps por encima de la cabeza en polea","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":3,"min":10,"max":15,"rir":"1–2","rest":"60–90 s","muscle":"Tríceps","note":"Mantén los codos estables."},{"key":"skull_crusher","name":"Extensión de tríceps tumbado","type":"strength","pattern":"Aislamiento","group":"Brazos","sets":3,"min":8,"max":12,"rir":"1–2","rest":"90 s","muscle":"Tríceps","note":"Con barra Z o mancuernas."},{"key":"reverse_crunch","name":"Crunch inverso","type":"strength","pattern":"Aislamiento","group":"Core","sets":3,"min":10,"max":15,"rir":"1–2","rest":"60–90 s","muscle":"Recto abdominal","note":"Eleva la pelvis con control."},{"key":"machine_crunch","name":"Crunch abdominal en máquina","type":"strength","pattern":"Aislamiento","group":"Core","sets":3,"min":10,"max":15,"rir":"1–2","rest":"60–90 s","muscle":"Recto abdominal","note":"Flexiona el tronco, no solo la cadera."},{"key":"ab_wheel","name":"Rueda abdominal","type":"strength","pattern":"Aislamiento","group":"Core","sets":3,"min":6,"max":12,"rir":"1–2","rest":"90 s","muscle":"Core","note":"Mantén la pelvis en retroversión."},{"key":"dead_bug","name":"Dead bug","type":"strength","pattern":"Control","group":"Core","sets":3,"min":8,"max":12,"rir":"1–2","rest":"60 s","muscle":"Core","note":"Repeticiones por lado."},{"key":"cable_woodchop","name":"Woodchop en polea","type":"strength","pattern":"Aislamiento","group":"Core","sets":3,"min":10,"max":15,"rir":"1–2","rest":"60 s","muscle":"Oblicuos + core","note":"Controla la rotación."},{"key":"hamstring_stretch","name":"Estiramiento de isquios","type":"mobility","pattern":"Movilidad","group":"Cadera","dose":"2 × 30–45 s","note":"Sin dolor ni rebotes."},{"key":"hip_flexor_stretch","name":"Estiramiento de flexor de cadera en zancada","type":"mobility","pattern":"Movilidad","group":"Cadera","dose":"2 × 30–45 s por lado","note":"Glúteo contraído en la pierna atrasada."},{"key":"calf_stretch","name":"Estiramiento de gemelo en pared","type":"mobility","pattern":"Movilidad","group":"Tobillo","dose":"2 × 30–45 s por lado","note":"Talón apoyado."},{"key":"band_external_rotation","name":"Rotación externa de hombro con banda","type":"mobility","pattern":"Movilidad","group":"Hombro/escápula","dose":"2 × 12–15","note":"Carga ligera y controlada."},{"key":"cat_cow","name":"Cat-cow","type":"mobility","pattern":"Movilidad","group":"Torácica","dose":"2 × 8–10","note":"Movimiento suave de columna."},{"key":"child_pose_lat","name":"Child's pose con énfasis dorsal","type":"mobility","pattern":"Movilidad","group":"Torácica/hombro","dose":"2 × 30–45 s","note":"Respira profundo."},{"key":"world_greatest_stretch","name":"World's greatest stretch","type":"mobility","pattern":"Movilidad","group":"Cadera/torácica","dose":"2 × 5 por lado","note":"Movimiento lento y controlado."}];

const EXERCISE_FAMILY_ORDER=["Cuádriceps","Isquios / cadena posterior","Glúteo","Aductores","Gemelos","Pecho","Espalda","Hombro","Bíceps","Tríceps","Core","Movilidad"];
function exerciseFamily(e){
 if(!e)return"Otros";
 if(e.type==="mobility")return"Movilidad";
 const m=String(e.muscle||"").toLowerCase(),k=String(e.key||"");
 if(m.includes("cuádriceps"))return"Cuádriceps";
 if(m.includes("isquios")||m.includes("cadena posterior"))return"Isquios / cadena posterior";
 if(m.includes("aductor"))return"Aductores";
 if(m.includes("glúteo"))return"Glúteo";
 if(m.includes("gemelo")||m.includes("sóleo"))return"Gemelos";
 if(m.includes("pectoral"))return"Pecho";
 if(m.includes("deltoide")||m.includes("hombro"))return"Hombro";
 if(m.includes("dorsal")||m.includes("espalda"))return"Espalda";
 if(m.includes("bíceps")||m.includes("braquial"))return"Bíceps";
 if(m.includes("tríceps"))return"Tríceps";
 if(m.includes("core")||m.includes("abdominal")||m.includes("oblicuo"))return"Core";
 return e.group||"Otros"
}

const FOOD_DB={"rice": {"cat": "Carbohidrato", "name": "Arroz cocido", "unit": "g", "ref": "peso cocido", "kcal": 130, "p": 2.7, "c": 28, "f": 0.3}, "pasta": {"cat": "Carbohidrato", "name": "Pasta cocida", "unit": "g", "ref": "peso cocido", "kcal": 158, "p": 5.8, "c": 30.9, "f": 0.9}, "potato": {"cat": "Carbohidrato", "name": "Patata cocida", "unit": "g", "ref": "peso cocido", "kcal": 87, "p": 1.9, "c": 20.1, "f": 0.1}, "bread": {"cat": "Carbohidrato", "name": "Pan", "unit": "g", "ref": "peso directo", "kcal": 250, "p": 8.5, "c": 49, "f": 3.2}, "oats": {"cat": "Carbohidrato", "name": "Avena", "unit": "g", "ref": "peso en seco", "kcal": 389, "p": 16.9, "c": 66.3, "f": 6.9}, "lentils": {"cat": "Carbohidrato", "name": "Lentejas cocidas", "unit": "g", "ref": "peso cocido", "kcal": 116, "p": 9, "c": 20.1, "f": 0.4}, "chicken": {"cat": "Proteína", "name": "Pechuga de pollo", "unit": "g", "ref": "peso cocinado", "kcal": 165, "p": 31, "c": 0, "f": 3.6}, "turkey": {"cat": "Proteína", "name": "Pavo", "unit": "g", "ref": "peso cocinado", "kcal": 135, "p": 29, "c": 0, "f": 1.6}, "beef": {"cat": "Proteína", "name": "Ternera magra", "unit": "g", "ref": "peso cocinado", "kcal": 200, "p": 29, "c": 0, "f": 9}, "whitefish": {"cat": "Proteína", "name": "Pescado blanco", "unit": "g", "ref": "peso cocinado", "kcal": 105, "p": 23, "c": 0, "f": 1.5}, "salmon": {"cat": "Proteína", "name": "Salmón", "unit": "g", "ref": "peso cocinado", "kcal": 208, "p": 20, "c": 0, "f": 13}, "tuna": {"cat": "Proteína", "name": "Atún al natural", "unit": "g", "ref": "peso escurrido", "kcal": 116, "p": 26, "c": 0, "f": 1}, "egg": {"cat": "Proteína", "name": "Huevo", "unit": "ud", "ref": "unidad mediana", "perUnit": true, "kcal": 72, "p": 6.3, "c": 0.4, "f": 4.8}, "veg": {"cat": "Verdura", "name": "Verduras variadas", "unit": "g", "ref": "peso preparado", "kcal": 35, "p": 2, "c": 5, "f": 0.3}, "banana": {"cat": "Fruta", "name": "Plátano", "unit": "ud", "ref": "unidad mediana", "perUnit": true, "kcal": 105, "p": 1.3, "c": 27, "f": 0.4}, "apple": {"cat": "Fruta", "name": "Manzana", "unit": "ud", "ref": "unidad mediana", "perUnit": true, "kcal": 95, "p": 0.5, "c": 25, "f": 0.3}, "orange": {"cat": "Fruta", "name": "Naranja", "unit": "ud", "ref": "unidad mediana", "perUnit": true, "kcal": 62, "p": 1.2, "c": 15.4, "f": 0.2}, "kiwi": {"cat": "Fruta", "name": "Kiwi", "unit": "ud", "ref": "unidad mediana", "perUnit": true, "kcal": 42, "p": 0.8, "c": 10.1, "f": 0.4}, "milk": {"cat": "Lácteo", "name": "Leche semidesnatada", "unit": "ml", "ref": "volumen", "kcal": 47, "p": 3.4, "c": 4.8, "f": 1.6}, "yogurt": {"cat": "Lácteo", "name": "Yogur alto en proteína / skyr", "unit": "g", "ref": "peso directo", "kcal": 63, "p": 10.5, "c": 4, "f": 0.5}, "oil": {"cat": "Extra", "name": "Aceite de oliva", "unit": "g", "ref": "peso directo", "kcal": 884, "p": 0, "c": 0, "f": 100}, "rice_cakes": {"cat": "Carbohidrato", "name": "Tortitas de arroz", "unit": "g", "ref": "peso directo", "kcal": 387, "p": 7.8, "c": 81.5, "f": 3.1}, "cereal": {"cat": "Carbohidrato", "name": "Cereales simples", "unit": "g", "ref": "peso directo", "kcal": 375, "p": 7.5, "c": 82, "f": 1.5}, "whey": {"cat": "Suplemento", "name": "Proteína whey (polvo)", "unit": "g", "ref": "peso del polvo; si la tomas con leche, registra también la leche", "kcal": 390, "p": 78, "c": 8, "f": 6}};
const MEAL_TYPES=["Desayuno","Almuerzo","Merienda","Cena","Post-entreno"];

const FOOD_INPUT_META={
 bread:{inputUnit:"rebanadas",singular:"rebanada",gramsPerInput:30,presets:[1,2,3,4],reference:"1 rebanada ≈ 30 g"},
 rice_cakes:{inputUnit:"unidades",singular:"tortita",gramsPerInput:8,presets:[2,3,4,5],reference:"1 tortita ≈ 8 g"},
 egg:{inputUnit:"unidades",singular:"huevo",perUnitDirect:true,presets:[1,2,3],reference:"1 unidad mediana"},
 banana:{inputUnit:"unidades",singular:"plátano",perUnitDirect:true,presets:[1,2],reference:"1 unidad mediana"},
 apple:{inputUnit:"unidades",singular:"manzana",perUnitDirect:true,presets:[1,2],reference:"1 unidad mediana"},
 orange:{inputUnit:"unidades",singular:"naranja",perUnitDirect:true,presets:[1,2],reference:"1 unidad mediana"},
 kiwi:{inputUnit:"unidades",singular:"kiwi",perUnitDirect:true,presets:[1,2,3],reference:"1 unidad mediana"},
 milk:{inputUnit:"ml",presets:[200,250,300],reference:"volumen en mililitros"},
 whey:{inputUnit:"g",presets:[25,30,35],reference:"gramos de polvo"},
 cereal:{inputUnit:"g",presets:[30,40,50,60],reference:"peso directo"},
 oats:{inputUnit:"g",presets:[40,50,60,80],reference:"peso en seco"},
 rice:{inputUnit:"g",presets:[100,150,200,250],reference:"peso cocido"},
 pasta:{inputUnit:"g",presets:[100,150,200,250],reference:"peso cocido"},
 potato:{inputUnit:"g",presets:[200,300,400,500],reference:"peso cocido"},
 lentils:{inputUnit:"g",presets:[150,200,250],reference:"peso cocido"},
 chicken:{inputUnit:"g",presets:[100,150,200],reference:"peso cocinado"},
 turkey:{inputUnit:"g",presets:[100,150,200],reference:"peso cocinado"},
 beef:{inputUnit:"g",presets:[100,150,200],reference:"peso cocinado"},
 whitefish:{inputUnit:"g",presets:[100,150,200],reference:"peso cocinado"},
 salmon:{inputUnit:"g",presets:[100,150,200],reference:"peso cocinado"},
 tuna:{inputUnit:"g",presets:[60,80,120],reference:"peso escurrido"},
 veg:{inputUnit:"g",presets:[150,200,250,300],reference:"peso preparado"},
 yogurt:{inputUnit:"g",presets:[150,200,250],reference:"peso directo"},
 oil:{inputUnit:"g",presets:[5,10,15],reference:"gramos de aceite"}
};
function foodInputMeta(key){
 const db=foodRecord(key)||{},meta=FOOD_INPUT_META[key]||db.inputMeta||{};
 return {
  inputUnit:meta.inputUnit||(db.perUnit?"unidades":db.unit||"g"),
  singular:meta.singular||null,
  gramsPerInput:meta.gramsPerInput||null,
  perUnitDirect:!!meta.perUnitDirect,
  presets:meta.presets||(db.perUnit?[1,2,3]:db.unit==="ml"?[200,250,300]:[100,150,200,250]),
  reference:meta.reference||db.ref||""
 }
}
function toStoredFoodAmount(key,inputAmount){
 const meta=foodInputMeta(key),db=foodRecord(key);
 if(!db)return inputAmount;
 if(meta.gramsPerInput)return inputAmount*meta.gramsPerInput;
 return inputAmount
}
function fromStoredFoodAmount(item){
 const meta=foodInputMeta(item.foodKey);
 if(item.displayAmount!=null)return +item.displayAmount;
 if(meta.gramsPerInput)return (+item.amount||0)/meta.gramsPerInput;
 return +item.amount||0
}
function foodDisplayAmount(item){
 const meta=foodInputMeta(item.foodKey),n=fromStoredFoodAmount(item);
 const shown=Number.isInteger(n)?n:Number(n.toFixed(1));
 const unit=meta.inputUnit;
 return `${shown} ${unit}`
}


const MEAL_FOOD_KEYS={
 "Desayuno":["bread","oats","cereal","egg","banana","apple","orange","kiwi","milk","yogurt","whey"],
 "Almuerzo":["rice","pasta","potato","bread","lentils","chicken","turkey","beef","whitefish","salmon","tuna","egg","veg","banana","apple","orange","kiwi","oil"],
 "Merienda":["bread","oats","cereal","rice_cakes","egg","banana","apple","orange","kiwi","milk","yogurt","whey","tuna","turkey"],
 "Cena":["rice","pasta","potato","bread","lentils","chicken","turkey","beef","whitefish","salmon","tuna","egg","veg","banana","apple","orange","kiwi","oil"],
 "Post-entreno":["whey","milk","yogurt","banana","apple","orange","kiwi","bread","rice_cakes","cereal","oats"]
};
const MEAL_HINTS={
 "Desayuno":"Opciones rápidas y habituales para empezar el día.",
 "Almuerzo":"Comida completa: base de carbohidrato + proteína + verdura.",
 "Merienda":"Opciones sencillas y transportables.",
 "Cena":"Comida completa, igual que el almuerzo.",
 "Post-entreno":"Prioriza proteína fácil de tomar y carbohidrato si lo necesitas. Aquí no aparecen comidas pesadas."
};
const FOOD_QUICK_COMBOS={
 "Desayuno":[
  {name:"Avena + leche + plátano",items:[["oats",60],["milk",250],["banana",1]]},
  {name:"Huevos + pan",items:[["egg",2],["bread",60]]}
 ],
 "Merienda":[
  {name:"Yogur + plátano",items:[["yogurt",250],["banana",1]]},
  {name:"Whey + leche",items:[["whey",30],["milk",250]]}
 ],
 "Post-entreno":[
  {name:"Batido whey + agua",items:[["whey",30]]},
  {name:"Batido whey + leche",items:[["whey",30],["milk",250]]},
  {name:"Yogur + plátano",items:[["yogurt",250],["banana",1]]},
  {name:"Leche + plátano",items:[["milk",300],["banana",1]]}
 ],
 "Almuerzo":[],
 "Cena":[]
};


function defaultState(){return{settings:{
 mode:"summer",seasonStart:"",checkHour:20,bodyPeriod:"6m",progressPeriod:"week",historyExpanded:false,photosExpanded:false,keepAwake:true,
 nutritionGoals:{kcal:null,p:null,c:null,f:null},
 notifications:{enabled:false,rest:true,workout:true,checkin:true,weeklyBody:true,monthlyReview:true,workoutTime:"18:00",weeklyBodyTime:"10:00",monthlyReviewTime:"10:15"}
},customPlans:null,customFoods:[],sessions:[],extraSessions:[],swim:[],cardio:[],mobility:[],body:[],daily:[],foods:[],photoMonths:[],notificationLog:{},restTimer:null,cardioRuntime:null}}
function normalizeState(input){
 const base=defaultState(),raw=input&&typeof input==="object"?input:{};
 const out={...base,...raw,settings:{...base.settings,...(raw.settings||{})}};
 out.settings.notifications={...base.settings.notifications,...(raw.settings?.notifications||{})};
 out.settings.nutritionGoals={...base.settings.nutritionGoals,...(raw.settings?.nutritionGoals||{})};
 if(!out.notificationLog||typeof out.notificationLog!=="object"||Array.isArray(out.notificationLog))out.notificationLog={};
 ["sessions","extraSessions","swim","cardio","mobility","body","daily","foods","photoMonths","customFoods"].forEach(k=>{if(!Array.isArray(out[k]))out[k]=[]});
 if(!["summer","season"].includes(out.settings.mode))out.settings.mode="summer";
 if(!["day","week","month"].includes(out.settings.progressPeriod))out.settings.progressPeriod="week";
 if(!["3m","6m","12m","all"].includes(out.settings.bodyPeriod))out.settings.bodyPeriod="6m";
 out.settings.checkHour=Math.min(23,Math.max(0,+out.settings.checkHour||20));
 return out
}
function loadState(){
 try{
  let raw=storageGet(STORAGE_KEY);
  if(raw)return normalizeState(JSON.parse(raw));
  for(const k of LEGACY_KEYS){raw=storageGet(k);if(raw){const old=JSON.parse(raw);return normalizeState({...old,extraSessions:old.extraSessions||[],customPlans:null})}}
 }catch(e){}
 return defaultState()
}
let state=loadState(),autosaveTimer=null,activeView="Home";

function saveState(silent=false){storageSet(STORAGE_KEY,JSON.stringify(state));if(!silent)toast("Guardado")}
function todayISO(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
function dateObj(x){const [y,m,d]=x.split("-").map(Number);return new Date(y,m-1,d)}
function weekday(x){return dateObj(x).getDay()}
function currentDate(){return document.getElementById("selectedDate").value||todayISO()}
function shiftSelectedDate(days){
 const input=document.getElementById("selectedDate"),d=dateObj(currentDate());
 d.setDate(d.getDate()+days);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());input.value=d.toISOString().slice(0,10);renderAll()
}
function goToToday(){document.getElementById("selectedDate").value=todayISO();renderAll()}
function getPlans(){return state.customPlans||DEFAULT_PLANS}
function planFor(x){return getPlans()[state.settings.mode]?.[String(weekday(x))]||DEFAULT_PLANS[state.settings.mode][String(weekday(x))]}
function pretty(x){return dateObj(x).toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"})}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]))}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1200)}
function upsert(arr,obj,keys=["date"]){const i=arr.findIndex(x=>keys.every(k=>x[k]===obj[k]));if(i>=0)arr[i]={...arr[i],...obj};else arr.push(obj)}
function val(id){return document.getElementById(id)?.value??""}
function num(id){const x=val(id);return x===""?null:+x}
function latest(arr,key){return arr.filter(x=>x[key]!=null&&x[key]!=="").sort((a,b)=>b.date.localeCompare(a.date))[0]?.[key]??"—"}
function foodRecord(key){return FOOD_DB[key]||(state.customFoods||[]).find(f=>f.key===key)||null}
function allFoodKeys(){return [...Object.keys(FOOD_DB),...(state.customFoods||[]).map(f=>f.key)]}
function autoMode(){ /* selección manual de modo */ }
function isSunday(x){return weekday(x)===0}
function afterCheckHour(x){return x!==todayISO()||new Date().getHours()>=state.settings.checkHour}
function dailyDone(x){return !!state.daily.find(d=>d.date===x&&d.completed)}
function measurementDone(x){const b=state.body.find(d=>d.date===x);return !!(b&&b.weight&&b.waist)}

function monthKey(x){return String(x).slice(0,7)}
function monthlyMeasurementRecord(x){
 return state.body.filter(b=>monthKey(b.date)===monthKey(x)&&[b.chest,b.arm,b.hips,b.thigh,b.calf].some(v=>v!=null&&v!=="")).sort((a,b)=>b.date.localeCompare(a.date))[0]||null
}
function monthlyMeasurementDone(x){
 const b=monthlyMeasurementRecord(x);return !!(b&&b.chest&&b.arm&&b.hips&&b.thigh&&b.calf)
}
function photoMonthRecord(x){
 const m=monthKey(x);return (state.photoMonths||[]).find(p=>p.month===m)||null
}
function monthlyPhotosDone(x){
 const p=photoMonthRecord(x);return !!(p&&["front","side","back"].every(v=>(p.views||[]).includes(v)))
}
function monthlyReviewDone(x){return monthlyMeasurementDone(x)&&monthlyPhotosDone(x)}

function findSession(x,key){return state.sessions.find(s=>s.date===x&&s.key===key)}
function sessionDone(x,p){
 if(p.type==="gym")return !!findSession(x,p.key)?.completed;
 if(p.type==="swim")return !!state.swim.find(s=>s.date===x&&s.completed);
 if(p.type==="cardio")return !!state.cardio.find(s=>s.date===x&&s.completed);
 return true
}
function extraForDate(x){return state.extraSessions.filter(s=>s.date===x)}
function foodsFor(x){return state.foods.filter(f=>f.date===x)}
function calcFood(f){const db=foodRecord(f.foodKey);if(!db)return{kcal:0,p:0,c:0,f:0};const factor=db.perUnit?(+f.amount||0):(+f.amount||0)/100;return{kcal:db.kcal*factor,p:db.p*factor,c:db.c*factor,f:db.f*factor}}
function dayNutrition(x){const out={kcal:0,p:0,c:0,f:0,fruit:0,veg:0};foodsFor(x).forEach(item=>{const n=calcFood(item);out.kcal+=n.kcal;out.p+=n.p;out.c+=n.c;out.f+=n.f;const db=foodRecord(item.foodKey);if(db?.cat==="Fruta")out.fruit+=+item.amount||0;if(db?.cat==="Verdura")out.veg+=+item.amount||0});return out}
function addDaysISO(x,days){
 const d=dateObj(x);d.setDate(d.getDate()+days);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)
}
function dateForWeekday(ref,targetDay){
 const mon=mondayOf(ref),offset=targetDay===0?6:targetDay-1;return addDaysISO(mon,offset)
}
function selectWeekday(targetDay){
 document.getElementById("selectedDate").value=dateForWeekday(currentDate(),targetDay);renderAll()
}
function mondayOf(x){const d=dateObj(x),day=d.getDay(),diff=day===0?-6:1-day;d.setDate(d.getDate()+diff);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
function inWeek(date,ref){const m=mondayOf(ref),e=dateObj(m);e.setDate(e.getDate()+6);e.setMinutes(e.getMinutes()-e.getTimezoneOffset());return date>=m&&date<=e.toISOString().slice(0,10)}
function completedTrainingThisWeek(ref){
 const rows=[];
 state.sessions.filter(s=>s.completed&&inWeek(s.date,ref)).forEach(s=>rows.push(s));
 state.extraSessions.filter(s=>s.completed&&inWeek(s.date,ref)).forEach(s=>rows.push(s));
 state.swim.filter(s=>s.completed&&inWeek(s.date,ref)).forEach(s=>rows.push(s));
 state.cardio.filter(s=>s.completed&&inWeek(s.date,ref)).forEach(s=>rows.push(s));
 return rows
}
function weeklyTrainingMinutes(ref){return completedTrainingThisWeek(ref).reduce((a,s)=>a+(+s.duration||0),0)}
function weeklyTrainingKcal(ref){return completedTrainingThisWeek(ref).reduce((a,s)=>a+(+s.activeKcal||0),0)}
function weeklyAvgRPE(ref){const a=completedTrainingThisWeek(ref).filter(s=>s.rpe!=null);return a.length?(a.reduce((z,s)=>z+(+s.rpe||0),0)/a.length):null}


function updateBottomNavInset(){
 const nav=document.querySelector(".nav");
 if(!nav)return;
 const h=Math.ceil(nav.getBoundingClientRect().height);
 document.documentElement.style.setProperty("--bottom-nav-height",`${h}px`);
 const spacer=document.querySelector(".page-end-spacer");
 if(spacer)spacer.style.height=`${h}px`;
}
function installBottomNavInsetObserver(){
 updateBottomNavInset();
 const nav=document.querySelector(".nav");
 if(nav&&"ResizeObserver" in window){
  const ro=new ResizeObserver(()=>updateBottomNavInset());
  ro.observe(nav);
 }
 window.addEventListener("resize",updateBottomNavInset,{passive:true});
 if(window.visualViewport){
  window.visualViewport.addEventListener("resize",updateBottomNavInset,{passive:true});
 }
}
function scrollViewToTop(){
 const reset=()=>{
  const topAnchor=document.querySelector("header")||document.body;
  try{topAnchor.scrollIntoView({behavior:"auto",block:"start",inline:"nearest"})}catch(e){}
  const targets=[document.scrollingElement,document.documentElement,document.body];
  targets.forEach(el=>{if(el){el.scrollTop=0;el.scrollLeft=0}});
  try{window.scrollTo(0,0)}catch(e){}
 };
 reset();
 requestAnimationFrame(()=>{reset();requestAnimationFrame(reset)});
 setTimeout(reset,60);
}

function showView(v){
 activeView=v;["Home","Workout","Food","Progress","Settings"].forEach(x=>{document.getElementById("view"+x)?.classList.toggle("hidden",x!==v);document.querySelector(`[data-view="${x}"]`)?.classList.toggle("active",x===v)});
 const meta={Home:["Hoy","Lo importante del día."],Workout:["Entreno","Registra la sesión sin perder el ritmo."],Food:["Comidas","Añade alimentos y revisa el total del día."],Progress:["Progreso","Entrenamiento, nutrición y medidas."],Settings:["Ajustes","Plan, objetivos, notificaciones y datos."]}[v];
 document.getElementById("pageTitle").textContent=meta[0];document.getElementById("pageSubtitle").textContent=meta[1];
 if(v==="Workout")renderWorkout();if(v==="Food")renderFood();if(v==="Progress")renderProgress();if(v==="Settings")renderSettings();
 scrollViewToTop();
}
function setTrainingMode(mode){
 if(mode!=="summer"&&mode!=="season")return;
 state.settings.mode=mode;
 saveState(true);
 renderAll();
 toast(mode==="summer"?"Modo: Solo gym":"Modo: Gym + natación");
}
function updateModeSwitch(){
 const solo=document.getElementById("modeSoloGym"),swim=document.getElementById("modeGymSwim");
 if(solo)solo.classList.toggle("active",state.settings.mode==="summer");
 if(swim)swim.classList.toggle("active",state.settings.mode==="season");
}
function renderAll(){
 autoMode();updateModeSwitch();renderHome();
 if(activeView==="Workout")renderWorkout();
 else if(activeView==="Food")renderFood();
 else if(activeView==="Progress")renderProgress();
 else if(activeView==="Settings")renderSettings();
 renderBadges()
}
function renderBadges(){
 const x=currentDate(),p=planFor(x);let h=0,w=0;
 if(!sessionDone(x,p)&&p.type!=="rest"){h++;w++}
 if(isSunday(x)&&!measurementDone(x))h++;
 if(isSunday(x)&&!monthlyReviewDone(x))h++;
 if(afterCheckHour(x)&&!dailyDone(x))h++;
 document.getElementById("badgeHome").innerHTML=h?`<span class="badge">${h}</span>`:"";
 document.getElementById("badgeWorkout").innerHTML=w?`<span class="badge">1</span>`:""
}
function task(icon,title,desc,done,action){return `<button type="button" class="task task-action ${done?"done":""}" onclick="${action}"><div class="ico">${icon}</div><div><strong>${esc(title)}</strong><small>${esc(desc)}</small></div><span class="chev">›</span></button>`}


function appIsStandalone(){
 return !!(window.matchMedia?.("(display-mode: standalone)")?.matches||navigator.standalone===true)
}

function isAppleMobileDevice(){
 const ua=navigator.userAgent||"";
 return /iPhone|iPad|iPod/i.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1)
}
function isSafariBrowser(){
 const ua=navigator.userAgent||"";
 return /Safari/i.test(ua)&&!/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)
}
function shouldShowInstallHint(){
 if(appIsStandalone()||!isAppleMobileDevice())return false;
 try{if(sessionStorage.getItem("training_lab_install_hint_dismissed")==="1")return false}catch(e){}
 return true
}
function dismissInstallHint(){
 try{sessionStorage.setItem("training_lab_install_hint_dismissed","1")}catch(e){}
 closeModal()
}
function showInstallHint(){
 if(!shouldShowInstallHint())return;
 const safari=isSafariBrowser();
 document.getElementById("modalRoot").innerHTML=`<div class="modal install-modal"><div class="sheet install-sheet">
  <div class="eyebrow">Instalar Training Lab</div>
  <div class="hero-title">Úsala como una app</div>
  <div class="subtitle">${safari?"Puedes añadir Training Lab a la pantalla de inicio en unos segundos.":"Para instalarla en iPhone, abre esta página en Safari y sigue estos pasos."}</div>
  <div class="install-steps">
   <div class="install-step"><span>1</span><div><strong>Pulsa Compartir</strong><small>El botón con el cuadrado y la flecha hacia arriba.</small></div></div>
   <div class="install-step"><span>2</span><div><strong>Añadir a pantalla de inicio</strong><small>Busca esa opción en el menú de compartir.</small></div></div>
   <div class="install-step"><span>3</span><div><strong>Pulsa Añadir</strong><small>Training Lab aparecerá junto al resto de tus apps.</small></div></div>
  </div>
  <div class="callout">Al abrir Training Lab desde el icono de la pantalla de inicio tendrás una experiencia más cómoda y, si el dispositivo es compatible, podrás activar notificaciones.</div>
  <div class="actions"><button type="button" class="btn" onclick="dismissInstallHint()">Entendido</button><button type="button" class="btn ghost" onclick="dismissInstallHint()">Ahora no</button></div>
 </div></div>`
}

function notificationSupport(){
 return {notification:"Notification" in window,serviceWorker:"serviceWorker" in navigator,push:"PushManager" in window}
}
function notificationPermission(){
 return "Notification" in window?Notification.permission:"unsupported"
}
async function requestAppNotifications(){
 const support=notificationSupport();
 if(!support.notification||!support.serviceWorker){toast("Este dispositivo o navegador no admite notificaciones para Training Lab");return}
 try{
  const permission=await Notification.requestPermission();
  state.settings.notifications.enabled=permission==="granted";
  saveState(true);if(activeView==="Settings")renderSettings();
  if(permission==="granted"){
   await showAppNotification("Training Lab","Notificaciones activadas correctamente.","training-lab-test");
   toast("Notificaciones activadas")
  }else if(permission==="denied")toast("Notificaciones bloqueadas en el sistema");
  else toast("Permiso de notificaciones no concedido")
 }catch(e){toast("No se pudieron activar las notificaciones")}
}
async function showAppNotification(title,body,tag="training-lab",data={}){
 if(!state.settings.notifications.enabled||notificationPermission()!=="granted")return false;
 try{
  const reg=await navigator.serviceWorker.ready;
  await reg.showNotification(title,{body,tag,renotify:false,data:{url:"./",...data}});
  return true
 }catch(e){
  try{
   if("Notification" in window){new Notification(title,{body,tag});return true}
  }catch(_){}
 }
 return false
}
async function testAppNotification(){
 if(notificationPermission()!=="granted"){await requestAppNotifications();return}
 await showAppNotification("Training Lab","Prueba de notificación correcta.","training-lab-manual-test")
}
function notificationTimeReached(time){
 const [h,m]=String(time||"00:00").split(":").map(Number),now=new Date();
 return now.getHours()>h||(now.getHours()===h&&now.getMinutes()>=m)
}
function notificationOnce(key,title,body){
 if(state.notificationLog[key])return;
 state.notificationLog[key]=Date.now();saveState(true);
 showAppNotification(title,body,key).catch(()=>{})
}
function trimNotificationLog(){
 const entries=Object.entries(state.notificationLog||{}).sort((a,b)=>(+b[1]||0)-(+a[1]||0));
 if(entries.length<=90)return;
 state.notificationLog=Object.fromEntries(entries.slice(0,90));saveState(true)
}
function checkDueNotifications(){
 if(!state.settings.notifications.enabled||notificationPermission()!=="granted")return;
 const x=todayISO(),p=planFor(x),n=state.settings.notifications||{},todayPlanDone=sessionDone(x,p);
 if(n.workout&&p.type!=="rest"&&!todayPlanDone&&notificationTimeReached(n.workoutTime)){
  notificationOnce(`workout:${x}`,"Entrenamiento pendiente",`${p.title}${p.subtitle?` · ${p.subtitle}`:""}`)
 }
 if(n.checkin&&!dailyDone(x)&&notificationTimeReached(`${String(state.settings.checkHour).padStart(2,"0")}:00`)){
  notificationOnce(`checkin:${x}`,"Check-in pendiente","Cierra el día en Training Lab.")
 }
 if(n.weeklyBody&&isSunday(x)&&!measurementDone(x)&&notificationTimeReached(n.weeklyBodyTime)){
  notificationOnce(`body:${x}`,"Peso y cintura","Toca registrar las mediciones semanales.")
 }
 if(n.monthlyReview&&isSunday(x)&&!monthlyReviewDone(x)&&notificationTimeReached(n.monthlyReviewTime)){
  notificationOnce(`monthly:${x}`,"Revisión corporal","Perímetros y fotos mensuales pendientes.")
 }
 trimNotificationLog()
}
function notificationStatusHTML(){
 const support=notificationSupport(),permission=notificationPermission(),standalone=appIsStandalone();
 if(!support.notification||!support.serviceWorker)return `<span class="pill warn">No compatible</span>`;
 if(permission==="granted")return `<span class="pill good">Permitidas</span>`;
 if(permission==="denied")return `<span class="pill warn">Bloqueadas</span>`;
 return `<span class="pill">Sin activar</span>${!standalone?` <span class="pill warn">Añádela a pantalla de inicio</span>`:""}`
}
function saveNotificationSettings(){
 const n=state.settings.notifications;
 ["rest","workout","checkin","weeklyBody","monthlyReview"].forEach(k=>{const el=document.getElementById(`nt_${k}`);if(el)n[k]=!!el.checked});
 n.workoutTime=val("nt_workoutTime")||n.workoutTime;
 n.weeklyBodyTime=val("nt_weeklyBodyTime")||n.weeklyBodyTime;
 n.monthlyReviewTime=val("nt_monthlyReviewTime")||n.monthlyReviewTime;
 saveState(true);checkDueNotifications();if(activeView==="Settings")renderSettings()
}
function notificationSettingsHTML(){
 const n=state.settings.notifications;
 const check=(k)=>n[k]?"checked":"";
 return `<div class="section">Notificaciones</div><div class="card">
  <div class="row between notif-status"><div><strong>Training Lab en el móvil</strong><small>${appIsStandalone()?"App instalada en el dispositivo.":"En iPhone, añade Training Lab a la pantalla de inicio para usarla como app."}</small></div>${notificationStatusHTML()}</div>
  <div class="actions" style="margin-top:10px"><button type="button" class="btn" onclick="requestAppNotifications()">Activar notificaciones</button><button type="button" class="btn secondary" onclick="testAppNotification()">Probar</button></div>
  <div class="notif-grid">
   <label class="notif-row"><input id="nt_rest" type="checkbox" ${check("rest")} onchange="saveNotificationSettings()"><span><strong>Fin del descanso</strong><small>Avisa cuando termina un descanso si Training Lab sigue activa o cuando vuelves a abrirla.</small></span></label>
   <label class="notif-row"><input id="nt_workout" type="checkbox" ${check("workout")} onchange="saveNotificationSettings()"><span><strong>Entrenamiento del día</strong><small>Avisa cuando Training Lab detecta que el entrenamiento sigue pendiente.</small></span><input id="nt_workoutTime" type="time" value="${esc(n.workoutTime)}" onchange="saveNotificationSettings()"></label>
   <label class="notif-row"><input id="nt_checkin" type="checkbox" ${check("checkin")} onchange="saveNotificationSettings()"><span><strong>Check-in final</strong><small>Hora configurada: ${state.settings.checkHour}:00.</small></span></label>
   <label class="notif-row"><input id="nt_weeklyBody" type="checkbox" ${check("weeklyBody")} onchange="saveNotificationSettings()"><span><strong>Peso y cintura del domingo</strong><small>Recordatorio semanal.</small></span><input id="nt_weeklyBodyTime" type="time" value="${esc(n.weeklyBodyTime)}" onchange="saveNotificationSettings()"></label>
   <label class="notif-row"><input id="nt_monthlyReview" type="checkbox" ${check("monthlyReview")} onchange="saveNotificationSettings()"><span><strong>Revisión corporal mensual</strong><small>Perímetros y fotos.</small></span><input id="nt_monthlyReviewTime" type="time" value="${esc(n.monthlyReviewTime)}" onchange="saveNotificationSettings()"></label>
  </div>
  <div class="callout" style="margin-top:10px"><strong>Compatibilidad:</strong> si tu navegador o sistema no admite notificaciones para Training Lab, no podrás activarlas. Con la app completamente cerrada, los recordatorios programados tampoco están garantizados todavía; para esos casos puedes instalar los recordatorios en Calendario.</div>
  <div class="actions" style="margin-top:10px"><button type="button" class="btn secondary" onclick="downloadNotificationCalendar()">Instalar recordatorios en Calendario</button></div>
 </div>`
}
function icsEscape(s){return String(s??"").replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;")}
function pad2(n){return String(n).padStart(2,"0")}
function nextWeekdayDate(targetDay){
 const now=new Date(),d=new Date(now.getFullYear(),now.getMonth(),now.getDate()),delta=(targetDay-d.getDay()+7)%7;
 d.setDate(d.getDate()+delta);return d
}
function icsLocalDateTime(date,time){
 const [h,m]=String(time||"00:00").split(":").map(Number);
 return `${date.getFullYear()}${pad2(date.getMonth()+1)}${pad2(date.getDate())}T${pad2(h)}${pad2(m)}00`
}
function icsEvent(uid,title,description,start,rrule){
 return ["BEGIN:VEVENT",`UID:${uid}`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z")}`,`DTSTART:${start}`,`RRULE:${rrule}`,`SUMMARY:${icsEscape(title)}`,`DESCRIPTION:${icsEscape(description)}`,"BEGIN:VALARM","TRIGGER:PT0M","ACTION:DISPLAY",`DESCRIPTION:${icsEscape(title)}`,"END:VALARM","END:VEVENT"].join("\r\n")
}
function downloadNotificationCalendar(){
 const n=state.settings.notifications,events=[],plans=getPlans()[state.settings.mode]||{};
 if(n.workout){
  Object.entries(plans).forEach(([dow,p])=>{
   const day=+dow;if(!p||p.type==="rest")return;
   const start=icsLocalDateTime(nextWeekdayDate(day),n.workoutTime);
   const byday=["SU","MO","TU","WE","TH","FR","SA"][day];
   events.push(icsEvent(`training-lab-workout-${state.settings.mode}-${day}@local`,`Training Lab · ${p.title}`,p.subtitle||"Entrenamiento del día",start,`FREQ=WEEKLY;BYDAY=${byday}`))
  })
 }
 if(n.checkin){
  const d=new Date(),time=`${pad2(state.settings.checkHour)}:00`;
  events.push(icsEvent("training-lab-checkin@local","Training Lab · Check-in final","Cierra el día en Training Lab.",icsLocalDateTime(d,time),"FREQ=DAILY"))
 }
 if(n.weeklyBody){
  const d=nextWeekdayDate(0);
  events.push(icsEvent("training-lab-body@local","Training Lab · Peso y cintura","Mediciones semanales.",icsLocalDateTime(d,n.weeklyBodyTime),"FREQ=WEEKLY;BYDAY=SU"))
 }
 if(n.monthlyReview){
  const d=nextWeekdayDate(0);
  events.push(icsEvent("training-lab-monthly@local","Training Lab · Revisión corporal","Perímetros y fotos mensuales.",icsLocalDateTime(d,n.monthlyReviewTime),"FREQ=MONTHLY;BYDAY=1SU"))
 }
 if(!events.length){toast("Activa al menos un recordatorio");return}
 const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Training Lab//ES","CALSCALE:GREGORIAN","METHOD:PUBLISH",...events,"END:VCALENDAR"].join("\r\n");
 download("Training_Lab_recordatorios.ics",ics,"text/calendar;charset=utf-8")
}
async function subscribeForRemotePush(applicationServerKey){
 if(!("serviceWorker" in navigator)||!("PushManager" in window))throw new Error("Push API no disponible");
 const reg=await navigator.serviceWorker.ready;
 return await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey})
}

function nutritionMetricHTML(label,key,value,unit="g"){
 const goal=+(state.settings.nutritionGoals?.[key]||0),shown=Math.round(value),pct=goal?Math.round(value/goal*100):0,bar=goal?`<div class="progress-track" aria-label="${esc(label)}: ${pct}% del objetivo"><div class="progress-fill ${pct>110?"over":""}" style="width:${Math.min(100,Math.max(0,pct))}%"></div></div>`:"";
 return `<div class="nutrition-metric"><div class="nutrition-metric-head"><div><div class="k">${esc(label)}</div><div class="v">${shown}${unit?` <small>${unit}</small>`:""}</div></div>${goal?`<div class="target">de ${Math.round(goal)}${unit?` ${unit}`:""}</div>`:""}</div>${bar}</div>`
}
function nutritionDashboardHTML(nut){
 return `<div class="nutrition-dashboard">${nutritionMetricHTML("Energía","kcal",nut.kcal,"kcal")}${nutritionMetricHTML("Proteína","p",nut.p)}${nutritionMetricHTML("Carbohidratos","c",nut.c)}${nutritionMetricHTML("Grasas","f",nut.f)}</div>`
}
function renderHome(){
 const x=currentDate(),p=planFor(x),done=sessionDone(x,p),mins=weeklyTrainingMinutes(x),rpe=weeklyAvgRPE(x),kcal=weeklyTrainingKcal(x),extras=extraForDate(x).filter(s=>s.completed).length,nut=dayNutrition(x),foodCount=foodsFor(x).length;
 const gymSession=p.type==="gym"?findSession(x,p.key):null,sessionActive=!!(gymSession?.startedAt&&!gymSession.completed)||(state.cardioRuntime?.date===x&&!state.cardioRuntime.completed),primaryLabel=done?"Ver sesión":sessionActive?"Continuar sesión":"Abrir sesión";
 let html=`<div class="card hero"><div class="eyebrow">${esc(pretty(x))}</div><div class="hero-title">${esc(p.title)}</div><div class="subtitle">${esc(p.subtitle||"")}</div><div class="hero-status"><span class="pill teal">${state.settings.mode==="summer"?"Solo gym":"Gym + natación"}</span>${p.type!=="rest"&&done?'<span class="pill good">Completado</span>':sessionActive?'<span class="pill warn">En curso</span>':p.type==="rest"?'<span class="pill">Día de descanso</span>':""}</div><div class="actions hero-actions">${p.type!=="rest"?`<button class="btn" onclick="showView('Workout')">${primaryLabel}</button>`:""}<button class="btn secondary" onclick="showView('Food')">${foodCount?"Ver comidas":"Añadir comida"}</button><button class="btn ghost" onclick="goToPlanSettings()">Plan</button></div></div>`;
 html+=`<div class="section">Pendiente</div>`;
 if(p.type!=="rest")html+=task("E","Entrenamiento",done?`${p.title} registrado`:`${p.title} pendiente`,done,"showView('Workout')");
 if(isSunday(x))html+=task("M","Peso y cintura",measurementDone(x)?"Mediciones registradas":"Mediciones semanales pendientes",measurementDone(x),"openMeasurements()");
 if(isSunday(x)&&!monthlyReviewDone(x))html+=task("R","Revisión corporal mensual",monthlyMeasurementDone(x)&&!monthlyPhotosDone(x)?"Faltan las fotos del mes":!monthlyMeasurementDone(x)&&monthlyPhotosDone(x)?"Faltan los perímetros del mes":"Perímetros y fotos mensuales pendientes",false,"openMonthlyReview()");
 if(afterCheckHour(x))html+=task("✓","Check-in final",dailyDone(x)?"Día cerrado":"Pendiente al final del día",dailyDone(x),"openDailyCheck()");
 else html+=`<div class="task"><div class="ico">✓</div><div><strong>Check-in final</strong><small>Aparecerá a partir de las ${state.settings.checkHour}:00.</small></div></div>`;
 html+=`<div class="section">Alimentación de hoy</div><div class="card"><div class="row between"><div><div class="eyebrow">${foodCount?`${foodCount} ${foodCount===1?"alimento":"alimentos"}`:"Sin registros"}</div><strong>${foodCount?"Total registrado":"Empieza por la primera comida"}</strong></div><button type="button" class="btn secondary small" onclick="showView('Food')">${foodCount?"Abrir":"Añadir"}</button></div>${nutritionDashboardHTML(nut)}${!Object.values(state.settings.nutritionGoals||{}).some(v=>+v>0)?'<div class="nutrition-note">Puedes definir objetivos diarios en Ajustes.</div>':""}</div>`;
 html+=`<div class="section">Resumen semanal</div><div class="grid2">
  <div class="metric"><div class="k">Peso</div><div class="v">${latest(state.body,"weight")} <small>kg</small></div></div>
  <div class="metric"><div class="k">Entrenamiento</div><div class="v">${(mins/60).toFixed(1)} <small>h</small></div></div>
  <div class="metric"><div class="k">Esfuerzo medio</div><div class="v">${rpe==null?"—":rpe.toFixed(1)} <small>RPE</small></div></div>
  <div class="metric"><div class="k">Kcal activas (manual)</div><div class="v">${kcal?Math.round(kcal):"—"}</div></div>
 </div>`;
 if(extras)html+=`<div class="callout" style="margin-top:10px">${extras} sesión extra registrada hoy.</div>`;
 document.getElementById("viewHome").innerHTML=html
}


let runtimeTicker=null,wakeLockSentinel=null;
function sessionElapsedSeconds(s){
 if(!s?.startedAt)return 0;
 const end=s.pausedAt||s.finishedAt||Date.now();
 return Math.max(0,Math.floor((end-s.startedAt-(+s.pausedDuration||0))/1000))
}
async function requestSessionWakeLock(){
 if(!state.settings.keepAwake||document.visibilityState!=="visible"||!("wakeLock" in navigator)||wakeLockSentinel)return;
 try{
  wakeLockSentinel=await navigator.wakeLock.request("screen");
  wakeLockSentinel.addEventListener("release",()=>{wakeLockSentinel=null},{once:true})
 }catch(e){wakeLockSentinel=null}
}
async function releaseSessionWakeLock(){
 const lock=wakeLockSentinel;wakeLockSentinel=null;
 if(lock){try{await lock.release()}catch(e){}}
}
function toggleGymPause(){
 const s=findSession(currentDate(),planFor(currentDate()).key);if(!s?.startedAt||s.completed)return;
 if(s.pausedAt){
  s.pausedDuration=(+s.pausedDuration||0)+(Date.now()-s.pausedAt);s.pausedAt=null;
  if(state.restTimer?.pausedBySession){state.restTimer.paused=false;state.restTimer.endAt=Date.now()+(state.restTimer.pausedRemaining||0)*1000;state.restTimer.pausedRemaining=null;state.restTimer.pausedBySession=false}
  requestSessionWakeLock()
 }else{
  s.pausedAt=Date.now();
  if(state.restTimer&&!state.restTimer.done&&!state.restTimer.paused){state.restTimer.paused=true;state.restTimer.pausedBySession=true;state.restTimer.pausedRemaining=Math.max(0,Math.ceil((state.restTimer.endAt-Date.now())/1000))}
  releaseSessionWakeLock()
 }
 saveState(true);updateRestTimerPanel()
}
const CARDIO_TEMPLATES={
 z2:{name:"Zona 2",description:"Cardio continuo. Debes poder hablar en frases cortas.",phases:[{type:"steady",label:"Zona 2",seconds:35*60,target:"RPE 3–4 · ritmo sostenible"}]},
 hiit3090:{name:"HIIT 30/90",description:"Intervalos cortos. Buena opción para bici o elíptica.",phases:[
  {type:"warmup",label:"Calentamiento",seconds:8*60,target:"RPE 2–3 · muy cómodo"},
  ...Array.from({length:8},(_,i)=>[{type:"work",label:`Intervalo ${i+1}/8`,seconds:30,target:"RPE 8–9 · duro, no sprint máximo"},{type:"recovery",label:`Recuperación ${i+1}/8`,seconds:90,target:"RPE 2–3 · muy suave"}]).flat(),
  {type:"cooldown",label:"Vuelta a la calma",seconds:5*60,target:"RPE 2 · suave"}
 ]},
 hiit11:{name:"HIIT 1:1",description:"Intervalos medios para sostener intensidad alta sin ir al máximo.",phases:[
  {type:"warmup",label:"Calentamiento",seconds:8*60,target:"RPE 2–3 · cómodo"},
  ...Array.from({length:8},(_,i)=>[{type:"work",label:`Intervalo ${i+1}/8`,seconds:60,target:"RPE 8–9 · duro, controlado"},{type:"recovery",label:`Recuperación ${i+1}/8`,seconds:60,target:"RPE 2–3 · suave"}]).flat(),
  {type:"cooldown",label:"Vuelta a la calma",seconds:5*60,target:"RPE 2 · suave"}
 ]},
 hiit22:{name:"HIIT 2:2",description:"Bloques aeróbicos largos. Menos explosivo y más exigente cardiovascularmente.",phases:[
  {type:"warmup",label:"Calentamiento",seconds:8*60,target:"RPE 2–3 · cómodo"},
  ...Array.from({length:5},(_,i)=>[{type:"work",label:`Intervalo ${i+1}/5`,seconds:120,target:"RPE 8–9 · duro y sostenible"},{type:"recovery",label:`Recuperación ${i+1}/5`,seconds:120,target:"RPE 2–3 · suave"}]).flat(),
  {type:"cooldown",label:"Vuelta a la calma",seconds:5*60,target:"RPE 2 · suave"}
 ]}
};
function formatClock(seconds){
 const s=Math.max(0,Math.ceil(+seconds||0)),m=Math.floor(s/60),r=s%60;return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`
}
function parseRestSeconds(text){
 const t=String(text||"").replace(/–/g,"-").toLowerCase();
 const nums=(t.match(/\d+(?:\.\d+)?/g)||[]).map(Number);
 if(!nums.length)return 120;
 const n=Math.max(...nums);
 return t.includes("min")?Math.round(n*60):Math.round(n)
}
function targetRIRRange(text){
 const nums=(String(text||"").replace(/–/g,"-").match(/\d+(?:\.\d+)?/g)||[]).map(Number);
 if(!nums.length)return [1,2];return [Math.min(...nums),Math.max(...nums)]
}

function attemptHasData(a){return !!(a&&(a.kg||a.reps||a.rir||a.completedAt||a.status||a.attemptType))}
function normalizeAttempt(a){
 return {kg:a?.kg??"",reps:a?.reps??"",rir:a?.rir??"",attemptType:a?.attemptType||"effective",status:a?.status||null,completedAt:a?.completedAt||null,feedback:a?.feedback||null}
}
function allAttempts(e){
 const src=Array.isArray(e?.recordedSets)?e.recordedSets:[];
 return src.filter(attemptHasData).map(normalizeAttempt)
}
function strictEffectiveCriteria(e,reps,rir){
 const rep=+reps,r=+rir;
 const repsOk=Number.isFinite(rep)&&rep>=+e.min&&rep<=+e.max;
 const [rirMin,rirMax]=targetRIRRange(e.rir);
 const rirOk=Number.isFinite(r)&&r>=rirMin&&r<=rirMax;
 return {valid:repsOk&&rirOk,repsOk,rirOk,rep,r}
}
function inferredAttemptStatus(e,a){
 if(a?.status)return a.status;
 if(a?.attemptType==="warmup")return "warmup";
 if(!a?.completedAt)return null;
 const c=strictEffectiveCriteria(e,a.reps,a.rir);
 return c.valid?"effective":"approximation"
}
function effectiveAttempts(e){return allAttempts(e).filter(a=>inferredAttemptStatus(e,a)==="effective")}
function effectiveCount(e){return effectiveAttempts(e).length}
function effectiveRemaining(e){return Math.max(0,(+e.sets||0)-effectiveCount(e))}
function exerciseGoalComplete(e){return effectiveRemaining(e)===0}
function classifyAttempt(e,a){
 if(a.attemptType==="warmup"){
  return {status:"warmup",tone:"warmup",title:"Aproximación",text:"No cuenta como serie efectiva."}
 }
 const c=strictEffectiveCriteria(e,a.reps,a.rir);
 if(c.valid){
  return {status:"effective",tone:"good",title:"Serie efectiva",text:`Cumple el rango de repeticiones y RIR ${e.rir||"1–2"}. Cuenta para el objetivo.`}
 }
 let why=[];
 if(!c.repsOk){
  if(Number.isFinite(c.rep)&&c.rep<+e.min)why.push("demasiado pesada para el rango");
  else if(Number.isFinite(c.rep)&&c.rep>+e.max)why.push("demasiado ligera para el rango");
  else why.push("repeticiones fuera del rango")
 }
 if(!c.rirOk){
  const [rirMin]=targetRIRRange(e.rir);
  if(Number.isFinite(c.r)&&c.r<rirMin)why.push("demasiado cerca o en fallo para el objetivo");
  else if(Number.isFinite(c.r))why.push("fuera del RIR programado");
  else why.push("RIR no válido")
 }
 return {status:"approximation",tone:"warn",title:"No efectiva",text:`Se guarda como aproximación/no efectiva (${why.join("; ")}). Aún debes completar la serie efectiva.`}
}
function sessionEffectiveSummary(s){
 let target=0,done=0;
 (s?.exercises||[]).forEach(e=>{if(e.type==="mobility")return;target+=+e.sets||0;done+=Math.min(+e.sets||0,effectiveCount(e))});
 return {done,target,remaining:Math.max(0,target-done)}
}
function addSetAttempt(scope,exerciseIndex,type){
 saveScopeInputs(scope);
 const e=scopeExercise(scope,exerciseIndex);if(!e)return;
 if(type==="effective"&&exerciseGoalComplete(e)){toast("Objetivo de series efectivas ya completado");return}
 e.recordedSets=allAttempts(e);
 e.recordedSets.push({kg:"",reps:"",rir:"",attemptType:type,status:null,completedAt:null,feedback:null});
 saveState(true);
 if(scope==="planned")renderWorkout();else editExtraSession(scope);
}
function discardSetAttempt(scope,exerciseIndex,attemptIndex){
 saveScopeInputs(scope);
 const e=scopeExercise(scope,exerciseIndex);if(!e)return;
 const arr=allAttempts(e);if(!arr[attemptIndex])return;
 openAppConfirm(
  "Descartar serie",
  "Se eliminarán los kg, repeticiones y RIR de esta serie. Si era efectiva, dejará de contar para el objetivo.",
  "Descartar serie",
  ()=>{
   const current=scopeExercise(scope,exerciseIndex);if(!current)return;
   const attempts=allAttempts(current);if(!attempts[attemptIndex])return;
   attempts.splice(attemptIndex,1);current.recordedSets=attempts;
   if(state.restTimer&&state.restTimer.scope===scope&&state.restTimer.exerciseIndex===exerciseIndex&&state.restTimer.attemptIndex===attemptIndex)state.restTimer=null;
   saveState(true);
   if(scope==="planned")renderWorkout();else editExtraSession(scope)
  },
  ()=>{if(scope==="planned")closeModal();else editExtraSession(scope)}
 )
}
function removeOneRep(scope,exerciseIndex,attemptIndex){
 saveScopeInputs(scope);
 const e=scopeExercise(scope,exerciseIndex);if(!e)return;
 const arr=allAttempts(e),a=arr[attemptIndex];if(!a)return;
 const current=Math.max(0,(+a.reps||0)-1);a.reps=String(current);
 if(a.completedAt){
  const cls=classifyAttempt(e,a);a.status=cls.status;a.feedback=cls.title;
 }
 e.recordedSets=arr;saveState(true);
 if(scope==="planned")renderWorkout();else editExtraSession(scope)
}

function setCoachFeedback(e,reps,rir){
 const [rirMin,rirMax]=targetRIRRange(e.rir),r=+rir,rep=+reps;
 if(!Number.isFinite(rep))return {tone:"warn",title:"Faltan las repeticiones",text:"Introduce las reps para poder ajustar la siguiente serie."};
 if(!Number.isFinite(r))return {tone:"warn",title:"Introduce el RIR",text:"El RIR es lo que permite saber si la serie ha sido demasiado fácil o demasiado dura."};
 if(rep<+e.min||r<rirMin){
  return {tone:"hard",title:"Más dura de lo previsto",text:"Para la siguiente serie, baja aproximadamente 2,5–5% la carga si no esperas recuperar el rango con el descanso."}
 }
 if(rep>=+e.max&&r>rirMax){
  return {tone:"easy",title:"Te ha sobrado margen",text:"Puedes subir la carga mínima disponible en la siguiente serie y volver a la zona baja del rango."}
 }
 if(rep>=+e.max&&r>=rirMin&&r<=rirMax){
  return {tone:"good",title:"Objetivo cumplido",text:"Mantén esta serie como referencia. Si se repite en todas las series, la próxima sesión toca subir carga."}
 }
 if(r>rirMax){
  return {tone:"easy",title:"Algo fácil",text:"Mantén la carga y busca sumar repeticiones antes de subir peso."}
 }
 return {tone:"good",title:"En objetivo",text:"Mantén la carga para la siguiente serie."}
}
function difficultyLabel(rir){
 const r=+rir;if(!Number.isFinite(r))return "";
 if(r<=0)return "Límite";if(r<=1)return "Muy dura";if(r<=2)return "Dura";if(r<=3)return "Controlada";return "Fácil"
}
function saveScopeInputs(scope){
 if(scope==="planned"){collectPlannedInputs();saveState(true);return}
 const s=state.extraSessions.find(x=>x.id===scope);if(!s)return;
 s.exercises.forEach((e,i)=>{
  if(e.type==="mobility")return;
  const existing=allAttempts(e);
  e.recordedSets=existing.map((a,j)=>({...a,kg:val(`${scope}_kg_${i}_${j}`),reps:val(`${scope}_rp_${i}_${j}`),rir:val(`${scope}_rr_${i}_${j}`)}))
 });
 saveState(true)
}
function scopeExercise(scope,index){
 if(scope==="planned")return normalizePlannedSession().exercises[index];
 return state.extraSessions.find(x=>x.id===scope)?.exercises?.[index]||null
}
function completeStrengthSet(scope,exerciseIndex,attemptIndex){
 saveScopeInputs(scope);
 if(scope==="planned"){const s=normalizePlannedSession();if(!s.startedAt&&!s.completed){s.startedAt=Date.now();s.pausedAt=null;s.pausedDuration=0;requestSessionWakeLock()}}
 const e=scopeExercise(scope,exerciseIndex);if(!e)return;
 e.recordedSets=allAttempts(e);
 const a=e.recordedSets[attemptIndex];if(!a)return;
 const reps=val(`${scope}_rp_${exerciseIndex}_${attemptIndex}`),rir=val(`${scope}_rr_${exerciseIndex}_${attemptIndex}`),kg=val(`${scope}_kg_${exerciseIndex}_${attemptIndex}`);
 if(!reps){toast("Introduce las repeticiones");return}
 if(a.attemptType!=="warmup"&&!rir&&rir!=="0"){toast("Introduce el RIR");return}
 a.kg=kg;a.reps=reps;a.rir=rir;
 const cls=classifyAttempt(e,a);
 a.status=cls.status;a.completedAt=Date.now();a.feedback=cls.title;
 const remainingAfter=Math.max(0,(+e.sets||0)-effectiveCount(e));
 let coachText=cls.text;
 if(cls.status==="effective"){
  coachText+=remainingAfter?` Quedan ${remainingAfter} efectivas.`:" Objetivo de este ejercicio completado."
 }
 const seconds=a.attemptType==="warmup"?Math.min(90,parseRestSeconds(e.rest)):parseRestSeconds(e.rest);
 state.restTimer={date:currentDate(),scope,exerciseIndex,attemptIndex,endAt:Date.now()+seconds*1000,duration:seconds,exercise:e.name,set:attemptIndex+1,feedback:{tone:cls.tone,title:cls.title,text:coachText},done:false,paused:false,pausedRemaining:null};
 saveState(true);
 if(scope==="planned")renderWorkout();else editExtraSession(scope);
 startRuntimeTicker()
}
function updateStrengthSetUI(){ /* v4.9: UI is re-rendered from saved attempt state. */ }
function addRestTime(seconds){
 const t=state.restTimer;if(!t)return;
 if(t.paused)t.pausedRemaining=(t.pausedRemaining||0)+seconds;
 else t.endAt=(t.endAt||Date.now())+seconds*1000;
 t.done=false;saveState(true);updateRestTimerPanel()
}
function toggleRestPause(){
 const t=state.restTimer;if(!t||t.done)return;
 if(t.paused){t.paused=false;t.endAt=Date.now()+(t.pausedRemaining||0)*1000;t.pausedRemaining=null}
 else{t.paused=true;t.pausedRemaining=Math.max(0,Math.ceil((t.endAt-Date.now())/1000))}
 saveState(true);updateRestTimerPanel()
}
function skipRestTimer(){
 if(!state.restTimer)return;
 state.restTimer=null;saveState(true);updateRestTimerPanel();stopRuntimeTickerIfIdle()
}
function updateRestTimerPanel(){
 const el=document.getElementById("sessionCoachPanel");if(!el)return;
 const gymSession=findSession(currentDate(),planFor(currentDate()).key),elapsed=sessionElapsedSeconds(gymSession);
 const t=state.restTimer&&(!state.restTimer.date||state.restTimer.date===currentDate())?state.restTimer:null;
 if(!t){
  if(!gymSession?.startedAt){el.innerHTML=`<div class="coach-main"><div><div class="eyebrow">Cronómetro de sesión</div><strong>Listo para empezar</strong><div class="timer-caption">Al iniciar, el tiempo continúa aunque cambies de pantalla.</div></div><button type="button" class="btn small" onclick="startGym()">Iniciar</button></div>`;return}
  el.innerHTML=`<div class="coach-main"><div><div class="eyebrow">${gymSession.pausedAt?"Sesión en pausa":"Sesión activa"}</div><div class="timer-big">${formatClock(elapsed)}</div><div class="timer-caption">${gymSession.pausedAt?"El tiempo está detenido.":"Incluye trabajo y descansos."}</div></div><div class="coach-session-actions"><button type="button" class="btn ghost small" onclick="toggleGymPause()">${gymSession.pausedAt?"Reanudar":"Pausar"}</button><button type="button" class="btn small" onclick="openFinishGym()">Finalizar</button></div></div>`;
  return
 }
 const remaining=t.paused?(t.pausedRemaining||0):Math.max(0,Math.ceil((t.endAt-Date.now())/1000));
 if(!t.paused&&remaining<=0&&!t.done){
  t.done=true;
  if(state.settings.notifications?.rest&&!t.notificationSent){t.notificationSent=true;showAppNotification("Descanso terminado",`${t.exercise||"Siguiente serie"} lista.`,"training-lab-rest")}
  saveState(true);try{if(navigator.vibrate)navigator.vibrate([120,80,120])}catch(e){}
 }
 if(t.done){
  el.innerHTML=`<div class="coach-main ready"><div><div class="eyebrow">Descanso terminado · sesión ${formatClock(elapsed)}</div><strong>Siguiente serie lista</strong><small>${esc(t.exercise)} · ${esc(t.feedback?.text||"")}</small></div><button type="button" class="btn small" onclick="skipRestTimer()">Cerrar</button></div>`;
 }else{
  el.innerHTML=`<div class="coach-main"><div><div class="eyebrow">Descanso · ${esc(t.exercise)}${t.paused?" · PAUSADO":""}</div><div class="timer-big">${formatClock(remaining)}</div><div class="timer-caption">Sesión ${formatClock(elapsed)}${gymSession?.pausedAt?" · en pausa":""}</div><small>${esc(t.feedback?.title||"")} · ${esc(t.feedback?.text||"")}</small></div><div class="timer-actions"><button type="button" class="btn ghost small" ${t.pausedBySession?"disabled":""} onclick="toggleRestPause()">${t.pausedBySession?"Pausado con sesión":t.paused?"Reanudar descanso":"Pausar descanso"}</button><button type="button" class="btn ghost small" onclick="addRestTime(30)">+30 s</button><button type="button" class="btn ghost small" onclick="skipRestTimer()">Omitir</button><button type="button" class="btn secondary small" onclick="toggleGymPause()">${gymSession?.pausedAt?"Reanudar sesión":"Pausar sesión"}</button></div></div>`
 }
}
function startRuntimeTicker(){
 if(runtimeTicker)return;
 runtimeTicker=setInterval(()=>{updateRestTimerPanel();updateCardioRuntimePanel()},250)
}

function syncRuntimeTimers(){
 if(state.restTimer&&!state.restTimer.paused&&!state.restTimer.done&&state.restTimer.endAt<=Date.now()){
  state.restTimer.done=true;
  if(state.settings.notifications?.rest&&!state.restTimer.notificationSent){state.restTimer.notificationSent=true;showAppNotification("Descanso terminado",`${state.restTimer.exercise||"Siguiente serie"} lista.`,"training-lab-rest")}
 }
 const r=state.cardioRuntime;
 if(r&&!r.paused&&!r.completed&&r.phaseEndAt&&r.phaseEndAt<=Date.now()){
  let guard=0;
  while(state.cardioRuntime&&!state.cardioRuntime.paused&&!state.cardioRuntime.completed&&state.cardioRuntime.phaseEndAt<=Date.now()&&guard<100){
   const tpl=CARDIO_TEMPLATES[state.cardioRuntime.templateKey],over=Date.now()-state.cardioRuntime.phaseEndAt;
   state.cardioRuntime.phaseIndex++;
   if(state.cardioRuntime.phaseIndex>=tpl.phases.length){state.cardioRuntime.completed=true;state.cardioRuntime.completedAt=Date.now();state.cardioRuntime.phaseEndAt=null;releaseSessionWakeLock();break}
   state.cardioRuntime.phaseEndAt=Date.now()-over+tpl.phases[state.cardioRuntime.phaseIndex].seconds*1000;
   guard++
  }
 }
 saveState(true);updateRestTimerPanel();updateCardioRuntimePanel();if(state.restTimer||state.cardioRuntime)startRuntimeTicker()
}
function installRuntimeRecovery(){
 ["focus","pageshow"].forEach(ev=>window.addEventListener(ev,()=>{syncRuntimeTimers();checkDueNotifications()},{passive:true}));
 document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState!=="visible")return;
  syncRuntimeTimers();checkDueNotifications();
  const gym=findSession(currentDate(),planFor(currentDate()).key),cardio=state.cardioRuntime;
  if((gym?.startedAt&&!gym.completed&&!gym.pausedAt)||(cardio&&!cardio.completed&&!cardio.paused))requestSessionWakeLock()
 });
}

function stopRuntimeTickerIfIdle(){
 const gym=findSession(currentDate(),planFor(currentDate()).key),gymActive=gym?.startedAt&&!gym.completed&&!gym.pausedAt;
 if(!state.restTimer&&!state.cardioRuntime&&!gymActive&&runtimeTicker){clearInterval(runtimeTicker);runtimeTicker=null}
}
function cardioTemplateOptions(selected){
 return Object.entries(CARDIO_TEMPLATES).map(([k,t])=>`<option value="${k}" ${selected===k?"selected":""}>${esc(t.name)}</option>`).join("")
}
function renderCardioTemplateInfo(){
 const key=val("caTemplate")||"z2",tpl=CARDIO_TEMPLATES[key],box=document.getElementById("cardioTemplateInfo");if(!box||!tpl)return;
 const total=Math.round(tpl.phases.reduce((s,p)=>s+p.seconds,0)/60);
 box.innerHTML=`<strong>${esc(tpl.name)}</strong><small>${esc(tpl.description)} · ${total} min aprox.</small>`
}
function startCardioSession(){
 const templateKey=val("caTemplate")||"z2",modality=val("caMo"),tpl=CARDIO_TEMPLATES[templateKey];
 if(!tpl)return;
 state.cardioRuntime={date:currentDate(),templateKey,modality,startedAt:Date.now(),pausedAt:null,pausedDuration:0,phaseIndex:0,phaseEndAt:Date.now()+tpl.phases[0].seconds*1000,paused:false,pausedRemaining:null,feedback:[],guidance:"",completed:false};
 saveState(true);renderWorkout();startRuntimeTicker();requestSessionWakeLock()
}
function cardioPhase(){
 const r=state.cardioRuntime;if(!r)return null;return CARDIO_TEMPLATES[r.templateKey]?.phases?.[r.phaseIndex]||null
}
function advanceCardioPhase(){
 const r=state.cardioRuntime,tpl=r&&CARDIO_TEMPLATES[r.templateKey];if(!r||!tpl)return;
 if(r.pausedAt){r.pausedDuration=(+r.pausedDuration||0)+(Date.now()-r.pausedAt);r.pausedAt=null}
 r.phaseIndex++;
 if(r.phaseIndex>=tpl.phases.length){
  r.completed=true;r.completedAt=Date.now();r.phaseEndAt=null;r.paused=false;releaseSessionWakeLock();saveState(true);updateCardioRuntimePanel();return
 }
 r.phaseEndAt=Date.now()+tpl.phases[r.phaseIndex].seconds*1000;r.paused=false;r.pausedRemaining=null;saveState(true);updateCardioRuntimePanel()
}
function pauseCardioTimer(){
 const r=state.cardioRuntime;if(!r||r.completed)return;
 if(r.paused){r.paused=false;r.phaseEndAt=Date.now()+(r.pausedRemaining||0)*1000;r.pausedRemaining=null;if(r.pausedAt){r.pausedDuration=(+r.pausedDuration||0)+(Date.now()-r.pausedAt);r.pausedAt=null}requestSessionWakeLock()}
 else{r.paused=true;r.pausedAt=Date.now();r.pausedRemaining=Math.max(0,Math.ceil((r.phaseEndAt-Date.now())/1000));releaseSessionWakeLock()}
 saveState(true);updateCardioRuntimePanel()
}
function skipCardioPhase(){const r=state.cardioRuntime;if(!r)return;advanceCardioPhase()}
function stopCardioRuntime(){
 if(!state.cardioRuntime)return;
 openAppConfirm("Descartar cardio","La sesión actual se perderá y no se guardará en el historial.","Descartar cardio",()=>{
  state.cardioRuntime=null;releaseSessionWakeLock();saveState(true);renderWorkout();stopRuntimeTickerIfIdle()
 },()=>{renderWorkout()})
}
function cardioIntervalFeedback(choice){
 const r=state.cardioRuntime;if(!r)return;
 const guidance=choice==="easy"?"Siguiente intervalo: sube ligeramente velocidad o resistencia (aprox. 3–5%).":choice==="hard"?"Siguiente intervalo: baja aproximadamente 5–10% la intensidad y prioriza completar el bloque.":"Siguiente intervalo: mantén exactamente la misma intensidad.";
 r.feedback.push({phaseIndex:r.phaseIndex,choice,time:Date.now()});r.guidance=guidance;saveState(true);updateCardioRuntimePanel()
}
function updateCardioRuntimePanel(){
 const el=document.getElementById("cardioRuntimePanel"),r=state.cardioRuntime;if(!el)return;
 if(!r||r.date!==currentDate()){el.innerHTML="";return}
 const tpl=CARDIO_TEMPLATES[r.templateKey];if(!tpl)return;
 if(r.completed){
  const mins=Math.max(1,Math.round(((r.completedAt||Date.now())-r.startedAt-(+r.pausedDuration||0))/60000));
  el.innerHTML=`<div class="card cardio-live completed"><div class="eyebrow">Cardio terminado</div><div class="hero-title">${esc(tpl.name)}</div><div class="subtitle">Registra el esfuerzo global y guarda la sesión.</div><div class="formgrid" style="margin-top:10px"><div class="field"><label>Duración (min)</label><input id="caDoneMin" inputmode="numeric" value="${mins}"></div><div class="field"><label>RPE global</label><input id="caDoneRPE" inputmode="decimal" placeholder="1–10"></div><div class="field wide"><label>Kcal activas (manual, opcional)</label><input id="caDoneKcal" inputmode="numeric"></div></div><div class="actions"><button type="button" class="btn" onclick="saveCompletedCardio()">Guardar sesión</button><button type="button" class="btn danger" onclick="stopCardioRuntime()">Descartar cardio</button></div></div>`;
  return
 }
 const phase=cardioPhase();if(!phase)return;
 let remaining=r.paused?r.pausedRemaining:Math.max(0,Math.ceil((r.phaseEndAt-Date.now())/1000));
 if(!r.paused&&remaining<=0){advanceCardioPhase();return}
 const feedbackButtons=phase.type==="recovery"&&r.templateKey!=="z2"?`<div class="interval-feedback"><span>¿Cómo fue el intervalo?</span><button type="button" onclick="cardioIntervalFeedback('easy')">Fácil</button><button type="button" onclick="cardioIntervalFeedback('ok')">En objetivo</button><button type="button" onclick="cardioIntervalFeedback('hard')">Muy duro</button></div>`:"";
 el.innerHTML=`<div class="card cardio-live ${phase.type}"><div class="row between"><div><div class="eyebrow">${esc(tpl.name)} · ${r.phaseIndex+1}/${tpl.phases.length}</div><div class="hero-title">${esc(phase.label)}</div></div><div class="timer-big">${formatClock(remaining)}</div></div><div class="intensity-target">${esc(phase.target)}</div>${r.guidance?`<div class="callout good" style="margin-top:8px">${esc(r.guidance)}</div>`:""}${feedbackButtons}<div class="actions"><button type="button" class="btn secondary small" onclick="pauseCardioTimer()">${r.paused?"Continuar":"Pausa"}</button><button type="button" class="btn ghost small" onclick="skipCardioPhase()">Siguiente fase</button><button type="button" class="btn danger small" onclick="stopCardioRuntime()">Descartar cardio</button></div></div>`
}
function saveCompletedCardio(){
 const r=state.cardioRuntime;if(!r)return;const tpl=CARDIO_TEMPLATES[r.templateKey];
 upsert(state.cardio,{date:r.date,completed:true,modality:r.modality,cardioType:r.templateKey,cardioName:tpl?.name||r.templateKey,duration:num("caDoneMin"),rpe:num("caDoneRPE"),activeKcal:num("caDoneKcal"),intervalFeedback:r.feedback||[]});
 state.cardioRuntime=null;releaseSessionWakeLock();saveState();renderAll();stopRuntimeTickerIfIdle()
}

function renderWorkout(){
 const x=currentDate(),p=planFor(x),labels=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],plans=getPlans()[state.settings.mode];
 let week=`<div class="card compact-week-card"><div class="row between"><div><div class="eyebrow">Tu semana</div><div class="subtitle">${state.customPlans?"Plan personalizado":"Plan base"}</div></div><button class="btn ghost small" onclick="goToPlanSettings()">Cambiar plan</button></div><div class="week">`;
 [1,2,3,4,5,6,0].forEach(d=>{const q=plans[String(d)]||DEFAULT_PLANS[state.settings.mode][String(d)];week+=`<button type="button" class="day ${weekday(x)===d?"active":""}" onclick="selectWeekday(${d})"><div class="d">${labels[d]}</div><div class="w">${esc(q.title)}</div></button>`});week+=`</div></div>`;
 let html="";
 if(p.type==="gym")html+=gymHTML(p,x);
 if(p.type==="swim")html+=swimHTML(x);
 if(p.type==="cardio")html+=cardioHTML(x);
 if(p.type==="rest")html+=`<div class="card hero"><div class="eyebrow">${esc(pretty(x))}</div><div class="hero-title">Descanso</div><div class="subtitle">Recupera, muévete suave si te apetece y vuelve con energía.</div></div>`;
 html+=extraSessionsHTML(x);
 html+=`<div class="workout-secondary">${week}${weeklyGuideHTML(x)}</div>`;
 document.getElementById("viewWorkout").innerHTML=html
}

function weeklyGuidanceStatus(x){
 const checks=state.daily.filter(d=>inWeek(d.date,x)),fat=checks.filter(d=>d.fatigue!=null),pain=checks.filter(d=>d.pain!=null),energy=checks.filter(d=>d.energy!=null);
 const avg=a=>a.length?a.reduce((s,z)=>s+(+z||0),0)/a.length:null;
 const af=avg(fat.map(d=>d.fatigue)),ap=avg(pain.map(d=>d.pain)),ae=avg(energy.map(d=>d.energy));
 const enough=checks.length>=3,maxPain=pain.length?Math.max(...pain.map(d=>+d.pain||0)):0;
 let key="reference",title="Semana de referencia",desc="Mantén el volumen programado y usa la progresión por ejercicio.",volumeFactor=1,rirNote="RIR programado";
 if(!enough){
  desc="Mantén el volumen programado. Con al menos 3 check-ins la app podrá ajustar la recomendación semanal.";
 }else if(maxPain>=5||(ap!=null&&ap>=4)){
  key="pain";title="No aumentar carga global";desc="Hay molestias relevantes. No aumentes el volumen global y reduce o sustituye únicamente el trabajo que reproduzca la molestia.";volumeFactor=1;rirNote="No forzar progresión"
 }else if((af!=null&&af>=7)||(ae!=null&&ae<=4)){
  key="fatigue";title="Reducir fatiga esta semana";desc="Proyección recomendada: aproximadamente 60–70% del volumen de fuerza programado y 3–4 RIR.";volumeFactor=.65;rirNote="3–4 RIR"
 }else if(af!=null&&af<=5&&ae!=null&&ae>=6){
  key="progress";title="Progresión normal";desc="Mantén el volumen y progresa repeticiones o carga solo cuando cada ejercicio cumpla su criterio.";volumeFactor=1;rirNote="RIR programado"
 }
 return {key,title,desc,volumeFactor,rirNote,checks:checks.length,avgFatigue:af,avgPain:ap,avgEnergy:ae,maxPain}
}
function weeklyGuideHTML(x){
 const g=weeklyGuidanceStatus(x);
 return `<div class="card"><div class="eyebrow">Guía de la semana</div><div class="hero-title" style="font-size:19px">${esc(g.title)}</div><div class="subtitle">${esc(g.desc)}</div><div class="actions"><button class="btn secondary small" onclick="openWeeklyExerciseGuide()">Ver resumen y proyección</button></div></div>`
}
function lastCompletedExercises(key,before,limit=3){
 const out=[];const all=[...state.sessions,...state.extraSessions].filter(s=>s.completed&&s.exercises&&s.date<before).sort((a,b)=>b.date.localeCompare(a.date));
 for(const s of all){const e=s.exercises.find(q=>q.key===key);if(e)out.push(e);if(out.length>=limit)break} return out
}
function lastPerformanceSummary(e,x){
 const last=lastCompletedExercises(e.key,x,1)[0];if(!last)return"";
 const sets=getEffectiveRecordedSets(last).filter(s=>s.kg!==""||s.reps!=="").slice(0,3);
 if(!sets.length)return"";
 return sets.map(s=>`${s.kg!==""?`${s.kg} kg × `:""}${s.reps||"—"} reps${s.rir!==""&&s.rir!=null?` @ RIR ${s.rir}`:""}`).join(" · ")
}
function targetRIRLow(rir){const m=String(rir||"").match(/\d+(?:[.,]\d+)?/);return m?parseFloat(m[0].replace(",",".")):null}
function exerciseAdvice(e,x){
 if(e.type==="mobility")return "Mantén la dosis y prioriza calidad de movimiento.";
 const hist=lastCompletedExercises(e.key,x,3);if(!hist.length)return"Usa una carga que deje el RIR indicado.";
 const last=hist[0],sets=getEffectiveRecordedSets(last).filter(s=>+s.reps>0);if(!sets.length)return"Completa el registro antes de progresar.";
 const targetLow=targetRIRLow(e.rir),rirValues=sets.map(s=>s.rir===""||s.rir==null?null:+s.rir),hasRIR=rirValues.every(v=>v!=null&&!Number.isNaN(v));
 const tooClose=hasRIR&&targetLow!=null&&rirValues.some(v=>v<targetLow);
 if(sets.some(s=>+s.reps<+e.min))return tooClose?"Reduce ligeramente la carga para volver al rango con el RIR objetivo.":"Mantén o ajusta la carga hasta entrar en el rango.";
 if(sets.every(s=>+s.reps>=+e.max))return tooClose?"Mantén la carga: alcanzaste las reps, pero demasiado cerca del fallo.":"Sube la carga mínima disponible y vuelve al inicio del rango.";
 if(tooClose)return"Mantén la carga y busca completar el rango con el RIR prescrito antes de progresar.";
 if(hist.length>=3){
   const totals=hist.map(h=>getEffectiveRecordedSets(h).reduce((a,s)=>a+(+s.reps||0),0));
   if(Math.max(...totals)-Math.min(...totals)<=1)return"Sin progreso en 3 exposiciones: mantén volumen y revisa técnica, carga y recuperación. Si continúa, revisar el plan.";
 }
 return"Mantén la carga e intenta sumar 1–2 repeticiones totales."
}
function weeklyPlannedMuscleSets(){
 const out=Object.fromEntries(MUSCLE_AXES.map(([name])=>[name,0])),plans=getPlans()[state.settings.mode]||{};
 Object.values(plans).forEach(s=>(s.exercises||[]).forEach(e=>{
  if(e.type==="mobility")return;
  const groups=muscleGroupsForExercise(e),sets=Math.max(0,+e.sets||0);
  groups.forEach(g=>out[g]+=sets)
 }));
 return out
}
function weeklyProjectedMuscleSets(x){
 const base=weeklyPlannedMuscleSets(),g=weeklyGuidanceStatus(x),out={};
 Object.keys(base).forEach(k=>out[k]=Math.round(base[k]*g.volumeFactor*10)/10);
 return out
}
function weeklyProjectionRadarSVG(base,projected){
 const labels=MUSCLE_AXES.map(x=>x[0]),a=labels.map(l=>+base[l]||0),b=labels.map(l=>+projected[l]||0);
 if(!a.some(v=>v>0))return `<div class="empty">El plan no contiene series de fuerza.</div>`;
 const W=360,H=340,cx=180,cy=164,R=106,levels=4,max=Math.max(6,...a,...b)*1.08;
 const pt=(i,r)=>{const ang=-Math.PI/2+i*2*Math.PI/labels.length;return[cx+Math.cos(ang)*r,cy+Math.sin(ang)*r]};
 const polygon=vals=>vals.map((v,i)=>pt(i,R*Math.min(1,v/max)).join(",")).join(" ");
 let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Plan base y proyección semanal de series por grupo muscular">`;
 for(let l=1;l<=levels;l++){const rr=R*l/levels;svg+=`<polygon points="${labels.map((_,i)=>pt(i,rr).join(",")).join(" ")}" fill="none" stroke="#233a55" stroke-width="1"/>`}
 labels.forEach((_,i)=>{const [x,y]=pt(i,R);svg+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#233a55" stroke-width="1"/>`});
 svg+=`<polygon points="${polygon(a)}" fill="rgba(148,163,184,.10)" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4"/>`;
 svg+=`<polygon points="${polygon(b)}" fill="rgba(45,212,191,.22)" stroke="#2dd4bf" stroke-width="2.5"/>`;
 b.forEach((v,i)=>{const[x,y]=pt(i,R*Math.min(1,v/max));svg+=`<circle cx="${x}" cy="${y}" r="3.4" fill="#38bdf8"/>`});
 labels.forEach((lab,i)=>{const[x,y]=pt(i,R+25),anch=x<cx-8?"end":x>cx+8?"start":"middle";svg+=`<text x="${x}" y="${y}" fill="#cbd5e1" font-size="10" text-anchor="${anch}" dominant-baseline="middle">${lab}</text>`});
 svg+=`</svg>`;return svg
}
function adviceCategory(text){
 const t=String(text||"").toLowerCase();
 if(t.includes("sube la carga"))return{key:"progress",label:"Progresar"};
 if(t.includes("reduce"))return{key:"reduce",label:"Reducir"};
 if(t.includes("sin progreso")||t.includes("revis"))return{key:"review",label:"Revisar"};
 if(t.includes("ajust"))return{key:"adjust",label:"Ajustar"};
 return{key:"maintain",label:"Mantener"}
}
function weeklyGroupSummary(exercises,x){
 const counts={progress:0,reduce:0,review:0,adjust:0,maintain:0};
 exercises.forEach(e=>{counts[adviceCategory(exerciseAdvice(e,x)).key]++});
 const order=["reduce","review","adjust","progress","maintain"],labels={reduce:"reducir",review:"revisar",adjust:"ajustar",progress:"progresar",maintain:"mantener"};
 const parts=order.filter(k=>counts[k]).map(k=>`${counts[k]} ${labels[k]}`);
 return `${exercises.length} ${exercises.length===1?"ejercicio":"ejercicios"}${parts.length?` · ${parts.join(" · ")}`:""}`
}
function openWeeklyExerciseGuide(){
 const x=currentDate(),plans=getPlans()[state.settings.mode],seen=new Map(),guidance=weeklyGuidanceStatus(x);
 Object.values(plans).forEach(s=>(s.exercises||[]).forEach(e=>{if(!seen.has(e.key))seen.set(e.key,e)}));
 const exercises=[...seen.values()],groups={};
 exercises.forEach(e=>{const f=exerciseFamily(e);(groups[f]??=[]).push(e)});
 const base=weeklyPlannedMuscleSets(),projected=weeklyProjectedMuscleSets(x),totalBase=Object.values(base).reduce((a,b)=>a+b,0),totalProjected=Object.values(projected).reduce((a,b)=>a+b,0);
 const ordered=Object.keys(groups).sort((a,b)=>{
  const ai=EXERCISE_FAMILY_ORDER.indexOf(a),bi=EXERCISE_FAMILY_ORDER.indexOf(b);
  return (ai<0?999:ai)-(bi<0?999:bi)
 });
 let html=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet weekly-guide-sheet">
  <div class="row between"><div><div class="eyebrow">Semana actual</div><div class="hero-title">Resumen y proyección</div><div class="subtitle">${esc(guidance.title)} · ${esc(guidance.rirNote)}</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div>
  <div class="weekly-projection-card">
   <div class="weekly-legend"><span><i class="legend-plan"></i>Plan base</span><span><i class="legend-projected"></i>Proyección recomendada</span></div>
   <div class="radar-wrap">${weeklyProjectionRadarSVG(base,projected)}</div>
   <div class="grid2 compact-metrics"><div class="metric"><div class="k">Volumen base</div><div class="v">${totalBase.toFixed(0)} <small>exposiciones de serie</small></div></div><div class="metric"><div class="k">Proyección</div><div class="v">${totalProjected.toFixed(0)} <small>aprox.</small></div></div></div>
   <div class="subtitle weekly-chart-note">Cada serie se asigna a los grupos principales implicados; por eso un ejercicio compuesto puede contribuir a más de un eje. Es una visualización de distribución de volumen, no una predicción de hipertrofia.</div>
  </div>
  <div class="section-sub">Por grupo muscular</div>
  <div class="weekly-muscle-groups">`;
 ordered.forEach((family,idx)=>{
  const es=groups[family];
  html+=`<details class="weekly-muscle-group" ${idx===0?"open":""}><summary><div><strong>${esc(family)}</strong><small>${esc(weeklyGroupSummary(es,x))}</small></div><span>＋</span></summary><div class="weekly-group-body">`;
  es.forEach(e=>{
   const advice=exerciseAdvice(e,x),cat=adviceCategory(advice);
   html+=`<div class="guide compact-guide"><div><strong>${esc(e.name)}</strong><span class="guide-status ${cat.key}">${esc(cat.label)}</span></div><small>${esc(advice)}</small></div>`
  });
  html+=`</div></details>`
 });
 html+=`</div></div></div>`;
 document.getElementById("modalRoot").innerHTML=html
}

function ensureDraftSession(x,p){
 let s=findSession(x,p.key);
 if(!s){
  s={date:x,key:p.key,title:p.title,mode:state.settings.mode,completed:false,startedAt:null,pausedAt:null,pausedDuration:0,duration:null,rpe:null,activeKcal:null,exercises:(p.exercises||[]).map(e=>e.type==="mobility"?({...e,done:false}):({...e,sets:+e.sets||0,recordedSets:[]}))};
  state.sessions.push(s);saveState(true)
 }
 return s
}
function gymHTML(p,x){
 const s=ensureDraftSession(x,p);
 const primaryAction=s.completed?'<span class="pill good">Sesión guardada</span>':s.startedAt?'<button class="btn small" onclick="openFinishGym()">Finalizar y guardar</button>':'<button class="btn small" onclick="startGym()">Iniciar sesión</button>';
 let html=`<div class="card hero"><div class="row between"><div><div class="eyebrow">${esc(pretty(x))}</div><div class="hero-title">${esc(p.title)}</div><div class="subtitle">${esc(p.subtitle||"")}</div></div><div id="autosaveStatus" class="autosave">Guardado</div></div><div class="hero-status">${s.startedAt&&!s.completed?`<span class="pill ${s.pausedAt?"warn":"teal"}">${s.pausedAt?"En pausa":"En curso"}</span>`:""}</div><div class="actions">${primaryAction}</div></div>${s.completed?'<div class="callout good">Sesión terminada. Puedes revisar todas las series debajo.</div>':'<div id="sessionCoachPanel" class="session-coach"></div>'}`;
 s.exercises.forEach((e,i)=>html+=exerciseCardHTML(e,i,"planned"));
 if(!s.completed)html+=`<div class="session-options"><div class="session-options-label">Opciones de sesión</div><button class="btn secondary" onclick="openExercisePicker('add','planned')">Añadir ejercicio extra</button>${s.startedAt?'<button class="btn" onclick="openFinishGym()">Finalizar y guardar</button>':""}<button class="btn danger" onclick="discardPlannedWorkout()">Descartar entrenamiento</button></div>`;
 setTimeout(()=>{document.querySelectorAll('[data-gym="planned"]').forEach(el=>el.addEventListener("input",schedulePlannedAutosave));if(!s.completed)updateRestTimerPanel();if((s.startedAt&&!s.completed)||state.restTimer)startRuntimeTicker()},0);
 return html
}
function exerciseCardHTML(e,i,scope){
 if(e.type==="mobility"){
  return `<div class="exercise"><div class="exhead"><div class="row between"><div><div class="exname">${i+1}. ${esc(e.name)}</div><div class="exmeta">Zona: ${esc(e.group||"Movilidad")} · ${esc(e.dose||e.note||"Movilidad")}</div></div><button class="btn ghost small" onclick="openExercisePicker('replace','${scope}',${i})">Cambiar</button></div></div><label class="task"><input type="checkbox" data-mob="${scope}" data-index="${i}" ${e.done?"checked":""} onchange="saveMobilityDone('${scope}',${i},this.checked)"><div><strong>Realizado</strong><small>${esc(e.note||"")}</small></div></label></div>`
 }
 e.recordedSets=allAttempts(e);
 const done=effectiveCount(e),goal=+e.sets||0,remaining=Math.max(0,goal-done);
 const previous=lastPerformanceSummary(e,currentDate());
 let html=`<div class="exercise"><div class="exhead"><div class="row between"><div><div class="exname">${i+1}. ${esc(e.name)}</div><div class="exmeta"><strong>Principal: ${esc(exerciseMuscleText(e))}</strong><br>Objetivo: ${goal} efectivas · ${e.min}–${e.max} reps · RIR ${esc(e.rir||"1–2")} · ${esc(e.rest)}</div></div><button class="btn ghost small" onclick="openExercisePicker('replace','${scope}',${i})">Cambiar</button></div><div class="effective-progress ${remaining===0?"complete":""}"><strong>${done}/${goal} efectivas</strong><span>${remaining?`${remaining} pendientes`:"Completado"}</span></div>${previous?`<div class="last-performance"><strong>Última sesión:</strong> ${esc(previous)}</div>`:""}<div class="recommend">${esc(exerciseAdvice(e,currentDate()))}</div></div>`;
 const arr=e.recordedSets||[];
 arr.forEach((a,j)=>{
  const cls=a.completedAt?classifyAttempt(e,a):null,status=inferredAttemptStatus(e,a),tag=status==="effective"?"Efectiva":status==="warmup"?"Aproximación":status==="approximation"?"No efectiva":a.attemptType==="warmup"?"Aproximación":"Intento efectivo";
  html+=`<div class="attempt-block ${status||"pending"}"><div class="attempt-head"><span class="attempt-tag">${esc(tag)}</span><span>${a.completedAt?esc(prettyTime(a.completedAt)):"Pendiente"}</span></div><div class="setlabels"><span></span><span>kg</span><span>reps</span><span>RIR</span></div><div class="setrow"><div class="setno">${j+1}</div><input data-gym="${scope}" id="${scope}_kg_${i}_${j}" inputmode="decimal" value="${a.kg??""}" placeholder="kg" aria-label="Carga en kg"><input data-gym="${scope}" id="${scope}_rp_${i}_${j}" inputmode="numeric" value="${a.reps??""}" placeholder="${e.min}-${e.max}" aria-label="Repeticiones"><input data-gym="${scope}" id="${scope}_rr_${i}_${j}" inputmode="decimal" value="${a.rir??""}" placeholder="${a.attemptType==="warmup"?"opc.":esc(e.rir||"1–2")}" aria-label="Repeticiones en reserva"></div><div class="set-action-row">`;
  if(!a.completedAt)html+=`<button type="button" class="set-done-btn" onclick="completeStrengthSet('${scope}',${i},${j})">✓ Serie hecha · iniciar descanso</button>`;
  else html+=`<div class="set-feedback"><span class="set-status ${cls?.tone||"warn"}">${esc(cls?.title||tag)}</span><small>${esc(cls?.text||"")}</small></div>`;
  html+=`<div class="attempt-actions">${a.completedAt?`<button type="button" class="btn ghost small" onclick="removeOneRep('${scope}',${i},${j})">−1 rep</button>`:""}<button type="button" class="btn danger small" onclick="discardSetAttempt('${scope}',${i},${j})">Descartar serie</button></div></div></div>`
 });
 html+=`<div class="attempt-add"><button type="button" class="btn ghost small" onclick="addSetAttempt('${scope}',${i},'warmup')">+ Aproximación</button><button type="button" class="btn secondary small" ${remaining===0?"disabled":""} onclick="addSetAttempt('${scope}',${i},'effective')">+ Serie efectiva</button></div><div class="exnote">${esc(e.note||"")}<br><strong>Regla:</strong> cuenta si termina entre ${e.min}–${e.max} reps y RIR ${esc(e.rir||"1–2")}.</div></div>`;
 return html
}
function prettyTime(ts){try{return new Date(ts).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}catch(e){return""}}
function normalizeSessionExercise(e){
 if(e.type==="mobility")return {...e,done:!!e.done};
 const target=Array.isArray(e.sets)?e.sets.length:(+e.sets||0);
 const legacy=Array.isArray(e.sets)?e.sets:(e.recordedSets||[]);
 return {...e,sets:target,recordedSets:legacy.filter(attemptHasData).map(normalizeAttempt)}
}
function normalizePlannedSession(){
 const x=currentDate(),p=planFor(x),s=ensureDraftSession(x,p);
 s.exercises=s.exercises.map(normalizeSessionExercise);return s
}
function startGym(){const s=normalizePlannedSession();if(!s.startedAt){s.startedAt=Date.now();s.pausedAt=null;s.pausedDuration=0}else if(s.pausedAt){s.pausedDuration=(+s.pausedDuration||0)+(Date.now()-s.pausedAt);s.pausedAt=null}saveState();renderWorkout();startRuntimeTicker();requestSessionWakeLock()}
function collectPlannedInputs(){
 const s=normalizePlannedSession();
 s.exercises.forEach((e,i)=>{
  if(e.type==="mobility")return;
  const existing=allAttempts(e);
  e.recordedSets=existing.map((a,j)=>({...a,kg:val(`planned_kg_${i}_${j}`),reps:val(`planned_rp_${i}_${j}`),rir:val(`planned_rr_${i}_${j}`)}))
 });
 return s
}
function schedulePlannedAutosave(){
 const st=document.getElementById("autosaveStatus");if(st)st.textContent="Guardando…";clearTimeout(autosaveTimer);
 autosaveTimer=setTimeout(()=>{collectPlannedInputs();saveState(true);if(st)st.textContent="Guardado"},350)
}

function discardPlannedWorkout(fromFinish=false){
 const x=currentDate(),p=planFor(x),s=findSession(x,p.key);if(!s)return;
 openAppConfirm(
  "Descartar entrenamiento",
  "Se eliminarán todas las series de esta sesión y no aparecerá en el historial.",
  "Descartar entreno",
  ()=>{
   state.sessions=state.sessions.filter(z=>!(z.date===x&&z.key===p.key));
   if(state.restTimer&&state.restTimer.date===x&&state.restTimer.scope==="planned")state.restTimer=null;
   releaseSessionWakeLock();activeView="Home";saveState();renderAll();showView("Home");stopRuntimeTickerIfIdle()
  },
  ()=>{if(fromFinish)openFinishGym()}
 )
}
function openFinishGym(){
 const s=collectPlannedInputs();if(!s.startedAt){toast("Inicia la sesión primero");return}
 const mins=Math.max(1,Math.round(sessionElapsedSeconds(s)/60)),sum=sessionEffectiveSummary(s);
 const warn=sum.remaining?`<div class="callout warn" style="margin-top:10px"><strong>${sum.done}/${sum.target} series efectivas completadas.</strong><br>Quedan ${sum.remaining}. Puedes finalizar, pero se guardará como sesión incompleta.</div>`:`<div class="callout good" style="margin-top:10px">Objetivo de series efectivas completado.</div>`;
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Finalizar y guardar</div><div class="hero-title">Resumen de sesión</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div>${warn}<div class="formgrid" style="margin-top:10px"><div class="field"><label>Duración (min)</label><input id="finDur" inputmode="numeric" value="${s.duration??mins}"></div><div class="field"><label>RPE sesión 1–10</label><input id="finRPE" inputmode="decimal" value="${s.rpe??""}"></div><div class="field wide"><label>Kcal activas (manual, opcional)</label><input id="finKcal" inputmode="numeric" value="${s.activeKcal??""}"></div></div><div class="actions"><button class="btn" onclick="finishGym()">Finalizar y guardar</button><button class="btn danger" onclick="discardPlannedWorkout(true)">Descartar entreno</button></div></div></div>`
}
function commitGymFinish(values){
 const s=collectPlannedInputs(),sum=sessionEffectiveSummary(s);
 s.completed=true;s.incomplete=sum.remaining>0;s.effectiveDone=sum.done;s.effectiveTarget=sum.target;
 if(s.pausedAt){s.pausedDuration=(+s.pausedDuration||0)+(Date.now()-s.pausedAt);s.pausedAt=null}
 s.duration=values.duration;s.rpe=values.rpe;s.activeKcal=values.kcal;s.finishedAt=Date.now();
 if(state.restTimer&&state.restTimer.date===s.date&&state.restTimer.scope==="planned")state.restTimer=null;
 releaseSessionWakeLock();saveState();closeModal();renderWorkout();renderBadges();stopRuntimeTickerIfIdle();toast("Entrenamiento guardado")
}
function finishGym(){
 const s=collectPlannedInputs(),sum=sessionEffectiveSummary(s);
 const values={duration:num("finDur"),rpe:num("finRPE"),kcal:num("finKcal")};
 if(sum.remaining){
  openAppConfirm(
   "Finalizar sesión incompleta",
   `Faltan ${sum.remaining} series efectivas. La sesión se guardará como incompleta, conservando todo lo realizado.`,
   "Finalizar y guardar",
   ()=>commitGymFinish(values),
   ()=>openFinishGym()
  );
  return
 }
 commitGymFinish(values)
}
function saveMobilityDone(scope,i,checked){if(scope==="planned"){const s=normalizePlannedSession();s.exercises[i].done=checked}else{const s=state.extraSessions.find(x=>x.id===scope);if(s)s.exercises[i].done=checked}saveState(true)}


const SUBSTITUTE_FAMILIES={
 quad_bilateral:["back_squat","front_squat","hack_squat","leg_press","smith_squat","pendulum_squat","goblet_squat"],
 quad_unilateral:["unilateral_leg_press","bulgarian_split_squat","walking_lunge"],
 hip_hinge:["rdl","deadlift","db_rdl","cable_pull_through"],
 ham_curl:["leg_curl","seated_leg_curl"],
 calf:["standing_calf","seated_calf"],
 chest_flat:["bench_press","machine_chest_press","dips","flat_db_press","plate_chest_press","push_up"],
 chest_incline:["incline_barbell_press","incline_db_press","incline_smith_press","incline_machine_press"],
 vertical_pull:["pull_up","chin_up","lat_pulldown","one_arm_lat_pulldown"],
 row:["chest_supported_row","seated_cable_row","barbell_row","one_arm_db_row","tbar_row","machine_row","high_row_machine"],
 lateral_delt:["lateral_raise","cable_lateral_raise","machine_lateral_raise"],
 biceps:["barbell_curl","db_curl","cable_curl","hammer_curl","preacher_curl","incline_db_curl"],
 triceps:["triceps_pushdown","overhead_triceps","rope_pushdown","cable_overhead_triceps","skull_crusher"],
 anterior_core:["cable_crunch","hanging_knee_raise","reverse_crunch","machine_crunch","ab_wheel"]
,hip_extension:["hip_thrust","smith_hip_thrust","glute_bridge"],knee_extension:["leg_extension","single_leg_extension"],hip_abduction:["hip_abduction","cable_abduction"],chest_fly:["pec_deck","cable_fly","cable_fly_low_high"],rear_delt:["reverse_pec_deck","cable_rear_delt_fly","face_pull"],shoulder_press:["overhead_press","seated_db_shoulder_press","machine_shoulder_press"]};
const SUBSTITUTE_KEY_TO_FAMILY=Object.fromEntries(Object.entries(SUBSTITUTE_FAMILIES).flatMap(([family,keys])=>keys.map(k=>[k,family])));
function sourceExercise(scope,index){
 if(scope==="planned")return normalizePlannedSession().exercises[index]||null;
 return state.extraSessions.find(x=>x.id===scope)?.exercises?.[index]||null
}
function substitutionCandidates(source){
 if(!source)return[];
 if(source.type==="mobility"){
  return EXERCISE_LIBRARY.filter(e=>e.type==="mobility"&&e.key!==source.key&&e.group===source.group)
 }
 const family=SUBSTITUTE_KEY_TO_FAMILY[source.key];
 if(family){
  return SUBSTITUTE_FAMILIES[family].filter(k=>k!==source.key).map(k=>EXERCISE_LIBRARY.find(e=>e.key===k)).filter(Boolean)
 }
 return EXERCISE_LIBRARY.filter(e=>e.type===source.type&&e.key!==source.key&&e.muscle&&source.muscle&&e.muscle===source.muscle)
}
function replacementFromCandidate(source,candidate){
 if(candidate.type==="mobility")return {...candidate,done:false};
 return {...candidate,sets:+source.sets||candidate.sets,min:+source.min||candidate.min,max:+source.max||candidate.max,rir:source.rir||candidate.rir,rest:source.rest||candidate.rest,recordedSets:[]}
}
function exerciseMuscleText(e){return e?.muscle||e?.group||"—"}
function applyLibrarySelection(key,action,scope,index){
 const candidate=libExercise(key);if(!candidate)return;
 if(scope==="planned"){
  const s=normalizePlannedSession();
  if(action==="replace"){
   const source=s.exercises[index];s.exercises[index]=replacementFromCandidate(source,candidate)
  }else s.exercises.push(candidate);
  saveState();closeModal();renderWorkout()
 }else{
  const s=state.extraSessions.find(x=>x.id===scope);if(!s)return;
  if(action==="replace"){
   const source=s.exercises[index];s.exercises[index]=replacementFromCandidate(source,candidate)
  }else s.exercises.push(candidate);
  saveState();editExtraSession(scope)
 }
}

function openExercisePicker(action,scope,index=null){
 const source=action==="replace"?sourceExercise(scope,index):null;
 if(action==="replace"){
  document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Sustitución</div><div class="hero-title">Sustituir ${esc(source?.name||"ejercicio")}</div><div class="subtitle">Principal: ${esc(exerciseMuscleText(source))}. Solo se muestran ejercicios con una función similar.</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="field" style="margin-top:10px"><label>Filtrar sustitutos</label><input id="libSearch" placeholder="Buscar entre sustitutos…" oninput="renderLibrary('replace','${scope}',${index})"></div><div id="libraryList"></div></div></div>`;
 }else{
  document.getElementById("modalRoot").innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="row between"><div><div class="eyebrow">Biblioteca</div><div class="hero-title">Añadir ejercicio extra</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="searchrow"><div class="field"><label>Buscar</label><input id="libSearch" placeholder="sentadilla, dorsal, movilidad…" oninput="renderLibrary('add','${scope}',${index===null?"null":index})"></div><div class="field"><label>Familia</label><select id="libType" onchange="renderLibrary('add','${scope}',${index===null?"null":index})"><option value="">Todas</option>${EXERCISE_FAMILY_ORDER.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join("")}</select></div></div><div id="libraryList"></div><div class="sep"></div><button class="btn secondary" onclick="openCustomExercise('add','${scope}',${index===null?"null":index})">Ejercicio personalizado</button></div></div>`;
 }
 renderLibrary(action,scope,index)
}
function renderLibrary(action,scope,index){
 const q=(val("libSearch")||"").toLowerCase();
 let list;
 if(action==="replace"){
  const source=sourceExercise(scope,index);
  list=substitutionCandidates(source).filter(e=>!q||(`${e.name} ${e.group} ${e.pattern} ${e.muscle||""}`).toLowerCase().includes(q));
 }else{
  const fam=val("libType");
  list=EXERCISE_LIBRARY.filter(e=>(!fam||exerciseFamily(e)===fam)&&(!q||(`${e.name} ${e.group} ${e.pattern} ${e.muscle||""}`).toLowerCase().includes(q)));
 }
 document.getElementById("libraryList").innerHTML=list.length?(action==="replace"?list.map(e=>`<button type="button" class="libitem" onclick="selectLibraryExercise('${e.key}','${action}','${scope}',${index===null?"null":index})"><strong>${esc(e.name)}</strong><small>Principal: ${esc(exerciseMuscleText(e))} · ${esc(e.pattern)}${e.type==="strength"?` · ${e.sets}×${e.min}–${e.max}`:` · ${esc(e.dose)}`}</small></button>`).join(""):(()=>{const grouped={};list.forEach(e=>(grouped[exerciseFamily(e)]??=[]).push(e));return Object.keys(grouped).sort((a,b)=>EXERCISE_FAMILY_ORDER.indexOf(a)-EXERCISE_FAMILY_ORDER.indexOf(b)).map(f=>`<div class="library-family"><div class="section-sub">${esc(f)}</div>${grouped[f].map(e=>`<button type="button" class="libitem" onclick="selectLibraryExercise('${e.key}','${action}','${scope}',${index===null?"null":index})"><strong>${esc(e.name)}</strong><small>Principal: ${esc(exerciseMuscleText(e))} · ${esc(e.pattern)}${e.type==="strength"?` · ${e.sets}×${e.min}–${e.max}`:` · ${esc(e.dose)}`}</small></button>`).join("")}</div>`).join("")})()):`<div class="empty">${action==="replace"?"No hay un sustituto suficientemente similar en la biblioteca.":"Sin resultados."}</div>`
}
function libExercise(key){const e=EXERCISE_LIBRARY.find(x=>x.key===key);if(!e)return null;if(e.type==="mobility")return{...e,done:false};return{...e,recordedSets:[]}}
function hasRecordedData(e){return !!(e&&(allAttempts(e).length||e.done))}
function selectLibraryExercise(key,action,scope,index){
 const source=action==="replace"?sourceExercise(scope,index):null;
 if(action==="replace"&&source&&hasRecordedData(source)){
  openAppConfirm(
   "Cambiar ejercicio",
   `Se eliminarán las series registradas de ${source.name}. El sustituto conservará el número de series, rango de repeticiones, RIR y descanso programados.`,
   "Cambiar",
   ()=>applyLibrarySelection(key,action,scope,index),
   ()=>openExercisePicker(action,scope,index)
  );
  return
 }
 applyLibrarySelection(key,action,scope,index)
}
function openCustomExercise(action,scope,index){
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Personalizado</div><div class="hero-title">Nuevo ejercicio</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="formgrid"><div class="field wide"><label>Nombre</label><input id="cxName"></div><div class="field"><label>Tipo</label><select id="cxType"><option value="strength">Fuerza</option><option value="mobility">Movilidad</option></select></div><div class="field"><label>Grupo</label><input id="cxGroup" placeholder="Pierna, torso…"></div><div class="field"><label>Series</label><input id="cxSets" inputmode="numeric" value="3"></div><div class="field"><label>Reps mín.</label><input id="cxMin" inputmode="numeric" value="8"></div><div class="field"><label>Reps máx.</label><input id="cxMax" inputmode="numeric" value="12"></div><div class="field"><label>RIR</label><input id="cxRir" value="1–2"></div><div class="field"><label>Descanso / dosis</label><input id="cxRest" value="2 min"></div></div><div class="actions"><button class="btn" onclick="saveCustomExercise('${action}','${scope}',${index===null?"null":index})">Añadir</button></div></div></div>`
}
function saveCustomExercise(action,scope,index){
 const type=val("cxType"),key="custom_"+Date.now().toString(36),e=type==="mobility"?{key,name:val("cxName")||"Movilidad",type,pattern:"Movilidad",group:val("cxGroup")||"Movilidad",dose:val("cxRest")||"2 × 30 s",note:"",done:false}:{key,name:val("cxName")||"Ejercicio",type,pattern:"Personalizado",group:val("cxGroup")||"",sets:+val("cxSets")||3,min:+val("cxMin")||8,max:+val("cxMax")||12,rir:val("cxRir")||"1–2",rest:val("cxRest")||"2 min",muscle:val("cxGroup")||"",note:"",recordedSets:[]};
 if(scope==="planned"){const s=normalizePlannedSession();s.exercises.push(e);saveState();closeModal();renderWorkout()}else{const s=state.extraSessions.find(x=>x.id===scope);if(!s)return;s.exercises.push(e);saveState();editExtraSession(scope)}
}

function extraSessionsHTML(x){
 const extras=extraForDate(x);let html=`<div class="section">Sesiones extra</div>`;
 if(!extras.length)html+=`<div class="card"><div class="subtitle">Puedes registrar una sesión adicional o una sesión de movilidad independiente.</div><div class="actions"><button class="btn secondary" onclick="openExtraSession()">Nueva sesión extra</button></div></div>`;
 extras.forEach(s=>{html+=`<div class="card"><div class="row between"><div><div class="eyebrow">Extra</div><div class="hero-title" style="font-size:18px">${esc(s.title)}</div><div class="subtitle">${s.completed?`${s.duration||0} min · RPE ${s.rpe??"—"}`:"En curso"}</div></div><button class="btn ghost small" onclick="editExtraSession('${s.id}')">${s.completed?"Ver guardado":"Abrir"}</button></div></div>`});
 if(extras.length)html+=`<button class="btn secondary" onclick="openExtraSession()">Añadir otra sesión</button>`;
 return html
}
function openExtraSession(){
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Nueva sesión</div><div class="hero-title">Entreno extra</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="field"><label>Nombre</label><input id="exTitle" value="Sesión extra"></div><div class="actions"><button class="btn" onclick="createExtraSession()">Crear</button></div></div></div>`
}
function createExtraSession(){const id="extra_"+Date.now().toString(36);state.extraSessions.push({id,date:currentDate(),title:val("exTitle")||"Sesión extra",completed:false,startedAt:Date.now(),duration:null,rpe:null,activeKcal:null,exercises:[]});saveState();closeModal();editExtraSession(id)}
function editExtraSession(id){
 const s=state.extraSessions.find(x=>x.id===id);if(!s)return;
 let html=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Entreno extra</div><div class="hero-title">${esc(s.title)}</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div>`;
 s.exercises.forEach((e,i)=>html+=exerciseCardHTML(e,i,id));
 html+=`<div class="actions"><button class="btn secondary" onclick="openExercisePicker('add','${id}')">Añadir ejercicio</button><button class="btn" onclick="openFinishExtra('${id}')">Finalizar y guardar</button><button class="btn danger" onclick="discardExtraSession('${id}')">Descartar entreno</button></div></div></div>`;
 document.getElementById("modalRoot").innerHTML=html;
 setTimeout(()=>document.querySelectorAll(`[data-gym="${id}"]`).forEach(el=>el.addEventListener("input",()=>saveExtraInputs(id))),0)
}

function discardExtraSession(id){
 const s=state.extraSessions.find(x=>x.id===id);if(!s)return;
 openAppConfirm(
  "Descartar entrenamiento extra",
  "La sesión extra se eliminará completamente y no aparecerá en el historial.",
  "Descartar entreno",
  ()=>{
   state.extraSessions=state.extraSessions.filter(x=>x.id!==id);
   if(state.restTimer&&state.restTimer.scope===id)state.restTimer=null;
   saveState();closeModal();renderAll();stopRuntimeTickerIfIdle()
  },
  ()=>editExtraSession(id)
 )
}
function saveExtraInputs(id){
 const s=state.extraSessions.find(x=>x.id===id);if(!s)return;
 s.exercises.forEach((e,i)=>{if(e.type==="mobility")return;const existing=allAttempts(e);e.recordedSets=existing.map((a,j)=>({...a,kg:val(`${id}_kg_${i}_${j}`),reps:val(`${id}_rp_${i}_${j}`),rir:val(`${id}_rr_${i}_${j}`)}))});saveState(true)
}
function openFinishExtra(id){saveExtraInputs(id);const s=state.extraSessions.find(x=>x.id===id),mins=s.startedAt?Math.max(1,Math.round((Date.now()-s.startedAt)/60000)):60;document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="hero-title">Finalizar y guardar extra</div><div class="formgrid"><div class="field"><label>Duración min</label><input id="exDur" inputmode="numeric" value="${mins}"></div><div class="field"><label>RPE 1–10</label><input id="exRPE" inputmode="decimal"></div><div class="field wide"><label>Kcal activas (manual, opcional)</label><input id="exKcal" inputmode="numeric"></div></div><div class="actions"><button class="btn" onclick="finishExtra('${id}')">Finalizar y guardar</button></div></div></div>`}
function finishExtra(id){const s=state.extraSessions.find(x=>x.id===id);if(!s)return;s.completed=true;s.duration=num("exDur");s.rpe=num("exRPE");s.activeKcal=num("exKcal");saveState();closeModal();renderAll()}

function swimHTML(x){const old=state.swim.find(s=>s.date===x)||{};return `<div class="card hero"><div class="eyebrow">${esc(pretty(x))}</div><div class="hero-title">Natación</div><div class="subtitle">Sesión planificada por tu entrenador.</div></div><div class="card"><div class="formgrid"><div class="field"><label>Metros</label><input id="swM" inputmode="numeric" value="${old.meters??1800}"></div><div class="field"><label>Duración min</label><input id="swD" inputmode="numeric" value="${old.duration??60}"></div><div class="field"><label>RPE 1–10</label><input id="swR" inputmode="decimal" value="${old.rpe??""}"></div><div class="field"><label>Hombro 0–10</label><input id="swP" inputmode="decimal" value="${old.pain??0}"></div><div class="field wide"><label>Kcal activas (manual, opcional)</label><input id="swK" inputmode="numeric" value="${old.activeKcal??""}"></div><div class="field wide"><label>Notas</label><textarea id="swN">${esc(old.notes??"")}</textarea></div></div><div class="actions"><button class="btn" onclick="saveSwim()">Guardar natación</button></div></div>`}
function saveSwim(){upsert(state.swim,{date:currentDate(),completed:true,meters:num("swM"),duration:num("swD"),rpe:num("swR"),pain:num("swP"),activeKcal:num("swK"),notes:val("swN")});saveState();renderAll()}
function cardioHTML(x){
 const old=state.cardio.find(s=>s.date===x)||{},m=state.mobility.find(s=>s.date===x)||{done:[]},mobility=EXERCISE_LIBRARY.filter(e=>e.type==="mobility").slice(0,9),runtime=state.cardioRuntime&&state.cardioRuntime.date===x?state.cardioRuntime:null,selected=runtime?.templateKey||old.cardioType||"z2";
 let html=`<div class="card hero"><div class="eyebrow">${esc(pretty(x))}</div><div class="hero-title">Cardio + movilidad</div><div class="subtitle">Elige cardio continuo o un HIIT guiado.</div></div>`;
 if(!runtime){
  html+=`<div class="card"><div class="formgrid"><div class="field"><label>Tipo</label><select id="caTemplate" onchange="renderCardioTemplateInfo()">${cardioTemplateOptions(selected)}</select></div><div class="field"><label>Modalidad</label><select id="caMo">${["Bici","Elíptica","Cinta","Cinta inclinada","Remo","Escaladora"].map(v=>`<option ${old.modality===v?"selected":""}>${v}</option>`).join("")}</select></div></div><div id="cardioTemplateInfo" class="cardio-template-info"></div><div class="callout" style="margin-top:10px">Para HIIT, prioriza bici o elíptica si quieres minimizar impacto y fatiga muscular adicional. Los intervalos duros son RPE 8–9, no sprints máximos.</div><div class="actions"><button type="button" class="btn" onclick="startCardioSession()">Iniciar cardio guiado</button></div></div>`
 }
 html+=`<div id="cardioRuntimePanel"></div>`;
 html+=`<div class="card"><div class="eyebrow">Movilidad</div>${mobility.map((q,i)=>`<label class="task"><input type="checkbox" id="mob_${i}" ${m.done?.includes(i)?"checked":""}><div><strong>${esc(q.name)}</strong><small>${esc(q.dose)}</small></div></label>`).join("")}<div class="actions"><button type="button" class="btn secondary" onclick="saveCardioMobility()">Guardar movilidad</button></div></div>`;
 setTimeout(()=>{if(!runtime)renderCardioTemplateInfo();updateCardioRuntimePanel();if(runtime)startRuntimeTicker()},0);
 return html
}
function saveCardioMobility(){
 const mobility=EXERCISE_LIBRARY.filter(e=>e.type==="mobility").slice(0,9),done=mobility.map((_,i)=>document.getElementById(`mob_${i}`)?.checked?i:null).filter(v=>v!==null);
 upsert(state.mobility,{date:currentDate(),done});saveState();toast("Movilidad guardada")
}
function renderFood(){
 const x=currentDate(),items=foodsFor(x),nut=dayNutrition(x);
 let html=`<div class="card hero"><div class="eyebrow">${esc(pretty(x))}</div><div class="hero-title">Comidas</div><div class="subtitle">Añade cada comida cuando la hagas. Solo aparecerán en la pantalla las que hayas registrado.</div><div class="actions"><button class="btn" onclick="openMealChooser()">Añadir comida</button><button class="btn secondary" onclick="copyYesterdayFood()">Copiar ayer</button></div></div>`;
 html+=`<div class="card"><div class="row between"><div><div class="eyebrow">Estimación del día</div><strong>${items.length?`${items.length} ${items.length===1?"alimento":"alimentos"} registrados`:"Sin registros todavía"}</strong></div><button type="button" class="btn ghost small" onclick="goToNutritionSettings()">Objetivos</button></div>${nutritionDashboardHTML(nut)}<div class="nutrition-note">Valores estimados a partir de las cantidades registradas; pueden variar según marca y preparación.</div></div>`;

 const activeMeals=MEAL_TYPES.filter(mt=>items.some(i=>i.meal===mt));
 if(!activeMeals.length){
  html+=`<div class="empty food-empty-state"><strong>Aún no has añadido ninguna comida.</strong><br>Pulsa “Añadir comida” y elige desayuno, almuerzo, merienda, cena o post-entreno.</div>`
 }else{
  activeMeals.forEach(mt=>{
   const group=items.filter(i=>i.meal===mt),total=group.reduce((a,i)=>{const n=calcFood(i);a.kcal+=n.kcal;a.p+=n.p;return a},{kcal:0,p:0});
   html+=`<div class="meal"><div class="mealhead"><div><strong>${mt}</strong><small>${esc(MEAL_HINTS[mt]||"")}</small><div class="meal-summary"><span class="meal-total">${Math.round(total.kcal)} kcal · ${Math.round(total.p)} g proteína</span></div></div><div class="row" style="gap:7px"><span class="pill">${group.length}</span><button type="button" class="btn ghost small" onclick="openFoodModal('${mt}')">+ Añadir</button></div></div>`;
   group.forEach(i=>{const db=foodRecord(i.foodKey);if(db){const meta=foodInputMeta(i.foodKey);html+=`<div class="foodrow"><div><b>${esc(db.name)}</b><small>${Math.round(calcFood(i).kcal)} kcal · referencia: ${esc(meta.reference)}</small></div><div class="amount">${foodDisplayAmount(i)}</div><div class="food-actions"><button type="button" class="food-edit-btn" onclick="openEditFood('${i.id}')">Editar</button><button type="button" class="food-delete-btn" aria-label="Eliminar ${esc(db.name)}" onclick="deleteFood('${i.id}')">×</button></div></div>`}});
   html+=`</div>`
  });
  html+=`<div class="actions food-add-another"><button type="button" class="btn secondary" onclick="openMealChooser()">Añadir otra comida</button></div>`
 }
 document.getElementById("viewFood").innerHTML=html
}
function formatAmount(a,u){return `${Number(a)%1===0?Number(a):Number(a).toFixed(1)} ${u}`}
function foodOptions(meal){
 const allowed=[...(MEAL_FOOD_KEYS[meal]||Object.keys(FOOD_DB)),...(state.customFoods||[]).map(f=>f.key)],cats=["Mis alimentos","Carbohidrato","Proteína","Verdura","Fruta","Lácteo","Suplemento","Extra"];
 return cats.map(cat=>{
  const opts=allowed.map(k=>[k,foodRecord(k)]).filter(([k,v])=>v&&(v.custom?(cat==="Mis alimentos"):v.cat===cat));
  return opts.length?`<optgroup label="${cat}">${opts.map(([k,v])=>`<option value="${k}">${v.name}</option>`).join("")}</optgroup>`:""
 }).join("")
}
function recentFoodForMeal(meal){
 const allowed=new Set([...(MEAL_FOOD_KEYS[meal]||Object.keys(FOOD_DB)),...(state.customFoods||[]).map(f=>f.key)]),seen=new Set(),out=[];
 [...state.foods].sort((a,b)=>b.created-a.created).forEach(i=>{
  if(out.length>=6||!allowed.has(i.foodKey)||seen.has(i.foodKey))return;
  seen.add(i.foodKey);out.push(i)
 });
 return out
}

function openMealChooser(){
 document.getElementById("modalRoot").innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">
  <div class="row between"><div><div class="eyebrow">Nueva comida</div><div class="hero-title">¿Qué quieres registrar?</div><div class="subtitle">Elige el momento del día y después aparecerán solo alimentos que tengan sentido en ese contexto.</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>
  <div class="meal-choice-list">
   ${MEAL_TYPES.map(mt=>`<button type="button" class="meal-choice" onclick="openFoodModal('${mt}')"><strong>${mt}</strong><small>${esc(MEAL_HINTS[mt]||"")}</small><span>›</span></button>`).join("")}
  </div>
 </div></div>`
}

function openFoodModal(defaultMeal="Desayuno"){
 const meal=MEAL_TYPES.includes(defaultMeal)?defaultMeal:"Desayuno";
 document.getElementById("modalRoot").innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">
 <div class="row between"><div><div class="eyebrow">${esc(meal)}</div><div class="hero-title">Añadir alimento</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>
 <input type="hidden" id="fdMeal" value="${esc(meal)}">
 <div id="fdMealHint" class="meal-hint">${esc(MEAL_HINTS[meal]||"")}</div>
 <div class="formgrid food-modal-grid">
  <div class="field wide"><label>Alimento</label><select id="fdKey" onchange="updateFoodAmountUI()"></select></div>
  <div class="field wide"><label id="fdAmountLabel">Cantidad</label><input id="fdAmount" inputmode="decimal"></div>
 </div>
 <div id="fdHelp" class="subtitle"></div>
 <div id="fdChips" class="quickchips"></div>
 <div id="fdCombos"></div>
 <div class="actions food-modal-actions"><button class="btn" onclick="saveFood()">Añadir alimento</button><button type="button" class="btn secondary" onclick="openCustomFoodModal('${esc(meal)}')">Crear alimento</button><button type="button" class="btn ghost" onclick="openMealChooser()">Cambiar comida</button></div>
 <div id="fdRecent"></div>
 </div></div>`;
 updateFoodMealUI()
}
function updateFoodMealUI(){
 const meal=val("fdMeal")||"Desayuno",sel=document.getElementById("fdKey");if(!sel)return;
 sel.innerHTML=foodOptions(meal);
 document.getElementById("fdMealHint").textContent=MEAL_HINTS[meal]||"";
 renderFoodCombos(meal);
 renderFoodRecent(meal);
 updateFoodAmountUI()
}
function renderFoodCombos(meal){
 const combos=FOOD_QUICK_COMBOS[meal]||[],root=document.getElementById("fdCombos");if(!root)return;
 root.innerHTML=combos.length?`<div class="sep"></div><div class="eyebrow">Combinaciones rápidas</div><div class="quickchips">${combos.map((c,i)=>`<button type="button" class="chip" onclick="addFoodCombo('${meal}',${i})">${esc(c.name)}</button>`).join("")}</div>`:""
}
function renderFoodRecent(meal){
 const recent=recentFoodForMeal(meal),root=document.getElementById("fdRecent");if(!root)return;
 root.innerHTML=recent.length?`<div class="sep"></div><div class="eyebrow">Recientes para ${esc(meal.toLowerCase())}</div><div class="quickchips">${recent.map(i=>{const db=foodRecord(i.foodKey);return db?`<button type="button" class="chip" onclick="quickRepeatFood('${i.foodKey}',${fromStoredFoodAmount(i)},'${meal}')">${esc(db.name)} · ${foodDisplayAmount(i)}</button>`:""}).join("")}</div>`:""
}
function updateFoodAmountUI(){
 const key=val("fdKey"),db=foodRecord(key);if(!db)return;
 const meta=foodInputMeta(key),presets=meta.presets;
 document.getElementById("fdAmountLabel").textContent=`Cantidad en ${meta.inputUnit}`;
 document.getElementById("fdHelp").innerHTML=`<strong>Referencia:</strong> ${esc(meta.reference)}.`;
 document.getElementById("fdChips").innerHTML=presets.map(n=>`<button type="button" class="chip" onclick="document.getElementById('fdAmount').value=${n}">${n} ${meta.inputUnit}</button>`).join("");
 document.getElementById("fdAmount").placeholder=meta.inputUnit;
 document.getElementById("fdAmount").value=presets[Math.min(1,presets.length-1)]??1
}
function addFoodCombo(meal,index){
 const combo=(FOOD_QUICK_COMBOS[meal]||[])[index];if(!combo)return;
 combo.items.forEach(([foodKey,inputAmount],n)=>{
  const meta=foodInputMeta(foodKey),amount=toStoredFoodAmount(foodKey,inputAmount);
  state.foods.push({id:Date.now().toString(36)+n+Math.random().toString(36).slice(2,5),created:Date.now()+n,date:currentDate(),meal,foodKey,amount,displayAmount:inputAmount,displayUnit:meta.inputUnit})
 });
 saveState();closeModal();renderAll();showView("Food");toast(`${combo.name} añadido`)
}
function saveFood(){
 const key=val("fdKey"),inputAmount=+val("fdAmount");if(!key||!Number.isFinite(inputAmount)||inputAmount<=0){toast("Introduce una cantidad válida");return}
 const meta=foodInputMeta(key),amount=toStoredFoodAmount(key,inputAmount);
 state.foods.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),created:Date.now(),date:currentDate(),meal:val("fdMeal"),foodKey:key,amount,displayAmount:inputAmount,displayUnit:meta.inputUnit});
 saveState();closeModal();renderAll();showView("Food")
}
function quickRepeatFood(key,inputAmount,meal){
 const meta=foodInputMeta(key),amount=toStoredFoodAmount(key,+inputAmount);
 state.foods.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),created:Date.now(),date:currentDate(),meal,foodKey:key,amount,displayAmount:+inputAmount,displayUnit:meta.inputUnit});
 saveState();closeModal();renderAll();showView("Food")
}

function openEditFood(id){
 const item=state.foods.find(i=>i.id===id);if(!item)return;
 const db=foodRecord(item.foodKey),meta=foodInputMeta(item.foodKey),current=fromStoredFoodAmount(item);
 document.getElementById("modalRoot").innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">
  <div class="row between"><div><div class="eyebrow">${esc(item.meal)}</div><div class="hero-title">Editar cantidad</div><div class="subtitle">${esc(db?.name||item.foodKey)}</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>
  <div class="field" style="margin-top:12px"><label>Cantidad en ${esc(meta.inputUnit)}</label><input id="editFoodAmount" inputmode="decimal" value="${current}"></div>
  <div class="subtitle food-edit-ref"><strong>Referencia:</strong> ${esc(meta.reference)}.</div>
  <div class="quickchips">${meta.presets.map(n=>`<button type="button" class="chip" onclick="document.getElementById('editFoodAmount').value=${n}">${n} ${esc(meta.inputUnit)}</button>`).join("")}</div>
  <div class="actions"><button type="button" class="btn" onclick="saveEditedFood('${id}')">Guardar cambios</button><button type="button" class="btn danger" onclick="deleteFood('${id}')">Eliminar alimento</button></div>
 </div></div>`
}
function saveEditedFood(id){
 const item=state.foods.find(i=>i.id===id);if(!item)return;
 const inputAmount=+val("editFoodAmount");if(!Number.isFinite(inputAmount)||inputAmount<=0){toast("Introduce una cantidad válida");return}
 const meta=foodInputMeta(item.foodKey);
 item.amount=toStoredFoodAmount(item.foodKey,inputAmount);
 item.displayAmount=inputAmount;
 item.displayUnit=meta.inputUnit;
 saveState();closeModal();renderAll();showView("Food")
}

function deleteFood(id){
 const item=state.foods.find(i=>i.id===id),db=item&&foodRecord(item.foodKey);if(!item)return;
 openAppConfirm("Eliminar alimento",`${db?.name||"Este alimento"} se quitará de ${item.meal.toLowerCase()}.`,"Eliminar",()=>{state.foods=state.foods.filter(i=>i.id!==id);saveState();renderAll();showView("Food")},()=>openEditFood(id))
}
function performCopyYesterdayFood(arr){arr.forEach(i=>state.foods.push({...i,id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),created:Date.now()+Math.random(),date:currentDate(),displayAmount:i.displayAmount??fromStoredFoodAmount(i),displayUnit:i.displayUnit??foodInputMeta(i.foodKey).inputUnit}));saveState();renderAll();showView("Food");toast("Comidas de ayer copiadas")}
function copyYesterdayFood(){
 const d=dateObj(currentDate());d.setDate(d.getDate()-1);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());const y=d.toISOString().slice(0,10),arr=foodsFor(y);if(!arr.length){toast("Ayer no hay alimentos");return}
 if(foodsFor(currentDate()).length){openAppConfirm("Copiar comidas de ayer","Ya hay alimentos hoy. Se añadirán los de ayer sin sustituir los actuales.","Añadir igualmente",()=>performCopyYesterdayFood(arr));return}
 performCopyYesterdayFood(arr)
}

function openCustomFoodModal(meal="Desayuno"){
 document.getElementById("modalRoot").innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="row between"><div><div class="eyebrow">Mis alimentos</div><div class="hero-title">Crear alimento</div><div class="subtitle">Guarda los valores que aparecen en la etiqueta del producto.</div></div><button type="button" class="btn ghost small" onclick="openFoodModal('${esc(meal)}')">Volver</button></div><input type="hidden" id="cfMeal" value="${esc(meal)}"><div class="formgrid" style="margin-top:12px"><div class="field wide"><label>Nombre</label><input id="cfName" placeholder="Ej. Yogur natural de mi marca"></div><div class="field"><label>Valores por</label><select id="cfBase" onchange="updateCustomFoodBaseHelp()"><option value="100g">100 g</option><option value="100ml">100 ml</option><option value="unit">1 unidad</option></select></div><div class="field"><label>Categoría</label><select id="cfCat">${["Carbohidrato","Proteína","Verdura","Fruta","Lácteo","Suplemento","Extra"].map(v=>`<option>${v}</option>`).join("")}</select></div><div class="field"><label>Energía (kcal)</label><input id="cfKcal" inputmode="decimal"></div><div class="field"><label>Proteína (g)</label><input id="cfP" inputmode="decimal"></div><div class="field"><label>Carbohidratos (g)</label><input id="cfC" inputmode="decimal"></div><div class="field"><label>Grasas (g)</label><input id="cfF" inputmode="decimal"></div></div><div id="cfHelp" class="callout" style="margin-top:10px">Introduce los valores nutricionales por 100 g.</div><div class="actions"><button type="button" class="btn" onclick="saveCustomFood()">Guardar y usar</button><button type="button" class="btn secondary" onclick="openFoodModal('${esc(meal)}')">Cancelar</button></div></div></div>`
}
function updateCustomFoodBaseHelp(){const base=val("cfBase"),el=document.getElementById("cfHelp");if(el)el.textContent=`Introduce los valores nutricionales por ${base==="unit"?"una unidad":base==="100ml"?"100 ml":"100 g"}.`}
function saveCustomFood(){
 const name=val("cfName").trim(),base=val("cfBase"),meal=val("cfMeal")||"Desayuno",nums={kcal:num("cfKcal"),p:num("cfP"),c:num("cfC"),f:num("cfF")};
 if(!name){toast("Escribe el nombre del alimento");return}
 if(Object.values(nums).some(v=>v==null||!Number.isFinite(v)||v<0)){toast("Completa todos los valores con números válidos");return}
 const perUnit=base==="unit",unit=perUnit?"ud":base==="100ml"?"ml":"g",key=`custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
 state.customFoods.push({key,name,cat:val("cfCat")||"Extra",unit,ref:perUnit?"una unidad":base==="100ml"?"volumen indicado en la etiqueta":"peso indicado en la etiqueta",perUnit,custom:true,...nums});saveState(true);openFoodModal(meal);const select=document.getElementById("fdKey");if(select){select.value=key;updateFoodAmountUI()}toast("Alimento creado")
}
function removeCustomFood(key){
 const food=foodRecord(key);if(!food?.custom)return;
 if(state.foods.some(i=>i.foodKey===key)){toast("No se puede eliminar: ya tiene registros");return}
 openAppConfirm("Eliminar alimento personalizado",`${food.name} dejará de aparecer en la lista.`,"Eliminar",()=>{state.customFoods=state.customFoods.filter(f=>f.key!==key);saveState();renderSettings()},()=>renderSettings())
}

function openMeasurements(){const x=currentDate(),old=state.body.find(b=>b.date===x)||{};document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Medición semanal</div><div class="hero-title">Peso y cintura</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="callout">Domingo por la mañana, después de ir al baño y antes de desayunar.</div><div class="formgrid" style="margin-top:10px"><div class="field"><label>Peso (kg)</label><input id="mw" inputmode="decimal" value="${old.weight??""}"></div><div class="field"><label>Cintura (cm)</label><input id="mwa" inputmode="decimal" value="${old.waist??""}"></div></div><div class="actions"><button class="btn" onclick="saveMeasurements()">Guardar</button></div></div></div>`}
function saveMeasurements(){upsert(state.body,{date:currentDate(),weight:num("mw"),waist:num("mwa")});saveState();closeModal();renderAll()}

function openMonthlyReview(){
 const x=currentDate(),old=monthlyMeasurementRecord(x)||{},photo=photoMonthRecord(x)||{views:[]};
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet">
  <div class="row between"><div><div class="eyebrow">${esc(monthKey(x))}</div><div class="hero-title">Revisión corporal mensual</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>
  <div class="callout">Mide siempre en condiciones parecidas. No aprietes la cinta y usa los mismos puntos anatómicos cada mes.</div>
  <div class="formgrid" style="margin-top:10px">
   <div class="field"><label>Pecho (cm)</label><input id="mmChest" inputmode="decimal" value="${old.chest??""}"></div>
   <div class="field"><label>Brazo flexionado (cm)</label><input id="mmArm" inputmode="decimal" value="${old.arm??""}"></div>
   <div class="field"><label>Cadera/glúteo (cm)</label><input id="mmHips" inputmode="decimal" value="${old.hips??""}"></div>
   <div class="field"><label>Muslo derecho (cm)</label><input id="mmThigh" inputmode="decimal" value="${old.thigh??""}"></div>
   <div class="field"><label>Gemelo derecho (cm)</label><input id="mmCalf" inputmode="decimal" value="${old.calf??""}"></div>
  </div>
  <details style="margin-top:10px"><summary>Cómo medir</summary>
   <div class="subtitle" style="margin-top:8px">
    Pecho: cinta horizontal a la altura del pecho, tras una espiración normal.<br>
    Brazo: derecho, flexionado, en el punto de mayor perímetro.<br>
    Cadera/glúteo: punto de mayor perímetro.<br>
    Muslo: derecho, usa siempre el mismo punto de referencia.<br>
    Gemelo: derecho, máximo perímetro.
   </div>
  </details>
  <div class="actions"><button type="button" class="btn" onclick="saveMonthlyMeasurements()">Guardar perímetros</button><button type="button" class="btn secondary" onclick="openPhotoCheck()">Fotos del mes (${(photo.views||[]).length}/3)</button></div>
 </div></div>`
}
function saveMonthlyMeasurements(){
 const obj={date:currentDate(),chest:num("mmChest"),arm:num("mmArm"),hips:num("mmHips"),thigh:num("mmThigh"),calf:num("mmCalf")};
 upsert(state.body,obj);saveState();closeModal();renderAll()
}

const MEDIA_DB_NAME="training_lab_media_v1";
const MEDIA_STORE="photos";
function openMediaDB(){
 return new Promise((resolve,reject)=>{
  if(!("indexedDB" in window)){reject(new Error("Almacenamiento de fotos no disponible"));return}
  const req=indexedDB.open(MEDIA_DB_NAME,1);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(MEDIA_STORE))db.createObjectStore(MEDIA_STORE,{keyPath:"id"})};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error("No se pudo abrir el almacenamiento"))
 })
}
async function putPhoto(id,blob){
 const db=await openMediaDB();
 await new Promise((resolve,reject)=>{const tx=db.transaction(MEDIA_STORE,"readwrite");tx.objectStore(MEDIA_STORE).put({id,blob});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
 db.close()
}
async function getPhoto(id){
 const db=await openMediaDB();
 const result=await new Promise((resolve,reject)=>{const tx=db.transaction(MEDIA_STORE,"readonly");const req=tx.objectStore(MEDIA_STORE).get(id);req.onsuccess=()=>resolve(req.result?.blob||null);req.onerror=()=>reject(req.error)});
 db.close();return result
}
async function deletePhoto(id){
 const db=await openMediaDB();
 await new Promise((resolve,reject)=>{const tx=db.transaction(MEDIA_STORE,"readwrite");tx.objectStore(MEDIA_STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
 db.close()
}
function compressPhoto(file){
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{
   const maxSide=1400,scale=Math.min(1,maxSide/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale));
   const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
   canvas.getContext("2d").drawImage(img,0,0,w,h);
   URL.revokeObjectURL(url);
   canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("No se pudo comprimir la foto")),"image/jpeg",0.82)
  };
  img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("No se pudo leer la foto"))};img.src=url
 })
}
function openPhotoCheck(){
 const x=currentDate(),m=monthKey(x),photo=photoMonthRecord(x)||{views:[]};
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet">
  <div class="row between"><div><div class="eyebrow">${esc(m)}</div><div class="hero-title">Fotos mensuales</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>
  <div class="callout">Frontal, lateral y espalda. Intenta repetir luz, distancia, postura y ropa cada mes. Las fotos se guardan localmente en este dispositivo.</div>
  ${photoInputRow("front","Frontal",photo)}
  ${photoInputRow("side","Lateral",photo)}
  ${photoInputRow("back","Espalda",photo)}
  <div class="subtitle" style="margin-top:12px">Las fotos no se incluyen en la copia JSON/CSV.</div>
 </div></div>`
}
function photoInputRow(view,label,photo){
 const done=(photo.views||[]).includes(view);
 return `<div class="photo-upload-row"><div><strong>${label}</strong><small>${done?"Guardada":"Pendiente"}</small></div><label class="btn ${done?"ghost":"secondary"} small">${done?"Sustituir":"Añadir"}<input type="file" accept="image/*" style="display:none" onchange="saveProgressPhoto(event,'${view}')"></label></div>`
}
async function saveProgressPhoto(event,view){
 const file=event.target.files?.[0];if(!file)return;
 try{
  toast("Guardando foto…");
  const blob=await compressPhoto(file),m=monthKey(currentDate()),id=`${m}_${view}`;
  await putPhoto(id,blob);
  let rec=photoMonthRecord(currentDate());
  if(!rec){rec={month:m,date:currentDate(),views:[]};state.photoMonths.push(rec)}
  if(!(rec.views||[]).includes(view))rec.views=[...(rec.views||[]),view];
  rec.date=currentDate();saveState(true);openPhotoCheck();renderBadges()
 }catch(e){toast("No pude guardar la foto: "+e.message)}
}
let photoObjectUrls=[];
function clearPhotoUrls(){photoObjectUrls.forEach(u=>URL.revokeObjectURL(u));photoObjectUrls=[]}
async function renderPhotoGallery(){
 const root=document.getElementById("photoGallery");if(!root)return;
 clearPhotoUrls();
 const months=[...(state.photoMonths||[])].sort((a,b)=>b.month.localeCompare(a.month)).slice(0,12);
 if(!months.length){root.innerHTML='<div class="empty">Aún no hay fotos mensuales guardadas.</div>';return}
 let html="";
 for(const rec of months){
  let imgs="";
  for(const [view,label] of [["front","Frontal"],["side","Lateral"],["back","Espalda"]]){
   if(!(rec.views||[]).includes(view))continue;
   try{
    const blob=await getPhoto(`${rec.month}_${view}`);if(!blob)continue;
    const url=URL.createObjectURL(blob);photoObjectUrls.push(url);
    imgs+=`<button type="button" class="photo-thumb" onclick="openPhotoViewer('${rec.month}','${view}')"><img src="${url}" alt="${label} ${rec.month}"><span>${label}</span></button>`
   }catch(e){}
  }
  html+=`<div class="photo-month"><div class="row between"><strong>${esc(rec.month)}</strong><button type="button" class="btn ghost small" onclick="deletePhotoMonth('${rec.month}')">Eliminar</button></div><div class="photo-grid">${imgs||'<div class="empty">Sin archivos disponibles.</div>'}</div></div>`
 }
 root.innerHTML=html
}
async function openPhotoViewer(month,view){
 try{
  const blob=await getPhoto(`${month}_${view}`);if(!blob)return;
  const url=URL.createObjectURL(blob);photoObjectUrls.push(url);
  document.getElementById("modalRoot").innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="row between"><div><div class="eyebrow">${esc(month)}</div><div class="hero-title">${view==="front"?"Frontal":view==="side"?"Lateral":"Espalda"}</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div><img class="photo-full" src="${url}" alt="Foto de progreso"></div></div>`
 }catch(e){}
}
async function deletePhotoMonth(month){
 openAppConfirm("Eliminar fotos",`Se eliminarán las fotos de ${month} guardadas en este dispositivo.`,"Eliminar fotos",async()=>{
  for(const view of ["front","side","back"]){try{await deletePhoto(`${month}_${view}`)}catch(e){}}
  state.photoMonths=(state.photoMonths||[]).filter(p=>p.month!==month);saveState(true);renderProgress();renderBadges()
 })
}

function openDailyCheck(){const x=currentDate(),old=state.daily.find(d=>d.date===x)||{};document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Final del día</div><div class="hero-title">Check-in</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="formgrid"><div class="field"><label>Energía 1–10</label><input id="de" inputmode="numeric" value="${old.energy??""}"></div><div class="field"><label>Fatiga 1–10</label><input id="df" inputmode="numeric" value="${old.fatigue??""}"></div><div class="field"><label>Hambre 1–10</label><input id="dh" inputmode="numeric" value="${old.hunger??""}"></div><div class="field"><label>Molestias 0–10</label><input id="dp" inputmode="numeric" value="${old.pain??0}"></div><div class="field"><label>Sueño (h)</label><input id="ds" inputmode="decimal" value="${old.sleep??""}"></div><div class="field"><label>Cigarrillos (opcional)</label><input id="dc" inputmode="numeric" value="${old.cigs??""}"></div><div class="field wide"><label>Notas</label><textarea id="dn">${esc(old.notes??"")}</textarea></div></div><div class="actions"><button class="btn" onclick="saveDaily()">Cerrar día</button></div></div></div>`}
function saveDaily(){upsert(state.daily,{date:currentDate(),completed:true,energy:num("de"),fatigue:num("df"),hunger:num("dh"),pain:num("dp"),sleep:num("ds"),cigs:num("dc"),notes:val("dn")});saveState();closeModal();renderAll()}

let pendingAppAction=null;
let pendingCancelAction=null;
function openAppConfirm(title,message,confirmLabel,onConfirm,onCancel=null){
 pendingAppAction=onConfirm;pendingCancelAction=onCancel;
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet confirm-sheet">
  <div class="eyebrow">Confirmación</div>
  <div class="hero-title">${esc(title)}</div>
  <div class="subtitle" style="margin-top:8px">${esc(message)}</div>
  <div class="actions" style="margin-top:16px">
   <button type="button" class="btn danger" onclick="runAppConfirm()">${esc(confirmLabel)}</button>
   <button type="button" class="btn secondary" onclick="cancelAppConfirm()">Cancelar</button>
  </div>
 </div></div>`
}
async function runAppConfirm(){
 const fn=pendingAppAction;pendingAppAction=null;pendingCancelAction=null;
 closeModal();
 if(fn)await fn()
}
function cancelAppConfirm(){
 const fn=pendingCancelAction;pendingAppAction=null;pendingCancelAction=null;
 closeModal();
 if(fn)fn()
}

function closeModal(){document.getElementById("modalRoot").innerHTML=""}


function getRecordedSets(e){
 if(Array.isArray(e?.recordedSets))return e.recordedSets;
 if(Array.isArray(e?.sets))return e.sets;
 return []
}
function getEffectiveRecordedSets(e){return getRecordedSets(e).filter(a=>inferredAttemptStatus(e,a)==="effective")}
function allCompletedTraining(){
 const out=[];
 state.sessions.filter(s=>s.completed).forEach(s=>out.push({...s,_kind:"gym",_uid:`gym|${s.date}|${s.key}`,_title:s.title||s.key||"Gimnasio"}));
 state.extraSessions.filter(s=>s.completed).forEach(s=>out.push({...s,_kind:"extra",_uid:`extra|${s.id}`,_title:s.title||"Entreno extra"}));
 state.swim.filter(s=>s.completed).forEach(s=>out.push({...s,_kind:"swim",_uid:`swim|${s.date}`,_title:"Natación"}));
 state.cardio.filter(s=>s.completed).forEach(s=>out.push({...s,_kind:"cardio",_uid:`cardio|${s.date}`,_title:s.cardioName||"Cardio + movilidad"}));
 return out.sort((a,b)=>b.date.localeCompare(a.date))
}
function sameMonth(a,b){return String(a).slice(0,7)===String(b).slice(0,7)}
function inProgressPeriod(date,ref,period){
 if(period==="day")return date===ref;
 if(period==="week")return inWeek(date,ref);
 return sameMonth(date,ref)
}
function sessionsForProgress(ref,period){return allCompletedTraining().filter(s=>inProgressPeriod(s.date,ref,period))}
function setProgressPeriod(period){
 if(!["day","week","month"].includes(period))return;
 state.settings.progressPeriod=period;saveState(true);renderProgress()
}
function progressPeriodLabel(period){return period==="day"?"Día":period==="week"?"Semana":"Mes"}
function strengthSeriesCount(sessions){
 let n=0;
 sessions.forEach(s=>(s.exercises||[]).forEach(e=>{
  if(e.type==="mobility")return;
  n+=getEffectiveRecordedSets(e).filter(z=>+z.reps>0).length
 }));
 return n
}
function avgRPEFor(sessions){
 const a=sessions.filter(s=>s.rpe!=null&&!Number.isNaN(+s.rpe));
 return a.length?a.reduce((sum,s)=>sum+(+s.rpe||0),0)/a.length:null
}
function periodMinutes(sessions){return sessions.reduce((sum,s)=>sum+(+s.duration||0),0)}
function periodKcal(sessions){return sessions.reduce((sum,s)=>sum+(+s.activeKcal||0),0)}
function rirStimulusFactor(rir){
 const r=+rir;
 if(rir===""||rir==null||Number.isNaN(r))return .85;
 if(r<=1)return 1;
 if(r<=2)return .9;
 if(r<=3)return .75;
 if(r<=4)return .6;
 return .45
}
const MUSCLE_AXES=[
 ["Cuádriceps",["cuádr"]],
 ["Glúteos",["glúte","glute"]],
 ["Isquios",["isquio","femoral","cadena posterior"]],
 ["Pectoral",["pectoral"]],
 ["Espalda",["dorsal","espalda"]],
 ["Hombros",["deltoid","hombro"]],
 ["Brazos",["bíceps","biceps","tríceps","triceps"]],
 ["Core",["core","abdominal"]],
 ["Gemelos",["gemelo","sóleo","soleo"]]
];
function muscleGroupsForExercise(e){
 const text=`${e.muscle||""} ${e.group||""}`.toLowerCase();
 return MUSCLE_AXES.filter(([name,patterns])=>patterns.some(p=>text.includes(p))).map(([name])=>name)
}
function muscleStimulus(sessions){
 const out=Object.fromEntries(MUSCLE_AXES.map(([name])=>[name,0]));
 sessions.forEach(s=>(s.exercises||[]).forEach(e=>{
  if(e.type==="mobility")return;
  const groups=muscleGroupsForExercise(e);if(!groups.length)return;
  getEffectiveRecordedSets(e).filter(z=>+z.reps>0).forEach(z=>{
   const f=rirStimulusFactor(z.rir);
   groups.forEach(g=>out[g]+=f)
  })
 }));
 return out
}
function radarSVG(values){
 const labels=MUSCLE_AXES.map(x=>x[0]),raw=labels.map(l=>+values[l]||0);
 if(!raw.some(v=>v>0))return `<div class="empty">Aún no hay series de fuerza registradas en este periodo.</div>`;
 const W=360,H=330,cx=180,cy=160,R=105,levels=4,max=Math.max(6,...raw)*1.12;
 const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/labels.length;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r]};
 let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Distribución del estímulo por grupo muscular">`;
 for(let l=1;l<=levels;l++){const rr=R*l/levels;svg+=`<polygon points="${labels.map((_,i)=>pt(i,rr).join(",")).join(" ")}" fill="none" stroke="#233a55" stroke-width="1"/>`}
 labels.forEach((lab,i)=>{const [x,y]=pt(i,R);svg+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#233a55" stroke-width="1"/>`});
 const polygon=raw.map((v,i)=>pt(i,R*Math.min(1,v/max)).join(",")).join(" ");
 svg+=`<polygon points="${polygon}" fill="rgba(45,212,191,.22)" stroke="#2dd4bf" stroke-width="2.5"/>`;
 raw.forEach((v,i)=>{const [x,y]=pt(i,R*Math.min(1,v/max));svg+=`<circle cx="${x}" cy="${y}" r="3.5" fill="#38bdf8"/>`});
 labels.forEach((lab,i)=>{const [x,y]=pt(i,R+24);const anch=x<cx-8?"end":x>cx+8?"start":"middle";svg+=`<text x="${x}" y="${y}" fill="#cbd5e1" font-size="10" text-anchor="${anch}" dominant-baseline="middle">${lab}</text>`});
 svg+=`</svg>`;return svg
}
function muscleValueList(values){
 return MUSCLE_AXES.map(([name])=>[name,+values[name]||0]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).map(([name,v])=>`<div class="summaryline"><span>${esc(name)}</span><span>${v.toFixed(1)}</span></div>`).join("")
}
function historyHTML(ref,period){
 const all=sessionsForProgress(ref,period),expanded=!!state.settings.historyExpanded,list=all.slice(0,expanded?20:5);
 if(!all.length)return `<div class="empty">No hay entrenamientos terminados en este periodo.</div>`;
 const rows=list.map(s=>{
  const meta=[s.duration?`${s.duration} min`:null,s.rpe!=null?`RPE ${s.rpe}`:null,s.activeKcal?`${s.activeKcal} kcal activas`:null].filter(Boolean).join(" · ");
  return `<div class="history-row"><div class="history-main"><strong>${esc(s._title)}</strong><small>${esc(pretty(s.date))}${meta?` · ${esc(meta)}`:""}</small></div><button type="button" class="btn ghost small" onclick="openHistoryDetail('${esc(s._uid)}')">Ver</button></div>`
 }).join("");
 const more=all.length>5?`<div class="history-expand"><button type="button" class="btn secondary small" onclick="toggleHistoryExpanded()">${expanded?"Mostrar menos":`Mostrar más (${Math.min(all.length,20)-5})`}</button>${all.length>20&&expanded?`<small>Se muestran los 20 más recientes de ${all.length}.</small>`:""}</div>`:"";
 return rows+more
}
function toggleHistoryExpanded(){
 state.settings.historyExpanded=!state.settings.historyExpanded;
 saveState(true);renderProgress()
}
function findHistorySession(uid){
 const [kind,a,b]=uid.split("|");
 if(kind==="gym")return state.sessions.find(s=>s.date===a&&s.key===b);
 if(kind==="extra")return state.extraSessions.find(s=>s.id===a);
 if(kind==="swim")return state.swim.find(s=>s.date===a);
 if(kind==="cardio")return state.cardio.find(s=>s.date===a);
 return null
}
function openHistoryDetail(uid){
 const s=findHistorySession(uid);if(!s)return;
 const kind=uid.split("|")[0],title=kind==="swim"?"Natación":kind==="cardio"?"Cardio + movilidad":s.title||"Entrenamiento";
 let body="";
 if(kind==="gym"||kind==="extra"){
  const exercises=s.exercises||[];
  body=exercises.length?exercises.map(e=>{
   if(e.type==="mobility")return `<div class="history-ex"><strong>${esc(e.name)}</strong><small>Movilidad · ${e.done?"realizada":"sin marcar"}</small></div>`;
   const sets=getRecordedSets(e).filter(z=>z.reps||z.kg||z.rir);
   return `<div class="history-ex"><strong>${esc(e.name)}</strong><small>${sets.length?sets.map((z,i)=>`${inferredAttemptStatus(e,z)==="effective"?"E":inferredAttemptStatus(e,z)==="warmup"?"A":"NE"}${i+1}: ${z.kg||"—"} kg × ${z.reps||"—"} · RIR ${z.rir||"—"}`).join("<br>"):"Sin series registradas"}</small></div>`
  }).join(""):'<div class="empty">Sin ejercicios guardados.</div>'
 }else if(kind==="swim"){
  body=`<div class="summaryline"><span>Metros</span><span>${s.meters??"—"}</span></div><div class="summaryline"><span>Duración</span><span>${s.duration??"—"} min</span></div><div class="summaryline"><span>RPE</span><span>${s.rpe??"—"}</span></div><div class="summaryline"><span>Hombro</span><span>${s.pain??"—"}/10</span></div>`
 }else{
  body=`<div class="summaryline"><span>Tipo</span><span>${esc(s.cardioName||"Cardio")}</span></div><div class="summaryline"><span>Modalidad</span><span>${esc(s.modality||"—")}</span></div><div class="summaryline"><span>Duración</span><span>${s.duration??"—"} min</span></div><div class="summaryline"><span>RPE</span><span>${s.rpe??"—"}</span></div>`
 }
 const meta=[s.duration?`${s.duration} min`:null,s.rpe!=null?`RPE ${s.rpe}`:null,s.activeKcal?`${s.activeKcal} kcal activas (manual)`:null].filter(Boolean).join(" · ");
 document.getElementById("modalRoot").innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="row between"><div><div class="eyebrow">${esc(pretty(s.date))}</div><div class="hero-title">${esc(title)}</div><div class="subtitle">${esc(meta)}</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="history-detail">${body}</div></div></div>`
}


function setBodyPeriod(period){
 if(!["3m","6m","12m","all"].includes(period))return;
 state.settings.bodyPeriod=period;saveState(true);renderProgress()
}
function bodyPeriodLabel(period){return period==="3m"?"3 meses":period==="6m"?"6 meses":period==="12m"?"12 meses":"Todo"}
function bodyDataForPeriod(field,period){
 const rows=state.body.filter(x=>x[field]!=null&&x[field]!=="").sort((a,b)=>a.date.localeCompare(b.date));
 if(period==="all")return rows;
 const months=period==="3m"?3:period==="6m"?6:12,cut=new Date();
 const ref=dateObj(currentDate());cut.setTime(ref.getTime());cut.setMonth(cut.getMonth()-months);
 return rows.filter(x=>dateObj(x.date)>=cut)
}
function latestForField(field){
 const rows=state.body.filter(x=>x[field]!=null&&x[field]!=="").sort((a,b)=>b.date.localeCompare(a.date));return rows[0]?.[field]??"—"
}
function bodyMetricBlock(label,field,unit,period){
 const rows=bodyDataForPeriod(field,period),vals=rows.map(x=>+x[field]),latestVal=vals.length?vals[vals.length-1]:null,delta=vals.length>1?latestVal-vals[0]:null;
 return `<div class="body-metric-card"><div class="row between"><div><div class="k">${esc(label)}</div><div class="body-v">${latestVal==null?"—":latestVal.toFixed(1)} <small>${unit}</small></div></div>${delta==null?"":`<span class="pill">${delta>0?"+":""}${delta.toFixed(1)} ${unit}</span>`}</div><div class="mini-chart">${spark(vals)}</div></div>`
}


function photoSummary(){
 const months=[...(state.photoMonths||[])],photos=months.reduce((n,m)=>n+(m.views||[]).length,0);
 return {months:months.length,photos}
}
function toggleProgressPhotos(){
 state.settings.photosExpanded=!state.settings.photosExpanded;
 saveState(true);renderProgress()
}

function nutritionPeriodSummary(ref,period){
 const dates=[...new Set(state.foods.filter(i=>inProgressPeriod(i.date,ref,period)).map(i=>i.date))].sort(),totals={kcal:0,p:0,c:0,f:0};
 dates.forEach(date=>{const n=dayNutrition(date);["kcal","p","c","f"].forEach(k=>totals[k]+=n[k])});
 const days=dates.length,avg=Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,days?v/days:0]));
 const goals=state.settings.nutritionGoals||{},adherent=dates.filter(date=>{const n=dayNutrition(date),checks=[];if(+goals.kcal)checks.push(n.kcal>=goals.kcal*.9&&n.kcal<=goals.kcal*1.1);if(+goals.p)checks.push(n.p>=goals.p*.9);return checks.length&&checks.every(Boolean)}).length;
 return {dates,days,avg,adherent}
}
function nutritionProgressHTML(ref,period){
 const n=nutritionPeriodSummary(ref,period),hasGoals=Object.values(state.settings.nutritionGoals||{}).some(v=>+v>0);
 if(!n.days)return `<div class="card"><div class="empty">Aún no hay comidas registradas en este periodo.</div><div class="actions"><button type="button" class="btn secondary" onclick="showView('Food')">Registrar comida</button></div></div>`;
 return `<div class="card"><div class="row between settings-status-row"><div><strong>Media de los días registrados</strong><small>${n.days} ${n.days===1?"día con registro":"días con registro"}${hasGoals?` · ${n.adherent} dentro del rango configurado`:""}</small></div><button type="button" class="btn ghost small" onclick="goToNutritionSettings()">Objetivos</button></div>${nutritionDashboardHTML(n.avg)}<div class="nutrition-note">La media usa solo días con al menos un alimento. Un día parcial puede infravalorar la ingesta real.</div></div>`
}
function strengthProgressHTML(ref,period){
 const seen=new Map();
 sessionsForProgress(ref,period).filter(s=>s.exercises).forEach(s=>(s.exercises||[]).forEach(e=>{if(e.type!=="mobility"&&!seen.has(e.key))seen.set(e.key,e)}));
 const rows=[...seen.values()].slice(0,8).map(e=>{const hist=lastCompletedExercises(e.key,addDaysISO(ref,1),2),current=hist[0],previous=hist[1],cur=current?getEffectiveRecordedSets(current).filter(z=>z.reps).slice(0,3):[],prev=previous?getEffectiveRecordedSets(previous).filter(z=>z.reps):[];if(!cur.length)return"";const volume=a=>a.reduce((sum,z)=>sum+(+z.kg||0)*(+z.reps||0),0),delta=prev.length&&volume(prev)>0?(volume(cur)-volume(prev))/volume(prev)*100:null,summary=cur.map(z=>`${z.kg||"—"} kg × ${z.reps}`).join(" · ");return `<div class="progress-insight"><div><strong>${esc(e.name)}</strong><small>${esc(summary)}</small></div><div class="progress-insight-value">${delta==null?"Última sesión":`${delta>=0?"+":""}${delta.toFixed(0)}% volumen`}</div></div>`}).filter(Boolean).join("");
 return rows?`<div class="card"><div class="subtitle">Última exposición por ejercicio y cambio de volumen carga × repeticiones frente a la anterior.</div><div class="progress-insight-list">${rows}</div></div>`:`<div class="card"><div class="empty">Completa al menos una sesión de fuerza para ver tendencias por ejercicio.</div></div>`
}

function renderProgress(){
 const ref=currentDate(),period=state.settings.progressPeriod||"week",sessions=sessionsForProgress(ref,period);
 const mins=periodMinutes(sessions),rpe=avgRPEFor(sessions),kcal=periodKcal(sessions),sets=strengthSeriesCount(sessions),stim=muscleStimulus(sessions);
 const w=state.body.filter(x=>x.weight).sort((a,b)=>a.date.localeCompare(b.date)).slice(-16),wa=state.body.filter(x=>x.waist).sort((a,b)=>a.date.localeCompare(b.date)).slice(-16);
 let html=`<div class="period-tabs" role="group" aria-label="Periodo de análisis">${["day","week","month"].map(p=>`<button type="button" class="${period===p?"active":""}" onclick="setProgressPeriod('${p}')">${progressPeriodLabel(p)}</button>`).join("")}</div>`;

 html+=`<div class="section">Carga de entrenamiento · ${progressPeriodLabel(period).toLowerCase()}</div><div class="grid2">
  <div class="metric"><div class="k">Tiempo</div><div class="v">${(mins/60).toFixed(1)} <small>h</small></div></div>
  <div class="metric"><div class="k">Sesiones</div><div class="v">${sessions.length}</div></div>
  <div class="metric"><div class="k">Series efectivas</div><div class="v">${sets}</div></div>
  <div class="metric"><div class="k">RPE medio</div><div class="v">${rpe==null?"—":rpe.toFixed(1)}</div></div>
 </div>`;
 if(kcal)html+=`<div class="callout" style="margin-top:10px">Kcal activas registradas manualmente: <strong>${Math.round(kcal)}</strong>.</div>`;

 html+=`<div class="section">Alimentación · ${progressPeriodLabel(period).toLowerCase()}</div>${nutritionProgressHTML(ref,period)}`;

 html+=`<div class="section">Progresión de fuerza</div>${strengthProgressHTML(ref,period)}`;

 html+=`<div class="section">Estímulo por grupo muscular</div><div class="card radar-card">
  <div class="subtitle">Índice relativo a partir de series realizadas y RIR. Sirve para comparar distribución del trabajo, no para medir crecimiento muscular.</div>
  <div class="radar-wrap">${radarSVG(stim)}</div>
  <details><summary>Ver valores</summary><div style="margin-top:8px">${muscleValueList(stim)||'<div class="empty">Sin datos.</div>'}</div></details>
 </div>`;

 html+=`<div class="section">Entrenamientos guardados</div><div class="card">
  <div class="subtitle">Aquí aparecen las sesiones realmente terminadas. Pulsa “Ver” para abrir el registro.</div>
  <div class="history-list">${historyHTML(ref,period)}</div>
 </div>`;

 const bodyPeriod=state.settings.bodyPeriod||"6m";
 html+=`<div class="section">Composición corporal</div>
 <div class="body-period-tabs">${["3m","6m","12m","all"].map(p=>`<button type="button" class="${bodyPeriod===p?"active":""}" onclick="setBodyPeriod('${p}')">${bodyPeriodLabel(p)}</button>`).join("")}</div>
 <div class="actions" style="margin-bottom:10px"><button type="button" class="btn secondary" onclick="openMeasurements()">Peso y cintura</button><button type="button" class="btn secondary" onclick="openMonthlyReview()">Perímetros mensuales</button><button type="button" class="btn secondary" onclick="openPhotoCheck()">Fotos mensuales</button></div>
 <div class="body-metric-grid">
  ${bodyMetricBlock("Peso","weight","kg",bodyPeriod)}
  ${bodyMetricBlock("Cintura","waist","cm",bodyPeriod)}
  ${bodyMetricBlock("Pecho","chest","cm",bodyPeriod)}
  ${bodyMetricBlock("Brazo flexionado","arm","cm",bodyPeriod)}
  ${bodyMetricBlock("Cadera/glúteo","hips","cm",bodyPeriod)}
  ${bodyMetricBlock("Muslo","thigh","cm",bodyPeriod)}
  ${bodyMetricBlock("Gemelo","calf","cm",bodyPeriod)}
 </div>
 <div class="section-sub">Fotos de progreso</div><div class="card">
  ${(()=>{const ps=photoSummary(),expanded=!!state.settings.photosExpanded;return `<div class="row between progress-collapse-head"><div><strong>${ps.months?`${ps.months} ${ps.months===1?"mes":"meses"} · ${ps.photos} ${ps.photos===1?"foto":"fotos"}`:"Sin fotos guardadas"}</strong><small>${expanded?"Galería desplegada":"Galería contraída para mantener Progreso compacto."}</small></div>${ps.photos?`<button type="button" class="btn secondary small" onclick="toggleProgressPhotos()">${expanded?"Ocultar fotos":"Mostrar fotos"}</button>`:""}</div>${expanded?'<div id="photoGallery"><div class="empty">Cargando fotos…</div></div>':""}`})()}
 </div>`;

 document.getElementById("viewProgress").innerHTML=html;
 if(state.settings.photosExpanded)setTimeout(renderPhotoGallery,0)
}
function saveSettings(){
 state.settings.mode=val("setMode")||state.settings.mode;state.settings.checkHour=+val("setHour")||20;
 const keep=document.getElementById("setKeepAwake");if(keep)state.settings.keepAwake=!!keep.checked;
 const goals={kcal:num("goalKcal"),p:num("goalP"),c:num("goalC"),f:num("goalF")};
 if(document.getElementById("goalKcal")){
  if(Object.values(goals).some(v=>v!=null&&(!Number.isFinite(v)||v<0))){toast("Los objetivos deben ser números positivos");return}
  state.settings.nutritionGoals=goals
 }
 if(!state.settings.keepAwake)releaseSessionWakeLock();saveState();renderAll()
}
function planSettingsHTML(){
 return `<div class="section" id="planSection">Plan de entrenamiento</div><div class="card"><div class="callout">${state.customPlans?`Plan personalizado activo: ${esc(state.settings.planName||"creado en la app")}.`:"Estás usando el plan base incluido en Training Lab."}</div><div class="plan-action-grid"><button type="button" class="btn" onclick="openPlanManager()">Montar / editar en la app</button><label class="btn secondary">Importar CSV<input type="file" accept=".csv,text/csv" onchange="importPlanCSV(event)"></label><button type="button" class="btn secondary" onclick="downloadPlanTemplate()">Descargar plantilla CSV</button><button type="button" class="btn ghost" onclick="downloadCurrentPlan()">Exportar mi plan</button>${state.customPlans?'<button type="button" class="btn danger" onclick="resetImportedPlan()">Volver al plan base</button>':""}</div><div class="settings-help">Puedes construir la semana aquí o importar la plantilla CSV. Los entrenamientos ya guardados no cambian al editar el plan.</div></div>`
}
function customFoodsSettingsHTML(){
 const rows=(state.customFoods||[]).map(f=>`<div class="custom-food-row"><div><strong>${esc(f.name)}</strong><small>${esc(f.cat)} · valores por ${f.perUnit?"unidad":`100 ${f.unit}`}</small></div><button type="button" class="btn danger small" onclick="removeCustomFood('${f.key}')">Eliminar</button></div>`).join("");
 return `<div class="custom-food-card"><div class="row between settings-status-row"><div><strong>Mis alimentos</strong><small>Crea productos con los valores exactos de su etiqueta.</small></div><button type="button" class="btn secondary small" onclick="openCustomFoodModal('Desayuno')">Crear</button></div>${rows?`<div class="custom-food-list">${rows}</div>`:'<div class="settings-help">Todavía no has creado alimentos propios.</div>'}</div>`
}
function installationSettingsHTML(){
 const installed=appIsStandalone();
 return `<div class="section">Instalación</div><div class="card"><div class="row between settings-status-row"><div><strong>${installed?"Training Lab está instalada":"Añadir Training Lab al móvil"}</strong><small>${installed?"Se está ejecutando como una app independiente.":"Acceso rápido, pantalla completa y mejor soporte de notificaciones según el dispositivo."}</small></div><span class="pill ${installed?"good":""}">${installed?"Instalada":"Opcional"}</span></div>${installed?"":'<div class="install-mini-steps"><span>Compartir</span><b>›</b><span>Añadir a pantalla de inicio</span><b>›</b><span>Añadir</span></div><div class="settings-help">En iPhone usa Safari. En Android u ordenador, busca “Instalar aplicación” o “Añadir a pantalla de inicio” en el menú del navegador.</div>'}</div>`
}
function renderSettings(){
 const g=state.settings.nutritionGoals||{};
 let html=`<div class="section">Preferencias</div><div class="card"><div class="settings-grid"><div class="field"><label>Modo de entrenamiento</label><select id="setMode"><option value="summer" ${state.settings.mode==="summer"?"selected":""}>Solo gym</option><option value="season" ${state.settings.mode==="season"?"selected":""}>Gym + natación</option></select></div><div class="field"><label>Hora del check-in final</label><select id="setHour">${[19,20,21,22,23].map(h=>`<option value="${h}" ${state.settings.checkHour===h?"selected":""}>${h}:00</option>`).join("")}</select></div><label class="notif-row wide"><input id="setKeepAwake" type="checkbox" ${state.settings.keepAwake?"checked":""}><span><strong>Mantener la pantalla activa durante la sesión</strong><small>Si el dispositivo lo permite. Se libera al pausar o finalizar.</small></span></label></div><div class="actions"><button type="button" class="btn" onclick="saveSettings()">Guardar preferencias</button></div></div>`;
 html+=`<div class="section" id="nutritionSettings">Objetivos nutricionales</div><div class="card"><div class="subtitle">Son referencias personales, no una prescripción. Déjalos vacíos si solo quieres registrar sin comparar.</div><div class="settings-grid" style="margin-top:11px"><div class="field"><label>Energía (kcal/día)</label><input id="goalKcal" inputmode="numeric" value="${g.kcal??""}" placeholder="Ej. 2400"></div><div class="field"><label>Proteína (g/día)</label><input id="goalP" inputmode="numeric" value="${g.p??""}" placeholder="Ej. 160"></div><div class="field"><label>Carbohidratos (g/día)</label><input id="goalC" inputmode="numeric" value="${g.c??""}" placeholder="Opcional"></div><div class="field"><label>Grasas (g/día)</label><input id="goalF" inputmode="numeric" value="${g.f??""}" placeholder="Opcional"></div></div><div class="actions"><button type="button" class="btn" onclick="saveSettings()">Guardar objetivos</button></div>${customFoodsSettingsHTML()}</div>`;
 html+=notificationSettingsHTML();
 html+=planSettingsHTML();
 html+=installationSettingsHTML();
 html+=`<div class="section">Datos y copias</div><div class="card"><div class="subtitle">El JSON contiene registros, plan, alimentos propios y ajustes. Las fotos se guardan aparte en el dispositivo y no viajan en esta copia.</div><div class="plan-action-grid"><button type="button" class="btn" onclick="exportJSON()">Exportar copia JSON</button><label class="btn secondary">Restaurar copia JSON<input type="file" accept=".json,application/json" onchange="importBackupJSON(event)"></label><button type="button" class="btn secondary" onclick="exportCSV()">Exportar registros CSV</button></div></div>`;
 document.getElementById("viewSettings").innerHTML=html
}
function goToNutritionSettings(){showView("Settings");setTimeout(()=>document.getElementById("nutritionSettings")?.scrollIntoView({behavior:"smooth",block:"start"}),80)}
function spark(vals){if(vals.length<2)return`<div class="empty">Necesitas al menos 2 mediciones.</div>`;const w=600,h=140,p=18,min=Math.min(...vals),max=Math.max(...vals),span=Math.max(.1,max-min),pts=vals.map((v,i)=>({x:p+i*(w-2*p)/(vals.length-1),y:h-p-(v-min)/span*(h-2*p)}));return`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts.map(q=>`${q.x},${q.y}`).join(" ")}" fill="none" stroke="#2dd4bf" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${pts.map(q=>`<circle cx="${q.x}" cy="${q.y}" r="4" fill="#38bdf8"/>`).join("")}</svg>`}


const DAY_NAMES=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
let planLibraryFamily="Todos";

function goToPlanSettings(){
 showView("Settings");
 setTimeout(()=>document.getElementById("planSection")?.scrollIntoView({behavior:"smooth",block:"start"}),80)
}
function ensureEditablePlans(){
 if(!state.customPlans)state.customPlans=JSON.parse(JSON.stringify(getPlans()));
 if(!state.customPlans[state.settings.mode])state.customPlans[state.settings.mode]={};
 for(let d=0;d<7;d++){
  if(!state.customPlans[state.settings.mode][String(d)])state.customPlans[state.settings.mode][String(d)]=JSON.parse(JSON.stringify(DEFAULT_PLANS[state.settings.mode][String(d)]))
 }
 return state.customPlans[state.settings.mode]
}
function defaultSessionForType(day,type){
 const labels={gym:"Fuerza",cardio:"Cardio",swim:"Natación",rest:"Descanso"};
 return {key:`custom_${type}_${day}`,title:labels[type]||"Sesión",type,subtitle:"",exercises:[]}
}
function openPlanManager(){
 ensureEditablePlans();
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet plan-sheet">
  <div class="row between"><div><div class="eyebrow">Plan semanal</div><div class="hero-title">Montar entrenamientos</div><div class="subtitle">Edita el plan del modo <strong>${state.settings.mode==="summer"?"Solo gym":"Gym + natación"}</strong>. Los entrenamientos ya guardados no se modifican.</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>
  <div id="planManagerDays"></div>
 </div></div>`;
 renderPlanManagerDays()
}
function renderPlanManagerDays(){
 const root=document.getElementById("planManagerDays");if(!root)return;
 const plans=ensureEditablePlans();
 root.innerHTML=Array.from({length:7},(_,d)=>{
  const s=plans[String(d)]||defaultSessionForType(d,"rest"),gym=s.type==="gym";
  return `<div class="plan-day-card">
   <div class="row between"><strong>${DAY_NAMES[d]}</strong><span class="pill">${s.type==="gym"?"Fuerza":s.type==="cardio"?"Cardio":s.type==="swim"?"Natación":"Descanso"}</span></div>
   <div class="formgrid compact-grid">
    <div class="field"><label>Tipo</label><select id="planType_${d}" onchange="changePlanDayType(${d})"><option value="gym" ${s.type==="gym"?"selected":""}>Fuerza</option><option value="cardio" ${s.type==="cardio"?"selected":""}>Cardio</option><option value="swim" ${s.type==="swim"?"selected":""}>Natación</option><option value="rest" ${s.type==="rest"?"selected":""}>Descanso</option></select></div>
    <div class="field"><label>Nombre</label><input id="planTitle_${d}" value="${esc(s.title||"")}" onchange="savePlanDayText(${d})"></div>
    <div class="field wide"><label>Subtítulo / objetivo</label><input id="planSubtitle_${d}" value="${esc(s.subtitle||"")}" placeholder="Ej. Cuádriceps y glúteo" onchange="savePlanDayText(${d})"></div>
   </div>
   ${gym?`<div class="plan-ex-list">${(s.exercises||[]).map((e,i)=>`<div class="plan-ex-row"><div><strong>${i+1}. ${esc(e.name)}</strong><small>${esc(exerciseFamily(e))} · ${e.type==="mobility"?esc(e.dose||"Movilidad"):`${e.sets}×${e.min}–${e.max} · RIR ${esc(e.rir||"")}`}</small></div><div class="plan-ex-actions"><button type="button" class="btn ghost tiny" onclick="movePlanExercise(${d},${i},-1)">↑</button><button type="button" class="btn ghost tiny" onclick="movePlanExercise(${d},${i},1)">↓</button><button type="button" class="btn ghost tiny" onclick="openPlanExerciseEditor(${d},${i})">Editar</button><button type="button" class="btn danger tiny" onclick="removePlanExercise(${d},${i})">×</button></div></div>`).join("")||'<div class="empty">Todavía no hay ejercicios.</div>'}</div><div class="actions"><button type="button" class="btn secondary small" onclick="openPlanExercisePicker(${d})">Añadir ejercicio</button><button type="button" class="btn ghost small" onclick="openPlanCustomExercise(${d})">Personalizado</button></div>`:""}
  </div>`
 }).join("")
}
function changePlanDayType(day){
 const plans=ensureEditablePlans(),old=plans[String(day)],type=val(`planType_${day}`)||"rest";
 if(old.type===type)return;
 const next=defaultSessionForType(day,type);
 plans[String(day)]={...next,title:type==="rest"?"Descanso":type==="cardio"?"Cardio":type==="swim"?"Natación":old.title&&old.type==="gym"?old.title:"Fuerza",subtitle:type==="gym"?(old.subtitle||""):""};
 state.settings.planName="Creado en la app";saveState(true);renderPlanManagerDays();renderAll()
}
function savePlanDayText(day){
 const plans=ensureEditablePlans(),s=plans[String(day)];if(!s)return;
 s.title=val(`planTitle_${day}`)||s.title;
 s.subtitle=val(`planSubtitle_${day}`);
 state.settings.planName="Creado en la app";saveState(true);renderAll()
}
function addExerciseToPlan(day,key){
 const plans=ensureEditablePlans(),s=plans[String(day)],e=libExercise(key);if(!s||s.type!=="gym"||!e)return;
 s.exercises.push(e);state.settings.planName="Creado en la app";saveState(true);openPlanManager()
}
function removePlanExercise(day,index){
 const s=ensureEditablePlans()[String(day)];if(!s)return;
 s.exercises.splice(index,1);state.settings.planName="Creado en la app";saveState(true);renderPlanManagerDays();renderAll()
}
function movePlanExercise(day,index,delta){
 const s=ensureEditablePlans()[String(day)],to=index+delta;if(!s||to<0||to>=s.exercises.length)return;
 [s.exercises[index],s.exercises[to]]=[s.exercises[to],s.exercises[index]];
 state.settings.planName="Creado en la app";saveState(true);renderPlanManagerDays()
}
function openPlanExerciseEditor(day,index){
 const s=ensureEditablePlans()[String(day)],e=s?.exercises?.[index];if(!e)return;
 if(e.type==="mobility"){
  document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">${DAY_NAMES[day]}</div><div class="hero-title">${esc(e.name)}</div></div><button class="btn ghost small" onclick="openPlanManager()">Volver</button></div><div class="field" style="margin-top:12px"><label>Dosis</label><input id="peDose" value="${esc(e.dose||"2 × 30 s")}"></div><div class="actions"><button class="btn" onclick="savePlanExerciseEditor(${day},${index})">Guardar</button></div></div></div>`
 }else{
  document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">${DAY_NAMES[day]}</div><div class="hero-title">${esc(e.name)}</div><div class="subtitle">${esc(exerciseFamily(e))}</div></div><button class="btn ghost small" onclick="openPlanManager()">Volver</button></div><div class="formgrid" style="margin-top:12px"><div class="field"><label>Series</label><input id="peSets" inputmode="numeric" value="${e.sets}"></div><div class="field"><label>Reps mín.</label><input id="peMin" inputmode="numeric" value="${e.min}"></div><div class="field"><label>Reps máx.</label><input id="peMax" inputmode="numeric" value="${e.max}"></div><div class="field"><label>RIR</label><input id="peRir" value="${esc(e.rir||"1–2")}"></div><div class="field wide"><label>Descanso</label><input id="peRest" value="${esc(e.rest||"2 min")}"></div></div><div class="actions"><button class="btn" onclick="savePlanExerciseEditor(${day},${index})">Guardar</button></div></div></div>`
 }
}
function savePlanExerciseEditor(day,index){
 const s=ensureEditablePlans()[String(day)],e=s?.exercises?.[index];if(!e)return;
 if(e.type==="mobility")e.dose=val("peDose")||e.dose;
 else{
  e.sets=Math.max(1,+val("peSets")||e.sets||3);e.min=Math.max(1,+val("peMin")||e.min||8);e.max=Math.max(e.min,+val("peMax")||e.max||12);e.rir=val("peRir")||"1–2";e.rest=val("peRest")||"2 min";
 }
 state.settings.planName="Creado en la app";saveState(true);openPlanManager();renderAll()
}
function openPlanExercisePicker(day){
 planLibraryFamily="Todos";
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">${DAY_NAMES[day]}</div><div class="hero-title">Añadir ejercicio</div><div class="subtitle">Biblioteca organizada por familias.</div></div><button class="btn ghost small" onclick="openPlanManager()">Volver</button></div>
 <div class="field" style="margin-top:10px"><label>Buscar</label><input id="planLibSearch" placeholder="Press, remo, glúteo, polea…" oninput="renderPlanExerciseLibrary(${day})"></div>
 <div id="planFamilyChips" class="family-chips"></div><div id="planExerciseLibrary"></div>
 </div></div>`;
 renderPlanExerciseLibrary(day)
}
function setPlanLibraryFamily(day,family){
 planLibraryFamily=family;renderPlanExerciseLibrary(day)
}
function renderPlanExerciseLibrary(day){
 const q=(val("planLibSearch")||"").toLowerCase();
 const families=["Todos",...EXERCISE_FAMILY_ORDER];
 const chip=document.getElementById("planFamilyChips");
 if(chip)chip.innerHTML=families.map(f=>`<button type="button" class="chip ${planLibraryFamily===f?"active":""}" onclick="setPlanLibraryFamily(${day},'${f.replace(/'/g,"\\'")}')">${esc(f)}</button>`).join("");
 let list=EXERCISE_LIBRARY.filter(e=>(planLibraryFamily==="Todos"||exerciseFamily(e)===planLibraryFamily)&&(!q||(`${e.name} ${e.muscle||""} ${e.group||""}`).toLowerCase().includes(q)));
 const root=document.getElementById("planExerciseLibrary");if(!root)return;
 const grouped={};list.forEach(e=>(grouped[exerciseFamily(e)]??=[]).push(e));
 root.innerHTML=Object.keys(grouped).sort((a,b)=>EXERCISE_FAMILY_ORDER.indexOf(a)-EXERCISE_FAMILY_ORDER.indexOf(b)).map(f=>`<div class="library-family"><div class="section-sub">${esc(f)}</div>${grouped[f].map(e=>`<button type="button" class="libitem" onclick="addExerciseToPlan(${day},'${e.key}')"><strong>${esc(e.name)}</strong><small>${e.type==="mobility"?`${esc(e.dose||"Movilidad")}`:`${esc(e.muscle||"")} · ${e.sets}×${e.min}–${e.max}`}</small></button>`).join("")}</div>`).join("")||'<div class="empty">Sin resultados.</div>'
}
function openPlanCustomExercise(day){
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">${DAY_NAMES[day]}</div><div class="hero-title">Ejercicio personalizado</div></div><button class="btn ghost small" onclick="openPlanManager()">Volver</button></div><div class="formgrid"><div class="field wide"><label>Nombre</label><input id="pcName"></div><div class="field"><label>Tipo</label><select id="pcType"><option value="strength">Fuerza</option><option value="mobility">Movilidad</option></select></div><div class="field"><label>Grupo / músculo</label><input id="pcMuscle"></div><div class="field"><label>Series</label><input id="pcSets" value="3" inputmode="numeric"></div><div class="field"><label>Reps mín.</label><input id="pcMin" value="8" inputmode="numeric"></div><div class="field"><label>Reps máx.</label><input id="pcMax" value="12" inputmode="numeric"></div><div class="field"><label>RIR</label><input id="pcRir" value="1–2"></div><div class="field wide"><label>Descanso / dosis</label><input id="pcRest" value="2 min"></div></div><div class="actions"><button class="btn" onclick="savePlanCustomExercise(${day})">Añadir</button></div></div></div>`
}
function savePlanCustomExercise(day){
 const s=ensureEditablePlans()[String(day)];if(!s||s.type!=="gym")return;
 const type=val("pcType"),name=val("pcName")||"Ejercicio personalizado",key="custom_plan_"+Date.now().toString(36),muscle=val("pcMuscle")||"Otros";
 const e=type==="mobility"?{key,name,type,pattern:"Movilidad",group:"Movilidad",dose:val("pcRest")||"2 × 30 s",note:"",done:false}:{key,name,type,pattern:"Personalizado",group:"Personalizado",sets:+val("pcSets")||3,min:+val("pcMin")||8,max:+val("pcMax")||12,rir:val("pcRir")||"1–2",rest:val("pcRest")||"2 min",muscle,note:"",recordedSets:[]};
 s.exercises.push(e);state.settings.planName="Creado en la app";saveState(true);openPlanManager();renderAll()
}

function cleanPlanCSV(plans,mode){
 const hdr=["dia","sesion","tipo_sesion","subtitulo","orden","tipo_ejercicio","ejercicio","series","reps_min","reps_max","rir","descanso","musculo","nota"],rows=[hdr];
 const typeName={gym:"fuerza",cardio:"cardio",swim:"natacion",rest:"descanso"};
 const exType={strength:"fuerza",mobility:"movilidad"};
 for(let d=1;d<=7;d++){
  const day=d===7?0:d,s=plans[mode]?.[String(day)]||defaultSessionForType(day,"rest");
  if(!(s.exercises||[]).length)rows.push([DAY_NAMES[day],s.title||"",typeName[s.type]||s.type,s.subtitle||"","","","","","","","","","",""]);
  else s.exercises.forEach((e,i)=>rows.push([DAY_NAMES[day],s.title||"",typeName[s.type]||s.type,s.subtitle||"",i+1,exType[e.type]||e.type,e.name,e.sets||"",e.min||"",e.max||"",e.rir||"",e.rest||e.dose||"",e.muscle||"",e.note||""]))
 }
 return rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n")
}
function templateCSVContent(){
 const hdr=["dia","sesion","tipo_sesion","subtitulo","orden","tipo_ejercicio","ejercicio","series","reps_min","reps_max","rir","descanso","musculo","nota"],rows=[hdr];
 ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].forEach(day=>rows.push([day,"","","","","","","","","","","","",""]));
 return rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n")
}
function triggerFileDownload(href,name){
 const a=document.createElement("a");
 a.href=href;a.download=name;a.rel="noopener";a.style.display="none";
 document.body.appendChild(a);a.click();
 setTimeout(()=>a.remove(),250)
}
function downloadPlanTemplate(){
 if(/^https?:$/.test(location.protocol)){
  triggerFileDownload("./plantilla_plan.csv","plantilla_training_lab.csv");
  toast("Descargando plantilla CSV");
  return
 }
 download("plantilla_training_lab.csv",templateCSVContent(),"text/csv;charset=utf-8")
}
function downloadCurrentPlan(){download("mi_plan_training_lab.csv",cleanPlanCSV(getPlans(),state.settings.mode),"text/csv;charset=utf-8")}

function normalizedHeader(x){return String(x||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"_")}
function parseDayValue(v){
 const t=normalizedHeader(v),map={domingo:0,sunday:0,lunes:1,monday:1,martes:2,tuesday:2,miercoles:3,wednesday:3,jueves:4,thursday:4,viernes:5,friday:5,sabado:6,saturday:6};
 if(t in map)return map[t];
 const n=+t;return Number.isInteger(n)&&n>=0&&n<=6?n:null
}
function parseSessionType(v){
 const t=normalizedHeader(v);
 return ({fuerza:"gym",gym:"gym",cardio:"cardio",natacion:"swim",swim:"swim",descanso:"rest",rest:"rest"})[t]||t||"rest"
}
function parseExerciseType(v){
 const t=normalizedHeader(v);return ({fuerza:"strength",strength:"strength",movilidad:"mobility",mobility:"mobility"})[t]||"strength"
}
function libraryMatchByName(name){
 const n=normalizedHeader(name);
 return EXERCISE_LIBRARY.find(e=>normalizedHeader(e.name)===n)||null
}

function parseCSV(text){
 const rows=[];let row=[],field="",q=false;
 for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(q){if(c==='"'&&n==='"'){field+='"';i++}else if(c==='"')q=false;else field+=c}else{if(c==='"')q=true;else if(c===','){row.push(field);field=""}else if(c==='\n'){row.push(field);rows.push(row);row=[];field=""}else if(c!=='\r')field+=c}}
 if(field.length||row.length){row.push(field);rows.push(row)}return rows
}
function importPlanCSV(ev){
 const file=ev.target.files[0];if(!file)return;const reader=new FileReader();
 reader.onload=()=>{
  try{
   const rows=parseCSV(reader.result);if(rows.length<2)throw new Error("El CSV está vacío.");
   const original=rows.shift(),hdr=original.map(normalizedHeader),legacy=hdr.includes("mode");
   if(legacy){
    const req=["mode","weekday","session_key","session_title","session_type","exercise_order","exercise_name"];
    if(!req.every(k=>hdr.includes(k)))throw new Error("Esquema antiguo no válido.");
    const plans={summer:{},season:{}};
    rows.filter(r=>r.some(x=>x.trim()!=="")).forEach(r=>{
     const o=Object.fromEntries(hdr.map((h,i)=>[h,(r[i]??"").trim()])),mode=o.mode,day=String(+o.weekday);
     if(!plans[mode])plans[mode]={};
     if(!plans[mode][day])plans[mode][day]={key:o.session_key||`csv_${mode}_${day}`,title:o.session_title||"Sesión",type:o.session_type||"rest",subtitle:o.session_subtitle||"",exercises:[]};
     if(o.exercise_name){
      const found=libraryMatchByName(o.exercise_name),type=o.exercise_type||found?.type||"strength";
      plans[mode][day].exercises.push(type==="mobility"?{...(found||{}),type:"mobility",key:o.exercise_key||found?.key||("csv_"+normalizedHeader(o.exercise_name)),name:o.exercise_name,dose:o.rest||found?.dose||"2 × 30 s",note:o.note||found?.note||"",done:false}:{...(found||{}),type:"strength",key:o.exercise_key||found?.key||("csv_"+normalizedHeader(o.exercise_name)),name:o.exercise_name,sets:+o.sets||found?.sets||3,min:+o.reps_min||found?.min||8,max:+o.reps_max||found?.max||12,rir:o.rir||found?.rir||"1–2",rest:o.rest||found?.rest||"2 min",muscle:o.muscle||found?.muscle||"",note:o.note||found?.note||"",recordedSets:[]})
     }
    });
    ["summer","season"].forEach(mode=>{for(let d=0;d<7;d++)if(!plans[mode][String(d)])plans[mode][String(d)]=JSON.parse(JSON.stringify(DEFAULT_PLANS[mode][String(d)]))});
    state.customPlans=plans
   }else{
    const aliases={
     dia:["dia","weekday"],sesion:["sesion","session_title"],tipo_sesion:["tipo_sesion","session_type"],subtitulo:["subtitulo","session_subtitle"],
     orden:["orden","exercise_order"],tipo_ejercicio:["tipo_ejercicio","exercise_type"],ejercicio:["ejercicio","exercise_name"],
     series:["series","sets"],reps_min:["reps_min"],reps_max:["reps_max"],rir:["rir"],descanso:["descanso","rest"],musculo:["musculo","muscle"],nota:["nota","note"]
    };
    const col=(name)=>{for(const a of aliases[name]){const i=hdr.indexOf(a);if(i>=0)return i}return-1};
    if(col("dia")<0||col("tipo_sesion")<0)throw new Error("Faltan las columnas dia o tipo_sesion.");
    const mode=state.settings.mode,all=JSON.parse(JSON.stringify(getPlans()));
    all[mode]={};for(let d=0;d<7;d++)all[mode][String(d)]=defaultSessionForType(d,"rest");
    rows.filter(r=>r.some(x=>String(x).trim()!=="")).forEach(r=>{
     const get=(name)=>{const i=col(name);return i>=0?String(r[i]??"").trim():""},day=parseDayValue(get("dia"));if(day==null)throw new Error(`Día no reconocido: ${get("dia")}`);
     const type=parseSessionType(get("tipo_sesion")),key=String(day),title=get("sesion")||({gym:"Fuerza",cardio:"Cardio",swim:"Natación",rest:"Descanso"}[type]||"Sesión");
     if(!all[mode][key]||all[mode][key].type!==type||all[mode][key]._fromTemplate!==true)all[mode][key]={key:`csv_${type}_${day}`,title,type,subtitle:get("subtitulo"),exercises:[],_fromTemplate:true};
     const name=get("ejercicio");if(name&&type==="gym"){
      const found=libraryMatchByName(name),et=parseExerciseType(get("tipo_ejercicio"));
      const e=et==="mobility"?{...(found||{}),key:found?.key||("csv_"+normalizedHeader(name)),name,type:"mobility",pattern:"Movilidad",group:found?.group||"Movilidad",dose:get("descanso")||found?.dose||"2 × 30 s",note:get("nota")||found?.note||"",done:false}:{...(found||{}),key:found?.key||("csv_"+normalizedHeader(name)),name,type:"strength",pattern:found?.pattern||"Personalizado",group:found?.group||"Personalizado",sets:+get("series")||found?.sets||3,min:+get("reps_min")||found?.min||8,max:+get("reps_max")||found?.max||12,rir:get("rir")||found?.rir||"1–2",rest:get("descanso")||found?.rest||"2 min",muscle:get("musculo")||found?.muscle||"",note:get("nota")||found?.note||"",recordedSets:[]};
      all[mode][key].exercises.push(e)
     }
    });
    Object.values(all[mode]).forEach(s=>delete s._fromTemplate);
    state.customPlans=all
   }
   state.settings.planName=file.name;
   state.sessions=state.sessions.filter(s=>s.completed||s.date<todayISO());
   saveState();renderAll();toast("Plan importado")
  }catch(e){toast("No pude importar el plan: "+e.message)}
 };
 reader.readAsText(file)
}
function resetImportedPlan(){
 openAppConfirm("Volver al plan base","El plan importado dejará de estar activo. Tus entrenamientos guardados no se borrarán.","Volver al plan base",()=>{
  state.customPlans=null;state.settings.planName="";saveState();renderAll()
 },()=>renderSettings())
}
function exportJSON(){
 const payload={app:"Training Lab",backupVersion:1,exportedAt:new Date().toISOString(),state};
 download("Training_Lab_backup_"+todayISO()+".json",JSON.stringify(payload,null,2),"application/json")
}
function validateBackupState(raw){
 if(!raw||typeof raw!=="object")throw new Error("El archivo no contiene un estado válido.");
 const candidate=raw.state&&typeof raw.state==="object"?raw.state:raw;
 const requiredArrays=["sessions","extraSessions","swim","cardio","body","daily","foods"];
 const present=requiredArrays.filter(k=>Array.isArray(candidate[k])).length;
 if(present<4)throw new Error("No parece una copia de Training Lab.");
 return normalizeState(candidate)
}
function importBackupJSON(event){
 const file=event.target.files?.[0];event.target.value="";if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const restored=validateBackupState(JSON.parse(reader.result));
   const counts=`${restored.sessions.length+restored.extraSessions.length} sesiones de fuerza, ${restored.foods.length} alimentos y ${restored.body.length} mediciones corporales`;
   openAppConfirm(
    "Restaurar copia",
    `Se sustituirán los datos actuales por esta copia (${counts}). Las fotos locales no se modifican.`,
    "Restaurar",
    ()=>{
     state=restored;
     state.restTimer=null;state.cardioRuntime=null;
     saveState(true);
     document.getElementById("selectedDate").value=todayISO();
     activeView="Home";renderAll();showView("Home");toast("Copia restaurada")
    },
    ()=>renderSettings()
   )
  }catch(e){toast("Copia no válida: "+e.message)}
 };
 reader.onerror=()=>toast("No se pudo leer el archivo.");
 reader.readAsText(file)
}
function exportCSV(){const rows=[["tipo","fecha","a","b","c","d"]];state.body.forEach(x=>rows.push(["medicion",x.date,`peso=${x.weight??""};cintura=${x.waist??""}`,`pecho=${x.chest??""};brazo=${x.arm??""}`,`cadera=${x.hips??""};muslo=${x.thigh??""}`,`gemelo=${x.calf??""}`]));state.daily.forEach(x=>rows.push(["checkin",x.date,x.energy??"",x.fatigue??"",x.hunger??"",x.sleep??""]));state.foods.forEach(x=>{const db=foodRecord(x.foodKey)||{};rows.push(["comida",x.date,x.meal,db.name||x.foodKey,x.amount,db.unit||""])});[...state.sessions,...state.extraSessions].forEach(s=>s.exercises?.forEach(e=>(e.recordedSets||[]).forEach((z,i)=>rows.push(["gym",s.date,e.name,`S${i+1}`,`${z.kg||""}kg x ${z.reps||""}`,`RIR ${z.rir||""}`]))));download("Training_Lab_registros_"+todayISO()+".csv",rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n"),"text/csv")}
function download(name,content,type){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=name;a.rel="noopener";a.style.display="none";
 document.body.appendChild(a);a.click();
 setTimeout(()=>{a.remove();URL.revokeObjectURL(url)},4000)
}

document.getElementById("selectedDate").value=todayISO();
installBottomNavInsetObserver();
installRuntimeRecovery();
setTimeout(checkDueNotifications,800);
renderAll();
setTimeout(showInstallHint,450);
syncRuntimeTimers();
if(state.restTimer||state.cardioRuntime)startRuntimeTicker();
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register("sw.js").catch(()=>{});
