import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checker = join(sourceRoot, "scripts/git-identity.mjs");
const expectedEmail = "72887568+imanol-s@users.noreply.github.com";
const wrongEmail = "wrong@example.com";

function fixture(t) {
  const testRoot = mkdtempSync(join(tmpdir(), "portfolio-git-identity-"));
  t.after(() => rmSync(testRoot, { recursive: true, force: true }));
  const repo = join(testRoot, "repo");
  mkdirSync(repo);
  const globalConfig = join(testRoot, "global.gitconfig");
  writeFileSync(
    globalConfig,
    `[user]\n\tname = Inherited User\n\temail = ${wrongEmail}\n`,
  );
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (
      key.startsWith("GIT_") ||
      key === "EMAIL" ||
      key === "NODE_TEST_CONTEXT"
    )
      delete env[key];
  }
  Object.assign(env, {
    CI: "",
    GIT_CONFIG_GLOBAL: globalConfig,
    GIT_CONFIG_NOSYSTEM: "1",
  });
  const run = (command, args, overrides = {}, input) => {
    const result = spawnSync(command, args, {
      cwd: repo,
      env: { ...env, ...overrides },
      encoding: "utf8",
      input,
      timeout: 15000,
    });
    assert.ifError(result.error);
    return result;
  };
  const git = (args, overrides) => run("git", args, overrides);
  const check = (args = [], overrides, input) =>
    run(process.execPath, [checker, ...args], overrides, input);
  assert.equal(git(["init", "-q"]).status, 0);
  return { repo, testRoot, globalConfig, env, run, git, check };
}

function setup(f) {
  const result = f.check(["--setup"]);
  assert.equal(result.status, 0, result.stderr);
}

test("setup writes only repo-local identity and hooks; inherited global config stays unchanged", (t) => {
  const f = fixture(t);
  const originalGlobal = readFileSync(f.globalConfig, "utf8");
  setup(f);
  assert.equal(
    f.git(["config", "--local", "user.name"]).stdout.trim(),
    "Imanol Saldana",
  );
  assert.equal(
    f.git(["config", "--local", "user.email"]).stdout.trim(),
    expectedEmail,
  );
  assert.equal(
    f.git(["config", "--local", "core.hooksPath"]).stdout.trim(),
    ".husky",
  );
  assert.equal(readFileSync(f.globalConfig, "utf8"), originalGlobal);
  assert.equal(f.check().status, 0);
});

test("checker rejects inherited wrong global identity", (t) => {
  const f = fixture(t);
  const result = f.check();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /GIT_AUTHOR_IDENT/);
  assert.match(result.stderr, /setup:git-identity/);
});

for (const identity of ["GIT_AUTHOR_EMAIL", "GIT_COMMITTER_EMAIL"]) {
  test(`checker catches ${identity} overrides despite correct local configuration`, (t) => {
    const f = fixture(t);
    setup(f);
    const result = f.check([], { [identity]: wrongEmail });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(identity.replace("EMAIL", "IDENT")));
  });
}

test("enabled pre-commit blocks wrong identity before linting or creating a commit", (t) => {
  const f = fixture(t);
  setup(f);
  mkdirSync(join(f.repo, "scripts"));
  writeFileSync(
    join(f.repo, "scripts/git-identity.mjs"),
    readFileSync(checker),
  );
  mkdirSync(join(f.repo, ".husky"));
  writeFileSync(
    join(f.repo, ".husky/pre-commit"),
    readFileSync(join(sourceRoot, ".husky/pre-commit")),
    { mode: 0o755 },
  );
  const bin = join(f.testRoot, "bin");
  mkdirSync(bin);
  const marker = join(f.testRoot, "lint-ran");
  writeFileSync(
    join(bin, "npx"),
    '#!/bin/sh\nprintf ran > "$IDENTITY_TEST_MARKER"\n',
    { mode: 0o755 },
  );
  const result = f.git(
    ["commit", "--allow-empty", "-m", "test: guard wrong identity"],
    {
      GIT_AUTHOR_EMAIL: wrongEmail,
      PATH: `${bin}:${f.env.PATH}`,
      IDENTITY_TEST_MARKER: marker,
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Git identity check failed/);
  assert.throws(() => readFileSync(marker));
  assert.notEqual(f.git(["rev-parse", "--verify", "HEAD"]).status, 0);
});

test("pre-push checks wrong tip identities but accepts a corrected tip over historical contributors", (t) => {
  const f = fixture(t);
  setup(f);
  assert.equal(
    f.git(["commit", "--allow-empty", "-qm", "test: historical identity"], {
      GIT_AUTHOR_EMAIL: wrongEmail,
    }).status,
    0,
  );
  const wrongTip = f.git(["rev-parse", "HEAD"]).stdout.trim();
  const remote = "0".repeat(40);
  const input = (sha) => `refs/heads/test ${sha} refs/heads/test ${remote}\n`;
  const rejected = f.check(["--pre-push"], {}, input(wrongTip));
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /tip author/);
  assert.equal(
    f.git(["commit", "--allow-empty", "-qm", "test: correct new tip"]).status,
    0,
  );
  const correctTip = f.git(["rev-parse", "HEAD"]).stdout.trim();
  assert.equal(f.check(["--pre-push"], {}, input(correctTip)).status, 0);
});

test("CI skips setup without changing local configuration", (t) => {
  const f = fixture(t);
  const result = f.check(["--setup"], { CI: "true" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /skipped in CI/);
  for (const key of ["user.name", "user.email", "core.hooksPath"]) {
    assert.equal(f.git(["config", "--local", "--get", key]).status, 1);
  }
});

test("only setup skips missing Git context; checks fail closed", (t) => {
  const f = fixture(t);
  const outside = join(f.testRoot, "outside");
  mkdirSync(outside);
  for (const args of [[], ["--pre-push"], ["--setup"]]) {
    const result = spawnSync(process.execPath, [checker, ...args], {
      cwd: outside,
      env: f.env,
      encoding: "utf8",
      input: "",
      timeout: 15000,
    });
    assert.ifError(result.error);
    if (args[0] === "--setup") {
      assert.equal(result.status, 0);
      assert.match(result.stdout, /no Git worktree/);
    } else {
      assert.equal(result.status, 1);
      assert.match(result.stderr, /No Git worktree/);
    }
  }
});

test("invalid arguments and malformed pre-push input fail with useful errors", (t) => {
  const f = fixture(t);
  setup(f);
  for (const args of [["--unknown"], ["--setup", "--extra"]]) {
    const result = f.check(args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Usage:/);
  }
  const malformed = f.check(
    ["--pre-push"],
    {},
    "refs/heads/test not-a-commit\n",
  );
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /Invalid local commit ID/);
});

test("real pre-push hook permits correct tips and rejects a wrong committer", (t) => {
  const f = fixture(t);
  setup(f);
  mkdirSync(join(f.repo, "scripts"));
  writeFileSync(
    join(f.repo, "scripts/git-identity.mjs"),
    readFileSync(checker),
  );
  mkdirSync(join(f.repo, ".husky"));
  writeFileSync(
    join(f.repo, ".husky/pre-push"),
    readFileSync(join(sourceRoot, ".husky/pre-push")),
    { mode: 0o755 },
  );
  const remote = join(f.testRoot, "remote.git");
  assert.equal(f.git(["init", "--bare", "-q", remote]).status, 0);
  assert.equal(f.git(["remote", "add", "origin", remote]).status, 0);
  assert.equal(
    f.git(["commit", "--allow-empty", "-qm", "test: first correct tip"]).status,
    0,
  );
  const goodTip = f.git(["rev-parse", "HEAD"]).stdout.trim();
  const accepted = f.git(["push", "origin", "HEAD:refs/heads/test"]);
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.equal(
    f.git(["commit", "--allow-empty", "-qm", "test: wrong committer"], {
      GIT_COMMITTER_EMAIL: wrongEmail,
    }).status,
    0,
  );
  const rejected = f.git(["push", "origin", "HEAD:refs/heads/test"]);
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /tip committer/);
  assert.equal(
    f.git(["--git-dir", remote, "rev-parse", "refs/heads/test"]).stdout.trim(),
    goodTip,
  );
});
