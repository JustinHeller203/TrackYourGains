<!--LandingPage.vue-->
<template>
    <div class="landing">
        <section class="hero">
            <div class="hero-badge">Neu · Dein smartes Fitness-Dashboard</div>

            <h1 class="hero-title">
                <span class="typed-text">{{ typedText }}</span><span class="cursor">|</span>
            </h1>

            <p class="hero-subtitle">
                Dein Begleiter für Fitness, Ernährung und Fortschritt. Starte jetzt und erreiche deine Ziele! 💪
            </p>

            <router-link to="/progress" class="cta-button">Jetzt loslegen</router-link>
        </section>
        <section class="stats">
            <h2 class="section-title">Deine Erfolge 🏆</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-number">{{ workoutsCompleted }}</span>
                    <p class="stat-text">Workouts abgeschlossen</p>
                </div>
                <div class="stat-card">
                    <span class="stat-number">{{ mealsPlanned }}</span>
                    <p class="stat-text">Mahlzeiten geplant</p>
                </div>
                <div class="stat-card">
                    <span class="stat-number">{{ kgLost }}</span>
                    <p class="stat-text">Kilo abgenommen</p>
                </div>
            </div>
        </section>
        <section class="features">
            <h2 class="section-title">Alles, was du brauchst 🌟</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <h3 class="feature-title">🏋️‍♂️ Training</h3>
                    <p class="feature-text">Plane Workouts, die dich voranbringen.</p>
                </div>
                <div class="feature-card">
                    <h3 class="feature-title">🍎 Ernährung</h3>
                    <p class="feature-text">Tracke Mahlzeiten für maximale Energie.</p>
                </div>
                <div class="feature-card">
                    <h3 class="feature-title">📈 Fortschritt</h3>
                    <p class="feature-text">Sieh deine Erfolge auf einen Blick.</p>
                </div>
                <div class="feature-card">
                    <h3 class="feature-title">🎥 Tutorials</h3>
                    <p class="feature-text">Lerne Techniken wie ein Profi.</p>
                </div>
            </div>
        </section>
        <section class="quick-links">
            <h2 class="section-title">Schnellstart ⚡</h2>
            <div class="links-grid">
                <router-link to="/training" class="link-button">
                    <span>🏋️ Trainingsplan erstellen</span>
                </router-link>
                <router-link to="/nutrition" class="link-button">
                    <span>🍽️ Mahlzeit planen</span>
                </router-link>
                <router-link to="/progress" class="link-button link-button--highlight">
                    <span>📈 Fortschritt ansehen</span>
                </router-link>
            </div>
        </section>
        <section class="testimonials">
            <h2 class="section-title">Was unsere Nutzer sagen 🗣️</h2>
            <div class="testimonials-slider"
                 @touchstart.passive="onSwipeStart"
                 @touchmove.passive="onSwipeMove"
                 @touchend="onSwipeEnd"
                 @touchcancel="onSwipeEnd">
                <div v-for="(testimonial, index) in testimonials"
                     :key="testimonial.id"
                     class="testimonial-card"
                     v-show="index === currentTestimonial">
                    <p class="testimonial-text">{{ testimonial.text }}</p>
                    <p class="testimonial-author">- {{ testimonial.author }}</p>
                </div>

                <div class="testimonial-dots" role="tablist">
                    <button v-for="(testimonial, index) in testimonials"
                            :key="testimonial.id + '-dot'"
                            class="testimonial-dot"
                            :class="{ 'is-active': index === currentTestimonial }"
                            type="button"
                            @click="currentTestimonial = index"
                            :aria-label="`Zeige Testimonial ${index + 1}`"></button>
                </div>
            </div>
        </section>
        <section class="cta">
            <h2 class="section-title">Bereit für deine Transformation? 🌟</h2>
            <router-link to="/progress" class="cta-button">Los geht’s! 🚀</router-link>
        </section>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue'
    import {
        LS_PROGRESS_WORKOUTS,
        LS_PROGRESS_MEALS,
        LS_PROGRESS_WEIGHTS,
    } from '@/constants/storageKeys'

    const typedText = ref('')
    const fullText = 'TrackYourGains'
    let index = 0

    const workoutsCompleted = ref(0)
    const mealsPlanned = ref(0)
    const kgLost = ref(0)

    type StoredWeightEntry = { date: string; weight: number }
    type StoredMeal = { name: string; calories: number }

    const loadStatsFromStorage = () => {
        if (typeof window === 'undefined') return

        // --- Workouts: aus LS_PROGRESS_WORKOUTS ---
        try {
            const rawWorkouts = window.localStorage.getItem(LS_PROGRESS_WORKOUTS)
            const parsed = rawWorkouts ? JSON.parse(rawWorkouts) as unknown[] : []
            workoutsCompleted.value = Array.isArray(parsed) ? parsed.length : 0
        } catch {
            workoutsCompleted.value = 0
        }

        // --- Mahlzeiten: aus progress_meals ---
        try {
            const rawMeals = window.localStorage.getItem(LS_PROGRESS_MEALS)
            const parsedMeals = rawMeals ? JSON.parse(rawMeals) as StoredMeal[] : []
            mealsPlanned.value = Array.isArray(parsedMeals) ? parsedMeals.length : 0
        } catch {
            mealsPlanned.value = 0
        }

        // --- Kilo abgenommen: aus progress_weights ---
        try {
            const rawWeights = window.localStorage.getItem(LS_PROGRESS_WEIGHTS)
            const weights = rawWeights ? JSON.parse(rawWeights) as StoredWeightEntry[] : []

            if (Array.isArray(weights) && weights.length >= 2) {
                // In Progress.vue packst du neue Einträge mit unshift nach vorne
                const latest = weights[0].weight          // aktuelles Gewicht
                const first = weights[weights.length - 1].weight // erstes gespeichertes Gewicht
                const diff = first - latest
                kgLost.value = diff > 0 ? Math.round(diff * 10) / 10 : 0
            } else {
                kgLost.value = 0
            }
        } catch {
            kgLost.value = 0
        }
    }
    // Testimonials Slider
    const testimonials = ref([
        {
            id: 1,
            text: 'TrackYourGains hat mir geholfen, meine Fitnessziele zu erreichen! 🎯',
            author: 'Max Mustermann',
        },
        {
            id: 2,
            text: 'Ich liebe die Ernährungs-Tracking-Funktion. Sie ist so einfach zu bedienen! 🍴',
            author: 'Anna Beispiel',
        },
    ])

    const currentTestimonial = ref(0)
    let testimonialTimer: number | undefined

    // --- Swipe (Mobile) ---
    const swipe = ref({
        active: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        moved: false,
    })

    const SWIPE_MIN_PX = 40      // wie “hart” man wischen muss
    const SWIPE_MAX_Y_PX = 70    // wenn zu vertikal -> ignorieren

    function goNextTestimonial() {
        if (testimonials.value.length <= 1) return
        currentTestimonial.value = (currentTestimonial.value + 1) % testimonials.value.length
    }

    function goPrevTestimonial() {
        if (testimonials.value.length <= 1) return
        currentTestimonial.value =
            (currentTestimonial.value - 1 + testimonials.value.length) % testimonials.value.length
    }

    function onSwipeStart(e: TouchEvent) {
        if (testimonials.value.length <= 1) return
        const t = e.touches[0]
        swipe.value.active = true
        swipe.value.moved = false
        swipe.value.startX = t.clientX
        swipe.value.startY = t.clientY
        swipe.value.lastX = t.clientX
        swipe.value.lastY = t.clientY

        // optional: Autoplay kurz anhalten während der User swiped
        stopTestimonialRotation()
    }

    function onSwipeMove(e: TouchEvent) {
        if (!swipe.value.active) return
        const t = e.touches[0]
        swipe.value.lastX = t.clientX
        swipe.value.lastY = t.clientY
        swipe.value.moved = true
    }

    function onSwipeEnd() {
        if (!swipe.value.active) return
        swipe.value.active = false

        const dx = swipe.value.lastX - swipe.value.startX
        const dy = swipe.value.lastY - swipe.value.startY

        // zu vertikal -> das war scrollen, kein swipe
        if (Math.abs(dy) > SWIPE_MAX_Y_PX) {
            startTestimonialRotation()
            return
        }

        if (Math.abs(dx) >= SWIPE_MIN_PX) {
            if (dx < 0) goNextTestimonial() // nach links wischen -> nächstes
            else goPrevTestimonial()        // nach rechts wischen -> vorheriges
        }

        startTestimonialRotation()
    }

    const startTestimonialRotation = () => {
        if (typeof window === 'undefined' || testimonials.value.length <= 1) return

        testimonialTimer = window.setInterval(() => {
            currentTestimonial.value =
                (currentTestimonial.value + 1) % testimonials.value.length
        }, 7000)
    }

    const stopTestimonialRotation = () => {
        if (testimonialTimer !== undefined) {
            window.clearInterval(testimonialTimer)
            testimonialTimer = undefined
        }
    }

    const typeText = () => {
        if (index < fullText.length) {
            typedText.value += fullText.charAt(index)
            index++
            setTimeout(typeText, 100)
        }
    }

    const setupScrollReveal = () => {
        const sections = document.querySelectorAll<HTMLElement>(
            '.stats, .features, .quick-links, .testimonials, .cta'
        )

        if (!('IntersectionObserver' in window)) {
            sections.forEach((section, idx) => {
                section.classList.add('section-animate', 'is-visible')
                section.style.setProperty('--reveal-delay', `${idx * 70}ms`)
            })
            return
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target as HTMLElement
                        el.classList.add('is-visible')
                        obs.unobserve(el)
                    }
                })
            },
            { threshold: 0.15 }
        )

        sections.forEach((section, idx) => {
            const el = section as HTMLElement
            el.classList.add('section-animate')
            el.style.setProperty('--reveal-delay', `${idx * 70}ms`)
            observer.observe(el)
        })
    }

    onMounted(() => {
        typeText()
        setupScrollReveal()
        startTestimonialRotation()
        loadStatsFromStorage()
    })

    onUnmounted(() => {
        stopTestimonialRotation()
    })
</script>


<style scoped>
    .landing {
        font-family: 'Inter', sans-serif;
        background: transparent;
        scrollbar-gutter: stable;
        max-width: 100%;
    }

    /* ===== Hero ===== */
    .hero {
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.25rem; /* mehr Luft zwischen Badge, Titel, Text, Button */
        text-align: center;
        padding: 2.5rem 1.5rem;
        position: relative;
        overflow: visible;
    }

    .hero-badge {
        font-size: 0.85rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0.4rem 0.9rem;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.06);
        color: var(--accent-primary);
        border: 1px solid rgba(129, 140, 248, 0.5);
        backdrop-filter: blur(8px);
        box-shadow: 0 8px 25px rgba(15, 23, 42, 0.25);
        animation: heroBadgeIn 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(8px);
    }

    /* kleine Entry-Animation */
    @keyframes heroBadgeIn {
        from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    /* weiche Lichtkegel hinter dem Hero-Content */
    .hero::before,
    .hero::after {
        content: "";
        position: absolute;
        border-radius: 999px;
        filter: blur(40px);
        opacity: 0.6;
        pointer-events: none;
        z-index: -1;
        animation: floatBlob 14s ease-in-out infinite alternate;
    }

    .hero::before {
        width: 420px;
        height: 420px;
        background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.9), transparent 60%);
        top: -120px;
        left: 0;
        transform: translateX(-35%);
    }

    .hero::after {
        width: 380px;
        height: 380px;
        background: radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.9), transparent 60%);
        bottom: -140px;
        right: 0;
        transform: translateX(35%);
        animation-delay: 2s;
    }


    .hero-title {
        font-size: 4rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        background-size: 260% 260%;
        background-position: 0% 50%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        opacity: 0;
        transform: translateY(10px);
        animation: heroFadeUp 0.7s ease-out forwards, heroGradient 10s ease-in-out infinite alternate;
    }

    .hero-subtitle {
        font-size: 1.5rem;
        max-width: 600px;
        margin-bottom: 2rem;
        line-height: 1.6;
        color: var(--text-secondary);
        opacity: 0;
        transform: translateY(10px);
        animation: heroFadeUp 0.7s ease-out forwards;
        animation-delay: 0.25s;
    }

    @keyframes floatBlob {
        0% {
            transform: translate3d(0, 0, 0) scale(1);
        }

        50% {
            transform: translate3d(10px, -10px, 0) scale(1.05);
        }

        100% {
            transform: translate3d(-12px, 8px, 0) scale(1.02);
        }
    }

    /* Hero-Fade-Up */
    @keyframes heroFadeUp {
        from {
            opacity: 0;
            transform: translateY(14px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .stat-card,
    .feature-card,
    .testimonial-card{
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        padding: 1.6rem 1.8rem;
        border-radius: 18px;
        /* moderner Layered-Look */
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }
    /* Scroll-Reveal Sections */
    .section-animate {
        opacity: 0;
        transform: translateY(18px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        transition-delay: var(--reveal-delay, 0ms);
    }

        .section-animate.is-visible {
            opacity: 1;
            transform: translateY(0);
        }

    .hero .cta-button {
        position: relative;
        opacity: 0;
        transform: translateY(10px);
        animation: heroFadeUp 0.7s ease-out forwards;
        animation-delay: 0.45s;
    }

        /* pulsierender Ring um den Hero-CTA */
        .hero .cta-button::before {
            content: "";
            position: absolute;
            inset: -4px;
            border-radius: inherit;
            border: 1px solid rgba(129, 140, 248, 0.7);
            opacity: 0;
            transform: scale(0.9);
            pointer-events: none;
            animation: ctaPulse 2.2s ease-out infinite;
        }

    /* Blinking cursor for typing effect */
    .cursor {
        display: inline-block;
        width: 0.6ch;
        color: var(--text-primary);
        animation: blink 1s step-end infinite;
        margin-left: 2px;
    }

    /* ===== Sections ===== */
    .stats,
    .features,
    .quick-links,
    .testimonials,
    .cta {
        padding: 4rem 1rem;
        max-width: 1200px;
        margin: 0 auto;
        text-align: center;
    }

    .section-title {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 2rem;
        padding-bottom: 0.35rem;
    }

        .section-title::after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: 0;
            width: 110px;
            height: 3px;
            border-radius: 999px;
            background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
            transform: translateX(-50%) scaleX(0.4);
            opacity: 0;
            transform-origin: center;
        }

    .cta {
        display: flex;
        flex-direction: column;
        align-items: center; /* zentriert Button + Titel horizontal */
        justify-content: center;
    }

        .cta .section-title {
            margin-bottom: 1.5rem; /* Abstand direkt über dem Button, nicht zu groß */
        }
    /* Underline kickt erst rein, wenn die Section sichtbar ist */
    .section-animate .section-title::after {
        opacity: 0;
    }

    .section-animate.is-visible .section-title::after {
        animation: sectionUnderline 0.6s ease-out forwards;
    }

    .quick-links .link-button {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
        animation: quickLinkIn 0.55s ease-out forwards;
    }

        .quick-links .link-button:nth-child(1) {
            animation-delay: 0.1s;
        }

        .quick-links .link-button:nth-child(2) {
            animation-delay: 0.2s;
        }

        .quick-links .link-button:nth-child(3) {
            animation-delay: 0.3s;
        }

    @media (hover: hover) {
        .quick-links .link-button:hover {
            transform: translateY(-2px) scale(1.02);
        }
    }

    /* Stats: Zahlen springen rein, wenn die Sektion sichtbar wird */
    .stats.section-animate.is-visible .stat-card:nth-child(1) .stat-number {
        animation: statPop 0.5s ease-out forwards;
        animation-delay: 0.05s;
    }

    .stats.section-animate.is-visible .stat-card:nth-child(2) .stat-number {
        animation: statPop 0.5s ease-out forwards;
        animation-delay: 0.15s;
    }

    .stats.section-animate.is-visible .stat-card:nth-child(3) .stat-number {
        animation: statPop 0.5s ease-out forwards;
        animation-delay: 0.25s;
    }

    @keyframes heroGradient {
        0% {
            background-position: 0% 50%;
        }

        50% {
            background-position: 50% 100%;
        }

        100% {
            background-position: 100% 50%;
        }
    }

    /* CTA-Pulse-Ring */
    @keyframes ctaPulse {
        0% {
            opacity: 0;
            transform: scale(0.9);
        }

        40% {
            opacity: 1;
            transform: scale(1.05);
        }

        100% {
            opacity: 0;
            transform: scale(1.14);
        }
    }

    /* Quick-Link-Reinflug */
    @keyframes quickLinkIn {
        from {
            opacity: 0;
            transform: translateY(12px) scale(0.94);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    /* Stats-Number-Pop */
    @keyframes statPop {
        0% {
            transform: translateY(6px) scale(0.9);
            opacity: 0;
        }

        55% {
            transform: translateY(-2px) scale(1.08);
            opacity: 1;
        }

        100% {
            transform: translateY(0) scale(1);
        }
    }

    /* Section-Title-Underline */
    @keyframes sectionUnderline {
        0% {
            opacity: 0;
            transform: translateX(-50%) scaleX(0.4);
        }

        60% {
            opacity: 1;
            transform: translateX(-50%) scaleX(1.05);
        }

        100% {
            opacity: 1;
            transform: translateX(-50%) scaleX(1);
        }
    }

    .stats-grid,
    .features-grid,
    .links-grid,
    .testimonials-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        max-width: 100%;
        overflow: visible; /* Hover/Shadow nicht abschneiden */
        padding: 0.35rem; /* kleiner “Puffer” für Glow am Rand */
    }

    .links-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center; /* jede Zeile zentriert */
        gap: 1.25rem;
        overflow-x: visible; /* Glow der Buttons bleibt sichtbar */
    }

        .stats-grid > *,
        .features-grid > *,
        .links-grid > *,
        .testimonials-grid > * {
            min-width: 0; /* ⟵ Kinder dürfen schrumpfen */
        }

    .quick-links .link-button {
        min-width: 220px;
    }
    .testimonials-slider {
        max-width: 640px;
        margin: 0 auto;
        position: relative;
        width: 100%;
        box-sizing: border-box;
        min-height: 220px;
        touch-action: pan-y; /* vertikal scrollen bleibt normal, horizontal swipe wird sauber */
        -webkit-user-select: none;
        user-select: none;
    }

    @media (max-width: 520px) {
        .testimonials-slider {
            min-height: 260px;
        }
    }


    .testimonial-dots {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.5rem;
    }

    .testimonial-dot {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        border: none;
        background: rgba(148, 163, 184, 0.6);
        padding: 0;
        cursor: pointer;
        transition: transform 0.2s ease, background 0.2s ease, width 0.2s ease;
    }

        .testimonial-dot.is-active {
            width: 18px;
            background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
            transform: scale(1.05);
        }
    .stat-card,
    .feature-card,
    .testimonial-card{
        will-change: transform;
        contain: none; /* Shadow/Outline darf rausmalen */
    }

    /* Hover nur dort, wo Hover existiert (kein Mobile) */
    @media (hover: hover) {
        .stat-card:hover,
        .feature-card:hover,
        .testimonial-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    .stat-number {
        font-size: 2.3rem;
        font-weight: 800;
        display: block;
        margin-bottom: 0.3rem;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .stat-text {
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: color-mix(in srgb, var(--text-secondary) 82%, #9ca3af 18%);
    }

    .feature-text,
    .testimonial-text {
        font-size: 0.95rem;
        color: var(--text-secondary);
        line-height: 1.55;
    }

    .testimonial-author {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-top: 0.5rem;
    }

    /* ===== CTA + Link Buttons (with strong, clipped hover + sheen) ===== */
    .cta-button,
    .link-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        isolation: isolate; /* prevent the sheen from leaking */
        overflow: hidden; /* clip pseudo-element inside */
        border-radius: 50px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        background-size: 200% 200%;
        background-position: 0% 50%;
        color: #fff;
        text-decoration: none;
        padding: 1rem 2.5rem; /* CTA default size */
        font-size: 1.2rem;
        font-weight: 700;
        box-shadow: var(--shadow);
        transition: background-position .35s ease, filter .25s ease, box-shadow .25s ease, outline-color .25s ease;
    }

    /* Link buttons a bit smaller */
    .link-button {
        padding: 1rem 1.5rem;
        font-size: 1rem;
    }

        .cta-button:hover,
        .link-button:hover {
            background-position: 100% 50%;
            filter: brightness(1.12) saturate(1.12);
            box-shadow: var(--shadow-hover), 0 8px 22px rgba(0,0,0,.12);
            outline: 3px solid var(--accent-primary);
            outline-offset: 3px;
        }

        /* Sheen highlight – fully clipped inside the button */
        .cta-button::after,
        .link-button::after {
            content: '';
            position: absolute;
            top: -20%;
            bottom: -20%;
            left: -30%;
            width: 30%;
            transform: skewX(-20deg) translateX(0);
            background: linear-gradient( to right, transparent 0%, rgba(255,255,255,.18) 45%, rgba(255,255,255,.35) 50%, rgba(255,255,255,.18) 55%, transparent 100% );
            opacity: 0;
            transition: transform .45s ease, opacity .2s ease;
            pointer-events: none;
            will-change: transform;
        }

        /* Sheen/Strich beim Hover komplett deaktivieren */
        .cta-button::after,
        .link-button::after {
            content: none !important;
            display: none !important;
        }

        .cta-button:hover::after,
        .link-button:hover::after {
            opacity: 1;
            transform: skewX(-20deg) translateX(260%);
        }

    /* ===== Dark mode variants ===== */
    html.dark-mode .stat-card,
    html.dark-mode .feature-card,
    html.dark-mode .testimonial-card{
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .section-title,
    html.dark-mode .feature-title,
    html.dark-mode .testimonial-author {
        color: #f0f6fc;
    }

    html.dark-mode .stat-number {
        color: #6B8DD6;
    }

    html.dark-mode .stat-text,
    html.dark-mode .feature-text,
    html.dark-mode .testimonial-text{
        color: #c9d1d9;
    }

    html.dark-mode .cta-button,
    html.dark-mode .link-button {
        background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
    }

        html.dark-mode .cta-button:hover,
        html.dark-mode .link-button:hover {
            outline-color: #6B8DD6;
        }

    /* ===== Animations ===== */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes blink {
        0% {
            opacity: 0;
        }

        50% {
            opacity: 1;
        }

        100% {
            opacity: 0;
        }
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
        .hero-title {
            font-size: 2.8rem;
        }

        .hero-subtitle {
            font-size: 1.2rem;
        }

        .cta-button {
            padding: 0.8rem 2rem;
            font-size: 1rem;
        }

        .section-title {
            font-size: 2rem;
        }

        .stats,
        .features,
        .quick-links,
        .testimonials,
        .cta {
            padding: 2rem 1rem;
        }

        /* WICHTIG: Buttons im Schnellstart zentrieren, wenn sie umbrechen */
        .links-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center; /* jede Zeile zentriert */
        }
    }

    .link-button--highlight {
        position: relative;
        animation: linkPulse 9s ease-in-out infinite;
    }

    @keyframes linkPulse {
        0%, 70% {
            transform: translateY(0) scale(1);
            box-shadow: var(--shadow);
        }

        75% {
            transform: translateY(-2px) scale(1.03);
            box-shadow: var(--shadow-hover), 0 10px 25px rgba(59, 130, 246, 0.35);
        }

        80% {
            transform: translateY(0) scale(1);
            box-shadow: var(--shadow);
        }

        100% {
            transform: translateY(0) scale(1);
            box-shadow: var(--shadow);
        }
    }
    :global(html),
    :global(body) {
        overflow-x: hidden;
    }


</style>

