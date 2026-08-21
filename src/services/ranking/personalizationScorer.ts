import { UserProfile } from '../../types/profile';

export interface PersonalizationScoreResult {
  personalizationScore: number; // 0 - 100
  matchedInterests: string[];
  personalizationReason: string;
}

export function computePersonalizationScore(
  title: string,
  abstract: string,
  keywords: string[] = [],
  profile: UserProfile
): PersonalizationScoreResult {
  const text = `${title} ${abstract} ${keywords.join(' ')}`.toLowerCase();
  const matchedInterests: string[] = [];

  // Combine user profile interests, methods, therapies, pathways
  const allUserTopics = [
    ...profile.researchInterests,
    ...profile.methodsAndTechnologies,
    ...profile.therapeuticAreas,
    ...profile.pathwaysOfFocus,
  ];

  // Check matching topics
  allUserTopics.forEach((topic) => {
    // Clean topic name (remove parentheses / explanations)
    const cleanTopic = topic.split('(')[0].trim().toLowerCase();
    if (cleanTopic.length < 3) return;

    if (text.includes(cleanTopic)) {
      if (!matchedInterests.includes(topic)) {
        matchedInterests.push(topic);
      }
    }
  });

  // Calculate score based on breadth and specificity of matches
  let baseScore = 20;
  if (matchedInterests.length === 0) {
    baseScore = 25;
  } else if (matchedInterests.length === 1) {
    baseScore = 55;
  } else if (matchedInterests.length === 2) {
    baseScore = 72;
  } else if (matchedInterests.length === 3) {
    baseScore = 84;
  } else if (matchedInterests.length >= 4) {
    baseScore = Math.min(100, 88 + (matchedInterests.length - 4) * 3);
  }

  // Bonus if title matches user primary methods / themes (e.g. "spatial transcriptomics", "HRD", "platinum resistance")
  const titleLower = title.toLowerCase();
  const titleMatches = allUserTopics.filter((t) => {
    const clean = t.split('(')[0].trim().toLowerCase();
    return clean.length >= 3 && titleLower.includes(clean);
  });

  if (titleMatches.length > 0) {
    baseScore = Math.min(100, baseScore + 6);
  }

  // Generate clear rationale
  let rationale = '';
  if (matchedInterests.length >= 3) {
    rationale = `Exceptional alignment with researcher profile: matched ${matchedInterests.length} core themes (${matchedInterests.slice(0, 3).join(', ')}).`;
  } else if (matchedInterests.length >= 1) {
    rationale = `Moderate profile alignment: matches ${matchedInterests.join(', ')}.`;
  } else {
    rationale = 'General ovarian oncology context with broad translational relevance.';
  }

  return {
    personalizationScore: Math.round(baseScore),
    matchedInterests,
    personalizationReason: rationale,
  };
}
