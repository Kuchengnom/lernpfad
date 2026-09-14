# Lernpfad publication preparation

Target: `git@github.com:Kuchengnom/lernpfad.git`. Visible branding is now Lernpfad. Existing `trailbook-local`, writer-lock and service-worker cache identifiers stay unchanged to preserve local compatibility. Backups remain readable; changing origin from localhost to GitHub Pages requires deliberate backup/import to move learner data.

Only original application code/content and Markdown research manifests are staged. Supplied reference media, local test evidence, dependencies, build output and environment files are ignored. Historical evaluation links to evidence are workspace-only, as noted in README.

GitHub Actions installs Node 22, runs unit/fixture/browser checks and publishes only the tested `dist` artifact. Pull requests are checked without deployment. Manual deployment is limited to `main`. The Pages project subdirectory is supported by the existing relative Vite base and manifest/worker URLs.

Verification: build, 27 unit checks and 14 browser flows pass. A separate static server at `/lernpfad/` passed project-scope, HTTP-cache-cleared offline reload, authoring prompt and lesson-start checks. Independent static review caught and corrected a manual-dispatch branch guard and an unbounded readiness wait in the deployment smoke script.

## Live deployment diagnosis — 2026-09-11

The user successfully pushed commits through `4c2edee` to `main`. Custom workflow run [34516191587](https://github.com/Kuchengnom/lernpfad/actions/runs/34516191587) passed every build/check step and uploaded the tested artifact, but `actions/configure-pages` failed with `Get Pages site failed` / `Not Found`, instructing that Pages must be enabled and configured for GitHub Actions.

A separate legacy Pages run [34517196774](https://github.com/Kuchengnom/lernpfad/actions/runs/34517196774) succeeded afterward. The public HTML still references `/app/main.js`, demonstrating that it published repository source rather than the Vite `dist` artifact. The relative Vite base is already verified locally; changing it will not fix the publishing source.

Recovery: in repository Settings → Pages → Build and deployment, set Source to **GitHub Actions**. Then open **Check and deploy Lernpfad**, choose **Run workflow** on `main`, and wait for both build and deploy to succeed. Finally run `node scripts/check-pages.mjs https://kuchengnom.github.io/lernpfad/` and inspect the rendered app. No live success is claimed until those checks pass. CLI access remains unauthenticated; changing repository settings requires an authenticated session with the necessary repository rights.

## Successful deployment and live verification — 2026-09-11

The user reran the custom workflow: [34579670888](https://github.com/Kuchengnom/lernpfad/actions/runs/34579670888). Both build and deployment succeeded at commit `4c2edee`. Public HTML now loads `./assets/index-1N0XLeJa.js` and the compiled CSS. The Node 20 deprecation annotations did not prevent successful artifact upload or publishing.

`node scripts/check-pages.mjs https://kuchengnom.github.io/lernpfad/` passed against the public deployment: app rendering, exact worker scope, HTTP-cache-cleared offline reload, French authoring access, lesson start and no page exceptions. A separate isolated browser rendered the home dashboard correctly; screenshot `experiment/evidence/pages-live-home.png` was visually inspected. The offline exercise screenshot is `experiment/evidence/pages-offline.png`. These evidence files remain local and ignored.

Independent source review found no deployment-path defect. If an existing browser still shows the earlier failed page, hard reload or open `https://kuchengnom.github.io/lernpfad/?v=4c2edee`. Cached old HTML is a possible explanation, not a confirmed diagnosis of the user's browser. Avoid clearing site data as a first step because that would remove learner progress.

## Competing publisher found during mobile update — 2026-09-11

Commit `156853d` contains the tested pasted-JSON workflow and scout assets and was pushed successfully. GitHub started both the custom workflow `34618334911` and a dynamic Jekyll workflow `34618333453` on that commit. Independent review inspected the dynamic job's explicit `Build with Jekyll` step. Public HTML was observed reverting to `/app/main.js`, so a successful custom deployment is not a durable fix while the branch publisher remains active.

The existing `configure-pages@v5` action reads the existing Pages site; it does not change its publishing source. Set repository Settings → Pages → Source to **GitHub Actions**, allow any already-running legacy deployment to finish (or cancel it), then run **Check and deploy Lernpfad** on `main` again. Repository administration is currently blocked by missing authenticated CLI access; the user has been asked to check the source setting. Do not report this update as stably live until the competing publisher is disabled and the latest public HTML and workflow pass inspection.

## Competing publisher resolved — 2026-09-12

The user switched the repository Pages source to GitHub Actions. Live HTML at
`https://kuchengnom.github.io/lernpfad/` now references the compiled bundle
`./assets/index-CuaV9UDd.js` and its hashed stylesheet, with no `/app/main.js` reference, so
the custom workflow's tested `dist` artifact is what is being served. The legacy Jekyll
publisher no longer overwrites it.

Verification used the *published* commit's own smoke script, extracted with
`git show 156853d:scripts/check-pages.mjs`, because the working tree's copy has since been
extended for the root swap and would fail against the older deployed structure. Result:

`PASS https://kuchengnom.github.io/lernpfad/: app, project scope, uncached offline reload,
authoring and lesson start.`

This closes the durable-publication item. The mobile pasted-import and scout artwork in
`156853d` are now genuinely live. The root swap (landing page at `/`, application at
`lernen.html`) is prepared locally and can now be pushed against this known-good baseline;
after that push, the working tree's `scripts/check-pages.mjs` is the correct one to run.
