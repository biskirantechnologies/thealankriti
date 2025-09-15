const twilio = require('twilio');

// Initialize Twilio client only if valid credentials are available
let client = null;
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;

if (twilioSid && twilioToken && twilioSid.startsWith('AC') && twilioSid !== 'your-twilio-sid') {
  client = twilio(twilioSid, twilioToken);
  console.log('✅ Twilio WhatsApp service initialized');
} else {
  console.log('⚠️ Twilio credentials not configured - WhatsApp notifications disabled');
}

const sendOrderNotificationWhatsApp = async (order) => {
  try {
    if (!client || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('⚠️ Twilio credentials not configured, skipping WhatsApp notification');
      return { success: false, reason: 'Twilio not configured' };
    }

    const message = generateOrderNotificationMessage(order);
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.STORE_WHATSAPP_NUMBER
    });

    console.log('✅ WhatsApp notification sent:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp notification:', error);
    throw error;
  }
};

const generateOrderNotificationMessage = (order) => {
  const itemsList = order.items.map(item => 
    `• ${item.productSnapshot.name} (${item.productSnapshot.sku}) - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toLocaleString('en-IN')}`
  ).join('\n');

  return `🔔 *NEW ORDER ALERT*

📦 *Order:* ${order.orderNumber}
👤 *Customer:* ${order.customerInfo.firstName} ${order.customerInfo.lastName}
📧 *Email:* ${order.customerInfo.email}
📱 *Phone:* ${order.customerInfo.phone || 'Not provided'}
📅 *Date:* ${new Date(order.createdAt).toLocaleString('en-IN')}

🛍️ *Items:*
${itemsList}

💰 *Total Amount:* ₹${order.pricing.total.toLocaleString('en-IN')}

📍 *Shipping Address:*
${order.shippingAddress.street}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
${order.shippingAddress.country}
${order.shippingAddress.landmark ? `Landmark: ${order.shippingAddress.landmark}` : ''}

${order.notes?.customer ? `📝 *Customer Notes:* ${order.notes.customer}` : ''}

Please process this order in the admin panel.`;
};

// Send order status update to customer via WhatsApp
const sendOrderStatusUpdateWhatsApp = async (customerPhone, order, newStatus) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('⚠️ Twilio credentials not configured, skipping WhatsApp update');
      return { success: false, reason: 'Twilio not configured' };
    }

    const message = generateOrderStatusUpdateMessage(order, newStatus);
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${customerPhone}`
    });

    console.log('✅ Order status WhatsApp sent:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('❌ Error sending order status WhatsApp:', error);
    throw error;
  }
};

const generateOrderStatusUpdateMessage = (order, newStatus) => {
  const statusEmojis = {
    'confirmed': '✅',
    'processing': '⚙️',
    'shipped': '🚚',
    'delivered': '📦',
    'cancelled': '❌'
  };

  const emoji = statusEmojis[newStatus] || '📋';
  
  return `${emoji} *Order Update - ${process.env.STORE_NAME || 'The Alankriti'}*

Hello ${order.customerInfo.firstName}!

Your order *${order.orderNumber}* has been updated:

📋 *Status:* ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
💰 *Amount:* ₹${order.pricing.total.toLocaleString('en-IN')}

${newStatus === 'shipped' && order.tracking?.trackingNumber ? 
  `🔗 *Tracking Number:* ${order.tracking.trackingNumber}` : ''
}

${newStatus === 'delivered' ? 
  'Thank you for shopping with us! We hope you love your jewelry. ✨' : 
  'We\'ll keep you updated on any further changes.'
}

For any queries, please contact us.`;
};

module.exports = {
  sendOrderNotificationWhatsApp,
  sendOrderStatusUpdateWhatsApp
};
