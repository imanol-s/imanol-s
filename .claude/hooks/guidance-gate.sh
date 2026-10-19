#!/usr/bin/env bash
# PreToolUse hook. On the first file-changing tool call of a session (per working
# directory), inject the "Read before" index from the nearest CLAUDE.md so the
# applicable guidance files are read at the moment of the first edit.
input=$(cat)
read -r tool sid cwd cmd < <(printf '%s' "$input" | python3 -c '
import sys, json
d = json.load(sys.stdin)
ti = d.get("tool_input") or {}
cmd = (ti.get("command") or "").replace("\n", " ")
print(d.get("tool_name", ""), d.get("session_id", "nosid"), d.get("cwd", "."), cmd)
' 2>/dev/null || echo "" "" "." "")
[ -n "$tool" ] || exit 0
case "$tool" in
  Edit|Write|MultiEdit|NotebookEdit) ;;
  Bash) printf '%s' "$cmd" | grep -Eq '(>>?|\btee\b|\bsed -i\b|\bmv\b|\bcp\b|\brm\b|\bpatch\b|git apply|\bpip install|\bnpm install)' || exit 0 ;;
  *) exit 0 ;;
esac
state="${TMPDIR:-/tmp}/guidance-gate-$(printf '%s|%s' "$sid" "$cwd" | md5sum | cut -c1-16)"
[ -e "$state" ] && exit 0
touch "$state"
src=""
for c in "${CLAUDE_PROJECT_DIR:-$cwd}/CLAUDE.md" "$cwd/CLAUDE.md" "$HOME/.claude/CLAUDE.md"; do
  if [ -f "$c" ] && grep -q '^## Read before' "$c"; then src="$c"; break; fi
done
[ -n "$src" ] || exit 0
section=$(awk '/^## Read before/{f=1} f' "$src")
python3 - "$section" <<'PY'
import json, sys
section = sys.argv[1]
msg = ("First file change of this session. Before it: name which of the acts below this task involves, "
       "read those guidance files now, and none of the others. If no act applies, proceed.\n\n" + section)
print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": msg}}))
PY
