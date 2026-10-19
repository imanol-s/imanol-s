# Performance

**Optimize top-down, one change at a time.** Look first for a complexity-class or I/O-count improvement (index, sort then scan, batching, hoisting work out of a loop), then at system structure, and only last at per-iteration tricks. Apply one tuning change, re-time it on the same input, confirm outputs match, and keep it only if the gain is meaningful. Do not apply remembered micro-optimizations (unrolling, shifts, hoisting) in a high-level language without measuring on the target runtime.

**Bit vectors only for dense, bounded integer keys.** Compute universe size against element count before choosing; for sparse keys, strings, or counted duplicates, use a hash set or sorted array; in a high-level language use a bitset library.
