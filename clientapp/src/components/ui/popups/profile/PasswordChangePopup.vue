<template>
    <BasePopup
        :show="show"
        title="Passwort aendern"
        variant="password-change-popup"
        @cancel="$emit('cancel')">
        <div class="form-grid">
            <label class="label">Aktuelles Passwort</label>
            <input
                ref="currentRef"
                v-model="form.current"
                type="password"
                :class="['input', { 'has-error': !!errors.current }]"
                placeholder="********"
                @keydown.enter.prevent="onSave" />
            <p v-if="errors.current" class="form-error">{{ errors.current }}</p>

            <label class="label">Neues Passwort</label>
            <input
                v-model="form.next"
                type="password"
                :class="['input', { 'has-error': !!errors.next }]"
                placeholder="Mind. 8 Zeichen"
                @keydown.enter.prevent="onSave" />
            <p v-if="errors.next" class="form-error">{{ errors.next }}</p>

            <label class="label">Neues Passwort (wiederholen)</label>
            <input
                v-model="form.repeat"
                type="password"
                :class="['input', { 'has-error': !!errors.repeat }]"
                placeholder="Noch einmal eingeben"
                @keydown.enter.prevent="onSave" />
            <p v-if="errors.repeat" class="form-error">{{ errors.repeat }}</p>
        </div>

        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                Abbrechen
            </PopupActionButton>

            <PopupActionButton autofocus @click="onSave">
                Speichern
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { ref, watch, nextTick } from 'vue'
    import BasePopup from '../BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'

    const props = defineProps<{ show: boolean }>()

    const emit = defineEmits<{
        (e: 'cancel'): void;
        (e: 'save', payload: { current: string; next: string; repeat: string }): void;
    }>()

    const form = ref({ current: '', next: '', repeat: '' })
    const errors = ref({ current: '', next: '', repeat: '' })
    const currentRef = ref<HTMLInputElement | null>(null)

    watch(
        () => props.show,
        async (open) => {
            if (!open) return
            form.value = { current: '', next: '', repeat: '' }
            errors.value = { current: '', next: '', repeat: '' }
            await nextTick()
            currentRef.value?.focus()
        }
    )

    function onSave() {
        const { current, next, repeat } = form.value
        errors.value = { current: '', next: '', repeat: '' }

        if (!current) errors.value.current = 'Bitte aktuelles Passwort eingeben.'
        if (!next) errors.value.next = 'Bitte neues Passwort eingeben.'
        if (!repeat) errors.value.repeat = 'Bitte neues Passwort wiederholen.'

        if (errors.value.current || errors.value.next || errors.value.repeat) return

        if (next.length < 8) {
            errors.value.next = 'Neues Passwort muss mindestens 8 Zeichen haben.'
            return
        }

        if (next !== repeat) {
            errors.value.repeat = 'Passwoerter stimmen nicht ueberein.'
            return
        }

        emit('save', { current, next, repeat })
    }
</script>

<style scoped>
    .form-grid {
        display: grid;
        gap: 0.6rem;
    }

    .label {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    .input {
        width: 100%;
        padding: 0.6rem 0.7rem;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .input.has-error {
        border-color: rgba(239, 68, 68, 0.88);
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
    }

    .form-error {
        margin-top: 0.2rem;
        color: rgba(220, 38, 38, 0.95);
        font-size: 0.9rem;
    }
</style>
