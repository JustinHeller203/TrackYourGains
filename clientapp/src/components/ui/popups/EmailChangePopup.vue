<template>
    <BasePopup :show="show"
               title="E-Mail ändern"
               variant="email-change-popup"
               @cancel="$emit('cancel')">
        <div class="form-grid">
            <label class="label">Neue E-Mail</label>
            <input ref="emailRef" v-model.trim="email" type="email" class="edit-input" placeholder="dein.name@mail.com" />

            <label class="label">Passwort zur Bestätigung</label>
            <input v-model="password" type="password" class="edit-input" placeholder="••••••••" />

            <p v-if="error" class="form-error">{{ error }}</p>
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
    .form-error {
        color: rgba(220,38,38,.95);
        font-size: .9rem;
    }
</style>
