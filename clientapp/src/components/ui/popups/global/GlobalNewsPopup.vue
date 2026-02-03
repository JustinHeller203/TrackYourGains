<template>
    <BasePopup :show="show"
               :title="title || 'Was ist neu?'"
               overlay-class="global-news-popup"
               :show-actions="true"
               cancel-text="Später"
               save-text="Ok, verstanden"
               @cancel="onCancel"
               @save="onSave">

        <div class="gnp-kicker">Neuigkeiten</div>

        <ul class="gnp-list">
            <li v-for="(it, idx) in items" :key="idx" class="gnp-item">
                <span v-if="it.tag" class="gnp-tag">{{ it.tag }}</span>
                <span class="gnp-text">
                    <strong class="gnp-text-title">{{ splitNews(it.text).title }}</strong>
                    <span v-if="splitNews(it.text).rest" class="gnp-text-rest">{{ splitNews(it.text).rest }}</span>
                </span>
            </li>
        </ul>

        <label class="gnp-check">
            <input type="checkbox" v-model="dontShow" />
            Nicht mehr anzeigen (für diese Version)
        </label>
    </BasePopup>
</template>


<script setup lang="ts">
    import { ref, watch } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'

    type NewsItem = { tag?: string; text: string }

    const props = defineProps<{
        show: boolean
        title?: string
        items: NewsItem[]
    }>()

    const emit = defineEmits<{
        (e: 'close', payload: { action: 'cancel' | 'save'; dontShowAgain: boolean }): void
    }>()

    const dontShow = ref(false)

    watch(() => props.show, (open) => {
        if (open) dontShow.value = false
    })

    function splitNews(raw: string) {
        const t = (raw ?? '').trim()

        // Split an erster Punkt oder an " – "
        const dot = t.indexOf('. ')
        const dash = t.indexOf(' – ')

        let cut = -1
        if (dot !== -1) cut = dot + 1
        if (dash !== -1 && (cut === -1 || dash < cut)) cut = dash

        if (cut === -1) return { title: t, rest: '' }

        const title = t.slice(0, cut).trim()
        const rest = t.slice(cut).trim().replace(/^–\s*/, '')
        return { title, rest }
    }

    function onCancel() {
        emit('close', { action: 'cancel', dontShowAgain: false })
    }

    function onSave() {
        emit('close', { action: 'save', dontShowAgain: !!dontShow.value })
    }
</script>

<style>
    /* Overlay-Class kommt von BasePopup: <div class="popup-overlay ..."> */
    .popup-overlay.global-news-popup {
        background: rgba(2, 6, 23, 0.55);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

        /* Card */
        .popup-overlay.global-news-popup .popup {
            width: min(560px, 92vw);
        }

        /* Titel etwas kompakter */
        .popup-overlay.global-news-popup .popup-title {
            text-align: left;
            padding: 1.25rem 1.25rem 1rem;
        }

        /* Body */
        .popup-overlay.global-news-popup .popup-body {
            padding: 0.9rem 1.25rem 1.1rem;
        }

        /* Kicker */
        .popup-overlay.global-news-popup .gnp-kicker {
            font-size: .75rem;
            opacity: .85;
            letter-spacing: .02em;
            margin-bottom: .65rem;
        }

        /* Liste */
        .popup-overlay.global-news-popup .gnp-list {
            margin: 0 0 12px;
            padding: 0;
            list-style: none;
            display: grid;
            gap: 10px;
        }

        .popup-overlay.global-news-popup .gnp-item {
            display: flex;
            gap: 10px;
            align-items: flex-start;
            padding: 10px 10px;
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.18);
            background: rgba(255,255,255,.02);
        }

        .popup-overlay.global-news-popup .gnp-tag {
            flex: 0 0 auto;
            font-size: .75rem;
            padding: 3px 8px;
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.28);
            opacity: .9;
            white-space: nowrap;
        }

        .popup-overlay.global-news-popup .gnp-text {
            flex: 1;
            line-height: 1.35;
            font-size: .92rem;
            word-break: break-word;
        }

        /* Checkbox */
        .popup-overlay.global-news-popup .gnp-check {
            display: flex;
            gap: 10px;
            align-items: center;
            font-size: .85rem;
            opacity: .9;
            user-select: none;
        }

        /* Actions: BasePopup Buttons kannst du (optional) optisch anpassen */
        .popup-overlay.global-news-popup .popup-actions {
            padding: 0.9rem 1.25rem 1.1rem;
        }

        /* === Buttons (BasePopup) === */
        .popup-overlay.global-news-popup .popup-btn {
            appearance: none;
            border: 1px solid rgba(148, 163, 184, 0.28);
            border-radius: 12px;
            padding: 10px 12px;
            cursor: pointer;
            font-weight: 800;
            font-size: .9rem;
            letter-spacing: .01em;
            transition: transform .06s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease;
            background: rgba(255,255,255,.02);
            color: var(--text-primary, #111827);
        }

    html.dark-mode .popup-overlay.global-news-popup .popup-btn {
        color: #f0f6fc;
        background: rgba(255,255,255,.04);
        border-color: rgba(148, 163, 184, 0.34);
    }

    .popup-overlay.global-news-popup .popup-btn:active {
        transform: translateY(1px);
    }

    /* Später = Ghost */
    .popup-overlay.global-news-popup .popup-btn.cancel-btn:hover {
        background: rgba(0,0,0,.06);
        border-color: rgba(148, 163, 184, 0.45);
    }

    html.dark-mode .popup-overlay.global-news-popup .popup-btn.cancel-btn:hover {
        background: rgba(255,255,255,.06);
        border-color: rgba(148, 163, 184, 0.55);
    }

    /* Ok, verstanden = Primary */
    .popup-overlay.global-news-popup .popup-btn.save-btn {
        border-color: rgba(99, 102, 241, 0.55);
        background: linear-gradient( 135deg, color-mix(in srgb, var(--accent-primary, #6366f1) 22%, transparent), color-mix(in srgb, var(--accent-secondary, #22c55e) 16%, transparent) );
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
    }

        .popup-overlay.global-news-popup .popup-btn.save-btn:hover {
            border-color: rgba(99, 102, 241, 0.85);
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.30);
            filter: saturate(1.05);
        }

    html.dark-mode .popup-overlay.global-news-popup .popup-btn.save-btn {
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55);
    }

    .popup-overlay.global-news-popup .popup-btn.save-btn:focus-visible,
    .popup-overlay.global-news-popup .popup-btn.cancel-btn:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--accent-primary, #6366f1) 70%, #fff 30%);
        outline-offset: 2px;
    }

    /* mehr "premium" feel */
    .popup-overlay.global-news-popup .popup {
        width: min(640px, 94vw);
    }

    /* Body: bisschen mehr Luft */
    .popup-overlay.global-news-popup .popup-body {
        padding: 1rem 1.25rem 1.15rem;
    }

    /* Liste: scrollt statt den Screen zu sprengen */
    .popup-overlay.global-news-popup .gnp-list {
        max-height: min(52vh, 420px);
        overflow: auto;
        padding-right: 6px; /* damit scrollbar nicht am Text klebt */
    }

    /* Item: wie kleine Cards */
    .popup-overlay.global-news-popup .gnp-item {
        position: relative;
        padding: 12px 12px;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-card) 88%, #0b1220 12%);
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.16);
    }

        /* linke Accent-Leiste */
        .popup-overlay.global-news-popup .gnp-item::before {
            content: "";
            position: absolute;
            left: 10px;
            top: 12px;
            bottom: 12px;
            width: 3px;
            border-radius: 999px;
            background: rgba(99, 102, 241, 0.55);
            opacity: .9;
        }

    html.dark-mode .popup-overlay.global-news-popup .gnp-item {
        background: rgba(2, 6, 23, 0.72);
        border-color: rgba(148, 163, 184, 0.32);
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.45);
    }

    /* Text: Titel + Rest */
    .popup-overlay.global-news-popup .gnp-text {
        display: grid;
        gap: 4px;
    }

    .popup-overlay.global-news-popup .gnp-text-title {
        font-size: .95rem;
        line-height: 1.25;
        letter-spacing: .01em;
    }

    .popup-overlay.global-news-popup .gnp-text-rest {
        font-size: .88rem;
        line-height: 1.35;
        opacity: .85;
    }

    /* Tag: besser sichtbar + Varianten */
    .popup-overlay.global-news-popup .gnp-tag {
        font-weight: 800;
        letter-spacing: .01em;
        background: rgba(255,255,255,.03);
    }

    /* Farb-Varianten nach Tag-Text */
    .popup-overlay.global-news-popup .gnp-tag {
        border-color: rgba(148, 163, 184, 0.28);
    }

        .popup-overlay.global-news-popup .gnp-tag:where(:contains("Neu")) {
        }

        .popup-overlay.global-news-popup .gnp-tag:where(:contains("Fix")) {
        }

        .popup-overlay.global-news-popup .gnp-tag:where(:contains("Update")) {
        }

        .popup-overlay.global-news-popup .gnp-tag:where(:contains("UI")) {
        }

    /* (CSS kann kein contains zuverlässig – deshalb machen wir’s über Klassen, wenn du willst.
   Quick-win: wir geben den Tags einfach generell mehr Kontrast) */

    /* Checkbox: mehr „call to action“ */
    .popup-overlay.global-news-popup .gnp-check {
        margin-top: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(255,255,255,.02);
    }

</style>

