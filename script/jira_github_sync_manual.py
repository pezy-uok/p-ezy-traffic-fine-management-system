#!/usr/bin/env python3
"""
Jira → GitHub Issue Sync - Manual Issue List Version

This version works around Jira workspace JQL restrictions by using specific issue keys.
"""

import os
import sys
import time
import logging
from typing import Optional
from dataclasses import dataclass
from base64 import b64encode

import requests
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("jira_github_sync.log"),
    ],
)
log = logging.getLogger(__name__)

@dataclass
class JiraTicket:
    key: str
    summary: str
    description: Optional[str]
    type_: str
    priority: Optional[str]
    status: str
    assignee: Optional[str]
    url: str

JIRA_TYPE_TO_GITHUB_LABEL = {
    "Story": "enhancement",
    "Task": "chore",
    "Bug": "bug",
    "Epic": "enhancement",
    "Sub-task": "chore",
    "Feature": "enhancement",
}

JIRA_PRIORITY_TO_GITHUB_LABEL = {
    "Highest": "priority: critical",
    "High": "priority: high",
    "Medium": "priority: medium",
    "Low": "priority: low",
    "Lowest": "priority: low",
}

JIRA_STATUS_TO_GITHUB_LABEL = {
    "To Do": "status: in progress",
    "In Progress": "status: in progress",
    "In Review": "status: needs review",
    "Done": None,
    "Closed": None,
}

class JiraClient:
    def __init__(self, base_url: str, email: str, api_token: str):
        self.base_url = base_url.rstrip("/")
        self.email = email
        self.api_token = api_token
        self.session = requests.Session()
        auth_str = f"{email}:{api_token}"
        encoded = b64encode(auth_str.encode()).decode()
        self.session.headers.update({
            "Authorization": f"Basic {encoded}",
            "Accept": "application/json",
        })

    def fetch_issue(self, issue_key: str) -> Optional[JiraTicket]:
        """Fetch a single issue by key."""
        try:
            url = f"{self.base_url}/rest/api/3/issues/{issue_key}"
            resp = self.session.get(url, timeout=10)
            
            if not resp.ok:
                log.error("  Failed to fetch %s: %s", issue_key, resp.status_code)
                return None
            
            issue = resp.json()
            fields = issue.get("fields", {})
            
            return JiraTicket(
                key=issue.get("key"),
                summary=fields.get("summary", "No title"),
                description=fields.get("description", ""),
                type_=fields.get("issuetype", {}).get("name", "Unknown"),
                priority=fields.get("priority", {}).get("name") if fields.get("priority") else None,
                status=fields.get("status", {}).get("name", "Unknown"),
                assignee=fields.get("assignee", {}).get("displayName") if fields.get("assignee") else None,
                url=f"{self.base_url}/browse/{issue_key}",
            )
        except Exception as e:
            log.error("  Error fetching %s: %s", issue_key, e)
            return None

    def fetch_issues_by_key_list(self, issue_keys: list[str]) -> list[JiraTicket]:
        """Fetch multiple issues by their keys."""
        tickets = []
        log.info("Fetching %d Jira issues by key...", len(issue_keys))
        
        for key in issue_keys:
            log.info("  Fetching %s...", key)
            ticket = self.fetch_issue(key)
            if ticket:
                tickets.append(ticket)
            time.sleep(0.3)
        
        return tickets

class GitHubClient:
    def __init__(self, token: str, owner: str, repo: str):
        self.token = token
        self.owner = owner
        self.repo = repo
        self.page_size = 100
        
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
        })
        
        self.API = "https://api.github.com"

    def _repo_url(self, endpoint: str = "") -> str:
        base = f"{self.API}/repos/{self.owner}/{self.repo}"
        return base + endpoint

    def verify_access(self) -> bool:
        try:
            user_resp = self.session.get(f"{self.API}/user", timeout=30)
            if not user_resp.ok:
                log.error("GitHub authentication failed: %s", user_resp.status_code)
                return False
            
            user = user_resp.json()
            log.info("  GitHub user: %s", user.get("login"))
            
            repo_resp = self.session.get(self._repo_url(), timeout=30)
            if not repo_resp.ok:
                log.error("Repository '%s/%s' not found: %s", self.owner, self.repo, repo_resp.status_code)
                return False
            
            repo = repo_resp.json()
            log.info("  Target repository: %s", repo.get("full_name"))
            
            return True
        except Exception as e:
            log.error("Error verifying GitHub access: %s", e)
            return False

    def create_issue(self, title: str, body: str, labels: list[str]) -> bool:
        try:
            payload = {
                "title": title,
                "body": body,
                "labels": labels,
            }
            
            resp = self.session.post(
                self._repo_url("/issues"),
                json=payload,
                timeout=30,
            )
            
            if resp.ok:
                issue = resp.json()
                log.info("  ✓ Created issue #%d: %s", issue["number"], title)
                return True
            else:
                log.error("  ✗ Failed to create issue '%s': %s", title, resp.status_code)
                return False
                
        except Exception as e:
            log.error("  ✗ Error creating issue '%s': %s", title, e)
            return False

def map_jira_labels(ticket: JiraTicket) -> list[str]:
    labels = []
    
    type_label = JIRA_TYPE_TO_GITHUB_LABEL.get(ticket.type_, "chore")
    if type_label:
        labels.append(type_label)
    
    if ticket.priority:
        priority_label = JIRA_PRIORITY_TO_GITHUB_LABEL.get(ticket.priority)
        if priority_label:
            labels.append(priority_label)
    
    status_label = JIRA_STATUS_TO_GITHUB_LABEL.get(ticket.status)
    if status_label:
        labels.append(status_label)
    
    return list(set(labels))

def format_issue_body(ticket: JiraTicket) -> str:
    lines = [
        f"**From Jira:** [{ticket.key}]({ticket.url})",
        "",
    ]
    
    if ticket.type_ or ticket.priority:
        lines.append("**Details:**")
        if ticket.type_:
            lines.append(f"- Type: {ticket.type_}")
        if ticket.priority:
            lines.append(f"- Priority: {ticket.priority}")
        if ticket.status:
            lines.append(f"- Status: {ticket.status}")
        if ticket.assignee:
            lines.append(f"- Assignee: {ticket.assignee}")
        lines.append("")
    
    if ticket.description:
        lines.append("**Description:**")
        lines.append(ticket.description)
    else:
        lines.append("*No description provided in Jira*")
    
    return "\n".join(lines)

def main():
    jira_email = os.getenv("JIRA_EMAIL")
    jira_token = os.getenv("JIRA_API_TOKEN")
    jira_url = os.getenv("JIRA_BASE_URL")
    
    github_token = os.getenv("GITHUB_TOKEN")
    github_repo = os.getenv("GITHUB_REPO")
    issue_keys = os.getenv("JIRA_ISSUE_KEYS", "").strip()
    
    if not all([jira_email, jira_token, jira_url]):
        log.error("Missing Jira environment variables")
        sys.exit(1)
    
    if not all([github_token, github_repo]):
        log.error("Missing GitHub environment variables")
        sys.exit(1)
    
    if not issue_keys:
        log.error("JIRA_ISSUE_KEYS environment variable not set")
        log.error("Please set JIRA_ISSUE_KEYS=PEZY-1,PEZY-2,PEZY-3,etc in your .env file")
        sys.exit(1)
    
    try:
        owner, repo = github_repo.split("/")
    except ValueError:
        log.error("Invalid GITHUB_REPO format. Should be 'owner/repo'.")
        sys.exit(1)
    
    jira_client = JiraClient(jira_url, jira_email, jira_token)
    github_client = GitHubClient(github_token, owner, repo)
    
    log.info("Verifying credentials...")
    if not github_client.verify_access():
        log.error("GitHub access verification failed.")
        sys.exit(1)
    log.info("")
    
    log.info("=" * 80)
    log.info("JIRA → GITHUB SYNC (Manual Issue Keys Mode)")
    log.info("=" * 80)
    log.info("")
    
    # Parse issue keys
    keys = [k.strip().upper() for k in issue_keys.split(",") if k.strip()]
    
    if not keys:
        log.error("No valid issue keys provided in JIRA_ISSUE_KEYS")
        sys.exit(1)
    
    log.info("Fetching %d Jira issues...", len(keys))
    jira_tickets = jira_client.fetch_issues_by_key_list(keys)
    log.info("")
    
    if not jira_tickets:
        log.error("No Jira issues fetched")
        sys.exit(1)
    
    log.info("Creating GitHub issues...")
    created = 0
    delay = float(os.getenv("SYNC_DELAY_SEC", "3.5"))
    
    for ticket in jira_tickets:
        labels = map_jira_labels(ticket)
        body = format_issue_body(ticket)
        
        if github_client.create_issue(ticket.summary, body, labels):
            created += 1
            time.sleep(delay)
        else:
            time.sleep(1)
    
    log.info("")
    log.info("=" * 80)
    log.info("✓ SYNC COMPLETE")
    log.info("=" * 80)
    log.info("  Created: %d issues")
    log.info("  Total: %d", created, len(jira_tickets))
    log.info("")

if __name__ == "__main__":
    main()
