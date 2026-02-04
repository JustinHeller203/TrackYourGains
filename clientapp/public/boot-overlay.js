(function () {
    var show = false;
    try {
        var u = new URL(location.href);
        show = u.searchParams.get('debugErrors') === '1' || localStorage.getItem('tyg_debug_errors') === 'true';
    } catch (e) { }

    function ensureRoot() {
        var root = document.getElementById('__tyg_boot_overlay__');
        if (root) return root;
        root = document.createElement('div');
        root.id = '__tyg_boot_overlay__';
        root.style.position = 'fixed';
        root.style.inset = '0';
        root.style.zIndex = '2147483647';
        root.style.background = 'rgba(0,0,0,.92)';
        root.style.color = '#fff';
        root.style.fontFamily = 'ui-monospace, Menlo, Monaco, Consolas, "Courier New", monospace';
        root.style.fontSize = '12px';
        root.style.padding = '12px';
        root.style.overflow = 'auto';
        root.style.whiteSpace = 'pre-wrap';
        root.textContent = 'TYG Boot Error Overlay (debugErrors=1)\n\n';
        document.documentElement.appendChild(root);
        return root;
    }

    function append(title, err) {
        if (!show) return;
        var root = ensureRoot();
        var msg = '\n[' + new Date().toISOString() + '] ' + title + '\n' + String(err && err.stack ? err.stack : err);
        root.textContent += msg + '\n';
    }

    window.addEventListener('error', function (ev) {
        append('window.error', ev.error || ev.message || ev);
    });

    window.addEventListener('unhandledrejection', function (ev) {
        append('unhandledrejection', ev.reason || ev);
    });
})();
