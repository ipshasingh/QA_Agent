function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function calculateSimilarity(textA, textB) {
  const wordsA = new Set(normalizeText(textA));
  const wordsB = new Set(normalizeText(textB));

  if (wordsA.size === 0 || wordsB.size === 0) {
    return 0;
  }

  const intersection = [...wordsA].filter((word) =>
    wordsB.has(word)
  );

  const union = new Set([...wordsA, ...wordsB]);

  return intersection.length / union.size;
}

function detectDuplicates(tests) {
  const duplicates = [];

  for (let i = 0; i < tests.length; i++) {
    for (let j = i + 1; j < tests.length; j++) {
      const testA = tests[i];
      const testB = tests[j];

      const titleSimilarity = calculateSimilarity(
        testA.title || "",
        testB.title || ""
      );

      const stepsA = Array.isArray(testA.steps)
        ? testA.steps.join(" ")
        : "";

      const stepsB = Array.isArray(testB.steps)
        ? testB.steps.join(" ")
        : "";

      const stepSimilarity = calculateSimilarity(
        stepsA,
        stepsB
      );

      const overallSimilarity =
        (titleSimilarity + stepSimilarity) / 2;

      if (overallSimilarity >= 0.6) {
        duplicates.push({
          testIds: [
            testA.id,
            testB.id
          ],
          similarity: Math.round(
            overallSimilarity * 100
          ),
          reason:
            "The test cases have highly similar titles and steps."
        });
      }
    }
  }

  return {
    duplicates,
    duplicateCount: duplicates.length
  };
}

module.exports = {
  detectDuplicates
};