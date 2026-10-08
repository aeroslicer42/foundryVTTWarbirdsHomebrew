# Releasing

Two packages ship together: the system (`warbirds`) and the homebrew module (`warbirds-homebrew`), each in its own
GitHub repository with the same release workflow. They are versioned in step: the module's manifest names the
system version it was built against.

## One-time setup

1. Create the two repositories on GitHub (`warbirds` and `warbirds-homebrew`), public.
2. Replace `YOUR-GITHUB-USER` with your GitHub user or organisation in `system.json` (system) and `module.json`
   (module — it appears twice: the module's own URLs and the system dependency's manifest), then commit.
   From each package folder: `sed -i 's/YOUR-GITHUB-USER/<user>/g' system.json` / `module.json`.
3. Push `main`. The workflow in `.github/workflows/release.yml` needs nothing else: it uses the repository's own
   `GITHUB_TOKEN` to create releases.

## How Foundry finds updates

The repository is `aeroslicer42/foundryVTTWarbirds`; releases are tagged with the bare version (`0.6.1`) and carry
two assets, `system.json` and `warbirds.zip` (the package files at the zip root, no wrapping folder, no `.git`).

- `manifest`: `https://github.com/aeroslicer42/foundryVTTWarbirds/releases/latest/download/system.json` — always the
  manifest of the newest (non-pre-release) release. This is also the URL to paste into *Install System*.
- `download`: `https://github.com/aeroslicer42/foundryVTTWarbirds/releases/download/<version>/warbirds.zip`.

Only these raw-file URLs work in Foundry; a link to a GitHub page (`…/releases/tag/…`, `…/blob/…`, the repository
itself) returns HTML, which Foundry reports as "Unexpected token '<'".

Versions must stay plain numbers (`0.6.1`, `0.7.0`, `1.0.0`): Foundry compares them numerically, segment by
segment, and would treat `0.6.0-beta.2` as *newer* than the final `0.6.0`.

## Cutting a release

1. **Bump the version** in three places: `warbirds/system.json` (`version` and the `download` URL),
   `warbirds-homebrew/module.json` (`version`, `download`, and `relationships.systems[0].compatibility.minimum`
   when the module needs the new system) and `packs-src/common.py` (`SYSTEM_VERSION`, stamped into every
   compendium document) in the development folder.
2. **Rebuild the packs** from the development folder: `python3 build.py && python3 homebrew.py && node ../pack.mjs`
   (core packs land in the system, `homebrew-*` packs in the module). The compiled LevelDB packs are committed
   (minus their `LOCK`/`LOG` files, which Foundry recreates).
3. **Run the checks**: `node --check` over `module/**/*.mjs`, `node check-templates.mjs ../warbirds`,
   `node mock/test-templates.mjs`, `node mock/test-models.mjs`, `node mock/test-packs.mjs`,
   `node mock/test-rolls.mjs`, `node mock/preview.mjs`.
4. **Write the changelog entry** (`CHANGELOG.md`, a `## <version> …` heading): the workflow uses that section as
   the release notes.
5. **Commit and tag**: `git commit -am "Release 0.6.2"`, `git tag 0.6.2`, `git push && git push --tags`.
   The tag must be the manifest version (with or without a leading `v`); the workflow refuses anything else, as well
   as a download URL that does not match `releases/download/<tag>/warbirds.zip`. Releasing by hand works too: create
   the release with that tag and attach `system.json` and a `warbirds.zip` zipped from *inside* the package folder.
6. The **Release** action builds the zip (manifest at the zip root, the layout Foundry's installer expects),
   attaches it and the manifest to a new GitHub release, and Foundry's *Update* button picks it up from the
   manifest URL.
7. Update `DECISIONS.md` in the development folder with what changed.

## Installing from a release by hand

Download the zip, create `Data/systems/warbirds/` (or `Data/modules/warbirds-homebrew/`) and unzip **into** that
folder: the zip holds the package's files, not a wrapping folder.
