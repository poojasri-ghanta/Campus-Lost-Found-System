const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Claim = require('../models/Claim');
const Match = require('../models/Match');
const Handover = require('../models/Handover');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const matchingEngine = require('../services/matchingEngine');
const verificationEngine = require('../services/verificationEngine');

const seedDataDirect = async () => {
  console.log('[SeedDirect] Purging existing database collections...');
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    LostItem.deleteMany({}),
    FoundItem.deleteMany({}),
    Claim.deleteMany({}),
    Match.deleteMany({}),
    Handover.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  console.log('[SeedDirect] Creating demo campus users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const usersData = [
    {
      name: 'Dr. Marcus Vance',
      email: 'admin@campus.edu',
      passwordHash,
      role: 'ADMIN',
      department: 'Campus Security & Operations',
      studentId: 'FAC-9011',
      phone: '+1 (555) 019-2831',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    {
      name: 'Campus Police Desk',
      email: 'security.desk@campus.edu',
      passwordHash,
      role: 'ADMIN',
      department: 'Department of Public Safety',
      studentId: 'DPS-1002',
      phone: '+1 (555) 019-9999',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    {
      name: 'Alex Rivers',
      email: 'alex.rivers@campus.edu',
      passwordHash,
      role: 'STUDENT',
      department: 'Computer Science & AI',
      studentId: 'STU-2024-8841',
      phone: '+1 (555) 302-8472',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
    },
    {
      name: 'Sam Chen',
      email: 'sam.chen@campus.edu',
      passwordHash,
      role: 'FINDER',
      department: 'Electrical Engineering',
      studentId: 'STU-2023-4109',
      phone: '+1 (555) 918-2304',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
      name: 'Jessica Taylor',
      email: 'jessica.taylor@campus.edu',
      passwordHash,
      role: 'STUDENT',
      department: 'Biomedical Sciences',
      studentId: 'STU-2024-1182',
      phone: '+1 (555) 481-9920',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    },
    {
      name: 'David Miller',
      email: 'david.miller@campus.edu',
      passwordHash,
      role: 'STUDENT',
      department: 'Business & Finance',
      studentId: 'STU-2025-3391',
      phone: '+1 (555) 781-3094',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@campus.edu',
      passwordHash,
      role: 'FINDER',
      department: 'Data Science',
      studentId: 'STU-2023-7729',
      phone: '+1 (555) 674-8812',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
    },
    {
      name: 'Lucas Scott',
      email: 'lucas.scott@campus.edu',
      passwordHash,
      role: 'STUDENT',
      department: 'Kinesiology & Athletics',
      studentId: 'STU-2024-9023',
      phone: '+1 (555) 812-4530',
      profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
    }
  ];

  const users = await User.insertMany(usersData);
  const [adminUser, policeUser, alexUser, samUser, jessicaUser, davidUser, priyaUser, lucasUser] = users;

  console.log('[SeedDirect] Creating campus item categories...');
  const categoriesData = [
    {
      name: 'Electronics & Laptops',
      slug: 'electronics',
      icon: 'Laptop',
      description: 'Smartphones, laptops, tablets, earbuds, chargers, and calculators.',
      verificationFields: [
        { key: 'brand', label: 'Brand & Model', question: 'What is the exact brand and model?', weight: 20 },
        { key: 'scratches', label: 'Physical Scratches / Dents', question: 'Describe any scratches, dents, or marks.', weight: 20 },
        { key: 'caseDetails', label: 'Protective Case / Sleeve', question: 'Describe the case color, material, or stickers.', weight: 20 },
        { key: 'wallpaper', label: 'Wallpaper / Lock Screen', question: 'What image or text is on the lock screen?', weight: 20 },
        { key: 'serialNumber', label: 'Serial / Model Number', question: 'Provide serial number or last 4 digits.', weight: 20 }
      ]
    },
    {
      name: 'Identification & Cards',
      slug: 'id-cards',
      icon: 'CreditCard',
      description: 'Student IDs, driver licenses, bank cards, and transit passes.',
      verificationFields: [
        { key: 'specificContents', label: 'Exact Name on Card', question: 'What is the full name printed on the card?', weight: 30 },
        { key: 'serialNumber', label: 'ID Number / Expiry', question: 'State student ID number or last 4 digits.', weight: 30 },
        { key: 'caseDetails', label: 'Lanyard / Holder', question: 'Describe the cardholder or lanyard color.', weight: 20 }
      ]
    },
    {
      name: 'Wallets & Bags',
      slug: 'wallets-bags',
      icon: 'Briefcase',
      description: 'Backpacks, handbags, purses, gym bags, and leather wallets.',
      verificationFields: [
        { key: 'brand', label: 'Brand / Label', question: 'What brand or manufacturer is the bag/wallet?', weight: 20 },
        { key: 'specificContents', label: 'Key Items Inside', question: 'List 3 specific non-monetary items inside.', weight: 30 },
        { key: 'uniqueMarks', label: 'Keychains / Badges', question: 'Describe any badges, pins, or keychains attached.', weight: 25 }
      ]
    },
    {
      name: 'Keys & Access Cards',
      slug: 'keys-access',
      icon: 'Key',
      description: 'Dorm keys, car key fobs, locker padlocks, and building fobs.',
      verificationFields: [
        { key: 'uniqueMarks', label: 'Keychain Description', question: 'Describe the keychain, lanyard, or fob ring.', weight: 40 },
        { key: 'specificContents', label: 'Number of Keys', question: 'How many keys are on the ring and what types?', weight: 30 }
      ]
    },
    {
      name: 'Books & Study Materials',
      slug: 'books-study',
      icon: 'BookOpen',
      description: 'Textbooks, lab notebooks, binders, calculators, and art supplies.',
      verificationFields: [
        { key: 'specificContents', label: 'Handwritten Notes / Name', question: 'What name or annotations are written inside?', weight: 40 },
        { key: 'uniqueMarks', label: 'Book Cover Condition', question: 'Describe highlight colors, tab markers, or dog-ears.', weight: 30 }
      ]
    },
    {
      name: 'Accessories & Jewelry',
      slug: 'accessories-jewelry',
      icon: 'Watch',
      description: 'Watches, rings, eyeglasses, sunglasses, and water bottles.',
      verificationFields: [
        { key: 'brand', label: 'Brand / Maker', question: 'What is the brand or manufacturer?', weight: 25 },
        { key: 'scratches', label: 'Frame / Band Condition', question: 'Describe any prescription marks or band wear.', weight: 35 }
      ]
    }
  ];

  await Category.insertMany(categoriesData);

  console.log('[SeedDirect] Creating realistic Found Items...');
  const foundItemsData = [
    {
      reportedBy: samUser._id,
      category: 'Electronics & Laptops',
      title: 'Dark Gray 15-inch Laptop found near Study Hall',
      publicDescription: 'A dark gray 15-inch laptop in a black zippered sleeve found on a desk in the Main Library 2nd Floor.',
      publicImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      location: 'Main Library 2nd Floor Quiet Study',
      foundDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      publicColor: 'Dark Gray',
      privateDetails: {
        brand: 'Apple',
        model: 'MacBook Pro M2 14-inch Space Gray',
        scratches: 'Tiny pinhead scratch on bottom right corner near HDMI port',
        caseDetails: 'Tomtoc black fabric sleeve with an Octocat GitHub sticker on the back zipper',
        wallpaper: 'High-res photograph of Mount Fuji at sunrise',
        serialNumber: 'C02G89X0MD6T',
        specificContents: 'USB-C magnetic charging adapter in side pocket',
        uniqueMarks: 'Small fluorescent orange tape around the charger cable'
      },
      status: 'ACTIVE'
    },
    {
      reportedBy: priyaUser._id,
      category: 'Electronics & Laptops',
      title: 'Black Smartphone with protective case',
      publicDescription: 'Found on the seating booth in the Student Center Food Court around noon.',
      publicImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500',
      location: 'Student Union Cafeteria Booth #4',
      foundDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      publicColor: 'Black',
      privateDetails: {
        brand: 'Samsung',
        model: 'Galaxy S23 256GB Phantom Black',
        scratches: 'Hairline scratch across top speaker grill',
        caseDetails: 'Transparent TPU bumper case with blue university sticker and transit card tucked inside',
        wallpaper: 'Night starry sky with a camping tent',
        serialNumber: 'RF8W90K11XP',
        specificContents: 'Student metro pass inserted between phone and case'
      },
      status: 'ACTIVE'
    },
    {
      reportedBy: samUser._id,
      category: 'Wallets & Bags',
      title: 'Brown Leather Bi-fold Wallet',
      publicDescription: 'Found near the Engineering Building 3rd floor water fountain.',
      publicImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
      location: 'Engineering Hall 3rd Floor',
      foundDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      publicColor: 'Brown',
      privateDetails: {
        brand: 'Fossil',
        model: 'Derrick RFID Bifold',
        scratches: 'Slight patina wear on the outer fold crease',
        specificContents: 'Contains a California Driver License ending in 4921, gym locker key #104, and a folded receipt from Campus Bookstore',
        uniqueMarks: 'Initials "D.M." stamped lightly inside card slot'
      },
      status: 'CLAIM_REQUESTED',
      claimCount: 1
    },
    {
      reportedBy: priyaUser._id,
      category: 'Electronics & Laptops',
      title: 'Wireless Noise-Canceling Headphones in Case',
      publicDescription: 'Left behind in the Science Lecture Hall 101 front row desk.',
      publicImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      location: 'Science Lecture Hall 101',
      foundDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      publicColor: 'Silver / Gray',
      privateDetails: {
        brand: 'Sony',
        model: 'WH-1000XM5 Silver',
        scratches: 'Minor smudge on right ear cup touch sensor',
        caseDetails: 'Gray hard zipper case with carabiner clip attached',
        uniqueMarks: 'Personal label tag with phone number 555-481-9920 inside case'
      },
      status: 'DISPUTED',
      isDisputed: true,
      claimCount: 2
    },
    {
      reportedBy: samUser._id,
      category: 'Identification & Cards',
      title: 'Campus Student ID Card with Blue Lanyard',
      publicDescription: 'Found on the outdoor bench near the Science Quad fountain.',
      publicImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500',
      location: 'Science Quad Outdoor Plaza',
      foundDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      publicColor: 'Blue / White',
      privateDetails: {
        brand: 'Campus ID',
        specificContents: 'Student ID for Jessica Taylor, Student # STU-2024-1182, Biomedical Sciences',
        caseDetails: 'Blue lanyard with gold campus crest'
      },
      status: 'APPROVED'
    },
    {
      reportedBy: priyaUser._id,
      category: 'Keys & Access Cards',
      title: 'Set of Dorm & Mailbox Keys with Red Lanyard',
      publicDescription: 'Found in the Campus Recreation Center Gym locker bench.',
      publicImage: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500',
      location: 'Recreation Center Gym Locker Room',
      foundDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      publicColor: 'Silver & Red',
      privateDetails: {
        brand: 'Schlage / Yale',
        uniqueMarks: 'Red woven lanyard with Nike logo, 3 brass keys, 1 plastic RFID fob stamped #B-204'
      },
      status: 'RETURNED'
    }
  ];

  const foundItems = [];
  for (const itemData of foundItemsData) {
    const item = new FoundItem(itemData);
    item.verificationQuestions = verificationEngine.generateVerificationQuestions(item);
    await item.save();
    foundItems.push(item);
  }

  console.log('[SeedDirect] Creating realistic Lost Item reports...');
  const lostItemsData = [
    {
      reportedBy: alexUser._id,
      category: 'Electronics & Laptops',
      title: 'Apple MacBook Pro 14" Space Gray',
      description: 'I accidentally left my space gray MacBook Pro in its black Tomtoc sleeve on the 2nd floor library study desk while rushing to an afternoon lab.',
      color: 'Dark Gray',
      brand: 'Apple',
      model: 'MacBook Pro M2 14-inch',
      location: 'Main Library 2nd Floor',
      lostDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      status: 'POTENTIAL_MATCH',
      tags: ['laptop', 'macbook', 'library', 'tomtoc']
    },
    {
      reportedBy: davidUser._id,
      category: 'Wallets & Bags',
      title: 'Brown Fossil Leather Wallet',
      description: 'Lost my brown Fossil bifold wallet somewhere in the Engineering Hall. Contains my driver license, student gym card, and business receipts.',
      color: 'Brown',
      brand: 'Fossil',
      model: 'Derrick RFID',
      location: 'Engineering Hall 3rd Floor',
      lostDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
      status: 'CLAIM_REQUESTED',
      tags: ['wallet', 'leather', 'engineering', 'fossil']
    },
    {
      reportedBy: jessicaUser._id,
      category: 'Electronics & Laptops',
      title: 'Sony Silver Noise Cancelling Headphones XM5',
      description: 'Lost my silver Sony headphones inside their zipper case after Biology lecture in Science Hall 101.',
      color: 'Silver',
      brand: 'Sony',
      model: 'WH-1000XM5',
      location: 'Science Lecture Hall 101',
      lostDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      status: 'DISPUTED',
      tags: ['headphones', 'sony', 'science hall', 'audio']
    },
    {
      reportedBy: lucasUser._id,
      category: 'Keys & Access Cards',
      title: 'Gym Locker & Dorm Keys on Nike Lanyard',
      description: 'Dropped my keys in the locker room near bench 14. Has a red Nike lanyard and dorm fob.',
      color: 'Red',
      brand: 'Campus Key',
      location: 'Recreation Center Gym Locker Room',
      lostDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500',
      status: 'RETURNED'
    }
  ];

  const lostItems = await LostItem.insertMany(lostItemsData);

  console.log('[SeedDirect] Calculating match engine correlations...');
  for (const lost of lostItems) {
    await matchingEngine.generateMatchesForLostItem(lost._id);
  }

  // Claims
  const davidClaim = await Claim.create({
    foundItemId: foundItems[2]._id,
    claimantId: davidUser._id,
    lostItemId: lostItems[1]._id,
    answers: [
      {
        questionId: 'q_brand',
        question: 'What is the exact brand and model of the wallet?',
        claimantAnswer: 'Fossil Derrick RFID bi-fold wallet in dark brown leather',
        fieldKey: 'brand',
        matchedCriteria: 'Matches Fossil brand record',
        scoreAwarded: 10,
        maxScore: 10,
        matchQuality: 'EXACT'
      },
      {
        questionId: 'q_contents',
        question: 'What specific items or cards are inside?',
        claimantAnswer: 'My California Driver License ending in 4921, gym locker key #104, and campus bookstore receipt',
        fieldKey: 'specificContents',
        matchedCriteria: 'Exact match with driver license # and gym key #',
        scoreAwarded: 20,
        maxScore: 20,
        matchQuality: 'EXACT'
      },
      {
        questionId: 'q_unique',
        question: 'Describe any unique marks or engraving inside.',
        claimantAnswer: 'Initials "D.M." stamped inside the right card slot',
        fieldKey: 'uniqueMarks',
        matchedCriteria: 'Matches initials D.M.',
        scoreAwarded: 20,
        maxScore: 20,
        matchQuality: 'EXACT'
      }
    ],
    additionalEvidence: 'Can present student ID and unlock the matching gym locker to verify.',
    verificationScore: 95,
    confidenceRating: 'STRONG_MATCH',
    scoreBreakdown: {
      categoryScore: 25,
      locationScore: 20,
      dateScore: 15,
      colorScore: 10,
      brandScore: 10,
      uniqueFeaturesScore: 15,
      totalScore: 95
    },
    status: 'PENDING',
    timeline: [{ status: 'PENDING', actor: davidUser._id, note: 'Ownership claim submitted with high-confidence answers.' }]
  });

  const jessicaClaim = await Claim.create({
    foundItemId: foundItems[3]._id,
    claimantId: jessicaUser._id,
    lostItemId: lostItems[2]._id,
    answers: [
      {
        questionId: 'q_brand',
        question: 'What is the exact brand and model?',
        claimantAnswer: 'Sony WH-1000XM5 in Silver color with hard travel case',
        fieldKey: 'brand',
        scoreAwarded: 10,
        maxScore: 10,
        matchQuality: 'EXACT'
      },
      {
        questionId: 'q_unique',
        question: 'Describe any unique stickers or tags.',
        claimantAnswer: 'I placed a label tag inside the case with my phone number (555-481-9920)',
        fieldKey: 'uniqueMarks',
        scoreAwarded: 20,
        maxScore: 20,
        matchQuality: 'EXACT'
      }
    ],
    verificationScore: 92,
    confidenceRating: 'STRONG_MATCH',
    scoreBreakdown: { categoryScore: 25, locationScore: 20, dateScore: 15, colorScore: 10, brandScore: 10, uniqueFeaturesScore: 12, totalScore: 92 },
    status: 'DISPUTED',
    timeline: [{ status: 'DISPUTED', actor: adminUser._id, note: 'Flagged for multiple claimants review' }]
  });

  const lucasClaim = await Claim.create({
    foundItemId: foundItems[3]._id,
    claimantId: lucasUser._id,
    answers: [
      {
        questionId: 'q_brand',
        question: 'What is the exact brand and model?',
        claimantAnswer: 'Sony silver wireless headphones',
        fieldKey: 'brand',
        scoreAwarded: 6,
        maxScore: 10,
        matchQuality: 'PARTIAL'
      }
    ],
    verificationScore: 54,
    confidenceRating: 'LOW_CONFIDENCE',
    scoreBreakdown: { categoryScore: 20, locationScore: 10, dateScore: 10, colorScore: 10, brandScore: 4, uniqueFeaturesScore: 0, totalScore: 54 },
    status: 'DISPUTED',
    timeline: [{ status: 'DISPUTED', actor: adminUser._id, note: 'Conflicting claim' }]
  });

  const idClaim = await Claim.create({
    foundItemId: foundItems[4]._id,
    claimantId: jessicaUser._id,
    answers: [
      {
        questionId: 'q_contents',
        question: 'State your student ID and name.',
        claimantAnswer: 'Jessica Taylor, STU-2024-1182, Biomedical Sciences',
        scoreAwarded: 20,
        maxScore: 20,
        matchQuality: 'EXACT'
      }
    ],
    verificationScore: 98,
    confidenceRating: 'STRONG_MATCH',
    status: 'APPROVED',
    reviewerId: samUser._id,
    reviewerComments: 'Name and student number on the ID card verified.'
  });

  const scheduledHandover = await Handover.create({
    handoverReference: 'LF-2026-48291',
    claimId: idClaim._id,
    foundItemId: foundItems[4]._id,
    finderId: samUser._id,
    ownerId: jessicaUser._id,
    location: 'Main Campus Library Front Circulation Desk',
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    scheduledTime: '2:30 PM',
    verificationCode: '739214',
    status: 'SCHEDULED',
    finderConfirmed: false,
    ownerConfirmed: false,
    notes: 'Meet at the staff desk on the 1st floor. Bring second photo ID.'
  });

  const notificationsData = [
    {
      userId: alexUser._id,
      title: 'High Confidence Match Detected (90% Match)',
      message: 'A Dark Gray 15-inch laptop matching your lost MacBook was found near Main Library 2nd Floor.',
      type: 'MATCH_FOUND',
      relatedId: foundItems[0]._id,
      isRead: false
    },
    {
      userId: samUser._id,
      title: 'New Ownership Claim Submitted',
      message: 'David Miller submitted an ownership claim with 95% verification confidence for Brown Leather Wallet.',
      type: 'CLAIM_SUBMITTED',
      relatedId: foundItems[2]._id,
      isRead: false
    },
    {
      userId: jessicaUser._id,
      title: 'Handover Scheduled – Ref #LF-2026-48291',
      message: 'Your item return has been scheduled for tomorrow at 2:30 PM (Main Campus Library Front Desk). Your verification PIN is 739214.',
      type: 'HANDOVER_SCHEDULED',
      relatedId: scheduledHandover._id,
      isRead: false
    },
    {
      userId: adminUser._id,
      title: 'Dispute Alert: Multiple Claims on Sony Headphones',
      message: 'Item #Science-Hall-XM5 has received 2 conflicting claims. Dispute review required.',
      type: 'DISPUTE_RAISED',
      relatedId: foundItems[3]._id,
      isRead: false
    }
  ];

  await Notification.insertMany(notificationsData);

  const auditLogsData = [
    {
      userId: alexUser._id,
      userEmail: alexUser.email,
      action: 'LOST_ITEM_REPORTED',
      entityType: 'LOST_ITEM',
      entityId: lostItems[0]._id.toString(),
      metadata: { title: lostItems[0].title }
    },
    {
      userId: samUser._id,
      userEmail: samUser.email,
      action: 'FOUND_ITEM_REPORTED',
      entityType: 'FOUND_ITEM',
      entityId: foundItems[0]._id.toString(),
      metadata: { title: foundItems[0].title }
    },
    {
      userId: davidUser._id,
      userEmail: davidUser.email,
      action: 'CLAIM_SUBMITTED',
      entityType: 'CLAIM',
      entityId: davidClaim._id.toString(),
      metadata: { verificationScore: 95 }
    },
    {
      userId: adminUser._id,
      userEmail: adminUser.email,
      action: 'ADMIN_DISPUTE_REVIEW_INITIATED',
      entityType: 'FOUND_ITEM',
      entityId: foundItems[3]._id.toString(),
      metadata: { competingClaimsCount: 2 }
    }
  ];

  await AuditLog.insertMany(auditLogsData);
  console.log('[SeedDirect] Database successfully populated with realistic campus records.');
};

module.exports = { seedDataDirect };
