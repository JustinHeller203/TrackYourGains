<!--LandingPage.vue-->
<template>
    <div class="landing">
        <section class="hero">
            <h1 class="hero-title">
                <span class="typed-text">{{ typedText }}</span><span class="cursor">|</span>
            </h1>
            <p class="hero-subtitle">Dein Begleiter für Fitness, Ernährung und Fortschritt. Starte jetzt und erreiche deine Ziele! 💪</p>
            <router-link to="/progress" class="cta-button">Jetzt loslegen</router-link>
        </section>
        <section class="stats">
            <h2 class="section-title">Deine Erfolge 🏆</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-number">42</span>
                    <p class="stat-text">Workouts abgeschlossen</p>
                </div>
                <div class="stat-card">
                    <span class="stat-number">15</span>
                    <p class="stat-text">Mahlzeiten geplant</p>
                </div>
                <div class="stat-card">
                    <span class="stat-number">3</span>
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
                <router-link to="/training" class="link-button">Trainingsplan erstellen</router-link>
                <router-link to="/nutrition" class="link-button">Mahlzeit planen</router-link>
                <router-link to="/progress" class="link-button">Fortschritt ansehen</router-link>
            </div>
        </section>
        <section class="testimonials">
            <h2 class="section-title">Was unsere Nutzer sagen 🗣️</h2>
            <div class="testimonials-grid">
                <div class="testimonial-card">
                    <p class="testimonial-text">"TrackYourGains hat mir geholfen, meine Fitnessziele zu erreichen! 🎯"</p>
                    <p class="testimonial-author">- Max Mustermann</p>
                </div>
                <div class="testimonial-card">
                    <p class="testimonial-text">"Ich liebe die Ernährungs-Tracking-Funktion. Sie ist so einfach zu bedienen! 🍴"</p>
                    <p class="testimonial-author">- Anna Beispiel</p>
                </div>
            </div>
        </section>
        <section class="blog">
            <h2 class="section-title">Aktuelle Blogbeiträge 📚</h2>
            <div class="blog-grid">
                <div class="blog-card">
                    <h3 class="blog-title">Wie du deine Fitnessziele erreichst 🏆</h3>
                    <p class="blog-text">Erfahre, wie du mit TrackYourGains deine Fitnessziele erreichen kannst.</p>
                </div>
                <div class="blog-card">
                    <h3 class="blog-title">Tipps für bessere Ernährung 🍎</h3>
                    <p class="blog-text">Lerne, wie du deine Mahlzeiten optimierst.</p>
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
    import { ref, onMounted } from 'vue'

    const typedText = ref('')
    const fullText = 'TrackYourGains'
    let index = 0

    const typeText = () => {
        if (index < fullText.length) {
            typedText.value += fullText.charAt(index)
            index++
            setTimeout(typeText, 100)
        }
    }

    const setupScrollReveal = () => {
        const sections = document.querySelectorAll<HTMLElement>(
            '.stats, .features, .quick-links, .testimonials, .blog, .cta'
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
    })
</script>

<style scoped>
    .landing {
        font-family: 'Inter', sans-serif;
        background: var(--bg-primary);
        /* overflow-x: hidden;  ← raus, damit Hover-Outline/Shadow nicht abgeschnitten wird */
        scrollbar-gutter: stable; /* verhindert weiter Scroll-Jumps bei vertikal */
        max-width: 100%;
    }

    /* ===== Hero ===== */
    .hero {
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 2rem 1rem;
        position: relative;
        overflow: hidden;
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
            left: -80px;
        }

        .hero::after {
            width: 380px;
            height: 380px;
            background: radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.9), transparent 60%);
            bottom: -140px;
            right: -60px;
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
    .testimonial-card,
    .blog-card {
        border: 1px solid rgba(148, 163, 184, 0.25);
        backdrop-filter: blur(6px);
        background: color-mix(in srgb, var(--bg-card) 85%, rgba(255, 255, 255, 0.15));
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
    .blog,
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
        0%

    {
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
    .testimonials-grid,
    .blog-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        max-width: 100%;
        overflow-x: clip; /* ⟵ nichts ragt „außerhalb“ */
    }

    .links-grid {
        overflow-x: visible; /* Rahmen/Glow der Buttons darf über die Grid-Kante rausgehen */
    }

        .stats-grid > *,
        .features-grid > *,
        .links-grid > *,
        .testimonials-grid > *,
        .blog-grid > * {
            min-width: 0; /* ⟵ Kinder dürfen schrumpfen */
        }

    /* ===== Cards ===== */
    .stat-card,
    .feature-card,
    .testimonial-card,
    .blog-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow);
        transition: transform .3s ease, box-shadow .3s ease;
    }

    .stat-card,
    .feature-card,
    .testimonial-card,
    .blog-card {
        will-change: transform;
        contain: paint; /* ⟵ verhindert Einfluss nach außen */
    }

    /* Hover nur dort, wo Hover existiert (kein Mobile) */
    @media (hover: hover) {
        .stat-card:hover,
        .feature-card:hover,
        .testimonial-card:hover,
        .blog-card:hover {
            transform: translateY(-4px); /* ⟵ keine Breitenänderung mehr */
            box-shadow: var(--shadow-hover);
        }
    }

    .stat-number {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--accent-primary);
        display: block;
        margin-bottom: 0.5rem;
    }

    .stat-text,
    .feature-text,
    .testimonial-text,
    .blog-text {
        font-size: 1rem;
        color: var(--text-secondary);
    }

    .feature-title,
    .blog-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
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
    html.dark-mode .testimonial-card,
    html.dark-mode .blog-card {
        background: #21262d;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    html.dark-mode .section-title,
    html.dark-mode .feature-title,
    html.dark-mode .blog-title,
    html.dark-mode .testimonial-author {
        color: #f0f6fc;
    }

    html.dark-mode .stat-number {
        color: #6B8DD6;
    }

    html.dark-mode .stat-text,
    html.dark-mode .feature-text,
    html.dark-mode .testimonial-text,
    html.dark-mode .blog-text {
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
        .blog,
        .cta {
            padding: 2rem 1rem;
        }
    }
</style>

