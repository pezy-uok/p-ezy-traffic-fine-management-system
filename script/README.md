# Jira to GitHub Sync Scripts

Complete automation suite for syncing Jira tickets to GitHub issues with colored labels and metadata.

## 📋 Overview

This folder contains Python scripts that migrate Jira issues to GitHub with:
- ✅ Automatic issue creation with descriptions
- ✅ Colored labels (Type, Priority, Status)
- ✅ Metadata tables with Jira links
- ✅ Error handling and rate limiting
- ✅ Comprehensive logging

## 📂 Script Files

### Main Scripts (Production)

1. **`csv_github_sync.py`** - Primary sync script
   - Reads Jira issues from CSV export
   - Creates GitHub issues with descriptions and labels
   - Includes rate limiting and error handling
   - **Usage**: `python3 csv_github_sync.py`

2. **`setup_github_labels.py`** - Label color manager
   - Creates colored labels in GitHub repository
   - Configures colors for Type, Priority, Status labels
   - **Usage**: `python3 setup_github_labels.py`

3. **`retry_failed_issue.py`** - Retry failed issue
   - Recovers failed issue creations from CSV
   - Useful for retrying timeouts
   - **Usage**: `python3 retry_failed_issue.py`

### Helper Scripts (Diagnostic)

- **`test_credentials.py`** - Verify Jira & GitHub credentials
- **`test_jira.py`** - Test Jira API connectivity
- **`discover_issues.py`** - Find issues in Jira project
- **`jira_github_sync.py`** - Original Jira API-based approach (legacy)
- **`jira_github_sync_manual.py`** - Manual sync version (legacy)

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy .env.example to .env and update with your credentials
cp .env.example .env

# Edit .env and add:
# - GitHub classic PAT token (ghp_...)
# - GitHub repository (owner/repo)
# - CSV file path
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Prepare Jira CSV Export

1. Export Jira issues as CSV:
   - Jira → Filters → Issues
   - Select all columns (Issue Key, Summary, Type, Priority, Status, etc.)
   - Export to CSV

2. Update CSV path in `.env`:
   ```
   CSV_FILE=/path/to/Jira-export.csv
   ```

### 4. Run Sync

```bash
# Step 1: Verify credentials
python3 test_credentials.py

# Step 2: Create GitHub issues
python3 csv_github_sync.py

# Step 3: Add colored labels
python3 setup_github_labels.py

# Step 4: Retry any failed issues (optional)
python3 retry_failed_issue.py
```

## 📊 Expected Results

### Sync Output (csv_github_sync.py)
```
✓ Created 202 issues
✗ Failed 1 issue
Total: 203 issues
Success Rate: 99.5%
```

### Labels Applied
Each issue receives 3 labels:
- **Type**: `chore`, `bug`, `enhancement`, `epic`
- **Priority**: `priority:highest`, `priority:high`, `priority:medium`, `priority:low`, `priority:lowest`
- **Status**: `status:todo`, `status:inprogress`, `status:needs-review`, `status:done`

### GitHub Issues Format
```markdown
[PEZY-123]: Issue Title

**Jira Link:** [PEZY-123](https://pezytraffic.atlassian.net/browse/PEZY-123)

| Field | Value |
|-------|-------|
| Issue Key | PEZY-123 |
| Type | Task |
| Priority | High |
| Status | In Progress |
| Assignee | John Doe |
| Created | 15/Mar/26 9:00 PM |

## Description
Full issue description here...
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Required
GITHUB_TOKEN=ghp_...                  # Classic PAT with 'repo' scope
GITHUB_REPO=owner/repo                # Target repository

# Optional (for Jira API)
JIRA_URL=https://domain.atlassian.net
JIRA_EMAIL=user@example.com
JIRA_API_TOKEN=...

# Optional (for CSV)
SYNC_DELAY_SEC=3.5                    # Delay between API calls
CSV_FILE=/path/to/export.csv          # CSV export path
```

### Label Colors

Edit `setup_github_labels.py` to customize colors:

```python
LABELS = {
    'chore': {'color': '0366d6', 'description': 'Task / Chore'},
    'bug': {'color': 'd73a49', 'description': 'Bug'},
    # ... more labels
}
```

## ⚠️ Important Notes

### GitHub Token Requirements
- Use **classic Personal Access Token** (ghp_...), not fine-grained
- Required scope: `repo` (for organization repositories)
- Fine-grained tokens with per-repo scope don't work with org repos

### Jira API Limitations
- Some Jira workspaces restrict "unbounded JQL queries"
- CSV export is recommended as it bypasses API restrictions
- Individual issue fetches may return 404 despite CSV data existing

### Rate Limiting
- Default: 3.5 second delay between issue creations
- Prevents GitHub API throttling
- ~203 issues take ~10-15 minutes

## 📝 Logging

All scripts generate detailed logs:

- `csv_github_sync.log` - Main sync execution
- `github_labels.log` - Label setup execution
- `retry_failed_issue.log` - Retry execution

View logs:
```bash
tail -50 csv_github_sync.log
```

## 🐛 Troubleshooting

### 401 Unauthorized
- Check `GITHUB_TOKEN` is correct and not expired
- Verify token has `repo` scope

### 403 Forbidden
- If using fine-grained token, switch to classic token
- Classic token needs `repo` scope for organization repos

### 404 Not Found
- Verify `GITHUB_REPO` format: `owner/repo`
- Check repository exists and you have access

### Timeout Errors
- Increase `SYNC_DELAY_SEC` in .env
- Network issues - retry with `retry_failed_issue.py`

### CSV Column Errors
- Verify Jira export includes all columns (Summary, Type, Priority, Status, etc.)
- Check column names match script expectations

## 📚 References

- [GitHub Issues API](https://docs.github.com/en/rest/issues)
- [GitHub Labels API](https://docs.github.com/en/rest/issues/labels)
- [Jira Cloud API](https://developer.atlassian.com/cloud/jira)

## 📄 License

This project is part of PEzy Traffic Fine Management System.

---

**Last Updated**: 15 March 2026
**Status**: Production Ready (203/203 issues synced)
