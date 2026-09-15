# Übergabe — Lernpfad

Aktualisiert: 2026-09-15, vor Wiederaufnahme der Mathe-Integration.

## Verbindlicher Arbeitsmodus

Nutzeranweisung vom 15.09.2026: Astra orchestriert, spezifiziert und prüft. Alle neuen Programmieraufgaben gehen an **GPT-5.6 Luna**-Subagenten. Astra bearbeitet keine Implementierungsdateien selbst. Keine Wiedervergabe an Terra/Sol/Astra für Code ohne neue Nutzerfreigabe.

## Kontingent und Sicherung

Letzte direkte Abfrage: 3 % des Fünf-Stunden-Fensters und 33 % des Wochenfensters verbraucht. Das ist eine Momentaufnahme, keine Laufzeitgarantie. Vor jedem neuen größeren Agentenauftrag und nach jeder abgeschlossenen Arbeitsphase erneut abfragen.

- Dieses Dokument vor Beginn einer Arbeitsphase und nach jedem abgeschlossenen Teilauftrag aktualisieren.
- Bei mindestens 70 % Verbrauch: ausführlichen Zwischenstand mit offenen Dateien, Agentenzuständigkeiten, Tests und nächsten Befehlen sichern, bevor neue Arbeit startet.
- Bei mindestens 85 % Verbrauch: keine neuen umfangreichen Teilaufträge; laufende Agenten um begrenzten Abschluss und Übergabe bitten. Ungeprüfte Änderungen ausdrücklich als ungeprüft bezeichnen.
- Bei fehlender Kontingentanzeige weiterhin nach jedem Teilauftrag sichern. Ein plötzlicher Limitabbruch kann nicht zuverlässig angekündigt werden; deshalb existiert die Übergabe bereits vorher.
- Keine Usage-Reset-Credits automatisch verbrauchen.

## Verifizierte Basis

Letzter Commit: `17e3623` — reines Zahlen-/Listenmodul, 13 neue Tests. Saubere Basis davor: 55 Tests; gemeldete und geprüfte Basis danach: 68. `profile.test.js` und `speech.test.js` waren bereits committed.

Bibliothek, Stempel, Bergzeit, lokale Sprachausgabe und Eltern-Startseite sind auf main. Die letzte abgeschlossene Bibliotheksprüfung bestand 21 Browserabläufe. Mathe-Integration ist **noch nicht fertig und nicht zur Veröffentlichung freigegeben**.

## Gegenwärtige Änderungen

Unterbrochene Agenten haben bereits Änderungen hinterlassen:

- `app/numeric.js` und 13 Tests: committed, übernommen.
- Neue v2-Schemas für Curriculum, Einzelbackup und Profil; Änderungen an `app/validation.js`, `app/profile.js`, `scripts/validate.js` und Vertrags-Tests: vorhanden, Abschlussprüfung offen.
- Fachwahl, Zahlenfelder, Listenfelder und Mathe-Texte in UI-/Autorenmodulen sowie `app/math.css`: vorhanden, Abschlussprüfung offen.
- `fixtures/math-divisibility/curriculum.json`: vorhanden, Vollständigkeit und unabhängige Rechnungsprüfung offen.
- `prompts/parent-math-authoring-prompt.md`: fehlt bei Wiederaufnahme, wird aber bereits vom Autorenmodul importiert. Build daher noch nicht als funktionsfähig ansehen.
- Astra hatte vor der neuen Rollenregel Engine-Dispatch, `app/answer-format.js`, `app/math-messages.js` und Teile von `app/main.js` ergänzt. Weitere Integrationsänderungen übernimmt Luna. Prüfen: `math.css` importieren, ungültige Eingaben ohne Antwortereignis, Fachwahl/Schema-Download, v1→v2-Migrationsschreibvorgang.

## Festgelegter Mathe-Umfang

Siehe `experiment/mathe-integration.md` und `references/textbook/mathe/MANIFEST.md`.

40 Originalaufgaben, 8 Bereiche: Teiler/Faktorpaare, Teilermengen, positive Vielfache, Endziffernregeln, Quersumme/3/9, ggT, kgV, Primzahlen/Primfaktoren. Ganze Zahlen 0–999999; maximal 32 rohe Zeichen vor Trimmen, höchstens 20 Listeneinträge. Mengen verbieten kanonische Dopplungen; Folgen vergleichen Positionen und erlauben Wiederholungen; Multimengen erhalten Häufigkeiten. Keine Brüche/Algebra. Handschriftliche Schülerantworten sind keine Lösungsschlüssel.

## Nächste Schritte / Zuständigkeit

Astra vergibt drei getrennte Luna-Aufträge: Vertrags-/Migrationsabschluss, Quellenfixture/Prompt/Rechenprüfung, UI-/Zustandsintegration und Browserregressionen. Die genaue Zuweisung folgt in `tasks/todo.md` und den Agentennachrichten. Keine konkurrierenden Änderungen derselben Datei.

Manueller Einstieg:

1. `git status --short` und `git log -5 --oneline` prüfen; vorhandene Arbeit erhalten.
2. `npm test` für aktuellen Befund; Testzahl aus Ausgabe übernehmen, nicht schätzen.
3. Fehlenden Autorenprompt und `math.css`-Integration klären, dann `npm run build`.
4. `npm run validate -- fixtures/math-divisibility/curriculum.json`.
5. Nach erfolgreichem Build `npm run test:browser`; Preview nutzt Port 4173, App liegt unter `/lernen.html`.
6. Gemischtes Sprach-/Mathe-Profil mit Fehlern, Neuladen, Buchwechsel, Export und Wiederherstellung prüfen. Keine realen Browserdaten löschen.

Dieser Zwischenstand ist eine Übergabe, kein Abschlussbericht. Neue Befunde und Testergebnisse unten ergänzen, bevor der nächste größere Auftrag startet.

## Fortschritt: Verträge abgeschlossen

Luna-Vertragsagent meldet Abschluss. 28/28 gezielte Vertrags-/Profil-/Validierungstests und zu diesem Zeitpunkt 76/76 Unit-Tests bestanden; Englisch- und Mathefixture per CLI gültig. Details: `tasks/handoff-luna-contracts.md`. Build und Browserintegration noch offen. Die Testzahl wächst durch parallel ergänzte Tests und muss am Abschluss erneut aus der tatsächlichen Ausgabe gelesen werden.

Aktive Code-Zuständigkeiten: `luna_content_finish` für Fixture/Prompt/Rechenprüfung; `luna_integration_finish` für Engine/UI/main und Browserregressionen. `luna_contract_finish` ist abgeschlossen. Unabhängige Prüfung wird separat ohne konkurrierende Codeänderungen vergeben.

## Prüfauftrag aus Inhaltsreview

Kontingent bei letztem Phasenwechsel: 28 % im Fünf-Stunden-Fenster, 37 % im Wochenfenster.

Astra hat zwei Korrekturen an `luna_content_finish` zurückgegeben:

1. Der allgemeine Mathe-Autorenprompt darf keine festen Quellen-IDs/Dateinamen der sieben Demo-Fotos voraussetzen. Er muss tatsächliche Nutzerunterlagen auswerten und bei weniger Material den Umfang reduzieren. Ungültige JSON-Platzhalter im Muster entfernen.
2. Die unabhängige Rechnung für gemeinsame Vielfache darf keine kopierte Ergebnisliste sein. Erreichbarkeit zusätzlich mit echten Antwortereignissen aus einem neuen Lernstand nachweisen statt nur gesetzter Beherrschungswerte.

Das sind offene Reviewpunkte, bis der Agent die Korrekturen nachweist. Unabhängige Codeprüfung: `luna_math_review`, nur lesend.

## Vollständiger Zwischenstand — 2026-09-15, 61 % Fünf-Stunden-Verbrauch

**Der Arbeitsbaum enthält eine baubare Mathe-Integration, aber die letzte Abnahme läuft noch.** Basis-Commit weiterhin `17e3623`; die Integration ist noch nicht committed. Kein Push/Deployment dieses Arbeitsstands erfolgt.

### Abgeschlossen

- Luna-Verträge: v2-Curriculum/Backup, gemischte Profile 2.0, validierte v1-Migration, Autorenlösungsgrenzen. `tasks/handoff-luna-contracts.md`.
- Luna-Inhalte: 40 Aufgaben, 8 Konzepte, selbst nachgerechnete Schlüssel/Ablenker; adaptiver Mathe-Autorenprompt ohne feste Demo-Dateinamen und ohne ungültige Platzhalter; echte beantwortete Runden als Erreichbarkeitsnachweis. `tasks/handoff-luna-content.md`, `experiment/math-content-review.md`.
- Luna-Integration: CSS eingebunden, Zahlen-/Listenfelder, Fachwahl/Schema-Download, Fehler ohne Versuchszählung, gemeinsame Antwortformatierung, Buch-ID im Entwurfsschlüssel und neue Startseitentexte. `tasks/handoff-luna-integration.md`.
- Unabhängige lesende Luna-Prüfung: kein reproduzierbarer Implementierungsfehler. Offene Abnahmelücken bei umfassenden Mathe-Browserfällen. `tasks/handoff-luna-review.md`.

### Direkt durch Astra verifiziert

- `npm test`: **82/82 bestanden**. Ausgabe `/tmp/lernpfad-math-unit-final.txt`.
- `npm run build`: bestanden, 20 vorgehaltene Offline-Dateien.
- `npm run test:browser`: **22/22 bestanden**. Ausgabe `/tmp/lernpfad-math-browser-final.txt`.
- Neuer isolierter Prüf-Browser `lernpfad-math-review` öffnet `http://127.0.0.1:4173/lernen.html` mit dem aktuellen Build.

### Noch aktiv / konkret offen

Nur `luna_integration_finish` hat einen weiteren Programmierauftrag: zusätzliche Tests in `tests/browser/math.spec.js` für vollständige Mathe-Runde, Fehler/Wiederholung, kanonisches Feedback nach Neuladen, gemischtes Profil/Backup auf frischem Browser; außerdem set/sequence/multiset inkl. Doppelungen, Add/Remove, Fokus, 320px/Offline sowie Mathe-Autorenprompt/Paste-Import. Falls reproduzierbare Fehler auftauchen, begrenzt in den bereits zugewiesenen UI-/Engine-Dateien korrigieren. Neue Ergebnisse in `tasks/handoff-luna-integration.md` lesen.

Astra prüft parallel die gerenderte Oberfläche. Bis die erweiterten Tests bestehen, **nicht die ganze Mathe-Definition of Done abhaken**. Bisher bestanden nur ein neuer Mathe-Browserablauf plus 21 bestehende.

### Manueller Abschluss

1. Agentenstatus/Übergabe prüfen und keine Datei gleichzeitig mit einem noch aktiven Agenten bearbeiten.
2. `git diff --check`, `npm test`, `npm run build` und `npm run test:browser` ausführen; bei neuen Tests die tatsächliche Gesamtzahl übernehmen.
3. Über `Üben → Mathe-Beispiel laden → Import übernehmen` testen. Eigene Materialien: `Üben → Anleitung & Prompt → Fach Mathematik`.
4. Nach erfolgreicher Abnahme `tasks/todo.md`, `experiment/mathe-integration.md`, README/Architektur und diese Übergabe abschließen, dann Änderungen committen. Quellenfotos bleiben ignoriert und werden nicht veröffentlicht.
5. Physischer iPhone-Stimmen-/Flugmodus-Test und Eltern-/Kind-Pilot bleiben manuelle Nachprüfungen. Noch kein allgemeines Bruch-/Algebra-Angebot.

Kontingent ist eine Konto-Momentaufnahme (61 % / 42 % Woche); kein automatischer Reset. Vor weiterer großer Delegation erneut prüfen. Sollte der Thread abbrechen, ist dieser Stand die Startbasis.

## Vorrangiger Abschluss-Zwischenstand — 88 % Fünf-Stunden-Verbrauch

Die aktuelle Integration ist weiterhin uncommitted auf `17e3623`. Alle Programmieraufträge liefen nach der Rollenänderung über Luna. Keine weiteren großen Aufträge starten; dieser Abschnitt hat Vorrang vor älteren offenen/abgeschlossenen Angaben.

- Letzter vollständig grüner Integrationslauf: 82 Unit-Tests, Produktionsbuild und 22 Browsertests. Die später ergänzte `tests/browser/math.spec.js` enthält jetzt drei statt einem Fall; daher ist die aktuelle gesamte Browserdatei noch nicht grün bestätigt.
- Astra hat den isolierten Lauf gestartet: `npx playwright test tests/browser/math.spec.js --workers=1`, Log `/tmp/lernpfad-math-expanded.txt`.
- Der erste Mathe-Browserfall besteht weiterhin. Der neue Rundenfall bricht bei Bergzeit ab: Test verwendet einen nicht passenden `continue-rest`-Selektor, Sitzung ist beim Abschlussassert noch `resting`. Das ist zunächst ein Testablauffehler, kein bewiesener Appfehler. Der neue Autorenfall wird separat ausgewertet.
- Ein eng begrenzter Korrekturauftrag läuft an `luna_integration_finish`: echte Selektoren prüfen, nur diese neuen Abläufe korrigieren, einen fokussierten Lauf durchführen und `tasks/handoff-luna-integration.md` aktualisieren. Falls unterbrochen, dort und im Log beginnen.
- Noch nicht ergänzt: gezielte UI-Fälle für Mengen-Dopplungen/Multimengen/Reihenfolge, Add/Remove/Fokus, gleiche Sitzungs-ID über Buchwechsel, gemischtes Sprach-/Mathe-Profil auf frischem Browser, Mathe spezifisch bei 320px und offline. Bestehende Sprach-/Bibliotheksregressionen ersetzen diese Nachweise nicht.
- Der neue Rundentest startet bisher nur die Fehlerwiederholung; er weist deren Abschluss noch nicht nach. Der Autorenfall prüft bislang Prompttext, noch nicht den Inhalt der heruntergeladenen v2-Schemadatei.
- `experiment/mathe-integration.md` und der Wiederaufnahmeabschnitt in `tasks/todo.md` sind aktualisiert. Vollständige DoD bleibt offen, kein Push/Deployment und kein Kontingent-Reset.

Nächster manueller Schritt nach Luna: fokussierten Mathe-Browserlauf prüfen; verbleibende Fälle implementieren, danach `npm test`, `npm run build`, `npm run test:browser`, `git diff --check`. Erst nach Abnahme Abschlussdokumentation und Commit erstellen. Keine realen Nutzerdaten löschen. Der Prüf-Browser `lernpfad-math-review` ist isoliert, der existierende Preview-Server auf 4173 wird gemeinsam genutzt.

### Letzter Status vor Kontingentgrenze

Alle Luna-Agenten sind abgeschlossen. Luna hat die Autoren-Navigation über die Bibliothek ergänzt und eine zusätzliche Bergzeit-Erkennung im Test eingebaut. Astra hat den Kontrolllauf gestartet; Ergebnisse stehen in `/tmp/lernpfad-math-expanded-corrected.txt` (Exec-Session 60553). Beim letzten Lesen bestand Fall 1, die erweiterten Fälle waren noch nicht abgeschlossen. Keine grüne Gesamtfreigabe behaupten. `git diff --check` besteht.

Korrektur zur vorläufigen Diagnose oben: `continue-rest` existiert tatsächlich in `app/journey.js`. Der Rundenabbruch kann durch nicht abgewartete asynchrone Speicherung/Renderwechsel im Test entstehen; dies ist noch zu untersuchen. Nicht ungeprüft als falschen Appselektor behandeln.

Letzter Log-Nachtrag: Auch nach Lunas Korrektur scheitert der Rundenfall mit 60-Sekunden-Timeout. Autorenfall läuft noch. Dies ist der erste konkrete offene Reparaturpunkt; Log und `test-results/` auswerten.

Kontingent zuletzt 98 % (Woche 48 %). Der ausführliche Zwischenstand wurde bereits bei 61 % gesichert und bei 88 % erweitert. Astra beendet die aktive Arbeit jetzt zur manuellen Übergabe. Arbeitsbaum erhalten; Implementierung uncommitted, kein Push/Deployment.
