<template>
    <BasePopup :show="show"
               title="Passwort ändern"
               variant="password-change-popup"
               @cancel="$emit('cancel')">
        <!-- Body -->
        <div class="form-grid">
            <label class="label">Aktuelles Passwort</label>
            <input ref="currentRef"
                   v-model="form.current"
                   type="password"
                   class="input"
                   placeholder="••••••••"
                   @keydown.enter.prevent="onSave" />

            <label class="label">Neues Passwort</label>
            <input v-model="form.next"
                   type="password"
                   class="input"
                   placeholder="Mind. 8 Zeichen"
                   @keydown.enter.prevent="onSave" />

            <label class="label">Neues Passwort (wiederholen)</label>
            <input v-model="form.repeat"
                   type="password"
                   class="input"
                   placeholder="Noch einmal eingeben"
                   @keydown.enter.prevent="onSave" />

            <p v-if="error" class="form-error">{{ error }}</p>
        </div>


        <!-- Footer-Buttons -->
        <template #actions>
            <PopupCancelButton @click="$emit('cancel')">Abbrechen</PopupCancelButton>
            <PopupSaveButton @click="onSave">Speichern</PopupSaveButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { ref, watch, nextTick } from "vue";
    import BasePopup from "./BasePopup.vue";
    import PopupSaveButton from "@/components/ui/buttons/PopupSaveButton.vue";
    import PopupCancelButton from "@/components/ui/buttons/PopupCancelButton.vue";

    const props = defineProps<{ show: boolean }>();

    const emit = defineEmits<{
        (e: "cancel"): void;
        (e: "save", payload: { current: string; next: string; repeat: string }): void;
    }>();

    const form = ref({ current: "", next: "", repeat: "" });
    const error = ref("");
    const currentRef = ref<HTMLInputElement | null>(null);

    // Autofokus wenn ge�ffnet
    watch(
        () => props.show,
        async (open) => {
            if (open) {
                await nextTick();
                currentRef.value?.focus();
            }
        }
    );

    function onSave() {
        const { current, next, repeat } = form.value;
        if (!current || !next || !repeat) {
            error.value = "Bitte alle Felder ausfüllen.";
            return;
        }
        if (next.length < 8) {
            error.value = "Neues Passwort muss mindestens 8 Zeichen haben.";
            return;
        }
        if (next !== repeat) {
            error.value = "Passw�rter stimmen nicht überein.";
            return;
        }
        error.value = "";
        emit("save", { current, next, repeat });
    }
</script>

<style scoped>
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
</style>
