<!-- src/Footer/FAQ.vue -->
<template>
    <div class="legal-page">
        <header ref="headerEl" class="faq-header" :class="{ 'is-fixed': isFixed }">
            <div class="faq-header__inner">
                <h1 class="faq-title">FAQ</h1>
                <p class="faq-subtitle">
                    Schnelle Antworten zu TrackYourGains – such nach Begriffen wie „Timer“, „Export“ oder „Validierung“.
                </p>

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

        <!-- Landing -->
        <section class="faq-section" v-show="activeCategory === 'all' || activeCategory === 'landing'">
            <h2>Landingpage &amp; Start</h2>

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

        <!-- Training -->
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

        <!-- Timer & Stopwatch -->
        <section class="faq-section" v-show="activeCategory === 'all' || activeCategory === 'timers'">
            <h2>Timer &amp; Stopwatch</h2>

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

        <!-- Ernährung -->
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

        <!-- Tutorials -->
        <section class="faq-section" v-show="activeCategory === 'all' || activeCategory === 'tutorials'">
            <h2>Übungstutorials</h2>

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
        </section>

        <!-- Einstellungen -->
        <section class="faq-section" v-show="activeCategory === 'all' || activeCategory === 'settings'">
            <h2>Einstellungen</h2>

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
        </section>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
    import UiSearch from "@/components/ui/kits/UiSearch.vue";

    type CatKey = "all" | "landing" | "training" | "timers" | "nutrition" | "tutorials" | "settings";

    const categories: { key: CatKey; label: string }[] = [
        { key: "all", label: "Alle" },
        { key: "landing", label: "Landing" },
        { key: "training", label: "Training" },
        { key: "timers", label: "Timer & Stopwatch" },
        { key: "nutrition", label: "Ernährung" },
        { key: "tutorials", label: "Tutorials" },
        { key: "settings", label: "Einstellungen" },
    ];

    const activeCategory = ref < CatKey > ("all");

    const searchQuery = ref("");
    const matchCount = ref(0);

    const headerEl = ref < HTMLElement | null > (null);
    const isFixed = ref(false);
    const triggerY = ref(0);

    const getOffset = () => {
        const raw = getComputedStyle(document.documentElement).getPropertyValue("--app-header-height").trim();
        const n = Number.parseFloat(raw);
        return Number.isFinite(n) && n > 0 ? n : 64;
    };

    const updateHeaderState = () => {
        const el = headerEl.value;
        if (!el) return;

        const offset = getOffset();

        if (!isFixed.value) {
            const rect = el.getBoundingClientRect();
            triggerY.value = window.scrollY + rect.top - offset;
        }

        const shouldFix = window.scrollY >= triggerY.value;

        if (shouldFix !== isFixed.value) {
            isFixed.value = shouldFix;
        }

        const root = document.querySelector(".legal-page") as HTMLElement | null;
        if (root) {
            root.style.setProperty("--faq-header-h", isFixed.value ? `${el.offsetHeight}px` : "0px");
        }
    };

    const onScroll = () => updateHeaderState();

    const onResize = () => {
        const wasFixed = isFixed.value;
        isFixed.value = false;
        updateHeaderState();
        isFixed.value = wasFixed;
        updateHeaderState();
    };

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
        updateHeaderState();
        applyFaqFilter();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });
    });

    onUnmounted(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
    });

    watch(searchQuery, () => {
        applyFaqFilter();
    });
</script>

<style scoped>
    .legal-page {
        max-width: 800px;
        margin: 4rem auto;
        padding: 1.5rem;
        overflow: visible;
        /* Platz kompensieren wenn Header fixed wird */
        padding-top: calc(1.5rem + var(--faq-header-h, 0px));
    }

    .faq-header {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        margin-bottom: 1.25rem;
    }

    .faq-header__inner {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }

    .faq-header.is-fixed {
        position: fixed;
        left: 0;
        right: 0;
        top: var(--app-header-height, 0px);
        z-index: 50;
    }

    .faq-title {
        margin: 0;
        line-height: 1.1;
    }

    .faq-subtitle {
        margin: 0;
        opacity: 0.82;
        line-height: 1.4;
    }

    .faq-search {
        margin: 1rem 0 1.25rem;
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

    .faq-no-results {
        margin: 0 0 1.25rem;
        padding: 0.9rem 1rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        line-height: 1.4;
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

    :global(.faq-hit) {
        display: inline-block;
        padding: 0 0.18em;
        border-radius: 6px;
        background: rgba(255, 214, 10, 0.28);
    }
</style>
