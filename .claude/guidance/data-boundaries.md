# Data and distributed systems

**Idempotency before retry.** Generate or derive the operation ID once per logical operation, before the retry loop, and pass it on every attempt; or rewrite the write as set-to-value or upsert with a uniqueness constraint. Never wrap a non-idempotent call (increment, append, create, send) in a bare retry. Where a handler's effect leaves the transactional boundary (HTTP call, email, external write), add a dedup record there; a framework's exactly-once setting does not cover it. Retention of the dedup store must exceed the maximum replay window.

**A timeout means unknown, not failed.** After a timed-out write to a remote system, verify the target state or retry with the same idempotency key before marking the operation failed or re-submitting. Reads and idempotent writes can be retried without ceremony.

**Code for old and new data shapes during any rollout.** Add fields as optional with defaults; readers ignore unknown fields. On read-modify-write of a record with typed models, patch the specific fields instead of rebuilding the record from the known subset, unless the output is a deliberately curated projection. Regenerated-every-run data needs no shims.

**No language-native serialization for data that outlives the process or crosses a service.** Use JSON with explicit field names and defaults, or a schema format, with a version field for hand-rolled layouts. Native serialization is fine for same-version same-process hand-off. Schema registries are overkill for one producer and one consumer in a small internal tool.

**Read-then-write is a race unless made atomic.** For counters, uniqueness, and cross-row invariants, use an atomic update, a database constraint, or compare-and-set with a version column instead of application-level read-modify-write, and state the isolation level assumed. For an edit flow that holds data across requests, guard the save with a version or ETag check and handle the zero-rows-affected case with a defined path. Skip the version column where last-write-wins is acceptable. Serializable transactions need retry-on-abort or they turn races into errors.

**Use a monotonic clock for durations and sequence numbers for ordering.** Order events across machines and resolve conflicts with sequence numbers or versions, not wall-clock timestamps. Timestamps stay for display, logs, and generous TTLs.

**State whether a lock is for correctness or efficiency.** For correctness across processes, the resource must check a fencing token, or the design must use a single writer per partition; a lease with a TTL alone is advisory. In-process locks and single-transaction locks do not have this problem.

**One system of record.** Write to the source of record in one transaction (plus an outbox row if a downstream needs it) and let a consumer update caches, indexes, and exports; do not issue two independent writes from application code. When a requirement names audit, undo, replay, or resumable per-item progress, append a per-item result record and derive status from it; do not introduce event sourcing into plain CRUD.

**Coordination matched to the invariant.** Enforce uniqueness and balance constraints with a database constraint or a single-partition writer; let non-critical reads be stale. Do not use eventually consistent reads for a hard constraint, and do not add distributed locks for data that tolerates compensation. After a write, read the result from the write response or the primary with a bounded wait, not from a lagging replica, index, or cache.
