#!/bin/bash
# Stop hook: prompt to commit+push when tests pass and there are uncommitted changes.

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Fast check: any uncommitted changes to tracked source files?
changes=$(git diff --name-only HEAD -- 'src/' 'package.json' 'package-lock.json' '.claude/' 2>/dev/null)
untracked=$(git ls-files --others --exclude-standard -- 'src/' '.claude/' 2>/dev/null)

if [ -z "$changes" ] && [ -z "$untracked" ]; then
  exit 0
fi

# Source files changed — run tests (suppress all output)
if npm run test >/dev/null 2>&1; then
  echo '{"systemMessage":"✓ Tests pass and you have uncommitted changes. Consider: commit + push."}'
fi
