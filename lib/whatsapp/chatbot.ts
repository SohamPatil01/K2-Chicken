import pool from '../db';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  special_instructions?: string;
}

export interface UserSession {
  user_id: string;
  state: string;
  session_data: any;
  cart: CartItem[];
  current_menu_category?: string;
  delivery_address?: string;
  contact_phone?: string;
  order_type?: 'delivery' | 'pickup';
  payment_method?: string;
  last_input?: string;
  last_item_added?: MenuItem;
  pending_order?: any;
}

export interface WhatsAppOrder {
  order_id: string;
  user_id: string;
  external_order_id?: string;
  order_type: 'delivery' | 'pickup';
  delivery_address?: string;
  contact_phone?: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  estimated_completion?: Date;
  items: CartItem[];
}

export class WhatsAppChatbot {
  private restaurant_name = "K2 Chicken";
  private restaurant_address = "Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune, Maharashtra 411027";
  private restaurant_phone = "8484978622";
  private restaurant_website = "www.k2chicken.com";
  private operating_hours = {
    "Monday": "11:00 AM - 10:00 PM",
    "Tuesday": "11:00 AM - 10:00 PM",
    "Wednesday": "11:00 AM - 10:00 PM",
    "Thursday": "11:00 AM - 10:00 PM",
    "Friday": "11:00 AM - 11:00 PM",
    "Saturday": "12:00 PM - 11:00 PM",
    "Sunday": "12:00 PM - 09:00 PM",
  };
  private delivery_fee = 5.00;

  async getSession(user_id: string): Promise<UserSession> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM whatsapp_sessions WHERE user_id = $1',
        [user_id]
      );
      
      if (result.rows.length === 0) {
        // Create new session
        await client.query(
          'INSERT INTO whatsapp_sessions (user_id, state, session_data) VALUES ($1, $2, $3)',
          [user_id, 'START', JSON.stringify({ cart: [] })]
        );
        return {
          user_id,
          state: 'START',
          session_data: { cart: [] },
          cart: []
        };
      }
      
      const session = result.rows[0];
      const sessionData = session.session_data || {};
      const cart = sessionData.cart || [];
      const currentMenuCategory = sessionData.current_menu_category;
      const lastItemAdded = sessionData.last_item_added;
      const orderType = sessionData.order_type;
      const deliveryAddress = sessionData.delivery_address;
      const paymentMethod = sessionData.payment_method;
      
      console.log(`Restoring session for user ${session.user_id}, state: ${session.state}, cart length: ${cart.length}, category: ${currentMenuCategory}, last_item: ${lastItemAdded ? lastItemAdded.name : 'null'}, order_type: ${orderType}, delivery_address: ${deliveryAddress}, payment_method: ${paymentMethod}`);
      
      return {
        user_id: session.user_id,
        state: session.state,
        session_data: sessionData,
        cart: cart,
        current_menu_category: currentMenuCategory,
        last_item_added: lastItemAdded,
        order_type: orderType,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod
      };
    } catch (error) {
      console.error('Error in getSession:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateSession(user_id: string, session: UserSession): Promise<void> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE whatsapp_sessions SET state = $1, session_data = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3',
        [session.state, JSON.stringify(session.session_data), user_id]
      );
      
      if (result.rowCount === 0) {
        // Session doesn't exist, create it
        await client.query(
          'INSERT INTO whatsapp_sessions (user_id, state, session_data) VALUES ($1, $2, $3)',
          [user_id, session.state, JSON.stringify(session.session_data)]
        );
      }
    } catch (error) {
      console.error('Error in updateSession:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getMenuItems(category?: string): Promise<MenuItem[]> {
    const client = await pool.connect();
    try {
      console.log(`getMenuItems: Getting items for category: ${category}`);
      let query = 'SELECT * FROM products WHERE is_available = true';
      const params: any[] = [];
      
      if (category) {
        query += ' AND category = $1';
        params.push(category);
      }
      
      query += ' ORDER BY category, name';
      
      console.log(`getMenuItems: Query: ${query}, Params: ${JSON.stringify(params)}`);
      const result = await client.query(query, params);
      console.log(`getMenuItems: Found ${result.rows.length} items`);
      return result.rows;
    } catch (error) {
      console.error('Error in getMenuItems:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getMenuCategories(): Promise<string[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT DISTINCT category FROM products WHERE is_available = true ORDER BY category'
      );
      return result.rows.map(row => row.category);
    } finally {
      client.release();
    }
  }

  async createOrder(order: WhatsAppOrder): Promise<string> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert order
      await client.query(
        `INSERT INTO whatsapp_orders (order_id, user_id, external_order_id, order_type, delivery_address, 
         contact_phone, payment_method, subtotal, delivery_fee, total, status, estimated_completion)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          order.order_id,
          order.user_id,
          order.external_order_id,
          order.order_type,
          order.delivery_address,
          order.contact_phone,
          order.payment_method,
          order.subtotal,
          order.delivery_fee,
          order.total,
          order.status,
          order.estimated_completion
        ]
      );
      
      // Insert order items
      for (const item of order.items) {
        await client.query(
          `INSERT INTO whatsapp_order_items (order_id, product_id, product_name, quantity, price, special_instructions)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.order_id,
            item.menu_item.id,
            item.menu_item.name,
            item.quantity,
            item.menu_item.price,
            item.special_instructions
          ]
        );
      }
      
      await client.query('COMMIT');
      return order.order_id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getOrderStatus(order_id: string): Promise<WhatsAppOrder | null> {
    const client = await pool.connect();
    try {
      const orderResult = await client.query(
        'SELECT * FROM whatsapp_orders WHERE order_id = $1',
        [order_id]
      );
      
      if (orderResult.rows.length === 0) {
        return null;
      }
      
      const order = orderResult.rows[0];
      
      // Get order items
      const itemsResult = await client.query(
        `SELECT woi.*, p.name, p.description, p.image_url, p.category 
         FROM whatsapp_order_items woi 
         JOIN products p ON woi.product_id = p.id 
         WHERE woi.order_id = $1`,
        [order_id]
      );
      
      const items: CartItem[] = itemsResult.rows.map(row => ({
        menu_item: {
          id: row.product_id,
          name: row.product_name,
          description: row.description,
          price: parseFloat(row.price),
          image_url: row.image_url,
          category: row.category,
          is_available: true
        },
        quantity: row.quantity,
        special_instructions: row.special_instructions
      }));
      
      return {
        order_id: order.order_id,
        user_id: order.user_id,
        external_order_id: order.external_order_id,
        order_type: order.order_type,
        delivery_address: order.delivery_address,
        contact_phone: order.contact_phone,
        payment_method: order.payment_method,
        subtotal: parseFloat(order.subtotal),
        delivery_fee: parseFloat(order.delivery_fee),
        total: parseFloat(order.total),
        status: order.status,
        estimated_completion: order.estimated_completion,
        items
      };
    } finally {
      client.release();
    }
  }

  async logMessage(user_id: string, message_type: 'incoming' | 'outgoing', message_content: string, message_id?: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO whatsapp_message_logs (user_id, message_type, message_content, message_id) VALUES ($1, $2, $3, $4)',
        [user_id, message_type, message_content, message_id]
      );
    } finally {
      client.release();
    }
  }

  async handleMessage(user_id: string, message: string): Promise<{ response: string; buttons?: any[]; list_sections?: any[] }> {
    const session = await this.getSession(user_id);
    const message_lower = message.toLowerCase().trim();
    
    // Log incoming message
    await this.logMessage(user_id, 'incoming', message);
    
    console.log(`Processing message for user ${user_id} in state ${session.state}: ${message}`);
    
    // Handle global commands
    if (['hi', 'hello', 'start', 'menu', 'order', 'track', 'info', 'help'].includes(message_lower)) {
      if (message_lower === 'menu') {
        return this.handleViewMenu(session);
      } else if (message_lower === 'order') {
        return this.handlePlaceNewOrder(session);
      } else if (message_lower === 'track') {
        return this.handleTrackOrderRequest(session);
      } else if (message_lower === 'info') {
        return this.handleRestaurantInfo(session);
      } else if (message_lower === 'help') {
        return this.handleTalkToHuman(session);
      } else if (message_lower === 'hi' || message_lower === 'hello' || session.state === 'START') {
        return this.sendWelcomeMessage(session);
      }
    }
    
    // Handle global navigation commands first
    if (['main_menu', 'view_menu', 'place_order', 'track_order', 'restaurant_info', 'talk_human', 'hi', 'hello', 'start'].includes(message)) {
      return this.handleMainMenuSelection(session, message);
    }
    
    // State-based handling
    console.log(`State-based handling: session.state = ${session.state}, message = ${message}`);
    switch (session.state) {
      case 'MAIN_MENU':
        return this.handleMainMenuSelection(session, message);
      case 'VIEWING_MENU_CATEGORIES':
        return this.handleMenuCategorySelection(session, message);
      case 'VIEWING_MENU_ITEMS':
        return this.handleMenuItemActions(session, message);
      case 'ADDING_ITEM_QUANTITY':
        return this.handleItemQuantityInput(session, message);
      case 'ADDING_ITEM_INSTRUCTIONS':
        return this.handleItemInstructionsInput(session, message);
      case 'ADJUSTING_ITEM_QUANTITY':
        return this.handleAdjustingItemQuantity(session, message);
      case 'MANAGING_CART':
        return this.handleCartManagement(session, message);
      case 'SELECTING_ORDER_TYPE':
        return this.handleOrderTypeSelection(session, message);
      case 'REQUESTING_DELIVERY_ADDRESS':
        return this.handleDeliveryAddressInput(session, message);
      case 'SELECTING_PAYMENT_METHOD':
        return this.handlePaymentMethodSelection(session, message);
      case 'REVIEWING_ORDER':
        return this.handleOrderReviewConfirmation(session, message);
      case 'TRACKING_ORDER_ID':
        return this.handleTrackOrderIdInput(session, message);
      default:
        return this.sendFallbackMessage(session);
    }
  }

  private async sendWelcomeMessage(session: UserSession): Promise<{ response: string; buttons: any[] }> {
    const message = `Hello! Welcome to ${this.restaurant_name}! We're delighted to serve you.`;
    const buttons = [
      { type: "reply", reply: { id: "place_order", title: "Place a New Order" } },
      { type: "reply", reply: { id: "view_menu", title: "View Our Full Menu" } },
      { type: "reply", reply: { id: "track_order", title: "Track My Order" } },
      { type: "reply", reply: { id: "talk_human", title: "Talk to a Human" } },
      { type: "reply", reply: { id: "restaurant_info", title: "Restaurant Info & Hours" } }
    ];
    
    session.state = 'MAIN_MENU';
    await this.updateSession(session.user_id, session);
    
    return { response: message, buttons };
  }

  private async sendFallbackMessage(session: UserSession): Promise<{ response: string; buttons: any[] }> {
    const message = "I'm sorry, I didn't quite understand that. Could you please choose from the options below or rephrase your request?";
    const buttons = [
      { type: "reply", reply: { id: "place_order", title: "Place a New Order" } },
      { type: "reply", reply: { id: "view_menu", title: "View Our Full Menu" } },
      { type: "reply", reply: { id: "track_order", title: "Track My Order" } },
      { type: "reply", reply: { id: "talk_human", title: "Talk to a Human" } },
      { type: "reply", reply: { id: "main_menu", title: "Back to Main Menu" } }
    ];
    
    session.state = 'MAIN_MENU';
    await this.updateSession(session.user_id, session);
    
    return { response: message, buttons };
  }

  private async handleMainMenuSelection(session: UserSession, message: string): Promise<{ response: string; buttons?: any[]; list_sections?: any[] }> {
    console.log(`handleMainMenuSelection: Processing message "${message}" for user ${session.user_id}`);
    console.log(`Current cart length: ${session.cart.length}`);
    
    if (message === "place_order") {
      // Check if cart has items
      if (session.cart && session.cart.length > 0) {
        console.log("Cart has items, showing cart management options");
        session.state = 'MANAGING_CART';
        await this.updateSession(session.user_id, session);
        
        const totalItems = session.cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = session.cart.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0);
        
        const response = `You have ${totalItems} item(s) in your cart (₹${subtotal.toFixed(0)}). What would you like to do?`;
        const buttons = [
          { type: "reply", reply: { id: "view_my_cart", title: "View My Cart" } },
          { type: "reply", reply: { id: "proceed_to_checkout", title: "Proceed to Checkout" } },
          { type: "reply", reply: { id: "view_menu", title: "Add More Items" } }
        ];
        return { response, buttons };
      } else {
        console.log("Cart is empty, starting new order");
        return this.handlePlaceNewOrder(session);
      }
    } else if (message === "view_menu") {
      console.log("Viewing menu");
      return this.handleViewMenu(session);
    } else if (message === "track_order") {
      return this.handleTrackOrderRequest(session);
    } else if (message === "talk_human") {
      return this.handleTalkToHuman(session);
    } else if (message === "restaurant_info") {
      return this.handleRestaurantInfo(session);
    } else {
      return this.sendFallbackMessage(session);
    }
  }

  private async handleViewMenu(session: UserSession): Promise<{ response: string; buttons?: any[]; list_sections?: any[] }> {
    try {
      const categories = await this.getMenuCategories();
      const message = "Great choice! Here are our menu categories:";
      
      const sections = [{
        title: "Menu Categories",
        rows: categories.map(category => ({
          id: `menu_cat_${category}`,
          title: category
        }))
      }];
      
      sections[0].rows.push({ id: "menu_cat_all", title: "View All Items" });
      sections[0].rows.push({ id: "back_to_main_menu", title: "Back to Main Menu" });
      
      session.state = 'VIEWING_MENU_CATEGORIES';
      await this.updateSession(session.user_id, session);
      
      return { response: message, list_sections: sections };
    } catch (error) {
      console.error('Error in handleViewMenu:', error);
      throw error;
    }
  }

  private async handleMenuCategorySelection(session: UserSession, message: string): Promise<{ response: string; buttons?: any[]; list_sections?: any[] }> {
    try {
      console.log(`handleMenuCategorySelection: Processing message "${message}" for user ${session.user_id}`);
      
      if (message.startsWith("menu_cat_")) {
        const category_name = message.replace("menu_cat_", "");
        console.log(`Category selected: ${category_name}`);
        
        if (category_name === "all") {
          const allItems = await this.getMenuItems();
          const response_parts = ["Here are all our delicious items:"];
          
          const categories = await this.getMenuCategories();
          for (const category of categories) {
            const categoryItems = allItems.filter(item => item.category === category);
            if (categoryItems.length > 0) {
              response_parts.push(`\n*${category.toUpperCase()}*`);
            categoryItems.forEach(item => {
              response_parts.push(`${item.name} - ₹${Number(item.price).toFixed(2)}`);
            });
            }
          }
          
          session.current_menu_category = undefined;
          const response = response_parts.join('\n');
          
          const buttons = [
            { type: "reply", reply: { id: "add_item_to_cart", title: "Add Item to Cart" } },
            { type: "reply", reply: { id: "view_cart_from_menu", title: "View My Cart" } },
            { type: "reply", reply: { id: "back_to_categories", title: "Back to Categories" } }
          ];
          
          session.state = 'VIEWING_MENU_ITEMS';
          await this.updateSession(session.user_id, session);
          
          return { response, buttons };
        } else {
          const items = await this.getMenuItems(category_name);
          session.current_menu_category = category_name;
          
          // Store category in session data for persistence
          session.session_data.current_menu_category = category_name;
          
          const response = `Here are our delicious ${category_name} items. Click on any item to add it to your cart:`;
          
          // Create list sections with individual products as clickable options
          const list_sections = [{
            title: `${category_name.charAt(0).toUpperCase() + category_name.slice(1)} Items`,
            rows: items.map(item => ({
              id: `select_product_${item.id}`,
              title: `${item.name} - ₹${Number(item.price).toFixed(0)}`
            }))
          }];
          
          const buttons = [
            { type: "reply", reply: { id: "view_cart_from_menu", title: "View My Cart" } },
            { type: "reply", reply: { id: "back_to_categories", title: "Back to Categories" } }
          ];
          
          session.state = 'VIEWING_MENU_ITEMS';
          await this.updateSession(session.user_id, session);
          
          return { response, buttons, list_sections };
        }
    } else if (message === "back_to_main_menu") {
      return this.sendWelcomeMessage(session);
    } else {
      return this.sendFallbackMessage(session);
    }
    } catch (error) {
      console.error('Error in handleMenuCategorySelection:', error);
      throw error;
    }
  }

  private async handleMenuItemActions(session: UserSession, message: string): Promise<{ response: string; buttons?: any[]; list_sections?: any[] }> {
    if (message === "add_item_to_cart") {
      const response = "Which item would you like to add? Please type the item name or number (e.g., '1' or 'Classic Fried Chicken').";
      session.state = 'ADDING_ITEM_QUANTITY';
      await this.updateSession(session.user_id, session);
      return { response, buttons: [] };
    } else if (message === "view_cart_from_menu") {
      return this.handleViewCart(session);
    } else if (message === "back_to_categories") {
      return this.handleViewMenu(session);
    } else if (message.startsWith("select_product_")) {
      // Handle individual product selection
      const productId = parseInt(message.replace("select_product_", ""));
      console.log(`Selecting product ${productId} from category: ${session.current_menu_category}`);
      
      const items = await this.getMenuItems(session.current_menu_category);
      const selectedItem = items.find(item => item.id === productId);
      
      console.log(`Found ${items.length} items, selected item:`, selectedItem ? selectedItem.name : 'NOT FOUND');
      
      if (selectedItem) {
        session.last_item_added = selectedItem;
        // Store the selected item in session data for persistence
        session.session_data.last_item_added = selectedItem;
        session.state = 'ADDING_ITEM_QUANTITY';
        await this.updateSession(session.user_id, session);
        
        console.log(`Item selected: ${selectedItem.name}, transitioning to ADDING_ITEM_QUANTITY state`);
        
        const response = `Great choice! You selected ${selectedItem.name} - ₹${Number(selectedItem.price).toFixed(0)}.\n\nHow many would you like to add to your cart?`;
        const buttons = [
          { type: "reply", reply: { id: "quantity_1", title: "1" } },
          { type: "reply", reply: { id: "quantity_2", title: "2" } },
          { type: "reply", reply: { id: "quantity_3", title: "3" } },
          { type: "reply", reply: { id: "custom_quantity", title: "Custom Amount" } }
        ];
        
        return { response, buttons };
      } else {
        console.log(`Product ${productId} not found in category ${session.current_menu_category}`);
        return this.sendFallbackMessage(session);
      }
    } else {
      return this.sendFallbackMessage(session);
    }
  }

  private async handleItemQuantityInput(session: UserSession, message: string): Promise<{ response: string; buttons: any[] }> {
    console.log(`handleItemQuantityInput: Processing message "${message}" for user ${session.user_id}`);
    console.log(`Current state: ${session.state}, last_item_added:`, session.last_item_added ? session.last_item_added.name : 'null');
    
    // Handle quantity selection from buttons or custom input
    let quantity = 1;
    
    if (message === "quantity_1") {
      quantity = 1;
    } else if (message === "quantity_2") {
      quantity = 2;
    } else if (message === "quantity_3") {
      quantity = 3;
    } else if (message === "custom_quantity") {
      const response = "Please enter the quantity you'd like (e.g., '5'):";
      session.state = 'CUSTOM_QUANTITY_INPUT';
      await this.updateSession(session.user_id, session);
      return { response, buttons: [] };
    } else if (session.state === 'CUSTOM_QUANTITY_INPUT') {
      const parsed = parseInt(message);
      if (isNaN(parsed) || parsed <= 0) {
        const response = "Please enter a valid number greater than 0:";
        return { response, buttons: [] };
      }
      quantity = parsed;
    } else {
      const parsed = parseInt(message);
      if (isNaN(parsed) || parsed <= 0) {
        const response = "Please enter a valid number or use the buttons above:";
        const buttons = [
          { type: "reply", reply: { id: "quantity_1", title: "1" } },
          { type: "reply", reply: { id: "quantity_2", title: "2" } },
          { type: "reply", reply: { id: "quantity_3", title: "3" } },
          { type: "reply", reply: { id: "custom_quantity", title: "Custom Amount" } }
        ];
        return { response, buttons };
      }
      quantity = parsed;
    }
    
    // Add item to cart
    if (session.last_item_added) {
      const menu_item = session.last_item_added;
      
      console.log(`Adding item to cart: ${menu_item.name}, quantity: ${quantity}`);
      console.log(`Current cart length before adding: ${session.cart.length}`);
      
      // Check if item already exists in cart
      const existingItem = session.cart.find(item => item.menu_item.id === menu_item.id);
      if (existingItem) {
        existingItem.quantity += quantity;
        console.log(`Updated existing item quantity to: ${existingItem.quantity}`);
      } else {
        const cartItem: CartItem = {
          menu_item,
          quantity,
          special_instructions: undefined
        };
        session.cart.push(cartItem);
        console.log(`Added new item to cart. Cart length: ${session.cart.length}`);
      }
      
      // Update session data with cart
      session.session_data.cart = session.cart;
      session.state = 'ADDING_ITEM_INSTRUCTIONS';
      session.last_item_added = undefined;
      session.session_data.last_item_added = undefined;
      
      console.log(`Cart updated. Total items: ${session.cart.length}, Total quantity: ${session.cart.reduce((sum, item) => sum + item.quantity, 0)}`);
      
      await this.updateSession(session.user_id, session);
      
      const response = `Added ${quantity} x ${menu_item.name} to your cart.\n\nAny special instructions for the ${menu_item.name} (e.g., "no onions", "extra cheese")? Type 'None' if no special instructions.`;
      
      const buttons = [
        { type: "reply", reply: { id: "none", title: "None" } },
        { type: "reply", reply: { id: "skip_instructions", title: "Skip Instructions" } }
      ];
      
      return { response, buttons };
    } else {
      console.log("No item to add to cart - last_item_added is null");
      return this.sendFallbackMessage(session);
    }
  }

  private async handleItemInstructionsInput(session: UserSession, message: string): Promise<{ response: string; buttons: any[] }> {
    console.log(`handleItemInstructionsInput: Processing message "${message}" for user ${session.user_id}`);
    console.log(`Current cart length: ${session.cart.length}`);
    
    if (session.cart.length > 0) {
      const lastItem = session.cart[session.cart.length - 1];
      if (message.toLowerCase() !== 'none' && message !== 'skip_instructions') {
        lastItem.special_instructions = message;
      }
    }
    
    // Update session data with cart
    session.session_data.cart = session.cart;
    session.state = 'MANAGING_CART';
    await this.updateSession(session.user_id, session);
    
    const cartCount = session.cart.length;
    const totalItems = session.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = session.cart.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0);
    
    console.log(`Cart updated: ${cartCount} items, ${totalItems} total quantity, ₹${subtotal.toFixed(0)} total`);
    
    const response = `Great! You have ${totalItems} item(s) in your cart (₹${subtotal.toFixed(0)}). What would you like to do next?`;
    const buttons = [
      { type: "reply", reply: { id: "view_my_cart", title: "View My Cart" } },
      { type: "reply", reply: { id: "add_more_items", title: "Add More Items" } },
      { type: "reply", reply: { id: "proceed_to_checkout", title: "Proceed to Checkout" } }
    ];
    
    return { response, buttons };
  }

  private async handleAdjustingItemQuantity(session: UserSession, message: string): Promise<{ response: string; buttons: any[] }> {
    if (message === "remove_item") {
      // Remove the item being adjusted
      if (session.last_item_added) {
        session.cart = session.cart.filter(item => item.menu_item.id !== session.last_item_added!.id);
        session.session_data.cart = session.cart;
        session.last_item_added = undefined;
        session.state = 'MANAGING_CART';
        await this.updateSession(session.user_id, session);
        
        const response = "Item removed from cart. What would you like to do next?";
        const buttons = [
          { type: "reply", reply: { id: "view_my_cart", title: "View My Cart" } },
          { type: "reply", reply: { id: "add_more_items", title: "Add More Items" } },
          { type: "reply", reply: { id: "proceed_to_checkout", title: "Proceed to Checkout" } }
        ];
        return { response, buttons };
      }
    }
    
    // Handle quantity selection
    let quantity = 1;
    
    if (message === "quantity_1") {
      quantity = 1;
    } else if (message === "quantity_2") {
      quantity = 2;
    } else if (message === "quantity_3") {
      quantity = 3;
    } else if (message === "custom_quantity") {
      const response = "Please enter the quantity you'd like (e.g., '5'):";
      session.state = 'CUSTOM_QUANTITY_INPUT';
      await this.updateSession(session.user_id, session);
      return { response, buttons: [] };
    } else if (session.state === 'CUSTOM_QUANTITY_INPUT') {
      const parsed = parseInt(message);
      if (isNaN(parsed) || parsed <= 0) {
        const response = "Please enter a valid number greater than 0:";
        return { response, buttons: [] };
      }
      quantity = parsed;
    } else {
      const parsed = parseInt(message);
      if (isNaN(parsed) || parsed <= 0) {
        const response = "Please enter a valid number or use the buttons above:";
        const buttons = [
          { type: "reply", reply: { id: "quantity_1", title: "1" } },
          { type: "reply", reply: { id: "quantity_2", title: "2" } },
          { type: "reply", reply: { id: "quantity_3", title: "3" } },
          { type: "reply", reply: { id: "custom_quantity", title: "Custom Amount" } }
        ];
        return { response, buttons };
      }
      quantity = parsed;
    }
    
    // Update the item quantity in cart
    if (session.last_item_added) {
      const existingItem = session.cart.find(item => item.menu_item.id === session.last_item_added!.id);
      if (existingItem) {
        existingItem.quantity = quantity;
      }
      
      session.session_data.cart = session.cart;
      const item_name = session.last_item_added.name;
      const item_price = Number(session.last_item_added.price);
      
      session.last_item_added = undefined;
      session.state = 'MANAGING_CART';
      await this.updateSession(session.user_id, session);
      
      const response = `Updated ${item_name} quantity to ${quantity}. What would you like to do next?`;
      const buttons = [
        { type: "reply", reply: { id: "view_my_cart", title: "View My Cart" } },
        { type: "reply", reply: { id: "add_more_items", title: "Add More Items" } },
        { type: "reply", reply: { id: "proceed_to_checkout", title: "Proceed to Checkout" } }
      ];
      
      return { response, buttons };
    } else {
      return this.sendFallbackMessage(session);
    }
  }

  private async handleCartManagement(session: UserSession, message: string): Promise<{ response: string; buttons?: any[]; list_sections?: any[] }> {
    console.log(`handleCartManagement: Processing message "${message}" for user ${session.user_id}`);
    console.log(`Current cart length: ${session.cart.length}`);
    
    if (message === "add_more_items") {
      console.log("Adding more items - transitioning to menu categories");
      session.state = 'VIEWING_MENU_CATEGORIES';
      await this.updateSession(session.user_id, session);
      return this.handleViewMenu(session);
    } else if (message === "view_my_cart") {
      console.log("Viewing cart");
      return this.handleViewCart(session);
    } else if (message === "proceed_to_checkout") {
      console.log("Proceeding to checkout");
      return this.handleProceedToCheckout(session);
    } else if (message.startsWith("adjust_item_")) {
      // Handle item adjustment
      const itemIndex = parseInt(message.replace("adjust_item_", "")) - 1;
      if (itemIndex >= 0 && itemIndex < session.cart.length) {
        session.last_item_added = session.cart[itemIndex].menu_item;
        session.state = 'ADJUSTING_ITEM_QUANTITY';
        await this.updateSession(session.user_id, session);
        
        const response = `Adjusting ${session.cart[itemIndex].menu_item.name}. Current quantity: ${session.cart[itemIndex].quantity}. How many would you like?`;
        const buttons = [
          { type: "reply", reply: { id: "quantity_1", title: "1" } },
          { type: "reply", reply: { id: "quantity_2", title: "2" } },
          { type: "reply", reply: { id: "quantity_3", title: "3" } },
          { type: "reply", reply: { id: "remove_item", title: "Remove Item" } },
          { type: "reply", reply: { id: "custom_quantity", title: "Custom Amount" } }
        ];
        return { response, buttons };
      }
      return this.sendFallbackMessage(session);
    } else if (message === "remove_item") {
      // Remove the item being adjusted
      if (session.last_item_added) {
        session.cart = session.cart.filter(item => item.menu_item.id !== session.last_item_added!.id);
        session.session_data.cart = session.cart;
        session.last_item_added = undefined;
        session.state = 'MANAGING_CART';
        await this.updateSession(session.user_id, session);
        
        const response = "Item removed from cart. What would you like to do next?";
        const buttons = [
          { type: "reply", reply: { id: "view_my_cart", title: "View My Cart" } },
          { type: "reply", reply: { id: "add_more_items", title: "Add More Items" } },
          { type: "reply", reply: { id: "proceed_to_checkout", title: "Proceed to Checkout" } }
        ];
        return { response, buttons };
      }
      return this.sendFallbackMessage(session);
    } else {
      return this.sendFallbackMessage(session);
    }
  }

  private async handleViewCart(session: UserSession): Promise<{ response: string; buttons?: any[]; list_sections?: any[] }> {
    console.log(`handleViewCart: Cart length: ${session.cart.length}`);
    console.log(`Cart contents:`, session.cart.map(item => `${item.quantity}x ${item.menu_item.name}`));
    
    if (session.cart.length === 0) {
      console.log("Cart is empty, showing empty cart message");
      const response = "Your cart is empty.";
      const buttons = [
        { type: "reply", reply: { id: "view_menu", title: " View Menu" } },
        { type: "reply", reply: { id: "back_to_main_menu", title: " Back to Main Menu" } }
      ];
      return { response, buttons };
    }
    
    const cart_summary = ["Here's what's in your cart:"];
    session.cart.forEach((item, index) => {
      cart_summary.push(`${index + 1}. ${item.quantity}x ${item.menu_item.name} - ₹${(item.menu_item.price * item.quantity).toFixed(0)}`);
      if (item.special_instructions) {
        cart_summary.push(`   Special instructions: ${item.special_instructions}`);
      }
    });
    
    const subtotal = session.cart.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0);
    cart_summary.push(`-----------------------------------\nSubtotal: ₹${subtotal.toFixed(0)}`);
    
    const response = cart_summary.join('\n');
    
    // Create list sections for cart items with adjustment options
    const list_sections = [{
      title: "Cart Items - Click to Adjust",
      rows: session.cart.map((item, index) => ({
        id: `adjust_item_${index + 1}`,
        title: `${item.quantity}x ${item.menu_item.name} - ₹${(item.menu_item.price * item.quantity).toFixed(0)}`
      }))
    }];
    
    const buttons = [
      { type: "reply", reply: { id: "proceed_to_checkout", title: "Proceed to Checkout" } },
      { type: "reply", reply: { id: "view_menu", title: "Add More Items" } },
      { type: "reply", reply: { id: "back_to_main_menu", title: "Back to Main Menu" } }
    ];
    
    return { response, buttons, list_sections };
  }

  private async handleProceedToCheckout(session: UserSession): Promise<{ response: string; buttons: any[] }> {
    if (session.cart.length === 0) {
      const response = "Your cart is empty. Please add some items first.";
      const buttons = [
        { type: "reply", reply: { id: "view_menu", title: " View Menu" } },
        { type: "reply", reply: { id: "back_to_main_menu", title: " Back to Main Menu" } }
      ];
      return { response, buttons };
    }
    
    const response = "How would you like to receive your order?";
    const buttons = [
      { type: "reply", reply: { id: "delivery", title: " Delivery" } },
      { type: "reply", reply: { id: "pickup", title: " Pickup" } }
    ];
    
    session.state = 'SELECTING_ORDER_TYPE';
    await this.updateSession(session.user_id, session);
    
    return { response, buttons };
  }

  private async handleOrderTypeSelection(session: UserSession, message: string): Promise<{ response: string; buttons?: any[] }> {
    if (message === "delivery") {
      session.order_type = 'delivery';
      session.session_data.order_type = 'delivery';
      session.state = 'REQUESTING_DELIVERY_ADDRESS';
      await this.updateSession(session.user_id, session);
      
      const response = "Please provide your delivery address (street, building, apartment/suite, landmark):";
      return { response, buttons: [] };
    } else if (message === "pickup") {
      session.order_type = 'pickup';
      session.session_data.order_type = 'pickup';
      session.delivery_address = this.restaurant_address;
      session.session_data.delivery_address = this.restaurant_address;
      session.state = 'SELECTING_PAYMENT_METHOD';
      await this.updateSession(session.user_id, session);
      
      const response = `Great! You've chosen pickup. Our address is: ${this.restaurant_address}\n\nHow would you like to pay?`;
      const buttons = [
        { type: "reply", reply: { id: "cash_on_delivery", title: " Cash on Pickup" } },
        { type: "reply", reply: { id: "online_payment", title: " Online Payment" } }
      ];
      return { response, buttons };
    } else {
      return this.sendFallbackMessage(session);
    }
  }

  private async handleDeliveryAddressInput(session: UserSession, message: string): Promise<{ response: string; buttons: any[] }> {
    session.delivery_address = message;
    session.session_data.delivery_address = message;
    session.state = 'SELECTING_PAYMENT_METHOD';
    await this.updateSession(session.user_id, session);
    
    const response = `Delivery address confirmed: ${message}\n\nHow would you like to pay?`;
    const buttons = [
      { type: "reply", reply: { id: "cash_on_delivery", title: " Cash on Delivery" } },
      { type: "reply", reply: { id: "online_payment", title: " Online Payment" } }
    ];
    return { response, buttons };
  }

  private async handlePaymentMethodSelection(session: UserSession, message: string): Promise<{ response: string; buttons: any[] }> {
    if (message === "cash_on_delivery") {
      session.payment_method = "Cash on Delivery";
      session.session_data.payment_method = "Cash on Delivery";
    } else if (message === "online_payment") {
      session.payment_method = "Online Payment";
      session.session_data.payment_method = "Online Payment";
    } else {
      return this.sendFallbackMessage(session);
    }
    
    session.state = 'REVIEWING_ORDER';
    await this.updateSession(session.user_id, session);
    
    return this.handleOrderReview(session);
  }

  private async handleOrderReview(session: UserSession): Promise<{ response: string; buttons: any[] }> {
    const subtotal = session.cart.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0);
    const delivery_fee = session.order_type === 'delivery' ? this.delivery_fee : 0;
    const total = subtotal + delivery_fee;
    
    const order_summary = ["--- YOUR ORDER ---", "Items:"];
    session.cart.forEach(item => {
      order_summary.push(`* ${item.quantity}x ${item.menu_item.name} - ₹${(item.menu_item.price * item.quantity).toFixed(0)}`);
      if (item.special_instructions) {
        order_summary.push(`  Special instructions: ${item.special_instructions}`);
      }
    });
    
    order_summary.push(`\nSubtotal: ₹${subtotal.toFixed(0)}`);
    if (session.order_type === 'delivery') {
      order_summary.push(`Delivery Fee: ₹${delivery_fee.toFixed(0)}`);
    }
    order_summary.push(`-----------------------------------\nTOTAL: ₹${total.toFixed(0)}`);
    order_summary.push(`\nOrder Type: ${session.order_type}`);
    
    if (session.order_type === 'delivery') {
      order_summary.push(`Delivery Address: ${session.delivery_address}`);
    } else {
      order_summary.push(`Pickup Location: ${this.restaurant_address}`);
    }
    
    order_summary.push(`Payment Method: ${session.payment_method}`);
    
    const response = order_summary.join('\n');
    const buttons = [
      { type: "reply", reply: { id: "confirm_order", title: " Confirm Order" } },
      { type: "reply", reply: { id: "cancel_order", title: " Cancel Order" } }
    ];
    
    return { response, buttons };
  }

  private async handleOrderReviewConfirmation(session: UserSession, message: string): Promise<{ response: string; buttons: any[] }> {
    if (message === "confirm_order") {
      return this.createOrderFromSession(session);
    } else if (message === "cancel_order") {
      session.cart = [];
      session.session_data.cart = [];
      session.state = 'MAIN_MENU';
      await this.updateSession(session.user_id, session);
      
      const response = "Order cancelled. How can I help you today?";
      const buttons = [
        { type: "reply", reply: { id: "place_order", title: " Place a New Order" } },
        { type: "reply", reply: { id: "view_menu", title: " View Our Full Menu" } },
        { type: "reply", reply: { id: "track_order", title: " Track My Order" } }
      ];
      return { response, buttons };
    } else {
      return this.sendFallbackMessage(session);
    }
  }

  private async createOrderFromSession(session: UserSession): Promise<{ response: string; buttons: any[] }> {
    const subtotal = session.cart.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0);
    const delivery_fee = session.order_type === 'delivery' ? this.delivery_fee : 0;
    const total = subtotal + delivery_fee;
    
    try {
      // Import the order service
      const { createWhatsAppOrder } = await import('./orderService');
      
      // Prepare order data
      const orderData = {
        user_id: session.user_id,
        order_type: session.order_type!,
        delivery_address: session.delivery_address || null,
        contact_phone: session.contact_phone || session.user_id,
        payment_method: session.payment_method || 'Cash on Delivery',
        items: session.cart.map(item => ({
          product_id: item.menu_item.id,
          product_name: item.menu_item.name,
          price: item.menu_item.price,
          quantity: item.quantity,
          special_instructions: item.special_instructions || null
        }))
      };
      
      console.log('Creating WhatsApp order:', JSON.stringify(orderData, null, 2));
      
      // Create order directly using the service
      const result = await createWhatsAppOrder(orderData);
      
      console.log('WhatsApp order created successfully:', result);
      
      if (result.success && result.data) {
        const order = result.data;
        // Clear cart
        session.cart = [];
        session.session_data.cart = [];
        session.state = 'MAIN_MENU';
        await this.updateSession(session.user_id, session);
        
        const responseText = `✅ Order confirmed! Your order #${order.order_id} has been placed.\n\nTotal: ₹${total.toFixed(0)}\nEstimated completion: ${order.estimated_completion ? new Date(order.estimated_completion).toLocaleTimeString() : '30 minutes'}\n\nThank you for choosing ${this.restaurant_name}!`;
        const buttons = [
          { type: "reply", reply: { id: "place_order", title: " Place Another Order" } },
          { type: "reply", reply: { id: "track_order", title: " Track My Order" } },
          { type: "reply", reply: { id: "view_menu", title: " View Menu" } }
        ];
        
        return { response: responseText, buttons };
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error: any) {
      console.error('Error creating WhatsApp order:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      const response = "Sorry, there was an error processing your order. Please try again.";
      const buttons = [
        { type: "reply", reply: { id: "place_order", title: " Try Again" } },
        { type: "reply", reply: { id: "talk_human", title: " Talk to a Human" } }
      ];
      return { response, buttons };
    }
  }

  private async handleTrackOrderRequest(session: UserSession): Promise<{ response: string; buttons: any[] }> {
    const response = "Please enter your order ID to track your order:";
    session.state = 'TRACKING_ORDER_ID';
    await this.updateSession(session.user_id, session);
    return { response, buttons: [] };
  }

  private async handleTrackOrderIdInput(session: UserSession, message: string): Promise<{ response: string; buttons: any[] }> {
    try {
      // Use the shared order API to track orders
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/orders/shared?orderId=${message}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.orders && result.orders.length > 0) {
        const order = result.orders[0];
        const status_message = `Order #${order.id} Status: ${order.status}\nEstimated delivery: ${new Date(order.estimated_delivery).toLocaleTimeString()}\nTotal: ₹${Number(order.total_amount).toFixed(0)}`;
        const buttons = [
          { type: "reply", reply: { id: "place_order", title: " Place New Order" } },
          { type: "reply", reply: { id: "track_order", title: " Track Another Order" } },
          { type: "reply", reply: { id: "main_menu", title: " Back to Main Menu" } }
        ];
        
        session.state = 'MAIN_MENU';
        await this.updateSession(session.user_id, session);
        
        return { response: status_message, buttons };
      } else {
        const response = `Order #${message} not found. Please check your order ID and try again.`;
        const buttons = [
          { type: "reply", reply: { id: "track_order", title: " Try Another Order ID" } },
          { type: "reply", reply: { id: "main_menu", title: " Back to Main Menu" } }
        ];
        return { response, buttons };
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      const response = `Sorry, there was an error tracking your order. Please try again.`;
      const buttons = [
        { type: "reply", reply: { id: "track_order", title: " Try Again" } },
        { type: "reply", reply: { id: "main_menu", title: " Back to Main Menu" } }
      ];
      return { response, buttons };
    }
  }

  private async handleRestaurantInfo(session: UserSession): Promise<{ response: string; buttons: any[] }> {
    const hours_text = Object.entries(this.operating_hours)
      .map(([day, hours]) => `${day}: ${hours}`)
      .join('\n');
    
    const response = ` ${this.restaurant_name}\n\n${this.restaurant_address}\nPhone: ${this.restaurant_phone}\nWebsite: ${this.restaurant_website}\n\nOperating Hours:\n${hours_text}`;
    const buttons = [
      { type: "reply", reply: { id: "place_order", title: " Place an Order" } },
      { type: "reply", reply: { id: "view_menu", title: " View Menu" } },
      { type: "reply", reply: { id: "main_menu", title: " Back to Main Menu" } }
    ];
    
    return { response, buttons };
  }

  private async handleTalkToHuman(session: UserSession): Promise<{ response: string; buttons: any[] }> {
    const response = "Your message has been forwarded to our team. They will get back to you shortly. In the meantime, you can place an order or browse our menu.";
    const buttons = [
      { type: "reply", reply: { id: "place_order", title: " Place an Order" } },
      { type: "reply", reply: { id: "view_menu", title: " View Menu" } },
      { type: "reply", reply: { id: "main_menu", title: " Back to Main Menu" } }
    ];
    
    return { response, buttons };
  }

  private async handlePlaceNewOrder(session: UserSession): Promise<{ response: string; buttons: any[] }> {
    const response = "Fantastic! Let's start building your order.";
    const buttons = [
      { type: "reply", reply: { id: "view_menu", title: " View Menu & Add Items" } },
      { type: "reply", reply: { id: "view_cart_from_menu", title: " Checkout My Current Cart" } },
      { type: "reply", reply: { id: "main_menu", title: " Back to Main Menu" } }
    ];
    
    session.state = 'MANAGING_CART';
    await this.updateSession(session.user_id, session);
    
    return { response, buttons };
  }
}
