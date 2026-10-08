import { execFileSync } from 'node:child_process';

const inputs = ['resume', '.github/workflows/publish-resume.yml', 'scripts/resume-pipeline.mjs', 'scripts/resume-pipeline.check.mjs'];
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const resumeOnly = (path) => path.startsWith('resume/') || inputs.slice(1).includes(path);

if (process.argv[2] === 'ignore') {
  try {
    const { CACHED_COMMIT_REF: base, COMMIT_REF: head } = process.env;
    if (!base || !head || base === head) process.exit(1);
    git('merge-base', '--is-ancestor', base, head);
    const paths = git('diff', '--no-renames', '--name-only', '-z', base, head).split('\0').filter(Boolean);
    process.exit(paths.length > 0 && paths.every(resumeOnly) ? 0 : 1);
  } catch {
    process.exit(1);
  }
} else if (process.argv[2] === 'fresh') {
  const [compiled, current] = process.argv.slice(3);
  if (!compiled || !current) throw new Error('Expected compiled and current revisions');
  git('rev-parse', '--verify', `${compiled}^{commit}`);
  git('rev-parse', '--verify', `${current}^{commit}`);
  const changed = git('diff', '--name-only', compiled, current, '--', ...inputs);
  console.log(`publish=${changed.length === 0}`);
} else {
  throw new Error('Expected ignore or fresh');
}
