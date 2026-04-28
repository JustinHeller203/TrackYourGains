<template>
    <div class="legal-page">
        <h1>{{ t('terms.title') }}</h1>
        <p>{{ t('terms.comingSoon') }}</p>
    </div>
</template>
<script setup lang="ts">
    import { useI18n } from '@/composables/useI18n'

    const { t } = useI18n()
</script>
<style scoped>
    .legal-page {
        max-width: 800px;
        margin: 4rem auto;
        padding: 1.5rem;
        color: var(--text-primary);
    }
</style>
