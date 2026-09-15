# Lessons

- Verify the authoring path from the user's actual entry point: a repository prompt alone does not provide an in-app handoff. Before declaring another target language ready, check schema acceptance, all learner-facing labels and language attributes, answer normalization, and an import-to-backup browser run.

- For GitHub Pages, distinguish the custom app workflow from the legacy Pages/Jekyll job. A successful source deployment does not prove a Vite app is live: inspect the served entry script, verify the configured publishing source, then run the live rendering and offline smoke check.

- Test the complete mobile authoring journey: users may copy ChatGPT output instead of downloading a JSON file. Offer pasted text alongside file upload and route both through the same validation, preview and explicit acceptance. Preserve the pasted draft on errors and never require clipboard-read permission.

- `configure-pages` succeeding does not mean an existing Pages site uses GitHub Actions as its source. Check for concurrent dynamic Jekyll runs and verify final live assets after all publishers finish; otherwise source publishing can overwrite a successful app deployment.

- Wenn der Nutzer abgeschlossene parallele Arbeit meldet, zuerst Git-Log, Arbeitsbaum und konkrete Prüfnachweise abgleichen. Abgeschlossene Änderungen übernehmen und nur offene Kriterien verfolgen; keine veralteten Agentenzustände als aktuellen Projektstand darstellen.
- Ein optionales UI-Feature muss mit einem schema-gültigen Datensatz vom Import bis zur Bedienung geprüft werden. Ein Synthesizer-Unit-Test allein beweist keinen erreichbaren Vorlesen-Button; Prompt, Schema und Laufzeit müssen denselben Vertrag nutzen.

- Vor Aussagen zu untracked Dateien, veralteten Testbasen oder neuen Testzahlen den aktuellen Git-Stand und die Testnamen zählen. Am 17e3623 waren Profil-/Sprachtests committed: 55 vorhandene plus 13 neue Zahlentests ergeben 68, nicht 14 neue Tests.
