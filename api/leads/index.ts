import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { squareClient } from '../_lib/square';
import { requireAdmin } from '../_lib/admin';
import { cors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;

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

    const [givenName, ...rest] = name.trim().split(' ');
    const familyName = rest.join(' ');

    // Create customer in Square
    const result = await squareClient.customers.create({
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

    // Set lead custom attributes
    const guestCount = guests ? Math.min(Math.max(0, Math.round(Number(guests))), 10000) : null;
    const leadData = JSON.stringify({
      event_date: event_date || null,
      event_type: event_type || null,
      guests: guestCount,
      message: message?.trim()?.slice(0, 500) || null,
    });

    await Promise.all([
      squareClient.customerCustomAttributes.upsert({
        customerId,
        key: 'pp_lead_status',
        customAttribute: { value: 'new' },
      }),
      squareClient.customerCustomAttributes.upsert({
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
  if (!requireAdmin(req, res)) return;

  try {
    // List all customers, filter for those with pp_lead_status
    const customers: any[] = [];
    for await (const c of await squareClient.customers.list({
      sortField: 'CREATED_AT',
      sortOrder: 'DESC',
    })) {
      customers.push(c);
    }

    // Fetch lead custom attributes for each customer
    const leads = [];
    for (const c of customers) {
      try {
        const statusAttr = await squareClient.customerCustomAttributes.get({
          customerId: c.id,
          key: 'pp_lead_status',
        });
        if (!statusAttr.customAttribute?.value) continue;

        let leadData: any = {};
        try {
          const dataAttr = await squareClient.customerCustomAttributes.get({
            customerId: c.id,
            key: 'pp_lead_data',
          });
          leadData = JSON.parse(dataAttr.customAttribute?.value as string || '{}');
        } catch { /* no lead data */ }

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
      } catch {
        // Not a lead — skip
      }
    }

    res.json(leads);
  } catch (error: any) {
    console.error('List Leads Error:', error);
    res.status(500).json({ error: error.message || 'Failed to list leads' });
  }
}
