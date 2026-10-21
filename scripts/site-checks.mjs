/** A resume-only update may reuse a successful run for the same PR and base. */
export async function previousChecksPassed(github, context) {
  if (context.payload.action !== 'synchronize') return false;
  try {
    const { data } = await github.rest.actions.listWorkflowRuns({
      ...context.repo,
      workflow_id: 'ci.yml',
      event: 'pull_request',
      head_sha: context.payload.before,
      per_page: 100,
    });
    const previous = data.workflow_runs
      .filter((run) => run.pull_requests.some((pr) =>
        pr.number === context.payload.pull_request.number &&
        pr.base.sha === context.payload.pull_request.base.sha))
      .sort((a, b) => b.id - a.id)[0];
    return previous?.conclusion === 'success';
  } catch {
    console.warn('Could not confirm previous CI success; running site checks.');
    return false;
  }
}
