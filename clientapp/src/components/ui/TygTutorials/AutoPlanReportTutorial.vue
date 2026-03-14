<template>
    <BaseTutorial
        :isActive="isActive"
        selector='[data-tyg="auto-report-button"]'
        fallbackSelector=".preview-card"
        title="Übung melden"
        accent="#f59e0b">
        <template #default>
            <div class="tyg-tut-text">
                Eine Übung ist falsch oder dein Gym hat sie nicht? Klicke auf den markierten Melden-Button, dann wird die Übung ausgeschlossen und der Auto-Plan direkt aktualisiert.
            </div>
        </template>

        <template #actions>
            <button type="button" class="btn primary" @click="$emit('done')">
                Verstanden
            </button>
        </template>
    </BaseTutorial>
</template>

<script setup lang="ts">
    import BaseTutorial from './BaseTutorial.vue'

    defineProps<{
        isActive: boolean
    }>()

    defineEmits<{
        (e: 'done'): void
    }>()
</script>

<style scoped>
    .tyg-tut-text {
        line-height: 1.35;
        opacity: 0.95;
        font-size: 0.98rem;
    }
</style>
