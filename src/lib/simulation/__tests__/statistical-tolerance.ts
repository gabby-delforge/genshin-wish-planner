/**
 * Statistical tolerance helper for probability-based tests
 */

interface ToleranceConfig {
  confidenceLevel?: 95 | 99 | 99.9;
  safetyMultiplier?: number;
  minTolerance?: number;
  maxTolerance?: number;
}

interface ToleranceResult {
  tolerance: number;
  lowerBound: number;
  upperBound: number;
  standardError: number;
  margin: number;
}

/**
 * Calculate statistically appropriate tolerance for probability tests
 */
export function calculateStatisticalTolerance(
  expectedProbability: number,
  sampleSize: number,
  config: ToleranceConfig = {}
): ToleranceResult {
  const {
    confidenceLevel = 99,
    safetyMultiplier = 1.5,
    minTolerance = 0.005, // 0.5% minimum
    maxTolerance = 0.02, // 2% maximum
  } = config;

  if (expectedProbability < 0 || expectedProbability > 1) {
    throw new Error("Expected probability must be between 0 and 1");
  }
  if (sampleSize <= 0) {
    throw new Error("Sample size must be positive");
  }

  // Calculate standard error for binomial distribution
  const standardError = Math.sqrt(
    (expectedProbability * (1 - expectedProbability)) / sampleSize
  );

  // Get z-score for confidence level
  const zScores = { 95: 1.96, 99: 2.576, 99.9: 3.291 };
  const zScore = zScores[confidenceLevel];

  // Calculate margin of error with safety buffer
  let tolerance = zScore * standardError * safetyMultiplier;
  tolerance = Math.max(tolerance, minTolerance);
  tolerance = Math.min(tolerance, maxTolerance);

  const lowerBound = Math.max(0, expectedProbability - tolerance);
  const upperBound = Math.min(1, expectedProbability + tolerance);

  return {
    tolerance,
    lowerBound,
    upperBound,
    standardError,
    margin: zScore * standardError,
  };
}

/**
 * Helper function for cleaner test assertions
 */
export function expectSuccessRate(
  testFunction: () => number,
  expectedRate: number,
  sampleSize: number = 50000,
  config?: ToleranceConfig
) {
  const observedRate = testFunction();
  const { lowerBound, upperBound, tolerance } = calculateStatisticalTolerance(
    expectedRate,
    sampleSize,
    config
  );

  // Custom error message for better debugging
  if (observedRate < lowerBound || observedRate > upperBound) {
    const error = `Statistical tolerance exceeded:
    Expected: ${(expectedRate * 100).toFixed(2)}%
    Observed: ${(observedRate * 100).toFixed(2)}%
    Tolerance: ±${(tolerance * 100).toFixed(2)}%
    Valid range: [${(lowerBound * 100).toFixed(2)}%, ${(
      upperBound * 100
    ).toFixed(2)}%]`;
    throw new Error(error);
  }

  return { observedRate, expectedRate, tolerance, lowerBound, upperBound };
}

/**
 * Helper for testing probability differences (like 50/50 splits)
 */
export function expectProbabilityDifference(
  rate1: number,
  rate2: number,
  sampleSize: number = 50000,
  config?: ToleranceConfig
) {
  const actualDifference = Math.abs(rate1 - rate2);

  // For difference testing, we need to calculate tolerance differently
  // The variance of the difference of two proportions is the sum of their variances
  const variance1 = (rate1 * (1 - rate1)) / sampleSize;
  const variance2 = (rate2 * (1 - rate2)) / sampleSize;
  const combinedStandardError = Math.sqrt(variance1 + variance2);

  const {
    confidenceLevel = 99,
    safetyMultiplier = 1.5,
    minTolerance = 0.01, // 1% minimum for differences
    maxTolerance = 0.05, // 5% maximum for differences
  } = config || {};

  const zScores = { 95: 1.96, 99: 2.576, 99.9: 3.291 };
  const zScore = zScores[confidenceLevel];

  let tolerance = zScore * combinedStandardError * safetyMultiplier;
  tolerance = Math.max(tolerance, minTolerance);
  tolerance = Math.min(tolerance, maxTolerance);

  if (actualDifference > tolerance) {
    throw new Error(
      `Probability difference exceeded tolerance: ${(
        actualDifference * 100
      ).toFixed(2)}% > ${(tolerance * 100).toFixed(2)}%`
    );
  }
}
