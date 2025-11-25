<template>
    <div class="legal-page">
        <h1>FAQ</h1>

        <section class="faq-section">
            <h2>Landingpage & Start</h2>

            <details>
                <summary>Was bedeuten die Zahlen bei „Deine Erfolge 🏆“?</summary>
                <p>
                    Dort siehst du, wie viele Workouts du abgeschlossen hast, wie viele Mahlzeiten du geplant hast
                    und wie viel Gewicht du bereits verloren hast. Die Zahlen zeigen dir auf einen Blick, was du
                    schon erreicht hast.
                </p>
            </details>

            <details>
                <summary>Sind die angezeigten Zahlen echt oder nur Beispiele?</summary>
                <p>
                    Aktuell sind das noch Beispielwerte, damit du siehst, wie es später aussehen wird. In der
                    fertigen Version werden dort deine echten Daten aus der App angezeigt.
                </p>
            </details>

            <details>
                <summary>Was bringt mir die Startseite konkret?</summary>
                <p>
                    Du siehst deine Highlights (Erfolge), bekommst Motivation, kannst neue Workouts oder
                    Mahlzeiten starten und kommst mit einem Klick in die wichtigsten Bereiche der App. Kein
                    Suchen, einfach direkt loslegen.
                </p>
            </details>

            <details>
                <summary>Wohin führen die Buttons wie „Jetzt loslegen“ oder „Trainingsplan erstellen“?</summary>
                <p>
                    Die Buttons bringen dich direkt in die passenden Bereiche:
                    „Jetzt loslegen“ und „Fortschritt ansehen“ öffnen deine Fortschrittsseite,
                    „Trainingsplan erstellen“ führt dich zum Training und
                    „Mahlzeit planen“ in den Ernährungsbereich.
                </p>
            </details>

            <details>
                <summary>Was sind die „Features“ auf der Landingpage?</summary>
                <p>
                    Die Feature-Karten zeigen dir, was TrackYourGains alles kann:
                    Training planen, Ernährung tracken, Fortschritt auswerten und Tutorials anschauen.
                    So siehst du sofort, wofür du die App nutzen kannst.
                </p>
            </details>

            <details>
                <summary>Sind die Nutzerstimmen („Was unsere Nutzer sagen“)&nbsp;echt?</summary>
                <p>
                    Momentan sind das noch Beispiel-Zitate. Später können dort echte Erfahrungen von
                    Nutzerinnen und Nutzern erscheinen, die TrackYourGains in ihrem Alltag verwenden.
                </p>
            </details>

            <details>
                <summary>Was bringen mir die Blogbeiträge auf der Startseite?</summary>
                <p>
                    Die Blogkarten verlinken auf Inhalte mit Tipps rund um Training, Ernährung und Mindset.
                    Sie sollen dir helfen, deine Ziele besser zu verstehen und langfristig dranzubleiben.
                </p>
            </details>

            <details>
                <summary>Kann ich TrackYourGains auch auf dem Handy benutzen?</summary>
                <p>
                    Ja, die Website ist so aufgebaut, dass sie auch auf dem Handy gut funktioniert.
                    Texte, Buttons und Karten passen sich kleineren Bildschirmen an, damit du alles bequem
                    unterwegs nutzen kannst. Es kann dennoch zu kleinen Unterschieden in der Darstellung kommen.
                </p>
            </details>

            <details>
                <summary>Muss ich direkt alles ausfüllen, wenn ich starte?</summary>
                <p>
                    Nein. Du kannst ganz entspannt einsteigen: erst mal ein paar Workouts tracken,
                    später Mahlzeiten hinzufügen und nach und nach deinen Fortschritt ausbauen. Die
                    Landingpage hilft dir dabei, immer wieder einzusteigen.
                </p>
            </details>

            <details>
                <summary>Was passiert, wenn ich länger nichts eintrage?</summary>
                <p>
                    Nichts geht verloren. Deine bisherigen Daten bleiben erhalten. Wenn du später wieder
                    einsteigst, siehst du auf der Landingpage direkt, wo du ungefähr stehst und kannst
                    einfach wieder anfangen zu tracken.
                </p>
            </details>
        </section>
    </div>
</template>

<style scoped>
    .legal-page {
        max-width: 800px;
        margin: 4rem auto;
        padding: 1.5rem;
    }

    .faq-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1.5rem;
    }

        .faq-section h2 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
        }

        .faq-section details {
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 0.75rem 1rem;
            background: rgba(0, 0, 0, 0.02);
        }

        .faq-section summary {
            font-weight: 600;
            cursor: pointer;
            list-style: none;
        }

            .faq-section summary::-webkit-details-marker {
                display: none;
            }

        .faq-section p {
            margin-top: 0.5rem;
            line-height: 1.5;
        }
</style>
