<template>
    <span class="value-reel" :class="{ 'is-active': animationActive, 'is-muted': muted }" :aria-label="text">
        <span class="sr-only">{{ text }}</span>
        <span class="value-reel__base" :class="{ 'is-hidden': animationActive, 'is-jumping': jumpActive }" aria-hidden="true">{{ displayText }}</span>

        <span v-if="animationActive" class="value-reel__drum" aria-hidden="true">
            <span class="value-reel__fade value-reel__fade--top"></span>
            <span class="value-reel__fade value-reel__fade--bottom"></span>
            <span class="value-reel__focus"></span>
            <span
                class="value-reel__track"
                :style="{ transform: `translateY(calc((${trackOffset} - 1) * -1.18em))`, transitionDuration: `${trackDuration}ms` }">
                <span v-for="(frame, index) in frameTexts" :key="`${trackKey}-${index}-${frame}`" class="value-reel__frame">
                    {{ frame }}
                </span>
            </span>
        </span>
    </span>
</template>

<script setup lang="ts">
    import { nextTick, onUnmounted, ref, watch } from 'vue'

    const props = defineProps<{
        text: string
        muted?: boolean
        animateFrom?: string | null
        animateTo?: string | null
        animateNonce?: number
        jumpNonce?: number
    }>()

    type ParsedValue = {
        prefix: string
        value: number
        decimals: number
        suffix: string
    }

    const displayText = ref(props.text)
    const animationActive = ref(false)
    const frameTexts = ref<string[]>([])
    const trackOffset = ref(0)
    const trackDuration = ref(0)
    const trackKey = ref(0)
    const jumpActive = ref(false)
    let animationTimer: ReturnType<typeof setTimeout> | null = null
    let jumpTimer: ReturnType<typeof setTimeout> | null = null

    function stopAnimation(finalText?: string) {
        if (animationTimer) {
            clearTimeout(animationTimer)
            animationTimer = null
        }
        animationActive.value = false
        frameTexts.value = []
        trackOffset.value = 0
        trackDuration.value = 0
        if (finalText !== undefined) displayText.value = finalText
    }

    function triggerJump() {
        if (jumpTimer) clearTimeout(jumpTimer)
        jumpActive.value = false
        requestAnimationFrame(() => {
            jumpActive.value = true
            jumpTimer = setTimeout(() => {
                jumpActive.value = false
                jumpTimer = null
            }, 260)
        })
    }

    function parseValue(text: string): ParsedValue | null {
        const match = text.match(/^([^0-9-]*)(-?\d+(?:[.,]\d+)?)(.*)$/)
        if (!match) return null

        const rawNumber = match[2].replace(',', '.')
        const value = Number(rawNumber)
        if (Number.isNaN(value)) return null

        return {
            prefix: match[1],
            value,
            decimals: (match[2].split(/[.,]/)[1] ?? '').length,
            suffix: match[3],
        }
    }

    function formatValue(parsed: ParsedValue, value: number) {
        return `${parsed.prefix}${value.toFixed(parsed.decimals)}${parsed.suffix}`
    }

    function buildFrames(previousText: string, nextText: string) {
        const previous = parseValue(previousText)
        const next = parseValue(nextText)

        if (!previous || !next) return { frames: [nextText], startOffset: 0, targetOffset: 0 }
        if (previous.prefix !== next.prefix || previous.suffix !== next.suffix) return { frames: [nextText], startOffset: 0, targetOffset: 0 }

        const decimals = Math.max(previous.decimals, next.decimals)
        const scale = 10 ** decimals
        const start = Math.round(previous.value * scale)
        const end = Math.round(next.value * scale)

        if (start === end) {
            const finalText = formatValue({ ...next, decimals }, end / scale)
            return { frames: [finalText], startOffset: 0, targetOffset: 0 }
        }

        const direction = end > start ? 1 : -1
        const distance = Math.abs(end - start)
        const stride = Math.max(1, Math.ceil(distance / 24))
        const values: string[] = []

        for (let current = start; direction > 0 ? current <= end : current >= end; current += direction * stride) {
            values.push(formatValue({ ...next, decimals }, current / scale))
        }

        const finalText = formatValue({ ...next, decimals }, end / scale)
        if (values[values.length - 1] !== finalText) values.push(finalText)

        const topPad = ''
        const bottomPad = ''

        if (direction > 0) {
            const frames = [topPad, ...values, bottomPad]
            return {
                frames,
                startOffset: 1,
                targetOffset: frames.length - 2,
            }
        }

        const reversed = values.slice().reverse()
        const frames = [topPad, ...reversed, bottomPad]
        return {
            frames,
            startOffset: frames.length - 2,
            targetOffset: 1,
        }
    }

    async function startAnimation(previousText: string, nextText: string) {
        const spool = buildFrames(previousText, nextText)
        if (spool.frames.length <= 2) {
            stopAnimation(nextText)
            return
        }

        stopAnimation()
        displayText.value = previousText
        frameTexts.value = spool.frames
        animationActive.value = true
        trackKey.value += 1
        trackOffset.value = spool.startOffset
        trackDuration.value = Math.min(2200, Math.max(1250, spool.frames.length * 130))

        await nextTick()
        requestAnimationFrame(() => {
            trackOffset.value = spool.targetOffset
            animationTimer = setTimeout(() => {
                stopAnimation(nextText)
            }, trackDuration.value + 140)
        })
    }

    watch(() => props.text, (next) => {
        if (!animationActive.value) displayText.value = next
    }, { immediate: true })

    watch(() => props.animateNonce, () => {
        if (!props.animateFrom || !props.animateTo) return
        void startAnimation(props.animateFrom, props.animateTo)
    })

    watch(() => props.jumpNonce, () => {
        if (animationActive.value) return
        triggerJump()
    })

    onUnmounted(() => {
        stopAnimation()
        if (jumpTimer) clearTimeout(jumpTimer)
    })
</script>

<style scoped>
    .value-reel {
        position: relative;
        display: inline-flex;
        align-items: center;
        min-height: 1.18em;
        max-width: 100%;
        font: inherit;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        font-style: inherit;
        line-height: inherit;
        letter-spacing: inherit;
        color: inherit;
        font-variant-numeric: inherit;
    }

    .value-reel__base,
    .value-reel__frame {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        font: inherit;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        font-style: inherit;
        line-height: inherit;
        letter-spacing: inherit;
        color: inherit;
    }

    .value-reel__base.is-hidden {
        opacity: 0;
    }

    .value-reel__base.is-jumping {
        animation: value-reel-jump 260ms cubic-bezier(0.22, 0.86, 0.24, 1);
    }

    .value-reel__drum {
        position: absolute;
        left: -0.28em;
        right: -0.28em;
        top: 50%;
        height: 3.54em;
        transform: translateY(-50%);
        overflow: hidden;
        border-radius: 0.46em;
        background: color-mix(in srgb, var(--bg-card) 96%, transparent);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 10px 24px rgba(15, 23, 42, 0.16);
        z-index: 3;
        pointer-events: none;
        font: inherit;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        font-style: inherit;
        line-height: inherit;
        letter-spacing: inherit;
        color: inherit;
    }

    .value-reel__track {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        transition-property: transform;
        transition-timing-function: cubic-bezier(0.12, 0.82, 0.2, 1);
        will-change: transform;
        font: inherit;
        color: inherit;
    }

    .value-reel__frame {
        height: 1.18em;
        opacity: 0.34;
        padding: 0 .28em;
    }

    .value-reel__focus {
        position: absolute;
        left: 0;
        right: 0;
        top: 1.18em;
        height: 1.18em;
        border-top: 1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent);
        border-bottom: 1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent);
        background: color-mix(in srgb, var(--accent-primary) 8%, transparent);
        z-index: 1;
    }

    .value-reel__fade {
        position: absolute;
        left: 0;
        right: 0;
        height: 0.74em;
        z-index: 2;
        pointer-events: none;
    }

    .value-reel__fade--top {
        top: 0;
        background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 100%, transparent), transparent);
    }

    .value-reel__fade--bottom {
        bottom: 0;
        background: linear-gradient(0deg, color-mix(in srgb, var(--bg-card) 100%, transparent), transparent);
    }

    .value-reel.is-active::after {
        content: '';
        position: absolute;
        inset: -0.2em -0.3em;
        border-radius: 0.5em;
        background: linear-gradient(180deg, color-mix(in srgb, var(--accent-primary) 14%, transparent), transparent 72%);
        opacity: 1;
        pointer-events: none;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    @keyframes value-reel-jump {
        0% {
            transform: translateY(0);
        }
        38% {
            transform: translateY(-0.18em);
        }
        100% {
            transform: translateY(0);
        }
    }

</style>
