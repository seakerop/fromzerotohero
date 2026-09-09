// Fichas de técnica en inglés, tanda A: pecho, espalda, hombro, bíceps, tríceps y antebrazo.

export const FICHAS_EN_A = {
  // --- Chest ---
  'press-banca': {
    musculos: 'Chest, triceps, and front delts',
    claves: [
      'Shoulder blades pinned together, feet planted firm',
      'Lower the bar under control until it grazes your chest',
      'Wrists stacked straight over your elbows',
    ],
    error: 'Bouncing the bar off your chest or lifting your butt off the bench.',
  },
  'press-inclinado-mancuernas': {
    musculos: 'Upper chest, front delts, and triceps',
    claves: [
      'Bench at 30-45°: any steeper and it becomes a shoulder press',
      'Lower until you feel the stretch in your chest, without forcing it',
      'Press up in an arc, bringing the dumbbells slightly together at the top',
    ],
    error: 'Turning it into a shoulder press by setting the bench too steep.',
  },
  'aperturas-polea': {
    musculos: 'Chest (isolation)',
    claves: [
      'Elbows slightly bent and LOCKED in that angle the whole way',
      'Open until your chest stretches, close like you are hugging a tree',
    ],
    error: 'Loading so much weight it turns into a bent-elbow press.',
  },
  fondos: {
    musculos: 'Lower chest, triceps, and shoulders',
    claves: [
      'Lean forward to load the chest',
      'Lower until your shoulder is level with your elbow, no further',
    ],
    error: 'Going too deep with rounded shoulders: that is where the shoulder pays.',
  },
  flexiones: {
    musculos: 'Chest, triceps, and core',
    claves: [
      'Body in a plank: glutes tight, no arching the lower back',
      'Elbows at ~45° from your body, not tucked in, not flared out',
      'Chest a fist away from the floor on every rep',
    ],
    error: 'Cutting the range short and letting your hips sag.',
  },
  'press-pecho-maquina': {
    musculos: 'Chest, triceps, and front delts',
    claves: [
      'Adjust the seat: handles at chest height',
      'Back against the pad; press without snapping your elbows into lockout',
    ],
    error: 'Seat set wrong: pressing at neck height works poorly and bothers the shoulder.',
  },
  contractor: {
    musculos: 'Chest (isolation)',
    claves: [
      'Elbows slightly bent, squeeze with your chest, not your hands',
      'Hold the squeeze for a second and open under control',
    ],
    error: 'Opening past what your shoulder comfortably allows chasing a "stretch".',
  },

  // --- Back ---
  dominadas: {
    musculos: 'Lats, biceps, and traps',
    claves: [
      'Hang active: shoulders away from your ears',
      'Chest toward the bar, not chin straining up',
      'Lower all the way down, under control',
      'Variants: underhand grip (chin-up, more biceps and a bit easier) or neutral',
    ],
    error: 'Half reps with swinging (accidental kipping).',
  },
  'jalon-al-pecho': {
    musculos: 'Lats and biceps',
    claves: [
      'Drive your ELBOWS toward your back pocket',
      'Torso near vertical, chest tall; the bar comes down to your collarbone',
    ],
    error: 'Leaning way back and turning it into a momentum row.',
  },
  'remo-con-barra': {
    musculos: 'Lats, rhomboids, traps, and lower back (isometric)',
    claves: [
      'Hip hinge, spine neutral and braced',
      'Pull the bar to your belly button, elbows close',
      'Pendlay variant: bar rests on the floor between reps, torso at 90°',
    ],
    error: 'Rounding the lower back or heaving with your whole body.',
  },
  'remo-con-mancuerna': {
    musculos: 'Lats and rhomboids (unilateral)',
    claves: [
      'Hand and knee on the bench, back flat as a table',
      'Pull your elbow toward your hip, not toward your shoulder',
    ],
    error: 'Twisting your torso to move more weight.',
  },
  'remo-polea-baja': {
    musculos: 'Mid-back, lats, and biceps',
    claves: [
      'Torso still at 90°: only the arms move',
      'Squeeze your shoulder blades together at the end of every rep',
    ],
    error: 'Rocking back and forth, using your lower back as the engine.',
  },
  'peso-muerto': {
    musculos: 'The whole posterior chain: glutes, hamstrings, lower back, and grip',
    claves: [
      'Bar against your shins, spine neutral ALWAYS',
      'Push the floor away with your legs, do not pull with your back',
      'Lock out at the top with your glutes, without hyperextending the lower back',
    ],
    error: 'Rounding the lower back off the floor. On this one, technique before kilos, always.',
  },
  'jalon-estrecho': {
    musculos: 'Lats (lower fibers) and biceps',
    claves: [
      'Close neutral grip; elbows in front of your body',
      'Bring the handle to your upper chest with a stable torso',
    ],
    error: 'Turning it into a lower-back swing when the weight gets heavy.',
  },
  hiperextensiones: {
    musculos: 'Lower back, glutes, and hamstrings',
    claves: [
      'Come up to the line of your body, NOT past it',
      'Move slow; squeeze your glutes at the top',
    ],
    error: 'Hyperextending at the top with momentum: your lower back pays for it.',
  },

  // --- Shoulders ---
  'press-militar': {
    musculos: 'Shoulders, triceps, and core',
    claves: [
      'Glutes and abs braced tight: your body is a column',
      'The bar travels close to your face; your head comes "through" at the top',
    ],
    error: 'Arching the lower back to press with your chest.',
  },
  'press-hombro-mancuernas': {
    musculos: 'Shoulders and triceps',
    claves: [
      'Elbows slightly in front of your body, not flared straight out',
      'Press up without clanging the dumbbells at the top',
    ],
    error: 'Stopping at ear level: the useful range goes down to your chin.',
  },
  'elevaciones-laterales': {
    musculos: 'Side delts',
    claves: [
      'LIGHT weight and elbows slightly bent',
      'Raise to horizontal, like pouring two pitchers',
    ],
    error: 'Jerking with your traps and lifting above shoulder height.',
  },
  pajaros: {
    musculos: 'Rear delts and upper back',
    claves: [
      'Torso hinged and still; open with your elbows, not your hands',
      'Light weight: this muscle does not move kilos, it moves shoulder health',
    ],
    error: 'Standing up with every rep, powered by your lower back.',
  },
  'face-pull': {
    musculos: 'Rear delts, rotator cuff, and mid traps',
    claves: [
      'Rope to your face with elbows HIGH',
      'Finish like a "double biceps" pose: external rotation',
    ],
    error: 'Pulling low and straight, turning it into just another row.',
  },
  'press-hombro-maquina': {
    musculos: 'Shoulders and triceps',
    claves: [
      'Seat adjusted: handles at ear height',
      'Press without shrugging your shoulders toward your ears',
    ],
    error: 'Starting with the handles too low and forcing the bottom of the press.',
  },
  encogimientos: {
    musculos: 'Upper traps',
    claves: [
      'Shoulders toward your ears, hold 1 second, lower slow',
      'Arms like ropes: elbows do not bend',
    ],
    error: 'Rolling your shoulders in circles: straight up and straight down.',
  },

  // --- Biceps ---
  'curl-barra': {
    musculos: 'Biceps',
    claves: [
      'Elbows pinned to your sides and STILL',
      'Lower fully and under control: the way down is half the gains',
      'Straight bar or EZ bar: the EZ goes easier on the wrists',
    ],
    error: 'Swinging your body and letting your elbows drift up at the top.',
  },
  'curl-mancuernas': {
    musculos: 'Biceps',
    claves: [
      'Rotate your wrist on the way up (supination): pinky toward the ceiling',
      'Alternating or together, but no swinging',
    ],
    error: 'Cutting the range short once fatigue sets in.',
  },
  'curl-martillo': {
    musculos: 'Biceps, brachialis, and forearms',
    claves: [
      'Neutral (hammer) grip the whole way',
      'Elbows fixed; curl all the way up without rotating',
    ],
    error: 'Turning it into shoulder momentum with heavy weights.',
  },

  // --- Triceps ---
  'press-frances': {
    musculos: 'Triceps (long head)',
    claves: [
      'Elbows pointing at the ceiling, still and tucked',
      'Lower the bar or dumbbell toward your forehead or behind it, under control',
    ],
    error: 'Flaring your elbows and turning it into some strange press.',
  },
  'extension-triceps-polea': {
    musculos: 'Triceps',
    claves: [
      'Elbows pinned to your sides like you are carrying a newspaper under each arm',
      'Extend all the way and hold the lockout for an instant',
      'Bar, rope (spread it at the bottom), or single arm: same technique',
    ],
    error: 'Helping with your shoulders by letting the elbows drift forward.',
  },
  'press-cerrado': {
    musculos: 'Triceps and chest',
    claves: [
      'Grip at shoulder width, no narrower',
      'Elbows tucked to your body on the way down',
    ],
    error: 'Gripping too narrow: it punishes the wrists and gives nothing back.',
  },

  // --- Home and calisthenics: chest, back, shoulders, triceps ---
  'flexiones-inclinadas': {
    musculos: 'Chest, triceps, and core',
    claves: [
      'Hands on a table, counter, or wall: the higher the support, the easier',
      'Body in a plank always, elbows at ~45°',
      'When 3×12 feels easy, lower the support (chair → floor)',
    ],
    error: 'Bending at the hips: it is a push-up, not a bow.',
  },
  'pike-flexiones': {
    musculos: 'Shoulders and triceps',
    claves: [
      'In an inverted V (hips high), your head travels DOWN toward the floor between your hands',
      'This is the shoulder press of calisthenics: elbows back, not flared',
    ],
    error: 'Letting it become a regular push-up to spare the shoulders: hold the V.',
  },
  'fondos-silla': {
    musculos: 'Triceps and lower chest',
    claves: [
      'Hands on the edge of a sturdy chair, legs stretched out in front',
      'Lower until your elbows hit 90°, shoulders AWAY from your ears',
      'Easier: knees bent; harder: feet on a second chair',
    ],
    error: 'Going too deep with shrugged shoulders: that is where the shoulder protests.',
  },
  'remo-invertido': {
    musculos: 'Back, biceps, and grip',
    claves: [
      'Under a sturdy table or low bar: body in a plank, pull your chest to the edge',
      'The more horizontal your body, the harder it gets',
      'This is THE pull at home: push-ups alone will not train your back',
    ],
    error: 'Jerking with your hips instead of pulling with your back.',
  },
  superman: {
    musculos: 'Lower back, glutes, and upper back',
    claves: [
      'Face down, lift arms and legs TOGETHER, no rush',
      'Hold 1-2 seconds at the top, eyes on the floor',
    ],
    error: 'Lifting your head to look forward: your neck suffers for nothing.',
  },

  // --- Tanda 4: chest, back, shoulders with other equipment ---
  'press-inclinado-barra': {
    musculos: 'Upper chest, front delts, and triceps',
    claves: [
      'Bench at 30-45°; the bar comes down to your upper chest',
      'Shoulder blades pinned and feet planted, just like the flat press',
    ],
    error: 'Lowering the bar to your neck: that protects neither chest nor shoulder.',
  },
  'press-mancuernas': {
    musculos: 'Chest, triceps, and front delts',
    claves: [
      'Dumbbells at chest height, wrists straight',
      'Press up in an arc until they nearly meet at the top',
      'Slightly longer range than the barbell: lower under control',
    ],
    error: 'Clanging the dumbbells together at the top: tension drops and the shoulders wobble.',
  },
  'press-declinado': {
    musculos: 'Lower chest and triceps',
    claves: [
      'Legs hooked in tight on the decline bench',
      'The bar comes down to your lower chest, short and controlled range',
    ],
    error: 'Dropping the bar toward your face when fatigue hits: ask for a hand unracking it.',
  },
  'aperturas-mancuernas': {
    musculos: 'Chest (isolation)',
    claves: [
      'Elbows slightly bent and LOCKED in that angle the whole way',
      'Lower until you feel the stretch, without sinking the elbows too deep',
      'Close like you are hugging a tree, without clanging at the top',
    ],
    error: 'Going too deep with heavy weight: your shoulder pays for the stretch.',
  },
  'remo-en-maquina': {
    musculos: 'Lats, rhomboids, and biceps',
    claves: [
      'Chest against the pad: still for the whole set',
      'Drive your elbows back and squeeze your shoulder blades at the end',
    ],
    error: 'Peeling your chest off the pad to heave more weight.',
  },
  'remo-t-bar': {
    musculos: 'Lats, rhomboids, and lower back (isometric)',
    claves: [
      'Back flat and hinged ~45°, knees soft',
      'Pull the bar to your stomach and squeeze your shoulder blades together',
      'Variant: chest-supported machine, same idea with less lower back',
    ],
    error: 'Rounding your back and heaving with your whole body.',
  },
  'pullover-polea': {
    musculos: 'Lats (isolation) and triceps (isometric)',
    claves: [
      'Arms nearly straight, elbows fixed: sweep the bar in an arc down to your thighs',
      'Lean slightly forward and feel the lats stretch at the top',
    ],
    error: 'Bending your elbows and turning it into a triceps extension.',
  },
  'press-arnold': {
    musculos: 'The whole shoulder (front and side)',
    claves: [
      'Start palms facing you and rotate as you press until they face forward',
      'Rotate smooth and continuous: the rotation is the exercise, not a flourish',
    ],
    error: 'Loading so much weight the rotation disappears: then it is just half a regular press.',
  },
  'elevaciones-frontales': {
    musculos: 'Front delts',
    claves: [
      'Raise to shoulder height, no higher',
      'Elbows slightly bent, torso still',
      'Light weight is usually plenty: pressing already works the front delt hard',
    ],
    error: 'Swinging your body to lift a weight that has no business there.',
  },
  'remo-al-menton': {
    musculos: 'Side delts and traps',
    claves: [
      'Grip wider than your shoulders, elbows ALWAYS above the bar',
      'Pull only to chest height: any higher gives nothing',
    ],
    error: 'Narrow grip and bar to the chin: the shoulder gets pinched. If it bothers you, do lateral raises.',
  },
  'cargada-press': {
    musculos: 'Full body: legs, hips, shoulders, and core',
    claves: [
      'Two beats: a clean catch at the chest, pause, then a strict press',
      'The bar travels close to your body; the hips do the work, not the arms',
      'Technique before weight: few lifts punish sloppiness harder',
    ],
    error: 'Starting heavy before owning the clean: the bar drifts away and your lower back feels it.',
  },

  // --- Tanda 4: arms ---
  'curl-predicador': {
    musculos: 'Biceps (strict isolation)',
    claves: [
      'Armpits set firm on the preacher bench, elbows never lifting off',
      'Lower until nearly straight, without snapping into lockout',
      'Straight bar or EZ bar: the EZ goes easier on the wrists',
    ],
    error: 'Dropping the lowering phase like a stone: that is where biceps get hurt most.',
  },
  'curl-concentrado': {
    musculos: 'Biceps (isolation)',
    claves: [
      'Seated, elbow braced against the inside of your thigh',
      'Curl up slow, squeeze a second at the top, lower even slower',
    ],
    error: 'Helping with your shoulder: if the elbow leaves the thigh, it is cheating.',
  },
  'curl-polea': {
    musculos: 'Biceps',
    claves: [
      'The cable keeps tension through the WHOLE range, use it: lower slow',
      'Elbows pinned to your sides, wrists straight',
    ],
    error: 'Stepping back from the pulley and rowing with your body.',
  },
  'curl-arana': {
    musculos: 'Biceps (short head)',
    claves: [
      'Chest on an incline bench, arms hanging straight down',
      'The arm hangs free: cheating with your body is impossible',
    ],
    error: 'Cutting the range short at the bottom: stretch fully on every rep.',
  },
  'extension-sobre-cabeza': {
    musculos: 'Triceps (long head)',
    claves: [
      'Dumbbell held in both hands behind your head, elbows pointing at the ceiling',
      'Elbows tucked and still: only the forearms move',
      'Also works facing away from a low cable, same idea',
    ],
    error: 'Flaring your elbows out like wings: the triceps lose and the shoulder suffers.',
  },
  'patada-triceps': {
    musculos: 'Triceps (isolation)',
    claves: [
      'Torso hinged, upper arm parallel to the floor, elbow FIXED',
      'Extend fully back and hold for a second',
      'Light weight: this one is for feeling, not for loading',
    ],
    error: 'Letting the elbow drop and swinging the dumbbell with your shoulder.',
  },

  // --- Tanda 4: forearms ---
  'curl-muneca': {
    musculos: 'Forearms (flexors or extensors)',
    claves: [
      'Forearms resting on your thigh or a bench, only the wrist moves',
      'Palms up = flexors; palms down = extensors (less weight)',
      'Short, slow range, high reps',
    ],
    error: 'Moving your elbow to help: the forearm works through the wrist alone.',
  },
  'paseo-granjero': {
    musculos: 'Forearms (grip), traps, and core',
    claves: [
      'Serious weight at your sides, shoulders back, torso tall',
      'Short, firm steps; log kg and steps (reps = steps)',
    ],
    error: 'Hunching under the load: walk tall, as if it weighed nothing.',
  },
  'dead-hang': {
    musculos: 'Forearms (grip), shoulders, and back (decompression)',
    claves: [
      'Hang from the bar with a firm grip and active shoulders (away from your ears)',
      'Start with 20-30 seconds; grip improves fast',
    ],
    error: 'Hanging fully limp with shoulders at your ears: keep slight shoulder engagement.',
  },
}
