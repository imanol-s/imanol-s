# GitHub Actions Workflows

This repository now includes automated GitHub Actions workflows to streamline development and deployment.

## Available Workflows

### 1. CI (Continuous Integration) - `ci.yml`

**Trigger:** Pull Requests to `main` branch

**Purpose:** Validates that code changes don't break the build

**Steps:**
- Checks out the code
- Sets up Node.js 20 with npm caching
- Installs dependencies
- Runs `npm run build` (which includes `astro check` and builds the site)

This ensures all PRs are tested before merging.

### 2. Deploy to GitHub Pages - `deploy.yml`

**Trigger:** 
- Push to `main` branch
- Manual workflow dispatch

**Purpose:** Automatically deploys the site to GitHub Pages

**Steps:**
- Builds the Astro site with optimized assets
- Uploads the built site as a Pages artifact
- Deploys to GitHub Pages

**URL:** Once enabled, your site will be available at `https://imanol-s.github.io/imanol-s/`

## Setup Required

To enable GitHub Pages deployment:

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save the changes

The next push to `main` will automatically deploy your site.

## Workflow Status

Check the status of workflows:
- [View all workflow runs](https://github.com/imanol-s/imanol-s/actions)
- Status badges are displayed in the README

## Configuration Notes

- The `astro.config.mjs` has been updated with:
  - `site: 'https://imanol-s.github.io/imanol-s/'`
  - `base: '/imanol-s'` for proper routing on GitHub Pages
  
- Both workflows use Node.js 20 and npm caching for faster builds
- The deploy workflow uses concurrent groups to prevent overlapping deployments
