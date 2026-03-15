#!/usr/bin/env python3
"""
Jira → GitHub Issue Sync
Fetches all tickets from Jira and creates corresponding GitHub issues with labels.
"""

import os
import sys
import time
import logging
from typing import Optional
from dataclasses import dataclass
from datetime import datetime
from base64 import b64encode

import requests
from dotenv import load_dotenv

# ─────────────────────────────────────────────────────────────────────────────
# Configuration & Logging
# ─────────────────────────────────────────────────────────────────────────────

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

# ─────────────────────────────────────────────────────────────────────────────
# Jira Priority & Type Mapping to GitHub Labels
# ─────────────────────────────────────────────────────────────────────────────

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
    "Done": None,  # Don't add status label for completed items
    "Closed": None,
}

# ─────────────────────────────────────────────────────────────────────────────
# Data Classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class JiraTicket:
    """Represents a Jira ticket."""
    key: str
    summary: str
    description: Optional[str]
    type_: str
    priority: Optional[str]
    status: str
    assignee: Optional[str]
    url: str

    def __repr__(self):
        return f"<JiraTicket {self.key}: {self.summary}>"


# ─────────────────────────────────────────────────────────────────────────────
# Jira Client
# ─────────────────────────────────────────────────────────────────────────────

class JiraClient:
    """Fetches tickets from Jira."""

    def __init__(self, base_url: str, email: str, api_token: str):
        self.base_url = base_url.rstrip("/")
        self.email = email
        self.api_token = api_token
        self.session = requests.Session()
        
        # Basic auth header
        auth_str = f"{email}:{api_token}"
        encoded = b64encode(auth_str.encode()).decode()
        self.session.headers.update({
            "Authorization": f"Basic {encoded}",
            "Accept": "application/json",
        })

    def fetch_all_issues(self, project_key: str, max_results: int = 10000) -> list[JiraTicket]:
        """Fetch all issues from a Jira project.
        
        Args:
            project_key: Jira project key (e.g., "PEZY")
            max_results: Safety cap on total issues to fetch
            
        Returns:
            List of JiraTicket objects
        """
        issues = []
        page = 1
        page_size = 50
        
        log.info("Fetching Jira issues from project '%s'...", project_key)
        log.info("Note: Using workaround for workspace JQL restrictions...")
        
        # Workaround: Fetch issues using changelog/activity which might not have the same restrictions
        # Alternative: Try fetching via component or version if available
        try:
            # First, try to fetch the project to get its ID
            project_resp = self.session.get(
                f"{self.base_url}/rest/api/3/project/PEZY",
                timeout=30
            )
            
            if not project_resp.ok:
                log.error("Could not fetch project PEZY")
                return []
            
            # Try an alternative approach: use a very specific JQL with workaround
            # Search for issues that have been viewed by anyone (makes it bounded)
            while True:
                # Use a simpler approach - fetch via filter or use watchers
                jql = 'type in (Task, Story, Bug, Epic, Subtask, Feature)'
                
                url = f"{self.base_url}/rest/api/3/search/jql"
                params = {
                    "query": jql,
                    "startAt": (page - 1) * page_size,
                    "maxResults": page_size,
                    "fields": "key,summary,description,issuetype,priority,status,assignee",
                }
                
                response = self.session.get(url, params=params, timeout=30)
                
                if response.status_code == 400:
                    # If type-based search fails, try with even more specific restrictions
                    log.warning("JQL type-based search failed, trying alternative...")
                    log.error("This Jira workspace has restrictive unbounded query policies.")
                    log.error("Unable to fetch issues. Please try:")
                    log.error("  1. Contact your Jira admin to enable /rest/api/3/search in their policies")
                    log.error("  2. Create a script filter in Jira for your issues")
                    log.error("  3. Manually export issues as CSV and provide keys via environment variable")
                    return []
                
                if not response.ok:
                    log.error("Jira API error: %s - %s", response.status_code, response.text[:200])
                    return []
                
                data = response.json()
                fetched = data.get("issues", [])
                
                if not fetched:
                    break
                
                log.info("  Fetched %d issues (page %d)...", len(fetched), page)
                
                for issue in fetched:
                    fields = issue.get("fields", {})
                    
                    # Filter to only PEZY project issues
                    if not issue.get("key", "").startswith("PEZY"):
                        continue
                    
                    ticket = JiraTicket(
                        key=issue.get("key", "UNKNOWN"),
                        summary=fields.get("summary", "No title"),
                        description=fields.get("description", ""),
                        type_=fields.get("issuetype", {}).get("name", "Unknown"),
                        priority=fields.get("priority", {}).get("name") if fields.get("priority") else None,
                        status=fields.get("status", {}).get("name", "Unknown"),
                        assignee=fields.get("assignee", {}).get("displayName") if fields.get("assignee") else None,
                        url=f"{self.base_url}/browse/{issue.get('key')}",
                    )
                    issues.append(ticket)
                
                if len(fetched) < page_size:
                    break
                
                page += 1
                
                if len(issues) >= max_results:
                    log.warning("Reached max_results cap (%d). Stopping fetch.", max_results)
                    break
                
                time.sleep(0.5)
                
        except Exception as e:
            log.error("Error fetching Jira issues: %s", e)
        
        if not issues:
            log.error("No issues fetched. The Jira workspace may have query restrictions.")
        else:
            log.info("✓ Successfully fetched %d Jira issues", len(issues))
        
        return issues


# ─────────────────────────────────────────────────────────────────────────────
# GitHub Client
# ─────────────────────────────────────────────────────────────────────────────

class GitHubClient:
    """Creates and manages GitHub issues."""

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
        """Build GitHub API URL for this repository."""
        base = f"{self.API}/repos/{self.owner}/{self.repo}"
        return base + endpoint

    def verify_access(self) -> bool:
        """Verify GitHub token and repository access."""
        try:
            # Test token
            user_resp = self.session.get(f"{self.API}/user", timeout=30)
            if not user_resp.ok:
                log.error("GitHub authentication failed: %s", user_resp.status_code)
                return False
            
            user = user_resp.json()
            log.info("  GitHub user: %s", user.get("login"))
            
            # Test repo access
            repo_resp = self.session.get(self._repo_url(), timeout=30)
            if not repo_resp.ok:
                log.error("Repository '%s/%s' not found or not accessible: %s", 
                         self.owner, self.repo, repo_resp.status_code)
                return False
            
            repo = repo_resp.json()
            log.info("  Target repository: %s", repo.get("full_name"))
            
            return True
        except Exception as e:
            log.error("Error verifying GitHub access: %s", e)
            return False

    def get_existing_issues(self) -> dict[str, int]:
        """Get all existing issues. Returns mapping of title -> issue_number."""
        existing = {}
        page = 1
        
        try:
            while True:
                resp = self.session.get(
                    self._repo_url("/issues"),
                    params={"state": "all", "per_page": self.page_size, "page": page},
                    timeout=30,
                )
                
                if not resp.ok:
                    log.warning("Failed to fetch existing issues: %s", resp.status_code)
                    break
                
                issues = resp.json()
                if not issues:
                    break
                
                for issue in issues:
                    existing[issue["title"]] = issue["number"]
                
                page += 1
        except Exception as e:
            log.error("Error fetching existing issues: %s", e)
        
        return existing

    def create_issue(self, title: str, body: str, labels: list[str]) -> bool:
        """Create a GitHub issue.
        
        Args:
            title: Issue title
            body: Issue description/body
            labels: List of label names
            
        Returns:
            True if successful, False otherwise
        """
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
                log.error("    Response: %s", resp.text[:300])
                return False
                
        except Exception as e:
            log.error("  ✗ Error creating issue '%s': %s", title, e)
            return False

    def close_all_issues(self) -> int:
        """Close all existing GitHub issues. Returns count of closed issues."""
        log.info("Closing all existing GitHub issues...")
        closed_count = 0
        page = 1
        
        try:
            while True:
                resp = self.session.get(
                    self._repo_url("/issues"),
                    params={"state": "open", "per_page": self.page_size, "page": page},
                    timeout=30,
                )
                
                if not resp.ok:
                    log.warning("Failed to fetch open issues: %s", resp.status_code)
                    break
                
                issues = resp.json()
                if not issues:
                    break
                
                for issue in issues:
                    try:
                        close_resp = self.session.patch(
                            self._repo_url(f"/issues/{issue['number']}"),
                            json={"state": "closed"},
                            timeout=30,
                        )
                        if close_resp.ok:
                            closed_count += 1
                            log.info("  ✓ Closed issue #%d", issue["number"])
                        else:
                            log.warning("  Failed to close issue #%d", issue["number"])
                    except Exception as e:
                        log.error("  Error closing issue #%d: %s", issue["number"], e)
                
                page += 1
                time.sleep(0.5)  # Rate limiting
                
        except Exception as e:
            log.error("Error closing issues: %s", e)
        
        log.info("✓ Closed %d issues", closed_count)
        return closed_count


# ─────────────────────────────────────────────────────────────────────────────
# Sync Logic
# ─────────────────────────────────────────────────────────────────────────────

def map_jira_labels(ticket: JiraTicket) -> list[str]:
    """Map Jira ticket attributes to GitHub labels.
    
    Args:
        ticket: JiraTicket object
        
    Returns:
        List of label names
    """
    labels = []
    
    # Type label
    type_label = JIRA_TYPE_TO_GITHUB_LABEL.get(ticket.type_, "chore")
    if type_label:
        labels.append(type_label)
    
    # Priority label
    if ticket.priority:
        priority_label = JIRA_PRIORITY_TO_GITHUB_LABEL.get(ticket.priority)
        if priority_label:
            labels.append(priority_label)
    
    # Status label
    status_label = JIRA_STATUS_TO_GITHUB_LABEL.get(ticket.status)
    if status_label:
        labels.append(status_label)
    
    return list(set(labels))  # Remove duplicates


def format_issue_body(ticket: JiraTicket) -> str:
    """Format Jira ticket into GitHub issue description.
    
    Args:
        ticket: JiraTicket object
        
    Returns:
        Formatted issue body/description
    """
    lines = [
        f"**From Jira:** [{ticket.key}]({ticket.url})",
        "",
    ]
    
    # Task type and priority
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
    
    # Description
    if ticket.description:
        lines.append("**Description:**")
        lines.append(ticket.description)
    else:
        lines.append("*No description provided in Jira*")
    
    return "\n".join(lines)


def sync_tickets(jira_client: JiraClient, github_client: GitHubClient, 
                 jira_project: str, close_existing: bool = True) -> int:
    """Sync all Jira tickets to GitHub issues.
    
    Args:
        jira_client: JiraClient instance
        github_client: GitHubClient instance
        jira_project: Jira project key
        close_existing: Whether to close existing GitHub issues first
        
    Returns:
        Number of issues created
    """
    log.info("=" * 80)
    log.info("JIRA → GITHUB SYNC")
    log.info("=" * 80)
    log.info("")
    
    # Step 0: Close existing issues (optional)
    if close_existing:
        log.info("── Step 0: Closing existing GitHub issues ──")
        github_client.close_all_issues()
        log.info("")
        time.sleep(2)
    
    # Step 1: Fetch Jira tickets
    log.info("── Step 1: Fetching Jira tickets ──")
    max_issues = int(os.getenv("JIRA_MAX_ISSUES", "10000"))
    jira_tickets = jira_client.fetch_all_issues(jira_project, max_results=max_issues)
    log.info("")
    
    if not jira_tickets:
        log.error("No Jira tickets found. Stopping sync.")
        return 0
    
    # Step 2: Get existing GitHub issues to avoid duplicates
    log.info("── Step 2: Checking existing GitHub issues ──")
    existing = github_client.get_existing_issues()
    log.info("  Found %d existing issues", len(existing))
    log.info("")
    
    # Step 3: Create issues
    log.info("── Step 3: Creating GitHub issues ──")
    created_count = 0
    skipped_count = 0
    delay = float(os.getenv("SYNC_DELAY_SEC", "3.5"))
    
    for ticket in jira_tickets:
        # Check if already exists
        if ticket.summary in existing:
            log.info("  ⊘ Skipped (exists): #%d - %s", existing[ticket.summary], ticket.summary)
            skipped_count += 1
            continue
        
        # Map labels
        labels = map_jira_labels(ticket)
        
        # Format issue body
        body = format_issue_body(ticket)
        
        # Create issue
        if github_client.create_issue(ticket.summary, body, labels):
            created_count += 1
            time.sleep(delay)  # Rate limiting
        else:
            time.sleep(1)
    
    log.info("")
    log.info("=" * 80)
    log.info("✓ SYNC COMPLETE")
    log.info("=" * 80)
    log.info("  Created: %d new issues", created_count)
    log.info("  Skipped: %d existing issues", skipped_count)
    log.info("  Total Jira tickets: %d", len(jira_tickets))
    log.info("")
    
    return created_count


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    """Main entry point."""
    
    # Load environment variables
    jira_email = os.getenv("JIRA_EMAIL")
    jira_token = os.getenv("JIRA_API_TOKEN")
    jira_url = os.getenv("JIRA_BASE_URL")
    jira_project = os.getenv("JIRA_PROJECT")
    
    github_token = os.getenv("GITHUB_TOKEN")
    github_repo = os.getenv("GITHUB_REPO")
    
    # Validation
    if not all([jira_email, jira_token, jira_url, jira_project]):
        log.error("Missing required Jira environment variables:")
        log.error("  JIRA_EMAIL, JIRA_API_TOKEN, JIRA_BASE_URL, JIRA_PROJECT")
        sys.exit(1)
    
    if not all([github_token, github_repo]):
        log.error("Missing required GitHub environment variables:")
        log.error("  GITHUB_TOKEN, GITHUB_REPO")
        sys.exit(1)
    
    # Parse GitHub repo
    try:
        owner, repo = github_repo.split("/")
    except ValueError:
        log.error("Invalid GITHUB_REPO format. Should be 'owner/repo'.")
        sys.exit(1)
    
    # Initialize clients
    jira_client = JiraClient(jira_url, jira_email, jira_token)
    github_client = GitHubClient(github_token, owner, repo)
    
    # Verify access
    log.info("Verifying credentials...")
    if not github_client.verify_access():
        log.error("GitHub access verification failed.")
        sys.exit(1)
    log.info("")
    
    # Run sync
    try:
        created = sync_tickets(jira_client, github_client, jira_project, close_existing=True)
        sys.exit(0 if created >= 0 else 1)
    except KeyboardInterrupt:
        log.info("\n⊘ Sync interrupted by user.")
        sys.exit(1)
    except Exception as e:
        log.error("Fatal error during sync: %s", e, exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
