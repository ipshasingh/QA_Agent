function calculateCoverage(acceptanceCriteria, tests) {
  const criteriaIds = acceptanceCriteria.map((criterion) => criterion.id);

  const coveredCriteria = new Set();

  const invalidMappings = [];

  tests.forEach((test) => {
    const mappedCriteria = Array.isArray(test.acceptanceCriteriaIds)
      ? test.acceptanceCriteriaIds
      : [];

    mappedCriteria.forEach((criteriaId) => {
      if (criteriaIds.includes(criteriaId)) {
        coveredCriteria.add(criteriaId);
      } else {
        invalidMappings.push({
          testId: test.id,
          acceptanceCriteriaId: criteriaId
        });
      }
    });
  });

  const uncoveredCriteria = criteriaIds.filter(
    (criteriaId) => !coveredCriteria.has(criteriaId)
  );

  const totalCriteria = criteriaIds.length;
  const coveredCount = coveredCriteria.size;

  const percentage =
    totalCriteria === 0
      ? 0
      : Math.round((coveredCount / totalCriteria) * 100);

  return {
    totalCriteria,
    coveredCount,
    uncoveredCount: uncoveredCriteria.length,
    coveragePercentage: percentage,
    coveredCriteria: Array.from(coveredCriteria),
    uncoveredCriteria,
    invalidMappings
  };
}

module.exports = {
  calculateCoverage
};