# Tests

Exercise changed behavior through its public entry point and assert independently observable outcomes. Do not mock the subject under test or cap candidates in ways that hide regressions; each changed test must catch a concrete failure.

**Real, then fake, then stub, then mock.** Use the real dependency when it is fast, deterministic, and cheap to construct (value objects, collections, in-process logic). Use an in-memory fake at a slow, nondeterministic, or side-effecting boundary, and run the same contract tests against the fake and the real implementation. Use interaction assertions only for a side-effecting call with no fake, or when the call count is the behavior (a cache avoiding a database call). Legacy adds seams and fakes to get a first test into untestable code; that is a stop-gap, and once tests exist, push toward real implementations and remove test-only scaffolding.

**Tests are descriptive, not DRY.** Put literal inputs and expected values in each test; do not compute expectations with loops, conditionals, or the production logic. Extract a helper only for setup irrelevant to the behavior under test or for a single conceptual assertion. Group related asserts under one named behavior rather than one assert per test.

**Inject the clock and the storage.** Replace sleeps and wall-clock reads with an injected clock, and shared paths with temp directories or in-memory storage. Add a narrow test for new logic and one integration test for the wiring.

**Use coverage to locate untested branches in changed code, not as a target.** When asked to raise coverage, find the uncovered branches of the code you changed and write behavior assertions for them.

**A recurring bug class gets a cheap early check.** When the same bug class recurs, add a cheap early check (type, validation, assertion) rather than patching the instance. Do not add an early check that is slow or noisy enough to be bypassed.
