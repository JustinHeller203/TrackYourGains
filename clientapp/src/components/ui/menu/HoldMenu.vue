<!--components/ui/menu/HoldMenu.vue-->

<template>
    <div class="hold-menu"
         :style="menuStyle"
         @pointerdown.stop
         @click.stop
         v-auto-flip="{ margin: 8, align: 'start', strategy: 'fixed' }">
        <slot />
    </div>
</template>

<script setup lang="ts">
    import vAutoFlip from '@/directives/autoFlip'

    defineProps<{
        menuStyle: Record<string, string>
    }>()
</script>


<style scoped>
    .hold-menu {
        position: absolute;
        /* Breite kommt dynamisch via :style â€“ keine Mindestbreite mehr erzwingen */
        min-width: 0;
        background: var(--bg-card, #fff);
        border: 1px solid rgba(0,0,0,.12);
        border-radius: 8px;
        box-shadow: 0 6px 18px rgba(0,0,0,.18);
        padding: .25rem;
        z-index: 10000;
        /* Folge dem Trigger-Content sauber */
        left: auto;
        right: auto;
        width: max-content;
    }

    @media (max-width: 480px) {
        .hold-menu {
            padding: .2rem;
        }

            .hold-menu :where(button) {
                padding: .45rem .55rem;
            }
    }

    .hold-menu :where(button) {
        width: 100%;
        text-align: left;
        background: transparent;
        border: 0;
        padding: .5rem .6rem;
        cursor: pointer;
        font-size: .85rem;
        border-radius: 6px;
    }

    .hold-menu :where(button:hover) {
        background: rgba(0,0,0,.06);
    }

    html.dark-mode .hold-menu :where(button:hover) {
        background: rgba(255,255,255,.06);
    }

    .hold-menu :where(.danger) {
        color: #ef4444;
    }

</style>
