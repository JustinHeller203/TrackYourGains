<template>
    <BasePopup :show="show"
               title="E-Mail ändern"
               variant="email-change-popup"
               @cancel="$emit('cancel')">
        <div class="email-popup-card">
            <div class="form-grid">
                <label class="label">Neue E-Mail</label>
                <input ref="emailRef"
                       v-model.trim="email"
                       type="email"
                       class="input"
                       placeholder="dein.name@mail.com" />

                <label class="label">Passwort zur Bestätigung</label>
                <input v-model="password"
                       type="password"
                       class="input"
                       placeholder="••••••••" />

                <p v-if="error" class="form-error">{{ error }}</p>
            </div>
        </div>

        <template #actions>
            <PopupCancelButton @click="$emit('cancel')">Abbrechen</PopupCancelButton>
            <PopupSaveButton @click="onSave">Speichern</PopupSaveButton>
        </template>
    </BasePopup>

</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import BasePopup from './BasePopup.vue'
import PopupSaveButton from '@/components/ui/buttons/PopupSaveButton.vue'
import PopupCancelButton from '@/components/ui/buttons/PopupCancelButton.vue'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'cancel'): void; (e: 'save', p: { newEmail: string; password: string }): void }>()

const email = ref('')
const password = ref('')
const error = ref('')
const emailRef = ref<HTMLInputElement|null>(null)

watch(() => props.show, async (open) => {
  if (open) { error.value = ''; email.value = ''; password.value = ''; await nextTick(); emailRef.value?.focus() }
})

function onSave() {
  if (!email.value) { error.value = 'Bitte eine E-Mail eingeben.'; return }
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  if (!valid) { error.value = 'Bitte eine gültige E-Mail eingeben.'; return }
  if (!password.value) { error.value = 'Bitte Passwort eingeben.'; return }
  error.value = ''
  emit('save', { newEmail: email.value, password: password.value })
}
</script>

<style scoped>
    /* Wrapper nur noch für Abstände – kein eigener Card-Rand mehr */
    .email-popup-card {
        padding: 0;
        margin: 0;
        background: transparent;
        border: 0;
        box-shadow: none;
        border-radius: 0;
    }

    /* gleiche Grid-Optik wie bei den anderen Formularen */
    .form-grid {
        display: grid;
        gap: .6rem;
    }

    .label {
        font-size: .9rem;
        color: var(--text-secondary);
    }

    /* Input-Style wie bei den Profil-Cards */
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

    html.dark-mode .email-popup-card {
        background: transparent;
        border: 0;
        box-shadow: none;
    }

</style>
