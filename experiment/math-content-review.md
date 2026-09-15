# Review: Mathe · Teilbarkeit & Primzahlen

Datum: 2026-09-15

Die Quelleninventur in `references/textbook/mathe/MANIFEST.md` belegt die acht verwendeten Lernbereiche. Die Aufgaben wurden eigenständig formuliert; handschriftliche Einträge und nicht vorliegende Arbeitsblattseite 2 wurden nicht als Lösungen oder Inhalt übernommen.

## Abdeckung

| Bereich | Konzept-ID | Aufgaben | Quellen |
| --- | --- | ---: | --- |
| Teiler/Faktorpaare | `math.divisors` | 5 | `src.math.5` |
| Teilermengen | `math.divisor-sets` | 4 | `src.math.5` |
| Positive Vielfache | `math.multiples` | 4 | `src.math.6` |
| Endziffern 2/4/5/8/10/25 | `math.end-digits` | 7 | `src.math.7` |
| Quersumme und 3/9 | `math.digit-sums` | 5 | `src.math.8` |
| ggT | `math.gcd` | 5 | `src.math.9` |
| kgV | `math.lcm` | 5 | `src.math.10` |
| Primzahlen/Primfaktoren | `math.primes` | 5 | `src.math.primes` |
| **Gesamt** |  | **40** | 7 Quellen |

Jedes Konzept hat mindestens drei Aufgaben. Die fixture enthält 17 `choice`, 13 `numeric-input` und 10 `number-list` Aufgaben. Die Listen verwenden `set` (6), `sequence` (4) und `multiset` (2); die Aufgaben sprechen die jeweilige Reihenfolge und Wiederholungsregel aus.

## Prüfung

`tests/math-fixture.test.js` berechnet die erwarteten Werte unabhängig vom Fixture mit eigener Teiler-, Vielfachen-, Quersummen-, ggT/kgV- und Primfaktorlogik. Es prüft außerdem jeden choice-Ablenker, alternative fehlende Ziffern, alle Quellenverweise, die 8/40-Zählung, Engine-Bewertung und Scheduler-Erreichbarkeit je Konzept.

Nachweise am 15.09.2026:

- `node --test tests/math-fixture.test.js`: 4/4 bestanden.
- `npm test`: 80/80 Tests bestanden.
- `npm run validate -- fixtures/math-divisibility/curriculum.json`: gültiges Curriculum, 8 Konzepte, 40 Aufgaben.

## Ergebnis und offene Grenzen

Der Inhalt ist für den festgelegten v2-Vertrag vollständig und rechnerisch geprüft. Der Prompt `prompts/parent-math-authoring-prompt.md` verlangt ausschließlich die drei implementierten Mathe-Aufgabentypen, kanonische ganze Zahlen 0–999999, vollständige Alternativen und gültige Quellen-IDs.

Offen bleiben die übergeordnete App-/Browser-Integration und die Produktionsbuild-Prüfung; sie liegen außerhalb dieses Content-Teilauftrags. Die HEIC-Originale bleiben unverändert und sind keine Laufzeitmedien. Die fehlende Seite 2 des Primzahl-Arbeitsblatts bleibt dokumentiert.
