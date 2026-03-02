<template>
    <BasePopup :show="show"
               :title="hasUsername ? 'Username ändern' : 'Username hinzufügen'"
               variant="username-change-popup"
               @cancel="$emit('cancel')">
        <div class="form-grid">
            <label class="label">Username</label>
            <input ref="usernameRef"
                   v-model.trim="nextUsername"
                   type="text"
                   class="input"
                   :placeholder="hasUsername ? 'Neuer Username' : 'Username hinzufügen'"
                   @keydown.enter.prevent="onSave" />

            <p v-if="error" class="form-error">{{ error }}</p>
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
    const error = ref('')
    const usernameRef = ref<HTMLInputElement | null>(null)
    const hasUsername = computed(() => !!props.currentUsername.trim())

    watch(() => props.show, async (open) => {
        if (!open) return
        error.value = ''
        nextUsername.value = props.currentUsername
        await nextTick()
        usernameRef.value?.focus()
        usernameRef.value?.select()
    })

    function onSave() {
        const username = nextUsername.value.trim()
        if (!username) {
            error.value = 'Bitte einen Username eingeben.'
            return
        }

        error.value = ''
        emit('save', { username })
    }
</script>

<style scoped>
    .form-grid {
        display: grid;
        gap: .6rem;
    }

    .label {
        font-size: .9rem;
        color: var(--text-secondary);
    }

    .input {
        width: 100%;
        padding: .6rem .7rem;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

    .form-error {
        margin-top: .2rem;
        color: rgba(220, 38, 38, .95);
        font-size: .9rem;
    }
</style>
