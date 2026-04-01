<template>
    <div class="auth-wrap">
        <h2>Registrieren</h2>

        <form novalidate @submit.prevent="onSubmit">
            <div v-if="registerStep === 1" class="form-row" :class="{ 'has-error': !!fieldErrors.email }">
                <label for="register-email">E-Mail *</label>
                <input id="register-email"
                       v-model.trim="email"
                       type="email"
                       placeholder="E-Mail"
                       autocomplete="email"
                       required />
                <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
            </div>

            <div v-if="registerStep === 2" class="form-row" :class="{ 'has-error': !!fieldErrors.username }">
                <label for="register-username">Username *</label>
                <input id="register-username"
                       v-model.trim="username"
                       type="text"
                       placeholder="Username"
                       minlength="3"
                       maxlength="20"
                       autocomplete="username"
                       required />
                <p v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</p>
            </div>

            <div v-if="registerStep === 2" class="form-row" :class="{ 'has-error': !!fieldErrors.password }">
                <label for="register-password">Passwort *</label>
                <input id="register-password"
                       v-model.trim="password"
                       type="password"
                       placeholder="Passwort mit 8 Zeichen, Gross/Klein und Zahl"
                       autocomplete="new-password"
                       required />
                <ul class="password-checklist" aria-label="Passwort Anforderungen">
                    <li :class="{ 'is-met': passwordChecks.minLength }">Mindestens 8 Zeichen</li>
                    <li :class="{ 'is-met': passwordChecks.lowercase }">Mindestens 1 Kleinbuchstabe</li>
                    <li :class="{ 'is-met': passwordChecks.uppercase }">Mindestens 1 Grossbuchstabe</li>
                    <li :class="{ 'is-met': passwordChecks.digit }">Mindestens 1 Zahl</li>
                </ul>
                <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
            </div>

            <div v-if="registerStep === 2" class="form-row" :class="{ 'has-error': !!fieldErrors.confirmPwd }">
                <label for="register-confirm">Passwort bestätigen *</label>
                <input id="register-confirm"
                       v-model.trim="confirmPwd"
                       type="password"
                       placeholder="Passwort bestätigen"
                       autocomplete="new-password"
                       required />
                <p v-if="fieldErrors.confirmPwd" class="field-error">{{ fieldErrors.confirmPwd }}</p>
            </div>

            <div class="register-actions" :class="{ 'register-actions--single': registerStep === 1 }">
                <button v-if="registerStep === 2" class="secondary-btn" type="button" @click="goToStep(1)">
                    Zurück
                </button>
                <button :disabled="busy" type="submit" :class="{ 'primary-half': registerStep === 2 }">
                    {{ busy ? '...' : (registerStep === 1 ? 'Fortfahren' : 'Account erstellen') }}
                </button>
            </div>
            <p v-if="formError" class="field-error">{{ formError }}</p>
        </form>

        <router-link to="/login">Schon ein Konto? Zum Login</router-link>

        <p class="msg" v-if="msg">{{ msg }}</p>
    </div>
</template>

<script setup lang="ts">
    import { computed, reactive, ref, watch } from 'vue'
    import { useAuthStore } from '@/store/authStore'
    import { checkRegisterEmail } from '@/services/auth'

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
            fieldErrors.email = 'Bitte eine E-Mail-Adresse eingeben.'
            return false
        }
        if (!isValidEmail(email.value)) {
            fieldErrors.email = 'Bitte eine gültige E-Mail-Adresse eingeben.'
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
                fieldErrors.email = 'Für diese E-Mail-Adresse existiert bereits ein Konto.'
                return false
            }

            if (status === 400 || status === 422) {
                fieldErrors.email = typeof backendMessage === 'string'
                    ? backendMessage
                    : 'Bitte eine gültige E-Mail-Adresse eingeben.'
                return false
            }

            formError.value = backendMessage || 'E-Mail konnte gerade nicht geprüft werden.'
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

        if (!email.value) fieldErrors.email = 'Bitte eine E-Mail-Adresse eingeben.'
        else if (!isValidEmail(email.value)) fieldErrors.email = 'Bitte eine gültige E-Mail-Adresse eingeben.'

        if (!username.value) fieldErrors.username = 'Bitte einen Username eingeben.'
        else if (username.value.length < 3) fieldErrors.username = 'Username muss mindestens 3 Zeichen lang sein.'
        else if (username.value.length > 20) fieldErrors.username = 'Username darf maximal 20 Zeichen lang sein.'

        if (!password.value) fieldErrors.password = 'Bitte ein Passwort eingeben.'
        else if (!isStrongPassword(password.value)) fieldErrors.password = 'Passwort braucht mindestens 8 Zeichen, 1 Grossbuchstaben, 1 Kleinbuchstaben und 1 Zahl.'

        if (!confirmPwd.value) fieldErrors.confirmPwd = 'Bitte das Passwort bestätigen.'
        else if (!isStrongPassword(confirmPwd.value)) fieldErrors.confirmPwd = 'Die Passwortbestätigung erfüllt die Passwortregeln noch nicht.'
        else if (password.value !== confirmPwd.value) fieldErrors.confirmPwd = 'Passwörter stimmen nicht überein.'

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
            msg.value = 'Bestätigungs-Mail gesendet. Bitte E-Mail prüfen.'
        } catch (e: any) {
            const status = e?.response?.status as number | undefined
            const backendMessage =
                (e?.response?.data?.message ||
                    e?.response?.data?.errors?.[0] ||
                    e?.response?.data ||
                    e?.message) as string | undefined

            if (status === 409) {
                fieldErrors.email = 'Für diese E-Mail-Adresse existiert bereits ein Konto.'
            } else if (typeof backendMessage === 'string' && /email|e-mail/i.test(backendMessage)) {
                fieldErrors.email = backendMessage
            } else if (typeof backendMessage === 'string' && /username|benutzername/i.test(backendMessage)) {
                fieldErrors.username = backendMessage
            } else if (typeof backendMessage === 'string' && /passwort|password/i.test(backendMessage)) {
                fieldErrors.password = /short|laenge|länge|length|uppercase|lowercase|digit|number/i.test(backendMessage)
                    ? 'Passwort braucht mindestens 8 Zeichen, 1 Grossbuchstaben, 1 Kleinbuchstaben und 1 Zahl.'
                    : backendMessage
            } else {
                formError.value = backendMessage || 'Registrierung fehlgeschlagen.'
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
