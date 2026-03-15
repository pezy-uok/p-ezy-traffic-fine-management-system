#!/usr/bin/env python3
import os
from base64 import b64encode
import requests
from dotenv import load_dotenv

load_dotenv()

email = os.getenv("JIRA_EMAIL")
token = os.getenv("JIRA_API_TOKEN")
base_url = os.getenv("JIRA_BASE_URL")

auth_str = f"{email}:{token}"
encoded = b64encode(auth_str.encode()).decode()

session = requests.Session()
session.headers.update({
    "Authorization": f"Basic {encoded}",
    "Accept": "application/json",
})

print("Testing Jira Connection...")
print(f"URL: {base_url}")
print(f"Email: {email}\n")

# Get myself
print("1. Getting user info...")
resp = session.get(f"{base_url}/rest/api/3/myself", timeout=10)
print(f"   Status: {resp.status_code}")
if resp.ok:
    user = resp.json()
    print(f"   User: {user.get('displayName')}")
    print(f"   Account: {user.get('emailAddress')}")
else:
    print(f"   Error: {resp.text[:300]}")

# List projects
print("\n2. Listing available projects...")
resp = session.get(f"{base_url}/rest/api/3/project", timeout=10)
print(f"   Status: {resp.status_code}")
if resp.ok:
    projects = resp.json()
    print(f"   Found {len(projects)} projects:")
    for p in projects:
        print(f"   - {p.get('key')}: {p.get('name')}")
else:
    print(f"   Error: {resp.text[:300]}")

# Try fetching issues from PEZY
print("\n3. Fetching issues from PEZY...")
jql = "project = 'PEZY' ORDER BY created DESC"
resp = session.get(
    f"{base_url}/rest/api/3/search",
    params={"jql": jql, "maxResults": 5},
    timeout=10
)
print(f"   Status: {resp.status_code}")
if resp.ok:
    data = resp.json()
    print(f"   Found {data.get('total')} issues")
    for issue in data.get('issues', []):
        print(f"   - {issue.get('key')}: {issue['fields'].get('summary')}")
else:
    print(f"   Error: {resp.status_code}")
    print(f"   {resp.text[:300]}")
