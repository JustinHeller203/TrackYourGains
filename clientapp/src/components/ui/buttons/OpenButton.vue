<!--Pfad: components/ui/buttons/OpenButton.vue-->
<template>
    <div class="open-btn-wrap">
        <BaseButton :type="type"
                    :title="title"
                    :aria-label="ariaLabel || title"
                    :disabled="disabled"
                    @click="$emit('click', $event)">
            Öffnen
        </BaseButton>
    </div>
</template>

<script setup lang="ts">
    import BaseButton from '@/components/ui/buttons/BaseButton.vue'

    defineProps<{
        type?: 'button' | 'submit' | 'reset'
        title?: string
        ariaLabel?: string
        disabled?: boolean
    }>()

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
    .open-btn-wrap .action-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        transition: color 0.2s, text-shadow 0.2s, transform 0.1s;
        color: #10b981;
        /* Zentrierung im Button selbst (zusätzlich zum Container) */
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }

        .open-btn-wrap .action-btn:hover {
            color: #064e3b;
            text-shadow: 0 0 8px rgba(6, 78, 59, 0.5), 0 0 4px rgba(6, 78, 59, 0.5);
            transform: scale(1.1);
        }

    html.dark-mode .open-btn-wrap .action-btn:hover {
        color: #10b981;
        text-shadow: 0 0 8px #10b981, 0 0 4px #10b981;
    }
</style>
