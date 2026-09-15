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

## Wiederaufnahme durch Opus — 2026-09-15, nach Astras Kontingentgrenze

Astra endete bei 98 % mit einem baubaren, aber uncommitteten Arbeitsbaum und genau einem
konkreten Reparaturpunkt. Der ist erledigt; die Integration ist jetzt committed.

**Commit `af38f79`.** Verifiziert, nicht geschätzt: 82 Unit-Tests, Produktionsbuild,
**24/24 Browserabläufe**, `git diff --check` sauber, Mathefixture per CLI gültig
(8 Konzepte, 40 Aufgaben). Quellenfotos bleiben durch `.gitignore` ausgeschlossen; nur
`MANIFEST.md` ist versioniert. **Kein Push, kein Deployment.**

### Die drei Browserfehler waren Testfehler, keine Appfehler

Astras vorläufige Diagnose „nicht abgewartete asynchrone Speicherung/Renderwechsel" war
richtig, und die Korrektur zur `continue-rest`-Vermutung ebenfalls: der Selektor existiert.

1. **Rennen nach Bergzeit.** Die Rundenschleife prüfte die Seite mit `count()`, das nicht
   wartet. Nach dem Klick auf „Weiterwandern" war die nächste Aufgabe noch nicht gerendert,
   also brach die Schleife mitten in der Runde ab. Sie wartet jetzt darauf, dass die App auf
   einem von drei Zuständen zur Ruhe kommt: Aufgabe, Rastbildschirm oder Abschluss. Derselbe
   Fehlertyp war am 14.09. schon in `milestone.spec.js` aufgetreten.
2. **`start-review` auf dem Abschlussbildschirm.** Dort gibt es den Knopf nicht. Die
   Wiederholungsseite ist nur über die Startseiten-Schnellaktionen erreichbar; die
   Hauptnavigation bietet home/library/study/progress.
3. **Leere Wiederholung war korrektes Verhalten.** Der Test setzte den Fehler auf die *erste*
   Aufgabe. Deren Konzept `math.divisors` wird in derselben Runde noch viermal richtig
   beantwortet, also ist nichts mehr fällig und die App zeigt ehrlich „Im Moment ist nichts
   fällig." Der Fehler sitzt jetzt auf der letzten Aufgabe. **Hier hätte man beinahe die App
   „repariert", obwohl der Test falsch lag.**
4. **Kein Submit-Knopf im Einfügeformular.** Der geteilte `button()`-Helfer rendert
   `type="button"`, der Test suchte `button[type="submit"]`. Richtiger Einstieg ist die Aktion
   `validate-pasted-import`. Nebenbefund: der `submit`-Handler auf `[data-import-text-form]`
   ist damit praktisch unerreichbar, weil ein Textarea Enter als Zeilenumbruch behandelt. Kein
   Nutzerproblem, aber toter Pfad.

### Definition of Done: weiterhin NICHT vollständig

Die von Astra bei 88 % aufgelisteten Abnahmelücken bestehen unverändert. Nicht abhaken:

- [ ] Gezielte UI-Fälle für Mengen-Dopplungen, Multimengen und Reihenfolge in der Oberfläche.
      Die Logik ist in `tests/numeric.test.js` geprüft, die Bedienung nicht.
- [ ] Zahlenfeld Add/Remove und Fokusverhalten nach dem Entfernen eines Feldes.
- [ ] Gleiche Sitzungs-ID über Buchwechsel.
- [ ] Gemischtes Sprach-/Mathe-Profil exportieren und auf frischem Browser wiederherstellen.
- [ ] Mathe bei 320 px und offline. Bestehende Sprachregressionen belegen das nicht.
- [ ] Der Autorenfall prüft den Prompttext, noch nicht den Inhalt der heruntergeladenen
      v2-Schemadatei.
- [ ] Physischer iPhone-Stimmen-/Flugmodustest und Eltern-/Kind-Pilot bleiben manuell.

### Nächster sinnvoller Schritt

Die sechs offenen Browserfälle in `tests/browser/math.spec.js` ergänzen. Sie sind unabhängig
voneinander und berühren keine Anwendungsdatei, eignen sich also für einen einzelnen
Agentenauftrag. Erst danach DoD abhaken, dann Push zusammen mit den neun bereits auf `main`
wartenden Commits.

## Abnahmelücken geschlossen — 2026-09-15

Commit `20bf129`. Die sechs im Abschnitt davor offenen Browserfälle sind ergänzt, ausgeführt
von einem Sonnet-Agenten mit Schreibrecht ausschließlich auf `tests/browser/math.spec.js`.

**Unabhängig nachgeprüft, nicht aus dem Agentenbericht übernommen:** `npm test` 82/82,
`npx playwright test` **30/30**, `git diff --check` sauber, nur die Spec-Datei geändert.
`tests/browser/math.spec.js` enthält jetzt 9 Fälle.

Abgedeckt:

- Mengen-/Folgen-/Multimengensemantik durch die Oberfläche mit echten Fixture-Aufgaben
  (`math.ex.teilers-22`, `math.ex.multiples-18`, `math.ex.prime-factors-84`). Die kanonische
  Dopplung `02`/`2` wird abgewiesen, **bevor** sie ein Antwortereignis erzeugt; die Prüfung
  vergleicht die Zahl der `answerRecords` vorher und nachher, nicht nur die Fehlermeldung.
  Multimenge nimmt eine Umsortierung an und lehnt einen verlorenen Faktor ab.
- Zahlenfelder hinzufügen/entfernen, Werte und Indizes nach dem Entfernen, Fokus landet auf
  einem echten Feld statt auf `<body>`, Tastaturbedienung bleibt möglich.
- Sitzungs-ID und beantworteter Fortschritt überstehen einen Buchwechsel.
- Gemischtes Sprach-/Mathe-Profil exportiert und in einem frischen Browserkontext
  wiederhergestellt, mit beiden Büchern, ihren Ergebnissen und den Stempeln.
- Mathe bei 320 px ohne horizontales Überlaufen und eine vollständig offline beantwortete
  Runde, sobald der Service Worker die Seite kontrolliert.
- Die heruntergeladene Schemadatei wird geparst und als Mathe-v2-Schema geprüft, nicht mehr
  nur der Prompttext.

Anmerkung zur Testtechnik: ein Helfer `injectSession` schreibt für drei Fälle eine Sitzung mit
handverlesenen Aufgaben direkt in IndexedDB, statt den Scheduler zu durchsuchen. Das umgeht
bewusst die Aufgabenauswahl; der vollständige Rundenlauf deckt diesen Pfad weiterhin ab. Der
Agent fand einen eigenen Testfehler (Buchliste vor der Navigation abgefragt) und korrigierte
ihn selbst. **Kein Anwendungsfehler gefunden, keine Datei unter `app/` angefasst.**

### Damit offen: nur noch manuelle Nachweise

Die automatisierbaren Punkte der Definition of Done sind belegt. Es bleiben:

- [ ] Physischer iPhone-Test: lokale Systemstimmen im Flugmodus. Bis dahin steht nirgends eine
      Offline-Sprachzusage.
- [ ] Eltern-/Kind-Pilot mit echtem Material.
- [ ] Push und Deployment. Auf `main` warten jetzt **zwölf** Commits; die letzte
      Live-Verifikation galt `156853d`, also geht mit dem Push auch der Wurzeltausch
      (Startseite unter `/`, App unter `/lernen.html`) live.

Kein Push, kein Deployment durch diese Sitzung.
