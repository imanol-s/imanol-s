import assert from 'node:assert/strict';
import { test } from 'node:test';
import { previousChecksPassed } from './site-checks.mjs';

const context = {
  repo: { owner: 'fixture', repo: 'portfolio' },
  payload: {
    action: 'synchronize', before: 'previous-head',
    pull_request: { number: 1, base: { sha: 'base' } },
  },
};
const run = (conclusion, id = 1, number = 1, base = 'base') => ({
  id, conclusion, pull_requests: [{ number, base: { sha: base } }],
});
const github = (runs) => ({ rest: { actions: {
  listWorkflowRuns: async (query) => {
    assert.deepEqual(query, {
      owner: 'fixture', repo: 'portfolio', workflow_id: 'ci.yml',
      event: 'pull_request', head_sha: 'previous-head', per_page: 100,
    });
    return { data: { workflow_runs: runs } };
  },
} } });

test('a successful preceding run can be reused for the same PR and base', async () => {
  assert.equal(await previousChecksPassed(github([run('success')]), context), true);
});

for (const conclusion of ['failure', 'cancelled', 'skipped', null]) {
  test(`a preceding ${conclusion} run cannot turn a resume-only push green`, async () => {
    assert.equal(await previousChecksPassed(github([run(conclusion)]), context), false);
  });
}

test('missing history, another PR, or a changed base requires site checks', async () => {
  assert.equal(await previousChecksPassed(github([]), context), false);
  assert.equal(await previousChecksPassed(github([run('success', 1, 2)]), context), false);
  assert.equal(await previousChecksPassed(github([run('success', 1, 1, 'old-base')]), context), false);
});

test('the latest run wins over an older success for the same revision', async () => {
  assert.equal(await previousChecksPassed(github([run('success', 1), run('failure', 2)]), context), false);
});

test('an unavailable API runs site checks instead of trusting missing evidence', async () => {
  const unavailable = { rest: { actions: { listWorkflowRuns: async () => { throw new Error('Unavailable'); } } } };
  assert.equal(await previousChecksPassed(unavailable, context), false);
});

test('opening a PR never relies on prior runs', async () => {
  assert.equal(await previousChecksPassed({}, {
    ...context, payload: { ...context.payload, action: 'opened' },
  }), false);
});
