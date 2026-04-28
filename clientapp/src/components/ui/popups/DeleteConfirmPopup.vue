<!--Pfad: src/components/ui/menu/DeleteConfirmPopup.vue-->

<template>
    <BasePopup :show="show && confirmDeleteEnabled"
               :title="t('deleteConfirm.title')"
               overlayClass="delete-popup"
               @cancel="emit('cancel')">
        <p class="popup-message">{{ t('deleteConfirm.message') }}</p>

        <label class="dontshow" @click.stop>
            <input v-model="dontShowAgain"
                   type="checkbox"
                   class="dontshow-input"
                   @change.stop />
            <span class="dontshow-label">{{ t('deleteConfirm.dontShowAgain') }}</span>
        </label>
        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                {{ t('common.cancel') }}
            </PopupActionButton>

            <PopupActionButton autofocus danger @click="onConfirm">
                {{ t('common.delete') }}
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import { LS_CONFIRM_DELETE_ENABLED } from '@/constants/storageKeys'
    import { useAuthStore } from '@/store/authStore'
    import { useSettingsStore } from '@/store/settingsStore'
    import { useI18n } from '@/composables/useI18n'

    const props = defineProps<{ show: boolean }>()
    const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
    const authStore = useAuthStore()
    const settingsStore = useSettingsStore()

    const { t } = useI18n()

    const confirmDeleteEnabled = ref(true)

    const readSetting = () => {
        const stored = localStorage.getItem(LS_CONFIRM_DELETE_ENABLED)
        const enabled = stored === null ? true : stored === 'true'
        confirmDeleteEnabled.value = enabled
        dontShowAgain.value = !enabled
    }

    const onConfirmDeleteChanged = (e: Event) => {
        confirmDeleteEnabled.value = Boolean((e as CustomEvent).detail)
    }

    const dontShowAgain = ref(false)

    const setConfirmDeleteEnabled = async (enabled: boolean) => {
        localStorage.setItem(LS_CONFIRM_DELETE_ENABLED, String(enabled))
        confirmDeleteEnabled.value = enabled

        settingsStore.dto = {
            ...settingsStore.dto,
            confirmDeleteEnabled: enabled,
        }

        if (authStore.user) {
            try {
                await settingsStore.saveToBackend()
            } catch {
                // Fallback bleibt lokal + im Store aktiv.
            }
        } else {
            window.dispatchEvent(new CustomEvent('confirm-delete-changed', { detail: enabled }))
        }
    }

    const onConfirm = async () => {
        // User will "Nicht mehr anzeigen" -> Confirm-Dialog künftig AUS
        // (sonst bleibt er AN)
        await setConfirmDeleteEnabled(!dontShowAgain.value)

        emit('confirm')
    }

    onMounted(() => {
        readSetting()
        window.addEventListener('confirm-delete-changed', onConfirmDeleteChanged)
    })

    watch(dontShowAgain, () => {
        // absichtlich KEIN persist hier
        // nur merken – gespeichert wird erst bei "Löschen"
    })

    onBeforeUnmount(() => {
        window.removeEventListener('confirm-delete-changed', onConfirmDeleteChanged)
    })

    // Wenn Confirm-Delete AUS ist und jemand das Popup „öffnen“ will → direkt bestätigen, ohne UI
    watch(
        () => props.show,
        (v) => {
            if (v && !confirmDeleteEnabled.value) emit('confirm')
        }
    )
</script>


<style scoped>
    .popup-message {
        margin: 0;
        font-size: 1rem;
        line-height: 1.5;
        color: var(--text-secondary);
        text-align: center;
    }

    .dontshow {
        margin-top: 0.75rem;
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        user-select: none;
        cursor: pointer;
    }

    .dontshow-input {
        width: 18px;
        height: 18px;
        accent-color: var(--accent-primary);
        cursor: pointer;
    }

    .dontshow-label {
        color: var(--text-secondary);
        font-weight: 700;
        font-size: 0.98rem;
        line-height: 1.2;
    }

    .dontshow:focus-within .dontshow-label {
        color: var(--text-primary);
    }

</style>
