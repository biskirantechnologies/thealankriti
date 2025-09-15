const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send order confirmation email to customer
const sendOrderConfirmationEmail = async (order, invoicePath) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.STORE_NAME || 'The Alankriti'}" <${process.env.EMAIL_USER}>`,
      to: order.customerInfo.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: generateOrderConfirmationHTML(order),
      attachments: invoicePath ? [{
        filename: `invoice-${order.orderNumber}.pdf`,
        path: invoicePath
      }] : []
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    throw error;
  }
};

// Send order notification email to admin
const sendOrderNotificationToAdmin = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.STORE_NAME || 'The Alankriti'}" <${process.env.EMAIL_USER}>`,
      to: process.env.STORE_EMAIL,
      subject: `🔔 New Order Received - ${order.orderNumber}`,
      html: generateAdminOrderNotificationHTML(order)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error);
    throw error;
  }
};

// Generate order confirmation HTML template
const generateOrderConfirmationHTML = (order) => {
  const itemsHTML = order.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 15px; text-align: left;">
        <div style="display: flex; align-items: center;">
          ${item.productSnapshot.image ? `<img src="${item.productSnapshot.image}" alt="${item.productSnapshot.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">` : ''}
          <div>
            <h4 style="margin: 0; color: #333; font-size: 16px;">${item.productSnapshot.name}</h4>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">SKU: ${item.productSnapshot.sku}</p>
            ${item.variant ? `<p style="margin: 5px 0; color: #666; font-size: 14px;">${item.variant.name}: ${item.variant.value}</p>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 15px; text-align: center; color: #333;">₹${item.price.toLocaleString('en-IN')}</td>
      <td style="padding: 15px; text-align: center; color: #333;">${item.quantity}</td>
      <td style="padding: 15px; text-align: center; color: #333; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #d4af37, #ffd700); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 300; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${process.env.STORE_NAME || 'The Alankriti'}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Exquisite Jewelry Collection</p>
        </div>

        <!-- Order Confirmation -->
        <div style="padding: 40px 30px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #d4af37; margin: 0 0 10px 0; font-size: 28px;">Order Confirmed! 🎉</h2>
            <p style="color: #666; margin: 0; font-size: 16px;">Thank you for your purchase, ${order.customerInfo.firstName}!</p>
          </div>

          <!-- Order Details -->
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Order Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
                <p style="margin: 5px 0 0 0; color: #333; font-weight: bold; font-size: 16px;">${order.orderNumber}</p>
              </div>
              <div>
                <p style="margin: 0; color: #666; font-size: 14px;">Order Date</p>
                <p style="margin: 5px 0 0 0; color: #333; font-weight: bold; font-size: 16px;">${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; margin: 0 0 20px 0; font-size: 18px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 15px; text-align: left; color: #333; font-weight: 600;">Item</th>
                  <th style="padding: 15px; text-align: center; color: #333; font-weight: 600;">Price</th>
                  <th style="padding: 15px; text-align: center; color: #333; font-weight: 600;">Qty</th>
                  <th style="padding: 15px; text-align: center; color: #333; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <!-- Pricing Summary -->
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Order Summary</h3>
            <div style="space-y: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Subtotal:</span>
                <span style="color: #333; font-weight: 500;">₹${order.pricing.subtotal.toLocaleString('en-IN')}</span>
              </div>
              ${order.pricing.discount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Discount:</span>
                <span style="color: #e74c3c; font-weight: 500;">-₹${order.pricing.discount.toLocaleString('en-IN')}</span>
              </div>
              ` : ''}
              ${order.pricing.tax > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Tax:</span>
                <span style="color: #333; font-weight: 500;">₹${order.pricing.tax.toLocaleString('en-IN')}</span>
              </div>
              ` : ''}
              ${order.pricing.shipping > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Shipping:</span>
                <span style="color: #333; font-weight: 500;">₹${order.pricing.shipping.toLocaleString('en-IN')}</span>
              </div>
              ` : ''}
              <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #333; font-weight: bold; font-size: 18px;">Total:</span>
                <span style="color: #d4af37; font-weight: bold; font-size: 18px;">₹${order.pricing.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Shipping Address</h3>
            <p style="margin: 0; color: #333; line-height: 1.5;">
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}
              ${order.shippingAddress.landmark ? `<br>Landmark: ${order.shippingAddress.landmark}` : ''}
            </p>
          </div>

          <!-- Next Steps -->
          <div style="text-align: center; padding: 20px; background-color: #fff9e6; border-radius: 8px; border-left: 4px solid #d4af37;">
            <h3 style="color: #d4af37; margin: 0 0 10px 0; font-size: 18px;">What's Next?</h3>
            <p style="margin: 0; color: #666; line-height: 1.5;">
              We're processing your order and will send you tracking information once it ships. 
              You can track your order status anytime using order number <strong>${order.orderNumber}</strong>.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #333; padding: 30px; text-align: center;">
          <p style="color: #ccc; margin: 0 0 10px 0; font-size: 14px;">Thank you for choosing ${process.env.STORE_NAME || 'The Alankriti'}</p>
          <p style="color: #999; margin: 0; font-size: 12px;">If you have any questions, please contact us at ${process.env.STORE_EMAIL}</p>
        </div>

      </div>
    </body>
    </html>
  `;
};

// Generate admin notification HTML template
const generateAdminOrderNotificationHTML = (order) => {
  const itemsHTML = order.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px;">${item.productSnapshot.name} (${item.productSnapshot.sku})</td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: center;">₹${item.price.toLocaleString('en-IN')}</td>
      <td style="padding: 10px; text-align: center;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #d4af37;">
          <h1 style="color: #d4af37; margin: 0;">🔔 New Order Alert</h1>
          <p style="color: #666; margin: 10px 0 0 0;">A new order has been placed on your store</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333; margin: 0 0 15px 0;">Order Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Order Number:</td>
              <td style="padding: 8px 0;">${order.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Customer:</td>
              <td style="padding: 8px 0;">${order.customerInfo.firstName} ${order.customerInfo.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${order.customerInfo.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">${order.customerInfo.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Order Date:</td>
              <td style="padding: 8px 0;">${new Date(order.createdAt).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
              <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #d4af37;">₹${order.pricing.total.toLocaleString('en-IN')}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Shipping Address</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
            <p style="margin: 0; line-height: 1.5;">
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}
              ${order.shippingAddress.landmark ? `<br>Landmark: ${order.shippingAddress.landmark}` : ''}
            </p>
          </div>
        </div>

        ${order.notes?.customer ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Customer Notes</h3>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;">${order.notes.customer}</p>
          </div>
        </div>
        ` : ''}

        <div style="text-align: center; padding: 20px; background-color: #e8f4fd; border-radius: 5px; border-left: 4px solid #007bff;">
          <p style="margin: 0; color: #333;">
            <strong>Action Required:</strong> Please log in to your admin panel to process this order.
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderNotificationToAdmin
};
