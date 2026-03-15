#!/usr/bin/env python3
"""
CSV → GitHub Issues Sync
Reads issues directly from Jira CSV export and creates GitHub issues
"""
import os
import csv
import requests
import logging
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('csv_github_sync.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# GitHub config
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
GITHUB_REPO = os.getenv('GITHUB_REPO')
SYNC_DELAY = float(os.getenv('SYNC_DELAY_SEC', '3.5'))

# Label mapping
TYPE_LABELS = {
    'Task': 'chore',
    'Bug': 'bug',
    'Story': 'enhancement',
    'Feature': 'enhancement',
    'Epic': 'epic',
}

PRIORITY_LABELS = {
    'High': 'priority:high',
    'Medium': 'priority:medium',
    'Low': 'priority:low',
    'Highest': 'priority:highest',
    'Lowest': 'priority:lowest',
}

STATUS_LABELS = {
    'To Do': 'status:todo',
    'In Progress': 'status:inprogress',
    'In Review': 'status:needs-review',
    'Done': 'status:done',
}

class GitHubClient:
    def __init__(self, token, repo):
        self.token = token
        self.repo = repo
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Accept': 'application/vnd.github+json',
        })
        self.base_url = 'https://api.github.com/repos'
        
    def create_issue(self, title, body, labels):
        """Create a GitHub issue"""
        url = f'{self.base_url}/{self.repo}/issues'
        payload = {
            'title': title,
            'body': body,
            'labels': labels
        }
        
        try:
            resp = self.session.post(url, json=payload, timeout=10)
            if resp.ok:
                issue = resp.json()
                return issue['number']
            else:
                logger.error(f'Failed to create issue "{title}": {resp.status_code}')
                logger.error(f'Response: {resp.text[:200]}')
                return None
        except Exception as e:
            logger.error(f'Error creating issue "{title}": {str(e)}')
            return None

def format_body(issue_data):
    """Format issue body with Jira link and metadata"""
    key = issue_data.get('Issue key', 'N/A')
    issue_type = issue_data.get('Issue Type', 'N/A')
    priority = issue_data.get('Priority', 'N/A')
    status = issue_data.get('Status', 'N/A')
    description = issue_data.get('Description', '')
    
    body = f"""**Source**: Jira Issue {key}

### Metadata
| Field | Value |
|-------|-------|
| **Type** | {issue_type} |
| **Priority** | {priority} |
| **Status** | {status} |

### Description
{description if description else '*(No description provided)*'}
"""
    return body

def get_labels(issue_data):
    """Extract labels from issue data"""
    labels = []
    
    # Type label
    issue_type = issue_data.get('Issue Type', '')
    if issue_type in TYPE_LABELS:
        labels.append(TYPE_LABELS[issue_type])
    
    # Priority label
    priority = issue_data.get('Priority', '')
    if priority in PRIORITY_LABELS:
        labels.append(PRIORITY_LABELS[priority])
    
    # Status label
    status = issue_data.get('Status', '')
    if status in STATUS_LABELS:
        labels.append(STATUS_LABELS[status])
    
    # Custom labels from CSV
    custom_labels = issue_data.get('Labels', '')
    if custom_labels:
        labels.extend([l.strip() for l in custom_labels.split(',') if l.strip()])
    
    return labels

def main():
    logger.info('=' * 80)
    logger.info('CSV → GITHUB SYNC (Direct CSV Import Mode)')
    logger.info('=' * 80)
    
    # Verify credentials
    logger.info('\nVerifying GitHub credentials...')
    github = GitHubClient(GITHUB_TOKEN, GITHUB_REPO)
    
    try:
        resp = github.session.get('https://api.github.com/user', timeout=10)
        if resp.ok:
            user = resp.json()
            logger.info(f'✓ GitHub authenticated as: {user.get("login")}')
            logger.info(f'✓ Target repository: {GITHUB_REPO}')
        else:
            logger.error(f'✗ GitHub authentication failed: {resp.status_code}')
            return
    except Exception as e:
        logger.error(f'✗ Error authenticating with GitHub: {str(e)}')
        return
    
    # Read CSV
    csv_path = '/Users/shashmithabandara/Downloads/Jira (1).csv'
    
    if not os.path.exists(csv_path):
        logger.error(f'✗ CSV file not found: {csv_path}')
        return
    
    logger.info(f'\nReading CSV file: {csv_path}')
    
    issues_to_create = []
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row and row.get('Issue key', '').startswith('PEZY-'):
                    issues_to_create.append(row)
    except Exception as e:
        logger.error(f'✗ Error reading CSV: {str(e)}')
        return
    
    logger.info(f'✓ Found {len(issues_to_create)} PEZY issues in CSV')
    
    if not issues_to_create:
        logger.error('✗ No PEZY issues found in CSV')
        return
    
    # Create issues
    logger.info(f'\nCreating GitHub issues ({len(issues_to_create)} total)...\n')
    
    created = 0
    failed = 0
    
    for i, issue in enumerate(issues_to_create, 1):
        key = issue.get('Issue key', 'UNKNOWN')
        summary = issue.get('Summary', '(No summary)')
        
        logger.info(f'[{i}/{len(issues_to_create)}] Creating {key}: {summary[:50]}...')
        
        title = f'{key}: {summary}'
        body = format_body(issue)
        labels = get_labels(issue)
        
        issue_num = github.create_issue(title, body, labels)
        
        if issue_num:
            logger.info(f'  ✓ Created as GitHub issue #{issue_num}')
            created += 1
        else:
            logger.error(f'  ✗ Failed to create issue')
            failed += 1
        
        # Rate limiting
        import time
        time.sleep(SYNC_DELAY)
    
    # Summary
    logger.info('\n' + '=' * 80)
    logger.info('SYNC COMPLETE')
    logger.info('=' * 80)
    logger.info(f'Created: {created} issues')
    logger.info(f'Failed: {failed} issues')
    logger.info(f'Total: {len(issues_to_create)} issues')

if __name__ == '__main__':
    main()
