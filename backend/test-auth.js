/**
 * Authentication System Test Script
 *
 * This script tests the JWT authentication system endpoints.
 * Make sure your backend server is running before executing.
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  username: 'testuser_' + Date.now(),
  email: `test_${Date.now()}@example.com`,
  password: 'SecurePass123!',
};

let authToken = null;
let userId = null;

// Helper function to make HTTP requests
async function request(method, endpoint, data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const text = await response.text();
    const result = text ? JSON.parse(text) : null;

    return {
      status: response.status,
      ok: response.ok,
      data: result,
    };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return { status: 0, ok: false, data: null, error: error.message };
  }
}

// Test functions
async function testRegister() {
  console.log('\n=== Testing User Registration ===');
  const result = await request('POST', '/auth/register', testUser);

  if (result.ok) {
    console.log('✓ Registration successful');
    console.log('User ID:', result.data.id);
    console.log('Username:', result.data.username);
    console.log('Email:', result.data.email);
    console.log('Role:', result.data.role);
    userId = result.data.id;
    return true;
  } else {
    console.log('✗ Registration failed');
    console.log('Status:', result.status);
    console.log('Error:', result.data?.message || 'Unknown error');
    return false;
  }
}

async function testLogin() {
  console.log('\n=== Testing User Login ===');
  const result = await request('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password,
  });

  if (result.ok) {
    console.log('✓ Login successful');
    console.log('Access Token:', result.data.access_token.substring(0, 50) + '...');
    console.log('User:', result.data.user);
    authToken = result.data.access_token;
    return true;
  } else {
    console.log('✗ Login failed');
    console.log('Status:', result.status);
    console.log('Error:', result.data?.message || 'Unknown error');
    return false;
  }
}

async function testGetProfile() {
  console.log('\n=== Testing Get User Profile ===');
  const result = await request('GET', '/auth/profile', null, authToken);

  if (result.ok) {
    console.log('✓ Profile retrieved successfully');
    console.log('User ID:', result.data.id);
    console.log('Username:', result.data.username);
    console.log('Email:', result.data.email);
    console.log('Role:', result.data.role);
    return true;
  } else {
    console.log('✗ Profile retrieval failed');
    console.log('Status:', result.status);
    console.log('Error:', result.data?.message || 'Unknown error');
    return false;
  }
}

async function testProtectedEndpoint() {
  console.log('\n=== Testing Protected Endpoint (Workflow) ===');
  const result = await request('GET', '/workflow', null, authToken);

  if (result.status === 401) {
    console.log('✗ Protected endpoint requires authentication');
    return false;
  } else if (result.ok) {
    console.log('✓ Protected endpoint accessed successfully');
    console.log('Workflows:', result.data);
    return true;
  } else {
    console.log('Status:', result.status);
    console.log('Response:', result.data);
    return true;
  }
}

async function testProtectedEndpointWithoutToken() {
  console.log('\n=== Testing Protected Endpoint Without Token ===');
  const result = await request('GET', '/workflow');

  if (result.status === 401) {
    console.log('✓ Correctly rejected unauthorized request');
    console.log('Error:', result.data?.message);
    return true;
  } else {
    console.log('✗ Security issue: unauthorized request was not rejected');
    return false;
  }
}

async function testChangePassword() {
  console.log('\n=== Testing Password Change ===');
  const result = await request('PUT', '/auth/change-password', {
    oldPassword: testUser.password,
    newPassword: 'NewSecurePass456!',
  }, authToken);

  if (result.ok) {
    console.log('✓ Password changed successfully');
    console.log('Message:', result.data.message);
    testUser.password = 'NewSecurePass456!';
    return true;
  } else {
    console.log('✗ Password change failed');
    console.log('Status:', result.status);
    console.log('Error:', result.data?.message || 'Unknown error');
    return false;
  }
}

async function testLogout() {
  console.log('\n=== Testing Logout ===');
  const result = await request('POST', '/auth/logout', null, authToken);

  if (result.ok) {
    console.log('✓ Logout successful');
    console.log('Message:', result.data.message);
    return true;
  } else {
    console.log('✗ Logout failed');
    console.log('Status:', result.status);
    console.log('Error:', result.data?.message || 'Unknown error');
    return false;
  }
}

async function testHealthEndpoint() {
  console.log('\n=== Testing Public Health Endpoint ===');
  const result = await request('GET', '/health');

  if (result.ok) {
    console.log('✓ Health endpoint accessible without authentication');
    console.log('Status:', result.data.status);
    console.log('Environment:', result.data.environment);
    return true;
  } else {
    console.log('✗ Health endpoint failed');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('========================================');
  console.log('JWT Authentication System Test Suite');
  console.log('========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test User: ${testUser.username}`);
  console.log(`Test Email: ${testUser.email}`);

  const results = {
    register: await testRegister(),
    login: await testLogin(),
    profile: await testGetProfile(),
    protectedWithoutToken: await testProtectedEndpointWithoutToken(),
    protectedWithToken: await testProtectedEndpoint(),
    changePassword: await testChangePassword(),
    logout: await testLogout(),
    health: await testHealthEndpoint(),
  };

  console.log('\n========================================');
  console.log('Test Results Summary');
  console.log('========================================');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, result]) => {
    const symbol = result ? '✓' : '✗';
    console.log(`${symbol} ${test}: ${result ? 'PASSED' : 'FAILED'}`);
  });

  console.log('\n----------------------------------------');
  console.log(`Total: ${passed}/${total} tests passed`);
  console.log('================================--------\n');

  if (passed === total) {
    console.log('All tests passed! Authentication system is working correctly.');
  } else {
    console.log('Some tests failed. Please check the output above.');
  }
}

// Execute tests
console.log('Starting authentication tests...');
console.log('Make sure the backend server is running on', BASE_URL);
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
