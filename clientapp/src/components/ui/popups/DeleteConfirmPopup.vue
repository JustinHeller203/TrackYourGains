<template>
    <BasePopup :show="show && confirmDeleteEnabled"
               title="Löschen bestätigen"
               overlayClass="delete-popup"
               @cancel="emit('cancel')">
        <p class="popup-message">Willst du das wirklich löschen?</p>

        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                Abbrechen
            </PopupActionButton>

            <PopupActionButton autofocus danger @click="$emit('confirm')">
                Löschen
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import { LS_CONFIRM_DELETE_ENABLED } from '@/constants/storageKeys'

    const props = defineProps<{ show: boolean }>()
    const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()

    const confirmDeleteEnabled = ref(true)

    const readSetting = () => {
        const stored = localStorage.getItem(LS_CONFIRM_DELETE_ENABLED)
        confirmDeleteEnabled.value = stored === null ? true : stored === 'true'
    }

    const onConfirmDeleteChanged = (e: Event) => {
        confirmDeleteEnabled.value = Boolean((e as CustomEvent).detail)
    }

    onMounted(() => {
        readSetting()
        window.addEventListener('confirm-delete-changed', onConfirmDeleteChanged)
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
</style>
