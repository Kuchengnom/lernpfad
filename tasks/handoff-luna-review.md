# Unabhängige Luna-Prüfung

Stand: 2026-09-15, Abschluss.

Read-only QA der laufenden Mathe-Integration. Geprüft werden Vertrags-/Migrationspfade, Import/Dispatch, kanonisches Feedback nach Neuladen, ungültige Eingaben, Buch-/Entwurfsisolation, Listenregeln und Testabdeckung. Implementierung, Tests und Commits werden von dieser Prüfung nicht geändert.

## Befunde

Keine reproduzierbare Implementierungsabweichung in den geprüften Vertrags-, Import-, Dispatch-, Migrations- oder Zahlen-/Listenpfaden. `npm test` besteht mit 80/80 Tests; `npm run build` und `npm run validate -- fixtures/math-divisibility/curriculum.json` bestehen (8 Konzepte, 40 Übungen). Die vorhandenen Unit-Tests decken kanonische Zahlen, Grenzen, Syntaxfehler ohne Versuch, alternative Zahlenlösungen, set/sequence/multiset, Mengen-Dopplungen, Schema-Versionen, v1-Migration, gemischte Profile und rekonstruierte Feedbacktexte ab.

### Abnahmelücke: math-spezifische Browserabdeckung (P1)

Die DoD fordert Feedback nach Neuladen, Buchwechsel, Entwurfsisolation, Listenreihenfolge/Dopplungen/Anzahl sowie 320/375-px-Tastatur-/Fokusprüfung im Produktionsbuild. `tests/browser/math.spec.js` prüft davon nur Mathe-Import, ein gerendertes numerisches Feld und `4abc` ohne neuen Antwortdatensatz. Die übrigen vorhandenen Browser-Suites verwenden Sprachaufgaben; es fehlt ein eigenständiger gerenderter Mathe-Ablauf für `number-list` (set/sequence/multiset einschließlich Entfernen/Hinzufügen und Duplicate-Fehler), Mathe-Feedback nach Reload und Mathe-Entwurfstrennung beim Buchwechsel. Vor Freigabe diese Fälle als Browserchecks ergänzen oder nachweisbar manuell im Produktionsbuild abnehmen.

### Verifikationsgrenze

`npm run test:browser` konnte in dieser Sandbox nicht starten: der konfigurierte Preview-Server darf `127.0.0.1:4173` nicht binden (`listen EPERM`). Das ist eine Prüfungsumgebungsgrenze, kein Produktbefund; Root sollte den Browserlauf in einer Umgebung mit lokalem Port ausführen.
