#!/bin/bash
# decision-log-capture.sh — PostToolUse hook: append decision log entry
# Matcher: Edit|Write|Bash (set in settings.json)
# Runs async to avoid blocking the session.
#
# v2 fixes (from two-agent loop iteration 1):
#   - git -C/--git-dir flags no longer bypass read-only filter
#   - agent_id captured for subagent attribution
#   - jq, python3 -m json.tool/py_compile added to filter
#   - relative path falls back to CLAUDE_PROJECT_DIR (handles worktrees)
# v3 fixes (from two-agent loop iteration 2):
#   - strip leading "cd /path && " before filtering (common Bash tool pattern)

INPUT=$(cat)

TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
SESSION_ID="${CLAUDE_SESSION_ID:-$(echo "$INPUT" | jq -r '.session_id // "unknown"')}"
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty')
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

LOG_DIR="$HOME/.claude/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/${SESSION_ID}.jsonl"

# For relative path display, try CWD first, then CLAUDE_PROJECT_DIR (handles worktrees)
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$CWD}"

case "$TOOL" in
  Edit|Write)
    FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
    REL_PATH="${FILE_PATH#$CWD/}"
    [ "$REL_PATH" = "$FILE_PATH" ] && REL_PATH="${FILE_PATH#$PROJECT_DIR/}"
    ACTION="edited"
    [ "$TOOL" = "Write" ] && ACTION="wrote"
    jq -cn \
      --arg ts "$TS" --arg tool "$TOOL" --arg file "$FILE_PATH" \
      --arg summary "$ACTION $REL_PATH" --arg cwd "$CWD" --arg agent "$AGENT_ID" \
      '{ts:$ts, tool:$tool, file:$file, summary:$summary, cwd:$cwd} + (if $agent != "" then {agent:$agent} else {} end)' \
      >> "$LOG_FILE"
    ;;
  Bash)
    CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
    # Normalize: strip leading "cd /path && " prefixes, then git -C/--git-dir flags
    NORM_CMD=$(echo "$CMD" | sed -E 's/^([[:space:]]*(cd[[:space:]]+[^;&|]+[[:space:]]*&&[[:space:]]*))+//; s/git[[:space:]]+(-[Cc][[:space:]]+[^[:space:]]+[[:space:]]+|--git-dir=[^[:space:]]+[[:space:]]+|--work-tree=[^[:space:]]+[[:space:]]+)*/git /g')
    # Skip read-only / diagnostic commands
    if echo "$NORM_CMD" | grep -qE '^[[:space:]]*(git[[:space:]]+(status|log|diff|show|branch|stash|fetch|remote|tag)([[:space:]]|$)|ls([[:space:]]|$)|cat[[:space:]]|head[[:space:]]|tail[[:space:]]|wc[[:space:]]|pwd$|which[[:space:]]|type[[:space:]]|echo[[:space:]]|printf[[:space:]]|file[[:space:]]|stat[[:space:]]|find[[:space:]]|grep[[:space:]]|rg[[:space:]]|node[[:space:]]+(--version|-v)|bun[[:space:]]+(--version|-v)|python3[[:space:]]+--version|npm[[:space:]]+--version|jq[[:space:]]|python3[[:space:]]+-m[[:space:]]+(json\.tool|py_compile)[[:space:]])'; then
      exit 0
    fi
    CMD_SHORT=$(echo "$CMD" | head -c 200)
    jq -cn \
      --arg ts "$TS" --arg tool "Bash" --arg cmd "$CMD_SHORT" \
      --arg summary "ran: $CMD_SHORT" --arg cwd "$CWD" --arg agent "$AGENT_ID" \
      '{ts:$ts, tool:$tool, cmd:$cmd, summary:$summary, cwd:$cwd} + (if $agent != "" then {agent:$agent} else {} end)' \
      >> "$LOG_FILE"
    ;;
esac
