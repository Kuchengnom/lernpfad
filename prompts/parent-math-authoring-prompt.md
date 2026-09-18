# Anweisung für Eltern: Mathe-Lernbuch erstellen

Erstelle ein eigenständiges Lernbuch für **Mathematik · Teilbarkeit & Primzahlen**. Die Fotos sind fachliche Quellen, keine Vorlage zum Abschreiben. Formuliere neue kurze Aufgaben auf Deutsch. Handschriftliche Einträge sind Schülerantworten und dürfen niemals als Lösungsschlüssel behandelt werden. Verwende keine Namen, Klassenangaben oder anderen personenbezogenen Daten.

Gib ausschließlich ein kopierbares JSON-Objekt nach diesem Vertrag aus. Keine Markdown-Codezäune, Kommentare oder zusätzlichen Schlüssel. `schemaVersion` muss `2.0`, `kind` muss `curriculum`, `subject` muss `math` und `instructionLanguage` muss `de` sein. Jede `provenance`-Angabe muss auf eine vorhandene `sources[].id` zeigen. Bewahre die Reihenfolge der Aufgaben und stabile IDs bei späteren Korrekturen.

Nutze nur die Themen, die in den tatsächlich bereitgestellten Fotos oder Dokumenten belegt sind. Erfinde keine Themen und behaupte keine Abdeckung fehlender Inhalte. Wenn die Quellen genug eigenständige Aufgaben tragen, strebe etwa 40 Aufgaben und mindestens drei je belegtem Thema an; sonst verwende die kleinere begründete Menge und dokumentiere die Grenze in den Quellnotizen. Typische belegte Themen sind Teiler/Faktorpaare, Teilermengen, positive Vielfache, Endziffern für 2/4/5/8/10/25, Quersumme und Teilbarkeit durch 3/9, ggT, kgV, Primzahlen/Primfaktoren. Nutze nur die Aufgabentypen `choice`, `numeric-input` und `number-list`. Keine Brüche, Dezimalzahlen, Einheiten, Gleichungen, Geometrie, freie Begründungen, Handschrifterkennung oder beliebig langen Antworten. Bei `choice` gibt es genau eine richtige Option.

Für `numeric-input` setze `numberDomain` auf `nonnegative-integer` und gib `acceptedValues` als vollständige endliche Menge kanonischer Ziffernstrings an. Für `number-list` setze ebenfalls `numberDomain` und zusätzlich `comparison` auf `set`, `sequence` oder `multiset` sowie `expectedValues`. Eine `set` enthält jeden Wert höchstens einmal und ignoriert die Reihenfolge; eine `sequence` vergleicht jede Position und darf Wiederholungen enthalten; eine `multiset` ignoriert die Reihenfolge, erhält aber Häufigkeiten. Listenaufgaben müssen im Text klar sagen, welche dieser drei Bedeutungen gilt. `0` ist kein positives Vielfaches. Bei fehlenden Ziffern müssen alle gültigen Ziffern in `acceptedValues` stehen. Primfaktoren werden einzeln und mit Wiederholungen als `multiset` erfasst.

Alle Zahlenfelder sind ganze Zahlen von 0 bis 999999; Autorenwerte sind ohne führende Nullen (`"0"` oder eine Ziffernfolge, die mit 1–9 beginnt). Formuliere Aufgaben so, dass Teilermengen höchstens 20 Werte und kgV-Ergebnisse höchstens 999999 haben. Prüfe jede Lösung und jeden Ablenker selbst durch Enumeration oder Primfaktorzerlegung. Das Laufzeitsystem verwendet keine KI zur Bewertung.

Lies die tatsächlich bereitgestellten Fotos oder Dokumente und leite `sources[].id`, Dateinamen, sichtbare Seiten und belegte Themen daraus ab. Übernehme keine nicht bereitgestellte Seite, erfinde keine Seitenzahl und kopiere keine Handschrift. Jede Aufgabe darf nur Themen und eine `provenance` aus diesen tatsächlich angelegten Quellen verwenden; personenbezogene Angaben gehören nicht in das Ergebnis. Wenn eine Quelle unvollständig ist, dokumentiere das in `notes`.

Verwende dieses direkte JSON-Grundgerüst und fülle alle Platzhalter aus:

{
  "schemaVersion": "2.0",
  "kind": "curriculum",
  "curriculum": {
    "id": "course.math.example",
    "version": "1.0",
    "title": "Mathe · Teilbarkeit & Primzahlen",
    "subject": "math",
    "instructionLanguage": "de",
    "sources": [
      { "id": "src.math.5", "kind": "textbook-page", "file": "references/textbook/mathe/IMG_7071.HEIC", "page": 5, "notes": "Eigenständig formuliert; Quelle und Seitenziel geprüft." }
    ],
    "concepts": [
      { "id": "math.example", "kind": "math-skill", "label": "Teiler", "learningGoal": "Positive Teiler bestimmen.", "rule": "Ein Teiler teilt ohne Rest.", "examples": ["12 hat die Teiler 1, 2, 3, 4, 6 und 12."], "dependsOn": [], "provenance": ["src.math.5"] }
    ],
    "exercises": [
      { "id": "math.ex.example", "type": "choice", "conceptIds": ["math.example"], "difficulty": 1, "prompt": "Welche Zahl teilt 12 ohne Rest?", "explanation": "12 : 3 = 4 ohne Rest.", "provenance": ["src.math.5"], "choices": [{"id":"option.a","text":"3"},{"id":"option.b","text":"5"}], "correctChoiceIds": ["option.a"] },
      { "id": "math.ex.number", "type": "numeric-input", "conceptIds": ["math.example"], "difficulty": 1, "prompt": "Wie viele Teiler hat 12?", "explanation": "Die Teiler 1, 2, 3, 4, 6 und 12 sind sechs Zahlen.", "provenance": ["src.math.5"], "numberDomain": "nonnegative-integer", "acceptedValues": ["6"] },
      { "id": "math.ex.list", "type": "number-list", "conceptIds": ["math.example"], "difficulty": 1, "prompt": "Nenne die positiven Teiler von 12 als set; jede Zahl einmal, Reihenfolge egal.", "explanation": "Die vollständige Menge ist 1, 2, 3, 4, 6, 12.", "provenance": ["src.math.5"], "numberDomain": "nonnegative-integer", "comparison": "set", "expectedValues": ["1", "2", "3", "4", "6", "12"] }
    ]
  }
}

Before returning the JSON, count the tasks by concept, verify that every concept and task has a source ID, and independently recompute every answer. Include no prose outside the JSON object.
