const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const notificationService = require('./notificationService');

/**
 * Calculates similarity between two strings based on token overlap
 */
const calculateTextSimilarity = (textA = '', textB = '') => {
  if (!textA || !textB) return 0;
  
  const cleanTokens = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokensA = new Set(cleanTokens(textA));
  const tokensB = new Set(cleanTokens(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection++;
    }
  }

  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? (intersection / union) : 0;
};

/**
 * Evaluates match confidence between a LostItem and a FoundItem
 */
const evaluateItemPair = (lostItem, foundItem) => {
  let totalScore = 0;
  const matchingFactors = [];

  // 1. Category Matching (Weight: 25%)
  const categoryMatch =
    lostItem.category &&
    foundItem.category &&
    lostItem.category.trim().toLowerCase() === foundItem.category.trim().toLowerCase();
  
  const categoryScore = categoryMatch ? 25 : 0;
  totalScore += categoryScore;
  matchingFactors.push({
    factor: 'Category',
    weight: 25,
    score: categoryScore,
    detail: categoryMatch
      ? `Exact category match: "${lostItem.category}"`
      : `Different categories (${lostItem.category} vs ${foundItem.category})`,
    matched: categoryMatch
  });

  // 2. Location Matching (Weight: 20%)
  const locA = (lostItem.location || '').toLowerCase();
  const locB = (foundItem.location || '').toLowerCase();
  let locationScore = 0;
  let locDetail = 'Locations are different';
  let locMatched = false;

  if (locA && locB) {
    if (locA === locB) {
      locationScore = 20;
      locDetail = `Exact location match: "${lostItem.location}"`;
      locMatched = true;
    } else if (locA.includes(locB) || locB.includes(locA)) {
      locationScore = 16;
      locDetail = `Location zone overlap: "${lostItem.location}" & "${foundItem.location}"`;
      locMatched = true;
    } else {
      const sim = calculateTextSimilarity(locA, locB);
      if (sim > 0.3) {
        locationScore = Math.round(sim * 20);
        locDetail = `Nearby area similarity (${lostItem.location} ~ ${foundItem.location})`;
        locMatched = true;
      }
    }
  }
  totalScore += locationScore;
  matchingFactors.push({
    factor: 'Location',
    weight: 20,
    score: locationScore,
    detail: locDetail,
    matched: locMatched
  });

  // 3. Date Proximity (Weight: 20%)
  // Items lost should ideally be lost before or on same day found
  const lostDate = new Date(lostItem.lostDate).getTime();
  const foundDate = new Date(foundItem.foundDate).getTime();
  const diffDays = Math.abs(foundDate - lostDate) / (1000 * 60 * 60 * 24);

  let dateScore = 0;
  let dateDetail = `Found ${Math.round(diffDays)} days apart`;
  let dateMatched = false;

  if (diffDays <= 1) {
    dateScore = 20;
    dateDetail = 'Found on the same or next day';
    dateMatched = true;
  } else if (diffDays <= 3) {
    dateScore = 16;
    dateDetail = `Found within 3 days (${Math.round(diffDays)} days difference)`;
    dateMatched = true;
  } else if (diffDays <= 7) {
    dateScore = 12;
    dateDetail = `Found within 1 week (${Math.round(diffDays)} days difference)`;
    dateMatched = true;
  } else if (diffDays <= 14) {
    dateScore = 6;
    dateDetail = `Found within 2 weeks (${Math.round(diffDays)} days difference)`;
    dateMatched = false;
  }
  totalScore += dateScore;
  matchingFactors.push({
    factor: 'Date Proximity',
    weight: 20,
    score: dateScore,
    detail: dateDetail,
    matched: dateMatched
  });

  // 4. Color Matching (Weight: 10%)
  const colorA = (lostItem.color || '').toLowerCase().trim();
  const colorB = (foundItem.publicColor || '').toLowerCase().trim();
  let colorScore = 0;
  let colorMatched = false;

  if (colorA && colorB) {
    if (colorA === colorB || colorA.includes(colorB) || colorB.includes(colorA)) {
      colorScore = 10;
      colorMatched = true;
    }
  }
  totalScore += colorScore;
  matchingFactors.push({
    factor: 'Color',
    weight: 10,
    score: colorScore,
    detail: colorMatched ? `Color matches: "${lostItem.color}"` : `Colors differ (${lostItem.color} vs ${foundItem.publicColor})`,
    matched: colorMatched
  });

  // 5. Brand Matching (Weight: 10%)
  // Lost brand compared with found item title, description or privateDetails brand (if available)
  const lostBrand = (lostItem.brand || '').toLowerCase().trim();
  let brandScore = 0;
  let brandMatched = false;
  let brandDetail = 'Brand not specified or different';

  if (lostBrand) {
    const foundText = `${foundItem.title} ${foundItem.publicDescription} ${foundItem.privateDetails?.brand || ''}`.toLowerCase();
    if (foundText.includes(lostBrand)) {
      brandScore = 10;
      brandMatched = true;
      brandDetail = `Brand identification found: "${lostItem.brand}"`;
    }
  }
  totalScore += brandScore;
  matchingFactors.push({
    factor: 'Brand',
    weight: 10,
    score: brandScore,
    detail: brandDetail,
    matched: brandMatched
  });

  // 6. Description / Title Text Similarity (Weight: 15%)
  const fullTextA = `${lostItem.title} ${lostItem.description}`;
  const fullTextB = `${foundItem.title} ${foundItem.publicDescription}`;
  const sim = calculateTextSimilarity(fullTextA, fullTextB);
  const textScore = Math.min(15, Math.round(sim * 15 * 1.5)); // boost scaling
  totalScore += textScore;
  matchingFactors.push({
    factor: 'Description & Keyword Overlap',
    weight: 15,
    score: textScore,
    detail: textScore > 8 ? 'Significant keyword & title correlation' : (textScore > 3 ? 'Moderate keyword correlation' : 'Low keyword overlap'),
    matched: textScore >= 6
  });

  const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));
  let confidenceTier = 'LOW';
  if (finalScore >= 75) {
    confidenceTier = 'HIGH';
  } else if (finalScore >= 50) {
    confidenceTier = 'MEDIUM';
  }

  return {
    matchScore: finalScore,
    confidenceTier,
    matchingFactors
  };
};

/**
 * Scan all active found items against a given lost item
 */
const generateMatchesForLostItem = async (lostItemId) => {
  const lostItem = await LostItem.findById(lostItemId);
  if (!lostItem) return [];

  // Query candidate found items that are ACTIVE or REPORTED or POTENTIAL_MATCH
  const foundItems = await FoundItem.find({
    status: { $in: ['ACTIVE', 'REPORTED', 'POTENTIAL_MATCH', 'CLAIM_REQUESTED', 'UNDER_VERIFICATION'] }
  });

  const matchesCreated = [];

  for (const foundItem of foundItems) {
    const evaluation = evaluateItemPair(lostItem, foundItem);
    
    // Only register match if matchScore >= 45
    if (evaluation.matchScore >= 45) {
      const matchRecord = await Match.findOneAndUpdate(
        { lostItemId: lostItem._id, foundItemId: foundItem._id },
        {
          matchScore: evaluation.matchScore,
          confidenceTier: evaluation.confidenceTier,
          matchingFactors: evaluation.matchingFactors,
          status: 'POTENTIAL'
        },
        { upsert: true, new: true }
      );
      matchesCreated.push(matchRecord);

      // Trigger notification if High or Medium Confidence
      if (evaluation.matchScore >= 60) {
        await notificationService.notifyMatchFound(lostItem.reportedBy, lostItem, foundItem, evaluation.matchScore);
      }
    }
  }

  // Update potentialMatchCount on lostItem
  const totalMatches = await Match.countDocuments({ lostItemId: lostItem._id, status: { $ne: 'DISMISSED' } });
  lostItem.potentialMatchCount = totalMatches;
  if (totalMatches > 0 && lostItem.status === 'REPORTED') {
    lostItem.status = 'POTENTIAL_MATCH';
  }
  await lostItem.save();

  return matchesCreated;
};

/**
 * Scan all active lost items against a newly created/updated found item
 */
const generateMatchesForFoundItem = async (foundItemId) => {
  const foundItem = await FoundItem.findById(foundItemId);
  if (!foundItem) return [];

  const lostItems = await LostItem.find({
    status: { $in: ['REPORTED', 'ACTIVE', 'POTENTIAL_MATCH', 'CLAIM_REQUESTED'] }
  });

  const matchesCreated = [];

  for (const lostItem of lostItems) {
    const evaluation = evaluateItemPair(lostItem, foundItem);
    if (evaluation.matchScore >= 45) {
      const matchRecord = await Match.findOneAndUpdate(
        { lostItemId: lostItem._id, foundItemId: foundItem._id },
        {
          matchScore: evaluation.matchScore,
          confidenceTier: evaluation.confidenceTier,
          matchingFactors: evaluation.matchingFactors,
          status: 'POTENTIAL'
        },
        { upsert: true, new: true }
      );
      matchesCreated.push(matchRecord);

      if (evaluation.matchScore >= 60) {
        await notificationService.notifyMatchFound(lostItem.reportedBy, lostItem, foundItem, evaluation.matchScore);
      }

      // Update lost item match counter
      const totalMatches = await Match.countDocuments({ lostItemId: lostItem._id, status: { $ne: 'DISMISSED' } });
      lostItem.potentialMatchCount = totalMatches;
      if (lostItem.status === 'REPORTED') {
        lostItem.status = 'POTENTIAL_MATCH';
      }
      await lostItem.save();
    }
  }

  return matchesCreated;
};

module.exports = {
  evaluateItemPair,
  generateMatchesForLostItem,
  generateMatchesForFoundItem
};
