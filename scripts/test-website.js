/**
 * Comprehensive Website Testing Script
 * Tests functionality, performance, and API endpoints
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to test API endpoints
async function testEndpoint(method, path, expectedStatus = 200, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}${path}`, options);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const data = await response.json().catch(() => ({}));

    if (response.status === expectedStatus) {
      results.passed.push({
        test: `${method} ${path}`,
        status: response.status,
        responseTime: `${responseTime}ms`
      });
      return { success: true, data, responseTime };
    } else {
      results.failed.push({
        test: `${method} ${path}`,
        expected: expectedStatus,
        actual: response.status,
        error: data.error || 'Unknown error'
      });
      return { success: false, data, responseTime };
    }
  } catch (error) {
    results.failed.push({
      test: `${method} ${path}`,
      error: error.message
    });
    return { success: false, error: error.message };
  }
}

// Test pages
async function testPages() {
  console.log('\n📄 Testing Pages...\n');
  
  const pages = [
    '/',
    '/cart',
    '/checkout',
    '/login',
    '/recipes',
    '/orders',
    '/admin'
  ];

  for (const page of pages) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}${page}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        results.passed.push({
          test: `Page: ${page}`,
          status: response.status,
          responseTime: `${responseTime}ms`
        });
        console.log(`✅ ${page} - ${responseTime}ms`);
      } else {
        results.failed.push({
          test: `Page: ${page}`,
          status: response.status
        });
        console.log(`❌ ${page} - Status: ${response.status}`);
      }
    } catch (error) {
      results.failed.push({
        test: `Page: ${page}`,
        error: error.message
      });
      console.log(`❌ ${page} - Error: ${error.message}`);
    }
  }
}

// Test API endpoints
async function testAPIs() {
  console.log('\n🔌 Testing API Endpoints...\n');

  // Public endpoints
  await testEndpoint('GET', '/api/products');
  await testEndpoint('GET', '/api/recipes');
  await testEndpoint('GET', '/api/promotions?active=true');
  await testEndpoint('GET', '/api/reviews');

  // Protected endpoints (will fail without auth, but should return 401, not 500)
  await testEndpoint('GET', '/api/orders/my', 401);
  await testEndpoint('GET', '/api/auth/me', 401);
}

// Performance checks
async function checkPerformance() {
  console.log('\n⚡ Performance Checks...\n');

  const pages = ['/', '/cart', '/checkout'];
  
  for (const page of pages) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}${page}`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (responseTime > 3000) {
        results.warnings.push({
          test: `Performance: ${page}`,
          responseTime: `${responseTime}ms`,
          message: 'Page load time exceeds 3 seconds'
        });
        console.log(`⚠️  ${page} - ${responseTime}ms (SLOW)`);
      } else {
        console.log(`✅ ${page} - ${responseTime}ms`);
      }
    } catch (error) {
      console.log(`❌ ${page} - Error: ${error.message}`);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Comprehensive Website Tests...\n');
  console.log(`Testing: ${BASE_URL}\n`);

  await testPages();
  await testAPIs();
  await checkPerformance();

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => {
      console.log(`  - ${test.test}: ${test.error || `Expected ${test.expected}, got ${test.actual}`}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warning => {
      console.log(`  - ${warning.test}: ${warning.message}`);
    });
  }

  console.log('\n' + '='.repeat(50));
  
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});

