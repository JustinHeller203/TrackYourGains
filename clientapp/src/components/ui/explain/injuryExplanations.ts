export type InjuryExplanation = {
    title: string
    kicker: string
    summary: string
    causes: string[]
    types: string[]
    signs: string[]
    action: string
    todayActions?: string[]
    avoid?: string[]
    seeDoctorWhen?: string[]
    returnCriteria?: string[]
}

const genericByGroup: Record<string, InjuryExplanation> = {
    bruch: {
        title: 'Bruch (Fraktur)',
        kicker: 'Grundlagen',
        summary: 'Ein Bruch ist ein Riss oder eine vollständige Unterbrechung eines Knochens. Typisch sind Unfall, Sturz oder starke Verdrehung.',
        causes: [
            'Akut: Sturz, direkter Schlag, Verdrehung unter Last.',
            'Indirekt: Kraft wirkt über ein Gelenk auf den Knochen (z. B. Umknicken).',
            'Überlastung: wiederholte hohe Belastung kann zu Stressfrakturen führen.',
        ],
        types: [
            'Geschlossen oder offen (mit Hautverletzung).',
            'Stabil oder verschoben (disloziert).',
            'Bruchlinien: quer, schräg, spiralig oder mehrteilig.',
        ],
        signs: [
            'Starker, punktueller Schmerz; Belastung oft kaum möglich.',
            'Schwellung, Bluterguss, deutlicher Druckschmerz.',
            'Warnzeichen: Fehlstellung, Taubheit, Instabilität, offene Wunde.',
        ],
        action: 'Sofort entlasten und ruhigstellen. Bei Fehlstellung, Taubheit, offener Wunde oder starker Schwellung umgehend ärztlich/notfallmäßig abklären.',
    },
    zerrung: {
        title: 'Zerrung',
        kicker: 'Grundlagen',
        summary: 'Eine Zerrung ist eine Überdehnung von Muskel- oder Sehnenfasern ohne kompletten Riss.',
        causes: [
            'Schneller Richtungswechsel, abruptes Beschleunigen oder Abbremsen.',
            'Zu wenig Aufwärmen oder eingeschränkte Beweglichkeit.',
            'Ermüdung und Technikverlust unter Belastung.',
        ],
        types: [
            'Leicht: ziehender Schmerz, Funktion fast erhalten.',
            'Mittel: deutlicher Schmerz, Kraft und Bewegung eingeschränkt.',
            'Abgrenzung: Beim Muskelfaserriss eher plötzlicher Stich und klarer Kraftverlust.',
        ],
        signs: [
            'Ziehender Schmerz bei Bewegung oder Dehnung.',
            'Lokaler Druckschmerz, evtl. leichte Schwellung.',
            'Belastung oft noch möglich, aber reduziert.',
        ],
        action: 'Kurzfristig entlasten statt „durchbeißen“, dann stufenweise aufbauen. Bei zunehmendem Schmerz, starkem Bluterguss oder deutlichem Kraftverlust medizinisch abklären.',
    },
    prellung: {
        title: 'Prellung (Kontusion)',
        kicker: 'Grundlagen',
        summary: 'Eine Prellung ist eine stumpfe Verletzung von Gewebe, Muskel oder Knochenhaut ohne offene Wunde.',
        causes: [
            'Direkter Stoß, Schlag oder Aufprall.',
            'Kontaktverletzung im Sport oder Sturz auf harte Fläche.',
            'Quetschung des Gewebes zwischen äußerer Kraft und Knochen.',
        ],
        types: [
            'Muskelprellung, Gelenkprellung oder Knochenhautprellung.',
            'Leicht bis stark, je nach Tiefe und Ausmaß des Blutergusses.',
            'Gelenkprellungen können die Bewegung deutlich einschränken.',
        ],
        signs: [
            'Lokaler Schmerz und Druckempfindlichkeit.',
            'Schwellung und oft sichtbarer Bluterguss.',
            'Bewegung schmerzhaft, grundsätzlich aber meist möglich.',
        ],
        action: 'Früh entlasten, kühlen und Belastung reduzieren. Bei starker Schwellung, sehr starken Schmerzen oder fehlender Besserung ärztlich kontrollieren.',
    },
}

const specificByKey: Record<string, InjuryExplanation> = {
    impingement: {
        title: 'Impingement (meist Schulter)',
        kicker: 'Spezifisch',
        summary: 'Beim Schulter-Impingement werden Sehnen oder Schleimbeutel unter dem Schulterdach eingeengt. Beschwerden treten oft bei Überkopfbewegungen auf.',
        causes: [
            'Häufige Überkopfbelastung (z. B. Drücken, Werfen, Schwimmen).',
            'Schwäche oder schlechte Ansteuerung von Rotatorenmanschette und Schulterblattmuskeln.',
            'Zu schnelle Steigerung von Trainingsvolumen bei zu wenig Regeneration.',
        ],
        types: [
            'Subakromial: klassische Form unter dem Schulterdach.',
            'Intern: häufiger bei Wurf- und Überkopfsportarten.',
            'Funktionell (muskulär/koordiniert) oder strukturell (anatomische Enge).',
        ],
        signs: [
            'Schmerz beim seitlichen Anheben oder über Kopf, oft im mittleren Bewegungsbereich.',
            'Nachtschmerz möglich, v. a. beim Liegen auf der betroffenen Seite.',
            'Belastbarkeit und Kraftgefühl beim Heben/Drücken reduziert.',
        ],
        action: 'Schmerzhafte Winkel vorübergehend reduzieren, Technik und Schulterblattkontrolle verbessern, dann schrittweise aufbauen. Bei Beschwerden über mehrere Wochen orthopädisch/physiotherapeutisch abklären.',
    },
    'hws-distorsion': {
        title: 'HWS-Distorsion',
        kicker: 'Spezifisch',
        summary: 'Eine HWS-Distorsion ist eine Überdehnung der Strukturen im Halsbereich (Bänder, Muskeln, Kapseln), oft nach ruckartiger Bewegung.',
        causes: [
            'Plötzliche Beschleunigung/Abbremsung (z. B. Schleudermechanismus).',
            'Sturz oder ruckartige Kopfbewegung unter Last.',
            'Direktes Trauma im Nackenbereich.',
        ],
        types: [
            'Leicht: vor allem muskuläre Reizung.',
            'Mittel: deutliche Bewegungseinschränkung und Kopfschmerz.',
            'Schwer: neurologische Symptome oder strukturelle Begleitverletzung.',
        ],
        signs: [
            'Nackenschmerz, Steifigkeit, Bewegung eingeschränkt.',
            'Kopfschmerz oder Schwindel können auftreten.',
            'Warnzeichen: Taubheit, Kribbeln, Kraftverlust in Arm/Hand.',
        ],
        action: 'Früh funktionell und kontrolliert bewegen, starke Belastung vermeiden. Bei neurologischen Symptomen oder anhaltend starken Beschwerden zügig ärztlich abklären.',
    },
    bandscheibenreizung: {
        title: 'Bandscheibenreizung',
        kicker: 'Spezifisch',
        summary: 'Eine Bandscheibenreizung ist eine schmerzhafte Überlastungsreaktion der Bandscheibe und umliegender Strukturen.',
        causes: [
            'Hohe oder wiederholte Beuge-/Rotationsbelastung.',
            'Langes Sitzen plus plötzliche Lastspitzen.',
            'Zu schneller Trainingsanstieg bei geringer Rumpfkontrolle.',
        ],
        types: [
            'Lokal ohne Ausstrahlung.',
            'Mit ausstrahlendem Schmerz in Gesäß/Bein oder Arm.',
            'Mit/ohne neurologische Reizung.',
        ],
        signs: [
            'Schmerz bei Beugen, Heben, längerem Sitzen.',
            'Morgendliche Steifigkeit oder Schutzspannung.',
            'Warnzeichen: Taubheit, Muskelschwäche, Blasen-/Darmprobleme.',
        ],
        action: 'Belastung steuern, Rücken nicht komplett ruhigstellen, sondern dosiert bewegen. Bei neurologischen Warnzeichen oder starken anhaltenden Beschwerden sofort medizinisch klären.',
    },
    luxation: {
        title: 'Luxation (Ausrenkung)',
        kicker: 'Spezifisch',
        summary: 'Eine Luxation ist das vollständige Ausrenken eines Gelenks, bei dem die Gelenkflächen nicht mehr korrekt aufeinander stehen.',
        causes: [
            'Sturz auf Arm/Schulter oder direktes Trauma.',
            'Hohe Hebelkräfte in ungünstiger Gelenkstellung.',
            'Vorverletzungen erhöhen das Risiko für erneute Luxation.',
        ],
        types: [
            'Akute Erstluxation.',
            'Rezidivluxation (wiederholt).',
            'Mit oder ohne Begleitverletzung (Bänder, Labrum, Knochen).',
        ],
        signs: [
            'Plötzlicher starker Schmerz und deutliche Fehlstellung.',
            'Bewegung kaum möglich, Schutzhaltung.',
            'Warnzeichen: Taubheit, Durchblutungsstörung, starke Instabilität.',
        ],
        action: 'Nicht selbst „einrenken“. Gelenk ruhigstellen und umgehend notfallmäßig abklären lassen.',
    },
    sehnenansatzreizung: {
        title: 'Sehnenansatzreizung',
        kicker: 'Spezifisch',
        summary: 'Hier ist der Übergang von Sehne zu Knochen gereizt. Typisch sind belastungsabhängige, punktuelle Schmerzen.',
        causes: [
            'Wiederholte Zugbelastung am gleichen Ansatz.',
            'Zu schnelle Steigerung von Volumen oder Intensität.',
            'Ungünstige Technik oder fehlende Regeneration.',
        ],
        types: [
            'Akut reizbedingt.',
            'Subakut mit wiederkehrenden Beschwerden.',
            'Chronisch mit anhaltender Reizbarkeit.',
        ],
        signs: [
            'Punktueller Schmerz am Knochenansatz.',
            'Mehr Schmerz bei Belastungsstart oder nach Belastung.',
            'Druck auf den Ansatz ist deutlich schmerzhaft.',
        ],
        action: 'Last reduzieren und gezielt aufbauen (isometrisch/exzentrisch je nach Verlauf). Bei längerem Verlauf Belastungssteuerung und Technik professionell prüfen lassen.',
    },
    bandverletzung: {
        title: 'Bandverletzung',
        kicker: 'Spezifisch',
        summary: 'Bei einer Bandverletzung sind stabilisierende Bänder überdehnt oder teilweise/komplett eingerissen.',
        causes: [
            'Umknicken, Verdrehung oder abruptes Abstoppen.',
            'Kontakttrauma oder Sturz.',
            'Vorherige Instabilität im betroffenen Gelenk.',
        ],
        types: [
            'Grad I: Überdehnung.',
            'Grad II: Teilriss.',
            'Grad III: kompletter Riss mit deutlicher Instabilität.',
        ],
        signs: [
            'Schmerz, Schwellung, Bluterguss.',
            'Unsicherheitsgefühl oder „Wegknicken“.',
            'Belastung je nach Schwere deutlich eingeschränkt.',
        ],
        action: 'Akut entlasten, kühlen und Stabilität schützen. Bei Instabilität, deutlichem Hämatom oder fehlender Belastbarkeit ärztlich untersuchen lassen.',
    },
    muskelzerrung: {
        title: 'Muskelzerrung',
        kicker: 'Spezifisch',
        summary: 'Muskelzerrung ist eine lokale Überdehnung von Muskelfasern ohne kompletten Riss.',
        causes: [
            'Explosive Bewegungen ohne ausreichende Vorbereitung.',
            'Ermüdung oder Beweglichkeitsdefizite.',
            'Plötzlicher Lastwechsel im Training oder Sprint.',
        ],
        types: [
            'Leicht: kurze Reizung, geringe Funktionseinschränkung.',
            'Mittel: anhaltender Schmerz bei aktiver Spannung.',
            'Abgrenzung: Bei Muskelfaserriss meist stärkerer Stich plus Bluterguss.',
        ],
        signs: [
            'Ziehender Schmerz bei Aktivität und Dehnung.',
            'Lokale Verhärtung möglich.',
            'Belastung reduziert, aber oft noch möglich.',
        ],
        action: 'Früh entlasten und dann progressiv zurück zur Belastung. Bei zunehmender Schwellung, Hämatom oder Kraftverlust ärztlich prüfen.',
    },
    verstauchung: {
        title: 'Verstauchung',
        kicker: 'Spezifisch',
        summary: 'Eine Verstauchung ist eine Kapsel-Band-Verletzung durch Verdrehung eines Gelenks ohne komplette Ausrenkung.',
        causes: [
            'Umknicken oder Verdrehung in Endstellung.',
            'Sturz oder Landung auf instabilem Untergrund.',
            'Muskuläre Ermüdung und schlechte Gelenkkontrolle.',
        ],
        types: [
            'Leicht: Überdehnung.',
            'Mittel: Teilrissanteile.',
            'Schwer: Übergang zu relevanter Bandverletzung.',
        ],
        signs: [
            'Akuter Schmerz im Gelenk, oft mit Schwellung.',
            'Belastung schmerzhaft und unsicher.',
            'Bluterguss kann verzögert auftreten.',
        ],
        action: 'Früh schützen und belasten nach Schmerzgrenze. Bei Instabilitätsgefühl oder deutlicher Schwellung strukturell abklären.',
    },
    sehnenentzuendung: {
        title: 'Sehnenentzündung',
        kicker: 'Spezifisch',
        summary: 'Eine Sehnenentzündung ist eine schmerzhafte Überlastungsreaktion im Sehnengewebe oder in der Sehnenscheide.',
        causes: [
            'Monotone Wiederholungen mit hoher Frequenz.',
            'Technikfehler oder ungewohnte Last.',
            'Zu wenig Erholung zwischen Belastungen.',
        ],
        types: [
            'Tendinopathie (degenerativ-reizbedingt).',
            'Tenosynovitis (Sehnenscheidenreizung).',
            'Akut oder chronisch rezidivierend.',
        ],
        signs: [
            'Schmerz bei Zug auf die Sehne.',
            'Morgensteifigkeit oder Anlaufschmerz.',
            'Druckschmerz entlang der Sehne.',
        ],
        action: 'Last reduzieren, dann gezielt dosiert aufbauen. Bei anhaltenden Beschwerden über mehrere Wochen Therapieplan mit Physio/Arzt abstimmen.',
    },
    bandriss: {
        title: 'Bänderriss',
        kicker: 'Spezifisch',
        summary: 'Ein Bänderriss ist ein kompletter Riss eines stabilisierenden Bandes im Gelenk.',
        causes: [
            'Starkes Umknicken oder Verdrehen.',
            'Kontakttrauma oder abruptes Abstoppen.',
            'Vorinstabilität und unzureichende muskuläre Führung.',
        ],
        types: [
            'Isolierter Riss eines Bandes.',
            'Kombinationsverletzung mit Kapsel/Knorpel/Meniskus.',
            'Akut oder chronisch instabil nach unzureichender Heilung.',
        ],
        signs: [
            'Plötzlicher Schmerz mit schnellem Anschwellen.',
            'Hämatom und Instabilitätsgefühl.',
            'Belastung oft deutlich reduziert.',
        ],
        action: 'Früh schützen/stabilisieren und ärztlich abklären, um Ausmaß und Reha-Plan festzulegen.',
    },
    muskelfaserriss: {
        title: 'Muskelfaserriss',
        kicker: 'Spezifisch',
        summary: 'Beim Muskelfaserriss reißen einzelne Muskelfasern oder Faserbündel durch hohe Zugbelastung.',
        causes: [
            'Explosive Belastung bei unzureichender Vorbereitung.',
            'Ermüdung und hoher Zug in gedehnter Position.',
            'Vorherige Zerrung oder unvollständige Ausheilung.',
        ],
        types: [
            'Kleiner Faserriss.',
            'Faserbündelriss.',
            'Teilruptur größerer Muskelanteile.',
        ],
        signs: [
            'Plötzlicher stechender Schmerz („wie Peitschenhieb“).',
            'Rasche Funktionsminderung und häufig Bluterguss.',
            'Druckschmerz an klar lokalisierbarer Stelle.',
        ],
        action: 'Belastung sofort stoppen, frühzeitig diagnostisch abklären und anschließend strukturiert rehabilitieren.',
    },
    rippenbruch: {
        title: 'Rippenbruch',
        kicker: 'Spezifisch',
        summary: 'Ein Rippenbruch ist ein Bruch einer oder mehrerer Rippen, meist nach direktem Thoraxtrauma.',
        causes: [
            'Sturz oder Schlag auf den Brustkorb.',
            'Kompressionstrauma, seltener starkes Husten bei Vorschädigung.',
            'Sportkontakt mit direkter Krafteinwirkung.',
        ],
        types: [
            'Einzelrippe oder Serienfraktur.',
            'Nicht verschoben oder verschoben.',
            'Mit/ohne Begleitverletzung von Lunge/Pleura.',
        ],
        signs: [
            'Atemabhängiger stechender Schmerz.',
            'Druckschmerz über der betroffenen Rippe.',
            'Warnzeichen: Atemnot, zunehmende Schmerzen, Blaufärbung.',
        ],
        action: 'Atemarbeit erhalten, aber Belastung vermeiden. Bei Atemnot, Unfallmechanismus oder starken Schmerzen umgehend ärztlich abklären.',
    },
    adduktorenzerrung: {
        title: 'Adduktorenzerrung',
        kicker: 'Spezifisch',
        summary: 'Überdehnung der Innenseitenmuskulatur des Oberschenkels, häufig bei Richtungswechseln oder weitem Ausfallschritt.',
        causes: [
            'Schnelle seitliche Richtungswechsel.',
            'Abruptes Spreizen unter Last.',
            'Ungenügende Hüftstabilität und Ermüdung.',
        ],
        types: [
            'Leichte Überdehnung.',
            'Ausgeprägte Zerrung mit deutlicher Funktionseinschränkung.',
            'Abgrenzung zum Faserriss bei stärkerem Stich/Bluterguss.',
        ],
        signs: [
            'Schmerz in der Leiste/Oberschenkelinnenseite.',
            'Schmerz bei Heranziehen des Beins gegen Widerstand.',
            'Druckschmerz am Muskelverlauf oder Ansatz.',
        ],
        action: 'Belastung reduzieren, kontrolliert mobilisieren und adduktorenspezifisch aufbauen. Bei anhaltender Leistenproblematik gezielt abklären.',
    },
    schleimbeutel: {
        title: 'Schleimbeutelreizung (Bursitis)',
        kicker: 'Spezifisch',
        summary: 'Eine Schleimbeutelreizung ist eine entzündliche Reaktion eines „Gleitkissens“ zwischen Sehne, Muskel und Knochen.',
        causes: [
            'Wiederholter Druck oder Reibung am Gelenk.',
            'Überlastung bei ungewohntem Trainingsvolumen.',
            'Fehlbelastung und muskuläre Dysbalance.',
        ],
        types: [
            'Akut reizbedingt.',
            'Chronisch wiederkehrend.',
            'Seltener infektiös (dann andere Warnzeichen).',
        ],
        signs: [
            'Lokaler Schmerz, oft druckempfindlich.',
            'Schwellung/Wärme am betroffenen Bereich.',
            'Schmerz bei bestimmten Bewegungswinkeln.',
        ],
        action: 'Druck und Reibung reduzieren, Belastung anpassen. Bei starker Rötung, Wärme oder Ruheschmerz medizinisch abklären.',
    },
    meniskus: {
        title: 'Meniskusverletzung',
        kicker: 'Spezifisch',
        summary: 'Der Meniskus ist ein Knorpelpuffer im Knie. Verletzungen entstehen häufig durch Drehbewegungen unter Last.',
        causes: [
            'Verdrehung des Knies bei fixiertem Fuß.',
            'Tiefe Beugepositionen unter Last.',
            'Degenerative Vorschäden plus Belastungsspitze.',
        ],
        types: [
            'Akuter traumatischer Riss.',
            'Degenerativer Riss.',
            'Stabile oder instabile Rissformen.',
        ],
        signs: [
            'Gelenkspalt-Schmerz und Belastungsschmerz.',
            'Blockierungs- oder Schnappphänomene möglich.',
            'Schwellung/Erguss nach Belastung.',
        ],
        action: 'Belastung und tiefe Beugewinkel zunächst reduzieren. Bei Blockadegefühl, Erguss oder Instabilität orthopädisch abklären.',
    },
    patellaspitze: {
        title: 'Patellaspitzensyndrom',
        kicker: 'Spezifisch',
        summary: 'Überlastungsbeschwerde der Patellasehne unterhalb der Kniescheibe („Jumper’s Knee“).',
        causes: [
            'Häufige Sprung-/Landebelastung.',
            'Zu schnelle Laststeigerung bei Kniebeuge-/Sprungtraining.',
            'Ungünstige Lastverteilung (z. B. Hüfte/Rumpf nicht ausreichend beteiligt).',
        ],
        types: [
            'Frühstadium: Schmerz nach Belastung.',
            'Mittel: Schmerz während und nach Belastung.',
            'Spätstadium: anhaltende Reizbarkeit mit Leistungsabfall.',
        ],
        signs: [
            'Punktueller Schmerz an der Patellaspitze.',
            'Mehr Schmerz bei Springen, Landen, Treppen, tiefen Kniebeugen.',
            'Anlaufschmerz möglich.',
        ],
        action: 'Belastung gezielt dosieren statt komplett pausieren. Progressiver Sehnenaufbau und Technikoptimierung sind zentral.',
    },
    'shin-splints': {
        title: 'Shin Splints (Schienbeinkantensyndrom)',
        kicker: 'Spezifisch',
        summary: 'Belastungsbedingter Schmerz an der Schienbeinkante, meist durch Überlastung von Knochenhaut und umgebenden Strukturen.',
        causes: [
            'Sprunghafter Anstieg von Laufumfang oder Intensität.',
            'Harter Untergrund, ungeeignetes Schuhwerk, Technikfaktoren.',
            'Ungenügende Erholung und hohe Wiederholungsbelastung.',
        ],
        types: [
            'Früh: Schmerz nur während/nach Belastung.',
            'Fortgeschritten: Schmerz auch bei Alltagsbelastung.',
            'Abgrenzung zur Stressfraktur bei punktuell starkem Knochenschmerz.',
        ],
        signs: [
            'Ziehender Schmerz entlang der Schienbeinkante.',
            'Druckschmerz über längeren Bereich.',
            'Belastbarkeit nimmt bei Lauf-/Sprungreizen ab.',
        ],
        action: 'Lauf- und Sprunglast deutlich steuern, schrittweise zurück aufbauen. Bei stark lokalisiertem Knochenschmerz Frakturdiagnostik erwägen.',
    },
    distorsion: {
        title: 'Distorsion',
        kicker: 'Spezifisch',
        summary: 'Distorsion bedeutet Verdrehverletzung eines Gelenks mit Reizung von Kapsel und Bändern.',
        causes: [
            'Umknicken, Verdrehen, Fehltritt.',
            'Landung in instabiler Stellung.',
            'Kontakttrauma.',
        ],
        types: [
            'Leicht: Kapsel-/Bandüberdehnung.',
            'Mittel: Teilrisse möglich.',
            'Schwer: Übergang zu relevanter Bandverletzung/Bandriss.',
        ],
        signs: [
            'Akuter Gelenkschmerz mit Schwellung.',
            'Belastung und Stabilität vermindert.',
            'Hämatom kann nach Stunden auftreten.',
        ],
        action: 'Akut schützen, entlasten und Verlauf beobachten. Bei Instabilität, starker Schwellung oder hoher Schmerzintensität strukturell abklären.',
    },
    plantarfaszie: {
        title: 'Plantarfaszienreizung',
        kicker: 'Spezifisch',
        summary: 'Reizung der Sehnenplatte an der Fußsohle, häufig nahe der Ferse.',
        causes: [
            'Hohe Lauf-/Sprungbelastung oder viele Schritte auf hartem Untergrund.',
            'Eingeschränkte Wadenbeweglichkeit.',
            'Überlastung bei schneller Trainingssteigerung.',
        ],
        types: [
            'Frühe Reizung ohne strukturellen Schaden.',
            'Persistierende Reizung mit hoher Morgensteifigkeit.',
            'Selten Teilruptur bei starker Vorschädigung.',
        ],
        signs: [
            'Anlaufschmerz morgens an der Ferse/Fußsohle.',
            'Druckschmerz am Fersenansatz.',
            'Schmerz nach längerer Belastung oder langem Stehen.',
        ],
        action: 'Belastung anpassen, Waden-/Fußmuskulatur gezielt aufbauen und Last progressiv steuern.',
    },
    gehirnerschuetterung: {
        title: 'Gehirnerschütterung',
        kicker: 'Spezifisch',
        summary: 'Funktionelle Störung des Gehirns nach Kopf- oder Beschleunigungstrauma, auch ohne sichtbare Verletzung.',
        causes: [
            'Direkter Schlag auf den Kopf.',
            'Sturz mit Kopfaufprall.',
            'Starke Beschleunigung/Abbremsung des Kopfes.',
        ],
        types: [
            'Leicht mit kurzer Symptomdauer.',
            'Persistierend mit länger anhaltenden Symptomen.',
            'Mit/ohne Bewusstseinsverlust.',
        ],
        signs: [
            'Kopfschmerz, Schwindel, Übelkeit, Konzentrationsprobleme.',
            'Licht-/Lärmempfindlichkeit, Benommenheit.',
            'Warnzeichen: Erbrechen, zunehmende Schläfrigkeit, neurologische Ausfälle.',
        ],
        action: 'Sofort Belastung stoppen und ärztlich beurteilen lassen. Stufenweiser Return erst nach Beschwerdefreiheit und Freigabe.',
    },
    platzwunde: {
        title: 'Platzwunde',
        kicker: 'Spezifisch',
        summary: 'Eine Platzwunde ist eine aufgerissene Hautverletzung durch stumpfe Gewalt, häufig am Kopf.',
        causes: [
            'Sturz auf harte Kante.',
            'Direkter Schlag mit stumpfem Gegenstand.',
            'Kontaktunfall.',
        ],
        types: [
            'Oberflächlich.',
            'Tiefer mit klaffendem Wundrand.',
            'Mit/ohne Begleitverletzung (z. B. Schädeltrauma).',
        ],
        signs: [
            'Sichtbare Wunde, häufig starke Blutung.',
            'Lokaler Schmerz und Schwellung.',
            'Am Kopf: auf Zeichen einer Gehirnerschütterung achten.',
        ],
        action: 'Wunde komprimieren, reinigen lassen und ärztlich versorgen (ggf. Nähen/Klammern, Tetanusschutz prüfen).',
    },
    facettensyndrom: {
        title: 'Facettensyndrom',
        kicker: 'Spezifisch',
        summary: 'Reizung der kleinen Wirbelgelenke im Rücken, oft belastungs- und positionsabhängig.',
        causes: [
            'Wiederholte Streck-/Rotationsbelastung.',
            'Langes statisches Sitzen und geringe Rumpfkontrolle.',
            'Überlastung bei ungewohnter Rückenarbeit.',
        ],
        types: [
            'Akute Reizung.',
            'Wiederkehrende episodische Beschwerden.',
            'Chronische Reizbarkeit mit Belastungssensitivität.',
        ],
        signs: [
            'Lokaler Rückenschmerz nahe der Wirbelsäule.',
            'Schmerz häufig bei Rückbeuge und Rotation.',
            'Selten klare neurologische Ausfälle.',
        ],
        action: 'Belastung dosieren, Rumpfkontrolle und Hüftbeweglichkeit verbessern. Bei anhaltendem Verlauf strukturiert abklären.',
    },
    wirbelbruch: {
        title: 'Wirbelbruch',
        kicker: 'Spezifisch',
        summary: 'Fraktur eines Wirbelkörpers oder Wirbelanteils, meist nach Trauma oder bei vorgeschädigtem Knochen.',
        causes: [
            'Sturz auf Rücken/Gesäß.',
            'Hohe axiale Last oder Unfall.',
            'Verringerte Knochendichte als Risikofaktor.',
        ],
        types: [
            'Kompressionsfraktur.',
            'Stabile vs. instabile Fraktur.',
            'Mit/ohne Beteiligung des Spinalkanals.',
        ],
        signs: [
            'Starker lokaler Rückenschmerz.',
            'Bewegung und Belastung stark eingeschränkt.',
            'Warnzeichen: Taubheit, Schwäche, Gangstörung, Blasen-/Darmprobleme.',
        ],
        action: 'Sofort medizinisch/notfallmäßig abklären, besonders bei neurologischen Symptomen oder Unfallmechanismus.',
    },
    sehnenreizung: {
        title: 'Sehnenreizung',
        kicker: 'Spezifisch',
        summary: 'Frühe überlastungsbedingte Reizung einer Sehne, meist belastungsabhängig.',
        causes: [
            'Wiederholte Zugbelastung ohne ausreichende Erholung.',
            'Volumen- oder Intensitätssprung im Training.',
            'Technikfaktoren und ungünstige Lastverteilung.',
        ],
        types: [
            'Akut reizbedingt.',
            'Subakut mit wechselnder Belastbarkeit.',
            'Übergang in chronische Tendinopathie möglich.',
        ],
        signs: [
            'Schmerz bei aktiver Sehnenbelastung.',
            'Anlaufschmerz oder Morgensteifigkeit möglich.',
            'Punktueller Druckschmerz am Sehnenverlauf/Ansatz.',
        ],
        action: 'Last temporär reduzieren, dann strukturiert progressiv steigern. Frühzeitiges Lastmanagement verbessert den Verlauf deutlich.',
    },
    sehnenverletzung: {
        title: 'Sehnenverletzung',
        kicker: 'Spezifisch',
        summary: 'Sehnenverletzungen reichen von Teilriss bis kompletter Ruptur und beeinträchtigen die Kraftübertragung.',
        causes: [
            'Plötzliche hohe Zugbelastung.',
            'Degenerative Vorschädigung der Sehne.',
            'Direktes Trauma auf den Sehnenverlauf.',
        ],
        types: [
            'Teilruptur.',
            'Komplette Ruptur.',
            'Akut traumatisch oder degenerativ vorgeschädigt.',
        ],
        signs: [
            'Plötzlicher Schmerz, oft mit Funktionsverlust.',
            'Kraft stark reduziert oder bestimmte Bewegung nicht möglich.',
            'Hämatom/Schwellung im Verlauf.',
        ],
        action: 'Frühzeitig ärztlich abklären, da Therapie und Zeitplan stark vom Rissausmaß abhängen.',
    },
}

function resolveGroupKey(injuryKeyRaw: string) {
    const key = String(injuryKeyRaw ?? '').toLowerCase().trim()
    if (!key) return ''
    if (key.includes('bruch')) return 'bruch'
    if (key.includes('zerrung')) return 'zerrung'
    if (key.includes('prellung')) return 'prellung'
    return ''
}

function createFallback(labelRaw: string): InjuryExplanation {
    const label = String(labelRaw ?? '').trim() || 'Verletzung'
    return {
        title: label,
        kicker: 'Kurzüberblick',
        summary: `${label} kann von einer Reizung bis zu einer strukturellen Verletzung reichen. Wichtig sind Verlauf, Funktion und Belastbarkeit.`,
        causes: [
            'Häufig: zu schnelle Steigerung von Volumen oder Intensität.',
            'Technikabweichung, Ermüdung und zu wenig Regeneration.',
            'Vorbelastung oder frühere Verletzung im gleichen Bereich.',
        ],
        types: [
            'Leicht: Schmerz, aber Alltag/Training noch steuerbar.',
            'Mittel: deutliche Einschränkung bei Alltag und Belastung.',
            'Schwer: klare Funktionsstörung oder Verdacht auf strukturellen Schaden.',
        ],
        signs: [
            'Belastungsabhängiger Schmerz, oft plus Druckschmerz.',
            'Beweglichkeit, Kraft oder Stabilität nehmen ab.',
            'Warnzeichen: starke Schwellung, Taubheit, Instabilität, deutliche Verschlechterung.',
        ],
        action: 'Belastung anpassen und 3-7 Tage beobachten. Bei Warnzeichen, Unfallmechanismus oder fehlender Besserung medizinisch abklären.',
    }
}

type RecoverySections = {
    todayActions: string[]
    avoid: string[]
    seeDoctorWhen: string[]
    returnCriteria: string[]
}

function buildRecoverySections(keyRaw: string): RecoverySections {
    const key = String(keyRaw ?? '').trim().toLowerCase()

    const defaults: RecoverySections = {
        todayActions: [
            'Belastung heute reduzieren, aber nicht komplett immobilisieren.',
            '2-4 kurze, schmerzarme Bewegungsfenster über den Tag einbauen.',
            'Schmerz und Funktion notieren (z. B. 0-10, was geht/nicht geht).',
        ],
        avoid: [
            'Nicht in stechenden Schmerz „hineintrainieren“.',
            'Keine abrupten Lastsprünge (Gewicht, Volumen, Intensität).',
            'Keine langen kompletten Pausen ohne kontrollierte Reaktivierung.',
        ],
        seeDoctorWhen: [
            'Wenn Schmerz oder Schwellung innerhalb von 3-7 Tagen nicht klar besser wird.',
            'Bei deutlicher Instabilität, Taubheit, Kribbeln oder Kraftverlust.',
            'Bei Unfallmechanismus mit Verdacht auf strukturellen Schaden.',
        ],
        returnCriteria: [
            'Alltagsbewegungen sind ohne deutliche Schmerzreaktion möglich.',
            'Beweglichkeit und Kraft sind im Seitenvergleich weitgehend zurück.',
            'Belastung kann 2-3 Einheiten in Folge ohne Verschlechterung gesteigert werden.',
        ],
    }

    if (key.includes('bruch') || key === 'luxation' || key === 'wirbelbruch' || key === 'rippenbruch') {
        return {
            todayActions: [
                'Betroffenen Bereich schützen und nur nach medizinischer Vorgabe belasten.',
                'Ruhigstellung/Hilfsmittel konsequent nutzen, wenn verordnet.',
                'Schmerzmanagement und Alltag so planen, dass keine Zusatztraumen entstehen.',
            ],
            avoid: [
                'Keine Eigenmanipulation (z. B. selbst einrenken).',
                'Keine Belastung gegen deutlichen Ruheschmerz.',
                'Keine Rückkehr in Sportkontakt ohne Freigabe.',
            ],
            seeDoctorWhen: [
                'Sofort bei Fehlstellung, Durchblutungsstörung, Taubheit oder offener Verletzung.',
                'Bei zunehmender Schwellung, Atemnot (v. a. Rippen) oder neurologischen Symptomen.',
                'Wenn Schmerzen trotz Schutz zunehmen statt abnehmen.',
            ],
            returnCriteria: [
                'Medizinische Freigabe liegt vor.',
                'Alltagslast und Grundbewegungen sind stabil und schmerzarm möglich.',
                'Belastungsaufbau erfolgt stufenweise und wird 1-2 Wochen stabil vertragen.',
            ],
        }
    }

    if (key === 'gehirnerschuetterung') {
        return {
            todayActions: [
                'Körperlich und kognitiv für 24-48h deutlich reduzieren.',
                'Symptome eng beobachten (Kopfschmerz, Schwindel, Übelkeit, Konzentration).',
                'Danach nur stufenweise zurück in Alltag und Training.',
            ],
            avoid: [
                'Kein intensives Training und kein Kontaktsport.',
                'Keine zweite Kopfbelastung in der Akutphase.',
                'Kein „Durchziehen“ bei neurologischen Symptomen.',
            ],
            seeDoctorWhen: [
                'Sofort bei Erbrechen, zunehmender Benommenheit, Verwirrtheit oder Ausfällen.',
                'Bei anhaltenden Symptomen über mehrere Tage.',
                'Bei jeder Unsicherheit nach Kopftrauma lieber frühzeitig abklären.',
            ],
            returnCriteria: [
                'Symptomfreiheit in Ruhe und im Alltag.',
                'Stufenplan (leicht -> moderat -> sportartspezifisch) ohne Rückfall durchlaufen.',
                'Freigabe für Kontakt-/Wettkampfbelastung liegt vor.',
            ],
        }
    }

    if (key === 'platzwunde') {
        return {
            todayActions: [
                'Wunde sauber und trocken halten, Verband wie empfohlen wechseln.',
                'Zeichen einer Infektion täglich kontrollieren.',
                'Belastung so wählen, dass kein Zug auf den Wundrand kommt.',
            ],
            avoid: [
                'Kein Kratzen/Manipulieren an Kruste oder Naht.',
                'Keine starke Reibung/Schweißbelastung auf der Wunde.',
                'Keine Trainingsreize mit Kollisionsrisiko bis Wundheilung stabil ist.',
            ],
            seeDoctorWhen: [
                'Bei zunehmender Rötung, Wärme, Eiter, Fieber oder pochendem Schmerz.',
                'Wenn die Wunde erneut aufklafft oder stark nachblutet.',
                'Bei Kopfplatzwunde plus neurologischen Symptomen sofort abklären.',
            ],
            returnCriteria: [
                'Wunde geschlossen und reizarm.',
                'Bewegung im betroffenen Bereich ohne Zugschmerz möglich.',
                'Belastung wird stufenweise gesteigert, ohne Reizung der Wunde.',
            ],
        }
    }

    if (key.includes('sehne') || key === 'patellaspitze' || key === 'plantarfaszie') {
        return {
            todayActions: [
                'Belastung auf tolerierbares Niveau senken (Schmerz währenddessen max. moderat).',
                'Gezielte, dosierte Sehnenübungen starten (z. B. isometrisch/exzentrisch).',
                'Belastungsreaktion am Folgetag prüfen und Last danach steuern.',
            ],
            avoid: [
                'Keine kompletten Sportpausen über lange Zeit ohne Reha-Reiz.',
                'Keine täglichen Maximalreize auf die gereizte Sehne.',
                'Keine sprunghaften Volumensteigerungen.',
            ],
            seeDoctorWhen: [
                'Bei Verdacht auf Teil-/Komplettriss oder akutem Funktionsverlust.',
                'Wenn nach 2-4 Wochen strukturierter Laststeuerung keine Besserung eintritt.',
                'Bei deutlicher Schwellung, Rötung oder Ruheschmerz.',
            ],
            returnCriteria: [
                'Belastung ist während und 24h nach Training gut toleriert.',
                'Krafttests und sportnahe Bewegungen sind reproduzierbar schmerzarm.',
                'Stufenaufbau über mehrere Einheiten ohne Rückfall gelungen.',
            ],
        }
    }

    if (key.includes('band') || key === 'distorsion' || key === 'verstauchung' || key === 'meniskus') {
        return {
            todayActions: [
                'Schwellung kontrollieren und Gelenk früh funktionell bewegen.',
                'Stabilität über kontrollierte Kraft- und Balanceübungen aufbauen.',
                'Belastung in geraden, kontrollierten Mustern bevorzugen.',
            ],
            avoid: [
                'Keine schnellen Richtungswechsel oder Sprunglandungen in der Frühphase.',
                'Nicht ohne Stabilitätskontrolle zurück in Pivot-/Kontaktsport.',
                'Keine wiederholten „Wegknick“-Situationen tolerieren.',
            ],
            seeDoctorWhen: [
                'Bei deutlicher Instabilität, Blockade oder rasch zunehmender Schwellung.',
                'Wenn Vollbelastung nach wenigen Tagen nicht möglich ist.',
                'Bei Verdacht auf Kombinationsverletzungen (Band + Meniskus/Knorpel).',
            ],
            returnCriteria: [
                'Stabilitätstests/Einbein-Varianten sind sicher und schmerzarm.',
                'Seitengleiche Kraft und Kontrolle sind weitgehend wiederhergestellt.',
                'Sportartspezifische Richtungswechsel sind ohne Unsicherheit möglich.',
            ],
        }
    }

    return defaults
}

export function getInjuryExplanation(injuryKeyRaw: string, labelRaw: string): InjuryExplanation {
    const key = String(injuryKeyRaw ?? '').toLowerCase().trim()
    const base = specificByKey[key]
        ?? (() => {
            const groupKey = resolveGroupKey(key)
            if (groupKey && genericByGroup[groupKey]) return genericByGroup[groupKey]
            return createFallback(labelRaw)
        })()

    return {
        ...base,
        ...buildRecoverySections(key),
    }
}

