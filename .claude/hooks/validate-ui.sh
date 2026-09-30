#!/bin/bash
# PostToolUse hook for ui-engineer agent
# Runs astro check after edits to UI files (components, pages, hooks, utils)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only validate files in the UI layer scope
case "$FILE_PATH" in
  */src/components/*|*/src/pages/*|*/src/layouts/*|*/src/hooks/*|*/src/utils/*|*/src/content.config.ts)
    npx astro check 2>&1 | tail -20
    exit ${PIPESTATUS[0]}
    ;;
  *)
    exit 0
    ;;
esac
