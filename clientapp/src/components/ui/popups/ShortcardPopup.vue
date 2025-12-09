<template>
    <BasePopup :show="show"
               :title="title"
               :variant="variant"
               :overlayClass="overlayClass"
               :showActions="showActions"
               :cancelText="cancelText"
               :saveText="saveText"
               @cancel="$emit('cancel')"
               @save="$emit('save', formData)">
        <div class="shortcard-body">
            <slot />
        </div>
    </BasePopup>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import BasePopup from '@/components/ui/popups/BasePopup.vue'

const props = withDefaults(defineProps<{
    show: boolean
    title?: string
    variant?: string
    overlayClass?: string | string[] | Record<string, boolean>
    showActions?: boolean
}>(), {
    showActions: true,
})

defineEmits<{ (e: 'cancel'): void; (e: 'save', form: any): void }>()

// Optional: Lokale Formdaten für Shortcards
const formData = reactive({})
</script>

<style scoped>
    .shortcard-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style>
