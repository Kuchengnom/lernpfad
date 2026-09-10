# Lernpfad publication preparation

Target: `git@github.com:Kuchengnom/lernpfad.git`. Visible branding is now Lernpfad. Existing `trailbook-local`, writer-lock and service-worker cache identifiers stay unchanged to preserve local compatibility. Backups remain readable; changing origin from localhost to GitHub Pages requires deliberate backup/import to move learner data.

Only original application code/content and Markdown research manifests are staged. Supplied reference media, local test evidence, dependencies, build output and environment files are ignored. Historical evaluation links to evidence are workspace-only, as noted in README.

GitHub Actions installs Node 22, runs unit/fixture/browser checks and publishes only the tested `dist` artifact. Pull requests are checked without deployment. Manual deployment is limited to `main`. The Pages project subdirectory is supported by the existing relative Vite base and manifest/worker URLs.

Verification: build, 27 unit checks and 14 browser flows pass. A separate static server at `/lernpfad/` passed project-scope, HTTP-cache-cleared offline reload, authoring prompt and lesson-start checks. Independent static review caught and corrected a manual-dispatch branch guard and an unbounded readiness wait in the deployment smoke script.

Access blocker: the supplied repository is readable and empty, but SSH authenticates the existing key as `haase3000`; GitHub rejects pushes to `Kuchengnom/lernpfad`. GitHub CLI 2.100.0 was installed with Homebrew. Its browser device authorization needs completion using an account with write/admin access. Once authorized, push the local commits, enable Pages with build type `workflow`, inspect Actions, then run `node scripts/check-pages.mjs https://kuchengnom.github.io/lernpfad/` against the live site. Do not claim live deployment before that succeeds.
