<template>
    <Teleport to="body">
        <Transition name="delete-trash">
            <div v-if="deleteTrashOverlayState.visible" class="delete-trash-overlay" aria-hidden="true">
                <div v-if="deleteTrashOverlayState.chips.length" class="delete-trash-stack" :style="deleteTrashFlightStyle">
                    <span class="delete-trash-flight__badge">Gelöscht!</span>
                    <span
                        v-for="chip in deleteTrashOverlayState.chips"
                        :key="chip"
                        class="delete-trash-chip">
                        {{ chip }}
                    </span>
                </div>
                <div v-else-if="deleteTrashOverlayState.title" class="delete-trash-flight" :style="deleteTrashFlightStyle">
                    <span class="delete-trash-flight__badge">Gelöscht!</span>
                    <span class="delete-trash-flight__title">{{ deleteTrashOverlayState.title }}</span>
                </div>
                <div class="delete-trash-bin">
                    <div class="delete-trash-bin__lid"></div>
                    <div class="delete-trash-bin__body"></div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { deleteTrashOverlayState } from '@/composables/useDeleteTrashOverlay'

    const deleteTrashFlightStyle = computed(() => ({
        left: `${deleteTrashOverlayState.value.startX}px`,
        top: `${deleteTrashOverlayState.value.startY}px`,
        '--delete-fly-x': `${deleteTrashOverlayState.value.deltaX}px`,
        '--delete-fly-y': `${deleteTrashOverlayState.value.deltaY}px`,
    }))
</script>

<style scoped>
    .delete-trash-overlay {
        position: fixed;
        inset: 0;
        z-index: 1300;
        pointer-events: none;
    }

    .delete-trash-flight {
        position: fixed;
        min-width: 180px;
        max-width: min(280px, calc(100vw - 2rem));
        padding: .8rem 1rem;
        border-radius: 16px;
        border: 1px solid rgba(239, 68, 68, 0.24);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
        box-shadow: 0 18px 38px rgba(15, 23, 42, 0.2);
        transform: translate(-50%, -50%);
        animation: delete-trash-flight .86s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        overflow: visible;
    }

    .delete-trash-stack {
        position: fixed;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: .45rem;
        max-width: min(420px, calc(100vw - 2rem));
        transform: translate(-50%, -50%);
        animation: delete-trash-flight .86s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }

    .delete-trash-flight__badge {
        position: absolute;
        left: .85rem;
        top: -.72rem;
        z-index: 2;
        padding: .34rem .82rem;
        border-radius: 999px;
        border: 1px solid rgba(248, 113, 113, 0.3);
        background: linear-gradient(180deg, rgba(255, 241, 242, 0.98), rgba(254, 226, 226, 0.94));
        color: #b91c1c;
        font-size: .7rem;
        font-weight: 900;
        line-height: 1;
        letter-spacing: .16em;
        text-transform: uppercase;
        box-shadow: 0 14px 28px rgba(239, 68, 68, 0.16);
    }

    .delete-trash-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 36px;
        padding: .45rem .8rem;
        border-radius: 999px;
        border: 1px solid rgba(239, 68, 68, 0.24);
        background: radial-gradient(circle at top left, color-mix(in srgb, #ef4444 12%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, white 6%);
        box-shadow: 0 14px 28px rgba(15, 23, 42, 0.18);
        color: var(--text-primary);
        font-size: .85rem;
        font-weight: 800;
        line-height: 1;
        white-space: nowrap;
    }

    .delete-trash-flight__title {
        display: block;
        overflow: visible;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: .92rem;
        font-weight: 800;
        color: var(--text-primary);
    }

    .delete-trash-bin {
        position: fixed;
        left: 50%;
        bottom: 1.25rem;
        width: 90px;
        height: 92px;
        transform: translateX(-50%);
        filter: drop-shadow(0 20px 30px rgba(15, 23, 42, 0.26));
        animation: delete-trash-bin-pop .3s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .delete-trash-bin__lid {
        position: absolute;
        left: 50%;
        top: 2px;
        width: 62px;
        height: 12px;
        transform: translateX(-50%);
        border-radius: 999px;
        background: linear-gradient(180deg, #94a3b8, #64748b);
    }

    .delete-trash-bin__lid::before {
        content: "";
        position: absolute;
        left: 50%;
        top: -6px;
        width: 22px;
        height: 6px;
        transform: translateX(-50%);
        border-radius: 999px 999px 0 0;
        background: #64748b;
    }

    .delete-trash-bin__body {
        position: absolute;
        inset: 14px 12px 0;
        border-radius: 18px 18px 22px 22px;
        border: 2px solid rgba(71, 85, 105, 0.8);
        background: linear-gradient(180deg, rgba(226, 232, 240, 0.96), rgba(148, 163, 184, 0.88));
        overflow: hidden;
    }

    .delete-trash-bin__body::before,
    .delete-trash-bin__body::after {
        content: "";
        position: absolute;
        top: 12px;
        bottom: 12px;
        width: 4px;
        border-radius: 999px;
        background: rgba(71, 85, 105, 0.38);
    }

    .delete-trash-bin__body::before {
        left: 22px;
        box-shadow: 14px 0 0 rgba(71, 85, 105, 0.38), 28px 0 0 rgba(71, 85, 105, 0.38);
    }

    .delete-trash-enter-active,
    .delete-trash-leave-active {
        transition: opacity .22s ease;
    }

    .delete-trash-enter-from,
    .delete-trash-leave-to {
        opacity: 0;
    }

    @keyframes delete-trash-bin-pop {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(18px) scale(.92);
        }

        100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }
    }

    @keyframes delete-trash-flight {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }

        68% {
            opacity: 1;
            transform: translate(calc(-50% + var(--delete-fly-x) * .82), calc(-50% + var(--delete-fly-y) * .82)) scale(.78) rotate(-10deg);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--delete-fly-x)), calc(-50% + var(--delete-fly-y))) scale(.26) rotate(-18deg);
        }
    }

    html.dark-mode .delete-trash-flight {
        border-color: rgba(248, 113, 113, 0.28);
        background: radial-gradient(circle at top left, rgba(239, 68, 68, 0.18), transparent 60%), rgba(2, 6, 23, 0.94);
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.42);
    }

    html.dark-mode .delete-trash-flight__badge {
        border-color: rgba(248, 113, 113, 0.4);
        background: linear-gradient(180deg, rgba(127, 29, 29, 0.98), rgba(91, 18, 18, 0.94));
        color: #fecaca;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(254, 226, 226, 0.08), 0 0 22px rgba(239, 68, 68, 0.16);
    }

    html.dark-mode .delete-trash-flight__title {
        color: #f8fafc;
    }

    html.dark-mode .delete-trash-chip {
        border-color: rgba(248, 113, 113, 0.24);
        background: radial-gradient(circle at top left, rgba(239, 68, 68, 0.18), transparent 60%), rgba(2, 6, 23, 0.94);
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.42);
        color: #f8fafc;
    }

    html.dark-mode .delete-trash-bin__lid {
        background: linear-gradient(180deg, #64748b, #334155);
    }

    html.dark-mode .delete-trash-bin__lid::before {
        background: #475569;
    }

    html.dark-mode .delete-trash-bin__body {
        border-color: rgba(148, 163, 184, 0.62);
        background: linear-gradient(180deg, rgba(51, 65, 85, 0.96), rgba(15, 23, 42, 0.94));
    }

    html.dark-mode .delete-trash-bin__body::before {
        box-shadow: 14px 0 0 rgba(148, 163, 184, 0.26), 28px 0 0 rgba(148, 163, 184, 0.26);
        background: rgba(148, 163, 184, 0.26);
    }
</style>
