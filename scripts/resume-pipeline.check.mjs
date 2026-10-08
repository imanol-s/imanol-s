import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const script = resolve(import.meta.dirname, 'resume-pipeline.mjs');

test('publication freshness and Netlify decisions follow actual resume inputs and complete history', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'resume-pipeline-'));
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const write = (path, content) => {
    mkdirSync(join(cwd, path, '..'), { recursive: true });
    writeFileSync(join(cwd, path), content);
  };
  const commit = () => {
    git('add', '.');
    git('commit', '-qm', 'fixture');
    return git('rev-parse', 'HEAD');
  };
  const run = (args, env = {}) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8', env: { ...process.env, ...env } });
  const ignore = (base, head) => run(['ignore'], { CACHED_COMMIT_REF: base, COMMIT_REF: head }).status;
  const fresh = (base, head, expected) => {
    const result = run(['fresh', base, head]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), `publish=${expected}`);
  };
  try {
    git('init', '-q');
    git('config', 'user.name', 'Pipeline test');
    git('config', 'user.email', 'pipeline@example.invalid');
    write('resume/main.tex', 'first resume');
    write('site.txt', 'first site');
    const initial = commit();

    write('resume/main.tex', 'updated resume');
    const resume = commit();
    assert.equal(ignore(initial, resume), 0, 'resume-only push skips Netlify');
    fresh(resume, resume, true);

    write('site.txt', 'updated site');
    const site = commit();
    assert.equal(ignore(resume, site), 1, 'site-only push builds Netlify');
    assert.equal(ignore(initial, site), 1, 'full cached range includes an earlier site change');
    fresh(resume, site, true);
    fresh(initial, site, false);

    write('resume/main.tex', 'newest resume');
    write('site.txt', 'mixed site');
    const mixed = commit();
    assert.equal(ignore(site, mixed), 1, 'mixed push builds Netlify');
    fresh(resume, mixed, false);
    fresh(mixed, mixed, true);

    write('.github/workflows/publish-resume.yml', 'compiler changed');
    const compiler = commit();
    assert.equal(ignore(mixed, compiler), 0);
    fresh(mixed, compiler, false);

    write('resume/main.tex', 'last resume');
    const lastResume = commit();
    assert.equal(ignore(compiler, lastResume), 0);
    assert.equal(ignore(site, lastResume), 1, 'latest resume-only commit cannot hide mixed history');
    assert.equal(ignore('', lastResume), 1);
    assert.equal(ignore('missing-revision', lastResume), 1);
    assert.equal(ignore(lastResume, lastResume), 1);
    assert.equal(ignore(lastResume, initial), 1, 'rewritten or reversed history builds');
    assert.notEqual(run(['fresh', lastResume, 'missing-revision']).status, 0, 'unknown freshness must fail');

    renameSync(join(cwd, 'site.txt'), join(cwd, 'resume/moved.txt'));
    const renamed = commit();
    assert.equal(ignore(lastResume, renamed), 1, 'moving a site file into resume still changes the site');
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
