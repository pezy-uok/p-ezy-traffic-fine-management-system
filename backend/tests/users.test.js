import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create test data
const testUser = {
  email: 'test@example.com',
  name: 'Test User',
  phone: '0712345678',
};

// Helper function for colored console output
const log = {
  success: (msg) => console.log('\x1b[32m✓\x1b[0m', msg),
  error: (msg) => console.log('\x1b[31m✗\x1b[0m', msg),
  info: (msg) => console.log('\x1b[36mℹ\x1b[0m', msg),
  separator: () => console.log('\n' + '─'.repeat(60) + '\n'),
};

// Test 1: Create User
const testCreateUser = async () => {
  log.info('TEST 1: Creating a new user');
  try {
    const response = await axios.post(`${API_URL}/users/create`, testUser);
    log.success(`User created: ${response.data.data[0].id}`);
    log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
    return response.data.data[0].id;
  } catch (error) {
    log.error(`Failed to create user: ${error.message}`);
    if (error.response) {
      console.log('Error details:', error.response.data);
    }
    return null;
  }
};

// Test 2: Get All Users
const testGetAllUsers = async () => {
  log.separator();
  log.info('TEST 2: Fetching all users');
  try {
    const response = await axios.get(`${API_URL}/users/all`);
    log.success(`Retrieved ${response.data.data.length} user(s)`);
    log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    log.error(`Failed to fetch users: ${error.message}`);
  }
};

// Test 3: Get User by ID
const testGetUserById = async (userId) => {
  log.separator();
  log.info(`TEST 3: Fetching user with ID: ${userId}`);
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    log.success(`User found: ${response.data.data.name}`);
    log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    log.error(`Failed to fetch user: ${error.message}`);
  }
};

// Test 4: Update User
const testUpdateUser = async (userId) => {
  log.separator();
  log.info(`TEST 4: Updating user with ID: ${userId}`);
  const updateData = {
    name: 'Updated Test User',
    phone: '0787654321',
  };
  try {
    const response = await axios.patch(`${API_URL}/users/${userId}`, updateData);
    log.success(`User updated successfully`);
    log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    log.error(`Failed to update user: ${error.message}`);
  }
};

// Test 5: Delete User
const testDeleteUser = async (userId) => {
  log.separator();
  log.info(`TEST 5: Deleting user with ID: ${userId}`);
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`);
    log.success(`User deleted successfully`);
    log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    log.error(`Failed to delete user: ${error.message}`);
  }
};

// Test 6: Health Check
const testHealthCheck = async () => {
  log.separator();
  log.info('TEST 6: Health check');
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    log.success(`Server is healthy: ${response.data.status}`);
    log.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    log.error(`Server is not responding: ${error.message}`);
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('\n' + '═'.repeat(60));
  console.log('  BACKEND API TEST SUITE');
  console.log('═'.repeat(60) + '\n');

  await testHealthCheck();

  const userId = await testCreateUser();

  if (userId) {
    await testGetAllUsers();
    await testGetUserById(userId);
    await testUpdateUser(userId);
    await testDeleteUser(userId);
  }

  log.separator();
  console.log('Test suite completed!\n');
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch((error) => {
    log.error(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}

export {
  testCreateUser,
  testGetAllUsers,
  testGetUserById,
  testUpdateUser,
  testDeleteUser,
  testHealthCheck,
};
