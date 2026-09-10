# Assumptions and status

- **Initial language pair:** German instructions with English practice, inferred from supplied textbook and app references. Other UI languages are outside v1.
- **Local runtime suffices:** verified by production lesson completion offline, reload and backup restore. No account or backend is needed for the first milestone.
- **Simple mastery model is useful experimentally:** mechanics are tested; educational effectiveness has not been measured with children.
- **Source rights:** the user supplied textbook references; only compact knowledge and newly authored exercises enter the app. No source images/long passages are deployed.
- **Current browser:** IndexedDB and Web Locks are required for durable single-writer use. HTTPS/localhost and service-worker support are required for the offline shell. Older/blocked storage environments show a visible error.
- **Parent-managed portability:** JSON download/import is sufficient for the initial cross-device flow. QR codes, compression and cloud synchronization are unnecessary for this milestone.
