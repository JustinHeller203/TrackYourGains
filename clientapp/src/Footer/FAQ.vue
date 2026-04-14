<!-- src/Footer/FAQ.vue -->
<template>
    <div class="legal-page">
        <header ref="headerEl" class="faq-header">
            <div class="faq-header__inner">
                <div class="faq-hero">
                    <div class="faq-hero__copy">
                        <span class="faq-kicker">Hilfe & Antworten</span>
                        <h1 class="faq-title">FAQ</h1>
                        <p class="faq-subtitle">
                            Schnelle Antworten zu TrackYourGains. Such nach Begriffen wie „Timer“, „Export“, „Validierung“ oder spring direkt in einen Bereich.
                        </p>
                    </div>

                    <div class="faq-hero__stats" aria-hidden="true">
                        <div class="faq-stat">
                            <strong>8</strong>
                            <span>Bereiche</span>
                        </div>
                        <div class="faq-stat">
                            <strong>85+</strong>
                            <span>Antworten</span>
                        </div>
                        <div class="faq-stat">
                            <strong>Suche</strong>
                            <span>direkt oben</span>
                        </div>
                    </div>
                </div>

                <div class="faq-search">
                    <UiSearch v-model="searchQuery"
                              placeholder="FAQ durchsuchen… (z.B. Timer, Export, Validierung)"
                              ariaLabel="FAQ durchsuchen"
                              :center="true"
                              maxWidth="720px" />

                    <div class="faq-search__meta" v-if="searchQuery.trim().length">
                        <span v-if="matchCount > 0">{{ matchCount }} Treffer</span>
                        <span v-else>Keine Treffer</span>
                    </div>
                </div>
            </div>
        </header>

        <p class="faq-no-results" v-if="searchQuery.trim().length && matchCount === 0">
            Keine passenden Fragen gefunden. Versuch ein anderes Keyword (z.B. „Plan“, „Timer“, „Toasts“, „Export“).
        </p>

        <p class="faq-picker-hint">
            Wähle hier den Bereich aus, zu dem du gerade etwas suchst.
        </p>

        <nav class="faq-filter" aria-label="FAQ Kategorien">
            <template v-for="cat in categories" :key="cat.key">
                <button type="button"
                        class="faq-filter-button"
                        :class="{ active: activeCategory === cat.key }"
                        @click="toggleCategory(cat.key)">
                    <span class="faq-filter-button__icon" aria-hidden="true">{{ cat.icon }}</span>
                    <span class="faq-filter-button__copy">
                        <strong>{{ cat.label }}</strong>
                        <small>{{ cat.description }}</small>
                    </span>
                </button>

                <Transition v-if="activeCategory === cat.key" name="faq-panels">
                    <div v-if="activeCategory === cat.key" class="faq-panels faq-panels--inline">
        <!-- Landing -->
        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'landing'">
            <h3 v-if="activeCategory === 'all'" class="faq-section-label">Landing</h3>
            <details>
                <summary>Was bedeuten die Zahlen bei „Deine Erfolge 🏆“?</summary>
                <p>
                    Dort siehst du, wie viele Workouts du abgeschlossen hast, wie viele Beschwerden du erfasst hast
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
                <summary>Wohin führen die Buttons wie „Jetzt loslegen“ oder „Trainingsplan erstellen“?</summary>
                <p>
                    Die Buttons bringen dich direkt in die passenden Bereiche:
                    „Jetzt loslegen“ führt dich ins Training,
                    „Fortschritt ansehen“ öffnet deine Fortschrittsseite,
                    „Trainingsplan erstellen“ führt dich zum Training,
                    „Beschwerde erfassen“ in den Beschwerden-Bereich und
                    „Tutorials öffnen“ direkt zu den Übungstutorials.
                </p>
            </details>

            <details>
                <summary>Was sind die „Features“ auf der Landingpage?</summary>
                <p>
                    Die Feature-Karten zeigen dir, was TrackYourGains alles kann:
                    Training planen, Beschwerden dokumentieren, Fortschritt auswerten und Tutorials anschauen.
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
                    später Beschwerden ergänzen und nach und nach deinen Fortschritt ausbauen. Die
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

        <!-- Training -->
        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'training'">
            <h3 v-if="activeCategory === 'all'" class="faq-section-label">Training</h3>
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
                    Du gibst Name, Ziel (z.&nbsp;z. B. Muskelaufbau) und ggf. Trainingstage an und kannst anschließend
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
                <summary>Welche Trainingsarten gibt es (Kraft, Calisthenics, Ausdauer, Dehnung) – und was ändert sich?</summary>
                <p>
                    Du wählst oben den Trainingstyp. Je nach Typ ändern sich die Eingabefelder:
                    Bei Kraft/Calisthenics gibst du Sätze + Wiederholungen an, bei Dehnung Holds + Sekunden pro Hold
                    und bei Ausdauer Dauer in Minuten + optional Distanz in km.
                </p>
            </details>

            <details>
                <summary>Warum sehe ich bei Ausdauer „Sätze / Min“ und „Wdh. / km / s“?</summary>
                <p>
                    Ausdauer nutzt „Minuten“ statt Sätze. In der dritten Spalte steht dann optional die Distanz (km).
                    Bei Dehnung wird dort Sekunden (s) angezeigt. So bleibt die Tabelle für alle Typen einheitlich.
                </p>
            </details>

            <details>
                <summary>Welche Regeln gelten für Planname, Sätze, Wiederholungen &amp; Cardio-Dauer?</summary>
                <p>
                    Planname: 3–20 Zeichen.<br>
                    Sätze/Holds: 1–20 (Ganzzahl).<br>
                    Wiederholungen/Sekunden: 1–1000 (Ganzzahl).<br>
                    Cardio-Dauer: 1–600 Minuten (Ganzzahl). Distanz ist optional und darf nicht negativ sein.
                </p>
            </details>

            <details>
                <summary>Warum kommt manchmal ein „Validierungsfehler“-Popup?</summary>
                <p>
                    Das Popup kommt, wenn etwas fehlt oder unlogisch ist (z.&nbsp;B. keine Übung gewählt, doppelte Übung im Plan,
                    ungültige Zahlenbereiche). Es zeigt dir konkret, was du fixen musst, damit du nicht „ins Leere“ speicherst.
                </p>
            </details>

            <details>
                <summary>Wie kann ich Übungen schnell bearbeiten?</summary>
                <p>
                    In den Tabellen kannst du eine Übung per Doppelklick bearbeiten (Name / Sätze-Min / Wdh-km-s).
                    Im Plan-Listeneintrag kannst du den Planname ebenfalls per Doppelklick ändern.
                </p>
            </details>

            <details>
                <summary>Was passiert, wenn ich einen Plan bearbeite und alle Übungen entferne?</summary>
                <p>
                    Wenn du einen Plan im Bearbeiten-Modus speicherst und keine Übung mehr drin ist,
                    wird der Plan automatisch gelöscht (inkl. Favoriten-Status). Das ist Absicht: „leere Pläne“ sollen nicht rumliegen.
                </p>
            </details>

            <details>
                <summary>Wie funktionieren Favoriten &amp; Sortieren per Drag-&amp;-Drop?</summary>
                <p>
                    Favoriten landen oben und lassen sich separat sortieren. Du kannst Pläne per Drag-&amp;-Drop umsortieren
                    (am Griff ⠿). Wenn du suchst, ist das Sortieren bewusst gesperrt.
                </p>
            </details>

            <details>
                <summary>Was bringt die Suche bei „Deine Trainingspläne“?</summary>
                <p>
                    Die Suche filtert nach Planname und nach Trainingsziel (falls bei Übungen ein Ziel gesetzt ist).
                    Während du suchst, ist Drag-&amp;-Drop zum Sortieren deaktiviert – damit nix aus Versehen verrutscht.
                </p>
            </details>

            <details>
                <summary>Kann ich einen Trainingsplan herunterladen/exportieren?</summary>
                <p>
                    Ja. Du kannst einen Plan als HTML, PDF, CSV, JSON oder TXT herunterladen.
                    Die Spaltenüberschriften passen sich automatisch an (z.&nbsp;B. Min/km/s je nach Übungstyp),
                    damit der Export genauso verständlich ist wie in der App.
                </p>
            </details>

            <details>
                <summary>Werden die Trainingsdaten gespeichert – und wo?</summary>
                <p>
                    Ja, aktuell wird lokal im Browser gespeichert (LocalStorage). Das heißt:
                    Wenn du Browserdaten löschst oder auf ein anderes Gerät wechselst, sind die Daten dort nicht automatisch da.
                    Später kann das mit Login/Sync erweitert werden.
                </p>
            </details>
        </section>

        <!-- Fortschritt -->
        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'progress'">
            <h3 v-if="activeCategory === 'all'" class="faq-section-label">Fortschritt</h3>
            <details>
                <summary>Wofür ist die Fortschritt-Seite gedacht?</summary>
                <p>
                    Dort bündelst du alles, was deinen Verlauf sichtbar macht: Gewicht, Zielgewicht, letzte Workouts,
                    Trainingsstatistiken, Rechner, Trainingspläne und Plan-Fortschritt. Es ist die Analyse-Seite der App.
                </p>
            </details>

            <details>
                <summary>Welche Tabs gibt es auf der Fortschritt-Seite?</summary>
                <p>
                    Es gibt drei Hauptbereiche: <strong>Stats</strong> für Gewichts- und Trainingsverlauf,
                    <strong>Calculators</strong> für Rechner und <strong>Plans</strong> für Trainingspläne,
                    Plan-Fortschritt und Verlauf pro Plan.
                </p>
            </details>

            <details>
                <summary>Was bringen die Karten für Gewicht, Beschwerden, letztes Training und Zielgewicht?</summary>
                <p>
                    Die Karten oben geben dir einen schnellen Überblick über deine wichtigsten Kennzahlen.
                    Von dort aus kannst du direkt Gewicht eintragen, dein Ziel anpassen oder in Detailansichten springen.
                </p>
            </details>

            <details>
                <summary>Welche Rechner gibt es im Calculator-Tab?</summary>
                <p>
                    Dort findest du mehrere Fitness- und Ernährungsrechner, zum Beispiel BMI, Kalorienbedarf,
                    Burn Rate, Proteinbedarf, 1RM, Koffein, Körperfett, FFMI, Glycemic Load und Wasserbedarf.
                </p>
            </details>

            <details>
                <summary>Kann ich Rechner favorisieren oder durchsuchen?</summary>
                <p>
                    Ja. Du kannst einzelne Rechner als Favorit markieren, per Suche filtern und nach Kategorien eingrenzen.
                    So musst du nicht jedes Mal durch alle Cards scrollen.
                </p>
            </details>

            <details>
                <summary>Was zeigt der Plans-Tab in Fortschritt?</summary>
                <p>
                    Dort siehst du deine Trainingspläne inklusive Status wie neu erstellt, aktiv oder unbenutzt.
                    Außerdem kannst du Plan-Fortschritt, Kalender, Stats und Downloads pro Plan öffnen.
                </p>
            </details>

            <details>
                <summary>Was ist der Unterschied zwischen Plan-Fortschritt und Trainingsstatistik?</summary>
                <p>
                    Die Trainingsstatistik zeigt dir eher den globalen Verlauf deiner absolvierten Workouts.
                    Der Plan-Fortschritt zoomt dagegen in einen konkreten Plan hinein und zeigt dir pro Tag,
                    Kalender oder Statistik, wie du diesen Plan nutzt.
                </p>
            </details>

            <details>
                <summary>Gibt es auf der Fortschritt-Seite Feedback nach dem Training?</summary>
                <p>
                    Ja. Je nach Verlauf können Trainingsfeedback und Schmerzfeedback auftauchen.
                    Dadurch kann die App nicht nur zählen, dass du trainiert hast, sondern auch, wie sich die Einheit angefühlt hat.
                </p>
            </details>

            <details>
                <summary>Kann ich Ergebnisse oder Fortschrittsdaten exportieren?</summary>
                <p>
                    Ja. Sowohl Charts als auch Plan-/Fortschrittsansichten lassen sich exportieren,
                    z.&nbsp;B. als HTML, PDF, CSV, JSON oder TXT – je nach Bereich.
                </p>
            </details>
        </section>

        <!-- Timer & Stopwatch -->
        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'timers'">
            <h3 v-if="activeCategory === 'all'" class="faq-section-label">Timer &amp; Stopwatch</h3>
            <details>
                <summary>Wofür sind der Satzpausen-Timer und die Übungs-Stoppuhr?</summary>
                <p>
                    Der Timer ist für Pausen zwischen Sätzen (Rest-Timer) – du wählst Sekunden oder stellst sie custom ein.
                    Die Stoppuhr ist fürs Zeit-Tracking bei Übungen (Holds, EMOM/Intervalle, „wie lang hab ich gebraucht?“).
                </p>
            </details>

            <details>
                <summary>Kann ich mehrere Timer/Stoppuhren haben – und wie sortiere ich die?</summary>
                <p>
                    Ja. Du kannst beliebig viele hinzufügen und per Drag-&amp;-Drop umsortieren (am Griff ⠿).
                    Favoriten landen automatisch oben und werden getrennt von den anderen sortiert.
                </p>
            </details>

            <details>
                <summary>Warum kann ich nicht alle Timer/Stoppuhren löschen?</summary>
                <p>
                    Es muss immer mindestens eine Instanz offen bleiben. Wenn du die letzte löschen willst,
                    kommt ein Validierungs-Fehler statt „alles weg“.
                </p>
            </details>

            <details>
                <summary>Timer: Wie stelle ich die Satzpause ein (60/90/120/custom)?</summary>
                <p>
                    Du wählst eine Preset-Pause (z.&nbsp;B. 60/90/120s) oder „Benutzerdefiniert“.
                    Bei Custom gibst du Sekunden ein (nur &gt; 0), und der Timer übernimmt den Wert direkt.
                </p>
            </details>

            <details>
                <summary>Timer: Welche Sounds gibt es – und was passiert bei „Timer fertig“?</summary>
                <p>
                    Du kannst Sounds wählen (z.&nbsp;B. Standard, Alarm, Beep, Dong, „One Way Out“ oder „Keine“).
                    Wenn der Timer 0 erreicht, wird ein Popup angezeigt, optional ein Sound abgespielt
                    und (wenn erlaubt) eine System-Benachrichtigung gesendet.
                </p>
            </details>

            <details>
                <summary>Timer: Warum fragt die App nach Benachrichtigungen?</summary>
                <p>
                    Damit du „Timer fertig“ auch außerhalb des Tabs mitkriegst (System-Notification).
                    Wenn du’s ablehnst, funktioniert der Timer trotzdem – du bekommst dann nur kein Notification-Push.
                </p>
            </details>

            <details>
                <summary>Stoppuhr: Was sind „Runden“ (Laps) und wie werden die gemessen?</summary>
                <p>
                    „Runde“ speichert nicht die Gesamtzeit, sondern die Lap-Dauer:
                    aktuelle Gesamtzeit minus Summe deiner bisherigen Laps. So bekommst du echte Split-Zeiten pro Runde.
                </p>
            </details>

            <details>
                <summary>Stoppuhr: Kann ich Runden bearbeiten, kopieren oder löschen?</summary>
                <p>
                    Ja. Über das 3-Punkte-Menü („Mehr“) kannst du:
                    Runden kopieren (Auswahl), Runden löschen (Auswahl) oder einen Rundennamen bearbeiten (Single-Select).
                    Copy landet direkt in der Zwischenablage.
                </p>
            </details>

            <details>
                <summary>Stoppuhr: Wie benenne ich eine Runde um?</summary>
                <p>
                    Doppelklick auf eine Runde → Name bearbeiten. Namen sind max. 30 Zeichen.
                    Leerer Name ist erlaubt – dann zeigt die App automatisch „Runde 1“, „Runde 2“… an.
                </p>
            </details>

            <details>
                <summary>Was bedeutet „Sticky“ bei Timer/Stoppuhr?</summary>
                <p>
                    Sticky heißt: Wenn du scrollst und die Card nicht mehr sichtbar ist, kann sie als Sticky-Card sichtbar bleiben.
                    Das ist ein Komfort-Feature, damit du Timer/Stopwatch immer im Blick hast.
                </p>
            </details>

            <details>
                <summary>Warum sehe ich Toasts wie „Runde aufgezeichnet“, „Kopiert ✅“, „Timer gelöscht“?</summary>
                <p>
                    Toasts sind kurze Bestätigungen für Aktionen (Start/Stop/Reset, Runde, Kopieren, Löschen, Speichern).
                    Die sind absichtlich kurz und verschwinden automatisch wieder.
                </p>
            </details>
        </section>

        <!-- Beschwerden -->
        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'complaints'">
            <h3 v-if="activeCategory === 'all'" class="faq-section-label">Beschwerden</h3>
            <details>
                <summary>Wofür ist die Beschwerden-Seite gedacht?</summary>
                <p>
                    Dort dokumentierst du Schmerzen, Überlastungen oder Muskelkater und behältst ihren Verlauf im Blick.
                    So kannst du Training und Beschwerden besser zusammen denken, statt alles getrennt zu merken.
                </p>
            </details>

            <details>
                <summary>Welche Informationen kann ich bei einer Beschwerde speichern?</summary>
                <p>
                    Du kannst Bereich, Kategorie, Intensität, Datum, Status und optionale Notizen speichern.
                    Dadurch siehst du nicht nur, dass etwas weh tut, sondern auch wie stark, seit wann und ob es besser wird.
                </p>
            </details>

            <details>
                <summary>Welche Status gibt es bei Beschwerden?</summary>
                <p>
                    Aktuell gibt es „aktiv“, „besser“ und „weg“.
                    Damit kannst du laufende Beschwerden sauber von fast abgeheilten oder erledigten Einträgen trennen.
                </p>
            </details>

            <details>
                <summary>Kann ich eine Beschwerde später bearbeiten oder löschen?</summary>
                <p>
                    Ja. Bestehende Einträge kannst du öffnen, anpassen oder wieder entfernen.
                    Das ist wichtig, wenn sich Intensität, Status oder deine Einschätzung verändert haben.
                </p>
            </details>

            <details>
                <summary>Werden Beschwerden nur lokal gespeichert oder auch mit Account?</summary>
                <p>
                    Ohne Login werden die Einträge lokal im Browser gespeichert. Mit Account werden sie über den Store geladen
                    und mit deinem Benutzer verknüpft. Wenn lokal gespeichert wird, gehen die Daten bei Browser-Reset oder Gerätewechsel nicht automatisch mit.
                </p>
            </details>

            <details>
                <summary>Was bringt mir das für mein Training?</summary>
                <p>
                    Beschwerden fließen in mehrere Trainingsbereiche ein, zum Beispiel in gelenkschonendere Entscheidungen oder Auto-Plan-Anpassungen.
                    Dadurch kann die App besser berücksichtigen, was gerade sinnvoll ist und was eher vermieden werden sollte.
                </p>
            </details>

            <details>
                <summary>Gibt es Hilfen beim Erstellen einer neuen Beschwerde?</summary>
                <p>
                    Ja. Je nach Art der Beschwerde bekommst du zusätzliche Felder,
                    z.&nbsp;B. Intensität, Verletzungsart, geschätzte Ausfallzeit oder benutzerdefinierte Körperstellen.
                </p>
            </details>

            <details>
                <summary>Kann die App Beschwerden mit einem Trainingstag verknüpfen?</summary>
                <p>
                    Ja. Für bestimmte Fälle fragt die App nach Trainingskontext,
                    damit Beschwerden besser zu Übungen oder Einheiten eingeordnet werden können.
                </p>
            </details>
        </section>

        <!-- Tutorials -->
        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'tutorials'">
            <h3 v-if="activeCategory === 'all'" class="faq-section-label">Tutorials</h3>
            <details>
                <summary>Was ist die Tutorials-Seite?</summary>
                <p>
                    Eine Sammlung von Übungs-Tutorials mit Suche + Kategorien.
                    Die Seite ist aktuell noch sehr minimalistisch und wird sich stark ändern.
                </p>
            </details>

            <details>
                <summary>Warum funktionieren die Videos (noch) nicht richtig?</summary>
                <p>
                    Aktuell sind Videos/Embeds teilweise nur Platzhalter und noch nicht final eingebunden.
                    Heißt: Manche Tutorials zeigen (noch) kein echtes Video oder es lädt nicht zuverlässig.
                </p>
            </details>

            <details>
                <summary>Was bedeutet „Video wird bald hinzugefügt“?</summary>
                <p>
                    Das ist ein Platzhalter: Für dieses Tutorial ist noch kein Video hinterlegt.
                </p>
            </details>

            <details>
                <summary>Wie funktioniert die Suche?</summary>
                <p>
                    Die Suche filtert nach Titel, Beschreibung und Kategorie.
                </p>
            </details>

            <details>
                <summary>Sind das echte Daten?</summary>
                <p>
                    Stand jetzt: größtenteils Demo/Platzhalter, damit Layout &amp; Features stehen.
                    Später kommen echte Inhalte + bessere Struktur.
                </p>
            </details>

            <details>
                <summary>Kann ich eigene Tutorials hinzufügen?</summary>
                <p>
                    Ja. Du kannst lokale Tutorials mit Titel, Kategorie, Level, Beschreibung,
                    Equipment und optionalem Video anlegen. Diese Sammlung bleibt auf deinem Gerät.
                </p>
            </details>

            <details>
                <summary>Gibt es Favoriten und „zuletzt angesehen“?</summary>
                <p>
                    Ja. Tutorials können favorisiert werden und zuletzt geöffnete Inhalte
                    werden separat hervorgehoben, damit du schneller wieder dahin kommst.
                </p>
            </details>
        </section>

        <!-- Einstellungen -->
        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'settings'">
            <h3 v-if="activeCategory === 'all'" class="faq-section-label">Einstellungen</h3>
            <details>
                <summary>Was kann ich in den Einstellungen überhaupt ändern?</summary>
                <p>
                    Du steuerst hier Anzeige (Dark Mode, Einheiten, Scroll-Hoch), System (Sticky Timer/Stoppuhr, Auto-Berechnung, Löschen bestätigen)
                    und Toasts (an/aus, Dauer, Arten).
                </p>
            </details>

            <details>
                <summary>Warum klappt nicht alles sofort um, wenn ich etwas umstelle?</summary>
                <p>
                    Weil du erst unten auf „Einstellungen speichern“ klicken musst.
                    Vorher ist es nur ein Entwurf – besonders bei Sachen wie Theme/Toasts/Sticky.
                </p>
            </details>

            <details>
                <summary>Was ist der Unterschied zwischen „Dark Mode“ und „Speichern“?</summary>
                <p>
                    Dark Mode wird beim Umschalten direkt als Vorschau gezeigt.
                    Wenn du aber ohne Speichern die Seite verlässt, springt es wieder auf den zuletzt gespeicherten Stand zurück.
                </p>
            </details>

            <details>
                <summary>Was bedeutet „Einheiten (kg/lbs)“?</summary>
                <p>
                    Damit stellst du um, ob Gewichte in Kilogramm oder Pfund angezeigt/gerechnet werden.
                </p>
            </details>

            <details>
                <summary>Was heißt „Sticky Timer / Sticky Stoppuhr“?</summary>
                <p>
                    Wenn aktiv, dürfen Timer/Stoppuhren als Sticky-Card sichtbar bleiben, auch wenn du scrollst.
                    Wenn du’s ausmachst, werden Sticky-Elemente komplett unterdrückt.
                </p>
            </details>

            <details>
                <summary>Was sind „Toasts“?</summary>
                <p>
                    Mini-Benachrichtigungen wie „gespeichert“, „hinzugefügt“, „gelöscht“ oder Timer-Infos.
                    Du kannst sie komplett deaktivieren oder die Dauer anpassen.
                </p>
            </details>

            <details>
                <summary>Kann ich steuern, welche Toast-Arten angezeigt werden?</summary>
                <p>
                    Ja. Wenn Toasts aktiv sind, kannst du zusätzlich die Dauer einstellen
                    und im Toast-Manager feiner festlegen, welche Typen überhaupt angezeigt werden sollen.
                </p>
            </details>
        </section>

        <!-- Profil -->
        <section class="faq-section" v-if="activeCategory === 'all' || activeCategory === 'profile'">
            <h3 v-if="activeCategory === 'all'" class="faq-section-label">Profil</h3>
            <details>
                <summary>Wofür ist die Profil-Seite gedacht?</summary>
                <p>
                    Dort verwaltest du deinen Account, dein Profilbild, Username, E-Mail, Passwort
                    und bekommst zusätzlich einen Überblick über Profil-Check, Wochenziel und Aktivität.
                </p>
            </details>

            <details>
                <summary>Was ist der Profil-Check?</summary>
                <p>
                    Der Profil-Check zeigt dir, wie vollständig dein Profil eingerichtet ist.
                    Einzelne Schritte lassen sich direkt anklicken, damit du fehlende Punkte schneller erledigst.
                </p>
            </details>

            <details>
                <summary>Was bedeutet das Wochenziel im Profil?</summary>
                <p>
                    Das Wochenziel zeigt dir, wie viele Workouts du in dieser Woche bereits geschafft hast
                    und wie nah du an deinem aktuellen Ziel bist. Der Wert wird aus deinen letzten Wochen abgeleitet.
                </p>
            </details>

            <details>
                <summary>Wie ändere ich mein Profilbild?</summary>
                <p>
                    Du kannst ein Bild hochladen, per Kontext-/Hold-Menü öffnen, kopieren,
                    austauschen oder entfernen. Es gibt dafür mehrere direkte Aktionen auf dem Avatar.
                </p>
            </details>

            <details>
                <summary>Kann ich Username, E-Mail und Passwort ändern?</summary>
                <p>
                    Ja. Dafür gibt es auf der Profil-Seite eigene Aktionen und Popups.
                    Username, E-Mail und Passwort werden getrennt verwaltet.
                </p>
            </details>

            <details>
                <summary>Kann ich mein Konto löschen?</summary>
                <p>
                    Ja. Auf der Profil-Seite gibt es eine eigene Aktion zum Löschen des Profils.
                    Das ist absichtlich klar getrennt von normalen Änderungen wie Name oder Bild.
                </p>
            </details>

            <details>
                <summary>Was ist der Logout-Swipe?</summary>
                <p>
                    Im Profil gibt es eine Swipe-Interaktion zum Ausloggen.
                    Dadurch wird versehentliches Ausloggen schwerer als bei einem normalen Klick.
                </p>
            </details>

            <details>
                <summary>Kann ich die Profil-Seite ohne Login nutzen?</summary>
                <p>
                    Nein. Die Profil-Seite ist geschützt und nur mit Account erreichbar.
                    Wenn du nicht eingeloggt bist, wirst du zum Login weitergeleitet.
                </p>
            </details>
        </section>
                    </div>
                </Transition>
            </template>
        </nav>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
    import UiSearch from "@/components/ui/kits/UiSearch.vue";

    type CatKey = "all" | "landing" | "training" | "progress" | "timers" | "complaints" | "tutorials" | "settings" | "profile";
    type Category = { key: CatKey; label: string; icon: string; description: string };

    const categories: Category[] = [
        { key: "all", label: "Alles", icon: "◌", description: "Gesamte FAQ auf einen Blick" },
        { key: "landing", label: "Landing", icon: "⌂", description: "Start, Buttons und erster Einstieg" },
        { key: "training", label: "Training", icon: "◫", description: "Pläne, Übungen, Export und Validierung" },
        { key: "progress", label: "Fortschritt", icon: "◔", description: "Stats, Rechner, Pläne und Feedback" },
        { key: "timers", label: "Timer", icon: "◷", description: "Pausen, Stopwatch und Sticky-Funktionen" },
        { key: "complaints", label: "Beschwerden", icon: "✚", description: "Dokumentation, Status und Verlauf" },
        { key: "tutorials", label: "Tutorials", icon: "▷", description: "Suche, Videos und Platzhalter-Inhalte" },
        { key: "settings", label: "Einstellungen", icon: "⚙", description: "Theme, Einheiten und Toasts" },
        { key: "profile", label: "Profil", icon: "◎", description: "Account, Avatar, Wochenziel und Sicherheit" },
    ];

    const activeCategory = ref<CatKey | null>(null);

    const toggleCategory = (key: CatKey) => {
        activeCategory.value = activeCategory.value === key ? null : key;
    };

    const searchQuery = ref("");
    const matchCount = ref(0);

    const headerEl = ref < HTMLElement | null > (null);

    const norm = (s: string) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();

    const escapeHtml = (s: string) =>
        s.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    const highlightText = (text: string, q: string) => {
        if (!q) return escapeHtml(text);

        const lower = text.toLowerCase();
        const needle = q.toLowerCase();

        let out = "";
        let i = 0;

        while (true) {
            const idx = lower.indexOf(needle, i);
            if (idx === -1) break;

            out += escapeHtml(text.slice(i, idx));
            out += `<span class="faq-hit">${escapeHtml(text.slice(idx, idx + needle.length))}</span>`;
            i = idx + needle.length;
        }

        out += escapeHtml(text.slice(i));
        return out;
    };

    const applyHighlights = (detailsEl: HTMLDetailsElement, q: string) => {
        const targets = [
            detailsEl.querySelector("summary"),
            ...Array.from(detailsEl.querySelectorAll("p")),
        ].filter(Boolean) as HTMLElement[];

        targets.forEach((el) => {
            if (!el.dataset.origText) el.dataset.origText = el.textContent ?? "";

            if (!q) {
                el.textContent = el.dataset.origText ?? "";
                return;
            }

            const orig = el.dataset.origText ?? "";
            el.innerHTML = highlightText(orig, q);
        });
    };

    const applyFaqFilter = () => {
        const q = norm(searchQuery.value);
        const root = document.querySelector(".legal-page");
        if (!root) return;

        const detailsEls = Array.from(root.querySelectorAll(".faq-section details")) as HTMLDetailsElement[];

        let matches = 0;

        detailsEls.forEach((d) => {
            const summaryText = d.querySelector("summary")?.textContent ?? "";
            const fullText = d.textContent ?? "";
            const hay = norm(`${summaryText} ${fullText}`);

            const isMatch = !q || hay.includes(q);

            (d as HTMLElement).style.display = isMatch ? "" : "none";

            if (q) d.open = isMatch;
            else d.open = false;

            if (isMatch && q) matches += 1;

            applyHighlights(d, q);
        });

        matchCount.value = q ? matches : 0;

        const sections = Array.from(root.querySelectorAll(".faq-section")) as HTMLElement[];
        sections.forEach((sec) => {
            if (!q) {
                sec.style.display = "";
                return;
            }
            const visible = Array.from(sec.querySelectorAll("details")).some((d) => (d as HTMLElement).style.display !== "none");
            sec.style.display = visible ? "" : "none";
        });
    };

    onMounted(async () => {
        await nextTick();
        applyFaqFilter();
    });

    onUnmounted(() => {
    });

    watch(searchQuery, () => {
        applyFaqFilter();
    });

    watch(activeCategory, async () => {
        await nextTick();
        applyFaqFilter();
    });
</script>

<style scoped>
    .legal-page {
        max-width: 1120px;
        margin: 2.6rem auto 4rem;
        padding: 1.2rem 1.2rem 3rem;
        overflow: visible;
    }

    .faq-header {
        position: sticky;
        top: var(--app-header-height, 0px);
        z-index: 50;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin-bottom: 1.5rem;
    }

    .faq-header__inner {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0;
    }

    .faq-hero {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(260px, .95fr);
        gap: 1rem;
        padding: 1.3rem;
        border-radius: 24px;
        border: 1px solid color-mix(in srgb, var(--border-color) 82%, rgba(75, 108, 183, 0.18) 18%);
        background:
            radial-gradient(circle at top right, rgba(75, 108, 183, 0.12), transparent 34%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, #ffffff 4%), color-mix(in srgb, var(--bg-secondary) 92%, #ffffff 8%));
        box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
    }

    .faq-kicker {
        display: inline-flex;
        align-items: center;
        padding: 0.36rem 0.68rem;
        margin-bottom: 0.7rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
        color: color-mix(in srgb, var(--accent-secondary) 78%, var(--text-primary) 22%);
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .faq-title {
        margin: 0;
        line-height: 1.1;
        font-size: clamp(2rem, 3vw, 3rem);
    }

    .faq-subtitle {
        margin: 0;
        max-width: 62ch;
        color: var(--text-secondary);
        line-height: 1.58;
        font-size: 1rem;
    }

    .faq-hero__stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        align-content: start;
    }

    .faq-stat {
        display: grid;
        gap: 0.18rem;
        padding: 0.95rem 0.9rem;
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, var(--border-color) 74%, rgba(75, 108, 183, 0.18) 26%);
        background: color-mix(in srgb, var(--bg-card) 88%, rgba(255,255,255,.26) 12%);
        text-align: center;
    }

    .faq-stat strong {
        font-size: 1.1rem;
        line-height: 1.1;
    }

    .faq-stat span {
        font-size: 0.82rem;
        color: var(--text-secondary);
    }

    .faq-search {
        margin: 1rem 0 0;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
    }

    .faq-search__meta {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 1rem;
        opacity: 0.85;
        font-size: 0.95rem;
    }

    .faq-picker-hint {
        margin: 0 0 0.9rem;
        padding: 0 0.15rem;
        color: var(--text-secondary);
        font-size: 0.92rem;
        line-height: 1.5;
    }

    .faq-no-results {
        margin: 0 0 1.25rem;
        padding: 1rem 1.1rem;
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, #f59e0b 26%, var(--border-color) 74%);
        background: color-mix(in srgb, #f59e0b 8%, var(--bg-card) 92%);
        line-height: 1.55;
    }

    .faq-filter {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.8rem;
        margin: 1.2rem 0 1.8rem;
        align-items: start;
    }

    .faq-panels {
        display: grid;
        gap: 1.7rem;
    }

    .faq-panels--inline {
        grid-column: 1 / -1;
        margin-top: 0.1rem;
    }

    .faq-panels-enter-active,
    .faq-panels-leave-active {
        transition: opacity .24s ease, transform .28s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .faq-panels-enter-from,
    .faq-panels-leave-to {
        opacity: 0;
        transform: translateY(18px) scale(.985);
    }

    .faq-filter-button {
        display: flex;
        align-items: flex-start;
        gap: 0.8rem;
        text-align: left;
        border-radius: 20px;
        border: 1px solid color-mix(in srgb, var(--border-color) 82%, rgba(75, 108, 183, 0.16) 18%);
        padding: 0.95rem 1rem;
        font-size: 0.94rem;
        background:
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #ffffff 6%), color-mix(in srgb, var(--bg-secondary) 94%, #ffffff 6%));
        cursor: pointer;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
        transition: transform 0.14s ease, border-color 0.14s ease, box-shadow 0.14s ease, background-color 0.14s ease;
    }

    .faq-filter-button:hover {
        transform: translateY(-2px);
        border-color: color-mix(in srgb, var(--accent-primary) 28%, var(--border-color) 72%);
        box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
    }

    .faq-filter-button.active {
        border-color: color-mix(in srgb, var(--accent-primary) 42%, var(--border-color) 58%);
        background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 14%, transparent), transparent 40%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, #ffffff 4%), color-mix(in srgb, var(--bg-secondary) 88%, var(--accent-primary) 12%));
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
    }

    .faq-filter-button__icon {
        width: 2.35rem;
        height: 2.35rem;
        border-radius: 14px;
        display: inline-grid;
        place-items: center;
        flex: 0 0 auto;
        background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
        color: color-mix(in srgb, var(--accent-secondary) 76%, var(--text-primary) 24%);
        font-size: 1.05rem;
        font-weight: 900;
    }

    .faq-filter-button__copy {
        display: grid;
        gap: 0.25rem;
    }

    .faq-filter-button__copy strong {
        font-size: 0.96rem;
        line-height: 1.2;
    }

    .faq-filter-button__copy small {
        color: var(--text-secondary);
        line-height: 1.38;
        font-size: 0.78rem;
    }

    .faq-section {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        margin-top: 0.2rem;
    }

    .faq-section-label {
        margin: 0 0 0.1rem;
        padding: 0 0.15rem;
        font-size: 0.92rem;
        font-weight: 800;
        letter-spacing: 0.02em;
        color: var(--text-secondary);
    }

    .faq-section details {
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, var(--border-color) 84%, rgba(75, 108, 183, 0.14) 16%);
        padding: 0;
        background: color-mix(in srgb, var(--bg-card) 94%, rgba(255,255,255,.06) 6%);
        overflow: hidden;
        transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease;
    }

    .faq-section details[open] {
        border-color: color-mix(in srgb, var(--accent-primary) 34%, var(--border-color) 66%);
        box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
    }

    .faq-section summary {
        position: relative;
        font-weight: 700;
        cursor: pointer;
        list-style: none;
        padding: 1rem 3.25rem 1rem 1rem;
        line-height: 1.42;
    }

    .faq-section summary::-webkit-details-marker {
        display: none;
    }

    .faq-section summary::after {
        content: "+";
        position: absolute;
        right: 0.95rem;
        top: 50%;
        width: 1.8rem;
        height: 1.8rem;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: color-mix(in srgb, var(--accent-primary) 14%, transparent);
        color: color-mix(in srgb, var(--accent-secondary) 72%, var(--text-primary) 28%);
        font-size: 1rem;
        font-weight: 900;
        transform: translateY(-50%);
        transition: transform .16s ease, background-color .16s ease;
    }

    .faq-section details[open] summary::after {
        content: "−";
        transform: translateY(-50%) rotate(180deg);
    }

    .faq-section p {
        margin: 0;
        padding: 0 1rem 1rem;
        color: var(--text-secondary);
        line-height: 1.62;
    }

    :global(.faq-hit) {
        display: inline-block;
        padding: 0 0.18em;
        border-radius: 6px;
        background: rgba(255, 214, 10, 0.28);
    }

    @media (max-width: 860px) {
        .legal-page {
            margin-top: 1.8rem;
            padding: 0.95rem 0.9rem 2.5rem;
        }

        .faq-header__inner {
            padding: 0;
        }

        .faq-hero {
            grid-template-columns: 1fr;
            padding: 1rem;
            border-radius: 20px;
        }

        .faq-hero__stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .faq-section {
            margin-top: 0.15rem;
        }

        .faq-section summary {
            padding: 0.9rem 3rem 0.9rem 0.9rem;
        }

        .faq-section p {
            padding: 0 0.9rem 0.95rem;
        }
    }

    html.dark-mode .faq-hero {
        border-color: color-mix(in srgb, rgba(99, 102, 241, 0.18) 46%, var(--border-color) 54%);
        box-shadow: 0 20px 44px rgba(2, 6, 23, 0.34);
    }

    html.dark-mode .faq-hero {
        background:
            radial-gradient(circle at top right, rgba(129, 140, 248, 0.18), transparent 36%),
            linear-gradient(180deg, rgba(11, 20, 48, 0.96), rgba(7, 11, 24, 0.98));
    }

    html.dark-mode .faq-stat,
    html.dark-mode .faq-filter-button,
    html.dark-mode .faq-section details {
        background: color-mix(in srgb, rgba(11, 20, 48, 0.96) 88%, rgba(129, 140, 248, 0.08) 12%);
        border-color: color-mix(in srgb, rgba(99, 102, 241, 0.2) 40%, var(--border-color) 60%);
    }

    html.dark-mode .faq-filter-button.active {
        background:
            radial-gradient(circle at top right, rgba(129, 140, 248, 0.16), transparent 40%),
            linear-gradient(180deg, rgba(11, 20, 48, 0.98), rgba(16, 24, 40, 0.98));
    }

    html.dark-mode .faq-filter-button__icon,
    html.dark-mode .faq-section summary::after,
    html.dark-mode .faq-kicker {
        background: rgba(129, 140, 248, 0.18);
        color: #dbeafe;
    }

    html.dark-mode .faq-no-results {
        background: color-mix(in srgb, rgba(245, 158, 11, 0.12) 36%, rgba(11, 20, 48, 0.88) 64%);
    }
</style>
