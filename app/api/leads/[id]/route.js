import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Lead from '@/models/Lead';

export const dynamic = 'force-dynamic';

const EDITABLE_FIELDS = [
  'name',
  'email',
  'phone',
  'company',
  'role',
  'companySize',
  'industry',
  'currentSolution',
  'monthlyBudget',
  'timeline',
  'notes',
  'stage',
];

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const lead = await Lead.findById(params.id).lean();
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    return NextResponse.json({ lead });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/leads/:id -- edit lead fields and/or move pipeline stage
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();

    const update = {};
    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) update[field] = body[field];
    }
    if (update.monthlyBudget !== undefined) update.monthlyBudget = Number(update.monthlyBudget) || 0;

    const lead = await Lead.findByIdAndUpdate(params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    return NextResponse.json({ lead });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    await connectDB();
    const lead = await Lead.findByIdAndDelete(params.id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
