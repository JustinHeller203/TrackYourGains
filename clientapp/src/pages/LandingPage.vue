<template>
    <div class="landing-page">
        <section class="hero section-shell">
            <div class="hero-copy">
                <div class="eyebrow">{{ t('landing.hero.eyebrow') }}</div>
                <p v-if="auth.user?.username" class="welcome-copy">
                    {{ tp('landing.hero.welcome', { username: auth.user.username }) }}
                </p>

                <h1 class="hero-title">
                    {{ t('landing.hero.titleStart') }}
                    <span class="hero-kinetic">{{ activeHeroWord }}</span>
                </h1>

                <p class="hero-text">
                    {{ t('landing.hero.text') }}
                </p>

                <div class="hero-actions">
                    <router-link to="/training" class="button-primary">{{ t('landing.hero.startTraining') }}</router-link>
                    <router-link to="/progress" class="button-secondary">{{ t('landing.hero.createProgress') }}</router-link>
                </div>

                <div class="hero-strip">
                    <div v-for="item in heroStrip" :key="item.label" class="hero-strip-card landing-dashboard-card">
                        <span class="hero-strip-value">{{ item.value }}</span>
                        <span class="hero-strip-label">{{ item.label }}</span>
                    </div>
                </div>
            </div>

            <div class="hero-visual">
                <div class="visual-frame visual-frame--primary">
                    <div class="visual-topline">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </div>

                    <div class="signal-grid">
                        <div class="signal-card signal-card--headline landing-dashboard-card">
                            <span class="signal-label">{{ t('landing.visual.whyLabel') }}</span>
                            <strong>{{ t('landing.visual.whyTitle') }}</strong>
                            <p>{{ t('landing.visual.whyText') }}</p>
                        </div>

                        <div v-if="todayPlan" class="signal-card signal-card--accent landing-dashboard-card">
                            <span class="signal-label">{{ t('landing.visual.todayLabel') }}</span>
                            <strong>{{ todayPlan.planName }}</strong>
                            <p>{{ todayPlan.message }}</p>
                            <router-link to="/training" class="micro-link">{{ t('landing.visual.toPlan') }}</router-link>
                        </div>

                        <div v-else class="signal-card signal-card--accent landing-dashboard-card">
                            <span class="signal-label">{{ t('landing.visual.todayLabel') }}</span>
                            <strong>{{ t('landing.visual.noPlanTitle') }}</strong>
                            <p>{{ t('landing.visual.noPlanText') }}</p>
                            <router-link :to="{ path: '/training', query: { tut: 'plan' } }" class="micro-link">
                                {{ t('landing.visual.buildPlan') }}
                            </router-link>
                        </div>

                        <div class="signal-card landing-dashboard-card">
                            <span class="signal-label">{{ t('landing.visual.complaintsLabel') }}</span>
                            <strong>{{ tp('landing.visual.complaintsActive', { count: complaintsTracked }) }}</strong>
                            <p>{{ t('landing.visual.complaintsText') }}</p>
                        </div>

                        <div class="signal-card landing-dashboard-card">
                            <span class="signal-label">{{ t('landing.visual.progressLabel') }}</span>
                            <strong>{{ tp('landing.visual.workoutsLogged', { count: workoutsCompleted }) }}</strong>
                            <p>{{ t('landing.visual.progressText') }}</p>
                        </div>
                    </div>
                </div>

                <div class="visual-frame visual-frame--secondary landing-dashboard-card">
                    <div class="radar-ring"></div>
                    <div class="radar-center">
                        <span class="radar-number">{{ kgLost }}</span>
                        <span class="radar-unit">{{ t('landing.visual.weightChange') }}</span>
                    </div>
                    <p class="radar-copy">{{ t('landing.visual.weightText') }}</p>
                </div>
            </div>
        </section>

        <section class="product-showcase section-shell section-reveal">
            <div class="section-head">
                <span class="section-kicker">{{ t('landing.showcase.kicker') }}</span>
                <h2>{{ t('landing.showcase.title') }}</h2>
            </div>

            <div class="showcase-layout">

                <div class="phone-stage">
                    <div class="phone-glow"></div>
                    <div class="phone-device">
                        <div class="phone-notch"></div>
                        <div class="phone-screen">
                            <div class="screen-power-layer"></div>

                            <div class="lock-screen">
                                <div class="lock-statusbar">
                                    <span>{{ currentPhoneTime }}</span>
                                    <div class="lock-status-icons">
                                        <span class="status-signal">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </span>
                                        <span class="battery-shell">
                                            <span class="battery-level"></span>
                                        </span>
                                    </div>
                                </div>
                                <div class="lock-time">{{ currentPhoneTime }}</div>
                                <div class="lock-date">{{ currentPhoneDate }}</div>
                                <div class="lock-hint">{{ t('landing.phone.unlockHint') }}</div>
                            </div>

                            <div class="passcode-screen">
                                <div class="passcode-label">{{ t('landing.phone.enterCode') }}</div>
                                <div class="passcode-dots">
                                    <span class="passcode-dot"></span>
                                    <span class="passcode-dot"></span>
                                    <span class="passcode-dot"></span>
                                    <span class="passcode-dot"></span>
                                </div>
                                <div class="passcode-pad">
                                    <span v-for="digit in passcodeDigits"
                                          :key="digit"
                                          class="passcode-key"
                                          :class="passcodeTapClasses[digit]">
                                        {{ digit }}
                                        <span v-if="passcodeTapClasses[digit]"
                                              class="tap-indicator tap-indicator--key"
                                              aria-hidden="true">
                                            <span class="tap-indicator__finger"></span>
                                            <span class="tap-indicator__ring"></span>
                                            <span class="tap-indicator__ring tap-indicator__ring--delayed"></span>
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div class="screen-ui">
                                <div class="os-statusbar">
                                    <div class="status-cluster">
                                        <span class="status-signal">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </span>
                                        <span class="status-provider">{{ t('landing.phone.provider') }}</span>
                                    </div>
                                    <span class="status-time">{{ currentPhoneTime }}</span>
                                    <div class="status-cluster status-cluster--right">
                                        <span class="status-battery">86%</span>
                                        <span class="battery-shell">
                                            <span class="battery-level"></span>
                                        </span>
                                    </div>
                                </div>
                                <div class="screen-site-shell">
                                    <div class="app-screen-sequence">
                                        <article class="app-screen app-screen--plan"
                                                 :class="{ 'is-active': phoneShowcaseReady && activePhoneStep === 0 }">
                                            <iframe class="phone-preview-frame"
                                                    :src="phonePreviewFrames[0]"
                                                    :title="t('landing.phone.trainingPreview')"
                                                    loading="lazy"></iframe>
                                        </article>

                                        <article class="app-screen app-screen--tutorial"
                                                 :class="{ 'is-active': phoneShowcaseReady && activePhoneStep === 1 }">
                                            <iframe class="phone-preview-frame"
                                                    :src="phonePreviewFrames[1]"
                                                    :title="t('landing.phone.tutorialPreview')"
                                                    loading="lazy"></iframe>
                                        </article>

                                        <article class="app-screen app-screen--session"
                                                 :class="{ 'is-active': phoneShowcaseReady && activePhoneStep === 2 }">
                                            <iframe class="phone-preview-frame"
                                                    :src="phonePreviewFrames[2]"
                                                    :title="t('landing.phone.simulationPreview')"
                                                    loading="lazy"></iframe>
                                        </article>

                                        <article class="app-screen app-screen--progress"
                                                 :class="{ 'is-active': phoneShowcaseReady && activePhoneStep === 3 }">
                                            <iframe class="phone-preview-frame"
                                                    :src="phonePreviewFrames[3]"
                                                    :title="t('landing.phone.progressPreview')"
                                                    loading="lazy"></iframe>
                                        </article>
                                    </div>

                                    <div class="home-indicator"></div>
                                    <div class="phone-showcase-controls">
                                        <button type="button"
                                                class="phone-showcase-nav"
                                                :aria-label="t('landing.phone.prevAria')"
                                                @click="goToPrevPhoneStep">
                                            ‹
                                        </button>
                                        <div class="phone-showcase-dots" role="tablist" :aria-label="t('landing.phone.stepsAria')">

                                            <button v-for="(step, index) in phoneGuideSteps"
                                                    :key="step.title"
                                                    type="button"
                                                    class="phone-showcase-dot"
                                                    :class="{ 'is-active': activePhoneStep === index }"
                                                    :aria-label="tp('landing.phone.stepAria', { step: step.step, title: step.title })"
                                                    :aria-selected="activePhoneStep === index"
                                                    @click="setPhoneStep(index)"></button>
                                        </div>
                                        <button type="button"
                                                class="phone-showcase-toggle"
                                                :aria-pressed="phoneAutoplayPaused"
                                                @click="togglePhoneAutoplay">
                                            {{ phoneAutoplayPaused ? t('landing.phone.play') : t('landing.phone.pause') }}
                                        </button>
                                        <button type="button"
                                                class="phone-showcase-nav"
                                                :aria-label="t('landing.phone.nextAria')"
                                                @click="goToNextPhoneStep">
                                            ›
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="proof-band section-shell section-reveal">
            <div class="section-head">
                <span class="section-kicker">{{ t('landing.proof.kicker') }}</span>
                <h2>{{ t('landing.proof.title') }}</h2>
            </div>

            <div class="proof-grid">
                <DashboardCard v-for="item in proofCards"
                               :key="item.title"
                               class="proof-card"
                               :title="item.title"
                               :info="item.text">
                    <span class="proof-index">{{ item.index }}</span>
                    <span class="proof-text">{{ item.text }}</span>
                </DashboardCard>
            </div>
        </section>

        <section class="command-center section-shell section-reveal">
            <div class="section-head">
                <span class="section-kicker">{{ t('landing.command.kicker') }}</span>
                <h2>{{ t('landing.command.title') }}</h2>
            </div>

            <div class="command-grid">
                <DashboardCard v-for="link in commandLinks"
                               :key="link.title"
                               class="command-dashboard-card"
                               :title="link.title"
                               :info="link.text"
                               clickable
                               @click="goTo(link.to)">
                    <span class="command-tag">{{ link.tag }}</span>
                    <span class="command-copy">{{ link.text }}</span>
                    <span class="command-cta">{{ link.cta }}</span>
                </DashboardCard>
            </div>
        </section>

        <section class="feature-marquee section-shell section-reveal">
            <div class="section-head">
                <span class="section-kicker">{{ t('landing.features.kicker') }}</span>
                <h2>{{ t('landing.features.title') }}</h2>
            </div>

            <div class="feature-layout">
                <DashboardCard class="feature-spotlight"
                               :title="t('landing.features.spotlightTitle')"
                               :info="t('landing.features.spotlightHeadline')">
                    <strong class="spotlight-headline">{{ t('landing.features.spotlightHeadline') }}</strong>
                    <span class="spotlight-text">
                        {{ t('landing.features.spotlightText') }}
                    </span>
                </DashboardCard>

                <div class="feature-list">
                    <DashboardCard v-for="feature in features"
                                   :key="feature.title"
                                   class="feature-panel"
                                   :title="feature.title"
                                   :info="feature.text">
                        <span class="feature-code">{{ feature.code }}</span>
                        <span class="feature-text">{{ feature.text }}</span>
                    </DashboardCard>
                </div>
            </div>
        </section>

        <section class="timeline section-shell section-reveal">
            <div class="section-head">
                <span class="section-kicker">{{ t('landing.timeline.kicker') }}</span>
                <h2>{{ t('landing.timeline.title') }}</h2>
            </div>

            <div class="timeline-grid">
                <DashboardCard v-for="step in timelineSteps"
                               :key="step.step"
                               class="timeline-card"
                               :title="step.title"
                               :info="step.text">
                    <span class="timeline-step">{{ step.step }}</span>
                    <span class="timeline-text">{{ step.text }}</span>
                </DashboardCard>
            </div>
        </section>

        <section class="testimonials section-shell section-reveal">
            <div class="section-head">
                <span class="section-kicker">{{ t('landing.testimonials.kicker') }}</span>
                <h2>{{ t('landing.testimonials.title') }}</h2>
            </div>

            <div class="testimonial-stage"
                 @touchstart.passive="onSwipeStart"
                 @touchmove.passive="onSwipeMove"
                 @touchend="onSwipeEnd"
                 @touchcancel="onSwipeEnd">
                <DashboardCard v-for="(testimonial, index) in testimonials"
                               v-show="index === currentTestimonial"
                               :key="testimonial.id"
                               class="testimonial-card command-dashboard-card testimonial-dashboard-card"
                               title=""
                               :info="testimonial.text">
                    <span class="quote-mark" aria-hidden="true">“</span>
                    <p class="testimonial-text">{{ testimonial.text }}</p>
                    <span class="testimonial-meta">
                        <strong>{{ testimonial.author }}</strong>
                        <span>{{ testimonial.role }}</span>
                    </span>
                </DashboardCard>

                <div class="testimonial-dots" role="tablist">
                    <button v-for="(testimonial, index) in testimonials"
                            :key="testimonial.id + '-dot'"
                            class="testimonial-dot"
                            :class="{ 'is-active': index === currentTestimonial }"
                            type="button"
                            :aria-label="tp('landing.testimonials.showAria', { number: index + 1 })"
                            @click="currentTestimonial = index"></button>
                </div>
            </div>
        </section>

        <section class="final-cta section-shell section-reveal">
            <DashboardCard class="final-cta-panel"
                           :title="t('landing.final.title')"
                           :info="t('landing.final.info')">
                <div>
                    <strong class="final-headline">{{ t('landing.final.headline') }}</strong>
                    <p class="final-copy">
                        {{ t('landing.final.text') }}
                    </p>
                </div>

                <div class="final-actions">
                    <router-link to="/training" class="button-primary">{{ t('landing.final.start') }}</router-link>
                    <router-link to="/tutorials" class="button-secondary">{{ t('landing.final.tutorials') }}</router-link>
                </div>
            </DashboardCard>
        </section>
    </div>
</template>
<script setup lang="ts">
    import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'
    import { useComplaintsStore } from '@/store/complaintsStore'
    import { useTrainingPlansStore } from '@/store/trainingPlansStore'
    import { useProgressStore } from '@/store/progressStore'
    import DashboardCard from '@/components/ui/DashboardCard.vue'
    import { listTrainingPlanner } from '@/services/trainingPlanner'
    import {
        LS_COMPLAINTS_ENTRIES,
        LS_PROGRESS_WORKOUTS,
        LS_PROGRESS_WEIGHTS,
        LS_TRAINING_PLANNER,
        LS_TRAINING_REST_DAYS,
    } from '@/constants/storageKeys'
    import { useI18n } from '@/composables/useI18n'

    type TodayPlan = { planName: string; message: string }
    type StoredWeightEntry = { date: string; weight: number }
    type StoredComplaint = { id?: string }

    const auth = useAuthStore()
    const router = useRouter()
    const complaintsStore = useComplaintsStore()
    const trainingPlansStore = useTrainingPlansStore()
    const progressStore = useProgressStore()

    const { t } = useI18n()

    function tp(key: string, params: Record<string, string | number>) {
        return Object.entries(params).reduce(
            (text, [name, value]) => text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
            t(key)
        )
    }
    const workoutsCompleted = ref(0)
    const complaintsTracked = ref(0)
    const kgLost = ref(0)
    const todayPlan = ref<TodayPlan | null>(null)

    const heroWordKeys = [
        'landing.hero.word.level',
        'landing.hero.word.structure',
        'landing.hero.word.control',
        'landing.hero.word.momentum',
    ]
    const passcodeDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    const passcodeTapClasses: Record<string, string> = {
        '1': 'passcode-key--tap-1',
        '2': 'passcode-key--tap-2',
        '5': 'passcode-key--tap-3',
        '8': 'passcode-key--tap-4',
    }
    const heroWordIndex = ref(0)
    const activeHeroWord = computed(() => t(heroWordKeys[heroWordIndex.value]))
    const currentPhoneTime = ref('')
    const currentPhoneDate = ref('')
    const PHONE_BOOT_DELAY_MS = 3200
    const PHONE_STEP_INTERVAL_MS = 5000

    let heroWordTimer: number | undefined
    let phoneClockTimer: number | undefined
    let phoneShowcaseBootTimer: number | undefined
    let phoneShowcaseStepTimer: number | undefined

    const heroStrip = computed(() => [
        { value: '01', label: t('landing.heroStrip.workflow') },
        { value: '24/7', label: t('landing.heroStrip.painProgress') },
        { value: '100%', label: t('landing.heroStrip.momentum') },
    ])

    const proofCards = computed(() => [
        {
            index: '01',
            title: t('landing.proof.trainingTitle'),
            text: t('landing.proof.trainingText'),
        },
        {
            index: '02',
            title: t('landing.proof.complaintsTitle'),
            text: t('landing.proof.complaintsText'),
        },
        {
            index: '03',
            title: t('landing.proof.progressTitle'),
            text: t('landing.proof.progressText'),
        },
    ])

    const commandLinks = computed(() => [
        {
            tag: t('landing.command.trainingTag'),
            title: t('landing.command.trainingTitle'),
            text: t('landing.command.trainingText'),
            cta: t('landing.command.trainingCta'),
            to: { path: '/training', query: { tut: 'plan' } },
        },
        {
            tag: t('landing.command.healthTag'),
            title: t('landing.command.complaintsTitle'),
            text: t('landing.command.complaintsText'),
            cta: t('landing.command.complaintsCta'),
            to: '/beschwerden',
        },
        {
            tag: t('landing.command.progressTag'),
            title: t('landing.command.progressTitle'),
            text: t('landing.command.progressText'),
            cta: t('landing.command.progressCta'),
            to: '/progress',
        },
        {
            tag: t('landing.command.learningTag'),
            title: t('landing.command.tutorialsTitle'),
            text: t('landing.command.tutorialsText'),
            cta: t('landing.command.tutorialsCta'),
            to: '/tutorials',
        },
    ])

    const goTo = (to: string | { path: string; query?: Record<string, string> }) => {
        void router.push(to)
    }

    const features = computed(() => [
        {
            code: 'TR-01',
            title: t('landing.features.structureTitle'),
            text: t('landing.features.structureText'),
        },
        {
            code: 'RC-02',
            title: t('landing.features.safetyTitle'),
            text: t('landing.features.safetyText'),
        },
        {
            code: 'PG-03',
            title: t('landing.features.visibilityTitle'),
            text: t('landing.features.visibilityText'),
        },
    ])

    const timelineSteps = computed(() => [
        {
            step: '01',
            title: t('landing.timeline.planTitle'),
            text: t('landing.timeline.planText'),
        },
        {
            step: '02',
            title: t('landing.timeline.trackTitle'),
            text: t('landing.timeline.trackText'),
        },
        {
            step: '03',
            title: t('landing.timeline.growthTitle'),
            text: t('landing.timeline.growthText'),
        },
    ])

    const testimonials = computed(() => [
        {
            id: 1,
            text: t('landing.testimonials.oneText'),
            author: t('landing.testimonials.oneAuthor'),
            role: t('landing.testimonials.oneRole'),
        },
        {
            id: 2,
            text: t('landing.testimonials.twoText'),
            author: t('landing.testimonials.twoAuthor'),
            role: t('landing.testimonials.twoRole'),
        },
        {
            id: 3,
            text: t('landing.testimonials.threeText'),
            author: t('landing.testimonials.threeAuthor'),
            role: t('landing.testimonials.threeRole'),
        },
    ])

    const phoneGuideSteps = computed(() => [
        {
            step: t('landing.phoneGuide.step1'),
            title: t('landing.phoneGuide.planTitle'),
            text: t('landing.phoneGuide.planText'),
            pill: t('landing.command.trainingTag'),
            variant: 'plan',
        },
        {
            step: t('landing.phoneGuide.step2'),
            title: t('landing.phoneGuide.tutorialTitle'),
            text: t('landing.phoneGuide.tutorialText'),
            pill: t('landing.command.learningTag'),
            variant: 'tutorial',
        },
        {
            step: t('landing.phoneGuide.step3'),
            title: t('landing.phoneGuide.simulationTitle'),
            text: t('landing.phoneGuide.simulationText'),
            pill: 'Simulation',
            variant: 'session',
        },
        {
            step: t('landing.phoneGuide.step4'),
            title: t('landing.phoneGuide.progressTitle'),
            text: t('landing.phoneGuide.progressText'),
            pill: t('landing.command.progressTag'),
            variant: 'progress',
        },
    ])

    const activePhoneStep = ref(0)
    const phoneShowcaseReady = ref(false)
    const phoneAutoplayPaused = ref(false)
    const phoneBuilderDemoCompleted = ref(false)
    const phoneTutorialDemoCompleted = ref(false)
    const phoneSimulationDemoCompleted = ref(false)
    const phoneProgressDemoCompleted = ref(false)
    const phonePreviewRunIds = ref([0, 0, 0, 0])
    const phonePreviewFrames = computed(() => [
        router.resolve({ path: '/training', query: { preview: 'phone', demo: 'builder', run: phonePreviewRunIds.value[0] } }).href,
        router.resolve({ path: '/tutorials', query: { preview: 'phone', demo: 'tutorial', run: phonePreviewRunIds.value[1] } }).href,
        router.resolve({ path: '/preview/training-simulation', query: { preview: 'phone', demo: 'simulation', run: phonePreviewRunIds.value[2] } }).href,
        router.resolve({ path: '/progress', query: { preview: 'phone', demo: 'progress-tour', run: phonePreviewRunIds.value[3] } }).href,
    ])

    const currentTestimonial = ref(0)
    let testimonialTimer: number | undefined

    const swipe = ref({
        active: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
    })

    const SWIPE_MIN_PX = 40
    const SWIPE_MAX_Y_PX = 70

    const pad2 = (n: number) => String(n).padStart(2, '0')

    const toUtcDayKey = (iso: string) => {
        const d = new Date(iso)
        return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
    }

    const buildMotivation = (planName: string) => {
        const lines = [
            tp('landing.motivation.todayPlan1', { planName }),
            tp('landing.motivation.todayPlan2', { planName }),
            tp('landing.motivation.todayPlan3', { planName }),
            tp('landing.motivation.todayPlan4', { planName }),
            tp('landing.motivation.todayPlan5', { planName }),
        ]

        return lines[Math.floor(Math.random() * lines.length)]
    }

    const loadStatsFromStorage = () => {
        if (typeof window === 'undefined') return

        try {
            const rawWorkouts = window.localStorage.getItem(LS_PROGRESS_WORKOUTS)
            const parsed = rawWorkouts ? (JSON.parse(rawWorkouts) as unknown[]) : []
            workoutsCompleted.value = Array.isArray(parsed) ? parsed.length : 0
        } catch {
            workoutsCompleted.value = 0
        }

        try {
            const rawComplaints = window.localStorage.getItem(LS_COMPLAINTS_ENTRIES)
            const parsedComplaints = rawComplaints ? (JSON.parse(rawComplaints) as StoredComplaint[]) : []
            complaintsTracked.value = Array.isArray(parsedComplaints) ? parsedComplaints.length : 0
        } catch {
            complaintsTracked.value = 0
        }

        try {
            const rawWeights = window.localStorage.getItem(LS_PROGRESS_WEIGHTS)
            const weights = rawWeights ? (JSON.parse(rawWeights) as StoredWeightEntry[]) : []

            if (Array.isArray(weights) && weights.length >= 2) {
                const latest = weights[0].weight
                const first = weights[weights.length - 1].weight
                const diff = first - latest
                kgLost.value = diff > 0 ? Math.round(diff * 10) / 10 : 0
            } else {
                kgLost.value = 0
            }
        } catch {
            kgLost.value = 0
        }
    }

    const loadTodayPlan = async () => {
        todayPlan.value = null

        if (typeof window === 'undefined') return
        const todayKey = new Date().toISOString().slice(0, 10)

        if (auth.user) {
            try {
                const items = await listTrainingPlanner()
                const hasRest = items.some((i) => i.isRestDay && toUtcDayKey(i.date) === todayKey)
                if (hasRest) return

                const plan = items.find((i) => !i.isRestDay && toUtcDayKey(i.date) === todayKey)
                if (plan?.planName) {
                    todayPlan.value = {
                        planName: plan.planName,
                        message: buildMotivation(plan.planName),
                    }
                }
            } catch {
                // Ignore planner fetch failures and fall back to default panel.
            }
            return
        }

        try {
            const restRaw = window.localStorage.getItem(LS_TRAINING_REST_DAYS)
            const restArr = restRaw ? (JSON.parse(restRaw) as string[]) : []
            if (Array.isArray(restArr) && restArr.includes(todayKey)) return

            const rawPlanner = window.localStorage.getItem(LS_TRAINING_PLANNER)
            const planner = rawPlanner ? (JSON.parse(rawPlanner) as Record<string, Array<{ planName?: string }>>) : {}
            const list = planner?.[todayKey] ?? []
            const first = Array.isArray(list) ? list[0] : null

            if (first?.planName) {
                todayPlan.value = {
                    planName: first.planName,
                    message: buildMotivation(first.planName),
                }
            }
        } catch {
            // Ignore corrupted local planner state.
        }
    }

    const isGuid = (v: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)

    const loadWorkoutsFromBackend = async () => {
        if (!auth.user) return

        try {
            await trainingPlansStore.loadList()
        } catch {
            return
        }

        const planIds = trainingPlansStore.items
            .map((p: { id: string }) => p.id)
            .filter((id: string) => isGuid(id))

        if (!planIds.length) {
            workoutsCompleted.value = 0
            return
        }

        await Promise.all(planIds.map((id: string) => progressStore.load(id, true)))

        const total = planIds.reduce((sum: number, id: string) => {
            const items = progressStore.byPlan?.[id]?.items ?? []
            return sum + items.length
        }, 0)

        workoutsCompleted.value = total
    }

    const loadComplaintsCount = async () => {
        if (!auth.user) return

        try {
            await complaintsStore.load()
            complaintsTracked.value = complaintsStore.entries.length
        } catch {
            // Keep local fallback value.
        }
    }

    const setupScrollReveal = () => {
        if (typeof window === 'undefined') return

        const sections = document.querySelectorAll<HTMLElement>('.section-reveal')

        if (!('IntersectionObserver' in window)) {
            sections.forEach((section, idx) => {
                section.classList.add('is-visible')
                section.style.setProperty('--reveal-delay', `${idx * 80}ms`)
            })
            return
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return

                    const el = entry.target as HTMLElement
                    el.classList.add('is-visible')
                    obs.unobserve(el)
                })
            },
            { threshold: 0.16 }
        )

        sections.forEach((section, idx) => {
            section.style.setProperty('--reveal-delay', `${idx * 80}ms`)
            observer.observe(section)
        })
    }

    const startHeroWordRotation = () => {
        if (typeof window === 'undefined') return

        heroWordTimer = window.setInterval(() => {
            heroWordIndex.value = (heroWordIndex.value + 1) % heroWordKeys.length
        }, 2200)
    }

    const stopHeroWordRotation = () => {
        if (heroWordTimer !== undefined) {
            window.clearInterval(heroWordTimer)
            heroWordTimer = undefined
        }
    }

    const updatePhoneClock = () => {
        const now = new Date()
        currentPhoneTime.value = now.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
        })
        currentPhoneDate.value = now.toLocaleDateString('de-DE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
        })
    }

    const startPhoneClock = () => {
        if (typeof window === 'undefined') return
        updatePhoneClock()
        phoneClockTimer = window.setInterval(updatePhoneClock, 1000)
    }

    const stopPhoneClock = () => {
        if (phoneClockTimer !== undefined) {
            window.clearInterval(phoneClockTimer)
            phoneClockTimer = undefined
        }
    }

    const stopPhoneShowcaseAutoplay = () => {
        if (phoneShowcaseStepTimer !== undefined) {
            window.clearInterval(phoneShowcaseStepTimer)
            phoneShowcaseStepTimer = undefined
        }
    }

    const startPhoneShowcaseAutoplay = () => {
        stopPhoneShowcaseAutoplay()

        if (
            typeof window === 'undefined'
            || phoneAutoplayPaused.value
            || !phoneShowcaseReady.value
            || (activePhoneStep.value === 0 && !phoneBuilderDemoCompleted.value)
            || (activePhoneStep.value === 1 && !phoneTutorialDemoCompleted.value)
            || (activePhoneStep.value === 2 && !phoneSimulationDemoCompleted.value)
            || (activePhoneStep.value === 3 && !phoneProgressDemoCompleted.value)
        ) return
        phoneShowcaseStepTimer = window.setInterval(() => {
            setPhoneStep(activePhoneStep.value + 1)
        }, PHONE_STEP_INTERVAL_MS)
    }

    const setPhoneStep = (index: number) => {
        const stepsLength = phoneGuideSteps.value.length
        activePhoneStep.value = (index + stepsLength) % stepsLength

        phonePreviewRunIds.value = phonePreviewRunIds.value.map((runId, runIndex) =>
            runIndex === activePhoneStep.value ? runId + 1 : runId
        )
        if (activePhoneStep.value === 0) phoneBuilderDemoCompleted.value = false
        if (activePhoneStep.value === 1) phoneTutorialDemoCompleted.value = false
        if (activePhoneStep.value === 2) phoneSimulationDemoCompleted.value = false
        if (activePhoneStep.value === 3) phoneProgressDemoCompleted.value = false
        if (!phoneShowcaseReady.value) phoneShowcaseReady.value = true
        startPhoneShowcaseAutoplay()
    }

    const goToNextPhoneStep = () => {
        setPhoneStep(activePhoneStep.value + 1)
    }

    const goToPrevPhoneStep = () => {
        setPhoneStep(activePhoneStep.value - 1)
    }

    const togglePhoneAutoplay = () => {
        phoneAutoplayPaused.value = !phoneAutoplayPaused.value
        if (phoneAutoplayPaused.value) {
            stopPhoneShowcaseAutoplay()
            return
        }

        if (!phoneShowcaseReady.value) phoneShowcaseReady.value = true
        startPhoneShowcaseAutoplay()
    }

    const startPhoneShowcase = () => {
        if (typeof window === 'undefined') return

        if (phoneShowcaseBootTimer !== undefined) {
            window.clearTimeout(phoneShowcaseBootTimer)
        }

        phoneShowcaseReady.value = false
        activePhoneStep.value = 0
        phoneBuilderDemoCompleted.value = false
        phoneTutorialDemoCompleted.value = false
        phoneSimulationDemoCompleted.value = false
        phoneProgressDemoCompleted.value = false
        phonePreviewRunIds.value = [1, 0, 0, 0]
        stopPhoneShowcaseAutoplay()

        phoneShowcaseBootTimer = window.setTimeout(() => {
            phoneShowcaseReady.value = true
            startPhoneShowcaseAutoplay()
        }, PHONE_BOOT_DELAY_MS)
    }

    const onPhonePreviewMessage = (event: MessageEvent) => {
        if (typeof window === 'undefined') return
        if (event.origin !== window.location.origin) return

        const data = event.data as { type?: string; demo?: string; run?: number } | null
        if (data?.type !== 'landing-phone-demo-complete') return

        if (data.demo === 'builder') {
            if (Number(data.run ?? -1) !== phonePreviewRunIds.value[0]) return
            phoneBuilderDemoCompleted.value = true

            if (activePhoneStep.value === 0) {
                setPhoneStep(1)
            }
            return
        }

        if (data.demo === 'tutorial') {
            if (Number(data.run ?? -1) !== phonePreviewRunIds.value[1]) return
            phoneTutorialDemoCompleted.value = true

            if (activePhoneStep.value === 1) {
                setPhoneStep(2)
            }
            return
        }

        if (data.demo === 'simulation') {
            if (Number(data.run ?? -1) !== phonePreviewRunIds.value[2]) return
            phoneSimulationDemoCompleted.value = true

            if (activePhoneStep.value === 2) {
                setPhoneStep(3)
            }
            return
        }

        if (data.demo === 'progress-tour') {
            if (Number(data.run ?? -1) !== phonePreviewRunIds.value[3]) return
            phoneProgressDemoCompleted.value = true

            if (activePhoneStep.value === 3) {
                setPhoneStep(0)
            }
        }
    }

    const stopPhoneShowcase = () => {
        stopPhoneShowcaseAutoplay()

        if (phoneShowcaseBootTimer !== undefined) {
            window.clearTimeout(phoneShowcaseBootTimer)
            phoneShowcaseBootTimer = undefined
        }
    }

    const goNextTestimonial = () => {
        if (testimonials.value.length <= 1) return
        currentTestimonial.value = (currentTestimonial.value + 1) % testimonials.value.length
    }

    const goPrevTestimonial = () => {
        if (testimonials.value.length <= 1) return
        currentTestimonial.value =
            (currentTestimonial.value - 1 + testimonials.value.length) % testimonials.value.length
    }

    const startTestimonialRotation = () => {
        if (typeof window === 'undefined' || testimonials.value.length <= 1) return

        stopTestimonialRotation()
        testimonialTimer = window.setInterval(() => {
            goNextTestimonial()
        }, 7000)
    }

    const stopTestimonialRotation = () => {
        if (testimonialTimer !== undefined) {
            window.clearInterval(testimonialTimer)
            testimonialTimer = undefined
        }
    }

    function onSwipeStart(e: TouchEvent) {
        if (testimonials.value.length <= 1) return

        const t = e.touches[0]
        swipe.value.active = true
        swipe.value.startX = t.clientX
        swipe.value.startY = t.clientY
        swipe.value.lastX = t.clientX
        swipe.value.lastY = t.clientY
        stopTestimonialRotation()
    }

    function onSwipeMove(e: TouchEvent) {
        if (!swipe.value.active) return

        const t = e.touches[0]
        swipe.value.lastX = t.clientX
        swipe.value.lastY = t.clientY
    }

    function onSwipeEnd() {
        if (!swipe.value.active) return
        swipe.value.active = false

        const dx = swipe.value.lastX - swipe.value.startX
        const dy = swipe.value.lastY - swipe.value.startY

        if (Math.abs(dy) <= SWIPE_MAX_Y_PX && Math.abs(dx) >= SWIPE_MIN_PX) {
            if (dx < 0) goNextTestimonial()
            else goPrevTestimonial()
        }

        startTestimonialRotation()
    }

    watch(
        () => auth.user,
        () => {
            loadStatsFromStorage()
            void loadTodayPlan()
            void loadWorkoutsFromBackend()
            void loadComplaintsCount()
        },
        { immediate: true }
    )

    onMounted(() => {
        setupScrollReveal()
        startHeroWordRotation()
        startTestimonialRotation()
        startPhoneClock()
        startPhoneShowcase()
        loadStatsFromStorage()
        window.addEventListener('message', onPhonePreviewMessage)
    })

    onUnmounted(() => {
        stopHeroWordRotation()
        stopTestimonialRotation()
        stopPhoneClock()
        stopPhoneShowcase()
        window.removeEventListener('message', onPhonePreviewMessage)
    })
</script>
<style scoped>
    .landing-page {
        --landing-card: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        --landing-card-hover: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 11%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 90%, #020617 10%);
        --landing-card-strong: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 95%, #020617 5%);
        --landing-line: rgba(148, 163, 184, 0.26);
        --landing-line-strong: rgba(129, 140, 248, 0.7);
        --landing-text: var(--text-primary);
        --landing-muted: color-mix(in srgb, var(--text-secondary) 82%, rgba(255, 255, 255, 0.1));
        --landing-accent: var(--accent-primary);
        --landing-accent-2: var(--accent-secondary);
        --landing-warm: #22c55e;
        font-family: 'Inter', sans-serif;
        color: var(--landing-text);
        padding: 0 0 5rem;
        position: relative;
        overflow: clip;
        background: transparent;
    }

    .landing-dashboard-card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        padding: 1.6rem 1.8rem;
        border-radius: 18px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        gap: 0.55rem;
        min-width: 220px;
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 260ms cubic-bezier(0.22, 0.61, 0.36, 1), border-color 220ms ease-out, background 260ms ease-out;
        will-change: transform, box-shadow;
    }

    @media (hover: hover) {
        .landing-dashboard-card:hover {
            transform: translateY(-4px) scale(1.015);
            box-shadow: 0 26px 60px rgba(15, 23, 42, 0.4);
            border-color: rgba(129, 140, 248, 0.7);
            background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 11%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 90%, #020617 10%);
        }
    }

    :global(html.dark-mode) .landing-dashboard-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .landing-page::before,
    .landing-page::after {
        content: '';
        position: absolute;
        inset: auto;
        border-radius: 999px;
        filter: blur(80px);
        opacity: 0.65;
        pointer-events: none;
        z-index: 0;
    }

    .landing-page::before {
        width: 34rem;
        height: 34rem;
        top: 3rem;
        left: -10rem;
        animation: floatAura 16s ease-in-out infinite alternate;
    }

    .landing-page::after {
        width: 32rem;
        height: 32rem;
        top: 16rem;
        right: -10rem;
        animation: floatAura 20s ease-in-out infinite alternate-reverse;
    }

    .section-shell {
        position: relative;
        z-index: 1;
        width: min(1280px, calc(100% - 2rem));
        margin: 0 auto;
    }

    .hero {
        min-height: calc(100vh - 5rem);
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
        gap: 2rem;
        align-items: center;
        padding: 4rem 0 2.5rem;
        position: relative;
    }

        .hero::before {
            content: '';
            position: absolute;
            inset: 1rem 0 auto;
            height: 22rem;
            border-radius: 2rem;
            pointer-events: none;
            z-index: 0;
        }

    .hero-copy,
    .hero-visual {
        position: relative;
    }

    .eyebrow,
    .section-kicker,
    .signal-label,
    .feature-spotlight-label,
    .command-tag {
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.72rem;
        font-weight: 700;
    }

    .eyebrow,
    .welcome-copy {
        animation: fadeUp 0.75s ease forwards;
    }

    .eyebrow {
        color: var(--landing-accent);
        margin: 0 0 1rem;
    }

    .welcome-copy {
        color: var(--landing-muted);
        margin: 0 0 0.8rem;
        animation-delay: 0.08s;
        opacity: 0;
    }

    .hero-title {
        font-family: 'Inter', sans-serif;
        font-size: clamp(3rem, 7vw, 6.2rem);
        line-height: 0.95;
        letter-spacing: -0.05em;
        margin: 0;
        max-width: 12ch;
        animation: fadeUp 0.82s ease forwards;
        animation-delay: 0.12s;
        opacity: 0;
    }

    .hero-kinetic {
        display: block;
        margin-top: 0.35rem;
        color: transparent;
        -webkit-text-stroke: 1px color-mix(in srgb, var(--accent-primary) 35%, rgba(255, 255, 255, 0.35));
        background: linear-gradient(135deg, var(--landing-accent), var(--landing-accent-2), var(--landing-warm));
        background-clip: text;
        -webkit-background-clip: text;
        animation: shiftGradient 7s linear infinite;
    }

    .hero-text {
        max-width: 42rem;
        font-size: 1.08rem;
        line-height: 1.75;
        color: var(--landing-muted);
        margin: 1.4rem 0 0;
        animation: fadeUp 0.82s ease forwards;
        animation-delay: 0.22s;
        opacity: 0;
    }

    .hero-actions,
    .hero-strip {
        animation: fadeUp 0.82s ease forwards;
        opacity: 0;
    }

    .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.9rem;
        margin-top: 1.8rem;
        animation-delay: 0.32s;
    }

    .button-primary,
    .button-secondary,
    .micro-link,
    .command-card {
        text-decoration: none;
    }

    .button-primary,
    .button-secondary {
        min-height: 3.5rem;
        padding: 0.95rem 1.5rem;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
    }

    .button-primary {
        color: #fff;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        box-shadow: 0 18px 44px color-mix(in srgb, var(--accent-primary) 22%, transparent);
    }

    .button-secondary {
        color: var(--landing-text);
        background: color-mix(in srgb, var(--bg-card) 62%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent-primary) 14%, var(--border-color));
        backdrop-filter: blur(14px);
    }

        .button-primary:hover,
        .button-secondary:hover,
        .micro-link:hover,
        .command-card:hover {
            transform: translateY(-2px);
        }

    .hero-strip {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.9rem;
        margin-top: 2rem;
        animation-delay: 0.42s;
    }

    .hero-strip-card,
    .proof-card,
    .feature-panel,
    .timeline-card,
    .testimonial-card,
    .visual-frame,
    .feature-spotlight,
    .final-cta-panel,
    .command-card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        gap: 0.55rem;
        min-width: 220px;
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        border: 1px solid var(--landing-line);
        background: var(--landing-card);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        backdrop-filter: blur(18px);
        transition: transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 260ms cubic-bezier(0.22, 0.61, 0.36, 1), border-color 220ms ease-out, background 260ms ease-out;
        will-change: transform, box-shadow;
    }

    .hero-strip-card {
        border-radius: 18px;
        padding: 1.6rem 1.8rem;
    }

    .hero-strip-value {
        display: block;
        font-family: 'Inter', sans-serif;
        font-size: 1.6rem;
        font-weight: 800;
        letter-spacing: -0.04em;
    }

    .hero-strip-label {
        display: block;
        color: var(--landing-muted);
        font-size: 0.82rem;
        margin-top: 0.35rem;
    }

    .hero-visual {
        display: grid;
        gap: 1rem;
        align-content: center;
        perspective: 1400px;
    }

    .visual-frame {
        border-radius: 18px;
    }

    .visual-frame--primary {
        padding: 1.6rem 1.8rem;
        transform: rotateX(5deg) rotateY(-8deg);
    }

    .visual-frame--secondary {
        min-height: 14rem;
        display: grid;
        place-items: center;
        padding: 1.6rem 1.8rem;
        background: radial-gradient(circle at center, color-mix(in srgb, var(--accent-primary) 14%, transparent), transparent 52%), var(--landing-card-strong);
    }

    .visual-topline {
        display: flex;
        gap: 0.4rem;
        margin-bottom: 1rem;
    }

    .dot {
        width: 0.65rem;
        height: 0.65rem;
        border-radius: 50%;
        background: color-mix(in srgb, var(--text-secondary) 38%, transparent);
    }

    .signal-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.9rem;
    }

    .signal-card {
        min-height: 10rem;
        border-radius: 18px;
        padding: 1.6rem 1.8rem;
        gap: 0.55rem;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-card) 82%, transparent);
    }

    .signal-card--headline {
        grid-column: span 2;
        min-height: 8.6rem;
        background: radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 45%), color-mix(in srgb, var(--bg-card) 86%, transparent);
    }

    .signal-card--accent {
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-secondary) 12%, transparent), transparent 55%), color-mix(in srgb, var(--bg-card) 84%, transparent);
    }

    .signal-card strong,
    .testimonial-meta strong {
        font-family: 'Inter', sans-serif;
        letter-spacing: -0.03em;
    }

    .signal-card strong {
        display: block;
        font-size: 1.25rem;
        margin-top: 0.5rem;
    }

    .signal-card p,
    .testimonial-text,
    .radar-copy {
        color: var(--landing-muted);
        line-height: 1.65;
    }

    .micro-link {
        display: inline-flex;
        margin-top: 0.85rem;
        color: var(--landing-accent);
        font-weight: 700;
    }

    .radar-ring {
        position: absolute;
        inset: 50%;
        width: 12rem;
        height: 12rem;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        border: 1px solid color-mix(in srgb, var(--accent-primary) 22%, transparent);
        box-shadow: 0 0 0 1.6rem color-mix(in srgb, var(--accent-primary) 8%, transparent), 0 0 0 3.2rem color-mix(in srgb, var(--accent-secondary) 5%, transparent);
        animation: pulseRing 4.2s ease-in-out infinite;
    }

    .radar-center {
        position: relative;
        z-index: 1;
        display: grid;
        justify-items: center;
    }

    .radar-number {
        font-family: 'Space Grotesk', sans-serif;
        font-size: clamp(2.6rem, 5vw, 4rem);
        font-weight: 700;
        line-height: 1;
    }

    .radar-unit {
        color: var(--landing-muted);
        text-transform: uppercase;
        letter-spacing: 0.2em;
        font-size: 0.7rem;
        margin-top: 0.45rem;
    }

    .radar-copy {
        position: relative;
        z-index: 1;
        max-width: 18rem;
        margin: 1rem auto 0;
        text-align: center;
    }

    .section-reveal {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.7s ease, transform 0.7s ease;
        transition-delay: var(--reveal-delay, 0ms);
        margin-top: 1.3rem;
    }

        .section-reveal.is-visible {
            opacity: 1;
            transform: translateY(0);
        }

    .proof-band,
    .product-showcase,
    .command-center,
    .feature-marquee,
    .timeline,
    .testimonials,
    .final-cta {
        padding-top: 1.8rem;
    }

    .section-head {
        display: grid;
        gap: 0.75rem;
        margin-bottom: 1.6rem;
        max-width: 46rem;
    }

    .section-kicker {
        color: var(--landing-accent);
    }

    .section-head h2 {
        margin: 0;
        font-family: 'Inter', sans-serif;
        font-size: clamp(2rem, 4vw, 3.5rem);
        line-height: 1.02;
        letter-spacing: -0.05em;
    }

    .proof-grid,
    .timeline-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
    }

    .showcase-layout {
        display: grid;
        grid-template-columns: minmax(320px, 1fr);
        gap: 0;
        align-items: center;
        justify-items: center;
    }

    .showcase-lead {
        margin: 0 0 1.1rem;
        color: var(--landing-muted);
        font-size: 1.02rem;
        line-height: 1.7;
        max-width: 42rem;
    }

    .showcase-points {
        display: grid;
        gap: 1rem;
    }

    .screen-hero strong,
    .screen-tutorial strong,
    .mini-card strong,
    .screen-footer strong {
        font-family: 'Inter', sans-serif;
        letter-spacing: -0.03em;
    }

    .point-label,
    .screen-eyebrow,
    .screen-brand,
    .screen-time {
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--text-secondary);
        font-weight: 700;
    }

    .showcase-point {
        min-height: 12.5rem;
        justify-content: flex-start;
        padding: 1.15rem 1.25rem !important;
        gap: 0.4rem !important;
    }

    .phone-stage {
        position: relative;
        min-height: 42rem;
        display: grid;
        place-items: center;
        width: 100%;
        justify-self: center;
    }

    .phone-glow {
        position: absolute;
        width: 22rem;
        height: 22rem;
        border-radius: 50%;
        background: radial-gradient(circle, color-mix(in srgb, var(--accent-primary) 24%, transparent), transparent 65%);
        filter: blur(24px);
        opacity: 0.55;
        transform: scale(0.8);
        transition: transform 0.8s ease, opacity 0.8s ease;
    }

    .phone-device {
        position: relative;
        width: min(22rem, 82vw);
        aspect-ratio: 0.5;
        padding: 0.9rem;
        border-radius: 2.7rem;
        background: linear-gradient(180deg, #111827, #030712);
        box-shadow: 0 35px 100px rgba(15, 23, 42, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.08);
        transform: translateY(36px) scale(0.94);
        opacity: 0.25;
        transition: transform 0.95s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.7s ease;
    }

    .phone-notch {
        position: absolute;
        top: 0.65rem;
        left: 50%;
        transform: translateX(-50%);
        width: 7rem;
        height: 1.4rem;
        border-radius: 999px;
        background: #020617;
        z-index: 4;
    }

    .phone-screen {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 2rem;
        overflow: hidden;
        background: radial-gradient(circle at top, rgba(96, 165, 250, 0.22), transparent 30%), linear-gradient(180deg, #14213d 0%, #0b1220 48%, #020617 100%);
    }

    .screen-power-layer {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, #020617, #000);
        opacity: 1;
        z-index: 3;
        transition: opacity 0.45s ease 0.5s;
    }

    .tap-indicator {
        position: absolute;
        z-index: 4;
        width: 3.2rem;
        height: 3.2rem;
        pointer-events: none;
        opacity: 0;
        transform: translate3d(0, 0.55rem, 0) scale(0.88);
    }

    .tap-indicator--key {
        inset: 50% auto auto 50%;
        width: 3rem;
        height: 3rem;
        transform: translate3d(-50%, calc(-50% + 0.55rem), 0) scale(0.88);
    }

    .tap-indicator__finger,
    .tap-indicator__ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
    }

    .tap-indicator__finger {
        inset: 0.9rem;
        background: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.72) 48%, rgba(255, 255, 255, 0.12) 100%);
        border: 1px solid rgba(255, 255, 255, 0.7);
        box-shadow: 0 0.18rem 0.45rem rgba(15, 23, 42, 0.22), 0 0 0 0.18rem color-mix(in srgb, var(--accent-primary) 26%, transparent);
    }

    .tap-indicator__ring {
        border: 1px solid color-mix(in srgb, var(--accent-primary) 62%, rgba(255, 255, 255, 0.4));
        background: radial-gradient(circle, color-mix(in srgb, var(--accent-primary) 22%, transparent), transparent 68%);
        opacity: 0;
    }

    .tap-indicator__ring--delayed {
        animation-delay: 0.28s;
    }

    .lock-screen,
    .passcode-screen,
    .screen-ui {
        position: absolute;
        inset: 0;
    }

    .lock-screen {
        z-index: 1;
        display: grid;
        align-content: start;
        justify-items: center;
        padding: 4.3rem 1.2rem 1.2rem;
        visibility: visible;
        background: linear-gradient(180deg, rgba(2, 6, 23, 0.18), rgba(2, 6, 23, 0.52)), radial-gradient(circle at 20% 10%, rgba(96, 165, 250, 0.28), transparent 28%), radial-gradient(circle at 82% 18%, rgba(34, 197, 94, 0.18), transparent 30%), linear-gradient(160deg, #1e3a8a 0%, #0f172a 45%, #020617 100%);
        backdrop-filter: blur(18px) saturate(1.15);
        transition: opacity 0.45s ease 1.2s, transform 0.45s ease 1.2s;
    }

    .lock-statusbar {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2.6rem;
        font-size: 0.64rem;
        color: rgba(255, 255, 255, 0.86);
        font-weight: 700;
        letter-spacing: 0.04em;
    }

    .lock-status-icons {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
    }

    .lock-time {
        font-size: 3.2rem;
        font-weight: 800;
        letter-spacing: -0.05em;
        color: var(--text-primary);
    }

    .lock-date,
    .lock-hint,
    .passcode-label {
        color: var(--landing-muted);
    }

    .lock-date {
        margin-top: 0.35rem;
        font-size: 0.96rem;
    }

    .lock-hint {
        margin-top: 16rem;
        font-size: 0.84rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .passcode-screen {
        z-index: 2;
        display: grid;
        align-content: start;
        justify-items: center;
        padding: 6rem 1.3rem 1.2rem;
        opacity: 0;
        transform: translateY(18px);
        visibility: hidden;
        transition: opacity 0.45s ease 1.55s, transform 0.45s ease 1.55s;
        background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, #020617 4%), color-mix(in srgb, var(--bg-secondary) 84%, #020617 16%));
    }

    .passcode-label {
        font-size: 0.92rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        margin-bottom: 1rem;
    }

    .passcode-dots {
        display: flex;
        gap: 0.7rem;
        margin-bottom: 1.5rem;
    }

    .passcode-dot {
        width: 0.9rem;
        height: 0.9rem;
        border-radius: 50%;
        border: 1px solid color-mix(in srgb, var(--accent-primary) 28%, var(--border-color));
        background: transparent;
        opacity: 0.7;
    }

    .section-reveal.is-visible .passcode-dot:nth-child(1) {
        animation: fillDot 0.22s ease 1.9s forwards;
    }

    .section-reveal.is-visible .passcode-dot:nth-child(2) {
        animation: fillDot 0.22s ease 2.1s forwards;
    }

    .section-reveal.is-visible .passcode-dot:nth-child(3) {
        animation: fillDot 0.22s ease 2.3s forwards;
    }

    .section-reveal.is-visible .passcode-dot:nth-child(4) {
        animation: fillDot 0.22s ease 2.5s forwards;
    }

    .passcode-pad {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.8rem;
        justify-items: center;
        max-width: 14rem;
    }

    .passcode-key {
        position: relative;
        width: 3.1rem;
        height: 3.1rem;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-weight: 700;
        color: var(--text-primary);
        background: color-mix(in srgb, var(--bg-card) 90%, transparent);
        border: 1px solid rgba(148, 163, 184, 0.22);
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
        overflow: visible;
    }

    .section-reveal.is-visible .passcode-key--tap-1 .tap-indicator--key {
        animation: tapIndicatorPopCentered 0.28s cubic-bezier(0.22, 1, 0.36, 1) 1.9s forwards, tapIndicatorExitCentered 0.2s ease 2.08s forwards;
    }

    .section-reveal.is-visible .passcode-key--tap-2 .tap-indicator--key {
        animation: tapIndicatorPopCentered 0.28s cubic-bezier(0.22, 1, 0.36, 1) 2.1s forwards, tapIndicatorExitCentered 0.2s ease 2.28s forwards;
    }

    .section-reveal.is-visible .passcode-key--tap-3 .tap-indicator--key {
        animation: tapIndicatorPopCentered 0.28s cubic-bezier(0.22, 1, 0.36, 1) 2.3s forwards, tapIndicatorExitCentered 0.2s ease 2.48s forwards;
    }

    .section-reveal.is-visible .passcode-key--tap-4 .tap-indicator--key {
        animation: tapIndicatorPopCentered 0.28s cubic-bezier(0.22, 1, 0.36, 1) 2.5s forwards, tapIndicatorExitCentered 0.2s ease 2.68s forwards;
    }

    .section-reveal.is-visible .passcode-key--tap-1 .tap-indicator--key .tap-indicator__finger {
        animation: tapFingerPress 0.24s ease-out 1.9s 1;
    }

    .section-reveal.is-visible .passcode-key--tap-2 .tap-indicator--key .tap-indicator__finger {
        animation: tapFingerPress 0.24s ease-out 2.1s 1;
    }

    .section-reveal.is-visible .passcode-key--tap-3 .tap-indicator--key .tap-indicator__finger {
        animation: tapFingerPress 0.24s ease-out 2.3s 1;
    }

    .section-reveal.is-visible .passcode-key--tap-4 .tap-indicator--key .tap-indicator__finger {
        animation: tapFingerPress 0.24s ease-out 2.5s 1;
    }

    .section-reveal.is-visible .passcode-key--tap-1 .tap-indicator--key .tap-indicator__ring {
        animation: tapRingPulse 0.28s ease-out 1.9s 1;
    }

    .section-reveal.is-visible .passcode-key--tap-2 .tap-indicator--key .tap-indicator__ring {
        animation: tapRingPulse 0.28s ease-out 2.1s 1;
    }

    .section-reveal.is-visible .passcode-key--tap-3 .tap-indicator--key .tap-indicator__ring {
        animation: tapRingPulse 0.28s ease-out 2.3s 1;
    }

    .section-reveal.is-visible .passcode-key--tap-4 .tap-indicator--key .tap-indicator__ring {
        animation: tapRingPulse 0.28s ease-out 2.5s 1;
    }

    .screen-ui {
        position: absolute;
        inset: 0;
        z-index: 3;
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
        align-content: start;
        gap: 0.5rem;
        padding: 2.05rem 0.72rem 0.54rem;
        transform: translateY(26px);
        opacity: 0;
        transition: transform 0.7s ease 2.95s, opacity 0.7s ease 2.95s;
    }

    .os-statusbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.45rem;
        padding: 0 0.08rem;
        min-height: 1rem;
    }

    .status-cluster {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        min-width: 0;
    }

    .status-cluster--right {
        justify-content: flex-end;
    }

    .status-provider,
    .status-time,
    .status-battery {
        font-size: 0.56rem;
        line-height: 1;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 700;
    }

    .status-time {
        color: rgba(255, 255, 255, 0.92);
    }

    .status-signal {
        display: inline-flex;
        align-items: end;
        gap: 0.1rem;
        height: 0.66rem;
    }

        .status-signal span {
            width: 0.14rem;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.78);
        }

            .status-signal span:nth-child(1) {
                height: 0.22rem;
            }

            .status-signal span:nth-child(2) {
                height: 0.34rem;
            }

            .status-signal span:nth-child(3) {
                height: 0.48rem;
            }

            .status-signal span:nth-child(4) {
                height: 0.62rem;
            }

    .battery-shell {
        position: relative;
        width: 1.28rem;
        height: 0.62rem;
        border-radius: 0.22rem;
        border: 1px solid rgba(255, 255, 255, 0.58);
        padding: 0.08rem;
    }

        .battery-shell::after {
            content: '';
            position: absolute;
            top: 50%;
            right: -0.16rem;
            transform: translateY(-50%);
            width: 0.11rem;
            height: 0.26rem;
            border-radius: 0.08rem;
            background: rgba(255, 255, 255, 0.58);
        }

    .battery-level {
        display: block;
        width: 86%;
        height: 100%;
        border-radius: 0.12rem;
        background: linear-gradient(90deg, #22c55e, #86efac);
    }

    .screen-site-shell {
        position: relative;
        min-height: 0;
        height: 100%;
        border-radius: 1.2rem;
        overflow: hidden;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)), radial-gradient(circle at top, rgba(96, 165, 250, 0.14), transparent 32%), rgba(4, 11, 26, 0.94);
        border: 1px solid rgba(148, 163, 184, 0.18);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

        .screen-site-shell::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 30%), linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 26%);
            pointer-events: none;
            z-index: 0;
        }

    .app-screen-sequence,
    .home-indicator {
        position: relative;
        z-index: 1;
    }

    .app-screen {
        border-radius: 1rem;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.86), rgba(2, 6, 23, 0.78));
        box-shadow: 0 14px 32px rgba(2, 6, 23, 0.22);
        backdrop-filter: blur(14px);
    }

    .app-screen-sequence {
        position: absolute;
        inset: 0;
    }

    .app-screen {
        position: absolute;
        inset: 0.72rem 0.72rem 2rem;
        padding: 0;
        display: block;
        opacity: 0;
        transform: translateY(18px) scale(0.98);
        pointer-events: none;
        transition: opacity 220ms ease, transform 260ms ease;
        overflow: hidden;
        background: rgba(2, 6, 23, 0.94);
    }

        .app-screen.is-active {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

    .phone-preview-frame {
        width: 100%;
        height: 100%;
        display: block;
        border: 0;
        background: transparent;
    }

    .app-screen-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.35rem;
    }

    .app-screen-title {
        display: block;
        font-size: 0.92rem;
        line-height: 1.05;
        letter-spacing: -0.03em;
    }

    .app-screen-copy {
        margin: -0.18rem 0 0;
        font-size: 0.63rem;
        line-height: 1.32;
        color: rgba(226, 232, 240, 0.78);
    }

    .plan-builder-panel,
    .tutorial-viewer,
    .session-live-card,
    .progress-dashboard {
        display: grid;
        gap: 0.55rem;
    }

    .phone-builder-mini,
    .phone-tutorial-card,
    .phone-sim-card,
    .phone-progress-grid {
        display: grid;
        gap: 0.48rem;
    }

    .phone-builder-mode,
    .phone-field,
    .phone-sim-box,
    .phone-progress-card,
    .phone-tutorial-card,
    .phone-sim-head,
    .phone-sim-progress {
        padding: 0.56rem 0.6rem;
        border-radius: 0.82rem;
        background: rgba(15, 23, 42, 0.68);
        border: 1px solid rgba(148, 163, 184, 0.14);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    .phone-builder-grid,
    .phone-progress-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.48rem;
    }

    .phone-builder-grid--stats {
        gap: 0.42rem;
    }

    .phone-mini-label {
        display: block;
        margin-bottom: 0.24rem;
        font-size: 0.5rem;
        line-height: 1.1;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(148, 163, 184, 0.9);
        font-weight: 700;
    }

    .phone-input-shell {
        min-height: 1.8rem;
        padding: 0.42rem 0.52rem;
        border-radius: 0.7rem;
        display: flex;
        align-items: center;
        background: rgba(2, 6, 23, 0.44);
        border: 1px solid rgba(148, 163, 184, 0.16);
        font-size: 0.6rem;
        color: rgba(241, 245, 249, 0.92);
    }

    .phone-input-shell--select::after {
        content: '▾';
        margin-left: auto;
        opacity: 0.7;
    }

    .phone-segmented {
        display: flex;
        gap: 0.28rem;
        padding: 0.16rem;
        border-radius: 0.76rem;
        background: rgba(2, 6, 23, 0.38);
        border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .phone-segmented--compact {
        padding: 0.14rem;
    }

    .phone-segmented-btn {
        flex: 1 1 0;
        min-width: 0;
        padding: 0.34rem 0.28rem;
        border-radius: 0.56rem;
        text-align: center;
        font-size: 0.54rem;
        font-weight: 700;
        color: rgba(203, 213, 225, 0.8);
    }

    .phone-segmented-btn--active {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.34), rgba(99, 102, 241, 0.26));
        color: #dbeafe;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .phone-builder-actions,
    .phone-tutorial-actions,
    .phone-sim-footer,
    .phone-tutorial-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.34rem;
    }

    .phone-mini-btn,
    .phone-pill {
        padding: 0.26rem 0.44rem;
        border-radius: 999px;
        font-size: 0.52rem;
        font-weight: 700;
        color: rgba(241, 245, 249, 0.9);
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.32), rgba(99, 102, 241, 0.24));
        border: 1px solid rgba(96, 165, 250, 0.2);
    }

    .phone-mini-btn--ghost,
    .phone-pill--subtle {
        background: rgba(15, 23, 42, 0.62);
        border-color: rgba(148, 163, 184, 0.16);
        color: rgba(226, 232, 240, 0.82);
    }

    .phone-pill--live {
        background: rgba(30, 64, 175, 0.42);
        border-color: rgba(96, 165, 250, 0.24);
    }

    .phone-tutorial-head,
    .phone-sim-progress-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.4rem;
    }

    .phone-tutorial-title,
    .phone-sim-title,
    .phone-progress-card strong {
        display: block;
        font-size: 0.72rem;
        line-height: 1.16;
    }

    .phone-favorite-dot {
        width: 1.34rem;
        height: 1.34rem;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: rgba(245, 158, 11, 0.18);
        border: 1px solid rgba(245, 158, 11, 0.26);
        color: rgba(253, 224, 71, 0.95);
        font-size: 0.62rem;
    }

    .phone-tutorial-copy,
    .phone-sim-copy {
        margin: 0;
        font-size: 0.6rem;
        line-height: 1.32;
        color: rgba(226, 232, 240, 0.8);
    }

    .phone-tutorial-video {
        min-height: 5rem;
    }

    .phone-sim-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.48rem;
    }

    .phone-set-dots {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
        margin-top: 0.24rem;
    }

    .phone-set-dot {
        width: 1.1rem;
        height: 1.1rem;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 0.5rem;
        font-weight: 700;
        color: rgba(226, 232, 240, 0.82);
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(148, 163, 184, 0.18);
    }

    .phone-set-dot--done {
        background: rgba(22, 101, 52, 0.38);
        border-color: rgba(34, 197, 94, 0.2);
    }

    .phone-set-dot--active {
        background: rgba(37, 99, 235, 0.42);
        border-color: rgba(96, 165, 250, 0.24);
    }

    .phone-progress-card {
        min-height: 3.4rem;
    }

    .phone-progress-chart {
        grid-column: 1 / -1;
        min-height: 5.8rem;
    }

    .builder-chip-row,
    .builder-cta-row,
    .session-chip-row,
    .session-actions,
    .tutorial-cue-list,
    .progress-stat-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.36rem;
    }

    .builder-chip,
    .builder-pill,
    .tutorial-cue,
    .session-action {
        padding: 0.26rem 0.48rem;
        border-radius: 999px;
        font-size: 0.54rem;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.84);
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(15, 23, 42, 0.72);
    }

    .builder-chip--active,
    .builder-pill,
    .session-action--primary {
        color: #dbeafe;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.34), rgba(99, 102, 241, 0.26));
        border-color: rgba(96, 165, 250, 0.26);
    }

    .builder-pill--ghost {
        background: rgba(15, 23, 42, 0.54);
    }

    .builder-block,
    .tutorial-meta,
    .progress-stat,
    .progress-summary,
    .session-live-top {
        padding: 0.62rem 0.66rem;
        border-radius: 0.82rem;
        background: rgba(15, 23, 42, 0.66);
        border: 1px solid rgba(148, 163, 184, 0.14);
    }

    .builder-label,
    .progress-stat-label {
        display: block;
        margin-bottom: 0.18rem;
        font-size: 0.52rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: rgba(148, 163, 184, 0.88);
        font-weight: 700;
    }

    .builder-block strong,
    .tutorial-meta strong,
    .session-live-top strong,
    .progress-stat strong {
        display: block;
        font-size: 0.74rem;
    }

    .builder-lines {
        display: grid;
        gap: 0.24rem;
        margin-top: 0.38rem;
    }

    .tutorial-video {
        position: relative;
        min-height: 6rem;
        border-radius: 1rem;
        background: linear-gradient(180deg, rgba(2, 6, 23, 0.06), rgba(2, 6, 23, 0.36)), radial-gradient(circle at center, rgba(96, 165, 250, 0.36), transparent 54%), linear-gradient(135deg, #1d4ed8, #0f172a);
        border: 1px solid rgba(148, 163, 184, 0.16);
        overflow: hidden;
    }

        .tutorial-video::after {
            content: '';
            position: absolute;
            inset: auto 0 0 0;
            height: 28%;
            background: linear-gradient(180deg, transparent, rgba(2, 6, 23, 0.46));
        }

    .tutorial-play {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 10px 22px rgba(2, 6, 23, 0.28);
    }

        .tutorial-play::before {
            content: '';
            position: absolute;
            left: 0.78rem;
            top: 0.56rem;
            border-left: 0.56rem solid #1d4ed8;
            border-top: 0.38rem solid transparent;
            border-bottom: 0.38rem solid transparent;
        }

    .tutorial-meta span {
        display: block;
        margin-top: 0.24rem;
        font-size: 0.62rem;
        line-height: 1.32;
        color: rgba(226, 232, 240, 0.78);
    }

    .session-live-tag {
        display: inline-flex;
        margin-bottom: 0.22rem;
        font-size: 0.52rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(125, 211, 252, 0.9);
        font-weight: 700;
    }

    .session-meter {
        height: 0.52rem;
        border-radius: 999px;
        overflow: hidden;
        background: rgba(15, 23, 42, 0.68);
        border: 1px solid rgba(148, 163, 184, 0.14);
    }

    .session-meter-fill {
        display: block;
        width: 68%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #22c55e, #38bdf8);
    }

    .session-chip--done {
        background: rgba(22, 101, 52, 0.38);
        border-color: rgba(34, 197, 94, 0.2);
    }

    .session-chip--live {
        background: rgba(30, 64, 175, 0.42);
        border-color: rgba(96, 165, 250, 0.24);
    }

    .progress-stat {
        flex: 1 1 0;
    }

    .progress-chart {
        min-height: 7rem;
        padding: 0.7rem;
        border-radius: 1rem;
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 0.34rem;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.56), rgba(2, 6, 23, 0.76)), repeating-linear-gradient(180deg, rgba(148, 163, 184, 0.08) 0 1px, transparent 1px 1.1rem);
        border: 1px solid rgba(148, 163, 184, 0.14);
    }

    .progress-chart-bar {
        flex: 1 1 0;
        border-radius: 999px 999px 0 0;
        background: linear-gradient(180deg, rgba(96, 165, 250, 0.96), rgba(34, 197, 94, 0.7));
    }

    .progress-chart-bar--1 {
        height: 38%;
    }

    .progress-chart-bar--2 {
        height: 52%;
    }

    .progress-chart-bar--3 {
        height: 64%;
    }

    .progress-chart-bar--4 {
        height: 78%;
    }

    .progress-chart-bar--5 {
        height: 92%;
    }

    .progress-summary {
        font-size: 0.62rem;
        line-height: 1.34;
        color: rgba(226, 232, 240, 0.8);
    }

    .home-indicator {
        position: absolute;
        left: 50%;
        bottom: 0.62rem;
        width: 5.2rem;
        height: 0.28rem;
        border-radius: 999px;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.72);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
    }

    .phone-showcase-controls {
        position: absolute;
        left: 0.72rem;
        right: 0.72rem;
        bottom: 1rem;
        z-index: 3;
        display: flex;
        align-items: center;
        gap: 0.34rem;
    }

    .phone-showcase-nav,
    .phone-showcase-toggle,
    .phone-showcase-dot {
        border: 0;
        cursor: pointer;
        font: inherit;
    }

    .phone-showcase-nav,
    .phone-showcase-toggle {
        min-height: 1.65rem;
        border-radius: 999px;
        color: rgba(241, 245, 249, 0.92);
        background: rgba(15, 23, 42, 0.76);
        border: 1px solid rgba(148, 163, 184, 0.2);
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 18px rgba(2, 6, 23, 0.18);
    }

    .phone-showcase-nav {
        width: 1.8rem;
        font-size: 1rem;
        font-weight: 700;
        line-height: 1;
    }

    .phone-showcase-toggle {
        padding: 0.36rem 0.62rem;
        font-size: 0.54rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    .phone-showcase-dots {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.28rem;
        flex: 1;
        min-width: 0;
    }

    .phone-showcase-dot {
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.42);
        border: 1px solid rgba(255, 255, 255, 0.16);
        transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
    }

        .phone-showcase-dot.is-active {
            transform: scale(1.18);
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            border-color: transparent;
        }

    .session-chip {
        padding: 0.18rem 0.32rem;
        border-radius: 999px;
        font-size: 0.54rem;
        font-weight: 700;
        color: var(--text-primary);
        background: color-mix(in srgb, var(--bg-card) 90%, transparent);
        border: 1px solid rgba(148, 163, 184, 0.22);
    }

    .section-reveal.is-visible .phone-device {
        transform: translateY(0) scale(1);
        opacity: 1;
    }

    .section-reveal.is-visible .phone-glow {
        transform: scale(1);
        opacity: 0.8;
    }

    .section-reveal.is-visible .screen-power-layer {
        opacity: 0;
        pointer-events: none;
    }

    .section-reveal.is-visible .lock-screen {
        opacity: 0;
        transform: scale(0.98);
        visibility: hidden;
        transition: opacity 0.45s ease 1.2s, transform 0.45s ease 1.2s, visibility 0s linear 1.65s;
    }

    .section-reveal.is-visible .passcode-screen {
        visibility: visible;
        animation: passcodeScreenSequence 1.4s ease 1.55s forwards;
    }

    .section-reveal.is-visible .screen-ui {
        transform: translateY(0);
        opacity: 1;
    }

    @keyframes fillDot {
        from {
            transform: scale(0.88);
            background: transparent;
        }

        to {
            transform: scale(1);
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            border-color: transparent;
            opacity: 1;
        }
    }

    @keyframes phoneScreenIn {
        from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes phoneScreenOut {
        from {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        to {
            opacity: 0;
            transform: translateY(-10px) scale(0.985);
        }
    }

    @keyframes passcodeScreenSequence {
        0% {
            opacity: 0;
            transform: translateY(18px);
            visibility: visible;
        }

        18%, 62% {
            opacity: 1;
            transform: translateY(0);
            visibility: visible;
        }

        100% {
            opacity: 0;
            transform: translateY(-10px);
            visibility: hidden;
        }
    }

    @keyframes tapIndicatorPopCentered {
        from {
            opacity: 0;
            transform: translate3d(-50%, calc(-50% + 0.45rem), 0) scale(0.88);
        }

        60% {
            opacity: 1;
            transform: translate3d(-50%, -50%, 0) scale(1.02);
        }

        to {
            opacity: 1;
            transform: translate3d(-50%, -50%, 0) scale(1);
        }
    }

    @keyframes tapIndicatorExitCentered {
        from {
            opacity: 1;
            transform: translate3d(-50%, -50%, 0) scale(1);
        }

        to {
            opacity: 0;
            transform: translate3d(-50%, calc(-50% - 0.08rem), 0) scale(0.94);
        }
    }

    @keyframes tapFingerPress {
        0%, 100% {
            transform: scale(1);
        }

        45% {
            transform: scale(0.84);
        }

        70% {
            transform: scale(1.02);
        }
    }

    @keyframes tapRingPulse {
        0% {
            opacity: 0;
            transform: scale(0.54);
        }

        25% {
            opacity: 0.7;
        }

        100% {
            opacity: 0;
            transform: scale(1.18);
        }
    }

    .proof-card,
    .timeline-card {
        min-height: 14rem;
    }

    .proof-index,
    .timeline-step,
    .feature-code {
        color: var(--text-secondary);
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        letter-spacing: 0.14em;
        display: block;
    }

    .proof-text,
    .timeline-text,
    .feature-text,
    .spotlight-text,
    .final-copy {
        display: block;
        color: var(--text-primary);
        line-height: 1.55;
    }

    .command-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
    }

    .command-dashboard-card {
        min-height: 18rem;
        justify-content: flex-start;
    }

    .command-copy {
        display: block;
        margin-top: 0.25rem;
    }

    .command-cta {
        display: inline-flex;
        margin-top: 0.8rem;
        color: var(--landing-accent);
        font-weight: 700;
    }

    .feature-layout {
        display: grid;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        gap: 1rem;
    }

    .feature-spotlight {
        min-height: 100%;
    }

    .spotlight-headline,
    .final-headline {
        display: block;
        font-size: clamp(1.8rem, 3vw, 2.6rem);
        line-height: 1.06;
        margin: 0.2rem 0 0.8rem;
        max-width: 12ch;
        font-family: 'Inter', sans-serif;
        letter-spacing: -0.03em;
    }

    .feature-list {
        display: grid;
        gap: 1rem;
    }

    .feature-panel {
        min-height: 12rem;
    }

    .testimonial-stage {
        max-width: 54rem;
        margin: 0 auto;
        touch-action: pan-y;
        user-select: none;
    }

    .testimonial-card {
        min-height: 14rem;
        justify-content: flex-start;
        position: relative;
    }

    .quote-mark {
        position: absolute;
        top: 0.55rem;
        left: 1.15rem;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 4.9rem;
        font-weight: 700;
        line-height: 0.78;
        letter-spacing: -0.28rem;
        color: color-mix(in srgb, var(--accent-primary) 18%, rgba(255, 255, 255, 0.12));
        text-shadow: 0 10px 30px color-mix(in srgb, var(--accent-primary) 10%, transparent);
        opacity: 0.95;
        pointer-events: none;
        user-select: none;
    }

    .testimonial-dashboard-card :deep(.card-title) {
        display: none;
    }

    .testimonial-dashboard-card :deep(.card-info) {
        display: flex;
        flex-direction: column;
        min-height: 100%;
        height: 100%;
        font-size: inherit;
        font-weight: inherit;
        line-height: inherit;
        color: inherit;
    }

    .testimonial-text {
        position: relative;
        z-index: 1;
        font-size: clamp(1.12rem, 2vw, 1.4rem);
        line-height: 1.6;
        margin: 0;
        max-width: 32rem;
        padding-left: 4.5rem;
        padding-bottom: 3.9rem;
    }

    .testimonial-meta {
        position: absolute;
        right: 1.8rem;
        bottom: 1.6rem;
        z-index: 2;
        display: grid;
        gap: 0.2rem;
        text-align: right;
        justify-items: end;
    }

        .testimonial-meta strong {
            font-size: 1.05rem;
        }

        .testimonial-meta span {
            color: var(--landing-muted);
            font-size: 0.92rem;
        }

    .testimonial-dots {
        display: flex;
        justify-content: center;
        gap: 0.55rem;
        margin-top: 1rem;
    }

    .testimonial-dot {
        width: 0.65rem;
        height: 0.65rem;
        border-radius: 999px;
        border: 0;
        background: rgba(255, 255, 255, 0.2);
        padding: 0;
        cursor: pointer;
        transition: width 0.2s ease, background 0.2s ease, transform 0.2s ease;
    }

        .testimonial-dot.is-active {
            width: 1.75rem;
            background: linear-gradient(90deg, var(--landing-accent), var(--landing-accent-2));
            transform: scale(1.04);
        }

    .final-cta {
        padding-bottom: 1rem;
    }

    .final-cta-panel {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 1.4rem;
        align-items: start;
    }

        .final-cta-panel :deep(.card-title) {
            align-self: flex-start;
            width: 100%;
            text-align: left;
        }

    .hero-copy,
    .hero-visual,
    .proof-band,
    .command-center,
    .feature-marquee,
    .timeline,
    .testimonials,
    .final-cta {
        isolation: isolate;
    }

    .hero-strip-card,
    .proof-card,
    .feature-panel,
    .timeline-card,
    .testimonial-card,
    .visual-frame,
    .feature-spotlight,
    .final-cta-panel,
    .command-dashboard-card {
        transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    }

    @media (hover: hover) {
        .hero-strip-card:hover,
        .proof-card:hover,
        .feature-panel:hover,
        .timeline-card:hover,
        .testimonial-card:hover,
        .command-dashboard-card:hover,
        .visual-frame:hover,
        .feature-spotlight:hover,
        .final-cta-panel:hover {
            transform: translateY(-4px) scale(1.015);
            box-shadow: 0 26px 60px rgba(15, 23, 42, 0.4);
            border-color: var(--landing-line-strong);
        }
    }

    :global(html.dark-mode) .landing-page {
        --landing-card: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        --landing-card-hover: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 18%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 12%, transparent), transparent 60%), color-mix(in srgb, #020617 90%, #0b1430 10%);
        --landing-card-strong: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        --landing-line: rgba(148, 163, 184, 0.45);
        --landing-line-strong: rgba(129, 140, 248, 0.7);
        --landing-muted: rgba(201, 209, 217, 0.82);
    }

    :global(html.dark-mode) .hero-strip-card,
    :global(html.dark-mode) .visual-frame {
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .final-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
        justify-content: flex-end;
    }

    .landing-dashboard-card {
        border-radius: 18px !important;
        padding: 1.6rem 1.8rem !important;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%) !important;
        border: 1px solid rgba(148, 163, 184, 0.26) !important;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22) !important;
        gap: 0.55rem !important;
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        transition: transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 260ms cubic-bezier(0.22, 0.61, 0.36, 1), border-color 220ms ease-out, background 260ms ease-out !important;
    }

        .landing-dashboard-card::before {
            display: none !important;
        }

    @media (hover: hover) {
        .landing-dashboard-card:hover {
            transform: translateY(-4px) scale(1.015) !important;
            box-shadow: 0 26px 60px rgba(15, 23, 42, 0.4) !important;
            border-color: rgba(129, 140, 248, 0.7) !important;
            background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 11%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 90%, #020617 10%) !important;
        }
    }

    :global(html.dark-mode) .landing-dashboard-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617 !important;
        border-color: rgba(148, 163, 184, 0.45) !important;
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7) !important;
    }

    @keyframes fadeUp {
        from {
            opacity: 0;
            transform: translateY(18px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes shiftGradient {
        0% {
            background-position: 0% 50%;
        }

        100% {
            background-position: 100% 50%;
        }
    }

    @keyframes pulseRing {
        0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
        }

        50% {
            transform: translate(-50%, -50%) scale(1.04);
            opacity: 1;
        }
    }

    @keyframes floatAura {
        from {
            transform: translate3d(0, 0, 0);
        }

        to {
            transform: translate3d(2rem, -1rem, 0);
        }
    }

    @media (max-width: 1120px) {
        .hero,
        .showcase-layout,
        .feature-layout,
        .final-cta-panel {
            grid-template-columns: 1fr;
        }

        .command-grid,
        .proof-grid,
        .timeline-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .final-actions {
            justify-content: flex-start;
        }
    }

    @media (max-width: 720px) {
        .landing-page {
            width: 100%;
            padding-bottom: 4rem;
        }

        .section-shell {
            width: min(100% - 1rem, 1280px);
        }

        .hero {
            min-height: auto;
            padding-top: 2.5rem;
        }

        .hero-strip,
        .signal-grid,
        .proof-grid,
        .command-grid,
        .timeline-grid {
            grid-template-columns: 1fr;
        }

        .signal-card--headline {
            grid-column: span 1;
        }

        .visual-frame--primary {
            transform: none;
        }

        .hero-actions,
        .final-actions {
            flex-direction: column;
        }

        .button-primary,
        .button-secondary {
            width: 100%;
        }

        .testimonial-card {
            min-height: 16rem;
        }

        .phone-stage {
            min-height: 34rem;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .landing-page::before,
        .landing-page::after,
        .hero-kinetic,
        .radar-ring,
        .app-screen,
        .tap-indicator,
        .tap-indicator__finger,
        .tap-indicator__ring {
            animation: none;
        }

        .tap-indicator,
        .app-screen {
            opacity: 0;
        }

            .app-screen.is-active {
                opacity: 1;
                transform: none;
            }

        .section-reveal,
        .eyebrow,
        .welcome-copy,
        .hero-title,
        .hero-text,
        .hero-actions,
        .hero-strip {
            transition: none;
            animation: none;
            opacity: 1;
            transform: none;
        }
    }
</style>

