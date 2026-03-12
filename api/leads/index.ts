import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { SquareClient, SquareEnvironment } from 'square';

function getClient() {
  return new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
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

    res.status(201).json({ id: customerId });
  } catch (error: any) {
    console.error('Create Lead Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create lead' });
  }
}

async function listLeads(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.ADMIN_SECRET;
  if (secret && req.headers['x-admin-token'] !== secret) {
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
    res.status(500).json({ error: error.message || 'Failed to list leads' });
  }
}
