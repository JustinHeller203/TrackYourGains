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
    setOptions: (next: Partial<Required<Options>>) => void;
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
            // Teleport-safe: zuerst expliziten Trigger nehmen
            if (opts.trigger && document.contains(opts.trigger)) return opts.trigger;

            // Fallback nur wenn NICHT teleported / im Toast-Tree
            const toastHost = el.closest('.toast') as HTMLElement | null;
            if (toastHost && document.contains(toastHost)) return toastHost;

            // KEIN previousElementSibling-Fallback (bei Teleport komplett random)
            return null;
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
                el.style.visibility = 'visible';

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
            setOptions(next) {
                // opts ist das Objekt aus mounted() (closure) -> mutierbar
                if (next.trigger !== undefined) opts.trigger = next.trigger;
                if (next.margin !== undefined) opts.margin = next.margin;
                if (next.strategy !== undefined) opts.strategy = next.strategy;
                if (next.align !== undefined) opts.align = next.align;
            },
            destroy() {
                ro.disconnect();
                mo.disconnect();
                window.removeEventListener('scroll', onScroll, true);
                window.removeEventListener('resize', onResize);
            },
        };
    },

    updated(el: ElEx, binding: DirectiveBinding<Options>) {
        const v = binding.value ?? {};
        el.__autoFlip?.setOptions({
            trigger: v.trigger ?? null,
            margin: v.margin ?? 8,
            strategy: v.strategy ?? 'fixed',
            align: v.align ?? 'start',
        });
        el.__autoFlip?.update();
    },
    unmounted(el: ElEx) {
        el.__autoFlip?.destroy();
        delete el.__autoFlip;
    },
};

export default vAutoFlip;
