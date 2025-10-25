# Quick Test for Cart Management

## Test the Cart Management Flow

### **Step 1: Add First Item**
1. Open http://localhost:3000
2. Click WhatsApp chat button
3. Type "hi"
4. Click "View Our Full Menu"
5. Click "Main Items"
6. Click any product
7. Click "2" for quantity
8. Click "None" for special instructions

**Expected Result**: Should show "Great! You have 2 item(s) in your cart (₹XXX). What would you like to do next?"

### **Step 2: Test Cart View**
1. Click "View My Cart"
2. Should see clickable cart items
3. Should show cart summary

**Expected Result**: Cart items displayed as clickable buttons

### **Step 3: Test Adding More Items**
1. Click "Add More Items"
2. Should return to menu categories
3. Click "Main Items" again
4. Click another product
5. Click "1" for quantity
6. Click "Skip Instructions"

**Expected Result**: Should show updated cart with 3 total items

### **Step 4: Test Cart Management**
1. Click "View My Cart"
2. Click on first cart item
3. Should show quantity adjustment options
4. Click "3" to change quantity
5. Should return to cart management

**Expected Result**: Quantity should be updated to 3

## Debug Information

### **Check Console Logs**
Look for these messages:
```
handleItemInstructionsInput: Processing message "none" for user web_user
Current cart length: 1
Cart updated: 1 items, 2 total quantity, ₹XXX total
```

### **Check Database**
```sql
SELECT user_id, state, session_data FROM whatsapp_sessions WHERE user_id = 'web_user';
```

### **Common Issues**

#### Issue 1: Cart not showing after adding item
**Check**: Look for "Cart updated" message in console
**Solution**: Make sure session data is being saved

#### Issue 2: "Add More Items" not working
**Check**: Look for "Adding more items" message in console
**Solution**: Check state transition to VIEWING_MENU_CATEGORIES

#### Issue 3: Cart items not clickable
**Check**: Look for "Viewing cart" message in console
**Solution**: Check handleViewCart method

## Quick Fix Commands

If stuck, try:
- Type "main_menu" to reset
- Type "place_order" to check cart status
- Type "view_my_cart" to view cart directly
