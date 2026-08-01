import mongoose from 'mongoose';

const STAGES = [
  'New',
  'Contacted',
  'Qualified',
  'Demo Scheduled',
  'Proposal Sent',
  'Won',
  'Lost',
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

const CURRENT_SOLUTIONS = [
  'Spreadsheets / manual',
  'Competitor tool',
  'In-house system',
  'None',
  'Other',
];

const TIMELINES = [
  'Immediate (this month)',
  '1-3 months',
  '3-6 months',
  'Just exploring',
];

const LeadSchema = new mongoose.Schema(
  {
    // --- Contact & firmographic details captured at intake ---
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    company: { type: String, required: true, trim: true },
    role: { type: String, trim: true, default: '' },
    companySize: { type: String, enum: COMPANY_SIZES, default: '11-50' },
    industry: { type: String, trim: true, default: '' },
    currentSolution: {
      type: String,
      enum: CURRENT_SOLUTIONS,
      default: 'Spreadsheets / manual',
    },
    monthlyBudget: { type: Number, default: 0 }, // in USD, self-reported / estimated
    timeline: { type: String, enum: TIMELINES, default: 'Just exploring' },
    notes: { type: String, trim: true, default: '' },

    // --- Pipeline management ---
    stage: { type: String, enum: STAGES, default: 'New' },

    // --- AI qualification output ---
    ai: {
      score: { type: Number, min: 0, max: 100, default: null },
      priority: { type: String, enum: ['Hot', 'Warm', 'Cold', null], default: null },
      reasoning: { type: String, default: '' },
      recommendedAction: { type: String, default: '' },
      followUpMessage: { type: String, default: '' },
      qualifiedAt: { type: Date, default: null },
      model: { type: String, default: '' },
      error: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

LeadSchema.index({ name: 'text', company: 'text', email: 'text', industry: 'text' });

export const LEAD_STAGES = STAGES;
export const COMPANY_SIZE_OPTIONS = COMPANY_SIZES;
export const CURRENT_SOLUTION_OPTIONS = CURRENT_SOLUTIONS;
export const TIMELINE_OPTIONS = TIMELINES;

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
