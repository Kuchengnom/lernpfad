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
