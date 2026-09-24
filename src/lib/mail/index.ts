export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface MailProvider {
  sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class ConsoleMailProvider implements MailProvider {
  async sendMail(options: SendMailOptions) {
    console.log('📬 [DEV MAIL] Email dispatched:', {
      to: options.to,
      subject: options.subject,
      attachmentsCount: options.attachments?.length || 0,
      timestamp: new Date().toISOString(),
    });
    return { success: true, messageId: `dev-${Date.now()}` };
  }
}

export const mailProvider: MailProvider = new ConsoleMailProvider();
export default mailProvider;
