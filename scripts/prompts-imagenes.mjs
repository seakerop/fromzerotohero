// Prompts para generar las ilustraciones de ejercicios (maniquí) con la API
// de Gemini, usando las imágenes de arte/referencia como referencia de estilo.
// Cada descripción lleva la técnica correcta a propósito: el maniquí nunca
// debe enseñar un error (contrastar con src/data/fichas-ejercicios.js).
// `plantilla: true` = el ejercicio aparece en alguna plantilla de rutina y
// se genera primero (por si el free tier corta el lote a mitad).

export const ESTILO = `Using the attached images as EXACT style reference: the same faceless articulated wooden-mannequin figure with warm grey matte segments and thin dark outlines, the same plain very dark navy background (#0c0e13), the equipment and a thin ground line accented in antique gold (#d9a441), the same clean flat illustration style with soft shading and generous empty margins.

Generate the SAME mannequin performing {DESC}

Change only the pose and the equipment. Single figure, full body visible, correct exercise technique, square 1:1 image, no text, no logos, no watermark, no extra background objects.`

export const PROMPTS = [
  // ── Pecho ──────────────────────────────────────────────────────────
  { id: 'press-banca', nombre: 'Press banca', plantilla: true, desc: 'a barbell bench press: lying flat on a bench, feet planted on the floor, gripping the barbell slightly wider than the shoulders, lowering it to mid-chest with the forearms vertical, side view' },
  { id: 'press-inclinado-mancuernas', nombre: 'Press inclinado mancuernas', plantilla: true, desc: 'an incline dumbbell press: sitting back on a bench inclined about 30 degrees, feet on the floor, pressing one dumbbell in each hand up above the upper chest, side view' },
  { id: 'aperturas-polea', nombre: 'Aperturas en polea', plantilla: true, desc: 'a standing cable fly: standing centered between two cable pulley columns, slight forward lean, arms slightly bent sweeping the two handles together in front of the chest, three-quarter front view' },
  { id: 'fondos', nombre: 'Fondos', plantilla: true, desc: 'parallel-bar dips: body supported on two parallel bars, slight forward torso lean, elbows bending to about 90 degrees, knees bent behind the body, controlled descent, side view' },
  { id: 'flexiones', nombre: 'Flexiones', plantilla: true, desc: 'a push-up on the floor: body in one rigid straight line from head to heels, hands under the shoulders, elbows about 45 degrees from the torso, chest lowered close to the floor, side view' },
  { id: 'press-pecho-maquina', nombre: 'Press de pecho en máquina', plantilla: true, desc: 'a seated chest press machine: sitting with the back fully against the pad, pushing two horizontal handles forward at chest height until the arms are extended, feet on the floor, side view' },
  { id: 'contractor', nombre: 'Contractor (peck deck)', plantilla: true, desc: 'a pec deck chest fly machine: seated with the back against the pad, forearms on the vertical pads, bringing the arms together in front of the chest, three-quarter front view' },
  { id: 'flexiones-inclinadas', nombre: 'Flexiones inclinadas', plantilla: true, desc: 'an incline push-up: hands on the edge of a sturdy elevated bench, body in one straight diagonal line from head to heels, chest lowering toward the edge, side view' },

  // ── Espalda ────────────────────────────────────────────────────────
  { id: 'dominadas', nombre: 'Dominadas', plantilla: true, desc: 'a pull-up: hanging from a high straight bar with an overhand grip slightly wider than the shoulders, chin rising toward the bar, chest up, body straight without swinging, side view' },
  { id: 'jalon-al-pecho', nombre: 'Jalón al pecho', plantilla: true, desc: 'a lat pulldown machine: seated with the thighs under the pads, pulling a wide bar down to the upper chest, torso leaned slightly back, chest up, side view' },
  { id: 'remo-con-barra', nombre: 'Remo con barra', plantilla: true, desc: 'a bent-over barbell row: standing with the torso hinged forward about 45 degrees, back completely FLAT, knees slightly bent, pulling the barbell to the lower ribs, side view' },
  { id: 'remo-con-mancuerna', nombre: 'Remo con mancuerna', plantilla: true, desc: 'a one-arm dumbbell row: one knee and one hand supported on a flat bench, back FLAT and parallel to the floor, rowing a dumbbell up to the hip with the other arm, side view' },
  { id: 'remo-polea-baja', nombre: 'Remo en polea baja', plantilla: true, desc: 'a seated cable row at a low pulley: sitting with the knees slightly bent, torso upright, pulling the handle to the abdomen with the shoulders drawn back and chest up, side view' },
  { id: 'jalon-estrecho', nombre: 'Jalón agarre estrecho', plantilla: true, desc: 'a close-grip lat pulldown: seated at a pulldown machine pulling a narrow V-handle down to the upper chest, elbows close to the torso, slight lean back, chest up, side view' },
  { id: 'hiperextensiones', nombre: 'Hiperextensiones', plantilla: true, desc: 'a back extension on a 45-degree roman chair: hips on the pad, ankles anchored, arms crossed over the chest, raising the torso until it forms one straight line with the legs (no over-arching), neutral neck, side view' },
  { id: 'remo-invertido', nombre: 'Remo invertido', plantilla: true, desc: 'an inverted row under a low horizontal bar: body straight like a plank facing up, heels on the floor, pulling the chest up to the bar, side view' },
  { id: 'superman', nombre: 'Superman (lumbar)', plantilla: true, desc: 'a superman hold on the floor: lying face down, arms extended forward, lifting the arms, chest and legs slightly off the floor, neck neutral looking down, side view' },
  { id: 'peso-muerto', nombre: 'Peso muerto', plantilla: false, desc: 'a conventional barbell deadlift: standing over the bar mid-lift at knee height, hips hinged, back completely FLAT and neutral, arms straight, the bar close to the legs, chest up, side view' },

  // ── Hombro ─────────────────────────────────────────────────────────
  { id: 'press-hombro-mancuernas', nombre: 'Press hombro mancuernas', plantilla: true, desc: 'a seated dumbbell shoulder press: sitting on an upright bench, one dumbbell in each hand at shoulder height, pressing them overhead with vertical forearms, front view' },
  { id: 'elevaciones-laterales', nombre: 'Elevaciones laterales', plantilla: true, desc: 'standing dumbbell lateral raises: one dumbbell in each hand, arms raised out to the sides up to shoulder height with slightly bent elbows, shoulders kept down (no shrugging), front view' },
  { id: 'face-pull', nombre: 'Face pull', plantilla: true, desc: 'a face pull at a high cable pulley: standing, pulling a rope attachment toward the face with the elbows high and wide, shoulder blades squeezed together, side view' },
  { id: 'press-hombro-maquina', nombre: 'Press de hombro en máquina', plantilla: true, desc: 'a seated shoulder press machine: sitting with the back against the pad, pressing two handles overhead until the arms are extended, front view' },
  { id: 'pike-flexiones', nombre: 'Flexiones pike', plantilla: true, desc: 'a pike push-up: body in an inverted V with the hips high, hands and feet on the floor, elbows bending to lower the top of the head toward the floor between the hands, side view' },
  { id: 'press-militar', nombre: 'Press militar', plantilla: false, desc: 'a standing overhead barbell press: pressing a barbell from shoulder height to straight overhead, core braced, glutes tight, knees straight but not locked, side view' },
  { id: 'pajaros', nombre: 'Pájaros', plantilla: false, desc: 'a bent-over rear-delt fly: torso hinged forward with a FLAT back, one dumbbell in each hand, arms raised out to the sides with slightly bent elbows, three-quarter side view' },
  { id: 'encogimientos', nombre: 'Encogimientos de trapecio', plantilla: false, desc: 'standing dumbbell shrugs: one dumbbell in each hand at the sides with straight arms, shoulders shrugging straight up toward the ears, front view' },

  // ── Bíceps ─────────────────────────────────────────────────────────
  { id: 'curl-barra', nombre: 'Curl con barra', plantilla: true, desc: 'a standing barbell curl: elbows pinned to the sides, curling the barbell from the thighs up to shoulder height, torso completely still without swinging, side view' },
  { id: 'curl-mancuernas', nombre: 'Curl con mancuernas', plantilla: true, desc: 'standing dumbbell curls: one dumbbell in each hand, elbows pinned to the sides, curling with the palms facing up, torso still, side view' },
  { id: 'curl-martillo', nombre: 'Curl martillo', plantilla: true, desc: 'standing hammer curls: one dumbbell in each hand held with a NEUTRAL grip (palms facing each other), elbows pinned to the sides, curling up, side view' },

  // ── Tríceps ────────────────────────────────────────────────────────
  { id: 'press-frances', nombre: 'Press francés', plantilla: true, desc: 'a lying triceps extension (skullcrusher): lying on a flat bench, upper arms vertical and still, elbows bending to lower a barbell toward the forehead, side view' },
  { id: 'extension-triceps-polea', nombre: 'Extensión de tríceps en polea', plantilla: true, desc: 'a triceps pushdown at a high cable pulley: standing with a slight forward lean, elbows pinned to the sides, pushing the bar down until the arms are fully extended, side view' },
  { id: 'fondos-silla', nombre: 'Fondos en silla o banco', plantilla: true, desc: 'bench dips: hands on the edge of a bench behind the body, legs extended forward with the heels on the floor, shoulders kept down away from the ears, elbows bending to about 90 degrees lowering the hips close to the bench, side view' },
  { id: 'press-cerrado', nombre: 'Press cerrado', plantilla: false, desc: 'a close-grip bench press: lying on a flat bench, hands shoulder-width apart on the barbell, elbows tucked close to the body, lowering the bar to the lower chest, side view' },

  // ── Pierna ─────────────────────────────────────────────────────────
  { id: 'sentadilla', nombre: 'Sentadilla', plantilla: true, desc: 'a barbell back squat: barbell resting on the upper back, feet shoulder-width apart, squatting down until the thighs are parallel with the floor, chest up, back neutral, knees tracking over the toes, heels down, side view' },
  { id: 'prensa', nombre: 'Prensa', plantilla: true, desc: 'a 45-degree leg press machine: seated in the machine with the back and hips pressed into the pad, feet shoulder-width on the platform, knees bending toward the chest, hands on the side handles, side view' },
  { id: 'zancadas', nombre: 'Zancadas', plantilla: true, desc: 'a dumbbell lunge: split stance holding one dumbbell in each hand at the sides, front knee bent 90 degrees above the ankle, back knee lowered close to the floor, torso upright, side view' },
  { id: 'extension-cuadriceps', nombre: 'Extensión de cuádriceps', plantilla: true, desc: 'a leg extension machine: seated with the pad on the shins, extending the knees to raise the legs until straight, hands holding the side handles, back against the pad, side view' },
  { id: 'curl-femoral', nombre: 'Curl femoral', plantilla: true, desc: 'a lying leg curl machine: lying face down on the machine, pad behind the ankles, curling the heels toward the glutes, hips pressed down into the bench, side view' },
  { id: 'peso-muerto-rumano', nombre: 'Peso muerto rumano', plantilla: true, desc: 'a Romanian deadlift: standing holding a barbell with straight arms in front of the thighs, hips pushed far back, knees only slightly bent, back completely FLAT, torso hinged forward, the bar sliding close to the legs, side view' },
  { id: 'gemelos', nombre: 'Gemelos', plantilla: true, desc: 'a standing calf raise: balls of the feet on a low platform edge, heels raised as high as possible, legs straight, hands resting on a support in front, side view' },
  { id: 'zancadas-bulgaras', nombre: 'Zancadas búlgaras', plantilla: true, desc: 'a Bulgarian split squat: rear foot resting on a bench behind the body, front leg bending into a deep lunge, torso leaning slightly forward, one dumbbell in each hand, side view' },
  { id: 'sentadilla-goblet', nombre: 'Sentadilla goblet', plantilla: true, desc: 'a goblet squat: holding one dumbbell vertically against the chest with both hands, feet shoulder-width apart, squatting to parallel with an upright torso, elbows inside the knees, heels down, side view' },
  { id: 'sentadilla-aire', nombre: 'Sentadilla sin peso', plantilla: true, desc: 'a bodyweight air squat with no equipment: arms extended straight forward for balance, feet shoulder-width apart, squatting until the thighs are parallel with the floor, chest up, heels down, side view' },
  { id: 'zancadas-sin-peso', nombre: 'Zancadas sin peso', plantilla: true, desc: 'a bodyweight lunge with no equipment: hands on the hips, split stance, both knees bent to 90 degrees, back knee close to the floor, torso upright, side view' },
  { id: 'zancada-inversa', nombre: 'Zancada inversa', plantilla: false, desc: 'a reverse lunge: stepping one leg back into a lunge, front shin vertical, back knee lowered close to the floor, torso upright, one dumbbell in each hand, side view' },
  { id: 'aductores-maquina', nombre: 'Aductores en máquina', plantilla: false, desc: 'a seated hip adduction machine: sitting with the pads against the inner knees, squeezing the legs together, back against the pad, three-quarter front view' },

  // ── Glúteo ─────────────────────────────────────────────────────────
  { id: 'hip-thrust', nombre: 'Hip thrust', plantilla: true, desc: 'a barbell hip thrust: upper back resting on a flat bench, feet planted on the floor, a padded barbell across the hips, hips extended up until shoulders and knees form one straight line, chin tucked, side view' },
  { id: 'puente-gluteo', nombre: 'Puente de glúteo', plantilla: true, desc: 'a glute bridge on the floor: lying on the back with the knees bent and feet flat, hips lifted until shoulders, hips and knees form one straight line, arms on the floor, side view' },
  { id: 'patada-de-gluteo', nombre: 'Patada de glúteo', plantilla: false, desc: 'a cable glute kickback: standing facing a low pulley holding the frame, an ankle strap on one leg, kicking that leg back and up with the knee slightly bent, glute squeezed, torso leaning slightly forward with the lower back neutral (not arched), side view' },
  { id: 'abductores-maquina', nombre: 'Abductores en máquina', plantilla: false, desc: 'a seated hip abduction machine: sitting with the pads against the outer knees, pushing the legs apart, back against the pad, three-quarter front view' },

  // ── Core ───────────────────────────────────────────────────────────
  { id: 'plancha', nombre: 'Plancha', plantilla: true, desc: 'a forearm plank: face down supported on the forearms and toes, body in one perfectly straight line from head to heels, hips level (not sagging, not piked), side view' },
  { id: 'crunch-en-polea', nombre: 'Crunch en polea', plantilla: true, desc: 'a kneeling cable crunch: kneeling below a high pulley holding a rope on both sides of the head, curling the torso down by rounding the upper spine, hips still, side view' },
  { id: 'elevaciones-de-piernas', nombre: 'Elevaciones de piernas', plantilla: true, desc: 'lying leg raises: lying flat on the back with the hands at the sides, legs straight raised up toward vertical, lower back pressed into the floor, side view' },
  { id: 'abdominales', nombre: 'Abdominales (crunch)', plantilla: true, desc: 'a crunch on the floor: lying on the back with the knees bent and feet flat, fingertips at the temples, lifting only the shoulder blades off the floor, lower back staying on the floor, side view' },
  { id: 'escaladores', nombre: 'Escaladores', plantilla: true, desc: 'mountain climbers: high plank position on the hands, one knee driven forward toward the chest, hips level with the shoulders, side view' },
  { id: 'rueda-abdominal', nombre: 'Rueda abdominal', plantilla: false, desc: 'an ab wheel rollout: kneeling on the floor, rolling an ab wheel forward with straight arms, body extended in a controlled straight line, core braced, hips not sagging, side view' },

  // ── Cardio ─────────────────────────────────────────────────────────
  { id: 'burpees', nombre: 'Burpees', plantilla: true, desc: 'a burpee at the jump phase: leaping vertically off the floor with the arms extended overhead and the body fully extended, side view' },
  { id: 'cinta', nombre: 'Cinta', plantilla: false, desc: 'running on a treadmill machine: mid running stride on the belt, natural arm swing, side view' },
  { id: 'eliptica', nombre: 'Elíptica', plantilla: false, desc: 'exercising on an elliptical machine: hands on the moving handles, feet on the pedals mid stride, upright posture, side view' },
  { id: 'bici-estatica', nombre: 'Bici estática', plantilla: false, desc: 'riding a stationary exercise bike: seated on a saddle set high at hip level, hands on the handlebars, mid pedal stroke with the lower leg almost fully extended and the knee slightly bent, upright relaxed posture, side view' },
  { id: 'remo-maquina', nombre: 'Remo máquina', plantilla: false, desc: 'a rowing machine ergometer: seated mid drive with the legs almost extended, pulling the handle to the lower chest, back FLAT, side view' },
  { id: 'cuerda', nombre: 'Saltar a la cuerda', plantilla: false, desc: 'jumping rope: mid-jump just above the floor with the rope passing under the feet, elbows close to the body, upright posture, side view' },
  { id: 'escaleras', nombre: 'Escaleras (stairmaster)', plantilla: false, desc: 'climbing on a stair climber machine: hands resting lightly on the rails, one foot stepping up onto the next step, upright posture, side view' },
]
