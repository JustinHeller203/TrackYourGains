<!--Pfad: components/ui/popups/ExportPopup.vue-->

<template>
    <BasePopup :show="show"
               title="Daten exportieren"
               variant="export-popup"
               @cancel="$emit('cancel')">
        <template #default>
            <div class="export-shell">
                <div class="export-card">
                    <div class="export-card-head">
                        <div class="export-card-title">Aktion</div>
                        <div class="export-card-sub">Wähle, was am Ende passieren soll</div>
                    </div>

                    <div class="export-mode" role="group" aria-label="Aktion wählen">
                        <button type="button"
                                class="export-mode-btn"
                                :class="{ active: exportMode === 'file' }"
                                @click="exportMode = 'file'">
                            ⬇️ Download
                        </button>

                        <button type="button"
                                class="export-mode-btn"
                                :class="{ active: exportMode === 'share' }"
                                @click="exportMode = 'share'">
                            🚀 Teilen
                        </button>
                    </div>


                    <div v-if="exportMode === 'share'" class="share-preview">
                        <UiPopupInput label="Vorschau (wird kopiert)"
                                      as="textarea"
                                      :rows="7"
                                      :readonly="true"
                                      :modelValue="sharePreview" />
                    </div>

                    <div class="export-hint" role="note" aria-live="polite">
                        <span v-if="exportMode === 'file'">Speichert eine Datei auf deinem Gerät.</span>
                        <span v-else>Legt den Export in deine Zwischenablage.</span>
                    </div>
                </div>

                <div v-if="exportMode === 'file'" class="export-card">
                    <div class="export-card-head">
                        <div class="export-card-title">Format</div>
                        <div class="export-card-sub">Wähle den Dateityp / Inhalt</div>
                    </div>

                    <div class="export-field">
                        <UiPopupSelect id="export-format"
                                       ref="sel"
                                       label="Dateityp"
                                       placeholder="Format auswählen"
                                       v-model="proxy"
                                       :options="[
            { label: 'PDF (Druck)', value: 'pdf' },
            { label: 'HTML', value: 'html' },
            { label: 'CSV (Excel)', value: 'csv' },
            { label: 'JSON (für Apps)', value: 'json' },
            { label: 'TXT (Text)', value: 'txt' },
          ]" />
                    </div>
                </div>
            </div>
        </template>
        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                Abbrechen
            </PopupActionButton>

            <PopupActionButton autofocus
                               @click="$emit('confirm', { format: proxy, mode: exportMode })">
                {{ exportMode === 'share' ? 'Teilen kopieren' : 'Download' }}
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, nextTick, ref, watch } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'

    type Focusable = { focus: () => void }

    type Fmt = 'html' | 'pdf' | 'csv' | 'json' | 'txt'

    type ExportMode = 'file' | 'share'
    const exportMode = ref<ExportMode>('file')

    // Wenn Share aktiv ist, macht Format keinen Sinn → erzwingen wir "txt"
    watch(exportMode, (m) => {
        if (m === 'share' && proxy.value !== 'txt') {
            emit('update:modelValue', 'txt')
        }
    })

    const props = defineProps<{
        show: boolean
        modelValue: Fmt

        // optional overrides fürs Teilen
        shareText?: string
        shareLines?: string[]
        shareUrl?: string
    }>()

    const sharePreview = computed(() => {
        // 1) volle Kontrolle: Lines direkt liefern
        const lines =
            Array.isArray(props.shareLines) && props.shareLines.length
                ? props.shareLines
                : null

        if (lines) return lines.join("\n")

        // 2) “Text + URL” override
        const url = (props.shareUrl ?? "https://trackyourgains.de").trim()
        const text = (props.shareText ?? "").trim()

        if (text) {
            return [text, url].filter(Boolean).join("\n")
        }

        // 3) fallback (dein Standard)
        return [
            "🔥 Ich hab dir was in TrackYourGains geschickt.",
            "👉 Öffnen & direkt loslegen:",
            "https://trackyourgains.de",
            "",
            "Geh zur Website und schau was passiert! — macht Planung & Progress so viel cleaner 💪"
        ].join("\n")
    })
    

    const emit = defineEmits<{
        (e: 'update:modelValue', v: Fmt): void
        (e: 'confirm', payload: { format: Fmt; mode: ExportMode }): void
        (e: 'cancel'): void
    }>()

    watch(() => props.show, (open) => {
        if (!open) return
        exportMode.value = 'file'
    })

    const proxy = computed<Fmt>({
        get: () => props.modelValue,
        set: (v) => emit('update:modelValue', v as Fmt)
    })

    const formatLabel = (f: Fmt) =>
        ({ pdf: 'PDF', html: 'HTML', csv: 'CSV', json: 'JSON', txt: 'TXT' } as const)[f]

    const primaryLabel = computed(() => {
        const act = exportMode.value === 'share' ? 'Kopieren' : 'Download'
        return `${act} ${formatLabel(proxy.value)}`
    })

    const sel = ref<Focusable | null>(null)
    watch(() => props.show, async (open) => {
        if (open) {
            await nextTick()
            sel.value?.focus()
        }
    })


</script>
<style scoped>
    .export-mode {
        display: inline-flex;
        gap: .4rem;
        padding: .3rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        margin-bottom: .85rem;
    }

    .export-mode-btn {
        height: 40px;
        padding: 0 .9rem;
        border-radius: 10px;
        border: 0;
        background: transparent;
        color: var(--text-primary);
        font-weight: 700;
        opacity: .85;
        cursor: pointer;
    }

        .export-mode-btn.active {
            opacity: 1;
            border: 1px solid rgba(129, 140, 248, 0.55);
            background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 14%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 88%, white 12%);
        }

    .export-hint {
        margin: 0 0 .9rem;
        font-size: .85rem;
        opacity: .85;
    }

    .export-shell {
        display: flex;
        flex-direction: column;
        gap: .9rem;
    }

    .export-card {
        padding: 1rem 1rem .95rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14);
    }

    .export-card-head {
        margin-bottom: .7rem;
    }

    .export-card-title {
        font-weight: 800;
        letter-spacing: .2px;
    }

    .export-card-sub {
        margin-top: .15rem;
        font-size: .85rem;
        opacity: .78;
    }

    .export-mode {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: .45rem;
        padding: .35rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
    }

    .export-mode-btn {
        width: 100%;
        height: 44px;
        padding: 0 .9rem;
        border-radius: 12px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--text-primary);
        font-weight: 800;
        opacity: .88;
        cursor: pointer;
        transition: transform .12s ease, opacity .12s ease, border-color .12s ease, background .12s ease;
    }

        .export-mode-btn:active {
            transform: scale(.99);
        }

        .export-mode-btn.active {
            opacity: 1;
            border-color: rgba(129, 140, 248, 0.55);
            background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 86%, white 14%);
        }

    .export-hint {
        margin-top: .7rem;
        padding: .75rem .85rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.20);
        font-size: .85rem;
        opacity: .9;
    }

    .export-field {
        margin-top: .15rem;
    }
</style>