<template>
    <BasePopup :show="show"
               :title="title"
               overlayClass="save-generic-popup">
        <div class="save-body">
            <div v-if="src !== undefined" class="preview" aria-label="Vorschau">
                <img v-if="src" :src="src" alt="Vorschau" />
                <div v-else class="empty">Kein Bild</div>
            </div>

            <p v-if="hint" class="hint">{{ hint }}</p>

            <slot />
        </div>

        <template #actions>
            <PopupCancelButton :aria-label="cancelText" @click="$emit('cancel')">
                {{ cancelText }}
            </PopupCancelButton>
            <PopupSaveButton :aria-label="saveText" @click="$emit('confirm')">
                {{ saveText }}
            </PopupSaveButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupSaveButton from '@/components/ui/buttons/popup/PopupSaveButton.vue'
    import PopupCancelButton from '@/components/ui/buttons/popup/PopupCancelButton.vue'

    withDefaults(defineProps<{
        show: boolean
        src?: string | null          // optional: zeigt runde Bildvorschau, wenn gesetzt
        title?: string
        hint?: string
        cancelText?: string
        saveText?: string
    }>(), {
        title: 'Speichern?',
        hint: '',
        cancelText: 'Abbrechen',
        saveText: 'Speichern',
    })

    defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
</script>

<style scoped>
    .save-body {
        display: grid;
        gap: 0.9rem;
        justify-items: center;
        text-align: center;
    }

    .preview {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        border: 2px solid var(--border-color);
        overflow: hidden; /* wichtig f�rs runde Clipping */
        background: var(--bg-secondary);
        box-shadow: 0 4px 12px rgba(0,0,0,.15);
    }

        .preview img {
            width: 100%;
            height: 100%;
            object-fit: cover; /* damit nichts �rausl�uft� */
            object-position: center;
            display: block;
        }

    .empty {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
        color: var(--text-secondary);
        font-weight: 600;
    }

    .hint {
        margin: 0;
        font-size: .95rem;
        color: var(--text-secondary);
    }
</style>
