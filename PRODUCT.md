# Product contract

**Lernpfad** turns a child's current school material into short, personal practice sessions. The initial course is English Unit 1A, Holiday Stories / Getting Around, grounded in supplied textbook photos. German instructions support English or French target content.

Parents load a validated curriculum JSON authored outside the app. Children practise one task at a time, receive explanatory feedback, return to weak concepts and see small, non-punitive rewards. Writing uses an explicit model answer and self-check; it is never graded by a hidden heuristic.

The first milestone includes several exercise primitives, state-aware practice, persistent concept progress, JSON backup/restore, responsive keyboard-accessible interaction and verified offline use after initial production loading. Learning data stays in this browser unless the user deliberately downloads a backup.

The second milestone adds a searchable Lernbuch so children can read words and rules before retrieval. Choosing a concept starts focused practice when its prerequisites are met. A separate review list uses due dates and the latest objective outcome; corrected mistakes clear, and writing self-checks never create error debt. Progress labels describe practice evidence rather than certified knowledge. Changing a paused round requires a deliberate choice; checked answers survive, while unsubmitted drafts do not survive reload.

No account, backend, analytics, cloud inference, copied textbook passages, branded reference assets, punitive streaks or mandatory notifications. Original source images are research evidence only. Core practice must remain useful without audio or speech recognition.

See ASTRA.md for the experiment mandate, tasks/todo.md for execution, and QUALITY-RUBRIC.md for acceptance evidence.

Milestone 3 makes importing school material deliberate: preview the validated package, see its content and incoming learner state, download the current backup, and then accept or cancel. Preview warns about concepts with no exercise or no possible prerequisite path. These are authoring diagnostics; compatibility remains unchanged and the author decides whether a partial course is useful.
The authoring guide is available in the app under Üben → Anleitung & Prompt. A language-selectable prompt includes the full current schema and can be copied or downloaded for a separate AI conversation. French support includes target-language labels, accents and authored apostrophe variants; all five exercise types are tested with an original technical fixture.
