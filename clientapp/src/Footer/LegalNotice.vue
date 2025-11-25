<template>
    <main class="legal-notice">
        <h1>Impressum / Legal Notice</h1>

        <section>
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
                Justin Heller<br />
                Mühlweg 2<br />
                92421 Schwandorf<br />
                Deutschland
            </p>
        </section>

        <section>
            <h2>Kontakt</h2>
            <p>
                Telefon: 0179 9352261<br />
                E-Mail: <a href="mailto:impressum@trackyourgains-support.de">impressum@trackyourgains-support.de</a>
            </p>
        </section>

        <section>
            <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
                Justin Heller, Anschrift wie oben
            </p>
        </section>

        <section>
            <h2>Haftung für Inhalte</h2>
            <p>
                Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
                Aktualität der Inhalte wird jedoch keine Gewähr übernommen. Bei Bekanntwerden von Rechtsverletzungen werden
                entsprechende Inhalte umgehend entfernt.
            </p>
        </section>

        <section>
            <h2>Haftung für Links</h2>
            <p>
                Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für diese
                fremden Inhalte wird keine Haftung übernommen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                Anbieter oder Betreiber der Seiten verantwortlich. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung
                nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen werden derartige Links umgehend entfernt.
            </p>
        </section>

        <section>
            <h2>Urheberrecht</h2>
            <p>
                Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
                Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung
                und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des
                jeweiligen Autors bzw. Erstellers.
            </p>
        </section>

        <section>
            <h2>Online-Streitbeilegung</h2>
            <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
                    https://ec.europa.eu/consumers/odr
                </a>.
                Ich bin nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
            </p>
        </section>
    </main>
</template>

<script setup lang="ts">
// keine Logik nötig, reine statische Seite
</script>

<style scoped>
    .legal-notice {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1.5rem 3rem;
        line-height: 1.6;
        font-size: 0.95rem;
    }

        .legal-notice h1 {
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
        }

        .legal-notice h2 {
            font-size: 1.2rem;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .legal-notice a {
            text-decoration: underline;
        }
</style>
