<template>
    <BasePopup
        :show="show"
        :title="t('profile.deleteProfile')"
        variant="delete-account-popup"
        @cancel="$emit('cancel')">
        <div class="delete-body">
            <div class="danger-box">
                <div class="danger-icon">!</div>
                <div class="danger-copy">
                    <p class="danger-title">{{ t('profile.popup.delete.sure') }}</p>
                    <p class="danger-text">
                        {{ t('profile.popup.delete.warningStart') }} <strong>{{ t('profile.popup.delete.warningAll') }}</strong> {{ t('profile.popup.delete.warningEnd') }}
                    </p>
                </div>
            </div>

            <div v-if="canArmDeletion" class="danger-progress">
                <div class="danger-progress-inner" :style="{ width: dangerProgress + '%' }"></div>
            </div>

            <div class="form-grid">
                <label class="label">{{ t('profile.popup.email.passwordConfirm') }}</label>
                <input
                    ref="pwdRef"
                    v-model="password"
                    type="password"
                    :class="['input', { 'has-error': !!errors.password }]"
                    placeholder="********"
                    @keydown.enter.prevent="onConfirm" />
                <p v-if="errors.password" class="form-error">{{ errors.password }}</p>

                <label class="label">
                    {{ t('profile.popup.delete.typeToConfirm') }}
                    <code>{{ confirmPhrase }}</code>
                </label>
                <input
                    v-model.trim="phrase"
                    type="text"
                    :class="['input', { 'has-error': !!errors.phrase || !!errors.general }]"
                    :placeholder="confirmPhrase"
                    @keydown.enter.prevent="onConfirm" />
                <p v-if="errors.phrase" class="form-error">{{ errors.phrase }}</p>
                <p v-if="errors.general" class="form-error">{{ errors.general }}</p>
            </div>

            <p class="small-hint">
                {{ t('profile.popup.delete.hint') }}
            </p>
        </div>

        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                {{ t('common.cancel') }}
            </PopupActionButton>

            <PopupActionButton
                autofocus
                danger
                :disabled="!canArmDeletion || countdown > 0"
                @click="onConfirm">
                <template v-if="canArmDeletion && countdown > 0">
                    {{ tp('profile.popup.delete.finalCountdown', { seconds: countdown }) }}
                </template>
                <template v-else>
                    {{ t('profile.popup.delete.final') }}
                </template>
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { ref, watch, nextTick, computed, onUnmounted } from 'vue'
    import { useI18n } from '@/composables/useI18n'
    import BasePopup from '../BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'

    const props = defineProps<{ show: boolean; confirmPhrase?: string }>()
    const emit = defineEmits<{ (e: 'cancel'): void; (e: 'confirm', p: { password: string }): void }>()
    const confirmPhrase = props.confirmPhrase ?? 'KONTO LOESCHEN'
    const { t } = useI18n()
    const tp = (key: string, params: Record<string, string | number>) =>
        Object.entries(params).reduce((text, [name, value]) => text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)), t(key))

    const password = ref('')
    const phrase = ref('')
    const errors = ref({ password: '', phrase: '', general: '' })
    const pwdRef = ref<HTMLInputElement | null>(null)

    const TOTAL_DELAY = 5
    const countdown = ref(TOTAL_DELAY)
    const isCountdownActive = ref(false)
    let countdownTimer: number | null = null

    const canArmDeletion = computed(() =>
        !!password.value && phrase.value === confirmPhrase
    )

    const dangerProgress = computed(() => {
        if (!canArmDeletion.value) return 0
        const elapsed = TOTAL_DELAY - countdown.value
        return Math.max(0, Math.min(100, (elapsed / TOTAL_DELAY) * 100))
    })

    function resetCountdown() {
        if (countdownTimer !== null) {
            clearInterval(countdownTimer)
            countdownTimer = null
        }
        countdown.value = TOTAL_DELAY
        isCountdownActive.value = false
    }

    function startCountdownIfReady() {
        if (!canArmDeletion.value || countdownTimer !== null || isCountdownActive.value) return
        isCountdownActive.value = true
        countdown.value = TOTAL_DELAY

        countdownTimer = window.setInterval(() => {
            if (countdown.value <= 1) {
                countdown.value = 0
                isCountdownActive.value = false
                if (countdownTimer !== null) {
                    clearInterval(countdownTimer)
                    countdownTimer = null
                }
            } else {
                countdown.value -= 1
            }
        }, 1000)
    }

    watch(
        () => props.show,
        async (open) => {
            if (open) {
                errors.value = { password: '', phrase: '', general: '' }
                password.value = ''
                phrase.value = ''
                resetCountdown()
                await nextTick()
                pwdRef.value?.focus()
            } else {
                resetCountdown()
            }
        }
    )

    watch([password, phrase], () => {
        errors.value.password = ''
        errors.value.phrase = ''
        errors.value.general = ''
        if (!canArmDeletion.value) {
            resetCountdown()
        } else {
            startCountdownIfReady()
        }
    })

    onUnmounted(() => {
        resetCountdown()
    })

    function onConfirm() {
        errors.value = { password: '', phrase: '', general: '' }

        if (!password.value) {
            errors.value.password = t('profile.popup.email.passwordRequired')
            return
        }

        if (phrase.value !== confirmPhrase) {
            errors.value.phrase = tp('profile.delete.confirmExactPlain', { phrase: confirmPhrase })
            return
        }

        if (countdown.value > 0) {
            errors.value.general = tp('profile.popup.delete.wait', { seconds: countdown.value })
            return
        }

        resetCountdown()
        emit('confirm', { password: password.value })
    }
</script>

<style scoped>
    .delete-body {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
    }

    .danger-box {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.7rem 0.85rem;
        border-radius: 12px;
        background: color-mix(in srgb, rgba(248, 113, 113, 0.09) 55%, transparent);
        border: 1px solid rgba(239, 68, 68, 0.4);
    }

    .danger-icon {
        flex-shrink: 0;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 0.9rem;
        background: radial-gradient(circle at 30% 0%, rgba(248, 113, 113, 0.9), rgba(127, 29, 29, 0.95));
        color: #fef2f2;
        box-shadow: 0 4px 10px rgba(127, 29, 29, 0.55);
    }

    .danger-copy {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .danger-title {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: #fee2e2;
    }

    .danger-text {
        margin: 0;
        font-size: 0.9rem;
        color: #fecaca;
    }

    .danger-progress {
        position: relative;
        margin: 0.15rem 0 0.5rem;
        height: 4px;
        border-radius: 999px;
        background: rgba(248, 113, 113, 0.18);
        overflow: hidden;
    }

    .danger-progress-inner {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #f97373, #ea580c, #facc15);
        box-shadow: 0 0 10px rgba(248, 113, 113, 0.55);
        transition: width 0.35s ease-out;
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

    .small-hint {
        margin: 0;
        margin-top: 0.2rem;
        font-size: 0.8rem;
        color: var(--text-secondary);
    }

    html.dark-mode .danger-box {
        background: rgba(30, 64, 175, 0.16);
        border-color: rgba(248, 113, 113, 0.6);
    }

    html.dark-mode .danger-title {
        color: #fee2e2;
    }

    html.dark-mode .danger-text {
        color: #fecaca;
    }

    html.dark-mode .danger-progress {
        background: rgba(148, 163, 184, 0.25);
    }

    html.dark-mode .danger-progress-inner {
        box-shadow: 0 0 12px rgba(248, 113, 113, 0.7);
    }
</style>
