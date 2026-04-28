<template>
    <div class="auth-wrap">
        <h2>{{ t('auth.register.title') }}</h2>

        <form novalidate @submit.prevent="onSubmit">
            <div v-if="registerStep === 1" class="form-row" :class="{ 'has-error': !!fieldErrors.email }">
                <label for="register-email">{{ t('auth.form.email') }}</label>
                <input id="register-email"
                       v-model.trim="email"
                       type="email"
                       :placeholder="t('auth.form.emailPlaceholder')"
                       autocomplete="email"
                       required />
                <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
            </div>

            <div v-if="registerStep === 2" class="form-row" :class="{ 'has-error': !!fieldErrors.username }">
                <label for="register-username">{{ t('auth.form.username') }}</label>
                <input id="register-username"
                       v-model.trim="username"
                       type="text"
                       :placeholder="t('auth.form.usernamePlaceholder')"
                       minlength="3"
                       maxlength="20"
                       autocomplete="username"
                       required />
                <p v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</p>
            </div>

            <div v-if="registerStep === 2" class="form-row" :class="{ 'has-error': !!fieldErrors.password }">
                <label for="register-password">{{ t('auth.form.password') }}</label>
                <input id="register-password"
                       v-model.trim="password"
                       type="password"
                       :placeholder="t('auth.form.passwordPlaceholder')"
                       autocomplete="new-password"
                       required />
                <ul class="password-checklist" :aria-label="t('auth.form.passwordChecklistAria')">
                    <li :class="{ 'is-met': passwordChecks.minLength }">{{ t('auth.form.passwordRuleMin') }}</li>
                    <li :class="{ 'is-met': passwordChecks.lowercase }">{{ t('auth.form.passwordRuleLower') }}</li>
                    <li :class="{ 'is-met': passwordChecks.uppercase }">{{ t('auth.form.passwordRuleUpper') }}</li>
                    <li :class="{ 'is-met': passwordChecks.digit }">{{ t('auth.form.passwordRuleDigit') }}</li>
                </ul>
                <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
            </div>

            <div v-if="registerStep === 2" class="form-row" :class="{ 'has-error': !!fieldErrors.confirmPwd }">
                <label for="register-confirm">{{ t('auth.form.confirmPassword') }}</label>
                <input id="register-confirm"
                       v-model.trim="confirmPwd"
                       type="password"
                       :placeholder="t('auth.form.confirmPasswordPlaceholder')"
                       autocomplete="new-password"
                       required />
                <p v-if="fieldErrors.confirmPwd" class="field-error">{{ fieldErrors.confirmPwd }}</p>
            </div>

            <div class="register-actions" :class="{ 'register-actions--single': registerStep === 1 }">
                <button v-if="registerStep === 2" class="secondary-btn" type="button" @click="goToStep(1)">
                    {{ t('auth.action.back') }}
                </button>
                <button :disabled="busy" type="submit" :class="{ 'primary-half': registerStep === 2 }">
                    {{ busy ? t('auth.action.pleaseWait') : (registerStep === 1 ? t('auth.action.continue') : t('auth.action.createAccount')) }}
                </button>
            </div>
            <p v-if="formError" class="field-error">{{ formError }}</p>
        </form>

        <router-link to="/login">{{ t('auth.switch.haveAccount') }} {{ t('auth.switch.toLogin') }}</router-link>

        <p class="msg" v-if="msg">{{ msg }}</p>
    </div>
</template>

<script setup lang="ts">
    import { computed, reactive, ref, watch } from 'vue'
    import { useAuthStore } from '@/store/authStore'
    import { checkRegisterEmail } from '@/services/auth'
    import { useI18n } from '@/composables/useI18n'

    const email = ref('')
    const username = ref('')
    const password = ref('')
    const confirmPwd = ref('')
    const registerStep = ref<1 | 2>(1)
    const busy = ref(false)
    const msg = ref('')
    const formError = ref('')
    const fieldErrors = reactive({
        email: '',
        username: '',
        password: '',
        confirmPwd: '',
    })
    const passwordChecks = computed(() => ({
        minLength: password.value.length >= 8,
        lowercase: /[a-z]/.test(password.value),
        uppercase: /[A-Z]/.test(password.value),
        digit: /\d/.test(password.value),
    }))

    const auth = useAuthStore()
    const { t } = useI18n()

    function resetErrors() {
        fieldErrors.email = ''
        fieldErrors.username = ''
        fieldErrors.password = ''
        fieldErrors.confirmPwd = ''
        formError.value = ''
    }

    watch(email, () => {
        fieldErrors.email = ''
        formError.value = ''
    })

    watch(username, () => {
        fieldErrors.username = ''
        formError.value = ''
    })

    watch(password, () => {
        fieldErrors.password = ''
        fieldErrors.confirmPwd = ''
        formError.value = ''
    })

    watch(confirmPwd, () => {
        fieldErrors.confirmPwd = ''
        formError.value = ''
    })

    function isValidEmail(value: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    }

    function isStrongPassword(value: string) {
        return value.length >= 8 &&
            /[a-z]/.test(value) &&
            /[A-Z]/.test(value) &&
            /\d/.test(value)
    }

    function validateEmailStep() {
        resetErrors()
        if (!email.value) {
            fieldErrors.email = t('auth.validation.enterEmail')
            return false
        }
        if (!isValidEmail(email.value)) {
            fieldErrors.email = t('auth.validation.validEmail')
            return false
        }
        return true
    }

    async function validateEmailStepOnServer() {
        if (!validateEmailStep()) return false

        busy.value = true
        try {
            await checkRegisterEmail(email.value)
            return true
        } catch (e: any) {
            const status = e?.response?.status as number | undefined
            const backendMessage =
                (e?.response?.data?.message ||
                    e?.response?.data?.errors?.[0] ||
                    e?.response?.data ||
                    e?.message) as string | undefined
            const emailExistsMessage = typeof backendMessage === 'string' &&
                /e-?mail/i.test(backendMessage) &&
                /registriert|bereits|exist/i.test(backendMessage)

            if (status === 409 || emailExistsMessage) {
                fieldErrors.email = t('auth.validation.emailExists')
                return false
            }

            if (status === 400 || status === 422) {
                fieldErrors.email = typeof backendMessage === 'string'
                    ? backendMessage
                    : t('auth.validation.validEmail')
                return false
            }

            formError.value = backendMessage || t('auth.validation.emailCheckFailed')
            return false
        } finally {
            busy.value = false
        }
    }

    function goToStep(step: 1 | 2) {
        if (step === 2 && !validateEmailStep()) return
        registerStep.value = step
        formError.value = ''
    }

    function validateForm() {
        resetErrors()

        if (!email.value) fieldErrors.email = t('auth.validation.enterEmail')
        else if (!isValidEmail(email.value)) fieldErrors.email = t('auth.validation.validEmail')

        if (!username.value) fieldErrors.username = t('auth.validation.enterUsername')
        else if (username.value.length < 3) fieldErrors.username = t('auth.validation.usernameMin')
        else if (username.value.length > 20) fieldErrors.username = t('auth.validation.usernameMax')

        if (!password.value) fieldErrors.password = t('auth.validation.enterPassword')
        else if (!isStrongPassword(password.value)) fieldErrors.password = t('auth.validation.passwordWeak')

        if (!confirmPwd.value) fieldErrors.confirmPwd = t('auth.validation.confirmPassword')
        else if (!isStrongPassword(confirmPwd.value)) fieldErrors.confirmPwd = t('auth.validation.confirmPasswordWeak')
        else if (password.value !== confirmPwd.value) fieldErrors.confirmPwd = t('auth.validation.passwordMismatch')

        return !fieldErrors.email && !fieldErrors.username && !fieldErrors.password && !fieldErrors.confirmPwd
    }

    async function onSubmit() {
        msg.value = ''

        if (registerStep.value === 1) {
            if (!await validateEmailStepOnServer()) return
            registerStep.value = 2
            return
        }

        if (!validateForm()) return

        busy.value = true
        try {
            await auth.signUp(email.value, username.value, password.value, confirmPwd.value)
            msg.value = t('auth.success.confirmMailSent')
        } catch (e: any) {
            const status = e?.response?.status as number | undefined
            const backendMessage =
                (e?.response?.data?.message ||
                    e?.response?.data?.errors?.[0] ||
                    e?.response?.data ||
                    e?.message) as string | undefined

            if (status === 409) {
                fieldErrors.email = t('auth.validation.emailExists')
            } else if (typeof backendMessage === 'string' && /email|e-mail/i.test(backendMessage)) {
                fieldErrors.email = backendMessage
            } else if (typeof backendMessage === 'string' && /username|benutzername/i.test(backendMessage)) {
                fieldErrors.username = backendMessage
            } else if (typeof backendMessage === 'string' && /passwort|password/i.test(backendMessage)) {
                fieldErrors.password = /short|laenge|länge|length|uppercase|lowercase|digit|number/i.test(backendMessage)
                    ? t('auth.validation.passwordWeak')
                    : backendMessage
            } else {
                formError.value = backendMessage || t('auth.validation.registrationFailed')
            }
        } finally {
            busy.value = false
        }
    }
</script>

<style scoped>
    .auth-wrap {
        max-width: 420px;
        margin: 3rem auto;
        display: grid;
        gap: .75rem;
    }

    form {
        display: grid;
        gap: .85rem;
    }

    .register-actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .75rem;
        align-items: start;
    }

    .register-actions--single {
        grid-template-columns: minmax(0, 1fr);
    }

    .form-row {
        display: grid;
        gap: .35rem;
    }

    label {
        font-size: .95rem;
        color: var(--text-secondary);
    }

    .field-error {
        margin: 0;
        color: #ef4444;
        font-size: 0.9rem;
        font-weight: 650;
    }

    .password-checklist {
        display: grid;
        gap: 0.3rem;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .password-checklist li {
        color: var(--text-secondary);
        font-size: 0.88rem;
        font-weight: 600;
    }

    .password-checklist li::before {
        content: '□';
        display: inline-block;
        margin-right: 0.45rem;
        color: rgba(148, 163, 184, 0.9);
    }

    .password-checklist li.is-met {
        color: #22c55e;
    }

    .password-checklist li.is-met::before {
        content: '✓';
        color: #22c55e;
    }

    input {
        padding: .65rem .8rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
    }

    .form-row.has-error input {
        border-color: rgba(239, 68, 68, 0.88);
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.10);
    }

    button {
        padding: .7rem 1rem;
        border-radius: 8px;
        border: 0;
        background: var(--accent-primary);
        color: #fff;
        cursor: pointer;
    }

    .primary-half {
        width: 100%;
    }

    .secondary-btn {
        padding: .7rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
    }

    .msg {
        color: #10b981;
    }
</style>
