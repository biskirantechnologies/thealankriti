const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');

const generateInvoicePDF = async (order) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure invoices directory exists
      const invoicesDir = path.join(__dirname, '../invoices');
      try {
        await fs.access(invoicesDir);
      } catch {
        await fs.mkdir(invoicesDir, { recursive: true });
      }

      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const fileName = `invoice-${order.orderNumber}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      
      // Pipe to file
      const stream = doc.pipe(require('fs').createWriteStream(filePath));

      // Colors
      const primaryColor = '#d4af37';
      const darkGray = '#333333';
      const lightGray = '#666666';
      const backgroundColor = '#f8f9fa';

      // Header
      doc.fontSize(28)
         .fillColor(primaryColor)
         .text(process.env.STORE_NAME || 'TheAlankriti', 50, 50, { align: 'left' });

      doc.fontSize(12)
         .fillColor(lightGray)
         .text('Exquisite Jewelry Collection', 50, 85);

      // Invoice title
      doc.fontSize(24)
         .fillColor(darkGray)
         .text('INVOICE', 400, 50, { align: 'right' });

      doc.fontSize(12)
         .fillColor(lightGray)
         .text(`Invoice #: ${order.orderNumber}`, 400, 85, { align: 'right' })
         .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 100, { align: 'right' });

      // Line separator
      doc.strokeColor(primaryColor)
         .lineWidth(2)
         .moveTo(50, 130)
         .lineTo(545, 130)
         .stroke();

      // Customer Information
      doc.fontSize(16)
         .fillColor(darkGray)
         .text('Bill To:', 50, 150);

      doc.fontSize(12)
         .fillColor(darkGray)
         .text(`${order.customerInfo.firstName} ${order.customerInfo.lastName}`, 50, 175)
         .text(order.customerInfo.email, 50, 190);

      if (order.customerInfo.phone) {
        doc.text(order.customerInfo.phone, 50, 205);
      }

      // Shipping Address
      doc.fontSize(16)
         .fillColor(darkGray)
         .text('Ship To:', 300, 150);

      doc.fontSize(12)
         .fillColor(darkGray)
         .text(order.shippingAddress.street, 300, 175)
         .text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, 300, 190)
         .text(`${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`, 300, 205);

      if (order.shippingAddress.landmark) {
        doc.text(`Landmark: ${order.shippingAddress.landmark}`, 300, 220);
      }

      // Table Header
      const tableTop = 280;
      const itemCodeX = 50;
      const descriptionX = 150;
      const quantityX = 350;
      const priceX = 400;
      const totalX = 480;

      doc.fontSize(12)
         .fillColor('white');

      // Table header background
      doc.rect(50, tableTop, 495, 25)
         .fill(primaryColor);

      doc.fillColor('white')
         .text('Item Code', itemCodeX + 5, tableTop + 8)
         .text('Description', descriptionX + 5, tableTop + 8)
         .text('Qty', quantityX + 5, tableTop + 8, { align: 'center', width: 40 })
         .text('Price', priceX + 5, tableTop + 8, { align: 'right', width: 70 })
         .text('Total', totalX + 5, tableTop + 8, { align: 'right', width: 60 });

      // Table rows
      let currentY = tableTop + 25;
      doc.fillColor(darkGray);

      order.items.forEach((item, index) => {
        const rowHeight = 30;
        
        // Alternate row colors
        if (index % 2 === 0) {
          doc.rect(50, currentY, 495, rowHeight)
             .fill(backgroundColor);
        }

        doc.fillColor(darkGray)
           .fontSize(10)
           .text(item.productSnapshot.sku || 'N/A', itemCodeX + 5, currentY + 8, { width: 90 })
           .text(item.productSnapshot.name, descriptionX + 5, currentY + 8, { width: 190 })
           .text(item.quantity.toString(), quantityX + 5, currentY + 8, { align: 'center', width: 40 })
           .text(`₹${item.price.toLocaleString('en-IN')}`, priceX + 5, currentY + 8, { align: 'right', width: 70 })
           .text(`₹${(item.price * item.quantity).toLocaleString('en-IN')}`, totalX + 5, currentY + 8, { align: 'right', width: 60 });

        currentY += rowHeight;
      });

      // Summary section
      const summaryY = currentY + 20;
      const summaryX = 350;

      doc.fontSize(12)
         .fillColor(darkGray);

      // Subtotal
      doc.text('Subtotal:', summaryX, summaryY)
         .text(`₹${order.pricing.subtotal.toLocaleString('en-IN')}`, summaryX + 130, summaryY, { align: 'right', width: 70 });

      let nextLineY = summaryY + 20;

      // Discount (if applicable)
      if (order.pricing.discount > 0) {
        doc.text('Discount:', summaryX, nextLineY)
           .text(`-₹${order.pricing.discount.toLocaleString('en-IN')}`, summaryX + 130, nextLineY, { align: 'right', width: 70 });
        nextLineY += 20;
      }

      // Tax (if applicable)
      if (order.pricing.tax > 0) {
        doc.text('Tax:', summaryX, nextLineY)
           .text(`₹${order.pricing.tax.toLocaleString('en-IN')}`, summaryX + 130, nextLineY, { align: 'right', width: 70 });
        nextLineY += 20;
      }

      // Shipping (if applicable)
      if (order.pricing.shipping > 0) {
        doc.text('Shipping:', summaryX, nextLineY)
           .text(`₹${order.pricing.shipping.toLocaleString('en-IN')}`, summaryX + 130, nextLineY, { align: 'right', width: 70 });
        nextLineY += 20;
      }

      // Line separator for total
      doc.strokeColor(primaryColor)
         .lineWidth(1)
         .moveTo(summaryX, nextLineY + 5)
         .lineTo(summaryX + 200, nextLineY + 5)
         .stroke();

      // Total
      doc.fontSize(14)
         .fillColor(primaryColor)
         .text('TOTAL:', summaryX, nextLineY + 15, { continued: true })
         .text(`₹${order.pricing.total.toLocaleString('en-IN')}`, { align: 'right', width: 130 });

      // Payment Information
      const paymentY = nextLineY + 60;
      doc.fontSize(12)
         .fillColor(darkGray)
         .text('Payment Information:', 50, paymentY);

      doc.fontSize(10)
         .fillColor(lightGray)
         .text(`Payment Method: ${order.payment.method.toUpperCase()}`, 50, paymentY + 20)
         .text(`Payment Status: ${order.payment.status.toUpperCase()}`, 50, paymentY + 35);

      if (order.payment.transactionId) {
        doc.text(`Transaction ID: ${order.payment.transactionId}`, 50, paymentY + 50);
      }

      // Footer
      const footerY = 720;
      doc.fontSize(10)
         .fillColor(lightGray)
         .text('Thank you for your business!', 50, footerY, { align: 'center', width: 495 })
         .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, footerY + 15, { align: 'center', width: 495 });

      // Store contact information
      doc.text(`Contact: ${process.env.STORE_EMAIL || 'info@thealankriti.com'}`, 50, footerY + 30, { align: 'center', width: 495 });

      // Finalize the PDF
      doc.end();

      stream.on('finish', () => {
        console.log('✅ Invoice PDF generated:', filePath);
        resolve(filePath);
      });

      stream.on('error', (error) => {
        console.error('❌ Error generating invoice PDF:', error);
        reject(error);
      });

    } catch (error) {
      console.error('❌ Error in generateInvoicePDF:', error);
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF
};
