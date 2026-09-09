// Traducciones al inglés de las plantillas de rutinas (nombre, resumen, porQue, consejo y nombres de días por id)

export const PLANTILLAS_EN = {
  'fb-ab-clasico': {
    nombre: 'Full body A/B',
    resumen: 'Your whole body every session, two versions that alternate.',
    porQue:
      'With 2 days a week, hitting every muscle twice is the best investment: no splitting by muscle group. Two different sessions to keep it fresh, with push, pull, and legs spread across both.',
    consejo: 'Alternate A and B. If some week you can only make it once, no harm done: do whichever is next.',
    dias: ['Full body A', 'Full body B'],
  },
  'fb-maquinas': {
    nombre: 'Machine full body',
    resumen: 'All machines, with the same science behind it.',
    porQue:
      'Studies comparing machines and free weights find the same muscle growth: this is not the "fake" option, it is an option. Machines guide the movement path, so all your focus goes into effort. Ideal if the gym still feels new or barbells still intimidate.',
    consejo:
      'ALWAYS adjust the seat before each machine (there is a cue on every exercise card ⓘ). The leg press repeats on both days on purpose: that way your legs work twice a week.',
    dias: ['Machines A', 'Machines B'],
  },
  'fb-abc': {
    nombre: 'Full body A/B/C',
    resumen: 'The beginner routine par excellence. If in doubt, this one.',
    porQue:
      'Three full-body sessions with a rest day in between: every muscle trains 3 times a week with volume that is easy to recover from. It is the structure a beginner progresses fastest on.',
    consejo: 'Ideal Mon-Wed-Fri (or similar, with a free day between sessions). Rotate A→B→C and start over.',
    dias: ['Full body A', 'Full body B', 'Full body C'],
  },
  'tpf-3': {
    nombre: 'Upper / Lower / Full body',
    resumen: 'One upper day, one lower day, and one full-body recap.',
    porQue:
      'An alternative to A/B/C with more focused sessions, keeping what matters: every muscle trains at least twice a week (with 3 days, a push/pull/legs split would leave each group at once per week, and the evidence favors twice).',
    consejo: 'Works in any order; save the Full body for the day you arrive with the least energy.',
    dias: ['Upper body', 'Lower body', 'Full body'],
  },
  'torso-pierna': {
    nombre: 'Upper / Lower ×2',
    resumen: 'The 4-day gold standard: two upper days, two lower days.',
    porQue:
      'Each half of the body trains twice a week in short, focused sessions. It is the most battle-tested 4-day split there is, and it grows with you for years.',
    consejo: 'Ideal in pairs: Mon-Tue and Thu-Fri, with Wednesday and the weekend off.',
    dias: ['Upper A', 'Lower A', 'Upper B', 'Lower B'],
  },
  'etp-full': {
    nombre: 'Push / Pull / Legs + Full body',
    resumen: 'The three patterns, plus an easy fourth day to revisit it all.',
    porQue:
      'Like the 3-day Push/Pull/Legs, with a fourth, lighter full-body day that adds frequency without grinding you down. Good if you feel like one more "easy" day at the gym.',
    consejo: 'The Full body day is the flexible one: if the week gets complicated, it is the first to go — no drama.',
    dias: ['Push', 'Pull', 'Legs', 'Light full body'],
  },
  'tp-full-5': {
    nombre: 'Upper / Lower ×2 + Full body',
    resumen: 'The classic Upper/Lower with a fifth day of review.',
    porQue:
      'Honest warning: starting out, 5 days are NOT better than 3-4 — muscle grows while you recover. But if the gym gives you life and you want to go, this structure spreads the work without frying you: four serious days and one easy one.',
    consejo:
      'The fifth day is optional from the heart: if Friday comes and you are wrecked, rest. Your streak understands if you adjust your planned days.',
    dias: ['Upper A', 'Lower A', 'Upper B', 'Lower B', 'Light full body'],
  },
  'etp-tp-5': {
    nombre: 'Push / Pull / Legs + Upper / Lower',
    resumen: 'The three patterns, plus an upper and lower reinforcement.',
    porQue:
      'Blends the two classic splits: every muscle gets touched twice a week with plenty of exercise variety. For beginners with five genuinely FREE days and an appetite for variety.',
    consejo: 'Leave at least one real rest day each week. Sleep is training.',
    dias: ['Push', 'Pull', 'Legs', 'Upper body', 'Legs and core'],
  },
  'casa-ab': {
    nombre: 'At home A/B (no equipment)',
    resumen: 'Full body with what any home already has.',
    porQue:
      'Starting out, your own body is load enough: it drives real progress for months. The key piece is the inverted row under a sturdy table — without it, your back loses its pull and push-ups leave you unbalanced.',
    consejo:
      'Here you progress in reps and in VARIANTS: when 3×12 gets easy, lower the push-up support (wall → chair → floor) or take the bridge to one leg.',
    dias: ['At home A', 'At home B'],
  },
  'casa-abc': {
    nombre: 'At home A/B/C',
    resumen: 'Three full-body days without setting foot in a gym.',
    porQue:
      'The same logic as the gym Full body A/B/C: every muscle two or three times a week, in short, recoverable sessions. Day C raises the difficulty a notch (floor push-ups and burpees) so progression lives inside the routine itself.',
    consejo:
      'If floor push-ups are not there yet, swap them for incline ones — no drama: the right variant is the one that lets you do 8-12 clean reps.',
    dias: ['At home A', 'At home B', 'At home C'],
  },
  'cali-ab': {
    nombre: 'Calisthenics A/B',
    resumen: 'With a pull-up bar or a park nearby.',
    porQue:
      'Gymnastics, the old way: pull-ups, push-ups, and squats build real strength with a bar and the floor. Two full-body sessions with push and pull in balance.',
    consejo:
      'If pull-ups are not there yet: jump to the top and LOWER yourself as slowly as you can (negatives), or swap in inverted rows until the first one arrives. It arrives.',
    dias: ['Calisthenics A', 'Calisthenics B'],
  },
  'cali-abc': {
    nombre: 'Calisthenics A/B/C',
    resumen: 'The park classic, ordered for progress.',
    porQue:
      'Three full-body sessions that spread pull-ups, push-ups, and legs so each pattern trains two or three times a week. Day C dips on parallel bars log at 0 kg (or weighted, the day it is time to show off).',
    consejo:
      'Pull-ups lead the way: when you go from 3×5 to 3×8, everything else will have risen with you. In doubt about form, exercise card ⓘ and go slow.',
    dias: ['Calisthenics A', 'Calisthenics B', 'Calisthenics C'],
  },
}
