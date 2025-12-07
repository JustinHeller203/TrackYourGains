<template>
    <main class="about-page">
        <header class="about-hero">
            <p class="about-kicker">Über TrackYourGains</p>
            <h1 class="about-title">Dein smarter Begleiter für Training, Ernährung & Fortschritt</h1>
            <p class="about-subtitle">
                TrackYourGains ist eine schlanke, lokal laufende App, die dir hilft,
                deine Workouts, dein Gewicht und deine Ernährung im Blick zu behalten –
                ohne Account, ohne Cloud, 100&nbsp;% dein Ding.
            </p>
        </header>

        <!-- Mission & Idee -->
        <section class="about-grid">
            <article class="about-card">
                <h2 class="about-card-title">💡 Warum TrackYourGains?</h2>
                <p>
                    Ich wollte ein Tool, das nicht überladen ist, dich nicht mit
                    Paywalls nervt und trotzdem wie ein modernes Dashboard wirkt.
                    Eine App, die du öffnest und direkt siehst: <strong>Wo stehe ich gerade?</strong>
                </p>
                <p>
                    TrackYourGains konzentriert sich auf das Wesentliche: Training,
                    Ernährung, Fortschritt&nbsp;– ohne Bullshit, ohne Datenverkauf
                    und ohne versteckte Abos.
                </p>
            </article>

            <article class="about-card">
                <h2 class="about-card-title">🚀 Was die App heute schon kann</h2>
                <ul class="about-list">
                    <li>Workouts planen, dokumentieren & als Pläne speichern</li>
                    <li>Gewichtstracking mit Verlauf & Statistiken</li>
                    <li>Kalorien- und Makro-Rechner (BMI, Kalorienbedarf, Protein & mehr)</li>
                    <li>Trainingsfortschritt pro Plan als Journal-Ansicht</li>
                    <li>Export-Optionen für deine Daten (z.&nbsp;B. als CSV / JSON je nach Bereich)</li>
                </ul>
                <p class="about-note">
                    Alles läuft aktuell lokal in deinem Browser über <strong>LocalStorage</strong>.
                    Deine Daten gehören dir.
                </p>
            </article>
        </section>

        <!-- Fokus & Philosophie -->
        <section class="about-grid">
            <article class="about-card">
                <h2 class="about-card-title">🎯 Fokus der App</h2>
                <p>
                    TrackYourGains ist keine Social-Fitness-Plattform, sondern ein
                    <strong>Werkzeug</strong>. Du vergleichst dich mit dir selbst – nicht
                    mit Influencern oder irgendwelchen random Benchmarks.
                </p>
                <p>
                    Das Design ist deshalb bewusst wie ein <strong>Personal-Dashboard</strong>:
                    klare Karten, lesbare Statistiken und ein dunkles, augenfreundliches Layout.
                </p>
            </article>

            <article class="about-card">
                <h2 class="about-card-title">🔒 Datenschutz & Transparenz</h2>
                <ul class="about-list">
                    <li>Keine Registrierung, keine Accounts</li>
                    <li>Keine Server-Datenbank – alles läuft lokal in deinem Browser</li>
                    <li>Du entscheidest selbst, ob und was du exportierst</li>
                    <li>Kein Tracking-Pixel, kein Analytics-Spam innerhalb der App</li>
                </ul>
                <p class="about-note">
                    Später können optionale Cloud-Backups dazukommen – aber nur,
                    wenn sie transparent, abschaltbar und verständlich sind.
                </p>
            </article>
        </section>

        <!-- Über den Entwickler -->
        <section class="about-grid about-grid--single">
            <article class="about-card about-me">
                <h2 class="about-card-title">👨‍💻 Wer steckt dahinter?</h2>
                <p>
                    Hey, ich bin <strong>Justin</strong> – Fitness-Nerd, Technikfan und derjenige,
                    der TrackYourGains baut.
                </p>
                <p>
                    Die Idee kam aus einem simplen Problem: zu viele Apps wollten meine Daten,
                    mein Geld oder haben mich mit Features zugeschüttet, die ich nie brauche.
                    Also habe ich angefangen, mir mein eigenes Tool zu bauen.
                </p>
                <p>
                    Mein Ziel: Eine App, die sich wie ein <strong>gut designter Trainingsplan</strong> anfühlt –
                    klar strukturiert, fokussiert und ohne überflüssigen Ballast.
                </p>
                <p>
                    Ich bastle dauerhaft an der Website und der App, teste neue Ideen
                    und optimiere das, was schon da ist. Parallel arbeite ich an einem
                    fairen, optionalen Abo-Modell, damit ich TrackYourGains langfristig
                    weiter ausbauen kann.
                </p>
                <p class="about-note">
                    Wenn du Feedback, Ideen oder Kritik hast: Schreib mir einfach über die
                    <router-link to="/contact" class="about-link">Kontaktseite</router-link>.
                </p>
            </article>
        </section>

        <!-- Roadmap -->
        <section class="about-grid">
            <article class="about-card">
                <h2 class="about-card-title">🛠️ Geplante Features</h2>
                <ul class="about-list">
                    <li>Mehr Auswertungen für einzelne Übungen (z.&nbsp;B. 1RM-Verlauf)</li>
                    <li>Optionale Trainingsziele mit Erinnerungen</li>
                    <li>Mehr Export-Formate für Coaches & Physios</li>
                    <li>Verbesserte Mobil-Experience & kleine UI-Tweaks</li>
                    <li>optionales Pro-Abo für mehr Features</li>
                </ul>
                <p class="about-note">
                    Die Roadmap lebt: Ich passe sie an, je nachdem, was Nutzer wirklich brauchen
                    – nicht, was fancy klingt.
                </p>
            </article>

            <article class="about-card">
                <h2 class="about-card-title">💬 Wie du mithelfen kannst</h2>
                <ul class="about-list">
                    <li>Schick mir Bugs, Screenshots oder verrückte Edge-Cases</li>
                    <li>Erzähl mir, wie du TrackYourGains im Alltag nutzt</li>
                    <li>Sag ehrlich, was nervt – Design, UX, Texte, egal</li>
                </ul>
                <p class="about-note">
                    Deine Rückmeldungen fließen direkt ins nächste Update ein.
                    Je ehrlicher du bist, desto besser wird das Ding.
                </p>
            </article>
        </section>

        <!-- Abschluss -->
        <section class="about-footer-card">
            <h2 class="about-card-title">📈 Dein Fortschritt, deine Regeln</h2>
            <p>
                TrackYourGains soll dir helfen, langfristig dranzubleiben – ohne Druck von außen,
                ohne Gamification-Stress. Öffne das Dashboard, sieh deinen Fortschritt und
                entscheide selbst, was der nächste sinnvolle Schritt ist.
            </p>
            <router-link to="/progress" class="about-cta">
                Zum Fortschritts-Dashboard
            </router-link>
        </section>
    </main>
</template>

<script setup lang="ts">
    // aktuell statische Seite – später kannst du hier dynamische Inhalte ergänzen
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
