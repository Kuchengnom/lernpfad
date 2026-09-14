# Mathe-Integration: Teilbarkeit und Primzahlen

Stand: 14.09.2026. Konkreter Implementierungsplan nach Sichtung aller sieben neuen Quellen und Prüfung der bestehenden Schemas, Lernlogik und Bibliothek. **Mathe ist damit geplant, noch nicht implementiert oder importierbar.**

## Produktumfang

Erstes Lernbuch: **Mathe · Teilbarkeit & Primzahlen**. Die Fotos belegen Teiler, positive Vielfache, Endziffern-/Quersummenregeln, gemeinsame Teiler/Vielfache, ggT, kgV und Primfaktorzerlegung. [Quelleninventar](../references/textbook/mathe/MANIFEST.md) ordnet jedes Ziel einem Foto und einer sichtbaren Seite zu.

Die erste Umsetzung umfasst diese acht Bereiche:

1. Teiler und Faktorpaare erkennen.
2. Vollständige Teilermengen bestimmen.
3. Positive Vielfache erkennen und eine begrenzte Folge bilden.
4. Endziffernregeln für 2, 4, 5, 8, 10 und 25 anwenden.
5. Quersumme bilden und Teilbarkeit durch 3/9 prüfen.
6. Gemeinsame Teiler und ggT bestimmen.
7. Gemeinsame positive Vielfache und kgV bestimmen.
8. Primzahlen erkennen und Zahlen in Primfaktoren zerlegen.

Ziel: etwa 40 eigene, kurze Aufgaben, mindestens drei pro Bereich; neue Zahlen und Formulierungen, unabhängige rechnerische Prüfung aller Lösungen. Ein Lernbuch mit Unterthemen genügt. Bekannte Lernrunden, Fehlerwiederholung, Bergzeit, Punkte, Stempel, Buchwechsel und komplette Profilsicherung gelten auch für Mathe.

Potenzen aus dem Arbeitsblatt dürfen als klar erklärte Schreibweise in Beispielen erscheinen; freie Potenzeingaben, offene Begründungen und Aufgaben mit beliebig vielen möglichen Lösungen werden im ersten Umfang nicht automatisch bewertet. Ein endlicher Auftrag wie „erste fünf positive Vielfache“ ist eindeutig. „Alle Vielfachen“ ohne Grenze ist keine auswertbare Eingabeaufgabe.

Brüche, Dezimalzahlen, Einheiten, Gleichungen, Geometrie, Handschrifterkennung und allgemeine Termauswertung sind weitere Ausbaustufen. Die vorliegenden Materialien brauchen diese Funktionen nicht. Einen allgemeinen Algebra-Parser jetzt zu bauen würde den ersten Test unnötig vergrößern.

## Drei Interaktionen

| Interaktion | Verwendung | Verbindliche Auswertung |
| --- | --- | --- |
| Bestehende Einfachauswahl `choice` | Teilbarkeit, richtige Regel, Primzahl erkennen | Genau eine richtige Option; keine Mehrfachauswahl unter demselben Typ verstecken. |
| Neue Zahleneingabe `numeric-input` | Quersumme, ggT, kgV, fehlender Faktor/Ziffer | Exakter Vergleich ganzer, nicht negativer Zahlen. Endliche alternative Lösungen ausdrücklich im Datensatz erlauben. |
| Neue Zahlenliste `number-list` | Teilermenge, erste positive Vielfache, Primfaktoren | Explizit `set`, `sequence` oder `multiset`; dadurch unterscheiden sich Reihenfolge und Wiederholungen korrekt. |

Zahlenlisten werden am Handy über einzelne Zahlenfelder mit „Zahl hinzufügen“ und „Entfernen“ eingegeben. Kein Zwang, mathematische Sonderzeichen auf der Bildschirmtastatur zu finden. Die Aufgabe benennt sichtbar, ob eine Reihenfolge nötig ist oder gleiche Faktoren mehrfach einzutragen sind. Bedienung bleibt vollständig per Tastatur möglich.

Prüfbeispiele (neu formulierte Akzeptanzfälle, keine importierbaren v1-Daten):

- Zahlwert: `004` entspricht `4`; leer, `4abc`, `4.5`, `4,5`, `2+2`, `4/1` und Exponentialschreibweise erhalten einen Eingabehinweis, keinen Fehlversuch.
- Fehlende Ziffer: mehrere gültige Ziffern werden als vollständige endliche Lösungsmenge hinterlegt; nicht nur die erste richtige Zahl akzeptieren.
- Menge: die Teiler von 14 sind `1, 2, 7, 14`, jede Reihenfolge zählt; zusätzliche oder fehlende Zahlen sind falsch, Dopplungen werden vor dem Bewerten als Eingabeproblem erklärt.
- Folge: erste fünf **positive** Vielfache von 4 sind `4, 8, 12, 16, 20`; hier zählt die Reihenfolge und 0 gehört nicht dazu.
- Multimenge: die Primfaktoren von 28 sind `2, 2, 7`; `7, 2, 2` zählt ebenfalls, `4, 7` und `2, 7` nicht. Wiederholte Primfaktoren müssen erhalten bleiben.
- 1 ist keine Primzahl. Primfaktoraufträge verwenden Zahlen ab 2. ggT/kgV-Aufträge verwenden positive ganze Zahlen; der Null-Sonderfall bleibt außerhalb dieses Lernbuchs.

Begrenzter Parser: maximal 32 Eingabezeichen je Feld, nur Ziffern nach äußerem Trimmen, Wert 0–999999; höchstens 20 Listeneinträge. Erst Grammatik und Länge prüfen, dann umwandeln. Kein `eval`, `Function`, HTML, Import-Code, Rundung oder toleranter Sprach-Stringvergleich. Ungültige Syntax verändert weder Lernstand noch Versuchsanzahl; eine gültige falsche Zahl wird normal als Fehler aufgezeichnet. Nur Ergebnisdaten werden gespeichert, keine Rohantworten oder Listenentwürfe — auch nicht beim Neuladen oder im Profilsicherungsexport.

Dieselben Grenzen gelten für die Autorenlösungen: `acceptedValues` und `expectedValues` vor dem Import prüfen. Vollständige Teilermengen mit mehr als 20 Einträgen und kgV-Ergebnisse über 999999 sind in diesem Umfang unzulässig; das Fixture muss mit der angebotenen Eingabe vollständig beantwortbar sein. Vor Mengenprüfung kanonisieren: `02` und `2` sind dieselbe Zahl, bei `set` also doppelt, bei `multiset` zwei erhaltene Faktoren. Leere Listen/Zwischenfelder, nur Leerzeichen, 21 Einträge sowie 0/999999/1000000 bekommen eigene Grenztests.

## Versionierter Datenvertrag

Die existierenden Sprachdateien werden nicht nachträglich umgeschrieben. `previewBookImport` schützt identische Kurs-ID/Version bereits gegen veränderten Inhalt; eine automatische Ergänzung von Feldern würde diese Garantie unterlaufen.

- Neue Curriculum-/Einzelbackup-Version **2.0** mit explizitem `subject: "math"` und `instructionLanguage: "de"`. Das v2-Schema trennt Mathe und Sprache über das Fach; nur Sprache hat eine Zielsprache. Unveränderte Sprachpakete 1.0 bleiben regulär importierbar.
- Neuer Mathe-Konzepttyp `math-skill`, mit Lernziel, kurzer Regel, eigenen Beispielen, Quellverweisen und Abhängigkeiten. Keine Tarnung als Vokabel oder künstlicher Sprachcode.
- `numeric-input` erhält `numberDomain: "nonnegative-integer"` und `acceptedValues` als begrenzte Liste kanonischer Ziffernstrings. `number-list` erhält denselben Zahlenbereich, `comparison: "set" | "sequence" | "multiset"` und `expectedValues`. Die genaue Schemafassung wird vor der UI implementiert und mit Gegenbeispielen validiert.
- **Profilversion 2.0** kann alte Sprachbücher und neue Mathebücher gemeinsam speichern. Reine, getestete Konvertierung von Profil 1.0; erst nach vollständiger Prüfung atomar schreiben. Alte Einzel-Workspaces und Profil-Backups bleiben lesbar. Unbekannte zukünftige Versionen ohne Schreibzugriff ablehnen.
- `learner-state.v1` bleibt verwendbar: seine Antwortereignisse, Konzeptstände und Rundenabschlüsse sind fachneutral. Kurs-ID und Inhaltsversion binden weiterhin die Ergebnisse.
- Kurs- und **gespeicherte Aufgabenreferenzen einer pausierten Runde** im Profilschema gemeinsam erweitern. Ein neues Mathebuch darf nicht erst nach der ersten Antwort beim Speichern scheitern.
- Gemeinsamen Antwortformatter aus den bisherigen Duplikaten in `main.js` und `profile.js` ziehen. Sofortiges Feedback und nach Neuladen rekonstruiertes Feedback müssen dieselbe richtige Zahl/Liste anzeigen.
- Import, Curriculum-Export, Einzelbackup und Wiederherstellung wählen den tatsächlichen Vertragsstand ausdrücklich aus; das bisher in `curriculumPackage()` fest eingetragene `1.0` darf nicht auf Mathe übertragen werden. Unveränderte Sprachkurse behalten ihren v1-Vertrag auch innerhalb eines v2-Profils.
- Ganze Profilsicherungen behalten Bücher und Stempel. Ein älterer App-Build kann v2 nicht lesen; vor Migration bleibt die bisherige Sicherung der Rückweg. Kein stilles Herabstufen von v2-Dateien.

Später können rationale Zahlen einen eigenen Zahlenbereich mit exaktem Bruchvergleich bekommen. „Gleicher Wert“ und „geforderte Darstellung“ müssen dann getrennt werden: 2/4 ist wertgleich zu 1/2, aber keine vollständig gekürzte Antwort. Das ist kein Teil des aktuellen Zahlenbereichs.

## Lernbuch und Autorenworkflow

In der Anleitung zuerst Fach auswählen: **Sprachen** oder **Mathematik**. Bei Sprache folgt wie bisher Französisch/Englisch; bei Mathe lautet das Angebot zunächst „Teilbarkeit & Primzahlen“. Ein eigener Mathe-Prompt enthält das passende vollständige Schema. Er fordert direkt kopierbares JSON, belegten Titel/Seiten, stabile IDs, Aufgabenregeln, vollständige alternative Lösungen und Originalaufgaben. Handschriftliche Bearbeitungen werden ausdrücklich als Schülerantworten behandelt und unabhängig nachgerechnet. Fehlende Seite 2 wird dokumentiert, nicht ergänzt.

In der App Fachbezeichnungen zentral ableiten: Buchkarte „Mathematik“, Startseite „Zahlen und Regeln“, passende Lernbuch-Suche/Filter und Importvorschau. Mathe erhält keine Anzeige „Deutsch → Französisch“. Die bestehende lokale Geräte-Sprachausgabe bleibt optional; Vorlesen mathematischer Symbolfolgen ist keine Voraussetzung für diesen Meilenstein.

Für den eigenen Testdatensatz werden Ergebnisse und Ablenker mit unabhängigen kleinen Rechenfunktionen geprüft: Divisorenenumeration, Vielfachenfolge, ggT/kgV, Quersumme und Primfaktoren. Ein gültiges JSON-Schema allein bestätigt keine mathematisch richtige Musterlösung. Bei extern generierten Datensätzen bleibt deshalb die Inhaltsvorschau erforderlich.

## Umsetzung und Arbeitsteilung

1. **Verträge und Quellen:** v2-Schemata, Mathe-Prompt und Beispielaufgaben spezifizieren; Sprachkompatibilität und Bibliotheksmigration zuerst testen.
2. **Fachlogik:** reine Zahlen-/Listenprüfung, Antwortformatierung, neuer Aufgabendispatch und bestehende Ergebnis-/Wiederholungspfade. Eigene Unit-Tests mit richtigen, falschen und syntaktisch ungültigen Antworten.
3. **Bedienung:** Fachwahl im Autorenworkflow, responsive Zahlenfelder, Mengen-/Folgenhinweise und fachgerechte Texte. Keine Tabellenkopie aus dem Arbeitsheft.
4. **Echter Datensatz:** etwa 40 quellenbezogene Originalaufgaben samt separat geprüften Lösungen; Lernziele über erreichbare Voraussetzungen verbinden; die tatsächliche Erreichbarkeit aller acht Bereiche gegen den Scheduler prüfen.
5. **Integration und unabhängige QA:** Mathe-Prompt → JSON einfügen → Vorschau → Lernrunde → Fehler wiederholen → Sprache wechseln → Neuladen → komplettes Profil exportieren und auf frischem Browser wiederherstellen.

Astra übernimmt fachlichen Umfang, Versionsentscheidung, Integration und Abschluss. Ein Agent besitzt Zahlenlogik/Tests, ein zweiter Quellenfixture/Autorenprompt, ein dritter prüft Datenvertrag und fertige Abläufe unabhängig. Gemeinsame Dateien erst nach klarer Zuweisung ändern; keine parallelen Änderungen an `main.js`/`ui.js` ohne Abstimmung.

## Definition of Done

- [ ] Die drei Interaktionen decken die acht belegten Bereiche ab; alle Lösungen und Auswahloptionen des Fixtures sind unabhängig nachgerechnet.
- [ ] Mathe-Autorenprompt und Schema passen zusammen; echtes generiertes JSON gelangt über Text und Datei zur Vorschau.
- [ ] Zahlen, Mengen, Folgen und Multimengen werden nach den obigen Regeln ausgewertet. Syntaxfehler kosten keinen Versuch.
- [ ] V1-Sprachen bleiben unverändert gültig; französische Akzente und Schreib-Selbstcheck verhalten sich unverändert.
- [ ] Bestehende Einzel-Workspaces/Profile migrieren ohne Verlust; ein gemischtes Profil übersteht Buchwechsel, Fehler beim Speichern und Backup-Restore mit identischen Ergebnissen/Stempeln.
- [ ] Mathe-Antwort und Feedback bleiben nach Neuladen korrekt; Fehler kehren in der Wiederholung wieder; kein doppelter Abschluss oder Stempel.
- [ ] 320/375 px, Tastatur, sichtbarer Fokus, reduzierte Bewegung und Offline-Lernen im Produktionsbuild sind geprüft.
- [ ] Vorhandene 55 Unit- und 21 Browserchecks sowie neue Mathe-Regressionen bestehen. Erst danach Eltern-/Kind-Test mit dem ersten Mathebuch.

Ausgangspunkt verifiziert: Bibliotheksinkrement einschließlich Sprachausgabefix ist auf `main` committed (bis `73e4205`). Erneuter Produktionsbuild und 21/21 Browserabläufe am 14.09.2026 bestanden. Die visuelle Handyprüfung von Opus wurde vom Nutzer bestätigt. Mathe verändert den laufenden App-Code in dieser Planungsphase noch nicht.

Unabhängige Planprüfung: Datenvertrags-Agent bestätigt den begrenzten Umfang; dessen Ergänzungen zu Autorenlösungsgrenzen, kanonischen Mengen, Vertragsauswahl beim Export und erreichbaren Themen sind eingearbeitet. Die Quellenfotos wurden von Astra direkt geprüft; der unabhängige Agent prüfte Architektur und Abnahmekriterien.
