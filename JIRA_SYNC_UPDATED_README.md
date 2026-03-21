# Updated Jira to GitHub Sync Workflow

## Overview

This GitHub Actions workflow syncs **only updated and new Jira tickets** to GitHub issues. Unlike the full sync workflow, this one:

✅ Only fetches recently updated tickets (default: last 24 hours)  
✅ Can be manually triggered with custom parameters  
✅ Detects if an issue already exists on GitHub and updates it  
✅ Perfect for adding a new ticket to Jira and syncing it to GitHub  
✅ No external scripts needed — everything runs in GitHub Actions

## How to Use

### 1. Manual Trigger from GitHub Actions

1. Go to your repository → **Actions** tab
2. Select **"Sync Updated Jira Issues to GitHub"** workflow
3. Click **"Run workflow"**
4. Configure options:
   - **hours_back**: How many hours back to fetch updated issues (default: 24)
   - **force_keys**: (Optional) Comma-separated Jira keys to force sync (e.g., `PEZY-1,PEZY-5`)

### 2. Example Scenarios

#### Scenario: Add a new ticket to Jira, sync it to GitHub
1. Create a new ticket in Jira (e.g., `PEZY-100`)
2. Go to GitHub Actions → Run the workflow
3. The new ticket will be created as a GitHub issue automatically

#### Scenario: Updated multiple tickets in Jira last 6 hours
1. Go to GitHub Actions → Run the workflow
2. Set `hours_back` to `6`
3. Only tickets updated in the last 6 hours will be synced

#### Scenario: Force sync specific tickets
1. Go to GitHub Actions → Run the workflow
2. Set `force_keys` to `PEZY-50,PEZY-75`
3. These specific tickets will be synced regardless of when they were last updated

### 3. Automatic Sync (Optional)

To add automatic syncing on a schedule, update the workflow `on` section:

```yaml
on:
  schedule:
    - cron: '0 */4 * * *'  # Run every 4 hours
  workflow_dispatch:
    # ... rest of inputs
```

## How It Works

### 1. **Calculate Cutoff Time**
   - Computes cutoff timestamp based on `hours_back` parameter
   - Defaults to 24 hours back if not specified

### 2. **Build JQL Query**
   - Creates Jira query: `project = "PEZY" AND updated >= "{cutoff_time}"`
   - Optionally includes force-synced keys with OR clause

### 3. **Fetch Updated Issues**
   - Queries Jira API for all matching issues
   - Paginates through results (100 per page)
   - Handles timeouts and rate limiting

### 4. **Build GitHub Knowledge Base**
   - Scans all GitHub issues (open + closed) for Jira keys
   - Builds a Set of already-synced keys
   - Prevents duplicate issue creation

### 5. **Sync Logic**
   ```
   For each Jira ticket:
   ├─ If already on GitHub → Update the issue
   │  └─ Update body with latest details & timestamps
   │  └─ Update labels (priority, type, status)
   │  └─ Close if status = "Done"
   └─ If new → Create a new GitHub issue
      └─ Use Jira key as issue prefix
      └─ Add relevant labels
      └─ Close if status = "Done"
   ```

### 6. **Result**
   - Console output shows created/updated/skipped counts
   - GitHub issue reflects all Jira details
   - Proper labels applied for filtering

## Environment Configuration

### Secrets Required (GitHub Repository Settings)

| Secret | Value | Description |
|--------|-------|-------------|
| `JIRA_API_KEY` | Your API token | Jira API token (already set up) |

### Hardcoded Values (in workflow)

| Variable | Value | Description |
|----------|-------|-------------|
| `JIRA_BASE_URL` | `https://oshadadilshan.atlassian.net` | Your Jira instance |
| `JIRA_EMAIL` | `gimansabandara2001@gmail.com` | Jira account email |
| `JIRA_PROJECT` | `PEZY` | Jira project key |

### User-Provided Inputs (at runtime)

| Input | Default | Description |
|-------|---------|-------------|
| `hours_back` | `24` | Hours back to fetch updated issues |
| `force_keys` | Empty | Comma-separated Jira keys to force sync |

## Labels Applied to GitHub Issues

Issues get automatically labeled based on Jira attributes:

| Jira Attribute | GitHub Labels |
|---|---|
| **Type** | `enhancement`, `bug`, `chore` |
| **Priority** | `priority: critical`, `priority: high`, `priority: medium`, `priority: low` |
| **Status** | `status: in progress`, `status: needs review` |
| **All issues** | `jira-synced` |
| **Done status** | Issue auto-closed in GitHub |

## GitHub Issue Format

When synced, each GitHub issue looks like:

```markdown
### Jira Ticket: [PEZY-100](https://oshadadilshan.atlassian.net/browse/PEZY-100)

**Details:**
- Type: Task
- Priority: High
- Status: In Progress
- Assignee: John Doe
- Created: 2024-03-20T10:30:45.000Z
- Updated: 2024-03-21T14:15:22.000Z

**Description:**
Implement user authentication module for mobile app
```

## Troubleshooting

### "Jira API error: 400"
- Check that `JIRA_API_KEY` secret is set correctly
- Verify the Jira workspace doesn't have query restrictions
- Try using `force_keys` with specific ticket keys

### "No updated Jira issues found"
- Increase `hours_back` value (default is 24)
- Verify that tickets were actually updated in Jira
- Try using `force_keys` with specific ticket keys

### "Secondary rate limit hit"
- Workflow stops early to avoid GitHub API bans
- Re-run the workflow later or adjust `hours_back` to get fewer results

### Check Workflow Logs
1. Go to the workflow run
2. Expand the **"Sync Updated Jira Issues to GitHub"** step
3. Review the full console output with detailed messages

## Comparison: Sync Workflows

| Feature | Full Sync | Updated Sync |
|---------|-----------|--------------|
| Syncs all Jira issues | ✓ | ✗ |
| Syncs only updated issues | ✗ | ✓ |
| Can be manually triggered | ✓ | ✓ |
| Scheduled automation | ✓ | ✓ (optional) |
| Time-based filtering | ✗ | ✓ |
| Force specific keys | ✗ | ✓ |
| Updates existing issues | ✗ | ✓ |
| Uses GitHub Actions only | ✗ | ✓ |

## Files Modified/Created

- **Workflow**: `.github/workflows/jira-sync-updated.yml`
- **Documentation**: `JIRA_SYNC_UPDATED_README.md`

## Implementation Details

The workflow uses:
- **GitHub Actions**: `actions/github-script@v7` for running JavaScript
- **Jira API**: REST API v3 for fetching issues
- **GitHub API**: REST API for creating/updating issues
- **No external dependencies**: Everything runs within GitHub Actions runner

## Rate Limits

The workflow respects both API rate limits:
- **Jira**: 300ms delay between paginated requests
- **GitHub**: 3.5 seconds delay between issue creations (secondary rate limit)

These delays can be adjusted if needed by modifying the `await sleep()` calls in the workflow.
