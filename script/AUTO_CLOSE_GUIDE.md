# Auto-Close Issues on PR Merge - GitHub Actions Workflow

Automatically close GitHub issues when a pull request is successfully merged using GitHub Actions.

## 🚀 How It Works

When you merge a pull request with linked issue references, the **GitHub Actions workflow** automatically:
1. ✅ **Closes the linked issues**
2. ✅ Adds a **"completed" label** to each closed issue
3. ✅ Posts a **comment** linking back to the PR
4. ✅ **Tracks completion** of all related work

All of this happens **instantly and automatically** - no manual action needed!

## 📝 PR Description Format

Use these keywords with **PEZY-XXX** or **GitHub issue numbers** to link issues:

```markdown
## Closes
Closes PEZY-4365
Fixes PEZY-4366
Resolves PEZY-4367
```

**Supported Formats:**
- `Closes PEZY-123` ⭐ RECOMMENDED - Auto-closes the PEZY issue
- `Fixes PEZY-123` - Auto-closes the PEZY issue
- `Resolves PEZY-123` - Auto-closes the PEZY issue
- `Closes #123` - Auto-closes GitHub issue #123 (direct)

**Workflow Behavior:**
- Recognizes both PEZY-XXX and #XXX formats
- For PEZY-XXX: Searches for GitHub issue with PEZY-XXX in title
- Automatically closes the corresponding GitHub issue
- Adds "completed" label and comment

## 📋 Example PR Description

```markdown
## Description
Implemented the main content layout wrapper component as designed in Figma.

## Changes
- Added styled wrapper component
- Implemented responsive layout
- Added proper spacing and alignment
- Tested across browsers

## Closes
Closes PEZY-4365
Closes PEZY-4366
Fixes PEZY-4550

## Testing
- [x] Tested on desktop (1920x1080, 1366x768)
- [x] Tested on tablet (iPad)
- [x] Tested on mobile (iPhone)
- [x] Cross-browser tested (Chrome, Firefox, Safari)
```

When this PR is merged:
- PEZY-4365, PEZY-4366, PEZY-4550 are searched in GitHub issues
- Their corresponding GitHub issues automatically close
- Each issue gets a "completed" label
- Each issue receives a comment with the PR link

## ⚙️ GitHub Actions Workflow

The workflow is configured in `.github/workflows/close-issues-on-merge.yml`

**What happens:**
- Triggers automatically when any PR is merged
- Parses PR description for issue references
- Closes matched issues
- Adds "completed" label
- Posts comment with PR link

**No setup needed!** The workflow is ready to use out of the box. 🚀

## 📊 Usage Examples

### Example 1: Simple PEZY Issue

**PR Description:**
```markdown
# Fix Login Component

Closes PEZY-4370
```

**Result:** GitHub issue with "PEZY-4370" in title closes automatically when PR merges

### Example 2: Multiple PEZY Issues

**PR Description:**
```markdown
# Implement User Dashboard

## Closes
Closes PEZY-4365
Closes PEZY-4366
Fixes PEZY-4380
```

**Result:** All corresponding GitHub issues close when PR merges

### Example 3: PEZY in PR Title

**PR Title:**
```
feat: Add header component (closes PEZY-4390)
```

**PR Body:**
```
Implementation of main header component with navigation
```

**Result:** GitHub issue with "PEZY-4390" in title closes automatically

### Example 4: Mixed Format

**PR Description:**
```markdown
# Various Fixes

Closes PEZY-4360
Fixes #4400
Resolves PEZY-4410
```

**Result:**
- GitHub issue containing "PEZY-4360" → closes
- GitHub issue #4400 → closes
- GitHub issue containing "PEZY-4410" → closes

## 🔍 How to Monitor

### 1. Watch GitHub Actions Run

After merging a PR:
1. Go to repository → **Actions** tab
2. Look for **"Close Issues on PR Merge"** workflow
3. Click to see execution details
4. View logs if needed

### 2. Verify Issues Closed

1. Go to repository → **Issues** tab
2. Check that linked issues show ✓ (closed)
3. Filter: `is:closed label:completed` to see all
4. Click issue to see close comment with PR link

### 3. Check PR

Go to merged PR and see comments from automation bot

## ✨ Features

### ✅ Automatic Closure
- Triggers on PR merge
- No manual action needed
- Instant execution

### 🏷️ Automatic Labeling
- Adds "completed" label
- Tracks done work
- Helps with reporting

### 💬 Automatic Comments
- Links to merged PR
- Creates audit trail
- Shows context

### 📊 GitHub Native
- Built-in to GitHub Actions
- No external services
- No additional costs

## 🛠️ Troubleshooting

### Issues Not Closing?

**Check 1: PR Description Format (PEZY)**
```
❌ Wrong: "Closes pezy-4365"      (lowercase)
❌ Wrong: "Closes PEZY 4365"      (space instead of dash)
✅ Correct: "Closes PEZY-4365"    (capital PEZY, dash, number)
```

**Check 2: PR Description Format (GitHub)**
```
❌ Wrong: "closes #4365"           (lowercase)
✅ Correct: "Closes #4365"         (capital C, with #)
```

**Check 3: GitHub Issue Title**
- If using PEZY-XXX format, verify GitHub issue title contains `PEZY-4365`
- Example: `[PEZY-4365]: Issue Title` ✅
- Workflow searches for PEZY-XXXX in title

**Check 4: GitHub Actions Status**
- Go to Actions tab
- Check "Close Issues on PR Merge" workflow
- View logs to see if PEZY-XXX was found and mapped

**Check 5: Merge vs Close PR**
- Workflow only runs on **merge**, not on PR close
- Manual PR close ≠ automatic issue closure

**Check 4: Permissions**
- Verify you have write access to issues
- Check token permissions in workflow

### Manual Testing

Create a test PR with:
```
Closes #XXXX
```

Then merge it and check:
1. Actions tab for workflow run
2. Issue #XXXX should close with comment

## 📌 Best Practices

1. **Use PEZY-XXX Format** (Recommended)
   - Reference the original Jira issue: `Closes PEZY-4365`
   - Workflow automatically finds matching GitHub issue
   - Better for tracking original issue numbers

2. **Link Related Issues**
   - Always use keyword format: `Closes PEZY-XXX` or `Closes #123`
   - Include in every related PR

3. **Clear Messages**
   - Describe what the PR fixes
   - Reference the exact Jira and/or GitHub issues

4. **Review Before Merge**
   - Check workflow will close right issues
   - Verify PEZY-XXX references are correct

5. **One Reference Per Line**
   ```
   ✅ Correct:
   Closes PEZY-4365
   Closes PEZY-4366
   
   ✅ Also works:
   Closes #4365
   
   ❌ Avoid:
   Closes PEZY-4365 and PEZY-4366
   ```

6. **Document Related Work**
   - Use PR description for context
   - Help team understand changes

## 🔄 Complete Workflow

```
Developer creates PR
        ↓
Links issues: "Closes #123"
        ↓
Opens Pull Request
        ↓
Team reviews & approves
        ↓
Developer merges PR
        ↓
GitHub Actions triggers
        ↓
Workflow:
  - Finds issue #123
  - Closes issue #123
  - Adds "completed" label
  - Posts comment with PR link
        ↓
✅ Issue automatically closed!
```

## 📚 References

- [GitHub Issues Documentation](https://docs.github.com/en/issues)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Linking PRs to Issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Workflow File:** `.github/workflows/close-issues-on-merge.yml`
**Last Updated:** 15 March 2026
**Status:** Ready to Use ✅
