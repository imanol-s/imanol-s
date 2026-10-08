import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const NAME = "Imanol Saldana";
const EMAIL = "72887568+imanol-s@users.noreply.github.com";
const mode = process.argv[2];

const git = (...args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

function checkEmail(email, source) {
  if (email !== EMAIL) {
    throw new Error(
      `${source} uses ${email || "an empty email"}; expected ${EMAIL}.`,
    );
  }
}

function checkEffectiveIdentity() {
  for (const identity of ["GIT_AUTHOR_IDENT", "GIT_COMMITTER_IDENT"]) {
    const value = git("var", identity);
    const email = value.match(/<([^<>]+)> -?\d+ [+-]\d{4}$/)?.[1];
    checkEmail(email, identity);
  }
}

function checkPushedTips(input) {
  const lines = input.trim().split("\n").filter(Boolean);
  for (const line of lines) {
    const [ref, sha] = line.split(/\s+/);
    if (/^0+$/.test(sha)) continue;
    if (!/^[a-f0-9]{40,64}$/.test(sha ?? "")) {
      throw new Error("Invalid local commit ID in pre-push input.");
    }
    // Check only each pushed tip; other contributors and historical commits stay untouched.
    const [author, committer] = git(
      "log",
      "-1",
      "--format=%ae%n%ce",
      sha,
    ).split("\n");
    checkEmail(author, `${ref} tip author`);
    checkEmail(committer, `${ref} tip committer`);
  }
}

function main() {
  if (
    process.argv.length > 3 ||
    (mode && !["--setup", "--pre-push"].includes(mode))
  ) {
    throw new Error(
      "Usage: node scripts/git-identity.mjs [--setup | --pre-push]",
    );
  }
  if (mode === "--setup" && process.env.CI) {
    console.log("Git identity setup skipped in CI.");
    return;
  }
  const pushInput = mode === "--pre-push" ? readFileSync(0, "utf8") : "";
  const context = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (context.status !== 0 || context.stdout.trim() !== "true") {
    if (mode === "--setup") {
      console.log("Git identity setup skipped: no Git worktree available.");
      return;
    }
    throw new Error(
      "No Git worktree available; author and committer identity cannot be checked.",
    );
  }
  if (mode === "--setup") {
    git("config", "--local", "user.name", NAME);
    git("config", "--local", "user.email", EMAIL);
    git("config", "--local", "core.hooksPath", ".husky");
    console.log(
      "Configured repo-local identity for imanol-s and enabled .husky hooks.",
    );
    return;
  }
  checkEffectiveIdentity();
  if (mode === "--pre-push") checkPushedTips(pushInput);
  console.log("Git author and committer identity match imanol-s.");
}

try {
  main();
} catch (error) {
  console.error(`Git identity check failed: ${error.message}`);
  console.error(
    "Run npm run setup:git-identity, then npm run check:git-identity. " +
      "Clear conflicting GIT_AUTHOR_EMAIL, GIT_COMMITTER_EMAIL, EMAIL, or Git config overrides. " +
      "For a mismatched pushed tip, correct that commit's author/committer before pushing.",
  );
  process.exitCode = 1;
}
