<template>
    <main class="about-page">
        <header class="about-hero">
            <p class="about-kicker">{{ t('about.kicker') }}</p>
            <h1 class="about-title">{{ t('about.title') }}</h1>
            <p class="about-subtitle">
                {{ t('about.subtitle') }}
            </p>
        </header>

        <!-- Mission & Idee -->
        <section class="about-grid">
            <article class="about-card">
                <h2 class="about-card-title">{{ t('about.why.title') }}</h2>
                <p>
                    {{ t('about.why.text1') }}
                </p>
                <p>
                    {{ t('about.why.text2') }}
                </p>
            </article>

            <article class="about-card">
                <h2 class="about-card-title">{{ t('about.features.title') }}</h2>
                <ul class="about-list">
                    <li>{{ t('about.features.item1') }}</li>
                    <li>{{ t('about.features.item2') }}</li>
                    <li>{{ t('about.features.item3') }}</li>
                    <li>{{ t('about.features.item4') }}</li>
                    <li>{{ t('about.features.item5') }}</li>
                </ul>
                <p class="about-note">
                    {{ t('about.features.note') }}
                </p>
            </article>
        </section>

        <!-- Fokus & Philosophie -->
        <section class="about-grid">
            <article class="about-card">
                <h2 class="about-card-title">{{ t('about.focus.title') }}</h2>
                <p>
                    {{ t('about.focus.text1') }}
                </p>
                <p>
                    {{ t('about.focus.text2') }}
                </p>
            </article>

            <article class="about-card">
                <h2 class="about-card-title">{{ t('about.privacy.title') }}</h2>
                <ul class="about-list">
                    <li>{{ t('about.privacy.item1') }}</li>
                    <li>{{ t('about.privacy.item2') }}</li>
                    <li>{{ t('about.privacy.item3') }}</li>
                    <li>{{ t('about.privacy.item4') }}</li>
                </ul>
                <p class="about-note">
                    {{ t('about.privacy.note') }}
                </p>
            </article>
        </section>

        <!-- Über den Entwickler -->
        <section class="about-grid about-grid--single">
            <article class="about-card about-me">
                <h2 class="about-card-title">{{ t('about.me.title') }}</h2>
                <p>
                    {{ t('about.me.text1') }}
                </p>
                <p>
                    {{ t('about.me.text2') }}
                </p>
                <p>
                    {{ t('about.me.text3') }}
                </p>
                <p>
                    {{ t('about.me.text4') }}
                </p>
                <p class="about-note">
                    {{ t('about.me.feedback') }}
                </p>
            </article>
        </section>

        <!-- Roadmap -->
        <section class="about-grid">
            <article class="about-card">
                <h2 class="about-card-title">{{ t('about.roadmap.title') }}</h2>
                <ul class="about-list">
                    <li>{{ t('about.roadmap.item1') }}</li>
                    <li>{{ t('about.roadmap.item2') }}</li>
                    <li>{{ t('about.roadmap.item3') }}</li>
                    <li>{{ t('about.roadmap.item4') }}</li>
                    <li>{{ t('about.roadmap.item5') }}</li>
                </ul>
                <p class="about-note">
                    {{ t('about.roadmap.note') }}
                </p>
            </article>

            <article class="about-card">
                <h2 class="about-card-title">{{ t('about.help.title') }}</h2>
                <ul class="about-list">
                    <li>{{ t('about.help.item1') }}</li>
                    <li>{{ t('about.help.item2') }}</li>
                    <li>{{ t('about.help.item3') }}</li>
                </ul>
                <p class="about-note">
                    {{ t('about.help.note') }}
                </p>
            </article>
        </section>

        <!-- Abschluss -->
        <section class="about-footer-card">
            <h2 class="about-card-title">{{ t('about.footer.title') }}</h2>
            <p>
                {{ t('about.footer.text') }}
            </p>
            <router-link to="/progress" class="about-cta">
                {{ t('about.footer.cta') }}
            </router-link>
        </section>
    </main>
</template>

<script setup lang="ts">
    import { useI18n } from '@/composables/useI18n'

    const { t } = useI18n()
</script>

<style scoped>
    .about-page {
        max-width: 1120px;
        margin: 4rem auto;
        padding: 1.5rem;
        font-family: 'Inter', sans-serif;
        line-height: 1.7;
        color: var(--text-primary);
    }

    .about-hero {
        text-align: left;
        margin-bottom: 2.5rem;
    }

    .about-kicker {
        font-size: 0.85rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-weight: 600;
        color: color-mix(in srgb, var(--text-secondary) 80%, #9ca3af 20%);
        margin-bottom: 0.35rem;
    }

    .about-title {
        font-size: clamp(2.2rem, 3vw, 2.8rem);
        font-weight: 800;
        margin-bottom: 0.75rem;
        letter-spacing: -0.02em;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .about-subtitle {
        max-width: 640px;
        font-size: 0.98rem;
        color: var(--text-secondary);
    }

    .about-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.6rem;
        margin-bottom: 2.4rem;
    }

    .about-grid--single {
        grid-template-columns: minmax(0, 1fr);
    }

    .about-card {
        position: relative;
        overflow: hidden;
        padding: 1.6rem 1.7rem;
        border-radius: 18px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    .about-card-title {
        font-size: 1.15rem;
        font-weight: 700;
        margin-bottom: 0.4rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--text-secondary) 80%, #9ca3af 20%);
    }

    .about-card p {
        margin: 0.2rem 0;
        font-size: 0.95rem;
        color: var(--text-secondary);
    }

    .about-list {
        margin: 0.4rem 0 0.5rem;
        padding-left: 1.1rem;
        font-size: 0.95rem;
        color: var(--text-secondary);
    }

        .about-list li {
            margin-bottom: 0.25rem;
        }

    .about-note {
        font-size: 0.86rem;
        color: color-mix(in srgb, var(--text-secondary) 86%, #9ca3af 14%);
        margin-top: 0.3rem;
    }

    .about-me {
        /* leichte Hervorhebung für „Wer steckt dahinter?“ */
        border-color: rgba(129, 140, 248, 0.45);
    }

    .about-link {
        color: var(--accent-primary);
        text-decoration: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 2px;
    }

    .about-footer-card {
        position: relative;
        overflow: hidden;
        margin-top: 0.5rem;
        padding: 1.7rem 1.8rem 1.5rem;
        border-radius: 20px;
        text-align: left;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 9%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        border: 1px solid rgba(148, 163, 184, 0.3);
        box-shadow: 0 20px 48px rgba(15, 23, 42, 0.28);
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
    }

        .about-footer-card p {
            max-width: 620px;
            font-size: 0.96rem;
            color: var(--text-secondary);
        }

    .about-cta {
        align-self: flex-start;
        margin-top: 0.6rem;
        padding: 0.8rem 1.8rem;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: #fff;
        font-weight: 600;
        font-size: 0.98rem;
        text-decoration: none;
        box-shadow: var(--shadow);
        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
    }

    @media (hover: hover) {
        .about-card:hover,
        .about-footer-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }

        .about-cta:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-hover);
            filter: brightness(1.07);
        }
    }

    @media (max-width: 768px) {
        .about-page {
            margin: 3rem auto;
            padding: 1.25rem;
        }

        .about-title {
            font-size: 2rem;
        }
    }

    /* Dark-Mode Varianten – angelehnt an LandingPage */
    html.dark-mode .about-card,
    html.dark-mode .about-footer-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .about-title {
        color: #f0f6fc;
    }

    html.dark-mode .about-card p,
    html.dark-mode .about-subtitle,
    html.dark-mode .about-list,
    html.dark-mode .about-note,
    html.dark-mode .about-footer-card p {
        color: #c9d1d9;
    }

    html.dark-mode .about-cta {
        background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
    }
</style>
