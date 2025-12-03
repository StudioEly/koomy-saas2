import sgMail from "@sendgrid/mail";
import { renderTemplate, sanitizeHtml, isValidEmail } from "./renderer";
import { EmailType } from "./emailTypes";
import { db } from "../../db";
import { emailTemplates, emailLogs } from "@shared/schema";
import { eq } from "drizzle-orm";

interface SendGridCredentials {
  apiKey: string;
  fromEmail: string;
}

async function getCredentials(): Promise<SendGridCredentials> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? "repl " + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? "depl " + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }

  const response = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=sendgrid",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  );
  
  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error("SendGrid not connected");
  }
  
  return {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getSendGridClient() {
  const { apiKey, fromEmail } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return { client: sgMail, fromEmail };
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  if (!isValidEmail(to)) {
    throw new Error(`Invalid email address: ${to}`);
  }

  const sanitizedHtml = sanitizeHtml(html);
  
  try {
    const { client, fromEmail } = await getSendGridClient();
    
    const msg = {
      to,
      from: fromEmail,
      subject,
      html: sanitizedHtml
    };
    
    await client.send(msg);
    return true;
  } catch (error) {
    console.error("SendGrid error:", error);
    throw error;
  }
}

async function getTemplateByType(type: EmailType): Promise<{ subject: string; html: string } | null> {
  const [template] = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.type, type))
    .limit(1);
  
  return template || null;
}

async function logEmailSend(
  to: string,
  type: EmailType,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  try {
    await db.insert(emailLogs).values({
      to,
      type,
      success,
      errorMessage: errorMessage || null
    });
  } catch (error) {
    console.error("Failed to log email send:", error);
  }
}

export async function sendSystemEmail(
  type: EmailType,
  to: string,
  variables: Record<string, string | number | undefined>
): Promise<boolean> {
  const template = await getTemplateByType(type);
  
  if (!template) {
    const error = `No template found for type: ${type}`;
    await logEmailSend(to, type, false, error);
    throw new Error(error);
  }
  
  const html = renderTemplate(template.html, variables);
  const subject = renderTemplate(template.subject, variables);
  
  try {
    await sendEmail({ to, subject, html });
    await logEmailSend(to, type, true);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await logEmailSend(to, type, false, errorMessage);
    throw error;
  }
}
