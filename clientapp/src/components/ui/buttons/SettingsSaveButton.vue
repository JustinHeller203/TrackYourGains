<template>
    <button class="save-button"
            type="button"
            :disabled="disabled"
            :title="title || 'Einstellungen speichern'"
            @click="$emit('click')">
        <slot>?? Einstellungen speichern</slot>
    </button>
</template>

<script setup lang="ts">
    defineProps<{
        disabled?: boolean
        title?: string
    }>()

    defineEmits<{
        (e: 'click'): void
    }>()
</script>

<style scoped>
    .save-button {
        position: relative;
        overflow: hidden; /* f�r den Sheen */
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        background-size: 200% 200%; /* f�r sp�rbaren Shift */
        background-position: 0% 50%;
        color: #ffffff;
        border: none;
        border-radius: 16px;
        padding: 1rem 2.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: var(--shadow);
        transition: background-position .35s ease, filter .25s ease, box-shadow .25s ease, outline-color .25s ease;
    }

        /* St�rkerer, dauerhafter Hover-Eindruck */
        .save-button:hover {
            background-position: 100% 50%; /* sichtbarer Verlaufsshift */
            filter: brightness(1.12) saturate(1.12); /* kr�ftigeres Leuchten */
            box-shadow: var(--shadow-hover), 0 8px 22px rgba(0,0,0,.12); /* extra Tiefenwurf */
            outline: 3px solid var(--accent-primary); /* feiner Ring */
            outline-offset: 3px;
        }

        /* Optional: aktiver Klick leicht andeuten */
        .save-button:active {
            filter: brightness(1.05) saturate(1.08);
        }

        /* �Sheen� Lichtreflex � bleibt w�hrend Hover sichtbar durch leichte Wiederholung */
        .save-button::after {
            content: '';
            position: absolute;
            inset: -120% -40%;
            background: linear-gradient( 60deg, transparent 35%, rgba(255,255,255,.25) 50%, transparent 65% );
            transform: translateX(-60%);
            opacity: 0;
            pointer-events: none;
            transition: opacity .2s ease;
        }

        .save-button:hover::after {
            opacity: 1;
        }

    @keyframes sheen {
        to {
            transform: translateX(60%);
        }
    }

    /* Dark Mode Varianten � behalten den kr�ftigen Effekt */
    html.dark-mode .save-button {
        background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
    }

        html.dark-mode .save-button:hover {
            outline-color: #6B8DD6;
        }
</style>
