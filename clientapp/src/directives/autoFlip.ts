import type { Directive, DirectiveBinding } from 'vue';

type Options = {
    trigger?: HTMLElement | null;                 // Anker-Element (Button etc.)
    margin?: number;                               // Abstand zu Kanten und Trigger
    strategy?: 'fixed' | 'absolute';               // Positionierungsstrategie
    align?: 'start' | 'center' | 'end';            // Horizontale Ausrichtung
};

type Instance = {
    update: () => void;
    destroy: () => void;
};

type ElEx = HTMLElement & { __autoFlip?: Instance };

const vAutoFlip: Directive<ElEx, Options> = {
    mounted(el: ElEx, binding: DirectiveBinding<Options>) {
        let ignoreMut = false;

        const opts: Required<Options> = {
            trigger: binding.value?.trigger ?? null,
            margin: binding.value?.margin ?? 8,
            strategy: binding.value?.strategy ?? 'fixed',
            align: binding.value?.align ?? 'start',
        };

        const getTrigger = (): HTMLElement | null => {
            const toastHost = el.closest('.toast') as HTMLElement | null;
            if (toastHost && document.contains(toastHost)) return toastHost;
            if (opts.trigger && document.contains(opts.trigger)) return opts.trigger;
            return (el.previousElementSibling as HTMLElement | null) ?? null;
        };

        // interner Update-Runner
        const update = () => {
            const trigger = getTrigger();
            if (!trigger) return;

            // Element muss sichtbar sein, sonst sind Ma�e 0
            const wasHidden = getComputedStyle(el).display === 'none' || el.hidden;
            if (wasHidden) return;

            const viewW = window.innerWidth;
            const viewH = window.innerHeight;

            const tr = trigger.getBoundingClientRect();

            // kurz sichtbar stellen, falls opacity:0 verwendet wird
            const prevPos = el.style.position;
            const prevVis = el.style.visibility;
            el.style.position = opts.strategy;
            el.style.visibility = 'hidden';

            // erst jetzt messen (nach Position-Set)
            const menuW = el.offsetWidth;
            const menuH = el.offsetHeight;

            const spaceBelow = viewH - tr.bottom;
            const spaceAbove = tr.top;

            const placeBottom = spaceBelow >= menuH + opts.margin || spaceBelow >= spaceAbove;

            // horizontale Ausrichtung
            let left = tr.left;
            if (opts.align === 'center') left = tr.left + tr.width / 2 - menuW / 2;
            if (opts.align === 'end') left = tr.right - menuW;

            // clamp an Viewport
            left = Math.min(Math.max(left, opts.margin), viewW - menuW - opts.margin);

            // vertikale Platzierung
            const top = placeBottom
                ? Math.min(tr.bottom + opts.margin, viewH - menuH - opts.margin)
                : Math.max(tr.top - menuH - opts.margin, opts.margin);

            // anwenden
            ignoreMut = true;
            try {
                el.style.position = opts.strategy;
                el.style.top = `${Math.round(top)}px`;
                el.style.left = `${Math.round(left)}px`;
                el.style.visibility = prevVis || '';

                el.classList.toggle('menu--bottom', placeBottom);
                el.classList.toggle('menu--top', !placeBottom);
                el.setAttribute('data-placement', placeBottom ? 'bottom' : 'top');
            } finally {
                // im n�chsten Frame wieder erlauben ? verhindert Endlosschleifen
                requestAnimationFrame(() => { ignoreMut = false; });
            }

            // restore position fallback (falls n�tig)
            if (opts.strategy === 'absolute' && !prevPos) {
                el.style.removeProperty('position');
            }
        };

        const onScroll = () => update();
        const onResize = () => update();

        // reagiert auf Gr��en�nderungen des Men�s (auch beim �ffnen)
        const ro = new ResizeObserver(() => update());
        ro.observe(el);

        // global neu positionieren
        window.addEventListener('resize', onResize, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true, capture: true });

        const mo = new MutationObserver(() => {
            if (ignoreMut) return;
            requestAnimationFrame(update);
        });
        mo.observe(el, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });

        // initial versuchen (n�chstes Frame)
        requestAnimationFrame(update);

        el.__autoFlip = {
            update,
            destroy() {
                ro.disconnect();
                mo.disconnect();
                window.removeEventListener('scroll', onScroll, true);
                window.removeEventListener('resize', onResize);
            },
        };
    },

    updated(el: ElEx) {
        el.__autoFlip?.update();
    },

    unmounted(el: ElEx) {
        el.__autoFlip?.destroy();
        delete el.__autoFlip;
    },
};

export default vAutoFlip;
