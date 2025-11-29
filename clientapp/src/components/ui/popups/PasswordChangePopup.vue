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
                   class="edit-input"
                   @keydown.enter.prevent="$emit('save', form)" />

            <label class="label">Neues Passwort</label>
            <input v-model="form.next"
                   type="password"
                   class="edit-input"
                   @keydown.enter.prevent="$emit('save', form)" />

            <label class="label">Neues Passwort (wiederholen)</label>
            <input v-model="form.repeat"
                   type="password"
                   class="edit-input"
                   @keydown.enter.prevent="$emit('save', form)" />

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
    .form-error {
        color: rgba(220, 38, 38, 0.95);
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }
</style>
