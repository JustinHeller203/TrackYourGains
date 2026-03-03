<template>
    <footer class="app-footer" role="contentinfo" aria-label="Footer">
        <div class="footer-inner">
            <section class="footer-brand" aria-label="TrackYourGains">
                <router-link to="/" class="brand-link" aria-label="Zur Startseite">
                    <img class="brand-logo" src="/Logo.png" alt="TrackYourGains Logo" loading="lazy" />
                    <div class="brand-text">
                        <div class="brand-name">TrackYourGains</div>
                        <div class="brand-tagline">Training, Beschwerden & Fortschritt - clean und easy.</div>
                    </div>
                </router-link>
            </section>

            <nav class="footer-col" aria-label="App">
                <div class="col-title">App</div>
                <router-link to="/training" class="footer-link">Training</router-link>
                <router-link to="/beschwerden" class="footer-link">Beschwerden</router-link>
                <router-link to="/progress" class="footer-link">Fortschritt</router-link>
                <router-link to="/tutorials" class="footer-link">Tutorials</router-link>
                <router-link to="/settings" class="footer-link">Einstellungen</router-link>
            </nav>

            <nav class="footer-col" aria-label="Support">
                <div class="col-title">Support</div>
                <router-link to="/faq" class="footer-link">FAQ</router-link>
                <router-link to="/contact" class="footer-link">Kontakt</router-link>
                <a class="footer-link" :href="feedbackMailHref">Feedback senden</a>
                <router-link to="/about" class="footer-link">Über uns</router-link>
            </nav>

            <nav class="footer-col" aria-label="Rechtliches">
                <div class="col-title">Rechtliches</div>
                <router-link to="/legal-notice" class="footer-link">Impressum</router-link>
                <router-link to="/terms" class="footer-link">AGB</router-link>
                <router-link to="/privacy" class="footer-link">Datenschutz</router-link>
                <router-link to="/cookies" class="footer-link">Cookies</router-link>
                <router-link to="/refund" class="footer-link">Widerruf</router-link>
            </nav>
        </div>

        <div class="footer-bottom">
            <div class="bottom-left">
                © {{ year }} TrackYourGains
                <span class="sep">•</span>
                <span class="muted">Made for consistency.</span>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
    const year = new Date().getFullYear()
    const feedbackMailHref =
        'mailto:support@trackyourgains.app?subject=Feedback%20TrackYourGains'
</script>

<style scoped>
    .app-footer {
        margin-top: auto;
        border-top: 1px solid var(--border-color);
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        opacity: 0.9;
        box-shadow: 0 -10px 30px rgba(0,0,0,0.08);
    }

    .footer-inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2.25rem 1rem 1.5rem;
        display: grid;
        grid-template-columns: 1.35fr 1fr 1fr 1fr;
        gap: 1.25rem;
    }

    .footer-brand {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .brand-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: var(--text-primary);
        width: fit-content;
    }

    .brand-logo {
        width: 44px;
        height: 44px;
        object-fit: contain;
        border-radius: 10px;
        background: transparent;
        padding: 0;
        border: 0;
        filter: drop-shadow(0 8px 18px rgba(0,0,0,0.18));
        transition: transform 0.15s ease, filter 0.15s ease;
    }

    .brand-link:hover .brand-logo {
        filter: drop-shadow(0 10px 22px rgba(0,0,0,0.26));
        transform: translateY(-1px);
    }

    .brand-name {
        font-weight: 950;
        letter-spacing: 0.2px;
        line-height: 1.05;
        font-size: 1.02rem;
    }

    .brand-tagline {
        opacity: 0.85;
        font-size: 0.85rem;
        line-height: 1.2;
        margin-top: 2px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
    }

    .footer-col {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        min-width: 0;
    }

    .col-title {
        font-weight: 900;
        font-size: 0.9rem;
        margin-bottom: 0.45rem;
        opacity: 0.95;
        padding-bottom: 0.35rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.18);
    }

    .footer-link {
        text-decoration: none;
        color: var(--text-primary);
        opacity: 0.88;
        font-size: 0.88rem;
        width: fit-content;
        border-bottom: 1px solid transparent;
        transition: opacity 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
    }

    .footer-link:hover {
        opacity: 1;
        transform: translateY(-1px);
        border-bottom-color: color-mix(in srgb, var(--accent-primary, #6366f1) 55%, rgba(148,163,184,0.45));
    }

    :global(html.dark-mode) .footer-link {
        color: #ffffff;
    }

    .footer-bottom {
        border-top: 1px solid rgba(148, 163, 184, 0.22);
        padding: 0.9rem 1rem 1.05rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        max-width: 1200px;
        margin: 0 auto;
        opacity: 0.9;
        font-size: 0.82rem;
    }

    .muted {
        opacity: 0.8;
    }

    .sep {
        opacity: 0.55;
        margin: 0 0.45rem;
    }

    @media (max-width: 900px) {
        .footer-inner {
            grid-template-columns: 1fr 1fr;
        }
    }

    @media (max-width: 560px) {
        .footer-inner {
            grid-template-columns: 1fr;
            padding: 1.75rem 0.85rem 1.25rem;
        }

        .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            padding: 0.85rem 0.85rem 1rem;
        }
    }

    @media (max-width: 640px) {
        .app-footer {
            padding: 1.6rem 0.9rem 1.8rem;
            font-size: 0.8rem;
        }
    }
</style>
