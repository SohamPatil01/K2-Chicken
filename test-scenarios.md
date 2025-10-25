# WhatsApp Chatbot Test Scenarios

## Test Environment Setup
- **URL**: http://localhost:3000
- **Chatbot**: Click the green WhatsApp chat button in bottom right
- **Test User**: Use "web_user" as the user ID for testing

## Test Scenarios

### 1. **Basic Navigation Test**
**Objective**: Verify all navigation buttons work from any state

**Steps**:
1. Open WhatsApp chat
2. Type "hi" to start
3. Click "View Our Full Menu"
4. Click "Back to Main Menu"
5. Click "Track My Order"
6. Click "Back to Main Menu"
7. Click "Talk to a Human"
8. Click "Back to Main Menu"

**Expected Results**:
- ✅ All navigation buttons work without errors
- ✅ No database errors in console
- ✅ Proper state transitions
- ✅ Consistent button layouts

### 2. **Product Selection and Cart Management**
**Objective**: Test complete product selection and cart management flow

**Steps**:
1. Click "View Our Full Menu"
2. Select "Main Items" category
3. Click on any product (e.g., "Chicken Wings - ₹200")
4. Select quantity "2"
5. Click "None" for special instructions
6. Verify cart shows 2 items
7. Click "View My Cart"
8. Click on cart item to adjust quantity
9. Change quantity to 3
10. Click "Proceed to Checkout"

**Expected Results**:
- ✅ Products display as clickable buttons
- ✅ Quantity selection works properly
- ✅ Cart updates correctly
- ✅ Cart items are clickable for adjustment
- ✅ Quantity adjustment works
- ✅ Checkout flow initiates

### 3. **Order Placement Flow**
**Objective**: Test complete order placement from start to finish

**Steps**:
1. Add items to cart (follow scenario 2)
2. Click "Proceed to Checkout"
3. Select "Delivery" as order type
4. Enter delivery address: "123 Test Street, Test City"
5. Select "Cash on Delivery" as payment method
6. Review order details
7. Click "Confirm Order"
8. Note the order number

**Expected Results**:
- ✅ Order type selection works
- ✅ Delivery address input works
- ✅ Payment method selection works
- ✅ Order review shows correct details
- ✅ Order confirmation with order number
- ✅ Order appears in database with source "whatsapp"

### 4. **Cart Management Test**
**Objective**: Test cart item management capabilities

**Steps**:
1. Add multiple items to cart
2. Click "View My Cart"
3. Click on first cart item
4. Change quantity to 1
5. Click on second cart item
6. Click "Remove Item"
7. Verify cart updates
8. Add more items
9. Proceed to checkout

**Expected Results**:
- ✅ Cart items are clickable
- ✅ Quantity adjustment works
- ✅ Item removal works
- ✅ Cart updates in real-time
- ✅ Checkout works with updated cart

### 5. **Order Tracking Test**
**Objective**: Test order tracking functionality

**Steps**:
1. Place an order (follow scenario 3)
2. Note the order number
3. Click "Track My Order"
4. Enter the order number
5. Verify order status display

**Expected Results**:
- ✅ Order tracking works
- ✅ Order status displays correctly
- ✅ Order details show properly
- ✅ Navigation back to main menu works

### 6. **Error Handling Test**
**Objective**: Test error handling and edge cases

**Steps**:
1. Try to track non-existent order
2. Enter invalid order number
3. Try to checkout with empty cart
4. Test navigation from various states
5. Test quantity input validation

**Expected Results**:
- ✅ Proper error messages for invalid inputs
- ✅ No crashes or database errors
- ✅ Graceful handling of edge cases
- ✅ Proper fallback messages

### 7. **Session Persistence Test**
**Objective**: Test session and cart persistence

**Steps**:
1. Add items to cart
2. Close and reopen chat
3. Click "Place Order"
4. Verify cart is still there
5. Complete order
6. Verify cart is cleared after order

**Expected Results**:
- ✅ Cart persists across sessions
- ✅ Cart shows when accessing "Place Order"
- ✅ Cart clears after successful order
- ✅ Session state maintained properly

### 8. **Cross-Platform Integration Test**
**Objective**: Test integration with main website

**Steps**:
1. Place order via WhatsApp
2. Note order number
3. Check admin dashboard on website
4. Verify order appears in admin
5. Try to track order from website
6. Place order from website
7. Try to track from WhatsApp

**Expected Results**:
- ✅ WhatsApp orders appear in admin dashboard
- ✅ Order tracking works across platforms
- ✅ Orders have correct source tags
- ✅ Database integration works properly

## Test Data

### Sample Products
- **Main Items**: Chicken Wings (₹200), Chicken Breast (₹250), Whole Chicken (₹400)
- **Side Items**: Masala (₹10), Extra Spice (₹15)

### Sample Order
- **Customer**: Test User
- **Phone**: +1234567890
- **Address**: 123 Test Street, Test City
- **Items**: 2x Chicken Wings, 1x Masala
- **Total**: ₹410 (₹400 + ₹10)

## Expected Database Records

### Orders Table
```sql
SELECT id, customer_name, customer_phone, delivery_address, total_amount, source, whatsapp_user_id, status 
FROM orders 
WHERE source = 'whatsapp';
```

### Order Items Table
```sql
SELECT oi.*, p.name as product_name 
FROM order_items oi 
JOIN products p ON oi.product_id = p.id 
JOIN orders o ON oi.order_id = o.id 
WHERE o.source = 'whatsapp';
```

## Performance Metrics

### Response Times
- **Menu Loading**: < 2 seconds
- **Product Selection**: < 1 second
- **Cart Updates**: < 1 second
- **Order Creation**: < 3 seconds
- **Order Tracking**: < 2 seconds

### Error Rates
- **Navigation Errors**: 0%
- **Database Errors**: 0%
- **State Management Errors**: 0%
- **Cart Persistence Errors**: 0%

## Test Checklist

- [ ] Navigation works from all states
- [ ] Product selection works properly
- [ ] Cart management functions correctly
- [ ] Order placement completes successfully
- [ ] Order tracking works
- [ ] Error handling is proper
- [ ] Session persistence works
- [ ] Cross-platform integration works
- [ ] Database records are correct
- [ ] Performance meets requirements

## Troubleshooting

### Common Issues
1. **Navigation not working**: Check global navigation handler
2. **Cart not updating**: Check session data persistence
3. **Order not creating**: Check shared API endpoint
4. **Tracking not working**: Check order ID format
5. **State errors**: Check state management logic

### Debug Commands
```bash
# Check database connection
npm run dev

# Check order records
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

# Check session data
SELECT * FROM whatsapp_sessions WHERE user_id = 'web_user';
```

## Success Criteria

- ✅ All test scenarios pass
- ✅ No database errors
- ✅ Proper order integration
- ✅ Smooth user experience
- ✅ Error handling works
- ✅ Performance meets requirements
