# Changelog

Notable user-facing changes are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Planned

- Additional UI patterns and Prompt practice exercises.

### Added

- Persistent Simplified Chinese and English switching across every route.
- Optional Google or email-code accounts for syncing learning progress across devices.
- Local-first progress for lessons, terms, quiz best score, and Prompt Lab evaluation.
- Privacy-preserving community milestones and self-service account deletion.

### Fixed

- Kept background placeholder lines behind the scrim and dialog in the Modal Dialog preview.
- Kept account progress changes intact when stale page saves arrive during navigation or cross-device sync.
- Centered the sign-in dialog and kept the save-progress prompt visible while scrolling.
- Made account sync status visible from the closed profile control and simplified destructive account actions.
- Turned early community proof into a clear sign-in action for signed-out learners.
- Clarified founding-learner copy for signed-in and signed-out learners.
- Let learners dismiss the sign-in dialog by clicking its backdrop.
- Kept quiz results in view on narrow screens after the final answer.
- Linked every course-map lesson to a relevant in-page section instead of a shared route top.
- Matched the Motion hero badge to the playground's default duration and easing.
- Preserved newer local progress during initial cloud sync and prevented in-flight writes from surviving account deletion.

## [0.1.0] - 2026-07-16

### Added

- Multi-page learning experience with a course map, UI dictionary, motion playground, quiz, and Prompt lab.
- Device-local learning progress.
- Responsive navigation and accessible interaction states.
- Verified ChatGPT Sites and Vercel build paths.
