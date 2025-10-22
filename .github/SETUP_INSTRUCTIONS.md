# Setup Instructions for GitHub Actions Workflows

## Overview

This repository now has automated CI/CD workflows set up to improve development efficiency and enable automatic deployment.

## What Has Been Added

### 1. **CI Workflow** (`.github/workflows/ci.yml`)
- Automatically runs on all Pull Requests to `main`
- Validates that the code builds successfully
- Uses Node.js 20 with npm caching for faster builds
- Includes proper security permissions (contents: read)

### 2. **Deploy Workflow** (`.github/workflows/deploy.yml`)
- Automatically deploys to GitHub Pages when code is pushed to `main`
- Can also be triggered manually via workflow dispatch
- Uses proper permissions for GitHub Pages deployment
- Includes concurrency controls to prevent overlapping deployments

### 3. **Configuration Updates**
- Updated `astro.config.mjs` with:
  - Correct site URL: `https://imanol-s.github.io/imanol-s/`
  - Base path: `/imanol-s` for proper routing on GitHub Pages
  
### 4. **README Updates**
- Added workflow status badges to show build and deployment status

## Required Setup Steps

### Enable GitHub Pages

To enable automatic deployment, you need to configure GitHub Pages:

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the changes

That's it! The next push to `main` will automatically deploy your site.

### Optional: Branch Protection

Consider adding branch protection to `main`:

1. Go to **Settings** → **Branches**
2. Add a branch protection rule for `main`
3. Enable:
   - Require status checks to pass before merging
   - Select the "build" check from the CI workflow
   - Require branches to be up to date before merging

This ensures all code is validated before merging to main.

## Testing the Workflows

### Testing CI Workflow
1. Create a new branch
2. Make a change and push it
3. Open a Pull Request
4. The CI workflow will automatically run and validate your build

### Testing Deploy Workflow
1. Merge a PR to `main` or push directly to `main`
2. The deploy workflow will automatically run
3. Your site will be available at: `https://imanol-s.github.io/imanol-s/`

## Workflow Status

You can view workflow runs at:
- https://github.com/imanol-s/imanol-s/actions

Status badges are also displayed in the README.

## Troubleshooting

### If deployment fails:
1. Check that GitHub Pages is enabled (Settings → Pages → Source: GitHub Actions)
2. Verify the workflow run logs in the Actions tab
3. Ensure the `dist` folder is being generated during build

### If CI fails:
1. Check the workflow logs for build errors
2. Run `npm ci && npm run build` locally to reproduce the issue
3. Fix any errors and push again

## Benefits

✅ **Automated Quality Checks** - Every PR is tested before merging  
✅ **Automatic Deployment** - No manual deployment needed  
✅ **Version History** - Easy rollback through GitHub Pages deployment history  
✅ **Workflow Visibility** - Status badges show current state  
✅ **Security** - Explicit permissions limit GITHUB_TOKEN scope  

## Next Steps (Optional Enhancements)

Consider adding:
- **Dependabot** for automated dependency updates
- **CodeQL** for security scanning
- **Lighthouse CI** for performance monitoring
- **Automated testing** with your preferred testing framework
