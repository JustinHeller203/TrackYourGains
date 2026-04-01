<template>
    <div class="auth-wrapper">
        <div class="auth-card">
            <h2 class="title">{{ mode === 'login' ? 'Anmelden' : 'Registrieren' }}</h2>
            <p class="subtitle">
                {{
                    mode === 'login'
                        ? 'Willkommen zurück - logg dich ein, um deine Fortschritte zu sehen.'
                        : 'Erstelle dein Konto und tracke deine Gains wie ein Profi.'
                }}
            </p>
            <form novalidate @submit.prevent="onSubmit">
                <div v-if="mode === 'register' && registerStep === 1" class="form-row" :class="{ 'has-error': !!fieldErrors.email }">
                    <label for="email">E-Mail *</label>
                    <input id="email"
                           v-model.trim="email"
                           type="email"
                           autocomplete="email"
                           required />
                    <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
                </div>

                <div v-if="mode === 'login' || registerStep === 2" class="form-row" :class="{ 'has-error': !!fieldErrors.identifier }">
                    <label for="identifier">{{ mode === 'login' ? 'Username oder E-Mail *' : 'Username *' }}</label>
                    <input id="identifier"
                           v-model.trim="identifier"
                           type="text"
                           minlength="3"
                           :maxlength="mode === 'login' ? 254 : 20"
                           autocomplete="username"
                           required />
                    <p v-if="fieldErrors.identifier" class="field-error">{{ fieldErrors.identifier }}</p>
                </div>

                <div v-if="mode === 'login' || registerStep === 2" class="form-row" :class="{ 'has-error': !!fieldErrors.password }">
                    <label for="password">Passwort *</label>
                    <input id="password"
                           v-model.trim="password"
                           type="password"
                           minlength="8"
                           :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                           required />
                    <ul v-if="mode === 'register'" class="password-checklist" aria-label="Passwort Anforderungen">
                        <li :class="{ 'is-met': passwordChecks.minLength }">Mindestens 8 Zeichen</li>
                        <li :class="{ 'is-met': passwordChecks.lowercase }">Mindestens 1 Kleinbuchstabe</li>
                        <li :class="{ 'is-met': passwordChecks.uppercase }">Mindestens 1 Grossbuchstabe</li>
                        <li :class="{ 'is-met': passwordChecks.digit }">Mindestens 1 Zahl</li>
                    </ul>
                    <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
                </div>

                <div v-if="mode === 'register' && registerStep === 2" class="form-row" :class="{ 'has-error': !!fieldErrors.confirm }">
                    <label for="confirm">Passwort bestätigen *</label>
                    <input id="confirm"
                           v-model.trim="confirm"
                           type="password"
                           minlength="8"
                           autocomplete="new-password"
                           required />
                    <p v-if="fieldErrors.confirm" class="field-error">{{ fieldErrors.confirm }}</p>
                </div>

                <div v-if="mode === 'register'" class="register-actions" :class="{ 'register-actions--single': registerStep === 1 }">
                    <button v-if="registerStep === 2"
                            class="secondary-btn"
                            type="button"
                            @click="goToRegisterStep(1)">
                        Zurück
                    </button>
                    <button class="primary-btn"
                            :class="{ 'primary-btn--half': registerStep === 2 }"
                            type="submit"
                            :disabled="busy">
                        {{ busy ? 'Bitte warten ...' : (registerStep === 1 ? 'Fortfahren' : 'Konto erstellen') }}
                    </button>
                </div>
                <button v-else
                        class="primary-btn"
                        type="submit"
                        :disabled="busy">
                    {{ busy ? 'Bitte warten ...' : 'Login' }}
                </button>
                <p v-if="formError" class="field-error">{{ formError }}</p>
            </form>

            <p class="switch">
                <template v-if="mode === 'login'">
                    Kein Konto?
                    <button class="link" @click="switchTo('register')">Account erstellen</button>
                </template>
                <template v-else>
                    Schon ein Konto?
                    <button class="link" @click="switchTo('login')">Zum Login</button>
                </template>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, reactive, ref, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'
    import { checkRegisterEmail } from '@/services/auth'

    type Mode = 'login' | 'register'

    const route = useRoute()
    const router = useRouter()
    const auth = useAuthStore()

    const mode = ref<Mode>('login')
    const email = ref('')
    const identifier = ref('')
    const password = ref('')
    const confirm = ref('')
    const registerStep = ref<1 | 2>(1)
    const busy = ref(false)
    const formError = ref('')
    const fieldErrors = reactive({
        email: '',
        identifier: '',
        password: '',
        confirm: '',
    })
    const passwordChecks = computed(() => ({
        minLength: password.value.length >= 8,
        lowercase: /[a-z]/.test(password.value),
        uppercase: /[A-Z]/.test(password.value),
        digit: /\d/.test(password.value),
    }))

    onMounted(async () => {
        if (auth.loading) await auth.init()
        const q = String(route.query.mode || '')
        if (q === 'register') mode.value = 'register'

        if (auth.isAuthenticated) {
            const target = (route.query.redirect as string) || '/'
            router.replace(target)
        }
    })

    function resetErrors() {
        fieldErrors.email = ''
        fieldErrors.identifier = ''
        fieldErrors.password = ''
        fieldErrors.confirm = ''
        formError.value = ''
    }

    function switchTo(nextMode: Mode) {
        mode.value = nextMode
        registerStep.value = 1
        router.replace({ name: 'login', query: nextMode === 'register' ? { mode: 'register' } : {} })
        resetErrors()
    }

    function validateRegisterEmailStep() {
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

    async function validateRegisterEmailStepOnServer() {
        if (!validateRegisterEmailStep()) return false

        busy.value = true
        try {
            await checkRegisterEmail(email.value)
            return true
        } catch (e: any) {
            const status = e?.response?.status as number | undefined
            const backendMessage =
                (e?.response?.data?.message ||
                    e?.response?.data?.errors?.[0] ||
                    e?.response?.data) as string | undefined
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

            formError.value = typeof backendMessage === 'string'
                ? backendMessage
                : 'E-Mail konnte gerade nicht geprüft werden. Versuch es bitte nochmal.'
            return false
        } finally {
            busy.value = false
        }
    }

    function goToRegisterStep(step: 1 | 2) {
        registerStep.value = step
        formError.value = ''
    }

    watch(email, () => {
        fieldErrors.email = ''
        formError.value = ''
    })

    watch(identifier, () => {
        fieldErrors.identifier = ''
        formError.value = ''
    })

    watch(password, () => {
        fieldErrors.password = ''
        fieldErrors.confirm = ''
        formError.value = ''
    })

    watch(confirm, () => {
        fieldErrors.confirm = ''
        formError.value = ''
    })

    watch(mode, () => {
        resetErrors()
        registerStep.value = 1
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

    function validateForm() {
        resetErrors()

        if (mode.value === 'register') {
            if (!email.value) fieldErrors.email = 'Bitte eine E-Mail-Adresse eingeben.'
            else if (!isValidEmail(email.value)) fieldErrors.email = 'Bitte eine gültige E-Mail-Adresse eingeben.'
        }

        if (!identifier.value) {
            fieldErrors.identifier = mode.value === 'login'
                ? 'Bitte Username oder E-Mail eingeben.'
                : 'Bitte einen Username eingeben.'
        } else if (mode.value === 'register') {
            if (identifier.value.length < 3) fieldErrors.identifier = 'Username muss mindestens 3 Zeichen lang sein.'
            else if (identifier.value.length > 20) fieldErrors.identifier = 'Username darf maximal 20 Zeichen lang sein.'
        }

        if (!password.value) fieldErrors.password = 'Bitte ein Passwort eingeben.'
        else if (!isStrongPassword(password.value)) fieldErrors.password = 'Passwort braucht mindestens 8 Zeichen, 1 Grossbuchstaben, 1 Kleinbuchstaben und 1 Zahl.'

        if (mode.value === 'register') {
            if (!confirm.value) fieldErrors.confirm = 'Bitte das Passwort bestätigen.'
            else if (!isStrongPassword(confirm.value)) fieldErrors.confirm = 'Die Passwortbestätigung erfüllt die Passwortregeln noch nicht.'
            else if (password.value !== confirm.value) fieldErrors.confirm = 'Passwörter stimmen nicht überein.'
        }

        return !fieldErrors.email && !fieldErrors.identifier && !fieldErrors.password && !fieldErrors.confirm
    }

    function applyAuthError(e: any, currentMode: Mode) {
        const status = e?.response?.status as number | undefined
        const code = e?.code as string | undefined
        const backendMessage =
            (e?.response?.data?.message ||
                e?.response?.data?.errors?.[0] ||
                e?.response?.data) as string | undefined

        if (code === 'ERR_NETWORK' || !e?.response) {
            formError.value = 'Keine Verbindung zum Server. Bitte prüf deine Internetverbindung und versuch es gleich nochmal.'
            return
        }

        if (status === 401 || status === 403) {
            fieldErrors.password = 'Username/E-Mail oder Passwort ist falsch.'
            return
        }

        if (status === 409 && currentMode === 'register') {
            fieldErrors.email = 'Für diese E-Mail-Adresse existiert bereits ein Konto.'
            return
        }

        if (status === 400 || status === 422) {
            formError.value = 'Deine Eingaben sind unvollständig oder ungültig. Bitte überprüfe die markierten Felder.'
            return
        }

        if (status && status >= 500) {
            formError.value = 'Auf dem Server ist gerade ein Fehler aufgetreten. Versuch es später nochmal.'
            return
        }

        if (typeof backendMessage === 'string') {
            if (/passwort|password/i.test(backendMessage) && /short|laenge|länge|length|uppercase|lowercase|digit|number/i.test(backendMessage)) {
                fieldErrors.password = 'Passwort braucht mindestens 8 Zeichen, 1 Grossbuchstaben, 1 Kleinbuchstaben und 1 Zahl.'
                return
            }
            if (/email|e-mail/i.test(backendMessage)) {
                fieldErrors.email = backendMessage
                return
            }
            if (/username|benutzername/i.test(backendMessage)) {
                fieldErrors.identifier = backendMessage
                return
            }
            formError.value = backendMessage
            return
        }

        formError.value = 'Etwas ist schiefgelaufen. Bitte versuch es später noch einmal.'
    }

    async function onSubmit() {
        if (mode.value === 'register' && registerStep.value === 1) {
            if (!await validateRegisterEmailStepOnServer()) return
            registerStep.value = 2
            return
        }

        if (!validateForm()) return

        busy.value = true
        try {
            if (mode.value === 'login') {
                await auth.signIn(identifier.value, password.value)
            } else {
                await auth.signUp(email.value, identifier.value, password.value, confirm.value)
            }
            const target = (route.query.redirect as string) || '/'
            router.push(target)
        } catch (e: any) {
            applyAuthError(e, mode.value)
        } finally {
            busy.value = false
        }
    }
</script>

<style scoped>
    .auth-wrapper {
        min-height: calc(100vh - var(--nav-h, 60px));
        display: grid;
        place-items: center;
        padding: 2rem 1rem;
        background: transparent;
    }

    .auth-card {
        width: 100%;
        max-width: 460px;
        padding: 2.1rem 2.2rem;
        position: relative;
        z-index: 1;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        backdrop-filter: blur(10px);
        transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    }

    html.dark-mode .auth-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    @media (hover: hover) {
        .auth-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    .title {
        font-size: 1.9rem;
        font-weight: 800;
        margin: 0 0 1.6rem 0;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    form {
        display: grid;
        gap: 1rem;
        margin-bottom: 1.1rem;
    }

    .register-actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
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
        width: 100%;
        padding: 0.9rem 1.1rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.55);
        background: radial-gradient(circle at 0% 0%, rgba(129, 140, 248, 0.13), transparent 58%), rgba(3, 7, 18, 0.96);
        color: var(--text-primary);
        font-size: 0.95rem;
        box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.9), inset 0 1px 0 rgba(248, 250, 252, 0.03);
        transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, transform 0.1s ease;
    }

    .form-row.has-error input {
        border-color: rgba(239, 68, 68, 0.88);
        box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.45), 0 0 0 4px rgba(239, 68, 68, 0.10);
    }

    input::placeholder {
        color: color-mix(in srgb, var(--text-secondary) 80%, #9ca3af 20%);
    }

    input:focus {
        outline: none;
        border-color: color-mix(in srgb, var(--accent-primary) 80%, #a5b4fc 20%);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-primary) 70%, transparent), 0 0 0 6px color-mix(in srgb, var(--accent-primary) 28%, transparent);
        background: radial-gradient(circle at 0% 0%, rgba(129, 140, 248, 0.2), transparent 60%), rgba(3, 7, 18, 0.98);
        transform: translateY(-1px);
    }

    .form-row.has-error input:focus {
        border-color: rgba(239, 68, 68, 0.88);
        box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.45), 0 0 0 6px rgba(239, 68, 68, 0.12);
    }

    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
        -webkit-text-fill-color: var(--text-primary);
        -webkit-box-shadow: 0 0 0 1000px rgba(3, 7, 18, 0.98) inset;
        border: 1px solid rgba(148, 163, 184, 0.7);
        transition: background-color 9999s ease-in-out 0s;
    }

    .primary-btn {
        margin-top: .4rem;
        width: 100%;
        padding: .95rem 1rem;
        font-weight: 600;
        text-align: center;
        appearance: none;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, var(--accent-primary) 70%, transparent);
        background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
        color: color-mix(in srgb, var(--accent-primary) 88%, #e5e7eb 12%);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.38);
        backdrop-filter: blur(4px);
        cursor: pointer;
        transition: background .16s ease, border-color .16s ease, color .16s ease, transform .1s ease, box-shadow .18s ease, opacity .16s ease;
    }

    .primary-btn--half {
        margin-top: 0;
    }

    .secondary-btn {
        width: 100%;
        padding: .95rem 1rem;
        font-weight: 600;
        text-align: center;
        appearance: none;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        transition: background .16s ease, border-color .16s ease, color .16s ease, transform .1s ease, box-shadow .18s ease;
    }

    .secondary-btn:hover {
        background: rgba(148, 163, 184, 0.08);
        border-color: rgba(148, 163, 184, 0.55);
    }

    .primary-btn:hover:not(:disabled) {
        background: color-mix(in srgb, var(--accent-primary) 24%, transparent);
        border-color: color-mix(in srgb, var(--accent-primary) 95%, #a5b4fc 5%);
        color: #e5e7eb;
        box-shadow: 0 14px 30px rgba(15, 23, 42, 0.5);
    }

    .primary-btn:active:not(:disabled) {
        transform: translateY(1px);
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.4);
    }

    .primary-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        box-shadow: 0 6px 14px rgba(15, 23, 42, 0.3);
    }

    .link {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--accent-primary);
        padding: 0;
        font-weight: 500;
        text-decoration: none;
    }

    .link:hover {
        text-decoration: underline;
    }

    .switch {
        text-align: center;
        margin-top: .6rem;
        font-size: .95rem;
        color: var(--text-secondary);
    }

    .subtitle {
        margin: -0.3rem 0 1.4rem;
        font-size: 0.95rem;
        color: var(--text-secondary);
    }
</style>
