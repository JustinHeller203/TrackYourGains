<template>
    <div class="card card--crazy"
         :style="{ cursor: clickable ? 'pointer' : 'default' }"
         :tabindex="clickable ? 0 : undefined"
         :role="clickable ? 'button' : undefined"
         @click="handleClick"
@keydown.enter="handleClick">
         <span class="accent" aria-hidden="true"></span>

        <h3 class="card-title">{{ title }}</h3>
        <p class="card-info"
           :class="[{
     'is-muted': isMuted || props.muted,
     'is-compact': props.compact && !(props.title?.toString().toLowerCase().includes('zielgewicht'))
   }]">
            <slot>{{ info }}</slot>
        </p>

    </div>
</template>

<script setup lang="ts">
    import { computed, useSlots } from 'vue'

    const props = defineProps<{
        title: string
        info?: string | number
        clickable?: boolean
        /** erzwingt den unauffälligen (kleineren) Placeholder-Style */
        muted?: boolean
        /** macht den Wert generell kleiner (auch wenn NICHT muted) */
        compact?: boolean
    }>()

    const emit = defineEmits<{ (e: 'click'): void }>()
    const handleClick = () => { if (props.clickable) emit('click') }

    const slots = useSlots()
    const isMuted = computed(() => {
        const t = (props.title ?? '').toString().toLowerCase()
        const raw = props.info
        const s = (raw === undefined || raw === null) ? '' : String(raw).trim().toLowerCase()

        // generische Platzhalter
        if (!s || s === '0' || s === '-' || s === '—' || s === 'n/a') return true
        if (s.includes('kein') || s.includes('nicht erfasst') || s.includes('nicht gesetzt')) return true

        // kcal: "0/2500 kcal", "0 kcal", "0 / 2500"
        if (/^0\s*(\/\s*\d+)?\s*kcal\b/.test(s)) return true
        if (/^0\s*\/\s*\d+/.test(s)) return true

        // Zielgewicht: fehlender/platzhalter Wert (kein Digit) oder explizit "kein ..."
        if (t.includes('zielgewicht')) {
            if (!/\d/.test(s)) return true                // kein Zahlwert -> Platzhalter
            // 0 kg / 0.0 kg / 0kg
            if (/^0+(?:[.,]\d+)?\s*kg\b/.test(s)) return true
        }

        // Training: "kein training erfasst" etc.
        if (t.includes('training') && s.includes('kein')) return true

        return false
    })


</script>

<style scoped>
    /* Crazy-Modern ohne Tilt: Stripe + Grid + Shine */
    .card {
        --radius: 16px;
        --pad-x: 1.25rem;
        --pad-y: 1rem;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: .45rem;
        flex: 1;
        min-width: 220px;
        padding: var(--pad-y) var(--pad-x);
        border-radius: var(--radius);
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow);
        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
        overflow: hidden;
    }

    /* Top-Stripe mit animierter Gradient-Bewegung */
    .card--crazy .accent {
        position: absolute;
        inset: 0 0 auto 0;
        height: 3px;
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        background-size: 200% 100%;
        animation: stripe-move 3s linear infinite;
    }

    @keyframes stripe-move {
        0% {
            background-position: 0% 50%;
        }

        100% {
            background-position: 200% 50%;
        }
    }
    .card-info.is-muted {
        font-size: clamp(1.0rem, 1.2vw + .55rem, 1.25rem);
        font-weight: 600;
        letter-spacing: 0;
        color: var(--text-secondary);
        opacity: .85;
    }
    /* Subtile Pattern-/Noise-Layer */
    .card--crazy::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
        /* Soft vignette */
        radial-gradient(1200px 300px at -20% -20%, color-mix(in oklab, var(--accent-primary) 10%, transparent), transparent 60%),
        /* Repeating grid */
        repeating-linear-gradient(45deg, color-mix(in oklab, var(--accent-primary) 14%, transparent) 0 2px, transparent 2px 12px);
        opacity: .08;
        pointer-events: none;
    }


    @keyframes sweep {
        0% {
            transform: translateX(-30%) rotate(20deg);
        }

        100% {
            transform: translateX(30%) rotate(20deg);
        }
    }

    /* Typo – brutal klare Hierarchie */
    .card-title {
        margin: .25rem 0 0 0;
        font-size: .85rem;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--text-secondary);
    }

    .card-info * {
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        letter-spacing: inherit;
        line-height: inherit;
        color: inherit;
    }

    /* Motion-Respect */
    @media (prefers-reduced-motion: reduce) {
        .card, .card--crazy .shine {
            transition: none;
            animation: none;
        }

        .card--crazy:hover {
            transform: none;
        }
    }
    /* Smooth Lift + Subtle Tint + Pattern-Shift */
    .card--crazy:hover {
        transform: translateY(-2px) scale(1.01);
        box-shadow: var(--shadow-hover);
        border-color: color-mix(in oklab, var(--accent-primary) 28%, var(--border-color));
        background: linear-gradient(0deg, color-mix(in oklab, var(--accent-primary) 6%, transparent), transparent 45%), var(--bg-card);
        filter: saturate(1.03);
    }

        /* Grid/Noise minimal anheben für “alive”-Gefühl */
        .card--crazy:hover::before {
            opacity: .12;
            background: radial-gradient(1200px 300px at -20% -20%, color-mix(in oklab, var(--accent-primary) 14%, transparent), transparent 60%), repeating-linear-gradient(45deg, color-mix(in oklab, var(--accent-primary) 18%, transparent) 0 2px, transparent 2px 12px);
        }

    /* Accent-Stripe reagiert dezent (ohne Spiegel) */
    .card--crazy .accent {
        height: 3px;
    }

    .card--crazy:hover .accent {
        height: 4px;
        background-size: 220% 100%;
    }

    /* Falls du im Slot eigene Placeholder markierst */
    .card-info :is(.is-muted, .muted, .placeholder) {
        font-size: clamp(1.0rem, 1.2vw + .55rem, 1.25rem);
        font-weight: 600;
        color: var(--text-secondary);
        opacity: .85;
    }
    /* smoother, subtiler Hover */
.card {
  transition:
    transform .22s cubic-bezier(.22,.61,.36,1),
    box-shadow .22s cubic-bezier(.22,.61,.36,1),
    border-color .22s ease,
    background .22s ease,
    filter .22s ease;
}

.card--crazy .accent { transition: height .22s ease, background-size .22s ease; }

.card--crazy:hover {
  transform: translateY(-1px) scale(1.006);
  box-shadow: var(--shadow-hover);
  border-color: color-mix(in oklab, var(--accent-primary) 22%, var(--border-color));
  background:
    linear-gradient(0deg, color-mix(in oklab, var(--accent-primary) 4%, transparent), transparent 55%),
    var(--bg-card);
  filter: saturate(1.01) contrast(1.01);
}

.card--crazy:hover::before {
  opacity: .10;
  background:
    radial-gradient(1200px 300px at -20% -20%, color-mix(in oklab, var(--accent-primary) 12%, transparent), transparent 60%),
    repeating-linear-gradient(45deg,
      color-mix(in oklab, var(--accent-primary) 16%, transparent) 0 2px,
      transparent 2px 12px);
}

.card--crazy:hover .accent {
  height: 3.5px;
  background-size: 210% 100%;
}
    .card-info.is-compact {
        font-size: clamp(1.15rem, 1.6vw + .6rem, 1.65rem);
        font-weight: 800;
        letter-spacing: -0.01em;
    }

</style>
