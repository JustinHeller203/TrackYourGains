import { translateText, type AppLocale } from '@/i18n/translations'
import type { TutorialEntry, TutorialTranslations } from '@/types/tutorials'

type TutorialTextField = 'title' | 'description' | 'category' | 'level'
type TutorialListField = 'equipment' | 'muscleGroups' | 'cues' | 'steps' | 'mistakes'

type TutorialTranslationInput = Partial<Record<AppLocale, {
  title?: string
  description?: string
  category?: string
  level?: TutorialEntry['level']
  equipment?: string[]
  muscleGroups?: string[]
  cues?: string[]
  steps?: string[]
  mistakes?: string[]
}>>

const BUILTIN_TUTORIAL_TRANSLATIONS: Record<number, TutorialTranslationInput> = {
  1: { en: { title: 'Bench Press', description: 'Build a strong chest, shoulders, and triceps with the bench press.', cues: ['Pull your shoulders down and back.', 'Press your feet firmly into the floor.', 'Lower the bar with control to your chest.'], steps: ['Lie down firmly on the bench and grip the bar.', 'Unrack the bar and position it over your chest.', 'Lower it in a controlled way and press it back up powerfully.'], mistakes: ['Elbows flaring too far out.', 'Bouncing the bar off the chest.', 'Losing full-body tension.'] } },
  2: { en: { title: 'Squats', description: 'Strengthen your legs and glutes with squats.', cues: ['Brace your core before every rep.', 'Push your knees in line with your toes.', 'Keep pressure through the whole foot.'], steps: ['Set your stance and create tension.', 'Sit down and back into the squat.', 'Drive back up in a controlled way.'], mistakes: ['Heels lifting off the floor.', 'Lower back rounding.', 'Knees collapsing inward.'] } },
  3: { en: { title: 'Deadlift', description: 'Train your entire posterior chain with the deadlift.', cues: ['Keep the bar close to your body.', 'Brace your lats before you lift.', 'Drive through the floor with tension.'], steps: ['Set your feet and grip the bar tightly.', 'Create tension through your back and hips.', 'Stand up with control and lower the bar back down cleanly.'], mistakes: ['Starting with a rounded back.', 'Bar drifting away from the body.', 'Yanking the weight off the floor.'] } },
  4: { en: { title: 'Shoulder Press', description: 'Train your shoulders and pressing strength with the shoulder press.', cues: ['Keep your core tight.', 'Press in a straight line overhead.', 'Control the weight on the way down.'], steps: ['Set up with the weights at shoulder height.', 'Press overhead without losing body tension.', 'Lower back down under control.'], mistakes: ['Overarching the lower back.', 'Pressing forward instead of overhead.', 'Shrugging the shoulders up.'] } },
  5: { en: { title: 'Pull-Ups', description: 'Build a strong back and arms with pull-ups.', cues: ['Build tension before you pull.', 'Pull your shoulder blades down and together.', 'Lower yourself fully under control.'], steps: ['Take a stable grip on the bar.', 'Pull your body upward with tension.', 'Lower yourself back down with control.'], mistakes: ['Using momentum.', 'Only using half the range of motion.', 'Reaching the neck forward.'] } },
  6: { en: { title: 'Lunges', description: 'Shape your legs and glutes with lunges.', cues: ['Keep your torso upright.', 'Keep the front knee stacked over the foot.', 'Work actively through both legs.'], steps: ['Stand tall and take a controlled step.', 'Lower the back knee toward the floor.', 'Drive back up through the front leg.'], mistakes: ['Step length too short or too long.', 'Knee caving inward.', 'Shifting the weight only onto the toes.'] } },
  7: { en: { title: 'Plank', description: 'Strengthen your core with the plank.', cues: ['Squeeze your glutes and abs at the same time.', 'Push the floor away with active shoulders.', 'Keep your body in one straight line.'], steps: ['Place your forearms under your shoulders.', 'Extend your legs and build tension.', 'Hold the position calmly and steadily.'], mistakes: ['Sagging hips or hips too high.', 'Shoulders collapsing.', 'Holding your breath completely.'] } },
  8: { en: { title: 'Biceps Curls', description: 'Train your arms with curls.', cues: ['Keep your elbows close to your body.', 'Move only at the elbow.', 'Lower the weight with control.'], steps: ['Stand tall and hold the dumbbells still.', 'Curl the weight up without swinging.', 'Return slowly to the stretched position.'], mistakes: ['Swinging with the torso.', 'Elbows drifting forward.', 'Dropping the negative too quickly.'] } },
  9: { en: { title: 'Leg Press', description: 'Strengthen your legs on the leg press.', cues: ['Keep your lower back against the pad.', 'Let your knees track with your feet.', 'Do not snap hard into lockout.'], steps: ['Place your feet firmly on the platform.', 'Lower the sled with control.', 'Press it back up through the whole foot.'], mistakes: ['Going too deep with the pelvis rounding.', 'Knees falling inward.', 'Overextending the joints at the top.'] } },
  10: { en: { title: 'Burpees', description: 'A brutal full-body move for endurance and strength.', cues: ['Control the rhythm instead of getting hectic.', 'Keep your trunk stable even during the jump phase.', 'Land cleanly and rebuild your position right away.'], steps: ['Drop into a squat and bring your hands to the floor.', 'Jump your feet back and stabilize your body.', 'Jump the feet back in, stand up, and explode upward.'], mistakes: ['Rounded back during the transition to the floor.', 'Messy landing on the balls of the feet.', 'Letting speed override technique.'] } },
  11: { en: { title: 'Cable Row', description: 'A clean pulling movement for your back and posture.', cues: ['Keep the chest tall and shoulders away from the ears.', 'Pull your hands toward the lower chest.', 'Let the weight return under control.'], steps: ['Adjust the seat and handle.', 'Stabilize your torso upright.', 'Pull toward your body and slowly extend again.'], mistakes: ['Yanking backward with momentum.', 'Rounded back.', 'Pulling only with the arms.'] } },
  12: { en: { title: 'Lat Pulldown', description: 'Build a wider back with stable shoulder positioning.', cues: ['Keep your chest proud and lean slightly back.', 'Drive the elbows toward the hips.', 'Do not let the shoulders shrug up.'], steps: ['Set your grip and sit firmly under the bar.', 'Pull the bar down to the upper chest with control.', 'Guide it slowly back up.'], mistakes: ['Pulling the bar behind the head.', 'Using torso momentum.', 'Losing all tension at the top.'] } },
  13: { en: { title: 'Hip Thrust', description: 'Focus on your glutes and hip extension with a clean setup.', cues: ['Keep your chin slightly tucked toward your chest.', 'Actively squeeze the glutes at the top.', 'Your shins should be roughly vertical at the top.'], steps: ['Position your upper back on the bench and set your feet.', 'Lift the weight through the hips with control.', 'Hold briefly at the top and lower slowly.'], mistakes: ['Overarching the lower back.', 'Feet placed too far forward or back.', 'Using momentum instead of true hip extension.'] } },
  14: { en: { title: 'Romanian Deadlift', description: 'Train the posterior chain with a controlled eccentric.', cues: ['Push your hips far back.', 'Keep the bar close to your legs.', 'Maintain a slight knee bend throughout.'], steps: ['Set your stance and brace your back.', 'Hinge back from the hips.', 'Stand back up through the glutes and hamstrings.'], mistakes: ['Going too deep and losing your back position.', 'Letting the bar drift away from the body.', 'Bending the knees too much like a squat.'] } },
  15: { en: { title: 'Face Pulls', description: 'Improve shoulder health and upper-back work.', cues: ['Pull toward your face with high elbows.', 'Keep the shoulders down and externally rotate.', 'Pause briefly in the contracted position.'], steps: ['Set the rope at face height.', 'Step back and create tension.', 'Pull to the face and extend back under control.'], mistakes: ['Pulling too low to the chest.', 'Shrugging the shoulders.', 'Doing all the work with the biceps.'] } },
  16: { en: { title: 'Dips', description: 'A powerful upper-body press for chest, shoulders, and triceps.', cues: ['Keep the shoulders stable and do not sink.', 'Keep the chest open and trunk tight.', 'Only go as deep as you can control.'], steps: ['Press yourself into the support position.', 'Bend the elbows and lower with control.', 'Press powerfully back to the top.'], mistakes: ['Dropping too deep into the shoulders.', 'Tipping with momentum.', 'Letting the elbows flare out uncontrollably.'] } },
  17: { en: { title: 'Triceps Pushdown', description: 'An isolation movement for clean triceps work at the cable.', cues: ['Keep the elbows close to your body.', 'Move only at the elbow.', 'Press fully down and stay in control.'], steps: ['Set up in a stable position in front of the cable.', 'Press the handle down from the start position.', 'Return slowly to the starting position.'], mistakes: ['Using the torso to help.', 'Elbows drifting forward.', 'Losing all tension at the top.'] } },
  18: { en: { title: 'Lateral Raise', description: 'Train the side delts with control and no momentum.', cues: ['Work slightly in front of the body.', 'Lead the movement with the elbows.', 'Do not yank the top with momentum.'], steps: ['Stand tall and hold the dumbbells at your sides.', 'Raise them with control to about shoulder height.', 'Lower them back down slowly.'], mistakes: ['Swinging from the hips or back.', 'Pulling the dumbbells too high.', 'Shrugging the shoulders toward the ears.'] } },
  19: { en: { title: 'Calf Raise', description: 'Train your calves cleanly through the full range of motion.', cues: ['Drive consciously through the toes.', 'Hold tension briefly at the top.', 'Use the full stretch at the bottom.'], steps: ['Place your feet in a stable position.', 'Lift the heels as high as possible.', 'Lower them back down under control.'], mistakes: ['Using tiny half reps only.', 'Bouncing with momentum.', 'Shifting body weight unevenly.'] } },
  20: { en: { title: 'Leg Curl', description: 'Strengthen the hamstrings in an isolated and controlled way.', cues: ['Keep the pelvis still on the pad.', 'Drive the movement fully from the hamstrings.', 'Slow down the negative.'], steps: ['Adjust the machine to your body length.', 'Set the pads cleanly in place.', 'Pull the heels in and extend again with control.'], mistakes: ['Glutes lifting off the pad.', 'Letting the weight fly back too fast.', 'Using too much weight for clean control.'] } },
  21: { en: { title: 'Leg Extension', description: 'Target the quadriceps with a clean finish position.', cues: ['Adjust the seat so the knee can rotate cleanly.', 'Hold the tension briefly at the top.', 'Return to the bent position with control.'], steps: ['Adjust the machine correctly.', 'Extend the lower legs forward.', 'Lower back to the start slowly.'], mistakes: ['Using too much weight and swinging.', 'Only using half the range.', 'Shifting backward in the seat.'] } },
  22: { en: { title: 'Chest Fly', description: 'Load the chest with tension through the entire range of motion.', cues: ['Keep a slight bend in the elbows.', 'Actively bring the chest together.', 'Do not shift the load into the shoulders.'], steps: ['Set up firmly and open the arms with a slight bend.', 'Bring the arms together in an arc in front of the chest.', 'Open back up under control.'], mistakes: ['Arms too straight.', 'Pulling too deep into the shoulder.', 'Crashing the weights together with momentum.'] } },
  23: { en: { title: 'Mountain Climbers', description: 'A crisp finisher for core and conditioning.', cues: ['Drive the hands firmly into the floor.', 'Keep the pelvis stable.', 'Only move as fast as you can stay clean.'], steps: ['Start in a stable high plank.', 'Pull one knee toward the chest.', 'Switch the legs dynamically without losing the line.'], mistakes: ['Hips too high or too low.', 'Too much hip rotation.', 'Just frantic flailing instead of clean steps.'] } },
  24: { en: { title: 'Russian Twists', description: 'Rotational trunk work with clean control.', cues: ['Rotate from the trunk instead of only the arms.', 'Keep the chest open.', 'Control the tempo.'], steps: ['Lean back slightly and build tension.', 'Rotate from side to side.', 'Re-center briefly every time.'], mistakes: ['Rounded back.', 'Only swinging the hands side to side.', 'Too much momentum instead of control.'] } },
  25: { en: { title: 'Bird Dog', description: 'A low-entry stability drill for the core and back.', cues: ['Keep the pelvis completely still.', 'Reach long through arm and leg.', 'Keep the abs engaged.'], steps: ['Set up in a stable quadruped position.', 'Reach out the opposite arm and leg.', 'Hold briefly and switch with control.'], mistakes: ['Pelvis tipping to one side.', 'Reaching too high instead of long.', 'Losing trunk tension.'] } },
  26: { en: { title: 'Glute Bridge', description: 'A simple entry for glute activation and hip stability.', cues: ['Drive the heels actively into the floor.', 'Squeeze the glutes hard at the top.', 'Keep the ribs down.'], steps: ['Lie on your back and plant your feet.', 'Drive your hips upward.', 'Hold briefly and lower with control.'], mistakes: ['Only pushing into a lower-back arch.', 'Feet set too far away.', 'Dropping immediately with no tension at the top.'] } },
  27: { en: { title: 'Goblet Squat', description: 'A very strong squat entry with clean trunk tension.', cues: ['Keep the weight close to your body.', 'Keep the chest tall and elbows under the weight.', 'Drive the knees actively outward.'], steps: ['Hold the dumbbell in front of your chest.', 'Lower into the squat with control.', 'Stand back up through the whole foot.'], mistakes: ['Holding the dumbbell too far away.', 'Back rounding at the bottom.', 'Knees collapsing inward.'] } },
  28: { en: { title: 'Incline Dumbbell Press', description: 'Build the upper chest and shoulder line with control.', cues: ['Pull the shoulders firmly into the bench.', 'Move the dumbbells in a slight arc with control.', 'Keep the wrists stacked over the elbows.'], steps: ['Set the bench to an incline and take the dumbbells up cleanly.', 'Press from a stable shoulder position.', 'Lower slowly into the stretch.'], mistakes: ['Shoulders drifting forward.', 'Dumbbells crashing together at the top.', 'Setting the incline too steep and turning it into a shoulder press.'] } },
}

function mergeContent(base: NonNullable<TutorialTranslations[AppLocale]> | undefined, extra: NonNullable<TutorialTranslations[AppLocale]> | undefined) {
  if (!base && !extra) return undefined
  return {
    ...(base ?? {}),
    ...(extra ?? {}),
  }
}

export function mergeTutorialTranslations(base: TutorialTranslations | undefined, extra: TutorialTranslations | undefined): TutorialTranslations | undefined {
  if (!base && !extra) return undefined
  return {
    de: mergeContent(base?.de, extra?.de),
    en: mergeContent(base?.en, extra?.en),
  }
}

export function enrichTutorialTranslations(tutorial: TutorialEntry): TutorialEntry {
  const builtinTranslations = BUILTIN_TUTORIAL_TRANSLATIONS[tutorial.id]
  if (!builtinTranslations) return tutorial
  return {
    ...tutorial,
    translations: mergeTutorialTranslations(tutorial.translations, builtinTranslations),
  }
}

export function getTutorialLocalizedText(
  tutorial: Pick<TutorialEntry, TutorialTextField | 'translations'>,
  field: TutorialTextField,
  locale: AppLocale,
) {
  const localized = tutorial.translations?.[locale]?.[field]
  const fallback = tutorial[field]
  return translateText(String(localized ?? fallback ?? ''), locale)
}

export function getTutorialLocalizedList(
  tutorial: Pick<TutorialEntry, TutorialListField | 'translations'>,
  field: TutorialListField,
  locale: AppLocale,
) {
  const localized = tutorial.translations?.[locale]?.[field]
  const fallback = tutorial[field]
  const source = Array.isArray(localized) ? localized : Array.isArray(fallback) ? fallback : []
  return source.map((item) => translateText(String(item ?? ''), locale))
}
