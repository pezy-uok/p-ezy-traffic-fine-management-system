#!/usr/bin/env python3
import os
import requests
from base64 import b64encode
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

print("=" * 70)
print("JIRA ISSUE DISCOVERY")
print("=" * 70)

# Try different JQL queries
print("\n1. Fetching all PEZY issues (ORDER BY key DESC, limit 20)...")
resp = session.get(
    f"{base_url}/rest/api/3/search",
    params={"jql": "project=PEZY ORDER BY key DESC", "maxResults": 20},
    timeout=10
)
print(f"   Status: {resp.status_code}")
if resp.ok:
    data = resp.json()
    total = data.get("total", 0)
    issues = data.get("issues", [])
    print(f"   Total issues in project: {total}")
    print(f"   Found: {len(issues)} issues in this page")
    if issues:
        print(f"\n   SAMPLE ISSUES:")
        for issue in issues[:5]:
            print(f"     - {issue['key']}: {issue['fields']['summary'][:50]}")
else:
    print(f"   Error: {resp.status_code}")
    if resp.text:
        try:
            err = resp.json()
            print(f"   Message: {err}")
        except:
            print(f"   Response: {resp.text[:200]}")

print("\n" + "=" * 70)
