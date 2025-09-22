<template>
    <div class="auth-wrapper">
        <div class="auth-card">
            <h2 class="title">{{ mode === 'login' ? 'Anmelden' : 'Registrieren' }}</h2>

            <form @submit.prevent="onSubmit">
                <div class="form-row">
                    <label for="email">E-Mail</label>
                    <input id="email" v-model.trim="email" type="email" required />
                </div>

                <div class="form-row">
                    <label for="password">Passwort</label>
                    <input id="password" v-model.trim="password" type="password" minlength="6" required />
                </div>

                <div v-if="mode === 'register'" class="form-row">
                    <label for="confirm">Passwort bestätigen</label>
                    <input id="confirm" v-model.trim="confirm" type="password" minlength="6" required />
                </div>

                <button class="primary-btn" type="submit">
                    {{ mode === 'login' ? 'Login' : 'Konto erstellen' }}
                </button>
            </form>

            <p class="switch">
                <template v-if="mode === 'login'">
                    Kein Konto?
                    <button class="link" @click="switchTo('register')">Jetzt registrieren</button>
                </template>
                <template v-else>
                    Schon ein Konto?
                    <button class="link" @click="switchTo('login')">Hier einloggen</button>
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

    async function onSubmit() {
        error.value = null
        busy.value = true
        try {
            if (mode.value === 'login') {
                await auth.signIn(email.value, password.value)
            } else {
                if (password.value !== confirm.value) {
                    error.value = 'Passwörter stimmen nicht überein.'
                    return
                }
                await auth.signUp(email.value, password.value)
            }
            const target = (route.query.redirect as string) || '/'
            router.push(target)
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.response?.data?.errors?.[0] ||
                e?.response?.data ||
                e?.message ||
                'Etwas ist schiefgelaufen.'
            error.value = typeof msg === 'string' ? msg : JSON.stringify(msg)
        } finally {
            busy.value = false
        }
    }
</script>


<style scoped>
    /* ===== Deine vorhandenen Styles bleiben erhalten ===== */

    /* Dein alter Block hieß .auth-wrap – den lasse ich drin,
    ABER ergänze unten passende Selektoren für .auth-wrapper/.auth-card */
    .auth-wrap {
        max-width: 420px;
        margin: 4rem auto;
        padding: 1.5rem;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
    }

    /* ✅ Ergänzung: damit die aktuellen Klassen aus dem Template gestylt werden */
    .auth-wrapper {
        min-height: calc(100vh - var(--nav-h, 60px));
        display: grid;
        place-items: center;
        padding: 2rem 1rem;
        background: var(--bg-primary);
    }

    .auth-card {
        width: 100%;
        max-width: 440px; /* minimal größer als .auth-wrap */
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: var(--shadow);
        padding: 1.5rem;
    }

    .title {
        font-size: 1.4rem;
        margin: 0 0 .75rem 0;
    }

    form {
        display: grid;
        gap: .75rem;
        margin: .75rem 0 1rem;
    }

    .form-row {
        display: grid;
        gap: .35rem;
    }

    label {
        font-size: .9rem;
        color: var(--text-secondary);
    }

    input {
        padding: .6rem .8rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

        input:focus {
            border-color: var(--accent-primary);
        }

    button {
        padding: .6rem .8rem;
        border: none;
        border-radius: 8px;
        background: var(--accent-primary);
        color: #fff;
        cursor: pointer;
        transition: background .2s, transform .1s;
    }

        button:active {
            transform: scale(.995);
        }

        button.oauth {
            width: 100%;
            margin-top: .5rem;
            background: var(--accent-secondary);
        }

    .primary-btn {
        width: 100%;
    }

    .hint {
        margin-top: .75rem;
        font-size: .9rem;
    }

    a, .link {
        color: var(--accent-primary);
        background: transparent;
        border: 0;
        cursor: pointer;
    }

    .switch {
        text-align: center;
        margin-top: .25rem;
        color: var(--text-secondary);
    }

    .error {
        margin-top: .75rem;
        color: #dc2626;
    }
</style>