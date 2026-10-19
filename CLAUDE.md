@AGENTS.md

# Engineering guidance

## Always

- **Ceremony follows lifespan and blast radius.** One-off script, exploration, or code slated for deletion: no abstractions, test scaffolding, or compatibility shims. Shared module, production path, or many callers: the plainest construct plus the safety net the change needs. Lifespan unknown: assume long. Stop when the stated acceptance criteria are met and list further improvements as suggestions. This never licenses trimming checks on paths that write production data.
- **Match the existing idiom.** When adding to a module, CLI, or API with a recognizable style, do not introduce a preferred pattern beside the existing one. If the request conflicts with the system's model, say so instead of bolting it on. Exception: the idiom is the defect being fixed, or there is no dominant idiom.
- **Check the safety net before editing.** Before modifying a function, find whether an existing test exercises the exact path (run the suite, search tests for callers) and choose the approach from that answer, not from how readable the code looks. Types plus a higher-level suite count as tested. A trivial local edit (a constant, a message) needs only a targeted manual check. Edits to shared code, production writes, concurrency, or numeric and date handling are never trivial. If no test exercises the path, read `.claude/guidance/changing-code.md` before editing.
- **Cleanup stays on the path of the change.** Fix a defect in code you are already changing; report defects outside that path with their location. Do not widen the diff into neighboring modules, generated files, or vendored code. Mention larger smells in the summary.
- **One hat at a time.** Refactor in a separate step or commit from the behavior change, tests green, no assertion changes in the refactor step. A test that must change during a refactor step means the step was not behavior-preserving. When a feature is awkward to add, reshape first, scoped to this change, then add. If the build cannot stay green between steps, call it a restructuring and flag the risk.
- **One test per behavior, through the public entry point, asserting state.** One test per outcome (given state, input, outcome), not one per method. Assert return values and observable state, not which internal calls were made. After a refactor, existing tests pass unchanged; needing to edit them is a signal.
- **Measure before optimizing; take obvious algorithmic wins without measuring.** Before changing code for speed, time or profile on realistic input, report the baseline, and edit only the measured hot path. Without a profile: replace a list scan with a set lookup, remove per-item round trips and N+1 queries, avoid a quadratic structure on data known to be large.
- **State the cost behind a non-trivial choice.** When adding a dependency, abstraction, or process, give the concrete cost and the alternative in one line, after checking the repo's precedent. Do not deliberate over trivial reversible choices.
- **Comments say why.** Delete a comment only after confirming it restates the code. Write comments for rationale, rejected alternatives, constraints, invariants, units, non-obvious ordering, workarounds for external bugs, links to specs. A new public function whose edge cases are not evident from the signature gets an interface comment. Never strip comments during a refactor.

## Where sources disagree

Each pair is resolved by a condition, not a winner.

- Function length: extract on a mixed abstraction level or a nameable intent; keep a flat single-level sequence together. Repo conventions and lints decide first; when both apply, keep together.
- Comments: on a public or shared interface, write the contract comment; on team-internal code with clear names, prefer the code.
- Exceptions vs values: follow the language idiom; use values for expected frequent outcomes even in exception languages.
- Crash early vs continue degraded: read how the system already behaves on bad state and match it; crash on impossible internal state, never at a boundary with untrusted input or mid-batch where progress would be lost.
- DRY vs rule of three: extract immediately when two places encode the same knowledge that must change together; leave look-alike code until the third copy shows what varies.
- Wrap a dependency vs call it directly: wrap only when its types would spread or it is volatile; call directly when used once or when it is a stable standard type.
- Anticipate variation vs YAGNI: isolate a variation only when a second case exists or is stated; exception at boundaries that are expensive to change later.
- Real implementations vs test seams: seams and fakes get a first test into untestable code; once tests exist, push toward real implementations and remove test-only scaffolding.
- Parameter count: in named-argument languages, leave several named parameters rather than a wrapper type.
- Composition vs inheritance: compose by default; keep a shallow framework-mandated subclass as is.

## Read before

Before the first edit of any task, name which of the acts below the task involves, then read those files and no others. When a later step starts an act not named at first, read its file then. A task with no edit, or whose edits involve none of these acts, reads nothing. Do not read all of them at session start; each costs context.

- Before choosing an approach for a request that asks for a specific mechanism (a cache, an index, a rewrite, a new layer), spans several layers, or whose data size, shape, or run frequency is unstated: `.claude/guidance/before-writing.md`
- Before writing a new class, public function, module, wrapper, or adding a parameter or flag to an existing one: `.claude/guidance/interfaces.md`
- Before editing an if/else ladder or switch, adding a case to a function that already nests three deep, extracting a helper, writing index arithmetic, or comparing items pairwise: `.claude/guidance/functions.md`
- Before adding a try/except, assertion, validation, default branch, or any handling of a bad value: `.claude/guidance/errors.md`
- Before editing a function or command that no test calls, changing a signature with several callers, changing printed or returned output that callers or users see, or reviewing a diff: `.claude/guidance/changing-code.md`
- Before writing or editing a test, choosing a mock or fake, or acting on a coverage number: `.claude/guidance/tests.md`
- Before adding a retry, timeout, lock, cache, schema or field change, serialization, or any write that crosses a process, service, or database boundary: `.claude/guidance/data-boundaries.md`
- Before changing code because it is slow, including an algorithmic win taken without measuring: `.claude/guidance/performance.md`
