<template>
    <button class="btn-ghost" type="button" @click="$emit('click')">
        <span class="btn-icon">⬇️</span>
        <span class="btn-label"><slot>Exportieren</slot></span>
    </button>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'click'): void }>()
</script>

<style scoped>
    .btn-ghost {
        background: transparent;
        border: 1px solid var(--border-color);
        padding: .5rem .75rem;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: .9rem;
        transition: border-color .2s, color .2s, transform .1s;
    }
    @media (max-width: 600px) {
        .btn-label {
            display: none;
        }
        /* langen Text auf Handy ausblenden */
        .btn-ghost {
            padding: .5rem .6rem;
        }
            /* kompakter */
            .btn-ghost::after {
                content: attr(data-short); /* kurzes Label aus Attribut */
                margin-left: .35rem;
                font-size: .9rem;
                line-height: 1;
            }

        .btn-icon {
            margin-right: 0;
        }
        /* Icon zentriert neben Kurzlabel */
    }
        .btn-ghost:hover {
            border-color: var(--accent-primary);
            color: var(--accent-primary);
            transform: translateY(-1px);
        }

        .btn-ghost.mini {
            padding: .35rem .6rem;
            font-size: .8rem;
            border-radius: 6px;
        }

    .btn-icon {
        margin-right: .4rem;
    }

    @media (max-width: 350px) {
        .btn-ghost {
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }

            .btn-ghost::after {
                content: none;
                display: none;
                margin-left: 0;
            }

        .btn-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            line-height: 1;
            font-size: 1.1rem;
        }
    }

</style>
