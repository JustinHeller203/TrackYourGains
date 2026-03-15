<template>
    <div class="training-sim-preview">
        <div
            v-if="isPhonePreviewSimulationDemo && previewTouch.visible"
            class="preview-touch"
            :class="{ 'is-pressing': previewTouch.pressing }"
            :style="{ left: `${previewTouch.x}px`, top: `${previewTouch.y}px` }">
            <span class="preview-touch__dot"></span>
        </div>

        <TrainingPlansList
            ref="trainingPlansListRef"
            :guestPlans="[previewPlan]"
            :customExercises="[]"
            :openEditPopup="noopEdit"
            :openDeletePopup="noopDelete"
            :openDownloadPopup="noopDownload"
            :addToast="noopToast"
            :onEditInBuilder="noopEditBuilder"
            :onRemoveCustomExercise="noopRemoveCustomExercise"
            :onGuestDeletePlan="noopGuestDeletePlan"
            :onGuestEditPlan="noopGuestEditPlan"
            :selectedPlanOverride="null"
            :onSelectedPlanChange="noopSelectedPlanChange"
        />
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
    import { useRoute } from 'vue-router'
    import TrainingPlansList from '@/components/ui/training/TrainingPlansList.vue'

    type DemoPlan = {
        id: string
        name: string
        isFavorite: boolean
        exerciseCount: number
        exercises: Array<{ exercise: string; sets: number; reps: number; type: 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer' }>
    }

    type TrainingPlansListExpose = {
        openSimulationForPreview: (planId: string) => void
    }

    const route = useRoute()
    const demoTimers: number[] = []
    const previewTouch = ref({ visible: false, x: 0, y: 0, pressing: false })
    const trainingPlansListRef = ref<TrainingPlansListExpose | null>(null)

    const isPhonePreviewSimulationDemo = computed(
        () => route.query.preview === 'phone' && route.query.demo === 'simulation'
    )

    const previewPlan: DemoPlan = {
        id: 'landing-preview-plan',
        name: 'Beispiel Trainingsplan',
        isFavorite: true,
        exerciseCount: 1,
        exercises: [
            { exercise: 'Bankdruecken', sets: 1, reps: 8, type: 'kraft' },
        ],
    }

    const queueDemoStep = (delay: number, task: () => void) => {
        demoTimers.push(window.setTimeout(task, delay))
    }

    const clearDemoTimers = () => {
        demoTimers.forEach(id => window.clearTimeout(id))
        demoTimers.length = 0
    }

    const waitForElement = (selector: string, timeout = 5000) => new Promise<HTMLElement | null>((resolve) => {
        const found = document.querySelector<HTMLElement>(selector)
        if (found) {
            resolve(found)
            return
        }

        const startedAt = window.performance.now()
        const tick = () => {
            const target = document.querySelector<HTMLElement>(selector)
            if (target) {
                resolve(target)
                return
            }

            if (window.performance.now() - startedAt >= timeout) {
                resolve(null)
                return
            }

            window.requestAnimationFrame(tick)
        }

        window.requestAnimationFrame(tick)
    })

    const movePreviewTouch = (selector: string, xFactor = 0.5, yFactor = 0.5) => {
        const target = document.querySelector<HTMLElement>(selector)
        if (!target) return

        const rect = target.getBoundingClientRect()
        previewTouch.value = {
            visible: true,
            x: rect.left + rect.width * xFactor,
            y: rect.top + rect.height * yFactor,
            pressing: false,
        }
    }

    const clickSelector = (selector: string) => {
        const target = document.querySelector<HTMLElement>(selector)
        target?.click()
    }

    const showTouchOnElement = (target: HTMLElement) => {
        const rect = target.getBoundingClientRect()
        previewTouch.value = {
            visible: true,
            x: rect.left + rect.width * 0.5,
            y: rect.top + rect.height * 0.5,
            pressing: false,
        }
    }

    const pressPreviewTouch = (duration = 260) => {
        previewTouch.value = {
            ...previewTouch.value,
            pressing: true,
        }

        queueDemoStep(duration, () => {
            previewTouch.value = {
                ...previewTouch.value,
                pressing: false,
            }
        })
    }

    const touchAndClickSelector = (selector: string, touchDelay: number, clickLeadMs: number, xFactor = 0.5, yFactor = 0.5) => {
        queueDemoStep(touchDelay, () => {
            movePreviewTouch(selector, xFactor, yFactor)
        })

        queueDemoStep(touchDelay + clickLeadMs, () => {
            pressPreviewTouch()
        })

        queueDemoStep(touchDelay + clickLeadMs + 360, () => {
            clickSelector(selector)
        })
    }

    const notifyPreviewSimulationCompleted = () => {
        if (!isPhonePreviewSimulationDemo.value) return

        window.parent?.postMessage(
            {
                type: 'landing-phone-demo-complete',
                demo: 'simulation',
                run: Number(route.query?.run ?? 0),
            },
            window.location.origin
        )
    }

    const setFieldValue = (selector: string, value: string) => {
        const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)
        if (!field) return

        field.focus()
        field.value = value
        field.dispatchEvent(new Event('input', { bubbles: true }))
        field.dispatchEvent(new Event('change', { bubbles: true }))
    }

    const typeIntoField = (selector: string, value: string, startDelay: number, stepMs = 340) => {
        queueDemoStep(startDelay, () => {
            const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)
            if (!field) return

            movePreviewTouch(selector, 0.5, 0.5)
            pressPreviewTouch(240)
            field.focus()
            field.value = ''
            field.dispatchEvent(new Event('input', { bubbles: true }))
            field.dispatchEvent(new Event('change', { bubbles: true }))

            Array.from(value).forEach((char, index) => {
                queueDemoStep((index + 1) * stepMs, () => {
                    movePreviewTouch(selector, 0.5, 0.5)
                    pressPreviewTouch(220)
                    field.focus()
                    field.value = `${field.value}${char}`
                    field.dispatchEvent(new Event('input', { bubbles: true }))
                    field.dispatchEvent(new Event('change', { bubbles: true }))
                })
            })
        })
    }

    async function startSimulationDemo() {
        if (!isPhonePreviewSimulationDemo.value) return

        const playButton = await waitForElement('[data-preview-play="simulation-demo"]')
        if (!playButton) return

        const rect = playButton.getBoundingClientRect()
        const top = rect.top + window.scrollY - (window.innerHeight * 0.5) + (rect.height * 0.5)
        window.scrollTo({ top, behavior: 'auto' })

        queueDemoStep(950, () => {
            showTouchOnElement(playButton)
        })

        queueDemoStep(1450, () => {
            pressPreviewTouch()
        })

        queueDemoStep(1720, () => {
            trainingPlansListRef.value?.openSimulationForPreview(previewPlan.id)
        })

        touchAndClickSelector('.sim-bottom .pab-btn:not(.is-ghost)', 3800, 900)

        typeIntoField('#set-0-weight', '80', 7600, 380)
        typeIntoField('#set-0-reps', '8', 9800, 520)

        touchAndClickSelector('.action-save', 12450, 1500)
        touchAndClickSelector('.sim-bottom .pab-btn:not(.is-ghost)', 16050, 1650)

        queueDemoStep(18550, () => {
            notifyPreviewSimulationCompleted()
        })
    }

    const restartSimulationDemo = async () => {
        clearDemoTimers()
        previewTouch.value = { visible: false, x: 0, y: 0, pressing: false }
        await nextTick()
        await startSimulationDemo()
    }

    const noopToast = () => {}
    const noopEdit = () => {}
    const noopDelete = (action: () => void) => { void action }
    const noopDownload = () => {}
    const noopEditBuilder = () => {}
    const noopRemoveCustomExercise = () => {}
    const noopGuestDeletePlan = () => {}
    const noopGuestEditPlan = () => {}
    const noopSelectedPlanChange = () => {}

    onMounted(async () => {
        await restartSimulationDemo()
    })

    watch(
        () => route.query.run,
        () => {
            if (!isPhonePreviewSimulationDemo.value) return
            void restartSimulationDemo()
        }
    )

    onUnmounted(() => {
        clearDemoTimers()
    })
</script>

<style scoped>
    .training-sim-preview {
        min-height: 100vh;
        display: grid;
        align-content: center;
        background: transparent;
        overflow: hidden;
    }

    .preview-touch {
        position: fixed;
        z-index: 12050;
        width: 1.15rem;
        height: 1.15rem;
        margin-left: -0.575rem;
        margin-top: -0.575rem;
        pointer-events: none;
    }

    .preview-touch__dot {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.96);
        border: 2px solid rgba(29, 78, 216, 0.92);
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
        animation: previewTouchPulse 1.2s ease-out infinite;
    }

    .preview-touch.is-pressing .preview-touch__dot {
        transform: scale(0.72);
        box-shadow: 0 0 0 0.4rem rgba(59, 130, 246, 0.12);
        transition: transform 90ms ease, box-shadow 90ms ease;
    }

    @keyframes previewTouchPulse {
        0% {
            transform: scale(0.88);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.34);
        }
        70% {
            transform: scale(1);
            box-shadow: 0 0 0 0.7rem rgba(59, 130, 246, 0);
        }
        100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
    }
</style>
