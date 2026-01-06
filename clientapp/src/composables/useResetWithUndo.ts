// src/composables/useResetWithUndo.ts
import type { Toast } from '@/types/toast'

type EnqueueToast = (t: Toast) => void

type ResetWithUndoArgs<TSnapshot> = {
    snapshot?: TSnapshot
    reset: () => void
    restore?: (snap: TSnapshot) => void

    toast: {
        type: Toast['type']
        emoji: string
        message: string
        durationMs?: number
        undoLabel?: string
    }
}

export function useResetWithUndo(enqueueToast: EnqueueToast) {
    function run<TSnapshot>(args: ResetWithUndoArgs<TSnapshot>) {
        // 1) Reset ausführen
        args.reset()

        // 2) Toast bauen
        const toast: Toast = {
            id: Date.now(),
            type: args.toast.type,
            emoji: args.toast.emoji,
            message: args.toast.message,
            exiting: false,
            durationMs: args.toast.durationMs ?? 3500,
            action:
                args.snapshot && args.restore
                    ? {
                        label: args.toast.undoLabel ?? 'Rückgängig',
                        handler: () => args.restore!(args.snapshot as TSnapshot),
                    }
                    : undefined,
        }

        // 3) Enqueue
        enqueueToast(toast)
    }

    return { run }
}
