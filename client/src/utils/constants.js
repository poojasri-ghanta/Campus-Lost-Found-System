export const ITEM_STATUSES = {
  REPORTED: { label: 'Reported', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  ACTIVE: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  POTENTIAL_MATCH: { label: 'Potential Match', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  CLAIM_REQUESTED: { label: 'Claim Submitted', color: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
  UNDER_VERIFICATION: { label: 'Under Verification', color: 'bg-purple-50 text-purple-700 border-purple-300' },
  APPROVED: { label: 'Claim Approved', color: 'bg-teal-50 text-teal-700 border-teal-300' },
  HANDOVER_SCHEDULED: { label: 'Handover Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  RETURNED: { label: 'Returned to Owner', color: 'bg-emerald-100 text-emerald-800 border-emerald-400' },
  CLOSED: { label: 'Closed', color: 'bg-slate-200 text-slate-800 border-slate-400' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-300' },
  EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-500 border-gray-300' },
  DISPUTED: { label: 'Disputed Claims', color: 'bg-red-50 text-red-700 border-red-300 animate-pulse' },
  CANCELLED: { label: 'Cancelled', color: 'bg-zinc-100 text-zinc-600 border-zinc-300' }
};

export const CLAIM_STATUSES = {
  PENDING: { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  MORE_INFORMATION_REQUIRED: { label: 'More Info Needed', color: 'bg-purple-50 text-purple-700 border-purple-300' },
  APPROVED: { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  REJECTED: { label: 'Declined', color: 'bg-rose-50 text-rose-700 border-rose-300' },
  DISPUTED: { label: 'Disputed', color: 'bg-red-100 text-red-800 border-red-300' },
  CANCELLED: { label: 'Withdrawn', color: 'bg-slate-100 text-slate-600 border-slate-300' },
  COMPLETED: { label: 'Completed', color: 'bg-teal-50 text-teal-800 border-teal-300' }
};

export const CONFIDENCE_TIERS = {
  STRONG_MATCH: { label: 'Strong Match (80-100%)', badge: 'bg-emerald-500 text-white', text: 'text-emerald-700' },
  NEEDS_REVIEW: { label: 'Needs Review (60-79%)', badge: 'bg-amber-500 text-white', text: 'text-amber-700' },
  LOW_CONFIDENCE: { label: 'Low Confidence (<60%)', badge: 'bg-rose-500 text-white', text: 'text-rose-700' }
};

export const CAMPUS_LOCATIONS = [
  'Main Library 1st Floor',
  'Main Library 2nd Floor Quiet Study',
  'Engineering Hall 1st Floor Lobby',
  'Engineering Hall 3rd Floor Lab',
  'Student Union Cafeteria Booths',
  'Science Lecture Hall 101',
  'Science Quad Outdoor Plaza',
  'Recreation Center Gym Locker Room',
  'Campus Bookstore Cafe',
  'Dining Commons Central',
  'Computer Science Complex Wing B',
  'Graduate Research Pavilion',
  'Other / Unspecified Location'
];

export const ITEM_CATEGORIES = [
  'Electronics & Laptops',
  'Identification & Cards',
  'Wallets & Bags',
  'Keys & Access Cards',
  'Books & Study Materials',
  'Accessories & Jewelry',
  'Clothing & Apparel',
  'Sports Equipment',
  'Other'
];
