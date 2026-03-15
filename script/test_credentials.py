#!/usr/bin/env python3
import os
from base64 import b64encode
import requests
from dotenv import load_dotenv

load_dotenv()

email = os.getenv('JIRA_EMAIL')
token = os.getenv('JIRA_API_TOKEN')
base_url = os.getenv('JIRA_BASE_URL')
github_token = os.getenv('GITHUB_TOKEN')

print('=' * 70)
print('API CREDENTIALS TEST')
print('=' * 70)

# Test Jira
print('\n1. Testing Jira API...')
try:
    auth_str = f'{email}:{token}'
    encoded = b64encode(auth_str.encode()).decode()
    
    session = requests.Session()
    session.headers.update({
        'Authorization': f'Basic {encoded}',
        'Accept': 'application/json',
    })
    
    resp = session.get(f'{base_url}/rest/api/3/myself', timeout=10)
    print(f'   Status: {resp.status_code}')
    
    if resp.ok:
        user = resp.json()
        print(f'   ✅ Jira WORKING')
        print(f'   User: {user.get("displayName")}')
        print(f'   Email: {user.get("emailAddress")}')
    else:
        print(f'   ❌ Jira FAILED: {resp.status_code}')
        print(f'   Response: {resp.text[:200]}')
except Exception as e:
    print(f'   ❌ Error: {str(e)}')

# Test specific issue keys
print('\n2. Testing PEZY issues in range 331-533...')
test_keys = ['PEZY-331', 'PEZY-400', 'PEZY-533']
found_count = 0

try:
    for key in test_keys:
        resp = session.get(f'{base_url}/rest/api/3/issues/{key}', timeout=10)
        if resp.ok:
            issue = resp.json()
            print(f'   ✅ {key}: FOUND - {issue["fields"]["summary"][:40]}')
            found_count += 1
        else:
            print(f'   ❌ {key}: NOT FOUND (HTTP {resp.status_code})')
except Exception as e:
    print(f'   Error: {str(e)}')

if found_count == 0:
    print('\n   ⚠️  WARNING: No issues found in range 331-533')
    print('   Checking if ANY PEZY issues exist...')
    try:
        # Try with JQL to see what issues exist
        resp = session.get(
            f'{base_url}/rest/api/3/search',
            params={'jql': 'project=PEZY ORDER BY key DESC', 'maxResults': 5},
            timeout=10
        )
        if resp.ok:
            issues = resp.json().get('issues', [])
            if issues:
                print(f'   Found {len(issues)} recent issues:')
                for issue in issues:
                    print(f'   - {issue["key"]}: {issue["fields"]["summary"][:40]}')
            else:
                print('   No PEZY issues found at all!')
        else:
            print(f'   JQL query failed: {resp.status_code}')
    except Exception as e:
        print(f'   Error with JQL: {str(e)}')

# Test GitHub
print('\n3. Testing GitHub API...')
try:
    gh_session = requests.Session()
    gh_session.headers.update({
        'Authorization': f'Bearer {github_token}',
        'Accept': 'application/vnd.github+json',
    })
    
    resp = gh_session.get('https://api.github.com/user', timeout=10)
    print(f'   Status: {resp.status_code}')
    
    if resp.ok:
        user = resp.json()
        print(f'   ✅ GitHub WORKING')
        print(f'   User: {user.get("login")}')
    else:
        print(f'   ❌ GitHub FAILED: {resp.status_code}')
except Exception as e:
    print(f'   ❌ Error: {str(e)}')

print('\n' + '=' * 70)
