// src/services/export/trainingPlanExport.ts
import { jsPDF } from 'jspdf'

type ExportFormat = 'html' | 'pdf' | 'csv' | 'json' | 'txt'
type ExportMode = 'file' | 'share'

type PlanExercise = {
    exercise: string
    sets: number
    reps: number
    goal?: string
    type?: 'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung'
}

type TrainingPlan = {
    name: string
    exercises: PlanExercise[]
    code?: string | null
}

export async function exportTrainingPlan(
    plan: TrainingPlan,
    opts: {
        format: ExportFormat
        mode: ExportMode

        // optional overrides fürs Teilen (muss = Preview sein)
        shareText?: string
        shareLines?: string[]
        shareUrl?: string
    }
): Promise<boolean> {
    try {
        const { format, mode } = opts

        const anyCardio = plan.exercises.some(ex => ex.type === 'ausdauer')
        const anyStretch = plan.exercises.some(ex => ex.type === 'dehnung')

        const setsHeader = anyCardio ? 'Sätze / Min' : 'Sätze'
        const repsHeader = (anyCardio || anyStretch) ? 'Wdh. / km / s' : 'Wiederholungen'

        const fmtSets = (ex: PlanExercise) => ex.type === 'ausdauer' ? `${ex.sets} min` : `${ex.sets}`
        const fmtReps = (ex: PlanExercise) => {
            if (ex.type === 'ausdauer') return ex.reps ? `${ex.reps} km` : '-'
            if (ex.type === 'dehnung') return `${ex.reps} s`
            return `${ex.reps}`
        }

        const uniqueGoal =
            [...new Set(plan.exercises.map(ex => ex.goal).filter(Boolean))][0] as string | undefined

        const title = plan.name
        const fileName = plan.name

        const buildHtml = () => `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
      h1 { color: #4B6CB7; text-align: left; }
      table { width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 20px 0; }
      th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
      th { background: #333; color: #fff; }
      tr:nth-child(even) { background: #f9fafb; }
      tr:hover { background: #e2e8f0; }
      td { color: #4b5563; }
      .muted { color: #6b7280; font-size: 0.9em; }
    </style>
  </head>
  <body>
    <h1>${title}${uniqueGoal ? ` <span class="muted">(${uniqueGoal})</span>` : ''}</h1>
    <table>
      <tr>
        <th>Übung</th>
        <th>${setsHeader}</th>
        <th>${repsHeader}</th>
      </tr>
      ${plan.exercises.map(ex => `
        <tr>
          <td>${ex.exercise}</td>
          <td>${fmtSets(ex)}</td>
          <td>${fmtReps(ex)}</td>
        </tr>
      `).join('')}
    </table>
  </body>
</html>`.trim()

        const buildCsv = () => {
            const header = ['Übung', setsHeader, repsHeader]
            const rows = plan.exercises.map(ex => [ex.exercise, fmtSets(ex), fmtReps(ex)])
            return [header.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
        }

        const buildJson = () => {
            const json = plan.exercises.map(ex => ({
                exercise: ex.exercise,
                sets: ex.sets,
                sets_unit: ex.type === 'ausdauer' ? 'min' : 'sets',
                reps: ex.reps,
                reps_unit: ex.type === 'ausdauer' ? 'km' : (ex.type === 'dehnung' ? 's' : 'reps'),
                type: ex.type ?? 'kraft',
                goal: ex.goal ?? null,
            }))
            return JSON.stringify(json, null, 2)
        }

        const buildTxt = () => ([
            `Trainingsplan: ${title}${uniqueGoal ? ` (${uniqueGoal})` : ''}`,
            '',
            `Übung\t${setsHeader}\t${repsHeader}`,
            ...plan.exercises.map(ex => `${ex.exercise}\t${fmtSets(ex)}\t${fmtReps(ex)}`),
        ]).join('\n')

        // ---- SHARE (Clipboard Message) ----
        if (mode === 'share') {
            const msg = buildShareMessageWithOverrides(plan, opts)
            await navigator.clipboard.writeText(msg)
            return true
        }

        // ---- FILE ----
        if (format === 'html') {
            downloadFile(`${fileName}_Trainingsplan.html`, buildHtml(), 'text/html;charset=utf-8')
            return true
        }

        if (format === 'pdf') {
            const doc = new jsPDF()
            doc.setFont('Helvetica', 'normal')
            doc.setFontSize(16)
            doc.text(title + (uniqueGoal ? ` (${uniqueGoal})` : ''), 20, 20)
            doc.setFontSize(12)
            let y = 40
            doc.text(['Übung', setsHeader, repsHeader].join(' | '), 20, y)
            y += 10
            plan.exercises.forEach(ex => {
                doc.text([ex.exercise, fmtSets(ex), fmtReps(ex)].join(' | '), 20, y)
                y += 10
            })
            doc.save(`${fileName}_Trainingsplan.pdf`)
            return true
        }

        if (format === 'csv') {
            downloadFile(`${fileName}_Trainingsplan.csv`, buildCsv(), 'text/csv;charset=utf-8')
            return true
        }

        if (format === 'json') {
            downloadFile(`${fileName}_Trainingsplan.json`, buildJson(), 'application/json;charset=utf-8')
            return true
        }

        if (format === 'txt') {
            downloadFile(`${fileName}_Trainingsplan.txt`, buildTxt(), 'text/plain;charset=utf-8')
            return true
        }

        return false
    } catch (e) {
        console.error('[exportTrainingPlan] failed', e)
        return false
    }
}
function buildShareMessageWithOverrides(
    plan: TrainingPlan,
    opts?: { shareText?: string; shareLines?: string[]; shareUrl?: string }
) {
    const lines =
        Array.isArray(opts?.shareLines) && opts!.shareLines!.length
            ? opts!.shareLines!
            : null

    if (lines) return lines.join('\n')

    const url = (opts?.shareUrl ?? '').trim()
    const text = (opts?.shareText ?? '').trim()

    if (text || url) {
        return [text, url].filter(Boolean).join('\n')
    }

    return buildShareMessage(plan)
}
function buildShareMessage(plan: TrainingPlan) {
    const code = (plan?.code ?? '').trim()

    // Deep-Link direkt in Training (passt zu deinem /training?code=...)
    const url = code
        ? `https://trackyourgains.de/training?code=${encodeURIComponent(code)}`
        : `https://trackyourgains.de`

    return [
        '🔥 Ich hab dir meinen Trainingsplan in TrackYourGains geschickt.',
        '👉 Öffnen & direkt loslegen:',
        url,
    ].join('\n')
}

function downloadFile(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
}