import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { qualifyLead } from '@/lib/ai';

export const dynamic = 'force-dynamic';

// GET /api/leads?q=search&stage=Qualified&priority=Hot&sort=-createdAt
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const stage = searchParams.get('stage');
    const priority = searchParams.get('priority');
    const sort = searchParams.get('sort') || '-createdAt';

    const filter = {};
    if (stage && stage !== 'All') filter.stage = stage;
    if (priority && priority !== 'All') filter['ai.priority'] = priority;
    if (q) {
      const rx = new RegExp(q, 'i');
      filter.$or = [{ name: rx }, { company: rx }, { email: rx }, { industry: rx }];
    }

    const leads = await Lead.find(filter).sort(sort).lean();
    return NextResponse.json({ leads });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/leads  -- create a lead, then run AI qualification synchronously
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const required = ['name', 'email', 'company'];
    for (const field of required) {
      if (!body[field] || !String(body[field]).trim()) {
        return NextResponse.json({ error: `"${field}" is required` }, { status: 400 });
      }
    }

    const lead = new Lead({
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      company: body.company,
      role: body.role || '',
      companySize: body.companySize || '11-50',
      industry: body.industry || '',
      currentSolution: body.currentSolution || 'Spreadsheets / manual',
      monthlyBudget: Number(body.monthlyBudget) || 0,
      timeline: body.timeline || 'Just exploring',
      notes: body.notes || '',
      stage: 'New',
    });

    const aiResult = await qualifyLead(lead);
    lead.ai = { ...aiResult, qualifiedAt: new Date() };

    await lead.save();
    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
