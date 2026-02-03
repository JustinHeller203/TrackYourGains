<!--Pfad: components/ui/buttons/ResetButton.vue-->
<template>
    <button class="btn-danger-ghost"
            type="button"
            title="Zurücksetzen"
            aria-label="Zurücksetzen"
            @click="$emit('click')">
        <span class="btn-icon">🔄️</span>
        <span class="btn-label"><slot>Zurücksetzen</slot></span>
    </button>
</template>

<script setup lang="ts">
    defineEmits<{ (e: 'click'): void }>()
</script>

<style scoped>
    .btn-danger-ghost {
        background: transparent;
        border: 1px solid #b91c1c33;
        padding: .5rem .75rem;
        border-radius: 8px;
        cursor: pointer;
        color: #b91c1c;
        font-size: .9rem;
        transition: border-color .2s, color .2s, transform .1s;

    }

    @media (max-width: 600px) {
        .btn-label {
            display: none;
        }

        .btn-danger-ghost {
            padding: .5rem .6rem;
        }

            .btn-danger-ghost::after {
                content: attr(data-short);
                margin-left: .35rem;
                font-size: .9rem;
                line-height: 1;
            }

        .btn-icon {
            margin-right: 0;
        }
    }

    .btn-danger-ghost:hover {
        border-color: #b91c1c;
        color: #7f1d1d;
        transform: translateY(-1px);
    }

    .btn-icon {
        margin-right: .4rem;
    }

    @media (max-width: 350px) {
        .btn-danger-ghost {
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }

            .btn-danger-ghost::after {
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
