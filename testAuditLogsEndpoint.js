import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

/**
 * Test Audit Logs Endpoints
 * Make sure backend is running and a valid admin token is available
 */

// Replace with valid admin JWT token from your system
const ADMIN_TOKEN = 'your_admin_jwt_token_here';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
  },
});

/**
 * Test 1: Get all audit logs with pagination
 */
async function testGetAllAuditLogs() {
  try {
    console.log('\n📋 Test 1: Get All Audit Logs');
    console.log('─'.repeat(50));

    const response = await axiosInstance.get('/admin/audit-logs', {
      params: {
        limit: 10,
        offset: 0,
        sortOrder: 'desc',
      },
    });

    console.log('✅ Success');
    console.log(`Total logs: ${response.data.total}`);
    console.log(`Returned: ${response.data.auditLogs.length}`);
    if (response.data.auditLogs.length > 0) {
      console.log('First log:', JSON.stringify(response.data.auditLogs[0], null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 2: Get audit logs with filtering
 */
async function testGetAuditLogsFiltered() {
  try {
    console.log('\n📋 Test 2: Get Audit Logs (Filtered by action)');
    console.log('─'.repeat(50));

    const response = await axiosInstance.get('/admin/audit-logs', {
      params: {
        action: 'UPDATE',
        limit: 5,
      },
    });

    console.log('✅ Success');
    console.log(`Found ${response.data.total} UPDATE actions`);
    console.log('Logs:', JSON.stringify(response.data.auditLogs, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 3: Get audit log by ID
 */
async function testGetAuditLogById() {
  try {
    console.log('\n📋 Test 3: Get Audit Log by ID');
    console.log('─'.repeat(50));

    // First, get any log ID
    const listResponse = await axiosInstance.get('/admin/audit-logs', { params: { limit: 1 } });

    if (listResponse.data.auditLogs.length === 0) {
      console.log('⚠️  No audit logs available to test');
      return;
    }

    const logId = listResponse.data.auditLogs[0].id;
    console.log(`Fetching log ID: ${logId}`);

    const response = await axiosInstance.get(`/admin/audit-logs/${logId}`);

    console.log('✅ Success');
    console.log('Log details:', JSON.stringify(response.data.auditLog, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 4: Get critical severity logs
 */
async function testGetCriticalLogs() {
  try {
    console.log('\n📋 Test 4: Get Critical Severity Logs');
    console.log('─'.repeat(50));

    const response = await axiosInstance.get('/admin/audit-logs/critical', {
      params: { limit: 10 },
    });

    console.log('✅ Success');
    console.log(`Found ${response.data.total} critical logs`);
    console.log(`Returned: ${response.data.auditLogs.length}`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 5: Get failed logs
 */
async function testGetFailedLogs() {
  try {
    console.log('\n📋 Test 5: Get Failed Operation Logs');
    console.log('─'.repeat(50));

    const response = await axiosInstance.get('/admin/audit-logs/failed', {
      params: { limit: 10 },
    });

    console.log('✅ Success');
    console.log(`Found ${response.data.total} failed logs`);
    console.log(`Returned: ${response.data.auditLogs.length}`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 6: Get logs by date range
 */
async function testGetLogsByDateRange() {
  try {
    console.log('\n📋 Test 6: Get Logs by Date Range');
    console.log('─'.repeat(50));

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24); // Last 24 hours

    const endDate = new Date();

    const response = await axiosInstance.get('/admin/audit-logs', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 10,
      },
    });

    console.log('✅ Success');
    console.log(`Found ${response.data.total} logs in the last 24 hours`);
    console.log(`Returned: ${response.data.auditLogs.length}`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 7: Get logs by user
 */
async function testGetLogsByUser() {
  try {
    console.log('\n📋 Test 7: Get Logs by User');
    console.log('─'.repeat(50));

    // First, get a user ID from logs
    const listResponse = await axiosInstance.get('/admin/audit-logs', { params: { limit: 1 } });

    if (listResponse.data.auditLogs.length === 0) {
      console.log('⚠️  No audit logs available to test');
      return;
    }

    const userId = listResponse.data.auditLogs[0].userId;
    console.log(`Fetching logs for user: ${userId}`);

    const response = await axiosInstance.get(`/admin/audit-logs/user/${userId}`, {
      params: { limit: 10 },
    });

    console.log('✅ Success');
    console.log(`Found ${response.data.total} logs for this user`);
    console.log(`Returned: ${response.data.auditLogs.length}`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Test 8: Pagination test
 */
async function testPagination() {
  try {
    console.log('\n📋 Test 8: Pagination Test');
    console.log('─'.repeat(50));

    // Get page 1
    const page1 = await axiosInstance.get('/admin/audit-logs', {
      params: { limit: 5, offset: 0 },
    });

    console.log(`Page 1: ${page1.data.auditLogs.length} logs (offset: 0)`);

    // Get page 2
    const page2 = await axiosInstance.get('/admin/audit-logs', {
      params: { limit: 5, offset: 5 },
    });

    console.log(`Page 2: ${page2.data.auditLogs.length} logs (offset: 5)`);
    console.log(`Total available: ${page1.data.total}`);

    // Check if IDs are different
    const p1Ids = page1.data.auditLogs.map(log => log.id);
    const p2Ids = page2.data.auditLogs.map(log => log.id);
    const isDifferent = !p1Ids.some(id => p2Ids.includes(id));

    console.log(`✅ Different records on each page: ${isDifferent}`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Audit Logs Endpoint Tests');
  console.log('═'.repeat(50));
  console.log(`Token Status: ${ADMIN_TOKEN === 'your_admin_jwt_token_here' ? '⚠️  PLACEHOLDER (set a real token)' : '✅ Set'}\n`);

  if (ADMIN_TOKEN === 'your_admin_jwt_token_here') {
    console.log('⚠️  Please set ADMIN_TOKEN to a valid JWT token first!\n');
    console.log('To get a token:');
    console.log('1. Run: npm test (if tests generate tokens)');
    console.log('2. Or manually login via frontend and check browser DevTools');
    console.log('3. Or generate via test auth endpoint\n');
    return;
  }

  await testGetAllAuditLogs();
  await testGetAuditLogsFiltered();
  await testGetCriticalLogs();
  await testGetFailedLogs();
  await testGetLogsByDateRange();
  await testGetLogsByUser();
  await testGetAuditLogById();
  await testPagination();

  console.log('\n═'.repeat(50));
  console.log('✅ All tests completed!');
}

runAllTests().catch(console.error);
