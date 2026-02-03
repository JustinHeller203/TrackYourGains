<!--components/ui/menu/HoldMenu.vue-->

<template>
    <div class="hold-menu"
         :style="menuStyle"
         @pointerdown.stop
         @click.stop
         v-auto-flip="{ trigger, margin: 8, align: 'start', strategy: 'fixed' }">
        <slot />
    </div>
</template>

<script setup lang="ts">
    import vAutoFlip from '@/directives/autoFlip'

    defineProps<{
        menuStyle: Record<string, string>
        trigger?: HTMLElement | null
    }>()
</script>


<style scoped>
    .hold-menu {
        position: fixed;
        min-width: 0;
        /* Theme via CSS vars (Default = Toast-Look) */
        background: var(--hm-bg, color-mix(in srgb, var(--bg-card) 92%, #0b1220 8%));
        border: var(--hm-border, 1px solid rgba(148, 163, 184, 0.24));
        border-radius: var(--hm-radius, 14px);
        box-shadow: var(--hm-shadow, 0 16px 38px rgba(15, 23, 42, 0.22));
        backdrop-filter: var(--hm-backdrop, blur(10px));
        -webkit-backdrop-filter: var(--hm-backdrop, blur(10px));
        padding: var(--hm-pad, .35rem);
        z-index: 10000;
        left: auto;
        right: auto;
        width: max-content;
        overflow: hidden;
    }

    html.dark-mode .hold-menu {
        background: var(--hm-bg-dark, rgba(2, 6, 23, 0.82));
        border: var(--hm-border-dark, 1px solid rgba(148, 163, 184, 0.40));
        box-shadow: var(--hm-shadow-dark, 0 22px 55px rgba(0, 0, 0, 0.70));
    }


    @media (max-width: 480px) {
        .hold-menu {
            padding: .3rem;
            border-radius: 12px;
        }
    }

    .hold-menu :where(button) {
        width: 100%;
        text-align: left;
        background: transparent;
        border: 0;
        padding: .55rem .7rem;
        cursor: pointer;
        font-size: .85rem;
        line-height: 1.2;
        color: var(--text-primary);
        border-radius: 10px;
        transition: background .15s, transform .05s;
    }

    .hold-menu :where(button:hover) {
        background: var(--hm-hover, rgba(0, 0, 0, 0.06));
    }

    html.dark-mode .hold-menu :where(button:hover) {
        background: var(--hm-hover-dark, rgba(255, 255, 255, 0.06));
    }

    .hold-menu :where(button:focus-visible) {
        outline: 2px solid var(--hm-focus, color-mix(in srgb, var(--accent-primary, #4B6CB7) 55%, transparent));
        outline-offset: 2px;
    }

    .hold-menu :where(button:focus-visible) {
        outline: 2px solid color-mix(in srgb, var(--accent-primary, #4B6CB7) 55%, transparent);
        outline-offset: 2px;
    }

    .hold-menu :where(button + button) {
        margin-top: .15rem;
    }

    .hold-menu :where(.danger) {
        color: #ef4444;
    }

</style>
