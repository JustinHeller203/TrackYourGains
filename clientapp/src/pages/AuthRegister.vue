<template>
    <div class="auth-wrap">
        <h2>Registrieren</h2>

        <form @submit.prevent="onSubmit">
            <input v-model.trim="email"
                   type="email"
                   placeholder="E-Mail"
                   autocomplete="email"
                   required />
            <input v-model.trim="password"
                   type="password"
                   placeholder="Passwort (min. 6 Zeichen)"
                   autocomplete="new-password"
                   required />
            <input v-model.trim="confirmPwd"
                   type="password"
                   placeholder="Passwort bestätigen"
                   autocomplete="new-password"
                   required />
            <button :disabled="busy" type="submit">
                {{ busy ? '...' : 'Account erstellen' }}
            </button>
        </form>

        <router-link to="/login">Schon ein Konto? Zum Login</router-link>

        <p class="msg" v-if="msg">{{ msg }}</p>
        <p class="err" v-if="err">{{ err }}</p>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { useAuthStore } from '@/store/authStore'

    const email = ref('')
    const password = ref('')
    const confirmPwd = ref('')          // <� eigenes Confirm-Feld
    const busy = ref(false)
    const err = ref('')
    const msg = ref('')

    const auth = useAuthStore()

    async function onSubmit() {
        err.value = ''
        msg.value = ''

        // simple Frontend-Checks
        if (password.value.length < 6) {
            err.value = 'Passwort muss mindestens 6 Zeichen haben.'
            return
        }
        if (password.value !== confirmPwd.value) {
            err.value = 'Passwörter stimmen nicht überein.'
            return
        }

        busy.value = true
        try {
            // dein Store erwartet (email, password, confirm)
            await auth.signUp(email.value, password.value, confirmPwd.value)
            msg.value = 'Bestätigungs-Mail gesendet. Bitte E-Mail prüfen.'
        } catch (e: any) {
            err.value = e?.message || 'Registrierung fehlgeschlagen.'
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

    input {
        padding: .65rem .8rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
    }

    button {
        padding: .7rem 1rem;
        border-radius: 8px;
        border: 0;
        background: var(--accent-primary);
        color: #fff;
        cursor: pointer;
    }

    .err {
        color: #ef4444;
    }

    .msg {
        color: #10b981;
    }
</style>
