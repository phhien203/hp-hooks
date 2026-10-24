# Contributing to hp-hooks

This guide covers the complete workflow for adding a React hook, exercising it
in the playground, and releasing a new version of `@hp-hooks/react`.

## Prerequisites

- Node.js 22.18 or newer. CI currently runs Node.js 24.
- Vite+ (`vp`).
- Write access to the repository for releases.
- Permission to publish `@hp-hooks/react` on npm. npm trusted publishing must be
  configured for this repository and its `npm` GitHub environment.

Install the workspace dependencies from the repository root:

```bash
vp install
```

## Create a hook

1. Create a feature branch from an up-to-date `main` branch.

   ```bash
   git switch main
   git pull --ff-only
   git switch -c feat/use-example
   ```

2. Add the hook to `packages/react/src/hooks/`. Use a camel-cased filename that
   matches the exported function, for example:

   ```text
   packages/react/src/hooks/useExample.ts
   ```

3. Export the hook and any public types from both barrels:

   - `packages/react/src/hooks/index.ts`
   - `packages/react/src/index.ts`

   `packages/react/src/index.ts` is the package's public entry point, so an
   export there is required for consumers to import the hook from
   `@hp-hooks/react`.

4. Add browser tests next to the hook:

   ```text
   packages/react/src/hooks/useExample.test.tsx
   ```

   Use the existing `useMediaQuery.test.tsx` as a pattern. Tests run in a real,
   headless Chromium browser through Vite+ and Playwright. Cover the initial
   value, updates, cleanup, and relevant edge cases. If the hook supports
   server-side rendering, also cover its server fallback or hydration behavior.

5. Add the hook to the **Available Hooks** table and include a usage example in
   both `README.md` and `packages/react/README.md`.

## Test the hook in the playground

The playground depends on `@hp-hooks/react` through the workspace, so import
the hook exactly as a package consumer would:

```tsx
import { useExample } from '@hp-hooks/react'
```

Add a small interactive example to `apps/playground/src/App.tsx`. The example
should make the hook's inputs and current output visible and should include any
controls needed to exercise state changes and edge cases.

Start the playground from the repository root:

```bash
vp -C apps/playground dev
```

Open `http://localhost:5173`, interact with the example, and check the browser
console for errors. When the hook responds to browser or viewport state, test
the relevant changes manually (for example, resizing the window or changing a
media preference).

## Verify the change

Run the same essential checks as CI before opening a pull request:

```bash
vp check
vp -C packages/react test
vp -C packages/react pack
vp -C apps/playground build
(cd packages/react && npm pack --dry-run)
```

Review the dry-run package contents. Only the built `dist` files and package
metadata should be included; source tests and playground files must not be
published.

Commit the implementation and open a pull request. CI repeats the quality
checks, browser tests, library build, playground build, and package inspection.
Merge only after CI passes.

## Bump the package version

Version and release from a clean, up-to-date `main` branch after the hook change
has been merged. Only `packages/react/package.json` contains the publishable
version; the root and playground packages remain private at `0.0.0`.

Choose the next version according to semantic versioning:

- `patch`: backward-compatible fixes or small behavior corrections.
- `minor`: a new backward-compatible hook or feature.
- `major`: a breaking public API or behavior change.

Use the package's `bumpp` dependency to update its version without creating a
commit, tag, or push automatically. Replace `minor` as appropriate:

```bash
git switch main
git pull --ff-only
vp -C packages/react exec bumpp minor --no-commit --no-tag --no-push
```

Confirm that the version is correct and that no unrelated files changed:

```bash
git diff -- packages/react/package.json
git status --short
```

Run the verification commands again, then create and push the release commit.
Replace `X.Y.Z` with the version in `packages/react/package.json`:

```bash
git add packages/react/package.json
git commit -m "chore: release vX.Y.Z"
git push origin main
```

Wait for CI on `main` to pass before publishing the release.

## Release the package

Publishing a GitHub Release triggers `.github/workflows/publish.yaml`; do not
run `npm publish` locally.

1. In GitHub, open **Releases** and select **Draft a new release**.
2. Create the tag `vX.Y.Z`, targeting the release commit on `main`. The tag must
   exactly match the package version with a leading `v`.
3. Title the release `vX.Y.Z`, generate or write the release notes, and review
   them.
4. Publish the GitHub Release.
5. Watch the **Publish to npm** workflow. It verifies the tag/version match,
   runs checks and browser tests, builds and inspects the package, and publishes
   `@hp-hooks/react` to npm.
6. Confirm the published version after the workflow succeeds:

   ```bash
   npm view @hp-hooks/react version
   ```

If the workflow fails, fix the cause and rerun it. Do not reuse a version that
has already been published to npm; bump to a new version instead.
