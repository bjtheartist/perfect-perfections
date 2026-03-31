import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { SquareClient, SquareEnvironment } from 'square';
import nodemailer from 'nodemailer';
import { setCorsOrigin } from '../_lib/square.js';

function getClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsOrigin(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-token');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') return createLead(req, res);
  if (req.method === 'GET') return listLeads(req, res);
  res.status(405).json({ error: 'Method not allowed' });
}

async function createLead(req: VercelRequest, res: VercelResponse) {
  try {
    const { name, email, phone, event_date, event_type, guests, message } = req.body || {};

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (phone != null && typeof phone === 'string' && phone.trim()) {
      const trimmedPhone = phone.trim();
      if (!/^[0-9\s\-().+]+$/.test(trimmedPhone) || trimmedPhone.length < 7 || trimmedPhone.length > 20) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }
    }

    if (event_date != null && typeof event_date === 'string' && event_date.trim()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(event_date.trim())) {
        return res.status(400).json({ error: 'Invalid event date format (expected YYYY-MM-DD)' });
      }
    }

    const VALID_EVENT_TYPES = ['Wedding', 'Corporate', 'Private Party', 'Birthday', 'Holiday', 'Graduation', 'Funeral/Repast', 'Other'];
    if (event_type != null && typeof event_type === 'string' && event_type.trim()) {
      if (!VALID_EVENT_TYPES.includes(event_type.trim())) {
        return res.status(400).json({ error: `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` });
      }
    }

    const client = getClient();
    const [givenName, ...rest] = name.trim().split(' ');
    const familyName = rest.join(' ');

    const result = await client.customers.create({
      idempotencyKey: randomUUID(),
      givenName,
      familyName,
      emailAddress: email.trim(),
      phoneNumber: phone?.trim() || undefined,
      note: message?.trim()?.slice(0, 500) || undefined,
    });

    const customerId = result.customer?.id;
    if (!customerId) {
      return res.status(500).json({ error: 'Failed to create customer' });
    }

    const guestCount = guests ? Math.min(Math.max(0, Math.round(Number(guests))), 10000) : null;
    const leadData = JSON.stringify({
      event_date: event_date || null,
      event_type: event_type || null,
      guests: guestCount,
      message: message?.trim()?.slice(0, 500) || null,
    });

    const ccaClient = (client as any).customerCustomAttributes;
    await Promise.all([
      ccaClient.upsert({
        customerId,
        key: 'pp_lead_status',
        customAttribute: { value: 'new' },
      }),
      ccaClient.upsert({
        customerId,
        key: 'pp_lead_data',
        customAttribute: { value: leadData },
      }),
    ]);

    // Send notification email to Nikida (non-blocking)
    notifyNewLead({ name: name.trim(), email: email.trim(), phone, event_date, event_type, guests: guestCount, message }).catch(
      (err) => console.error('Lead notification failed:', err)
    );

    res.status(201).json({ id: customerId });
  } catch (error: any) {
    console.error('Create Lead Error:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function notifyNewLead(lead: {
  name: string; email: string; phone?: string;
  event_date?: string; event_type?: string; guests?: number | null; message?: string;
}) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const notifyEmail = process.env.NOTIFY_EMAIL || 'perfectperfectionscatering@gmail.com';
  if (!gmailUser || !gmailAppPassword) return; // Skip if not configured

  const details = [
    `<strong>Name:</strong> ${escapeHtml(lead.name)}`,
    `<strong>Email:</strong> ${escapeHtml(lead.email)}`,
    lead.phone ? `<strong>Phone:</strong> ${escapeHtml(lead.phone)}` : null,
    lead.event_type ? `<strong>Event Type:</strong> ${escapeHtml(lead.event_type)}` : null,
    lead.event_date ? `<strong>Event Date:</strong> ${escapeHtml(lead.event_date)}` : null,
    lead.guests ? `<strong>Guests:</strong> ${lead.guests}` : null,
    lead.message ? `<strong>Message:</strong> ${escapeHtml(lead.message)}` : null,
  ].filter(Boolean).join('<br/>');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  await transporter.sendMail({
    from: `"Perfect Perfections Website" <${gmailUser}>`,
    to: notifyEmail,
    replyTo: lead.email,
    subject: `New Inquiry from ${lead.name}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1B6B4A;">New Website Inquiry</h2>
        <p>Someone just reached out through your website:</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; border-left: 4px solid #D4A54A;">
          ${details}
        </div>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          Reply directly to <a href="mailto:${encodeURIComponent(lead.email)}">${escapeHtml(lead.email)}</a>${lead.phone ? ` or call ${escapeHtml(lead.phone)}` : ''}.
        </p>
      </div>
    `,
  });
}

async function listLeads(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return res.status(503).json({ success: false, error: 'Admin access not configured' });
  }
  if (req.headers['x-admin-token'] !== secret) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const client = getClient();
    const customers: any[] = [];
    for await (const c of await client.customers.list({
      sortField: 'CREATED_AT',
      sortOrder: 'DESC',
    }) as any) {
      customers.push(c);
    }

    const leads = [];
    const ccaClient = (client as any).customerCustomAttributes;
    for (const c of customers) {
      try {
        const statusAttr = await ccaClient.get({
          customerId: c.id,
          key: 'pp_lead_status',
        });
        if (!statusAttr.customAttribute?.value) continue;

        let leadData: any = {};
        try {
          const dataAttr = await ccaClient.get({
            customerId: c.id,
            key: 'pp_lead_data',
          });
          leadData = JSON.parse(dataAttr.customAttribute?.value as string || '{}');
        } catch {}

        leads.push({
          id: c.id,
          name: `${c.givenName || ''} ${c.familyName || ''}`.trim(),
          email: c.emailAddress || '',
          phone: c.phoneNumber || null,
          event_date: leadData.event_date || null,
          event_type: leadData.event_type || null,
          guests: leadData.guests || null,
          message: leadData.message || c.note || null,
          status: statusAttr.customAttribute.value,
          created_at: c.createdAt || '',
        });
      } catch {}
    }

    res.json(leads);
  } catch (error: any) {
    console.error('List Leads Error:', error);
    res.status(500).json({ error: 'Failed to list leads' });
  }
}
