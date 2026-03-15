#!/usr/bin/env python3
"""
Retry failed GitHub issue creation - PEZY-496
"""
import csv
import os
import requests
import logging
from dotenv import load_dotenv
import time

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('retry_failed_issue.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
GITHUB_REPO = os.getenv('GITHUB_REPO')
CSV_FILE = '/Users/shashmithabandara/Downloads/Jira (1).csv'

class GitHubClient:
    def __init__(self, token, repo):
        self.token = token
        self.repo = repo
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Accept': 'application/vnd.github+json',
        })
        
    def create_issue(self, title, body, labels):
        """Create a GitHub issue"""
        url = f'https://api.github.com/repos/{self.repo}/issues'
        payload = {
            'title': title,
            'body': body,
            'labels': labels,
        }
        
        try:
            resp = self.session.post(url, json=payload, timeout=30)
            if resp.ok:
                issue_data = resp.json()
                return True, issue_data.get('number')
            else:
                logger.error(f'Failed to create issue: {resp.status_code} - {resp.text}')
                return False, None
        except Exception as e:
            logger.error(f'Error creating issue: {str(e)}')
            return False, None

def format_body(issue_data):
    """Format issue body with metadata"""
    body = f"**Jira Link:** [PEZY-{issue_data['Issue key'].split('-')[1]}](https://pezytraffic.atlassian.net/browse/{issue_data['Issue key']})\n\n"
    
    body += "| Field | Value |\n"
    body += "|-------|-------|\n"
    body += f"| Issue Key | {issue_data['Issue key']} |\n"
    body += f"| Type | {issue_data['Issue Type']} |\n"
    body += f"| Priority | {issue_data['Priority']} |\n"
    body += f"| Status | {issue_data['Status']} |\n"
    body += f"| Assignee | {issue_data.get('Assignee') or 'Unassigned'} |\n"
    body += f"| Created | {issue_data['Created']} |\n\n"
    
    desc = issue_data.get('Description', '')
    if desc:
        body += f"## Description\n\n{desc}\n"
    
    return body

def get_labels(issue_data):
    """Extract labels from issue data"""
    labels = []
    
    # Type label
    issue_type = issue_data['Issue Type'].strip()
    type_mapping = {
        'Task': 'chore',
        'Bug': 'bug',
        'Story': 'enhancement',
        'Feature': 'enhancement',
        'Epic': 'epic',
    }
    if issue_type in type_mapping:
        labels.append(type_mapping[issue_type])
    
    # Priority label
    priority = issue_data['Priority'].strip()
    priority_mapping = {
        'Highest': 'priority:highest',
        'High': 'priority:high',
        'Medium': 'priority:medium',
        'Low': 'priority:low',
        'Lowest': 'priority:lowest',
    }
    if priority in priority_mapping:
        labels.append(priority_mapping[priority])
    
    # Status label
    status = issue_data['Status'].strip()
    status_mapping = {
        'To Do': 'status:todo',
        'In Progress': 'status:inprogress',
        'In Review': 'status:needs-review',
        'Done': 'status:done',
    }
    if status in status_mapping:
        labels.append(status_mapping[status])
    
    return labels

def main():
    logger.info('=' * 80)
    logger.info('RETRY FAILED ISSUE - PEZY-496')
    logger.info('=' * 80)
    
    # Read CSV
    logger.info(f'\nReading CSV file: {CSV_FILE}')
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        logger.info(f'✓ CSV loaded: {len(rows)} total rows')
    except Exception as e:
        logger.error(f'✗ Failed to read CSV: {str(e)}')
        return
    
    # Find PEZY-496
    target_issue = None
    for row in rows:
        if row['Issue key'] == 'PEZY-496':
            target_issue = row
            break
    
    if not target_issue:
        logger.error('✗ Could not find PEZY-496 in CSV file')
        return
    
    logger.info(f'\n✓ Found PEZY-496: {target_issue["Summary"]}')
    
    # Create GitHub issue
    logger.info('\nCreating GitHub issue...')
    client = GitHubClient(GITHUB_TOKEN, GITHUB_REPO)
    
    title = f'[PEZY-496]: {target_issue["Summary"]}'
    body = format_body(target_issue)
    labels = get_labels(target_issue)
    
    logger.info(f'  Title: {title}')
    logger.info(f'  Labels: {", ".join(labels)}')
    
    success, issue_number = client.create_issue(title, body, labels)
    
    if success:
        logger.info(f'\n✓ PEZY-496 successfully created as GitHub issue #{issue_number}')
        logger.info(f'\nView at: https://github.com/{GITHUB_REPO}/issues/{issue_number}')
    else:
        logger.error(f'\n✗ Failed to create PEZY-496')

if __name__ == '__main__':
    main()
