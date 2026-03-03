<template>
    <div class="complaints-page">
        <header class="hero">
            <p class="hero-kicker">Body Check</p>
            <h2 class="page-title">Beschwerden</h2>
            <p class="hero-copy">
                Hier bekommt alles rund um Schmerzen, Spannungen und Warnsignale einen eigenen Platz.
                Die Seite ist bewusst als saubere Basis angelegt und kann später um Tracking, Verlauf
                und Hinweise erweitert werden.
            </p>
        </header>

        <section class="overview-grid" aria-label="Beschwerden Übersicht">
            <article class="info-card">
                <div class="card-icon" aria-hidden="true">📍</div>
                <h3>Körperstellen</h3>
                <p>Später kannst du erfassen, wo Beschwerden auftreten, zum Beispiel Rücken, Schulter oder Knie.</p>
            </article>

            <article class="info-card">
                <div class="card-icon" aria-hidden="true">📈</div>
                <h3>Verlauf</h3>
                <p>Geplant ist ein einfacher Verlauf über Tage und Wochen, damit Muster sichtbar werden.</p>
            </article>

            <article class="info-card">
                <div class="card-icon" aria-hidden="true">🚨</div>
                <h3>Warnzeichen</h3>
                <p>Später lassen sich Intensität, Trigger und mögliche Warnsignale strukturiert dokumentieren.</p>
            </article>
        </section>

        <section class="roadmap-card">
            <div class="roadmap-head">
                <p class="roadmap-kicker">Geplante Bausteine</p>
                <h3>Was hier als Nächstes rein kann</h3>
            </div>

            <ul class="roadmap-list">
                <li>Schmerzlevel von 1 bis 10 mit Datum speichern</li>
                <li>Körperregionen auswählen und vergleichen</li>
                <li>Trigger wie Training, Alltag oder Schlaf notieren</li>
                <li>Muskelkater, Überlastung und akute Beschwerden trennen</li>
                <li>Verknüpfung mit Training und Regeneration</li>
            </ul>
        </section>
    </div>
</template>

<style scoped>
    .complaints-page {
        width: min(1120px, 100%);
        margin: 0 auto;
        padding: 1.7rem 1.4rem 2rem 1rem;
        display: grid;
        gap: 1.1rem;
    }

    .hero {
        padding: 1.15rem 1.1rem;
        border-radius: 24px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background:
            radial-gradient(circle at top left, rgba(249, 115, 22, 0.12), transparent 42%),
            radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.10), transparent 48%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.05), rgba(15, 23, 42, 0.02));
        box-shadow: 0 18px 42px rgba(15, 23, 42, 0.12);
    }

    .hero-kicker,
    .roadmap-kicker {
        margin: 0 0 .35rem;
        font-size: .78rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .08em;
        color: var(--text-secondary);
    }

    .page-title {
        margin: 0;
        font-size: clamp(2rem, 3vw, 2.7rem);
        line-height: 1.02;
        letter-spacing: -0.03em;
        color: var(--text-primary);
    }

    .hero-copy {
        margin: .7rem 0 0;
        max-width: 62ch;
        line-height: 1.5;
        color: var(--text-secondary);
        font-size: 1rem;
    }

    .overview-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: .9rem;
    }

    .info-card,
    .roadmap-card {
        border-radius: 20px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(255, 255, 255, 0.04);
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.10);
    }

    .info-card {
        padding: 1rem;
        display: grid;
        gap: .45rem;
    }

    .info-card h3,
    .roadmap-head h3 {
        margin: 0;
        font-size: 1.02rem;
        color: var(--text-primary);
    }

    .info-card p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.45;
    }

    .card-icon {
        width: 2.5rem;
        height: 2.5rem;
        display: grid;
        place-items: center;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.08);
        font-size: 1.1rem;
    }

    .roadmap-card {
        padding: 1.05rem 1.05rem 1rem;
    }

    .roadmap-list {
        margin: .85rem 0 0;
        padding-left: 1.1rem;
        color: var(--text-primary);
        display: grid;
        gap: .5rem;
    }

    .roadmap-list li {
        line-height: 1.4;
    }

    html.dark-mode .hero,
    html.dark-mode .info-card,
    html.dark-mode .roadmap-card {
        background-color: rgba(2, 6, 23, 0.42);
    }

    @media (max-width: 820px) {
        .overview-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 560px) {
        .complaints-page {
            padding: 1.45rem 1rem 2rem .8rem;
        }

        .hero,
        .info-card,
        .roadmap-card {
            border-radius: 18px;
        }
    }
</style>
