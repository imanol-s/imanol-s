# test-server

Validate the current state of the site by building, serving, and visually inspecting every page.

## Steps

### 1. Build

Run `npm run build` in the workspace root. This executes `astro check && astro build`.

- If the build **fails**, stop immediately. Report the exact error output and do not proceed.
- If the build **succeeds**, continue to the next step.

### 2. Start preview server

Run `npm run preview -- --port 4321`.

- If port 4321 is occupied, kill the existing process on that port (`lsof -ti:4321 | xargs kill -9`) and retry on 4321.
- Wait until the server reports it is ready (look for the "Local" URL in stdout).
- Background the process — do not block on it.

### 3. Visual inspection via browser

Using the `cursor-ide-browser` MCP tools, inspect every key page. For **each** page listed below:

1. `browser_navigate` to the URL (with `take_screenshot_afterwards: true`).
2. `browser_snapshot` to capture the accessibility tree.
3. `browser_console_messages` to check for runtime errors.
4. `browser_network_requests` to check for failed requests (4xx/5xx).
5. Scroll down (`browser_scroll`) and take a second screenshot if the page has below-the-fold content.

**Pages to visit** (on `http://localhost:4321`):

| Route | What to verify |
|---|---|
| `/` | Hero renders, navigation links work, sections visible |
| `/blog` | Blog listing page loads, post cards render |
| `/projects` | Project listing page loads, project cards render |

### 4. Report

After visiting all pages, produce a summary with:

- **Build**: pass/fail
- **Preview server**: running on port 4321 (yes/no)
- **Per-page results table**:
  - Page URL
  - Screenshot taken (yes/no)
  - Console errors (count, or "none")
  - Failed network requests (count, or "none")
  - Visual issues spotted (brief note, or "looks good")
- **Overall verdict**: PASS or FAIL with actionable notes

### 5. Cleanup

Stop the preview server process when inspection is complete.
