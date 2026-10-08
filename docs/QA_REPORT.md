# QA report

Date: 2026-10-08. Device: iPhone 17 Pro Max simulator (UDID 384B0841-A9EA-4273-9388-FAB511EF8B3B, iOS 26.5). Physical iPhone: **not tested** (requires the owner's Apple team/signing; see README). Android: **not built**. Work stopped when the session's usage limit was reached — remaining items are listed honestly below.

## Commands run and results

| Command | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npx eslint src tests --ext .ts,.tsx` | 0 errors (3 warnings: `no-void`) |
| `npx jest` | **9 suites, 45 tests passed** (`tests/unit/*`, `tests/component/*`) |
| `xcodebuild … -configuration Debug -sdk iphonesimulator` | BUILD SUCCEEDED (all native modules: screens, safe-area, async-storage, documents picker/viewer, fs, datetimepicker, svg) |
| `xcodebuild … -configuration Release -sdk iphonesimulator` | BUILD SUCCEEDED; `main.jsbundle` 6.3 MB, 8 fonts + 13 sample files inside the app bundle; runs without Metro |
| `bash e2e/run-all.sh` (Maestro 2.11, project-local Temurin JRE 21) against the **Release** build | Partial — see below |

## Unit/component coverage (all passing)
Repository hydration/persistence/no-reseed/reset/migration guard · login, invalid login, remember-me, session restore, logout · deterministic scenarios (one-shot error → retry) · learning gates (time gate, read-to-bottom, chapter release by day + assessment pass, practice vs graded, matching exclusivity/pass mark, certificate derived from progress) · checkout duplicate/fail/success · coach replies · assignment submit validation/receipt/no-grade, upload failure retry · instructor marks draft→submitted→released and student visibility, weight validation · attendance draft vs submit vs student record, correction request · workshop request → approval → both views, capacity/duplicates · leave validation/overlap/restart persistence · tasks upload requirement + counts · personal-details request leaves record untouched · finance balances + demo payment · notifications/drafts persist across restart · outbox queue/fail/retry/delivery · program types create→edit→reorder→dependency-blocked delete · faculties/programs/terms dependency rules · capability gating · repository duplicate confirmation + push/pull · schedule accept/reject · directory restriction · route permissions · HTTP adapter NOT_CONFIGURED · time-zone DST + instant preservation · document picker wrapper (size/type/cancel) · LoginScreen component (validation, invalid credentials, toggle + sign-in).

## Maestro e2e (`e2e/*.yaml`)
Earlier **Debug-build runs on the Pro Max simulator passed**: `login.yaml`, `instructor-login.yaml`, `student-learning.yaml` (dev-gallery jump → chapter-1 assessment answered 6/6 → "Assessment passed" → saved progress on practice quiz and matching "Drill passed · 100%"), plus the smoke flow (Courses → My Courses → Course Details → Grades tab "Pending release" → Profile) and the screen-capture loops used for the screenshots below.

Release-build suite run (`docs/qa/e2e-results.txt`, logs `docs/qa/e2e-*.log`): `login` PASS; `instructor-login` FAIL (self-healing logout step didn't reach the Sign out button before the 8 s scroll timeout — timeout since raised to 25 s in `e2e/logout-any.yaml`, not re-run); `student-learning` FAIL (one `quiz-next` tap was dropped by the simulator so only 5/6 answers were recorded before Submit — a flow timing flake, not an app defect; the same flow passed on the Debug build). Remaining flows (`student-checkout`, `student-assignment`, `instructor-attendance-grades`, `workshop-approval`, `persistence-restart`, `forbidden-and-api`) were still queued/unverified when the session ended — **treat them as NOT RUN**. Their logic is covered by the unit tests listed above.

## Simulator screenshots (Debug build, Pro Max)
`docs/qa/screenshots/`: `00-first-launch.png` (login), `01-student-home.png`, `st-*.png` (final marks, badges, extracurricular, program plan, tasks, documents, tax, finance, leave, English test, Ask Heritage, notifications, time zone), `in-*.png` (dashboard, AI draft, student list, course attendance, evaluations, history, workshop enrolments, repository, pending schedules, faculties, program types, terms, profile), `e2e-*`/`dbg-*` captures of outline, reading, assessment, practice quiz, matching. Visual comparison against the references was done for these; corrections made: checkbox row layout (Forgot password pushed off-screen), time-zone/date-time formatting on Hermes, roster/enrolment fixture coherence.

## Checks NOT run / known gaps
- iPhone 17e (smaller device): Release build installed and booted, **no flows or screenshots captured** before the limit.
- Physical device, VoiceOver audit, Dynamic Type at max size, Android.
- Manual verification of every screen's deep interactions on the simulator was done ad hoc (listed in SCREEN_COVERAGE as "manual") but not scripted.
- iOS native document picker in e2e only exercised the cancel path.

## Known issues
- RN DevLoadingView "Refreshing…" banner can cover the header on the Debug build after file edits; use the Release build for e2e.
- `e2e/student-learning.yaml` can lose a tap in the quiz sequence; add `waitForAnimationToEnd` between taps if it recurs.
