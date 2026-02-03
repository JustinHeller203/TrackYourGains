<template>
    <div class="legal-page">
        <h1>FAQ</h1>

        <nav class="faq-filter">
            <button v-for="cat in categories"
                    :key="cat.key"
                    type="button"
                    class="faq-filter-button"
                    :class="{ active: activeCategory === cat.key }"
                    @click="activeCategory = cat.key">
                {{ cat.label }}
            </button>
        </nav>

        <section class="faq-section" v-show="activeCategory === 'all' || activeCategory === 'landing'">
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
        <section class="faq-section" v-show="activeCategory === 'all' || activeCategory === 'nutrition'">
            <h2>Ernährung</h2>

            <details>
                <summary>Warum steht bei „Ernährung“ noch COMING SOON?</summary>
                <p>
                    Der Ernährungsbereich ist aktuell noch in Entwicklung. Deshalb liegt ein Overlay über der Seite
                    und du kannst die Elemente noch nicht benutzen. So bekommst du schon einen ersten Eindruck,
                    wie die Seite später aussehen wird, ohne dass alles schon fertig sein muss.
                </p>
            </details>

            <details>
                <summary>Wofür ist die Ernährungsseite gedacht?</summary>
                <p>
                    Hier kannst du deine Mahlzeiten, Kalorien und Makros (Protein, Carbs, Fett) tracken. Du siehst
                    auf einen Blick, wie weit du von deinem Tagesziel entfernt bist und welche Nährstoffe du
                    hauptsächlich isst. Das hilft dir, deine Ernährung bewusst zu steuern.
                </p>
            </details>

            <details>
                <summary>Was bedeuten die Karten für Kalorien, Protein, Carbs und Fett oben?</summary>
                <p>
                    Die Karten zeigen dir die Summe deiner eingetragenen Mahlzeiten für den aktuellen Tag:
                    deine aufgenommenen Kalorien, sowie wie viel Gramm Protein, Carbs und Fett du bereits hast.
                    Beim Kalorien-Card siehst du zusätzlich dein Tagesziel und einen Fortschrittsbalken.
                </p>
            </details>

            <details>
                <summary>Wie kann ich mein tägliches Kalorienziel ändern?</summary>
                <p>
                    Wenn der Bereich freigeschaltet ist, kannst du einfach auf die Kalorien-Karte klicken.
                    Dann öffnet sich ein Eingabefeld, in dem du dein gewünschtes Tagesziel (z. B. 2500 kcal)
                    eintragen und speichern kannst. Der Fortschrittsbalken passt sich automatisch an.
                </p>
            </details>

            <details>
                <summary>Was passiert, wenn ich mein Kalorienziel überschreite?</summary>
                <p>
                    Der Balken füllt sich bis 100 % und zeigt dir, dass du dein Ziel erreicht oder überschritten hast.
                    Die Seite ist nicht dazu da, dich zu „bestrafen“, sondern dir transparent zu zeigen, wo du
                    stehst. So kannst du besser entscheiden, wie du den restlichen Tag gestaltest.
                </p>
            </details>

            <details>
                <summary>Wie trage ich eine neue Mahlzeit ein?</summary>
                <p>
                    Im freigeschalteten Zustand kannst du über den Button „+ Neue Mahlzeit“ eine Mahlzeit
                    hinzufügen. Dort gibst du Name, Kalorien sowie Protein-, Carb- und Fettmenge ein. Nach dem
                    Speichern erscheint die Mahlzeit in der Liste und wird in die Summen und den Chart übernommen.
                </p>
            </details>

            <details>
                <summary>Kann ich Mahlzeiten später bearbeiten oder löschen?</summary>
                <p>
                    Ja. In der Mahlzeitenliste findest du bei jeder Mahlzeit Bearbeiten- und Löschen-Buttons.
                    Damit kannst du Einträge korrigieren, wenn du dich vertan hast, oder alte Einträge entfernen.
                    Die Auswertungen (Kalorien, Makros, Chart) aktualisieren sich automatisch.
                </p>
            </details>

            <details>
                <summary>Wie funktionieren Suche und Filter („Proteinbomben“, „High Carb“)?</summary>
                <p>
                    Über das Suchfeld kannst du nach dem Namen einer Mahlzeit filtern. Mit den Filtern „Proteinbomben“
                    und „High Carb“ blendest du nur Mahlzeiten ein, die entweder mindestens 30 g Protein oder
                    mindestens 50 g Carbs haben. So findest du schnell passende Optionen für dein aktuelles Ziel.
                </p>
            </details>

            <details>
                <summary>Wofür ist der Kreis-Chart auf der Ernährungsseite?</summary>
                <p>
                    Der Chart zeigt das Verhältnis von Protein, Carbs und Fett auf Basis deiner eingetragenen
                    Mahlzeiten. So erkennst du direkt, ob deine Ernährung eher proteinlastig, carb-lastig oder
                    fettreich ist und kannst bei Bedarf gegensteuern.
                </p>
            </details>

            <details>
                <summary>Kann ich meine Ernährungsdaten exportieren?</summary>
                <p>
                    Ja, über den Button „Exportieren“ kannst du deine Daten in verschiedene Formate herunterladen,
                    zum Beispiel um sie zu sichern, mit einem Coach zu teilen oder in anderen Tools weiterzunutzen.
                    Die Datei wird lokal auf deinem Gerät gespeichert.
                </p>
            </details>

            <details>
                <summary>Werden meine Einträge schon dauerhaft gespeichert?</summary>
                <p>
                    In der aktuellen Version ist der Ernährungsbereich vor allem als Vorschau gedacht. Deine Daten
                    werden noch nicht dauerhaft gespeichert und können beim Neuladen verloren gehen. Geplant ist,
                    dass in einer späteren Version deine Einträge zuverlässig gesichert werden.
                </p>
            </details>
        </section>
        <section class="faq-section" v-show="activeCategory === 'all' || activeCategory === 'training'">
            <h2>Training</h2>

            <details>
                <summary>Wofür ist die Trainingsseite überhaupt gedacht?</summary>
                <p>
                    Auf der Trainingsseite planst du deine Workouts, behältst deine Übungen im Blick und kannst
                    nachvollziehen, was du in welcher Einheit gemacht hast. Ziel: Du musst nicht mehr im Kopf
                    behalten, was du trainiert hast – alles ist an einem Ort gesammelt.
                </p>
            </details>

            <details>
                <summary>Was ist der Unterschied zwischen Trainingsplan und Workout?</summary>
                <p>
                    Ein Trainingsplan ist deine übergeordnete Struktur (z.&nbsp;B. 3er-Split oder Ganzkörperplan).
                    Ein Workout ist eine einzelne Trainingseinheit aus diesem Plan (z.&nbsp;B. „Push Montag“).
                    Im Plan legst du fest, was grundsätzlich drin ist, im Workout trägst du ein, was du heute
                    wirklich gemacht hast.
                </p>
            </details>

            <details>
                <summary>Wie erstelle ich einen neuen Trainingsplan oder ein neues Workout?</summary>
                <p>
                    Über die Buttons wie „Trainingsplan erstellen“ oder „+ Neues Workout“ startest du den Prozess.
                    Du gibst Name, Ziel (z.&nbsp;B. Muskelaufbau) und ggf. Trainingstage an und kannst anschließend
                    Übungen hinzufügen. Sobald du speicherst, erscheint der Plan in der Übersicht.
                </p>
            </details>

            <details>
                <summary>Wie füge ich neue Übungen zu einem Workout hinzu?</summary>
                <p>
                    Innerhalb eines Workouts findest du einen Button wie „+ Übung hinzufügen“. Dort trägst du
                    Name der Übung, Sätze, Wiederholungen und optional das Gewicht ein. Nach dem Speichern wird
                    die Übung in der Liste angezeigt und du kannst sie beim Training einfach abhaken oder anpassen.
                </p>
            </details>

            <details>
                <summary>Was bedeuten die Angaben Sätze, Wiederholungen und Gewicht?</summary>
                <p>
                    „Sätze“ zeigt dir, wie oft du die Übung hintereinander ausführen sollst (z.&nbsp;B. 3 Sätze),
                    „Wiederholungen“ beschreibt, wie viele Reps pro Satz geplant sind (z.&nbsp;B. 8–10), und bei
                    „Gewicht“ trägst du das verwendete Gewicht ein. So kannst du dein Trainingsvolumen klar
                    nachvollziehen und Progression planen.
                </p>
            </details>

            <details>
                <summary>Wie starte ich ein Workout und markiere Sätze als erledigt?</summary>
                <p>
                    Wenn du ein Workout öffnest, kannst du es über einen Start-Button oder direkt in der Liste
                    der Übungen trainieren. Dort hakst du Sätze ab, passt Wiederholungen und Gewicht an und
                    speicherst am Ende die Einheit. So weißt du beim nächsten Mal genau, wo du weiter machst.
                </p>
            </details>

            <details>
                <summary>Kann ich Übungen, Workouts oder ganze Pläne später bearbeiten oder löschen?</summary>
                <p>
                    Ja. Über Bearbeiten- und Löschen-Icons bei Übungen, Workouts oder Plänen kannst du alles im
                    Nachhinein anpassen. Das ist praktisch, wenn du deinen Split umstellst, Übungen austauschst oder
                    fehlerhafte Einträge korrigieren willst.
                </p>
            </details>

            <details>
                <summary>Gibt es Filter oder Kategorien für meine Workouts?</summary>
                <p>
                    Du kannst deine Workouts nach Kriterien wie Trainingstag, Muskelfokus oder Plan filtern
                    (z.&nbsp;B. „Oberkörper“, „Unterkörper“, „Push“, „Pull“). Dadurch findest du schneller die
                    Einheit, die du heute trainieren willst, ohne dich durch alles durchklicken zu müssen.
                </p>
            </details>

            <details>
                <summary>Sehe ich irgendwo meinen Fortschritt im Training?</summary>
                <p>
                    In der Trainingsübersicht kannst du erkennen, welche Workouts du in letzter Zeit gemacht hast
                    und wie deine Einheiten aufgebaut sind. Je nach späterer Ausbaustufe können hier zusätzliche
                    Auswertungen dazukommen (z.&nbsp;B. Trainingshäufigkeit pro Woche oder Fortschritt bei
                    bestimmten Übungen).
                </p>
            </details>

            <details>
                <summary>Werden meine Trainingsdaten schon dauerhaft gespeichert?</summary>
                <p>
                    In dieser frühzeitigen Version steht vor allem die Funktionalität und der Ablauf im Vordergrund.
                    Je nachdem, wie die finale Login- und Speicherlösung aussieht, können Daten aktuell noch beim
                    Neuladen verloren gehen. Geplant ist, dass deine Trainingshistorie später zuverlässig gesichert
                    und über Geräte hinweg verfügbar ist.
                </p>
            </details>
            <details>
                <summary>Warum gibt es so viele Bereiche auf der Trainingsseite?</summary>
                <p>
                    Die Trainingsseite ist bewusst in mehrere Bereiche aufgeteilt: Übersicht, aktive Workouts,
                    Detailansicht, ggf. Vorlagen und Einstellungen. So kannst du schnell zwischen Planen,
                    Ausführen und Analysieren springen, ohne dass alles in einer überladenen Ansicht landet.
                </p>
            </details>

            <details>
                <summary>Was sehe ich in der Trainingsübersicht ganz oben?</summary>
                <p>
                    Oben bekommst du meist einen schnellen Überblick: aktive Pläne, anstehende Workouts und
                    eventuell eine kurze Zusammenfassung deiner letzten Einheiten. Dieser Bereich soll dir zeigen:
                    „Was steht als Nächstes an?“ und „Was habe ich zuletzt gemacht?“.
                </p>
            </details>

            <details>
                <summary>Warum sind manche Workouts farblich hervorgehoben?</summary>
                <p>
                    Hervorgehobene Workouts sind z.&nbsp;B. für heute geplante Einheiten, besonders wichtige
                    Sessions (z.&nbsp;B. schwerer Tag im Plan) oder zuletzt aktive Workouts. Die Farben helfen dir,
                    auf einen Blick zu erkennen, worauf du dich jetzt konzentrieren solltest.
                </p>
            </details>

            <details>
                <summary>Kann ich mir nur bestimmte Workouts anzeigen lassen (z.&nbsp;B. Push, Pull, Beine)?</summary>
                <p>
                    Ja, über Filter wie „Alle“, „Push“, „Pull“, „Beine“, „Oberkörper“, „Unterkörper“ oder ähnliche
                    Kategorien kannst du die Liste eingrenzen. So musst du nicht durch alle Einheiten scrollen,
                    sondern siehst nur das, was du heute trainieren willst.
                </p>
            </details>

            <details>
                <summary>Wie funktioniert das Duplizieren eines Workouts oder Plans?</summary>
                <p>
                    Über eine Duplizieren-Option kannst du einen bestehenden Plan oder ein Workout kopieren,
                    anpassen und als neue Version speichern. Perfekt, wenn du z.&nbsp;B. deinen 3er-Split leicht
                    verändern willst, ohne alles noch einmal von null aufzubauen.
                </p>
            </details>

            <details>
                <summary>Kann ich die Reihenfolge der Übungen in einem Workout ändern?</summary>
                <p>
                    Ja. In der Regel kannst du die Übungen innerhalb eines Workouts per Drag-and-drop oder über
                    Pfeile nach oben/unten umsortieren. So passt du die Reihenfolge deinem echten Training an,
                    zum Beispiel wenn Geräte im Gym gerade besetzt sind.
                </p>
            </details>

            <details>
                <summary>Wie gehe ich mit Aufwärm- und Aufbaut-Sätzen um?</summary>
                <p>
                    Du kannst Aufwärm- oder Aufbaut-Sätze entweder als eigene Sätze mit leichterem Gewicht
                    eintragen oder – je nach Aufbau – getrennt von deinen Hauptsätzen dokumentieren. Wichtig ist,
                    dass du für dich ein klares System nutzt, damit du später genau weißt, was Arbeitsgewicht und
                    was Warm-up war.
                </p>
            </details>

            <details>
                <summary>Was bedeutet RPE/RIR und warum kann ich das eintragen?</summary>
                <p>
                    RPE (Rate of Perceived Exertion) und RIR (Reps in Reserve) helfen dir einzuschätzen, wie
                    anstrengend ein Satz war. Trägst du diese Werte ein, kannst du später besser erkennen, ob du
                    wirklich hart genug trainierst oder ob noch Luft nach oben war, ohne dich nur aufs Gewicht
                    zu verlassen.
                </p>
            </details>

            <details>
                <summary>Wie kann ich Supersätze oder Zirkeltraining abbilden?</summary>
                <p>
                    Supersätze kannst du abbilden, indem du zwei Übungen direkt nacheinander ohne Pause einträgst
                    und sie ggf. mit demselben Satz-Index oder einer Notiz markierst. Für Zirkel kannst du mehrere
                    Übungen mit einer gemeinsamen Rundenanzahl versehen. So bleibt trotzdem nachvollziehbar, was
                    du genau gemacht hast.
                </p>
            </details>

            <details>
                <summary>Was passiert, wenn ich ein Workout anfange, aber nicht fertig mache?</summary>
                <p>
                    Unfertige Workouts bleiben entweder als „in Bearbeitung“ markiert oder werden als abgebrochene
                    Einheit gespeichert. Du kannst später entscheiden, ob du sie löschen, nachbearbeiten oder als
                    Trainingsrealität akzeptieren willst – niemand trainiert immer perfekt nach Plan.
                </p>
            </details>

            <details>
                <summary>Kann ich meine alten Workouts später noch einsehen?</summary>
                <p>
                    Ja, du kannst über eine Verlauf- oder Historienansicht deine vergangenen Einheiten einsehen.
                    So erkennst du z.&nbsp;B., wie sich dein Gewicht bei bestimmten Übungen entwickelt hat oder
                    wie regelmäßig du in den letzten Wochen trainiert hast.
                </p>
            </details>

            <details>
                <summary>Wie hilft mir die Trainingsseite konkret beim Muskelaufbau?</summary>
                <p>
                    Die Seite sorgt dafür, dass du strukturiert trainierst: feste Pläne, klare Übungen, dokumentierte
                    Gewichte und Sätze. Damit kannst du Progression planen, also Gewicht, Volumen oder Intensität
                    Schritt für Schritt steigern – genau das ist der Kern von effektivem Muskelaufbau.
                </p>
            </details>

            <details>
                <summary>Kann ich zwischen kg und lbs wechseln?</summary>
                <p>
                    Je nach Einstellung kannst du das Gewichtssystem auf Kilogramm oder Pfund umstellen. Die
                    Trainingsseite sorgt im Hintergrund dafür, dass die Werte konsistent bleiben, damit du immer
                    mit der Einheit arbeiten kannst, die für dich oder dein Gym üblich ist.
                </p>
            </details>

            <details>
                <summary>Funktioniert die Trainingsseite auch für Home-Workouts ohne Geräte?</summary>
                <p>
                    Ja. Du kannst auch reine Körpergewichtsübungen, Bänder, Kurzhanteln oder sonstiges Equipment
                    eintragen. Gewicht kann dabei optional sein. Wichtig ist nur, dass du festhältst, was du tust
                    (z.&nbsp;B. „Liegestütze, 4×12“), damit du dich beim nächsten Mal steigern kannst.
                </p>
            </details>

            <details>
                <summary>Kann ich meinen Trainingsplan exportieren oder ausdrucken?</summary>
                <p>
                    Über eine Export-Funktion kannst du deinen Plan z.&nbsp;B. als Datei herunterladen, um ihn zu
                    sichern, auszudrucken oder mit einem Coach zu teilen. So hast du deine Struktur auch dann dabei,
                    wenn du mal nicht direkt in TrackYourGains drin bist.
                </p>
            </details>

            <details>
                <summary>Werden geplante und absolvierte Workouts unterschiedlich angezeigt?</summary>
                <p>
                    Ja, geplante Workouts und absolvierte Einheiten werden optisch getrennt dargestellt
                    (z.&nbsp;B. durch Badges, Icons oder Statuslabels). Dadurch erkennst du sofort, was noch ansteht
                    und was du bereits erledigt hast.
                </p>
            </details>

            <details>
                <summary>Was passiert, wenn ich meinen Trainingsplan komplett ändere?</summary>
                <p>
                    Wenn du deinen Plan stark umstellst, bleiben alte Einheiten in der Historie trotzdem erhalten.
                    So kannst du später immer noch sehen, wie du früher trainiert hast, auch wenn du aktuell einem
                    ganz anderen System folgst.
                </p>
            </details>

            <details>
                <summary>Ist die Trainingsseite schon final oder wird sie noch erweitert?</summary>
                <p>
                    Aktuell ist die Trainingsseite eine frühe, aber funktionsfähige Basis: Planen, Workouts anlegen
                    und Einheiten dokumentieren stehen im Fokus. Später können zusätzliche Features wie detaillierte
                    Auswertungen, automatische Vorschläge oder stärkere Verknüpfung mit Ernährung und Fortschritt
                    dazukommen.
                </p>
            </details>

        </section>

    </div>
</template>
<script setup>
import { ref } from 'vue'

const categories = [
    { key: 'all', label: 'Alle' },
    { key: 'landing', label: 'Landingpage & Start' },
    { key: 'nutrition', label: 'Ernährung' },
    { key: 'training', label: 'Training' }
]

const activeCategory = ref('all')
</script>

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

    .faq-filter {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 1rem 0 1.5rem;
    }

    .faq-filter-button {
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 0.4rem 0.9rem;
        font-size: 0.9rem;
        background: rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: background 0.15s ease, transform 0.05s ease, border-color 0.15s ease;
    }

        .faq-filter-button:hover {
            transform: translateY(-1px);
            background: rgba(255, 255, 255, 0.04);
        }

        .faq-filter-button.active {
            border-color: rgba(255, 255, 255, 0.4);
            background: rgba(255, 255, 255, 0.08);
            font-weight: 600;
        }

</style>
