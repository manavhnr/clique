#!/usr/bin/env node
/**
 * Test script for connections API endpoints
 * Usage: npx ts-node src/test/testConnections.ts
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/users';

// Test user IDs (replace with actual test user IDs)
const TEST_USER_1 = 'test-user-1';
const TEST_USER_2 = 'test-user-2';

async function testConnectionsAPI() {
  console.log('🧪 Testing Connections API\n');

  try {
    // Test health check
    console.log('1. Health Check');
    const healthResponse = await axios.get('http://localhost:8080/api/feed/health');
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test get connections count
    console.log('2. Get Connections Count');
    try {
      const connectionsResponse = await axios.get(`${BASE_URL}/${TEST_USER_1}/connections`);
      console.log('✅ Connections count:', connectionsResponse.data);
    } catch (error: any) {
      console.log('ℹ️ User not found (expected for first run):', error.response?.data);
    }
    console.log('');

    // Test follow user
    console.log('3. Test Follow User');
    try {
      const followResponse = await axios.post(`${BASE_URL}/${TEST_USER_1}/follow`, {
        targetUserId: TEST_USER_2
      });
      console.log('✅ Follow success:', followResponse.data);
    } catch (error: any) {
      console.log('❌ Follow error:', error.response?.data);
    }
    console.log('');

    // Test follow status
    console.log('4. Test Follow Status');
    try {
      const statusResponse = await axios.get(`${BASE_URL}/${TEST_USER_1}/follow-status/${TEST_USER_2}`);
      console.log('✅ Follow status:', statusResponse.data);
    } catch (error: any) {
      console.log('❌ Status error:', error.response?.data);
    }
    console.log('');

    // Test get followers
    console.log('5. Test Get Followers');
    try {
      const followersResponse = await axios.get(`${BASE_URL}/${TEST_USER_2}/followers`);
      console.log('✅ Followers:', followersResponse.data);
    } catch (error: any) {
      console.log('❌ Followers error:', error.response?.data);
    }
    console.log('');

    // Test get following
    console.log('6. Test Get Following');
    try {
      const followingResponse = await axios.get(`${BASE_URL}/${TEST_USER_1}/following`);
      console.log('✅ Following:', followingResponse.data);
    } catch (error: any) {
      console.log('❌ Following error:', error.response?.data);
    }
    console.log('');

    // Test unfollow
    console.log('7. Test Unfollow User');
    try {
      const unfollowResponse = await axios.delete(`${BASE_URL}/${TEST_USER_1}/follow`, {
        data: { targetUserId: TEST_USER_2 }
      });
      console.log('✅ Unfollow success:', unfollowResponse.data);
    } catch (error: any) {
      console.log('❌ Unfollow error:', error.response?.data);
    }
    console.log('');

    console.log('🎉 API testing completed!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 8080');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testConnectionsAPI();
}

export { testConnectionsAPI };