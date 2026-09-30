#!/bin/bash
# run-tests-async.sh — async PostToolUse hook for Astro type-checking

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only run for source files that astro check validates
if [[ "$FILE_PATH" != *.astro && "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

# Run astro check and report results via systemMessage
RESULT=$(npx astro check 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "{\"systemMessage\": \"astro check passed after editing $FILE_PATH\"}"
else
  # Escape JSON-unsafe characters in output, truncate to last 30 lines
  ESCAPED=$(echo "$RESULT" | tail -30 | jq -Rs .)
  echo "{\"systemMessage\": \"astro check failed after editing $FILE_PATH:\\n${ESCAPED}\"}"
fi
