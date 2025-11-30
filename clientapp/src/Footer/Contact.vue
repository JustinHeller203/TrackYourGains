<template>
    <main class="contact-page">
        <h1>Kontakt</h1>

        <section class="contact-intro">
            <p>
                Du hast Fragen zu TrackYourGains, Feedback oder willst einen Fehler melden?<br />
                Melde dich gerne direkt bei mir.
            </p>
        </section>

        <section class="contact-grid">
            <div class="contact-card">
                <h2>Direkte Kontakt­daten</h2>
                <p>
                    Justin Heller<br />
                    Mühlweg 2<br />
                    92421 Schwandorf<br />
                    Deutschland
                </p>
                <p>
                    Telefon: <a href="tel:+491799352261">+49 179 9352261</a><br />
                    E-Mail:
                    <a href="mailto:impressum@trackyourgains-support.de">
                        impressum@trackyourgains-support.de
                    </a>
                </p>
            </div>

            <div class="contact-card">
                <h2>Support & Feedback</h2>
                <p>
                    📝 Funktionswunsch, Bug oder Idee für neue Features?<br />
                    Schreib mir einfach eine kurze Nachricht – ich versuche, so schnell wie möglich zu antworten.
                </p>
                <ul class="contact-list">
                    <li>Probleme oder Fehler in der App</li>
                    <li>Fragen zur Nutzung von TrackYourGains</li>
                    <li>Vorschläge für neue Funktionen</li>
                </ul>
                <p class="contact-hint">
                    Bitte sende keine sensiblen Gesundheitsdaten oder medizinischen Diagnosen per E-Mail.
                </p>
            </div>
        </section>

        <section class="contact-form-section">
            <h2>Nachricht senden</h2>
            <p class="contact-form-hint">
                Das Formular ist aktuell nur ein Platzhalter. Du kannst mir direkt per E-Mail schreiben:
                <a href="mailto:impressum@trackyourgains-support.de">
                    impressum@trackyourgains-support.de
                </a>
            </p>

            <form class="contact-form" @submit.prevent>
                <div class="form-row">
                    <label for="name">Name</label>
                    <input id="name" type="text" placeholder="Dein Name" />
                </div>
                <div class="form-row">
                    <label for="email">E-Mail</label>
                    <input id="email" type="email" placeholder="deine.mail@example.com" />
                </div>
                <div class="form-row">
                    <label for="subject">Betreff</label>
                    <input id="subject" type="text" placeholder="Worum geht es?" />
                </div>
                <div class="form-row">
                    <label for="message">Nachricht</label>
                    <textarea id="message"
                              rows="5"
                              placeholder="Deine Nachricht an mich..."></textarea>
                </div>

                <button type="submit" class="contact-submit" disabled title="Noch ohne Backend – bitte per E-Mail melden">
                    Senden (demnächst verfügbar)
                </button>
            </form>
        </section>
    </main>
</template>

<style scoped>
    .contact-page {
        max-width: 900px;
        margin: 4rem auto;
        padding: 1.5rem;
        line-height: 1.6;
        font-size: 0.95rem;
    }

    h1 {
        font-size: 1.8rem;
        margin-bottom: 1.5rem;
    }

    h2 {
        font-size: 1.2rem;
        margin-bottom: 0.75rem;
    }

    a {
        text-decoration: underline;
    }

    .contact-intro {
        margin-bottom: 1.5rem;
    }

    .contact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2.5rem;
    }
    .contact-card {
        border-radius: 12px;
        padding: 1.25rem 1.3rem;
        background: var(--bg-card);
        box-shadow: var(--shadow);
        border: 1px solid rgba(148, 163, 184, 0.4);
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }

    @media (hover: hover) {
        .contact-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-hover);
            border-color: rgba(148, 163, 184, 0.7);
        }
    }

        .contact-card::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: radial-gradient(circle at top left, rgba(248, 250, 252, 0.18), transparent 55%);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.35s ease;
        }
        .contact-card h2 {
            font-size: 1.1rem;
            margin-bottom: 0.6rem;
        }

        .contact-card p {
            margin-bottom: 0.5rem;
        }
    .contact-card h2 {
        font-size: 1.1rem;
        margin-bottom: 0.6rem;
    }

    .contact-card p {
        margin-bottom: 0.45rem;
    }
    .contact-list {
        margin: 0.5rem 0 0.75rem;
        padding-left: 1.2rem;
    }

        .contact-list li {
            margin-bottom: 0.25rem;
        }

    .contact-hint {
        font-size: 0.85rem;
        color: var(--text-secondary);
    }

    .contact-form-section {
        margin-top: 1rem;
    }

    .contact-form-hint {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
    }

    .contact-form {
        display: grid;
        gap: 0.9rem;
        margin-top: 0.5rem;
    }

    .form-row {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

        .form-row label {
            font-size: 0.9rem;
            font-weight: 500;
        }

        .form-row input,
        .form-row textarea {
            border-radius: 8px;
            border: 1px solid rgba(148, 163, 184, 0.7);
            padding: 0.55rem 0.7rem;
            background: var(--bg-primary);
            color: var(--text-primary);
            font: inherit;
        }

            .form-row input:focus,
            .form-row textarea:focus {
                outline: 2px solid var(--accent-primary);
                outline-offset: 1px;
                border-color: transparent;
            }

    .contact-submit {
        margin-top: 0.5rem;
        align-self: flex-start;
        border-radius: 999px;
        padding: 0.65rem 1.6rem;
        border: none;
        font-weight: 600;
        cursor: not-allowed;
        opacity: 0.7;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: #fff;
        box-shadow: var(--shadow);
    }

    @media (max-width: 640px) {
        .contact-page {
            margin: 3rem auto;
            padding: 1.25rem;
        }
    }
</style>