import { PaperScores } from '../../types/paper';
import { ScoringWeights } from '../../types/profile';

export interface ScorerInputs {
  relevanceScore: number;
  hgsocScore: number;
  importanceScore: number;
  personalizationScore: number;
  noveltyScore: number;
  relevanceReason: string;
  hgsocReason: string;
  importanceReason: string;
  personalizationReason: string;
  noveltyReason: string;
}

export function computeFinalScore(
  inputs: ScorerInputs,
  weights: ScoringWeights
): PaperScores {
  // Normalize weights just in case they don't sum strictly to 1.0
  const weightSum =
    weights.relevance +
    weights.hgsoc +
    weights.importance +
    weights.personalization +
    weights.novelty;

  const normRel = weightSum > 0 ? weights.relevance / weightSum : 0.25;
  const normHgsoc = weightSum > 0 ? weights.hgsoc / weightSum : 0.20;
  const normImp = weightSum > 0 ? weights.importance / weightSum : 0.25;
  const normPers = weightSum > 0 ? weights.personalization / weightSum : 0.20;
  const normNov = weightSum > 0 ? weights.novelty / weightSum : 0.10;

  const rawFinal =
    inputs.relevanceScore * normRel +
    inputs.hgsocScore * normHgsoc +
    inputs.importanceScore * normImp +
    inputs.personalizationScore * normPers +
    inputs.noveltyScore * normNov;

  const finalScore = Math.round(Math.min(100, Math.max(0, rawFinal)));

  return {
    relevanceScore: Math.round(inputs.relevanceScore),
    hgsocScore: Math.round(inputs.hgsocScore),
    importanceScore: Math.round(inputs.importanceScore),
    personalizationScore: Math.round(inputs.personalizationScore),
    noveltyScore: Math.round(inputs.noveltyScore),
    finalScore,
    scoreBreakdownRationale: {
      relevanceReason: inputs.relevanceReason,
      hgsocReason: inputs.hgsocReason,
      importanceReason: inputs.importanceReason,
      personalizationReason: inputs.personalizationReason,
      noveltyReason: inputs.noveltyReason,
    },
  };
}
