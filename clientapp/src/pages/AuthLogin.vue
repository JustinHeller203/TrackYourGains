<template>
    <div class="auth-wrapper">
        <div class="auth-card">
            <h2 class="title">{{ mode === 'login' ? 'Anmelden' : 'Registrieren' }}</h2>
            <p class="subtitle">
                {{
 mode === 'login'
    ? 'Willkommen zurück – logg dich ein, um deine Fortschritte zu sehen.'
    : 'Erstelle dein Konto und tracke deine Gains wie ein Profi.'
                }}
            </p>
            <form @submit.prevent="onSubmit">
                <div v-if="mode === 'register'" class="form-row">
                    <label for="email">E-Mail</label>
                    <input id="email"
                           v-model.trim="email"
                           type="email"
                           autocomplete="email"
                           required />
                </div>

                <div class="form-row">
                    <label for="username">Username</label>
                    <input id="username"
                           v-model.trim="username"
                           type="text"
                           minlength="3"
                           maxlength="20"
                           autocomplete="username"
                           required />
                </div>

                <div class="form-row">
                    <label for="password">Passwort</label>
                    <input id="password"
                           v-model.trim="password"
                           type="password"
                           minlength="6"
                           :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                           required />
                </div>

                <div v-if="mode === 'register'" class="form-row">
                    <label for="confirm">Passwort bestätigen</label>
                    <input id="confirm"
                           v-model.trim="confirm"
                           type="password"
                           minlength="6"
                           autocomplete="new-password"
                           required />
                </div>

                <button class="primary-btn"
                        type="submit"
                        :disabled="busy">
                    {{ busy ? 'Bitte warten …' : (mode === 'login' ? 'Login' : 'Konto erstellen') }}
                </button>

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
            <p v-if="error" class="error">{{ error }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'

    type Mode = 'login' | 'register'
    const route = useRoute()
    const router = useRouter()
    const auth = useAuthStore()

    const mode = ref<Mode>('login')
    const email = ref('')
    const username = ref('')
    const password = ref('')
    const confirm = ref('')
    const error = ref<string | null>(null)
    const busy = ref(false)

    onMounted(async () => {
        if (auth.loading) await auth.init()
        const q = String(route.query.mode || '')
        if (q === 'register') mode.value = 'register'

        // Schon eingeloggt? Dann direkt wohin der Nutzer wollte (oder Home)
        if (auth.isAuthenticated) {
            const target = (route.query.redirect as string) || '/'
            router.replace(target)
        }
    })

    function switchTo(m: Mode) {
        mode.value = m
        router.replace({ name: 'login', query: m === 'register' ? { mode: 'register' } : {} })
        error.value = null
    }

    function mapAuthError(e: any, mode: Mode): string {
        const status = e?.response?.status as number | undefined
        const code = e?.code as string | undefined
        const backendMessage =
            (e?.response?.data?.message ||
                e?.response?.data?.errors?.[0] ||
                e?.response?.data) as string | undefined

        // Kein Response / Netzwerk weg
        if (code === 'ERR_NETWORK' || !e?.response) {
            return 'Keine Verbindung zum Server. Bitte prüf deine Internetverbindung und versuch es gleich nochmal.'
        }

        // Klassiker: falsche Login-Daten
        if (status === 401 || status === 403) {
            return 'E-Mail oder Passwort ist falsch.'
        }

        // Registrierung: Mail schon vergeben
        if (status === 409 && mode === 'register') {
            return 'Für diese E-Mail-Adresse existiert bereits ein Konto.'
        }

        // Schlechte Eingaben
        if (status === 400 || status === 422) {
            return 'Deine Eingaben sind unvollständig oder ungültig. Bitte überprüfe E-Mail und Passwort.'
        }

        // Server down / Bug auf der API
        if (status && status >= 500) {
            return 'Auf dem Server ist gerade ein Fehler aufgetreten. Versuch es später nochmal.'
        }

        // Falls das Backend schon eine brauchbare Message schickt
        if (typeof backendMessage === 'string') {
            // Kleiner Sonderfall: Passwort zu kurz
            if (/passwort|password/i.test(backendMessage) && /short|länge|length/i.test(backendMessage)) {
                return 'Das Passwort ist zu kurz. Verwende mindestens 6 Zeichen.'
            }
            return backendMessage
        }

        // Fallback
        return 'Etwas ist schiefgelaufen. Bitte versuch es später noch einmal.'
    }

    async function onSubmit() {
        error.value = null
        busy.value = true
        try {
            if (mode.value === 'login') {
                await auth.signIn(username.value, password.value)
            } else {
                if (password.value !== confirm.value) {
                    error.value = 'Passwörter stimmen nicht überein.'
                    return
                }
                await auth.signUp(email.value, username.value, password.value, confirm.value)
            }
            const target = (route.query.redirect as string) || '/'
            router.push(target)
        } catch (e: any) {
            error.value = mapAuthError(e, mode.value)
        } finally {
            busy.value = false
        }
    }

</script>


<style scoped>
    /* Auth.vue – neuer Style */

    .auth-wrapper {
        min-height: calc(100vh - var(--nav-h, 60px));
        display: grid;
        place-items: center;
        padding: 2rem 1rem;
        background: transparent; /* globaler Gradient bleibt */
    }

    /* AuthLogin.vue – STEP 1: Card-Hintergrund wie Landing-Stat/Feature-Card */

    .auth-card {
        width: 100%;
        max-width: 460px;
        padding: 2.1rem 2.2rem;
        position: relative;
        z-index: 1;
        /* exakt der layered Look der Landing-Cards */
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        backdrop-filter: blur(10px);
        transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    }

    /* Dark-Mode Match zu Landing-Cards */
    html.dark-mode .auth-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* ganz dezenter Hover wie bei stat/feature-card */
    @media (hover: hover) {
        .auth-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    /* Titel wie eine Section-Headline */
    .title {
        font-size: 1.9rem;
        font-weight: 800;
        margin: 0 0 1.6rem 0;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    /* Form-Layout */
    form {
        display: grid;
        gap: 1rem;
        margin-bottom: 1.1rem;
    }

    .form-row {
        display: grid;
        gap: .35rem;
    }

    label {
        font-size: .95rem;
        color: var(--text-secondary);
    }

    /* Inputs: pill-förmige Dark-Glass-Felder, die zum Hero-Background passen */
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

        /* Browser-Autofill & Invalid-State abdunkeln, damit kein Gelb/Creme mehr auftaucht */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
            -webkit-text-fill-color: var(--text-primary);
            -webkit-box-shadow: 0 0 0 1000px rgba(3, 7, 18, 0.98) inset;
            border: 1px solid rgba(148, 163, 184, 0.7);
            transition: background-color 9999s ease-in-out 0s;
        }

        input:invalid {
            box-shadow: none; /* verhindert komische Standard-Outline */
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

    /* Link im Switch etwas „clicky-er“ */
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


    /* Switch Login/Register Text */
    .switch {
        text-align: center;
        margin-top: .6rem;
        font-size: .95rem;
        color: var(--text-secondary);
    }

    .link {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--accent-primary);
        padding: 0;
        font-weight: 500;
    }

    .error {
        margin-top: 1rem;
        padding: 0.65rem 0.9rem;
        border-radius: 999px;
        background: rgba(248, 113, 113, 0.08);
        border: 1px solid rgba(248, 113, 113, 0.45);
        color: #fecaca;
        font-weight: 500;
        font-size: 0.9rem;
        text-align: center;
    }


    .subtitle {
        margin: -0.3rem 0 1.4rem;
        font-size: 0.95rem;
        color: var(--text-secondary);
    }

    .field-hint {
        font-size: 0.8rem;
        color: color-mix(in srgb, var(--text-secondary) 85%, #9ca3af 15%);
    }

</style>
