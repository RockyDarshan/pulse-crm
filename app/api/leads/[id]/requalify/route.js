import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { qualifyLead } from '@/lib/ai';

export const dynamic = 'force-dynamic';

// POST /api/leads/:id/requalify -- re-run AI scoring using the lead's current details
export async function POST(_req, { params }) {
  try {
    await connectDB();
    const lead = await Lead.findById(params.id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const aiResult = await qualifyLead(lead);
    lead.ai = { ...aiResult, qualifiedAt: new Date() };
    await lead.save();

    return NextResponse.json({ lead });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
