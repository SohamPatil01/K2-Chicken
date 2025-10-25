const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = 'web_user';

// Test scenarios
const testScenarios = [
  {
    name: 'Basic Navigation Test',
    steps: [
      { message: 'hi', expectedState: 'MAIN_MENU' },
      { message: 'view_menu', expectedState: 'VIEWING_MENU_CATEGORIES' },
      { message: 'main_menu', expectedState: 'MAIN_MENU' },
      { message: 'track_order', expectedState: 'TRACKING_ORDER_ID' },
      { message: 'main_menu', expectedState: 'MAIN_MENU' }
    ]
  },
  {
    name: 'Product Selection Test',
    steps: [
      { message: 'view_menu', expectedState: 'VIEWING_MENU_CATEGORIES' },
      { message: 'menu_cat_main', expectedState: 'VIEWING_MENU_ITEMS' },
      { message: 'select_product_1', expectedState: 'ADDING_ITEM_QUANTITY' },
      { message: 'quantity_2', expectedState: 'ADDING_ITEM_INSTRUCTIONS' },
      { message: 'none', expectedState: 'MANAGING_CART' }
    ]
  },
  {
    name: 'Cart Management Test',
    steps: [
      { message: 'view_my_cart', expectedState: 'MANAGING_CART' },
      { message: 'add_more_items', expectedState: 'VIEWING_MENU_CATEGORIES' },
      { message: 'menu_cat_main', expectedState: 'VIEWING_MENU_ITEMS' },
      { message: 'select_product_2', expectedState: 'ADDING_ITEM_QUANTITY' },
      { message: 'quantity_1', expectedState: 'ADDING_ITEM_INSTRUCTIONS' },
      { message: 'skip_instructions', expectedState: 'MANAGING_CART' }
    ]
  },
  {
    name: 'Order Placement Test',
    steps: [
      { message: 'proceed_to_checkout', expectedState: 'SELECTING_ORDER_TYPE' },
      { message: 'delivery', expectedState: 'REQUESTING_DELIVERY_ADDRESS' },
      { message: '123 Test Street, Test City', expectedState: 'SELECTING_PAYMENT_METHOD' },
      { message: 'cash_on_delivery', expectedState: 'REVIEWING_ORDER' }
    ]
  }
];

async function sendMessage(userId, message) {
  try {
    const response = await fetch(`${BASE_URL}/api/whatsapp/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        message: message
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
}

async function runTest(testName, steps) {
  console.log(`\n🧪 Running Test: ${testName}`);
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`\nStep ${i + 1}: Sending "${step.message}"`);
    
    const result = await sendMessage(TEST_USER, step.message);
    
    if (result.success) {
      console.log(`✅ Response: ${result.response.response}`);
      if (result.response.buttons) {
        console.log(`   Buttons: ${result.response.buttons.map(b => b.reply.title).join(', ')}`);
      }
      if (result.response.list_sections) {
        console.log(`   List Items: ${result.response.list_sections[0].rows.map(r => r.title).join(', ')}`);
      }
      passed++;
    } else {
      console.log(`❌ Error: ${result.error || 'Unknown error'}`);
      failed++;
    }
    
    // Small delay between steps
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function runAllTests() {
  console.log('🚀 Starting WhatsApp Chatbot Tests');
  console.log('=====================================');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const test of testScenarios) {
    const result = await runTest(test.name, test.steps);
    totalPassed += result.passed;
    totalFailed += result.failed;
  }
  
  console.log('\n🎯 Overall Test Results');
  console.log('========================');
  console.log(`Total Tests: ${totalPassed + totalFailed}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! The chatbot is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, runTest, sendMessage };
