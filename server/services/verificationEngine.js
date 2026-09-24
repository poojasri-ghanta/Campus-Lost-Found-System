/**
 * Verification Engine for Ownership Claims
 * Calculates verification confidence score and generates dynamic questions.
 */

const stringSimilarity = (str1 = '', str2 = '') => {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const words1 = s1.split(/\s+/).filter(w => w.length > 2);
  const words2 = s2.split(/\s+/).filter(w => w.length > 2);
  if (!words1.length || !words2.length) return 0;

  let common = 0;
  for (const w of words1) {
    if (words2.some(w2 => w2.includes(w) || w.includes(w2))) {
      common++;
    }
  }
  return common / Math.max(words1.length, words2.length);
};

/**
 * Generate default verification questions based on category and present private details
 */
const generateVerificationQuestions = (foundItem) => {
  const questions = [];
  const privateDetails = foundItem.privateDetails || {};

  // Standard category verification
  questions.push({
    id: 'q_brand',
    question: 'What is the exact brand and/or model of the item you lost?',
    fieldKey: 'brand',
    hint: 'State the manufacturer brand name and exact model if known.',
    weight: 15
  });

  if (privateDetails.color || foundItem.publicColor) {
    questions.push({
      id: 'q_color',
      question: 'Describe the primary color and any secondary color accents.',
      fieldKey: 'color',
      hint: 'Include case color, trim, or exterior details.',
      weight: 10
    });
  }

  if (privateDetails.scratches) {
    questions.push({
      id: 'q_scratches',
      question: 'Are there any scratches, dents, or signs of wear? Describe their exact location.',
      fieldKey: 'scratches',
      hint: 'Be specific about side, corner, or screen markings.',
      weight: 20
    });
  }

  if (privateDetails.caseDetails) {
    questions.push({
      id: 'q_case',
      question: 'Describe the protective case, cover, sleeve, or keychain attached.',
      fieldKey: 'caseDetails',
      hint: 'Material, stickers, color, or design on the case/cover.',
      weight: 20
    });
  }

  if (privateDetails.wallpaper) {
    questions.push({
      id: 'q_wallpaper',
      question: 'If applicable, describe the lock-screen or wallpaper background image.',
      fieldKey: 'wallpaper',
      hint: 'Photo theme, wallpaper colors, or text on screen.',
      weight: 15
    });
  }

  if (privateDetails.specificContents) {
    questions.push({
      id: 'q_contents',
      question: 'What specific items, cards, or notes are inside or attached?',
      fieldKey: 'specificContents',
      hint: 'List identifiable contents or pockets.',
      weight: 20
    });
  }

  if (privateDetails.serialNumber || privateDetails.uniqueMarks || privateDetails.additionalSecret) {
    questions.push({
      id: 'q_unique',
      question: 'Describe any unique stickers, engraving, initials, or serial identifiers.',
      fieldKey: 'uniqueMarks',
      hint: 'Any distinctive marks that prove this item belongs to you.',
      weight: 20
    });
  }

  // Fallback if item has minimal private details configured
  if (questions.length < 3) {
    questions.push({
      id: 'q_location_time',
      question: 'At what estimated time and exact room/area did you misplace this item?',
      fieldKey: 'locationTime',
      hint: 'Provide room number, table, or hallway specifics.',
      weight: 15
    });
    questions.push({
      id: 'q_distinctive_feature',
      question: 'Mention any other unique identifying feature or proof of purchase/ownership.',
      fieldKey: 'general',
      hint: 'Any details that can help verify you as the legitimate owner.',
      weight: 15
    });
  }

  return questions;
};

/**
 * Score claimant's verification questionnaire against private item details
 */
const evaluateClaim = (claimAnswers = [], foundItem, claimantLostItem = null) => {
  const privateDetails = foundItem.privateDetails || {};
  let totalScore = 0;
  const answersEvaluated = [];
  
  const scoreBreakdown = {
    categoryScore: 0,
    locationScore: 0,
    dateScore: 0,
    colorScore: 0,
    brandScore: 0,
    uniqueFeaturesScore: 0,
    totalScore: 0
  };

  // Base factor evaluations if linked with a Lost Item
  if (claimantLostItem) {
    // Category match: 25 points
    if (claimantLostItem.category && foundItem.category &&
        claimantLostItem.category.toLowerCase().trim() === foundItem.category.toLowerCase().trim()) {
      scoreBreakdown.categoryScore = 25;
    }

    // Location match: 20 points
    const simLoc = stringSimilarity(claimantLostItem.location, foundItem.location);
    scoreBreakdown.locationScore = Math.round(simLoc * 20);

    // Date match: 15 points
    const diffDays = Math.abs(new Date(foundItem.foundDate) - new Date(claimantLostItem.lostDate)) / (1000 * 60 * 60 * 24);
    if (diffDays <= 2) scoreBreakdown.dateScore = 15;
    else if (diffDays <= 5) scoreBreakdown.dateScore = 10;
    else if (diffDays <= 10) scoreBreakdown.dateScore = 5;

    // Color match: 10 points
    const simColor = stringSimilarity(claimantLostItem.color, foundItem.publicColor);
    scoreBreakdown.colorScore = Math.round(simColor * 10);
  } else {
    // If no lost item linked directly, base factors can be inferred or default credited on answers
    scoreBreakdown.categoryScore = 20;
    scoreBreakdown.locationScore = 15;
    scoreBreakdown.dateScore = 10;
    scoreBreakdown.colorScore = 10;
  }

  let uniquePointsAccumulated = 0;
  let brandPoints = 0;

  for (const ans of claimAnswers) {
    const claimantText = (ans.claimantAnswer || '').trim();
    let matchQuality = 'MANUAL_REVIEW';
    let points = 0;
    const maxScore = ans.maxScore || 20;

    let targetPrivateVal = '';
    if (ans.fieldKey === 'brand') {
      targetPrivateVal = `${privateDetails.brand || ''} ${privateDetails.model || ''}`;
      const sim = stringSimilarity(claimantText, targetPrivateVal);
      if (sim >= 0.8) {
        matchQuality = 'EXACT';
        points = 10;
      } else if (sim >= 0.4) {
        matchQuality = 'PARTIAL';
        points = 6;
      } else {
        matchQuality = claimantText.length > 3 ? 'PARTIAL' : 'NO_MATCH';
        points = claimantText.length > 3 ? 4 : 0;
      }
      brandPoints = Math.max(brandPoints, points);
    } else if (ans.fieldKey && privateDetails[ans.fieldKey]) {
      targetPrivateVal = privateDetails[ans.fieldKey];
      const sim = stringSimilarity(claimantText, targetPrivateVal);
      if (sim >= 0.75) {
        matchQuality = 'EXACT';
        points = maxScore;
      } else if (sim >= 0.35) {
        matchQuality = 'PARTIAL';
        points = Math.round(maxScore * 0.6);
      } else {
        matchQuality = claimantText.length > 4 ? 'MANUAL_REVIEW' : 'NO_MATCH';
        points = claimantText.length > 4 ? Math.round(maxScore * 0.3) : 0;
      }
      uniquePointsAccumulated += points;
    } else {
      // General question: awarded reasonable score if detailed answer given
      if (claimantText.length > 25) {
        matchQuality = 'MANUAL_REVIEW';
        points = Math.round(maxScore * 0.75);
      } else if (claimantText.length > 10) {
        matchQuality = 'MANUAL_REVIEW';
        points = Math.round(maxScore * 0.5);
      } else {
        matchQuality = 'NO_MATCH';
        points = 0;
      }
      uniquePointsAccumulated += points;
    }

    answersEvaluated.push({
      questionId: ans.questionId,
      question: ans.question,
      claimantAnswer: claimantText,
      fieldKey: ans.fieldKey,
      matchedCriteria: targetPrivateVal ? `Compared against private records` : 'User provided response',
      scoreAwarded: points,
      maxScore,
      matchQuality
    });
  }

  scoreBreakdown.brandScore = brandPoints > 0 ? brandPoints : (claimantLostItem?.brand ? 10 : 5);
  scoreBreakdown.uniqueFeaturesScore = Math.min(20, uniquePointsAccumulated);

  totalScore =
    scoreBreakdown.categoryScore +
    scoreBreakdown.locationScore +
    scoreBreakdown.dateScore +
    scoreBreakdown.colorScore +
    scoreBreakdown.brandScore +
    scoreBreakdown.uniqueFeaturesScore;

  totalScore = Math.min(100, Math.max(0, Math.round(totalScore)));
  scoreBreakdown.totalScore = totalScore;

  let confidenceRating = 'LOW_CONFIDENCE';
  if (totalScore >= 80) {
    confidenceRating = 'STRONG_MATCH';
  } else if (totalScore >= 60) {
    confidenceRating = 'NEEDS_REVIEW';
  }

  return {
    verificationScore: totalScore,
    confidenceRating,
    scoreBreakdown,
    answersEvaluated
  };
};

module.exports = {
  generateVerificationQuestions,
  evaluateClaim
};
