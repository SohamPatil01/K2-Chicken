# Manual Test Guide for WhatsApp Chatbot

## Quick Test Checklist

### ✅ **Test 1: Basic Navigation**
1. Open http://localhost:3000
2. Click green WhatsApp chat button
3. Type "hi" → Should show welcome message with buttons
4. Click "View Our Full Menu" → Should show categories
5. Click "Back to Main Menu" → Should return to main menu
6. Click "Track My Order" → Should ask for order ID
7. Type "main_menu" → Should return to main menu

**Expected**: All navigation works without errors

### ✅ **Test 2: Product Selection**
1. Click "View Our Full Menu"
2. Click "Main Items" → Should show products as clickable buttons
3. Click any product → Should ask for quantity
4. Click "2" → Should ask for special instructions
5. Click "None" → Should show cart management options

**Expected**: Products display as clickable buttons, quantity selection works

### ✅ **Test 3: Cart Management**
1. After adding item, click "View My Cart"
2. Should see clickable cart items
3. Click on a cart item → Should show quantity adjustment options
4. Click "3" → Should update quantity
5. Click "Add More Items" → Should return to menu

**Expected**: Cart items are clickable, quantity adjustment works

### ✅ **Test 4: Order Placement**
1. Add items to cart
2. Click "Proceed to Checkout"
3. Click "Delivery" → Should ask for address
4. Type "123 Test Street, Test City"
5. Click "Cash on Delivery" → Should show order review
6. Click "Confirm Order" → Should show order number

**Expected**: Complete order flow works, order number generated

### ✅ **Test 5: Order Tracking**
1. Note the order number from previous test
2. Click "Track My Order"
3. Enter the order number
4. Should show order status

**Expected**: Order tracking works with the generated order number

## Common Issues and Solutions

### Issue: "I'm sorry, I didn't quite understand that"
**Cause**: Navigation commands not being handled properly
**Solution**: The global navigation handler should fix this

### Issue: Cart not updating
**Cause**: Session data not being persisted
**Solution**: Check session data persistence in database

### Issue: Order not creating
**Cause**: Shared API endpoint not working
**Solution**: Check `/api/orders/shared` endpoint

### Issue: Quantity selection not working
**Cause**: State management issues
**Solution**: Check `ADDING_ITEM_QUANTITY` state handling

## Debug Steps

### 1. Check Console Logs
Look for these messages in the terminal:
- "Processing message for user web_user in state X"
- "State-based handling: session.state = X, message = Y"
- Any error messages

### 2. Check Database
```sql
-- Check orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

-- Check sessions
SELECT * FROM whatsapp_sessions WHERE user_id = 'web_user';
```

### 3. Check API Endpoints
- Test: http://localhost:3000/api/whatsapp/test
- Test: http://localhost:3000/api/orders/shared

## Success Indicators

### ✅ Navigation Works
- All buttons respond correctly
- No "didn't understand" messages
- Smooth state transitions

### ✅ Cart Management Works
- Items added to cart
- Cart persists across sessions
- Quantity adjustment works
- Item removal works

### ✅ Order Flow Works
- Complete order placement
- Order number generated
- Order appears in database
- Order tracking works

### ✅ Integration Works
- Orders appear in admin dashboard
- Cross-platform tracking works
- Database records are correct

## Test Results Template

```
Test Date: ___________
Tester: ___________

Navigation Test: ✅ / ❌
Product Selection: ✅ / ❌
Cart Management: ✅ / ❌
Order Placement: ✅ / ❌
Order Tracking: ✅ / ❌
Integration: ✅ / ❌

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Status: ✅ PASS / ❌ FAIL
```

## Performance Expectations

- **Response Time**: < 2 seconds for all operations
- **Error Rate**: 0% for navigation and cart operations
- **Success Rate**: 100% for complete order flow
- **Database Errors**: 0%

## Next Steps After Testing

1. **If All Tests Pass**: Deploy to production
2. **If Some Tests Fail**: Fix issues and retest
3. **If Major Issues**: Review implementation and fix

## Support

If you encounter issues:
1. Check the console logs
2. Verify database connection
3. Test API endpoints manually
4. Check the implementation files
