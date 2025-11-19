
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: any
): Promise<void> {
  const messages: ExpoPushMessage[] = [];

  for (const token of tokens) {
    if (!Expo.isExpoPushToken(token)) {
      console.error(`Push token ${token} is not a valid Expo push token`);
      continue;
    }

    messages.push({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      priority: 'high',
      badge: 1,
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets: ExpoPushTicket[] = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notification chunk:', error);
    }
  }

  for (const ticket of tickets) {
    if (ticket.status === 'error') {
      console.error(
        `Error sending notification: ${ticket.message}`,
        ticket.details
      );
    }
  }
}

export async function sendScheduledNotification(
  tokens: string[],
  title: string,
  body: string,
  scheduledTime: Date,
  data?: any
): Promise<void> {
  const delay = scheduledTime.getTime() - Date.now();

  if (delay > 0) {
    setTimeout(() => {
      sendPushNotification(tokens, title, body, data);
    }, delay);
  } else {
    sendPushNotification(tokens, title, body, data);
  }
}