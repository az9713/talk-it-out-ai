import { Resend } from 'resend';

// Initialize Resend client (gracefully handle missing API key)
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const fromEmail = process.env.EMAIL_FROM || 'Talk It Out <noreply@talkitout.ai>';
const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.log('[Email] Resend not configured. Would have sent:', {
      to: options.to,
      subject: options.subject,
    });
    return { success: true }; // Gracefully succeed when not configured
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('[Email] Send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Email] Exception:', message);
    return { success: false, error: message };
  }
}

export interface ReminderEmailData {
  userName: string;
  sessionTopic: string;
  sessionId: string;
  reminderType: 'follow_up' | 'agreement_check' | 'custom';
  customMessage?: string;
}

export function generateReminderEmail(data: ReminderEmailData): { subject: string; html: string; text: string } {
  const sessionUrl = `${appUrl}/dashboard/sessions/${data.sessionId}`;

  const subjects = {
    follow_up: `Time to check in: ${data.sessionTopic}`,
    agreement_check: `How are your agreements going? - ${data.sessionTopic}`,
    custom: `Reminder: ${data.sessionTopic}`,
  };

  const subject = subjects[data.reminderType];

  const greetings = {
    follow_up: `It's time for a follow-up on your session about "${data.sessionTopic}".`,
    agreement_check: `We wanted to check in on the agreements you made during your session about "${data.sessionTopic}".`,
    custom: data.customMessage || `This is a reminder about your session: "${data.sessionTopic}".`,
  };

  const greeting = greetings[data.reminderType];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Talk It Out</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Reflection Reminder</p>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.userName || 'there'},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">${greeting}</p>

    <div style="background: #fef2f2; border-left: 4px solid #f43f5e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-weight: 600; color: #991b1b;">Session Topic</p>
      <p style="margin: 5px 0 0 0; color: #7f1d1d;">${data.sessionTopic}</p>
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">Taking a moment to reflect can help reinforce positive changes and identify any adjustments needed.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${sessionUrl}" style="display: inline-block; background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Session
      </a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      Questions to consider:
    </p>
    <ul style="font-size: 14px; color: #6b7280; padding-left: 20px;">
      <li>How are things going since your session?</li>
      <li>Have the agreements been helpful?</li>
      <li>Is there anything you'd like to discuss further?</li>
    </ul>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">You're receiving this because you have reminders enabled.</p>
    <p style="margin: 5px 0 0 0;">
      <a href="${appUrl}/dashboard/settings" style="color: #f43f5e; text-decoration: none;">Manage preferences</a>
    </p>
  </div>
</body>
</html>
  `.trim();

  const text = `
Hi ${data.userName || 'there'},

${greeting}

Session Topic: ${data.sessionTopic}

Taking a moment to reflect can help reinforce positive changes and identify any adjustments needed.

View your session: ${sessionUrl}

Questions to consider:
- How are things going since your session?
- Have the agreements been helpful?
- Is there anything you'd like to discuss further?

---
You're receiving this because you have reminders enabled.
Manage preferences: ${appUrl}/dashboard/settings
  `.trim();

  return { subject, html, text };
}

export function isEmailConfigured(): boolean {
  return !!resend;
}
