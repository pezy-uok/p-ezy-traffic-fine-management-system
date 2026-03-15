#!/usr/bin/env python3
"""
GitHub Labels Manager - Create colored labels and apply them to issues
"""
import os
import requests
import logging
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('github_labels.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
GITHUB_REPO = os.getenv('GITHUB_REPO')

# Color definitions for labels
LABELS = {
    # Issue Types
    'chore': {'color': '0366d6', 'description': 'Task / Chore'},
    'bug': {'color': 'd73a49', 'description': 'Bug'},
    'enhancement': {'color': '28a745', 'description': 'Enhancement / Feature'},
    'epic': {'color': '6f42c1', 'description': 'Epic'},
    
    # Priority
    'priority:highest': {'color': 'ff0000', 'description': 'Highest Priority'},
    'priority:high': {'color': 'ff6b6b', 'description': 'High Priority'},
    'priority:medium': {'color': 'ffc107', 'description': 'Medium Priority'},
    'priority:low': {'color': '28a745', 'description': 'Low Priority'},
    'priority:lowest': {'color': '6c757d', 'description': 'Lowest Priority'},
    
    # Status
    'status:todo': {'color': 'fc2929', 'description': 'To Do'},
    'status:inprogress': {'color': 'fbca04', 'description': 'In Progress'},
    'status:needs-review': {'color': '0366d6', 'description': 'Needs Review'},
    'status:done': {'color': '28a745', 'description': 'Done'},
}

class GitHubLabelsManager:
    def __init__(self, token, repo):
        self.token = token
        self.repo = repo
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Accept': 'application/vnd.github+json',
        })
        self.base_url = 'https://api.github.com/repos'
        
    def create_label(self, name, color, description):
        """Create or update a label"""
        url = f'{self.base_url}/{self.repo}/labels/{name}'
        payload = {
            'color': color,
            'description': description,
        }
        
        try:
            # Try to update existing label
            resp = self.session.patch(url, json=payload, timeout=10)
            if resp.ok:
                return True, 'updated'
            elif resp.status_code == 404:
                # Label doesn't exist, create it
                url = f'{self.base_url}/{self.repo}/labels'
                resp = self.session.post(
                    url,
                    json={'name': name, **payload},
                    timeout=10
                )
                if resp.ok:
                    return True, 'created'
                else:
                    logger.error(f'Failed to create label "{name}": {resp.status_code}')
                    return False, 'failed'
            else:
                logger.error(f'Failed to update label "{name}": {resp.status_code}')
                return False, 'failed'
        except Exception as e:
            logger.error(f'Error with label "{name}": {str(e)}')
            return False, 'error'

def main():
    logger.info('=' * 80)
    logger.info('GITHUB LABELS MANAGER')
    logger.info('=' * 80)
    
    # Verify credentials
    logger.info('\nVerifying GitHub credentials...')
    manager = GitHubLabelsManager(GITHUB_TOKEN, GITHUB_REPO)
    
    try:
        resp = manager.session.get('https://api.github.com/user', timeout=10)
        if resp.ok:
            user = resp.json()
            logger.info(f'✓ GitHub authenticated as: {user.get("login")}')
            logger.info(f'✓ Target repository: {GITHUB_REPO}')
        else:
            logger.error(f'✗ GitHub authentication failed: {resp.status_code}')
            return
    except Exception as e:
        logger.error(f'✗ Error authenticating: {str(e)}')
        return
    
    # Create labels
    logger.info(f'\nCreating {len(LABELS)} colored labels...\n')
    
    created = 0
    updated = 0
    failed = 0
    
    for label_name, label_info in LABELS.items():
        logger.info(f'  Processing "{label_name}"...')
        success, status = manager.create_label(
            label_name,
            label_info['color'],
            label_info['description']
        )
        
        if success:
            if status == 'created':
                logger.info(f'    ✓ Created with color #{label_info["color"]}')
                created += 1
            elif status == 'updated':
                logger.info(f'    ✓ Updated with color #{label_info["color"]}')
                updated += 1
        else:
            logger.error(f'    ✗ Failed')
            failed += 1
    
    # Summary
    logger.info('\n' + '=' * 80)
    logger.info('LABELS SETUP COMPLETE')
    logger.info('=' * 80)
    logger.info(f'Created: {created} labels')
    logger.info(f'Updated: {updated} labels')
    logger.info(f'Failed: {failed} labels')
    logger.info(f'\nLabels are now available for all issues in your repository!')

if __name__ == '__main__':
    main()
