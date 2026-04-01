<template>
    <BasePopup
        :show="show"
        :title="hasUsername ? 'Username aendern' : 'Username hinzufuegen'"
        variant="username-change-popup"
        @cancel="$emit('cancel')">
        <div class="form-grid">
            <label class="label">Username</label>
            <input
                ref="usernameRef"
                v-model.trim="nextUsername"
                type="text"
                :class="['input', { 'has-error': !!errors.username }]"
                :placeholder="hasUsername ? 'Neuer Username' : 'Username hinzufuegen'"
                @keydown.enter.prevent="onSave" />

            <p v-if="errors.username" class="form-error">{{ errors.username }}</p>
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
    import { computed, nextTick, ref, watch } from 'vue'
    import BasePopup from '../BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'

    const props = defineProps<{ show: boolean; currentUsername: string }>()
    const emit = defineEmits<{ (e: 'cancel'): void; (e: 'save', payload: { username: string }): void }>()

    const nextUsername = ref('')
    const errors = ref({ username: '' })
    const usernameRef = ref<HTMLInputElement | null>(null)
    const hasUsername = computed(() => !!props.currentUsername.trim())

    watch(() => props.show, async (open) => {
        if (!open) return
        errors.value.username = ''
        nextUsername.value = props.currentUsername
        await nextTick()
        usernameRef.value?.focus()
        usernameRef.value?.select()
    })

    function onSave() {
        const username = nextUsername.value.trim()
        if (!username) {
            errors.value.username = 'Bitte einen Username eingeben.'
            return
        }

        errors.value.username = ''
        emit('save', { username })
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
