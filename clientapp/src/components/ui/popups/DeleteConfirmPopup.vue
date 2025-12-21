<template>
    <BasePopup :show="show && confirmDeleteEnabled"
               overlayClass="delete-popup"
               @cancel="emit('cancel')">
        <template #default>
            <h3 class="popup-title">Löschen bestätigen</h3>
            <p class="popup-message">Willst du das wirklich löschen?</p>
        </template>

        <template #actions>
            <PopupDeleteButton autofocus @click="$emit('confirm')">Löschen</PopupDeleteButton>
            <PopupCancelButton @click="$emit('cancel')">Abbrechen</PopupCancelButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupDeleteButton from '@/components/ui/buttons/popup/PopupDeleteButton.vue'
    import PopupCancelButton from '@/components/ui/buttons/popup/PopupCancelButton.vue'

    const props = defineProps<{ show: boolean }>()
    const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()

    const confirmDeleteEnabled = ref(true)

    const readSetting = () => {
        const stored = localStorage.getItem('confirmDeleteEnabled')
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
    /* exakt wie vorher in Training.vue */
    .popup-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .popup-message {
        font-size: 1rem;
        line-height: 1.5;
        margin: 0 0 1rem;
    }
</style>
