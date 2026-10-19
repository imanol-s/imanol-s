# Changing existing code

**Characterize before changing untested code.** Run the code on chosen inputs, copy the observed output into the assertion, label the test as characterization, and name the quirks it pins. Cover only the paths about to change and their neighbors; normalize nondeterministic fields. If the observed behavior is the bug being fixed, do not pin it as correct.

**Use the seam you have.** To substitute a heavy dependency in a test, look for an existing enabling point (an injectable parameter, an overridable method, a module attribute the language's tooling can patch) before adding a new interface or test-only flag. When a long untested method must gain behavior and cannot be harnessed cheaply, write the new logic as a separately tested function and make a one-line call from the old method; do not insert twenty lines inline. Do not sprout when the new logic needs many of the old method's locals. Seams added only for tests are temporary; replace them with proper injection once tests exist.

**Refactor a smell only when it costs the current task something.** Ask what cost the smell imposes, and leave a long method, a data class at a boundary, or a single switch alone when the answer is none. Report smells in review as questions with the observed cost.

**Duplication: DRY for knowledge now, rule of three for look-alike code.** Extract immediately when two places encode the same business rule, validation, or decision that must change together, or when the copies are exact and adjacent. When two blocks merely look alike and may change for different reasons, leave the second copy and extract at the third, when what varies is visible.

**Refactor to understand, then revert.** When code is too tangled to explain after reading it, rename and extract in a scratch branch or stash to learn its structure and seams, record what you learned, revert, and make the real change minimally. Keep only clarifying renames that plainly help the task. Skip this when callers, tests, or a quick run answer the question.

**Observable behavior is the real contract for widely used code.** Before changing iteration order, an exception type, output formatting, a log line, or any observable detail of a shared library, public function, CLI, or file format, search for consumers and check what they rely on. The docstring not promising the behavior is not enough. For private single-caller code, just change it.

**Change many callers by expanding, migrating, then contracting.** For a signature or field change with several callers, add the new form beside the old, delegate the old to it, migrate callers in batches that each pass tests, and remove the old form when the last caller is gone. For persisted data and messages, add new fields as optional with defaults, split renames and removals into expand, migrate, contract, and set an end date for the compatibility shim. For one or two callers in the same file, edit directly. For a mechanical edit across many files, write a script, land a shim first, and migrate in verifiable shards.

**Assume your own code before the library.** Bisect toward the cause and suspect a library or compiler only when a documented issue or version regression points there. After a fix, search for the same defect class in sibling code paths and run the tests that cover the callers, not only the new regression test.

# Review

**Review tests and design before style.** Flag missing or weak tests and design problems first. Drop comments a formatter or linter already enforces. Do not demand your preferred approach when the author's works; object to an approach only for a concrete defect (correctness, security, unsustainable complexity). Name the specific coupling (for example, a concrete type constructed in the middle of business logic) and tie it to a real change, instead of generic "could be more flexible" remarks. When a reviewer reports code as non-obvious, accept the report and change the code rather than defending it.

**Name a pattern only when the structure matches.** Name a pattern in prose only when the structure matches closely. Prefer domain names for identifiers; do not suffix classes with pattern names. Do not rename existing code to a pattern name as a refactor.
