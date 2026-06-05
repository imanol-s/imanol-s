#!/bin/bash
# PostToolUse hook for style-engineer agent
# Runs astro build after edits to style files to validate CSS compilation

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only validate files in the style layer scope
case "$FILE_PATH" in
  */src/styles/*|*.css)
    npx astro build 2>&1 | head -30
    exit ${PIPESTATUS[0]}
    ;;
  *)
    exit 0
    ;;
esac
