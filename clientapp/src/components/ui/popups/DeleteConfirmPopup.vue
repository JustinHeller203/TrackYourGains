<template>
    <BasePopup :show="show"
               overlayClass="delete-popup"
               @cancel="$emit('cancel')">
        <template #default>
            <h3 class="popup-title">LÃ¶schen bestÃ¤tigen</h3>
            <p class="popup-message">Willst du das wirklich lÃ¶schen?</p>
        </template>

        <template #actions>
            <PopupDeleteButton autofocus @click="$emit('confirm')">LÃ¶schen</PopupDeleteButton>
            <PopupCancelButton @click="$emit('cancel')">Abbrechen</PopupCancelButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import BasePopup from './BasePopup.vue'
    import PopupDeleteButton from '@/components/ui/buttons/PopupDeleteButton.vue'
    import PopupCancelButton from '@/components/ui/buttons/PopupCancelButton.vue'

    defineProps<{ show: boolean }>()
    defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
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
