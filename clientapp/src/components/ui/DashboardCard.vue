<template>
    <div class="card"
         :style="{ cursor: clickable ? 'pointer' : 'default' }"
         :tabindex="clickable ? 0 : undefined"
         :role="clickable ? 'button' : undefined"
         @click="handleClick"
         @keydown.enter.space="handleClick">
        <h3 class="card-title">{{ title }}</h3>
        <p class="card-info"><slot>{{ info }}</slot></p>
    </div>
</template>

<script setup lang="ts">
    const props = defineProps<{
        title: string
        info?: string | number
        clickable?: boolean
    }>()

    const emit = defineEmits<{ (e: 'click'): void }>()

    const handleClick = () => {
        if (props.clickable) emit('click')
    }
</script>

<style scoped>
    /* Kopie deiner .card-Styles, weil Parent-Styles (scoped) nicht in Children greifen */
    .card {
        flex: 1;
        min-width: 200px;
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        position: relative;
    }

        .card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-hover);
            border-color: var(--accent-primary);
        }

        .card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(255, 255, 255, 0));
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: -1;
        }

        .card:hover::before {
            opacity: 1;
        }

    .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }

    .card-info {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--accent-primary);
    }
</style>
