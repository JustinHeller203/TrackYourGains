// src/utils/errorOverlay.ts
type AnyErr = any

function safeStringify(x: any) {
    try { return typeof x === 'string' ? x : JSON.stringify(x, null, 2) }
    catch { return String(x) }
}

function formatErr(err: AnyErr) {
    if (!err) return 'Unknown error'
    if (err instanceof Error) return `${err.name}: ${err.message}\n${err.stack ?? ''}`
    if (typeof err === 'string') return err
    if (typeof err?.message === 'string') return `${err.message}\n${err.stack ?? ''}`
    return safeStringify(err)
}

function shouldShowOverlay() {
    try {
        const url = new URL(window.location.href)
        if (url.searchParams.get('debugErrors') === '1') return true
        if (localStorage.getItem('tyg_debug_errors') === 'true') return true
    } catch { /* ignore */ }
    return false
}

export function installErrorOverlay() {
    // immer sammeln, aber Overlay nur wenn debug aktiv
    const show = shouldShowOverlay()

    const errors: string[] = []
        ; (window as any).__TYG_ERRORS__ = errors

    const append = (title: string, err: AnyErr) => {
        const msg = `[${new Date().toISOString()}] ${title}\n${formatErr(err)}`
        errors.push(msg)
        console.error(title, err)

        if (!show) return

        let root = document.getElementById('__tyg_error_overlay__')
        if (!root) {
            root = document.createElement('div')
            root.id = '__tyg_error_overlay__'
            root.style.position = 'fixed'
            root.style.inset = '0'
            root.style.zIndex = '2147483647'
            root.style.background = 'rgba(0,0,0,.92)'
            root.style.color = '#fff'
            root.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            root.style.fontSize = '12px'
            root.style.padding = '12px'
            root.style.overflow = 'auto'
            root.style.whiteSpace = 'pre-wrap'
            root.style.wordBreak = 'break-word'
            root.innerHTML =
                `TYG Error Overlay (debugErrors=1)\n` +
                `— Press ESC to hide\n` +
                `— Stored in window.__TYG_ERRORS__\n\n`

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') root?.remove()
            })

            document.documentElement.appendChild(root)
        }

        root.textContent += `\n\n${msg}\n`
    }

    // window-level
    window.addEventListener('error', (ev) => append('window.error', (ev as ErrorEvent).error || (ev as ErrorEvent).message))
    window.addEventListener('unhandledrejection', (ev) => append('unhandledrejection', (ev as PromiseRejectionEvent).reason))

    return { append }
}
