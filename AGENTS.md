# Maintained Chinese fork

This repository is an independently maintained fork of SongPaul/liquid-aqua-skin.
Before changing runtime code or syncing upstream, read `CUSTOMIZATIONS.zh-CN.md`
and `README.zh-CN.md`. The customization register is the durable source of the
user's requirements and records known limitations; keep it current.

- Maintain `feat/simplified-chinese` in `ethan-yangcheng/liquid-aqua-skin`.
  Do not switch the installation/update source back to upstream or open/reopen
  upstream PRs unless explicitly requested.
- Preserve C01–C05: built-in Simplified Chinese and localized AI prompts;
  directional 0.5 g yield stepping; confirmed-state sleep and guarded wake/hold/
  return behavior; optional preferred brewing-scale reconnection for late-on
  Bookoo Mini; fork update identity and existing user data.
- Merge upstream by behavior, not by blindly retaining old code. Equivalent
  upstream fixes are welcome. Do not replace the whole index.html or resolve
  conflicts wholesale with ours/theirs. Check every customization explicitly.
- Upstream's removal of automatic dosing-scale scans does not authorize removal
  of the user's optional preferred brewing-scale reconnect feature.
- Keep localization complete as upstream adds/removes keys. Retain regression
  coverage; adapt extraction points when code moves rather than weakening tests.
- For runtime changes, run `node tools/test/i18n.cjs`,
  `node tools/test/yield-step.cjs`, `node tools/test/sleep-scale.cjs`, and
  `git diff --check`, plus checks appropriate to the changed upstream features.
  Documentation-only changes need link/content review and diff checks, not
  runtime test reruns.
- Update the customization register's upstream baseline and validation history
  after sync. Keep runtime release versions in skin-manifest.json, sw.js and the
  Chinese README consistent. Documentation-only commits need no version bump.
- Distinguish offline tests from Android/Bookoo hardware validation. Do not claim
  the skin prevents Android process eviction or fixes whole-app Decaid restarts.
- Preserve user edits and credentials; do not print API keys or device secrets.
