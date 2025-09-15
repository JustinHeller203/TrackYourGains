<template>
    <div class="auth-wrap">
        <h2>Neues Passwort setzen</h2>
        <form @submit.prevent="onSubmit">
            <input v-model.trim="password" type="password" placeholder="Neues Passwort" required />
            <button :disabled="busy" type="submit">{{ busy ? '...' : 'Passwort speichern' }}</button>
        </form>
        <p class="err" v-if="err">{{ err }}</p>
        <p class="msg" v-if="msg">{{ msg }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'vue-router'

const password = ref('')
const busy = ref(false)
const err = ref('')
const msg = ref('')
const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
  // Supabase setzt Session automatisch, wenn der User über Reset-Link kommt.
  // Wir warten kurz und holen die Session, damit der Guard uns nicht rauskickt.
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    err.value = 'Link ungültig oder abgelaufen.'
  }
})

async function onSubmit() {
  err.value = ''
  msg.value = ''
  busy.value = true
  try {
    await auth.updatePassword(password.value)
    msg.value = 'Passwort aktualisiert. Weiter zum Login…'
    setTimeout(() => router.replace('/login'), 1200)
  } catch (e: any) {
    err.value = e?.message || 'Fehler beim Speichern'
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
