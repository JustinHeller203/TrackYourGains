<!--Pfad: src/components/ui/menu/PlanMenu.vue-->

<template>
    <div class="plan-menu" @click.stop>
        <EditButton title="Plan bearbeiten" @click="$emit('edit')" />
        <ActionIconButton title="Duplizieren"
                          aria-label="Trainingsplan duplizieren"
                          @click="$emit('duplicate')">
            ⧉
        </ActionIconButton>
        <DeleteButton title="Plan löschen" @click="$emit('delete')" />
        <ActionIconButton title="Exportieren"
                          aria-label="Trainingsplan herunterladen"
                          @click="$emit('download')">
            ⬇️
        </ActionIconButton>
    </div>
</template>

<script setup lang="ts">
    import EditButton from '@/components/ui/buttons/EditButton.vue'
    import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
    import ActionIconButton from '@/components/ui/buttons/ActionIconButton.vue'

    defineEmits<{
        (e: 'edit'): void
        (e: 'duplicate'): void
        (e: 'delete'): void
        (e: 'download'): void
    }>()
</script>

<style scoped>
    .plan-menu {
        position: absolute;
        right: .5rem;
        top: calc(100% + .55rem);
        display: flex;
        gap: .35rem;
        padding: .5rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.28);
        background: radial-gradient(circle at 18% 30%, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 62%), radial-gradient(circle at 85% 75%, color-mix(in srgb, var(--accent-secondary) 12%, transparent), transparent 70%), color-mix(in srgb, var(--bg-card) 88%, white 12%);
        box-shadow: 0 18px 44px rgba(15, 23, 42, 0.22), inset 0 1px 0 rgba(255,255,255,0.08);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        z-index: 1200;
        transform-origin: top right;
        animation: plan-menu-burst .22s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

        .plan-menu > * {
            inline-size: auto;
            opacity: 0;
            transform: translate3d(10px, -8px, 0) scale(.92);
            animation: plan-menu-action-burst .28s cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }

        .plan-menu > *:nth-child(1) { animation-delay: .02s; }
        .plan-menu > *:nth-child(2) { animation-delay: .05s; }
        .plan-menu > *:nth-child(3) { animation-delay: .08s; }
        .plan-menu > *:nth-child(4) { animation-delay: .11s; }

    html.dark-mode .plan-menu {
        border-color: rgba(148, 163, 184, 0.34);
        background: radial-gradient(circle at 18% 30%, color-mix(in srgb, #6366f1 18%, transparent), transparent 62%), radial-gradient(circle at 85% 75%, color-mix(in srgb, #22c55e 12%, transparent), transparent 70%), rgba(2, 6, 23, 0.78);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255,255,255,0.05);
    }

    @keyframes plan-menu-burst {
        0% {
            opacity: 0;
            transform: translateY(-6px) scale(.94);
            filter: blur(8px);
        }

        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
        }
    }

    @keyframes plan-menu-action-burst {
        0% {
            opacity: 0;
            transform: translate3d(10px, -8px, 0) scale(.92);
        }

        100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
        }
    }
</style>
