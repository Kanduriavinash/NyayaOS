import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { prisma } from '@nyayaos/database';

export class NotificationTools {
  @Tool({
    name: 'send_email',
    description: 'Send an email notification to a user regarding case updates or court hearings',
    inputSchema: z.object({
      userId: z.string().describe('The database user ID of the recipient'),
      subject: z.string().describe('The email subject line'),
      body: z.string().describe('The body text content of the email')
    })
  })
  async sendEmail(input: { userId: string; subject: string; body: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Sending email notification to user: ${input.userId}`);

    try {
      const user = await prisma.user.findUnique({
        where: { id: input.userId }
      });

      if (!user) {
        throw new Error(`User with ID ${input.userId} not found`);
      }

      const email = user.email;
      ctx.logger.info(`Simulating SMTP send to ${email}. Subject: "${input.subject}"`);

      // Save notification to database
      const notification = await prisma.notification.create({
        data: {
          userId: input.userId,
          title: input.subject,
          content: input.body,
          type: 'EMAIL',
          status: 'SENT'
        }
      });

      return {
        status: 'success',
        notificationId: notification.id,
        recipient: email,
        channel: 'EMAIL',
        message: `Email notification sent successfully to ${email}`
      };
    } catch (err: any) {
      ctx.logger.error(`Error sending email notification: ${err.message}`);
      return {
        status: 'error',
        message: err.message
      };
    }
  }

  @Tool({
    name: 'send_sms',
    description: 'Send an SMS text alert message to a user mobile phone number',
    inputSchema: z.object({
      userId: z.string().describe('The database user ID of the recipient'),
      messageText: z.string().describe('The text content of the SMS message (max 160 characters)')
    })
  })
  async sendSms(input: { userId: string; messageText: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Sending SMS alert to user: ${input.userId}`);

    try {
      const user = await prisma.user.findUnique({
        where: { id: input.userId }
      });

      if (!user) {
        throw new Error(`User with ID ${input.userId} not found`);
      }

      const phone = user.phone || '+91 99999 99999';
      ctx.logger.info(`Simulating SMS dispatch to ${phone}. Message: "${input.messageText}"`);

      const notification = await prisma.notification.create({
        data: {
          userId: input.userId,
          title: 'SMS Alert',
          content: input.messageText,
          type: 'SMS',
          status: 'SENT'
        }
      });

      return {
        status: 'success',
        notificationId: notification.id,
        recipient: phone,
        channel: 'SMS',
        message: `SMS alert dispatched successfully to ${phone}`
      };
    } catch (err: any) {
      ctx.logger.error(`Error sending SMS alert: ${err.message}`);
      return {
        status: 'error',
        message: err.message
      };
    }
  }

  @Tool({
    name: 'push_notification',
    description: 'Trigger a real-time web portal push notification alert for active users',
    inputSchema: z.object({
      userId: z.string().describe('The database user ID of the recipient'),
      title: z.string().describe('Alert title header'),
      content: z.string().describe('Alert text body content')
    })
  })
  async sendPushNotification(input: { userId: string; title: string; content: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Sending push alert to user: ${input.userId}`);

    try {
      const notification = await prisma.notification.create({
        data: {
          userId: input.userId,
          title: input.title,
          content: input.content,
          type: 'PUSH',
          status: 'SENT'
        }
      });

      return {
        status: 'success',
        notificationId: notification.id,
        recipientId: input.userId,
        channel: 'PUSH',
        message: `Push alert successfully triggered for user ${input.userId}`
      };
    } catch (err: any) {
      ctx.logger.error(`Error sending push notification: ${err.message}`);
      return {
        status: 'error',
        message: err.message
      };
    }
  }
}
