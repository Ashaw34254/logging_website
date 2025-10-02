// Test script for AHRP Report System API
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
    console.log('🧪 Testing AHRP Report System API...\n');
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Health check passed:', healthResponse.data);
        
        // Test public analytics endpoint
        console.log('\n2. Testing public analytics endpoint...');
        const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/public`);
        console.log('✅ Public analytics:', analyticsResponse.data);
        
        console.log('\n🎉 API tests completed successfully!');
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAPI();