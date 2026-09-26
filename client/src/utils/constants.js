export const ITEM_STATUSES = {
  REPORTED: { label: 'Reported', color: 'bg-cream-200 text-cocoa-700 border-biscuit-300' },
  ACTIVE: { label: 'Active', color: 'bg-olive-50 text-olive-700 border-olive-300' },
  POTENTIAL_MATCH: { label: 'Potential Match', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  CLAIM_REQUESTED: { label: 'Claim Submitted', color: 'bg-terracotta-50 text-terracotta-700 border-terracotta-300' },
  UNDER_VERIFICATION: { label: 'Under Verification', color: 'bg-biscuit-100 text-cocoa-800 border-biscuit-400' },
  APPROVED: { label: 'Claim Approved', color: 'bg-olive-100 text-olive-800 border-olive-400' },
  HANDOVER_SCHEDULED: { label: 'Handover Scheduled', color: 'bg-amber-100 text-amber-800 border-amber-400' },
  RETURNED: { label: 'Returned to Owner', color: 'bg-olive-200 text-olive-900 border-olive-500' },
  CLOSED: { label: 'Closed', color: 'bg-cocoa-100 text-cocoa-800 border-cocoa-300' },
  REJECTED: { label: 'Rejected', color: 'bg-rust-50 text-rust-700 border-rust-300' },
  EXPIRED: { label: 'Expired', color: 'bg-biscuit-100 text-cocoa-500 border-biscuit-200' },
  DISPUTED: { label: 'Disputed Claims', color: 'bg-rust-100 text-rust-800 border-rust-400 animate-pulse' },
  CANCELLED: { label: 'Cancelled', color: 'bg-cream-300 text-cocoa-600 border-cream-400' }
};

export const CLAIM_STATUSES = {
  PENDING: { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-biscuit-100 text-cocoa-800 border-biscuit-300' },
  MORE_INFORMATION_REQUIRED: { label: 'More Info Needed', color: 'bg-amber-100 text-amber-800 border-amber-400' },
  APPROVED: { label: 'Approved', color: 'bg-olive-100 text-olive-800 border-olive-400' },
  REJECTED: { label: 'Declined', color: 'bg-rust-50 text-rust-700 border-rust-300' },
  DISPUTED: { label: 'Disputed', color: 'bg-rust-100 text-rust-800 border-rust-400' },
  CANCELLED: { label: 'Withdrawn', color: 'bg-cream-200 text-cocoa-600 border-biscuit-300' },
  COMPLETED: { label: 'Completed', color: 'bg-olive-200 text-olive-900 border-olive-500' }
};

export const CONFIDENCE_TIERS = {
  STRONG_MATCH: { label: 'Strong Match (80-100%)', badge: 'bg-olive-600 text-white', text: 'text-olive-700' },
  NEEDS_REVIEW: { label: 'Needs Review (60-79%)', badge: 'bg-amber-500 text-white', text: 'text-amber-700' },
  LOW_CONFIDENCE: { label: 'Low Confidence (<60%)', badge: 'bg-rust-500 text-white', text: 'text-rust-700' }
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

