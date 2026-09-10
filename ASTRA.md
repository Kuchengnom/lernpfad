# Language Learning — Astra Project Brief

## 1. Mission

Build an experimental, privacy-first, local-first language-learning web application for school children.

The central idea is to transform existing school learning material — for example textbook pages, vocabulary lists, grammar exercises, screenshots, PDFs, or digital textbook exports — into structured learning content that can be imported into the application.

The application then turns this curriculum data into interactive, short-form learning sessions using a fixed repertoire of exercise types inspired by successful language-learning applications.

The project should investigate how far a capable coding agent can autonomously:

1. analyse educational source material,
2. derive a structured curriculum representation,
3. design an appropriate learning model,
4. create reusable exercise templates,
5. build the application,
6. evaluate its own UX and implementation quality,
7. test it,
8. improve it iteratively,
9. and document important architectural and design decisions.

The goal is NOT to clone Duolingo or another application.

Existing products are references for interaction principles, learning mechanics, pacing, feedback and motivational systems.

The resulting product should develop its own coherent visual and interaction identity.


---

# 2. Core Product Concept

There are two distinct systems.

## A. Curriculum authoring outside the application

A parent or teacher provides source material to a capable multimodal language model such as ChatGPT.

Examples:

- photographs of textbook pages
- screenshots
- vocabulary pages
- grammar explanations
- exercises
- PDFs
- legally obtained digital textbook material
- teacher notes

A predefined authoring prompt instructs the model to analyse this material and produce a JSON file conforming to our curriculum schema.

The application itself does NOT need to perform this AI processing.

This deliberately separates expensive/intelligent content generation from the runtime application.


## B. Local learning application

The web application imports the resulting JSON.

It then provides:

- learning sessions
- vocabulary practice
- grammar exercises
- sentence construction
- reading comprehension
- writing prompts
- repetition
- review of mistakes
- progression
- XP / points
- gems or similar rewards
- achievements
- progress tracking
- optional reminders

The application should function without requiring an account or central backend.


---

# 3. Primary Design Principle

## Privacy first / infrastructure minimal

Avoid infrastructure unless there is a compelling reason for it.

Prefer:

- static application
- client-side execution
- IndexedDB
- LocalStorage where appropriate
- Service Workers
- Progressive Web App capabilities
- Web Notifications where supported
- Web Share API where useful
- JSON import/export

Avoid by default:

- user accounts
- authentication
- remote databases
- tracking
- analytics
- unnecessary cloud services
- storing children's learning data remotely

A user should be able to use the application locally and retain ownership of all learning data.


---

# 4. Portable Learner State

The JSON ecosystem should support both curriculum and learner progress.

Users must be able to:

1. import curriculum,
2. learn,
3. accumulate progress,
4. close the application,
5. return later,
6. continue locally,
7. export their state,
8. import it on another device.

Consider separating:

- curriculum definition
- learner state
- application/schema metadata

or defining a portable package format containing all three.

The architecture should make this distinction explicit.


---

# 5. Sharing Without Accounts

Explore low-infrastructure mechanisms for sharing curriculum or learner data.

Possible approaches include:

- downloadable JSON
- compressed text strings
- encoded payloads
- QR codes
- Web Share API
- local file exchange

Do NOT introduce a server simply to make sharing easier unless there is a strong architectural justification.

If an approach becomes too complex for the benefit it provides, document it as a future possibility instead of implementing unnecessary infrastructure.


---

# 6. Source Material

Reference material will be placed under:

`references/`

Treat this material as evidence and inspiration, not as assets to reproduce.


## School material

Example source material is located under:

`references/textbook/`

The initial material represents an English school textbook unit around the theme:

**Holiday Stories / Getting Around**

It contains material including:

- transport vocabulary
- holiday-place vocabulary
- simple past
- regular verbs
- irregular verbs
- pronunciation of `-ed`
- prepositions
- reading comprehension
- WH questions
- writing about holiday experiences
- contextual vocabulary
- repetition/challenge exercises

Use this material to construct the first realistic curriculum fixture.

Do not simply digitise the textbook exercises verbatim.

Instead infer:

- learning objectives
- vocabulary
- grammatical concepts
- dependencies
- example sentences
- exercise opportunities
- review opportunities

The curriculum representation should encode knowledge rather than page layout.


---

# 7. Application References

Screenshots from language-learning applications may be placed under:

`references/apps/`

These references may include products such as Duolingo and other language-learning systems.

Analyse them for interaction principles including:

- lesson pacing
- one-task-at-a-time interaction
- progress indication
- immediate feedback
- error recovery
- repetition
- difficulty progression
- vocabulary introduction
- sentence construction
- multiple choice
- listening/speaking affordances
- lesson completion
- rewards
- XP
- gems
- achievements
- challenges
- streak-like motivation
- practice areas
- mistake review
- microcopy
- animation/reward moments
- visual hierarchy

Do NOT reproduce:

- trademarks
- logos
- proprietary characters
- exact illustrations
- exact layouts
- branded visual identity
- proprietary copy

Extract patterns rather than appearances.


---

# 8. Learning Model

Do not model the curriculum merely as a linear list of textbook pages.

Model learning concepts explicitly.

Possible entities include:

- Unit
- Topic
- Skill
- Concept
- VocabularyItem
- GrammarRule
- Phrase
- ExampleSentence
- LearningObjective
- Exercise
- Lesson
- ReviewItem
- LearnerState

A concept should have a stable ID so learner performance can refer to it independently of individual exercises.

Example:

```json
{
  "id": "verb.drive.simple-past",
  "type": "grammar",
  "base": "drive",
  "target": "drove",
  "tags": [
    "simple-past",
    "irregular-verbs",
    "transport"
  ]
}
```

This should allow the system to understand that different exercises can test the same underlying knowledge.


---

# 9. Exercise Engine

Create a finite set of reusable exercise primitives.

The curriculum supplies content.

The application supplies interaction templates.

Possible primitives include:

### Vocabulary

- target → native translation
- native → target translation
- multiple choice
- word matching
- image association where assets exist
- vocabulary in context

### Sentence construction

- arrange word tiles
- fill missing word
- choose correct word
- choose correct grammatical form
- transform sentence

### Grammar

- infinitive → simple past
- regular vs irregular
- present vs past
- preposition selection
- grammar classification

### Reading

- short passage
- true / false
- multiple choice
- WH questions
- identify evidence

### Listening

Where browser speech synthesis can support it:

- listen and select
- listen and type
- sentence comprehension

Do not require cloud speech services for the MVP.


### Speaking

Explore browser-native possibilities but treat speaking recognition as optional.

Do not make the core learning loop dependent on unreliable or platform-specific speech recognition.


### Writing

- guided short response
- sentence construction
- scaffolded WH-question response
- longer writing challenge

Where deterministic automatic evaluation is not reliable, provide appropriate self-check or model-answer mechanisms instead of pretending evaluation is objective.


---

# 10. Session Generation

A lesson session should NOT simply replay a static list of exercises.

Build a deterministic or semi-dynamic session generator.

It should select activities based on:

- current unit
- new concepts
- previously encountered concepts
- learner mastery
- recent mistakes
- time since last exposure
- exercise variety
- difficulty
- session length

A typical session might contain approximately 8–15 interactions.

The exact algorithm should be designed during implementation.


---

# 11. Repetition and Mastery

Repetition is a core feature.

Each concept should maintain a lightweight learner model.

Possible state:

```json
{
  "conceptId": "verb.drive.simple-past",
  "seen": 7,
  "correct": 5,
  "incorrect": 2,
  "streak": 2,
  "mastery": 0.68,
  "lastSeen": "2026-09-09T18:42:00Z",
  "nextReview": "2026-09-12"
}
```

Do not blindly copy a particular spaced-repetition algorithm.

Implement a simple, explainable system suitable for the experiment.

The system should naturally cause:

- mistakes to return sooner,
- weak concepts to appear more often,
- mastered concepts to appear occasionally,
- older vocabulary to be sprinkled into new lessons.

Document the algorithm.


---

# 12. Difficulty Adaptation

Difficulty should be capable of changing based on performance.

Examples:

Early stage:

> drive → ?

Later:

> Yesterday we ___ to Scotland.

Later:

> Rewrite the sentence in the simple past.

Later:

> Write a sentence describing how you travelled on your last holiday.

The same concept can therefore be practised through increasingly generative interactions.

Avoid difficulty systems that merely increase arbitrary numerical values.


---

# 13. Feedback

Feedback should be:

- immediate
- understandable
- encouraging
- informative

For incorrect answers, explain the relevant distinction when useful.

Example:

Instead of:

> Wrong.

Prefer:

> "Drive" is irregular. Its simple past form is "drove", not "drived".

Avoid excessive praise for trivial actions.

Feedback should help learning, not merely gamify clicking.


---

# 14. Motivation and Rewards

Create a lightweight motivational layer.

Potential elements:

- XP
- gems
- stars
- lesson completion
- mastery indicators
- achievements
- treasure/reward moments
- daily goals
- challenges

These systems must remain secondary to learning.

Avoid:

- manipulative loss aversion
- punitive streak mechanics
- excessive scarcity
- dark patterns
- artificial pressure

The experience is intended for children, so motivational design must be particularly responsible.


---

# 15. Daily Practice and Notifications

Investigate whether browser/PWA capabilities can support local reminders.

Possible implementation:

- user explicitly opts in
- choose practice time
- local notification where technically supported

Gracefully degrade where browsers/platforms do not support this.

Do not introduce server-side push infrastructure for the MVP solely for reminders.


---

# 16. Parent / Teacher Authoring Prompt

Create a reusable prompt under:

`prompts/parent-authoring-prompt.md`

Its job is to allow a parent or teacher to:

1. attach educational source material,
2. tell ChatGPT or another capable multimodal model to analyse it,
3. extract the curriculum,
4. produce schema-valid JSON,
5. save/import that JSON into this application.

The prompt should explicitly tell the model:

- not to reproduce textbook pages,
- to infer learning concepts,
- to preserve relevant vocabulary and grammar,
- to create original exercises based on those concepts,
- to use stable IDs,
- to conform exactly to our schema,
- to identify uncertain interpretations where necessary.

Also create an example generated curriculum JSON from the supplied English material.


---

# 17. JSON Schema

Define a versioned schema.

For example:

```json
{
  "schemaVersion": "1.0",
  "curriculum": {},
  "learner": {}
}
```

However, determine whether curriculum and learner state should ultimately be separate files.

Requirements:

- schema versioning
- stable IDs
- validation
- graceful error reporting
- forward migration strategy
- export/import round trip
- human-readable JSON where practical

Use JSON Schema or another appropriate validation mechanism.


---

# 18. Offline Capability

The core application should work offline after initial loading.

Investigate:

- PWA manifest
- Service Worker
- application shell caching
- IndexedDB
- local curriculum storage
- local learner state

The target experience is:

> Download/open once → learn locally.


---

# 19. Design System

Do not create screens independently.

Establish a small design system first.

At minimum define:

- typography
- spacing
- colour tokens
- semantic colours
- surfaces
- borders
- radii
- buttons
- input states
- exercise containers
- progress indicators
- reward components
- feedback states
- motion principles
- accessibility states

Components should derive from these primitives.


---

# 20. Interaction and Motion Patterns

Use the DesignMotion pattern library as one reference for interaction and motion design:

https://www.designmotionhq.com/patterns

Do not mechanically apply every pattern.

Evaluate patterns according to whether they improve:

- comprehension
- feedback
- continuity
- hierarchy
- perceived responsiveness
- motivation
- state transitions

Motion should communicate state and causality.

Avoid decorative motion that slows learning.


---

# 21. Accessibility

Accessibility is part of the definition of done.

Consider at minimum:

- keyboard interaction
- semantic HTML
- focus states
- contrast
- reduced-motion preference
- readable typography
- touch target sizes
- screen-reader labels
- feedback that does not rely solely on colour
- responsive layouts

Remember that the primary users include school children.


---

# 22. Responsive Web Application

Desktop browser is an important use case because parents may prepare/import curriculum there.

Learning should also work well on:

- phones
- tablets
- laptops
- desktops

Design responsive behaviour intentionally rather than merely shrinking a desktop UI.


---

# 23. Reference Analysis

Before finalising the design system, analyse the supplied application screenshots.

For each relevant screenshot identify:

1. purpose of the screen,
2. primary user action,
3. information hierarchy,
4. feedback mechanism,
5. progression mechanism,
6. motivational mechanism,
7. reusable interaction pattern,
8. accessibility concerns,
9. what should NOT be copied.

Store useful findings under:

`experiment/research.md`

Do not spend excessive time documenting obvious visual details.


---

# 24. Quality Evaluation

The application must not be considered complete merely because it compiles.

Evaluate it against a repeatable rubric.

Create:

`QUALITY-RUBRIC.md`

Include at least:

### Functional quality

- import works
- validation works
- lessons can be completed
- progress persists
- export works
- re-import restores state
- offline behaviour works where intended

### Learning quality

- exercises test the intended concept
- answers are unambiguous
- repetition works
- mistakes influence future sessions
- difficulty progresses meaningfully
- feedback explains errors where useful

### UX quality

- current task is obvious
- primary action is obvious
- progress is understandable
- feedback is immediate
- navigation is predictable
- interaction cost is low

### Visual quality

- hierarchy is coherent
- spacing is systematic
- typography is consistent
- components belong to one design system
- responsive behaviour is intentional

### Accessibility

- keyboard usable
- focus visible
- contrast acceptable
- reduced motion respected
- semantics appropriate

### Privacy

- no unnecessary network requests
- learner data remains local
- export is user-controlled
- no hidden tracking


---

# 25. Autonomous Quality Loop

Use the following loop repeatedly:

**Inspect → Hypothesise → Implement → Run → Observe → Test → Critique → Fix**

Do not assume implementation success from source code alone.

Where possible:

- run the application,
- inspect actual rendered output,
- interact with it,
- test workflows,
- inspect browser/runtime errors,
- run automated tests,
- compare results with the quality rubric.

When a defect is found, fix it rather than merely documenting it.


---

# 26. Experiment Documentation

This project is also an experiment in agentic software/design development.

Maintain:

`experiment/decisions.md`

`experiment/assumptions.md`

`experiment/research.md`

`experiment/evaluation.md`

`experiment/known-limitations.md`

Record meaningful decisions, not every trivial implementation action.

Particularly document situations where:

- requirements were ambiguous,
- a design decision had to be inferred,
- a subagent produced poor output,
- autonomous QA found a defect,
- a reference pattern was rejected,
- architecture changed because implementation revealed a problem.


---

# 27. Agent Architecture

Execution should be subagent-driven where this improves context efficiency, parallelism or independent evaluation.

Astra acts as the primary orchestrator.

Conceptual hierarchy:

```text
Astra
├── research / architecture
├── curriculum / learning model
├── UX / design system
├── implementation
├── testing / QA
└── documentation
```

Astra may delegate substantial bounded tasks to GPT-5.6 Terra subagents.

Terra agents may themselves delegate narrow, low-risk or mechanical tasks to Luna agents where supported and where this meaningfully reduces cost/context usage.

Do not create agents merely to satisfy this hierarchy.

Delegation should have a reason.


---

# 28. Delegation Rules

## Astra

Owns:

- overall product direction
- decomposition
- architecture
- cross-domain decisions
- integration
- final quality
- definition of done

Astra should maintain a compact global model of the project rather than loading every detail continuously.


## Terra

Use for bounded but reasoning-heavy work such as:

- curriculum modelling
- schema design
- reference analysis
- learning-engine design
- component architecture
- accessibility audit
- UX critique
- test strategy
- independent code review


## Luna

Use where appropriate for narrow execution tasks such as:

- repetitive fixture creation
- simple transformations
- basic test generation
- formatting
- inventory generation
- straightforward implementation subtasks

A Luna agent should receive only the minimum context necessary.


---

# 29. Independent Review

Whenever practical, the agent that evaluates a substantial feature should not be the same agent that implemented it.

Example:

```text
Terra A
→ implements session generator

Terra B
→ reviews learning behaviour and edge cases

Astra
→ evaluates disagreement and integrates fixes
```

Use independent review especially for:

- curriculum correctness
- learning logic
- UX
- accessibility
- schema integrity
- privacy
- import/export


---

# 30. Context and Token Discipline

Treat context as a limited resource.

Do not repeatedly pass the entire repository to subagents.

Instead:

1. decompose the task,
2. identify relevant files,
3. give the subagent only those files,
4. require concise structured output,
5. persist important conclusions in repository documents,
6. allow later agents to read those conclusions instead of repeating the analysis.

Prefer repository artifacts as durable shared memory.

Do not create enormous documentation files simply to externalise chain-of-thought.

Store decisions, specifications and evidence — not hidden reasoning.


---

# 31. Autonomy

Astra is expected to make reasonable product and implementation decisions without repeatedly asking the human operator for approval.

Do not ask questions such as:

- Which button radius should I use?
- Which state-management library do you prefer?
- Should this card have a shadow?
- Should I continue?
- Which exact component structure should I choose?

Make the decision, document important choices, test them and continue.

Ask the human only when:

- a decision materially changes product scope,
- required information genuinely cannot be inferred,
- there is legal/ethical uncertainty,
- an external credential/service is required,
- destructive action would be necessary,
- multiple fundamentally different product directions are equally plausible.


---

# 32. Avoid Premature Infrastructure

Do not introduce:

- backend APIs
- databases
- authentication
- cloud functions
- remote AI inference

unless a requirement demonstrably cannot be satisfied without them.

The MVP should test how far a sophisticated learning experience can go with a static/local architecture.


---

# 33. Technology Selection

Inspect the environment and select a sensible modern web stack.

Optimise for:

- maintainability
- browser compatibility
- PWA support
- testing
- schema validation
- accessibility
- fast local development
- static deployment

Avoid unnecessary dependencies.

Document major technology choices in `ARCHITECTURE.md`.


---

# 34. Initial Vertical Slice

Do not attempt to build every feature simultaneously.

The first complete vertical slice should demonstrate:

1. application launches,
2. example Unit 1A curriculum can be imported or loaded,
3. curriculum is schema validated,
4. learner begins a session,
5. multiple exercise primitives appear,
6. answers receive immediate feedback,
7. progress changes,
8. at least one mistake affects future practice,
9. lesson completes,
10. XP/reward state changes,
11. state persists after reload,
12. state can be exported,
13. exported state can be re-imported.

This slice should feel like a small real product, not a developer demo.


---

# 35. Suggested Initial Exercise Coverage

For the supplied English Unit 1A material, try to cover concepts such as:

### Vocabulary

Transport:

- bike
- bus
- car
- moped
- plane
- scooter
- skateboard
- tram
- train

Holiday places:

- beach
- campsite
- caravan
- castle
- cathedral
- city
- forest
- holiday home
- hotel
- island
- lake
- mountain
- museum
- pool
- restaurant
- theme park
- village
- zoo

### Grammar

Simple past regular verbs.

Examples:

- add → added
- call → called
- laugh → laughed
- stay → stayed
- cry → cried
- hurry → hurried
- agree → agreed
- smile → smiled

Simple past irregular verbs.

Examples include:

- do → did
- drive → drove
- get → got
- go → went
- have → had
- make → made
- meet → met
- read → read
- say → said
- think → thought
- begin → began
- break → broke
- draw → drew
- drink → drank
- eat → ate
- feel → felt
- give → gave
- know → knew

Also:

- simple present vs simple past
- prepositions in holiday contexts
- WH questions
- descriptive adjectives
- writing about past experiences

Use the actual supplied reference material to verify and refine this inventory.


---

# 36. Copyright Boundary

The provided textbook material is reference material supplied by the user.

Use it to identify:

- vocabulary
- grammar
- educational objectives
- structure
- skill progression

Do not create a digital reproduction of the textbook.

Generate original exercises and examples testing the same underlying educational concepts.

Avoid copying long passages, proprietary illustrations or page layouts into the application.


---

# 37. Definition of Done for the Experiment

The experiment reaches its first meaningful milestone when:

- a real textbook-derived curriculum fixture exists,
- the curriculum schema is documented and validated,
- the authoring prompt can plausibly generate compatible curriculum,
- the application runs locally,
- several reusable exercise types work,
- session generation uses learner state,
- repetition works,
- progress persists,
- JSON import/export works,
- offline/local-first behaviour is demonstrated,
- the experience is responsive,
- the design system is coherent,
- accessibility basics pass,
- automated tests cover critical logic,
- autonomous QA has identified and fixed real issues,
- important decisions are documented,
- another agent can understand and continue the repository from its documentation.


---

# 38. Initial Astra Execution Plan

On first entry into this repository:

## Phase 1 — Inspect

Inspect:

- this document,
- repository contents,
- `references/textbook/`,
- `references/apps/`,
- any existing source code.

Do not assume the repository structure described here already exists.


## Phase 2 — Establish project memory

Create or update:

- `README.md`
- `PRODUCT.md`
- `ARCHITECTURE.md`
- `QUALITY-RUBRIC.md`
- `experiment/decisions.md`
- `experiment/assumptions.md`
- `experiment/research.md`
- `experiment/evaluation.md`
- `experiment/known-limitations.md`


## Phase 3 — Research and model

Use delegated analysis where useful to:

- analyse textbook material,
- analyse interaction references,
- define curriculum ontology,
- define schema,
- define learning/mastery model,
- define exercise primitives,
- define design-system direction.


## Phase 4 — Build fixture

Create the first Unit 1A curriculum fixture based on the supplied English material.

Validate it against the schema.


## Phase 5 — Build vertical slice

Implement the first complete learning flow.


## Phase 6 — Independent evaluation

Delegate independent reviews for:

- learning quality,
- UX,
- accessibility,
- architecture/privacy.

Consolidate findings.


## Phase 7 — Fix

Fix material problems found during evaluation.


## Phase 8 — Evaluate experiment

Update `experiment/evaluation.md` with:

- what Astra completed autonomously,
- where subagents were useful,
- where they were not,
- what required inference,
- defects caught through autonomous review,
- unresolved limitations,
- recommended next iteration.


---

# 39. Working Behaviour

Do not stop after producing a plan.

Planning is preparation for execution.

Once enough information is available:

**build → run → inspect → test → critique → fix → continue**

Do not request confirmation between ordinary implementation phases.

If something can reasonably be inferred from:

- this specification,
- reference material,
- established UX practice,
- established software engineering practice,

make the decision and proceed.


---

# 40. Ultimate Product Principle

The application should feel as though the child's own school material has been transformed into a polished personal learning application.

The value proposition is not:

> "Here is another generic language-learning course."

It is:

> "Practise exactly what you are currently learning at school, using a modern interactive learning experience."

Everything in the architecture, curriculum model and UX should reinforce that distinction.