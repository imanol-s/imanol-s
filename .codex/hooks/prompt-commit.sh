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
  printf '{"systemMessage":"\033[32m✓ Tests pass\033[0m and you have uncommitted changes. Consider: \033[1mcommit + push\033[0m."}\n'
else
  printf '{"systemMessage":"\033[31m✗ Tests failing\033[0m — fix before committing."}\n'
fi
