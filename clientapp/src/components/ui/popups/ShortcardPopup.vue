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
import { computed, reactive } from 'vue'
import BasePopup from '@/components/ui/popups/BasePopup.vue'
import { useI18n } from '@/composables/useI18n'

    const props = withDefaults(defineProps<{
        show: boolean
        title?: string
        variant?: string
        overlayClass?: string | string[] | Record<string, boolean>
        showActions?: boolean
        cancelText?: string
        saveText?: string
    }>(), {
        showActions: true,
    })
const { t } = useI18n()
const cancelText = computed(() => props.cancelText ?? t('common.cancel'))
const saveText = computed(() => props.saveText ?? t('common.save'))

defineEmits<{ (e: 'cancel'): void; (e: 'save', form: any): void }>()

// Optional: Lokale Formdaten f?r Shortcards
const formData = reactive({})
</script>

<style scoped>
    .shortcard-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style>
