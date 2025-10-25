# Corrected Test Scenario for WhatsApp Chatbot

## Issue Identified
The problem is that users are getting stuck in the `ADDING_ITEM_QUANTITY` state and the cart management flow is not working as expected.

## Corrected Test Flow

### **Test 3: Cart Management Test (CORRECTED)**

**Step-by-Step Instructions:**

1. **Start Fresh Session**
   - Open http://localhost:3000
   - Click WhatsApp chat button
   - Type "hi" to start

2. **Add First Item**
   - Click "View Our Full Menu"
   - Click "Main Items"
   - Click any product (e.g., "Chicken Wings - ₹200")
   - Click "2" for quantity
   - Click "None" for special instructions
   - **Expected**: Should show cart management options

3. **Add Second Item**
   - Click "Add More Items"
   - Click "Main Items" again
   - Click another product
   - Click "1" for quantity
   - Click "Skip Instructions"
   - **Expected**: Should show updated cart with 2 items

4. **Test Cart Management**
   - Click "View My Cart"
   - **Expected**: Should see clickable cart items
   - Click on first cart item
   - **Expected**: Should show quantity adjustment options
   - Click "3" to change quantity
   - **Expected**: Should update quantity and return to cart management

5. **Test Item Removal**
   - Click on second cart item
   - Click "Remove Item"
   - **Expected**: Item should be removed from cart

6. **Proceed to Checkout**
   - Click "Proceed to Checkout"
   - **Expected**: Should start checkout flow

## Debug Information

### **Check Current State**
Look for these messages in the terminal:
```
Processing message for user web_user in state ADDING_ITEM_QUANTITY: quantity_1
State-based handling: session.state = ADDING_ITEM_QUANTITY, message = quantity_1
```

### **Expected State Transitions**
1. `MAIN_MENU` → `VIEWING_MENU_CATEGORIES`
2. `VIEWING_MENU_CATEGORIES` → `VIEWING_MENU_ITEMS`
3. `VIEWING_MENU_ITEMS` → `ADDING_ITEM_QUANTITY`
4. `ADDING_ITEM_QUANTITY` → `ADDING_ITEM_INSTRUCTIONS`
5. `ADDING_ITEM_INSTRUCTIONS` → `MANAGING_CART`
6. `MANAGING_CART` → `VIEWING_MENU_CATEGORIES` (when adding more items)

### **Common Issues and Solutions**

#### Issue 1: Stuck in ADDING_ITEM_QUANTITY
**Symptoms**: User selects quantity but doesn't proceed
**Cause**: Special instructions not being handled properly
**Solution**: Make sure to click "None" or "Skip Instructions"

#### Issue 2: Cart not showing items
**Symptoms**: Cart appears empty after adding items
**Cause**: Session data not being persisted
**Solution**: Check session data in database

#### Issue 3: Navigation not working
**Symptoms**: Buttons not responding
**Cause**: State management issues
**Solution**: Check global navigation handler

## Manual Debug Steps

### **Step 1: Check Session State**
```sql
SELECT user_id, state, session_data FROM whatsapp_sessions WHERE user_id = 'web_user';
```

### **Step 2: Check Cart Data**
Look for cart data in session_data JSON field.

### **Step 3: Test Individual States**
1. Test quantity selection: `quantity_1`, `quantity_2`, `quantity_3`
2. Test special instructions: `none`, `skip_instructions`
3. Test cart management: `view_my_cart`, `add_more_items`

## Expected Behavior

### **After Adding Item**
- User should see: "Great! You have X item(s) in your cart (₹XXX). What would you like to do next?"
- Buttons should show: "View My Cart", "Add More Items", "Proceed to Checkout"

### **When Viewing Cart**
- Cart items should be clickable
- Each item should show: "Xx Item Name - ₹XXX"
- Should have options to adjust quantities

### **When Adjusting Quantity**
- Should show current quantity
- Should have buttons for 1, 2, 3, Custom Amount, Remove Item
- Should update cart after selection

## Test Results Template

```
Test Date: ___________
Tester: ___________

Step 1 - Add First Item: ✅ / ❌
Step 2 - Add Second Item: ✅ / ❌
Step 3 - View Cart: ✅ / ❌
Step 4 - Adjust Quantity: ✅ / ❌
Step 5 - Remove Item: ✅ / ❌
Step 6 - Proceed to Checkout: ✅ / ❌

Issues Found:
1. ________________
2. ________________
3. ________________

Overall Status: ✅ PASS / ❌ FAIL
```

## Quick Fix Commands

If stuck, try these commands:
- Type "main_menu" to reset to main menu
- Type "hi" to restart conversation
- Type "view_menu" to go to menu
- Type "place_order" to check cart status
