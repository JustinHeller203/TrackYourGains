<!--Pfad: src/components/ui/menu/PlanMenu.vue-->

<template>
    <div class="plan-menu" @click.stop>
        <EditButton title="Plan bearbeiten" @click="$emit('edit')" />
        <DeleteButton title="Plan löschen" @click="$emit('delete')" />
        <ActionIconButton title="Download"
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
    }

        .plan-menu > * {
            inline-size: auto;
        }

    html.dark-mode .plan-menu {
        border-color: rgba(148, 163, 184, 0.34);
        background: radial-gradient(circle at 18% 30%, color-mix(in srgb, #6366f1 18%, transparent), transparent 62%), radial-gradient(circle at 85% 75%, color-mix(in srgb, #22c55e 12%, transparent), transparent 70%), rgba(2, 6, 23, 0.78);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255,255,255,0.05);
    }
</style>
