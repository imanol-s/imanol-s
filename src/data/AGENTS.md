# Typed data and derived views

- Export typed non-content data from this directory. Keep career/education in `src/data/career.ts` and project facts in Astro collections.
- Preserve every career role and supplied highlight without role-count caps. Edit career bullets only when explicitly requested; general copy improvements do not authorize those edits. When adding a current job, update the previous entry's `currentJob` flag.
- Keep project ordering in `src/data/projectCollection.ts`: dated projects newest first with stable ID tie-breaking, then undated projects in stable ID order. Use `src/utils/formatDate.ts` for UTC date display.
- Register project tags in `src/data/techRegistry.ts` before using them; use `keywords` for free-form topics. Archived post tags remain free-form.
