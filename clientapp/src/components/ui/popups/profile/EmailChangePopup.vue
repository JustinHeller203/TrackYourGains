<template>
    <BasePopup
        :show="show"
        :title="t('profile.changeEmail')"
        variant="email-change-popup"
        @cancel="$emit('cancel')">
        <div class="email-popup-card">
            <div class="form-grid">
                <label class="label">{{ t('profile.popup.email.newEmail') }}</label>
                <input
                    ref="emailRef"
                    v-model.trim="email"
                    type="email"
                    :class="['input', { 'has-error': !!errors.email }]"
                    placeholder="dein.name@mail.com" />
                <p v-if="errors.email" class="form-error">{{ errors.email }}</p>

                <label class="label">{{ t('profile.popup.email.passwordConfirm') }}</label>
                <input
                    v-model="password"
                    type="password"
                    :class="['input', { 'has-error': !!errors.password }]"
                    placeholder="********" />
                <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
            </div>
        </div>

        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                {{ t('common.cancel') }}
            </PopupActionButton>

            <PopupActionButton autofocus @click="onSave">
                Speichern
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { ref, watch, nextTick } from 'vue'
    import { useI18n } from '@/composables/useI18n'
    import BasePopup from '../BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'

    const props = defineProps<{ show: boolean }>()
    const emit = defineEmits<{ (e: 'cancel'): void; (e: 'save', p: { newEmail: string; password: string }): void }>()

    const email = ref('')
    const password = ref('')
    const errors = ref({ email: '', password: '' })
    const emailRef = ref<HTMLInputElement | null>(null)
    const { t } = useI18n()

    watch(() => props.show, async (open) => {
        if (!open) return
        errors.value.email = ''
        errors.value.password = ''
        email.value = ''
        password.value = ''
        await nextTick()
        emailRef.value?.focus()
    })

    function onSave() {
        errors.value.email = ''
        errors.value.password = ''

        if (!email.value) {
            errors.value.email = t('profile.popup.email.required')
            return
        }

        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
        if (!valid) {
            errors.value.email = t('profile.popup.email.invalid')
            return
        }

        if (!password.value) {
            errors.value.password = t('profile.popup.email.passwordRequired')
            return
        }

        emit('save', { newEmail: email.value, password: password.value })
    }
</script>

<style scoped>
    .email-popup-card {
        padding: 0;
        margin: 0;
        background: transparent;
        border: 0;
        box-shadow: none;
        border-radius: 0;
    }

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

    html.dark-mode .email-popup-card {
        background: transparent;
        border: 0;
        box-shadow: none;
    }
</style>
