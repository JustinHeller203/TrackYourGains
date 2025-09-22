<template>
  <BasePopup
    :show="show"
    title="Profil löschen"
    variant="delete-account-popup"
    @cancel="$emit('cancel')"
  >
    <div class="form-grid">
      <p class="danger-text">Das löscht <strong>alle</strong> deine Kontodaten unwiderruflich.</p>

      <label class="label">Passwort zur Bestätigung</label>
      <input ref="pwdRef" v-model="password" type="password" class="edit-input" placeholder="••••••••" />

      <label class="label">Zum Bestätigen tippe: <code>{{ confirmPhrase }}</code></label>
      <input v-model.trim="phrase" type="text" class="edit-input" :placeholder="confirmPhrase" />

      <p v-if="error" class="form-error">{{ error }}</p>
    </div>

    <template #actions>
      <PopupCancelButton @click="$emit('cancel')">Abbrechen</PopupCancelButton>
      <PopupSaveButton class="!bg-red-600" @click="onConfirm">Endgültig löschen</PopupSaveButton>
    </template>
  </BasePopup>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import BasePopup from './BasePopup.vue'
import PopupSaveButton from '@/components/ui/buttons/PopupSaveButton.vue'
import PopupCancelButton from '@/components/ui/buttons/PopupCancelButton.vue'

const props = defineProps<{ show: boolean; confirmPhrase?: string }>()
const emit = defineEmits<{ (e:'cancel'):void; (e:'confirm', p:{ password:string }):void }>()
const confirmPhrase = props.confirmPhrase ?? 'KONTO LÖSCHEN'

const password = ref('')
const phrase = ref('')
const error = ref('')
const pwdRef = ref<HTMLInputElement|null>(null)

watch(() => props.show, async (open) => {
  if (open) {
    error.value = ''; password.value = ''; phrase.value = '';
    await nextTick(); pwdRef.value?.focus()
  }
})

function onConfirm() {
  if (!password.value) { error.value = 'Bitte Passwort eingeben.'; return }
  if (phrase.value !== confirmPhrase) { error.value = `Bitte exakt „${confirmPhrase}“ eingeben.`; return }
  error.value = ''
  emit('confirm', { password: password.value })
}
</script>

<style scoped>
.danger-text { color: rgba(220,38,38,.95); }
.form-error { color: rgba(220,38,38,.95); font-size: .9rem; }
</style>
