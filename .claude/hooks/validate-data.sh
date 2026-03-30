#!/bin/bash
# PostToolUse hook for data-manager agent
# Runs astro check after edits to data/content files to catch schema and tag errors

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only validate files in the data layer scope
case "$FILE_PATH" in
  */src/data/*|*/src/config.ts|*/src/content.config.ts|*/src/content/*)
    npx astro check 2>&1 | tail -20
    exit ${PIPESTATUS[0]}
    ;;
  *)
    exit 0
    ;;
esac
