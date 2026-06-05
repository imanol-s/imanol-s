#!/bin/bash
# PostToolUse hook for infra-ops agent
# Runs full build after edits to config/CI files to catch misconfigurations

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only validate files in the infra layer scope
case "$FILE_PATH" in
  */astro.config.*|*/tsconfig.json|*/package.json|*/.nvmrc|*/.github/*|*/netlify.toml|*/vitest.config.*)
    npm run build 2>&1 | tail -20
    exit ${PIPESTATUS[0]}
    ;;
  *)
    exit 0
    ;;
esac
