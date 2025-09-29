<template>
    <BasePopup :show="show"
               :title="title"
               overlayClass="validation-popup"
               @cancel="$emit('close')">
        <div class="validation-body">
            <div class="icon-wrap" aria-hidden="true">⚠️</div>
            <p v-if="lead" class="lead">{{ lead }}</p>

            <ul class="error-list" role="list">
                <li v-for="(err, i) in errors" :key="i">
                    <span class="bullet" aria-hidden="true"></span>
                    <span class="msg">{{ err }}</span>
                </li>
            </ul>
        </div>

        <template #actions>
            <PopupSaveButton autofocus @click="$emit('close')">
                OK
            </PopupSaveButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import BasePopup from './BasePopup.vue'
    import PopupSaveButton from '@/components/ui/buttons/PopupSaveButton.vue'

    withDefaults(defineProps<{
        show: boolean
        errors: string[]
        title?: string
        lead?: string
    }>(), {
        title: 'Eingabefehler',
        lead: 'Bitte überprüfe die folgenden Punkte:'
    })

    defineEmits<{ (e: 'close'): void }>()
</script>
<style scoped>
    .validation-body {
        --validation-accent: #ef4444;
        display: flex;
        flex-direction: column;
        gap: .75rem;
        text-align: left;
        align-items: center;
    }

    :global(html.dark-mode) .validation-body {
        --validation-accent: #f87171;
    }

    .icon-wrap {
        font-size: 1.6rem;
    }

    .lead {
        margin: 0;
        font-size: .95rem;
        color: var(--text-secondary);
        text-align: center;
    }

    .error-list {
        width: 100%;
        margin: .25rem 0 0;
        padding: 0;
        list-style: none;
    }

        .error-list li {
            display: grid;
            grid-template-columns: 6px 1fr;
            gap: .7rem;
            align-items: start;
            padding: .7rem .9rem;
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 10px;
        }

            .error-list li + li {
                margin-top: .55rem;
            }

    .bullet {
        align-self: stretch;
        width: 6px;
        border-radius: 6px;
        background: var(--validation-accent);
    }

    .msg {
        font-size: .95rem;
        color: var(--text-primary);
        padding-top: .1rem;
    }
</style>








