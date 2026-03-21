# Jira to GitHub Sync Script

A Python script that syncs **only updated and new Jira tickets** to GitHub issues.

## Setup

### 1. Install Dependencies

```bash
pip install requests python-dotenv
```

### 2. Create `.env` file

Create a `.env` file in the project root with the following variables:

```env
# Jira Configuration
JIRA_EMAIL=gimansabandara2001@gmail.com
JIRA_API_TOKEN=your_jira_api_token
JIRA_BASE_URL=https://oshadadilshan.atlassian.net
JIRA_PROJECT=PEZY

# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_REPO=pezy-uok/p-ezy-traffic-fine-management-system

# Sync Configuration
HOURS_BACK=24
FORCE_KEYS=
```

**Environment Variables:**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JIRA_EMAIL` | ✓ | - | Your Jira email |
| `JIRA_API_TOKEN` | ✓ | - | Your Jira API token |
| `JIRA_BASE_URL` | ✓ | - | Your Jira instance URL |
| `JIRA_PROJECT` | ✓ | `PEZY` | Jira project key |
| `GITHUB_TOKEN` | ✓ | - | GitHub personal access token |
| `GITHUB_REPO` | ✓ | - | GitHub repo (owner/repo) |
| `HOURS_BACK` | ✗ | `24` | Hours back to fetch updated issues |
| `FORCE_KEYS` | ✗ | - | Comma-separated Jira keys to force sync (e.g., `PEZY-1,PEZY-5`) |

## Usage

### Run the sync script

```bash
python script/jira_github_sync_updated.py
```

### Examples

**Sync issues updated in the last 24 hours:**
```bash
python script/jira_github_sync_updated.py
```

**Sync issues updated in the last 6 hours:**
```bash
HOURS_BACK=6 python script/jira_github_sync_updated.py
```

**Force sync specific Jira keys:**
```bash
FORCE_KEYS=PEZY-1,PEZY-5 python script/jira_github_sync_updated.py
```

**Combine both:**
```bash
HOURS_BACK=12 FORCE_KEYS=PEZY-100 python script/jira_github_sync_updated.py
```

## How It Works

1. **Fetch Updated Issues** — Queries Jira for issues updated in the last N hours
2. **Build Knowledge Base** — Scans existing GitHub issues for Jira keys
3. **Sync Issues** — Creates new or updates existing GitHub issues
4. **Apply Labels** — Automatically assigns labels based on Jira attributes

### Labels Applied

| Jira Attribute | GitHub Labels |
|---|---|
| **Type** | `enhancement`, `bug`, `chore` |
| **Priority** | `priority: critical`, `priority: high`, `priority: medium`, `priority: low` |
| **Status** | `status: in progress`, `status: needs review` |
| **All issues** | `jira-synced` |

## Output

The script logs all activity to:
- **Console** — Real-time progress
- **`jira_github_sync.log`** — Detailed log file

## Example Scenario

1. Create a new ticket in Jira: `PEZY-100`
2. Run the script:
   ```bash
   python script/jira_github_sync_updated.py
   ```
3. ✅ A GitHub issue is automatically created with all Jira details

## Troubleshooting

### "Missing Jira environment variables"
- Ensure `.env` file exists in the project root
- Check that `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_BASE_URL` are set

### "GitHub access verification failed"
- Verify `GITHUB_TOKEN` has `issues:write` permission
- Check that `GITHUB_REPO` format is `owner/repo`

### "No updated Jira issues found"
- Increase `HOURS_BACK` value
- Use `FORCE_KEYS` to sync specific tickets

## Files

- **Script**: `script/jira_github_sync_updated.py`
- **Config**: `.env` (create this file)
- **Logs**: `jira_github_sync.log` (generated after running)
