import { google } from 'googleapis';
import { Order } from './types';
import { getOrderById } from './data-store';
import { getProductById } from './data-store';
import { getFarmById } from './data-store';
import { getUserById } from './data-store';

export async function sendOrderEmail(orderId: string): Promise<{ success: boolean; message: string }> {
  const order = getOrderById(orderId);
  if (!order) {
    return { success: false, message: 'Order not found' };
  }

  const user = getUserById(order.userId);
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const emailMode = process.env.EMAIL_MODE || 'MOCK';
  const notifyTo = process.env.NOTIFY_ORDERS_TO || 'orders@example.com';
  const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

  // Build email content
  const itemsByFarm = new Map<string, Array<{ product: ReturnType<typeof getProductById>; quantity: number; price: number }>>();
  
  for (const item of order.items) {
    const product = getProductById(item.productId);
    if (!product) continue;
    
    if (!itemsByFarm.has(item.farmId)) {
      itemsByFarm.set(item.farmId, []);
    }
    itemsByFarm.get(item.farmId)!.push({ product, quantity: item.quantity, price: item.price });
  }

  let emailBody = `
Farm2Table Premium Order #${orderId}

Customer Information:
- Name: ${user.name}
- Email: ${user.email}
- Delivery Date: ${order.deliveryDate || 'TBD'}
- Delivery Window: ${order.deliveryWindow || 'TBD'}

Order Items:
`;

  for (const [farmId, items] of itemsByFarm.entries()) {
    const farm = getFarmById(farmId);
    emailBody += `\n${farm?.name || 'Unknown Farm'}:\n`;
    for (const { product, quantity, price } of items) {
      emailBody += `  - ${product?.name || 'Unknown'} (${quantity} ${product?.unit || ''}) - $${(price * quantity).toFixed(2)}\n`;
    }
  }

  emailBody += `\nSubtotal: $${order.total.toFixed(2)}\n`;
  emailBody += `Total: $${order.total.toFixed(2)}\n\n`;
  emailBody += `View Order: ${appBaseUrl}/dashboard/orders/${orderId}\n`;

  const emailPayload = {
    to: notifyTo,
    subject: `Farm2Table Premium Order #${orderId}`,
    body: emailBody,
  };

  if (emailMode === 'MOCK') {
    console.log('MOCK EMAIL SEND:', emailPayload);
    return { success: true, message: 'Email sent (MOCK mode)' };
  }

  // Gmail API send
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const message = [
      `To: ${notifyTo}`,
      `Subject: ${emailPayload.subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      emailPayload.body,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Gmail API error:', error);
    console.log('FALLBACK - MOCK EMAIL SEND:', emailPayload);
    return { success: true, message: 'Email sent (MOCK fallback)' };
  }
}

