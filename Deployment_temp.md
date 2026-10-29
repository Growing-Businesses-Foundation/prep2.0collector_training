# GitHub Development, Pull Request & Release Workflow

**Project:** `Growing-Businesses-Foundation/prep2.0collector_training`  
**Development branch:** `dev`  
**Production branch:** `main`  
**Release format:** Semantic Versioning (`vMAJOR.MINOR.PATCH`)

---

## 1. Pre-PR Checks

Before creating a pull request, make sure your development branch is up to date and your changes are ready.

### Check current branch and working tree

```bash
git branch --show-current
git status
git diff --check
```

### Run project validation

```bash
npm run build
```

If your project has a lint script:

```bash
npm run lint
```

### Review changes

```bash
git diff
git diff --stat
git status
```

### Commit and push changes

```bash
git add .
git commit -m "perf: describe your changes"
git push origin dev
```

---

## 2. Create Pull Request

Create a PR from `dev` into `main`.

### Pull request template

```bash
gh pr create \
  --base main \
  --head dev \
  --title "type: describe your changes" \
  --body "## Summary

- Describe the main changes.
- List new features or improvements.
- Mention important bug fixes.

## Performance

- Describe performance improvements, if applicable.
- Include measurable improvements where available.

## UI/UX Improvements

- Describe interface changes.
- Mention interaction and accessibility improvements.

## Security

- Describe security-related changes, if applicable.

## Testing

- Verified changes locally.
- Build and lint checks passed.
- Git working tree is clean.
- Changes pushed to dev.

## Deployment

- Changes are ready for review and merging into main."
```

### Open and inspect the PR

```bash
gh pr view --web
gh pr status
gh pr view <PR_NUMBER>
```

### Inspect PR changes

```bash
gh pr diff <PR_NUMBER>
```

### Check PR validation

```bash
gh pr checks <PR_NUMBER>
```

Wait for checks to complete:

```bash
gh pr checks <PR_NUMBER> --watch
```

### Inspect PR metadata and merge status

```bash
gh pr view <PR_NUMBER> \
  --json title,state,baseRefName,headRefName,mergeStateStatus,statusCheckRollup
```

**Before merging, confirm:**
- PR targets `main`.
- PR originates from `dev`.
- No unexpected changes are included.
- CI/build checks have passed.
- No unresolved review comments or blocking issues remain.
- GitHub reports that the PR is mergeable.

---

## 3. Merge Pull Request

Once everything is verified:

```bash
gh pr merge <PR_NUMBER> --merge
```

This uses a merge commit rather than squash or rebase merging.

Verify the PR:

```bash
gh pr view <PR_NUMBER>
```

---

## 4. Synchronize Local Main Branch

After merging, update your local production branch.

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
```

Verify the latest commits:

```bash
git log --oneline --decorate -5 origin/main
```

Verify the working tree:

```bash
git status
```

---

## 5. Create a Version Tag

Follow Semantic Versioning:

| Version change | When to use |
|---|---|
| PATCH | Bug fixes and small improvements |
| MINOR | New backward-compatible features |
| MAJOR | Breaking changes |

Example:

```bash
git tag -a v2.6.5 -m "Release v2.6.5"
git push origin v2.6.5
```

Before creating a tag, check that the version doesn't already exist:

```bash
git tag --list
```

---

## 6. Publish GitHub Release

Create a release using the tag.

```bash
gh release create v2.6.5 \
  --verify-tag \
  --title "v2.6.5" \
  --notes "## What's Changed

### New Features
- Describe new features.

### Improvements
- Describe performance and UI improvements.

### Bug Fixes
- List resolved issues.

### Security
- Describe relevant security updates.

### Validation
- CI/build checks passed.
- Changes merged to main through PR #XX.

**Full Changelog:** https://github.com/Growing-Businesses-Foundation/prep2.0collector_training/compare/v2.6.4...v2.6.5"
```

Replace the previous and new version numbers with the actual release versions.

---

## 7. Verify Release

Check the published release:

```bash
gh release view v2.6.5
```

List recent releases:

```bash
gh release list
```

Check tags:

```bash
git fetch --tags
git tag --sort=-version:refname | head -10
```

---

## 8. Check Open Pull Requests

List currently open PRs:

```bash
gh pr list --state open
```

List recent PRs:

```bash
gh pr list --state all --limit 10
```

Inspect a specific PR:

```bash
gh pr view <PR_NUMBER>
gh pr checks <PR_NUMBER>
gh pr diff <PR_NUMBER>
```

---

## 9. Dependabot Maintenance

Use this section when Dependabot opens dependency update PRs.

### Inspect a Dependabot PR

```bash
gh pr view <PR_NUMBER>
gh pr checks <PR_NUMBER>
gh pr diff <PR_NUMBER>
```

### Request a rebase

```bash
gh pr comment <PR_NUMBER> --body "@dependabot rebase"
```

### After the rebase

```bash
gh pr view <PR_NUMBER>
gh pr checks <PR_NUMBER> --watch
```

Review the dependency changes and test results before merging.

Do not automatically merge dependency updates without reviewing their impact.

---

## 10. Recommended Release Checklist

Use this checklist for every production release.

### Before PR
- [ ] Correct development branch selected.
- [ ] Changes reviewed.
- [ ] No accidental files or secrets included.
- [ ] Build successful.
- [ ] Lint checks passed, where configured.
- [ ] Changes committed and pushed.

### Pull Request
- [ ] PR created from `dev` into `main`.
- [ ] PR title and description are accurate.
- [ ] PR diff reviewed.
- [ ] CI checks passed.
- [ ] No unresolved blocking issues.
- [ ] PR merged successfully.

### Production Release
- [ ] Local `main` synchronized with `origin/main`.
- [ ] Correct version number selected.
- [ ] Release tag created.
- [ ] Tag pushed to GitHub.
- [ ] GitHub release published.
- [ ] Release notes reviewed.
- [ ] Deployment verified.

---

## Important Project Conventions

1. Never commit directly to `main` for normal feature development.
2. All feature development and fixes should go through `dev`.
3. Use PRs to merge `dev` into `main`.
4. Use semantic versioning for releases.
5. Never create a release tag before confirming the correct commit is on `main`.
6. Never include credentials, `.env` files, service-account keys, or other secrets in commits.
7. Keep Dependabot maintenance separate from normal feature releases.
8. Always verify the production deployment after a release.

**Standard workflow:**

`Develop → Test → Commit → Push → Create PR → Review → Merge → Synchronize Main → Tag → Release → Verify Deployment`


