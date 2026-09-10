# Learner fixtures

Tests construct fresh and completed learners from the real Unit 1A curriculum with fixed timestamps. This keeps fixture progress reproducible against the current schema and avoids committing real child data. See tests/validation.test.js and tests/engine.test.js. The browser suite exports a synthetic learner and restores it into an isolated fresh context.
